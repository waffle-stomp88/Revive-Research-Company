import { useMemo, useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { GalaxyNode } from "@/lib/galaxy-layout";
import type { GalaxyVfxConfig } from "./galaxy-vfx-config";

interface GalaxyNebulaProps {
  nodes: GalaxyNode[];
  config: GalaxyVfxConfig["nebula"];
  fog: GalaxyVfxConfig["fog"];
}

const NEBULA_VS = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aPhase;
  attribute vec3 aDrift;
  uniform float uTime;
  uniform float uPxScale;
  uniform float uDriftSpeed;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform float uFogEnabled;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec3 displaced = position + aDrift * sin(uTime * uDriftSpeed + aPhase * 6.2831);
    vec4 mv = modelViewMatrix * vec4(displaced, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPxScale / max(0.1, -mv.z);

    float depth = length(mv.xyz);
    float fog = uFogEnabled > 0.5
      ? clamp((uFogFar - depth) / max(0.001, uFogFar - uFogNear), 0.0, 1.0)
      : 1.0;

    // Subtle pulse so clouds breathe
    float pulse = 0.85 + 0.15 * sin(uTime * 0.6 + aPhase * 6.2831);

    vColor = aColor;
    vAlpha = fog * pulse;
  }
`;

const NEBULA_FS = /* glsl */ `
  precision mediump float;
  uniform float uAlpha;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    if (d > 0.5) discard;
    // Very soft falloff for cloudy gas feel
    float core = smoothstep(0.5, 0.0, d);
    float soft = pow(core, 3.0);
    gl_FragColor = vec4(vColor * soft, soft * vAlpha * uAlpha);
  }
`;

function hashStr(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

export function GalaxyNebula({ nodes, config, fog }: GalaxyNebulaProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { size: viewportSize, camera } = useThree();

  const data = useMemo(() => {
    if (!config.enabled || config.puffCount <= 0 || nodes.length === 0) {
      return null;
    }

    // Group nodes by system to derive a representative color and centroid
    const groups = new Map<
      string,
      { color: THREE.Color; cx: number; cy: number; cz: number; n: number }
    >();
    const tmp = new THREE.Color();
    for (const node of nodes) {
      const g = groups.get(node.systemId);
      if (g) {
        g.cx += node.position[0];
        g.cy += node.position[1];
        g.cz += node.position[2];
        g.n += 1;
      } else {
        tmp.set(node.color);
        groups.set(node.systemId, {
          color: tmp.clone(),
          cx: node.position[0],
          cy: node.position[1],
          cz: node.position[2],
          n: 1,
        });
      }
    }

    const systems = Array.from(groups.entries()).map(([id, g]) => ({
      id,
      color: g.color,
      center: [g.cx / g.n, g.cy / g.n, g.cz / g.n] as [number, number, number],
    }));

    if (systems.length === 0) return null;

    const count = config.puffCount;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const drifts = new Float32Array(count * 3);

    let seed = 0xa11ce ^ count;
    const rand = () => {
      seed = (seed + 0x6d2b79f5) >>> 0;
      let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };

    for (let i = 0; i < count; i++) {
      const sys = systems[i % systems.length];
      const [cx, cy, cz] = sys.center;
      // Offset within the cluster region — keep puffs close to their cluster
      const u = rand();
      const v = rand();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = 2 + rand() * 4;

      positions[i * 3] = cx + r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = cy + r * Math.sin(phi) * Math.sin(theta) * 0.7;
      positions[i * 3 + 2] = cz + r * Math.cos(phi);

      sizes[i] = config.puffSize * (0.65 + rand() * 0.7);

      colors[i * 3] = sys.color.r;
      colors[i * 3 + 1] = sys.color.g;
      colors[i * 3 + 2] = sys.color.b;

      phases[i] = rand();

      drifts[i * 3] = (rand() - 0.5) * 1.6;
      drifts[i * 3 + 1] = (rand() - 0.5) * 1.0;
      drifts[i * 3 + 2] = (rand() - 0.5) * 1.6;
    }

    return { count, positions, sizes, colors, phases, drifts };
  }, [nodes, config.enabled, config.puffCount, config.puffSize]);

  useEffect(() => {
    if (!matRef.current) return;
    const persp = camera as THREE.PerspectiveCamera;
    const fovDeg = persp.isPerspectiveCamera ? persp.fov : 55;
    const tanHalf = Math.tan((fovDeg * Math.PI) / 360);
    const px = viewportSize.height / Math.max(0.001, tanHalf);
    matRef.current.uniforms.uPxScale.value = px;
  }, [viewportSize.height, camera]);

  useEffect(() => {
    if (!matRef.current) return;
    matRef.current.uniforms.uAlpha.value = config.alpha;
    matRef.current.uniforms.uDriftSpeed.value = config.driftSpeed;
    matRef.current.uniforms.uFogEnabled.value = fog.enabled ? 1 : 0;
    matRef.current.uniforms.uFogNear.value = fog.near;
    matRef.current.uniforms.uFogFar.value = fog.far;
  }, [config.alpha, config.driftSpeed, fog.enabled, fog.near, fog.far]);

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  if (!data) return null;

  return (
    <points frustumCulled={false} renderOrder={-1}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={data.positions}
          count={data.count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSize"
          array={data.sizes}
          count={data.count}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aColor"
          array={data.colors}
          count={data.count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aPhase"
          array={data.phases}
          count={data.count}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aDrift"
          array={data.drifts}
          count={data.count}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={NEBULA_VS}
        fragmentShader={NEBULA_FS}
        transparent
        depthWrite={false}
        depthTest
        blending={THREE.AdditiveBlending}
        toneMapped={false}
        uniforms={{
          uTime: { value: 0 },
          uPxScale: { value: 1000 },
          uAlpha: { value: config.alpha },
          uDriftSpeed: { value: config.driftSpeed },
          uFogEnabled: { value: fog.enabled ? 1 : 0 },
          uFogNear: { value: fog.near },
          uFogFar: { value: fog.far },
        }}
      />
    </points>
  );
}
