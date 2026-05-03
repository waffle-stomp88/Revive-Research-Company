import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BODY_SYSTEMS } from "@/data/body-systems";
import type { GalaxyNode } from "@/lib/galaxy-layout";
import type { GalaxyVfxConfig } from "./galaxy-vfx-config";

interface GalaxyNebulaProps {
  // nodes is accepted for API compatibility but is intentionally NOT used —
  // backdrop nebulae must remain decoupled from per-star positions so the
  // cluster-cloud bug cannot return.
  nodes: GalaxyNode[];
  config: GalaxyVfxConfig["nebula"];
  fog: GalaxyVfxConfig["fog"];
}

const NEBULA_VS = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const NEBULA_FS = /* glsl */ `
  precision highp float;
  uniform vec3 uColor;
  uniform float uAlpha;
  uniform float uSoftness;
  uniform float uTime;
  uniform float uPhase;
  varying vec2 vUv;
  // Cheap hash for per-pixel dither — breaks the 8-bit framebuffer
  // banding that appears when slow gradients accumulate additively.
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }
  void main() {
    vec2 p = vUv - vec2(0.5);
    float d = length(p);
    // Hard circular cutoff so the square plane geometry can never become
    // visible, regardless of framebuffer precision.
    if (d > 0.5) discard;
    // Anchor the Gaussian to truly zero at the plane edge by subtracting
    // its boundary value and rescaling. Without this, the corner of the
    // plane still carries 0.15-0.37 of the Gaussian, which is exactly
    // what made plane geometry visible when half-float was tested.
    float gauss = exp(-d * d * uSoftness);
    float edgeVal = exp(-0.25 * uSoftness);
    float g = max(0.0, (gauss - edgeVal) / max(1e-4, 1.0 - edgeVal));
    // Soft radial fade over the outer ~16% kills the outermost ring,
    // which is the most visible band against the black backdrop.
    g *= smoothstep(0.5, 0.42, d);
    // Subtle breathing so the clouds feel alive
    float pulse = 0.88 + 0.12 * sin(uTime * 0.25 + uPhase);
    // Per-pixel +-0.5/255 alpha dither breaks the visible 8-bit
    // quantization bands when several nebula planes accumulate.
    float n = (hash(gl_FragCoord.xy + vec2(uPhase, uPhase * 1.7)) - 0.5) / 255.0;
    float a = g * uAlpha * pulse + n;
    if (a < 0.0008) discard;
    gl_FragColor = vec4(uColor * g, a);
  }
`;

interface NebulaPlane {
  // Lateral offset in camera-aligned screen space (right/up).
  offsetX: number;
  offsetY: number;
  // How far in front of the camera (along its forward vector) the plane sits.
  // This is much larger than the cluster radius so the nebula always reads as
  // a distant cosmic structure regardless of orbit angle.
  depth: number;
  size: number;
  color: string;
  softness: number;
  phase: number;
  driftAxis: [number, number];
  driftAmp: number;
}

function buildPlanes(count: number, baseSize: number): NebulaPlane[] {
  let seed = 0xb1a2e ^ count;
  const rand = () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };

  const palette = BODY_SYSTEMS.map((s) => s.color);
  const planes: NebulaPlane[] = [];
  const n = Math.max(1, Math.min(count, palette.length));
  for (let i = 0; i < n; i++) {
    // Spread laterally in camera screen-space so the planes are visible as a
    // wide arc behind the cluster, not stacked on one another.
    const angle = (i / n) * Math.PI * 2 + rand() * 0.5;
    const radius = 22 + rand() * 14;
    planes.push({
      offsetX: Math.cos(angle) * radius,
      offsetY: Math.sin(angle) * radius * 0.6,
      depth: 90 + rand() * 22,
      size: baseSize * (0.95 + rand() * 0.55),
      color: palette[i % palette.length],
      softness: 4 + rand() * 3.5,
      phase: rand() * Math.PI * 2,
      driftAxis: [(rand() - 0.5) * 2, (rand() - 0.5) * 1.4],
      driftAmp: 0.7 + rand() * 0.6,
    });
  }
  return planes;
}

export function GalaxyNebula({ config }: GalaxyNebulaProps) {
  const groupRef = useRef<THREE.Group>(null);
  const matRefs = useRef<(THREE.ShaderMaterial | null)[]>([]);

  const planes = useMemo(() => {
    if (!config.enabled || config.puffCount <= 0) return [];
    return buildPlanes(config.puffCount, config.puffSize);
  }, [config.enabled, config.puffCount, config.puffSize]);

  // Reused vectors so we don't allocate every frame
  const fwd = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);
  const upVec = useMemo(() => new THREE.Vector3(), []);
  const tmpPos = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const camera = state.camera;
    if (groupRef.current) {
      // Build camera-aligned basis once per frame
      camera.getWorldDirection(fwd);
      right.crossVectors(fwd, camera.up).normalize();
      upVec.crossVectors(right, fwd).normalize();

      const children = groupRef.current.children;
      for (let i = 0; i < children.length; i++) {
        const plane = planes[i];
        if (!plane) continue;
        const child = children[i];

        const dx =
          Math.sin(t * config.driftSpeed + plane.phase) *
          plane.driftAmp *
          plane.driftAxis[0];
        const dy =
          Math.cos(t * config.driftSpeed + plane.phase) *
          plane.driftAmp *
          plane.driftAxis[1];

        // Position = camera + forward * depth + right * offsetX + up * offsetY
        tmpPos
          .copy(camera.position)
          .addScaledVector(fwd, plane.depth)
          .addScaledVector(right, plane.offsetX + dx)
          .addScaledVector(upVec, plane.offsetY + dy);

        child.position.copy(tmpPos);
        // Billboard so each plane faces the camera squarely.
        child.lookAt(camera.position);
      }
    }
    for (const m of matRefs.current) {
      if (m) m.uniforms.uTime.value = t;
    }
  });

  if (planes.length === 0) return null;

  return (
    <group ref={groupRef} renderOrder={-10}>
      {planes.map((plane, i) => (
        <mesh key={i} renderOrder={-10} frustumCulled={false}>
          <planeGeometry args={[plane.size, plane.size]} />
          <shaderMaterial
            ref={(r) => {
              matRefs.current[i] = r;
            }}
            vertexShader={NEBULA_VS}
            fragmentShader={NEBULA_FS}
            transparent
            depthWrite={false}
            depthTest={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            uniforms={{
              uTime: { value: 0 },
              uColor: { value: new THREE.Color(plane.color) },
              uAlpha: { value: config.alpha },
              uSoftness: { value: plane.softness },
              uPhase: { value: plane.phase },
            }}
          />
        </mesh>
      ))}
    </group>
  );
}
