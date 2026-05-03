import { useMemo, useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { GalaxyVfxConfig, GalaxyVfxVariant } from "./galaxy-vfx-config";

interface StarfieldProps {
  count?: number;
  radius?: number;
  twinkle: GalaxyVfxConfig["twinkle"];
  fog: GalaxyVfxConfig["fog"];
  vfxVariant: GalaxyVfxVariant;
}

const STAR_VS = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPxScale;
  uniform float uTwinkleAmount;
  uniform float uTwinkleSpeed;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform float uFogEnabled;
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPxScale / max(0.1, -mv.z);

    float tw = sin(uTime * uTwinkleSpeed * aSpeed + aPhase * 6.2831);
    float twinkle = 1.0 - uTwinkleAmount * 0.5 * (1.0 - tw);

    float depth = length(mv.xyz);
    float fog = uFogEnabled > 0.5
      ? clamp((uFogFar - depth) / max(0.001, uFogFar - uFogNear), 0.0, 1.0)
      : 1.0;

    vAlpha = clamp(twinkle, 0.0, 1.0) * fog;
    vColor = aColor;
  }
`;

const STAR_FS = /* glsl */ `
  precision mediump float;
  uniform float uOpacity;
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.0, d);
    float soft = pow(core, 1.6);
    gl_FragColor = vec4(vColor, soft * vAlpha * uOpacity);
  }
`;

// Subtle stellar color palette used only by the cinematic variant so the
// backdrop reads as real starlight rather than uniform white dots.
const CINEMATIC_PALETTE: [number, number, number][] = [
  [1.0, 1.0, 1.0],
  [1.0, 1.0, 1.0],
  [1.0, 1.0, 1.0],
  [0.96, 0.98, 1.0],
  [0.78, 0.86, 1.0],
  [0.7, 0.82, 1.0],
  [1.0, 0.92, 0.78],
  [1.0, 0.85, 0.65],
];

export function GalaxyStarfield({
  count,
  radius,
  twinkle,
  fog,
  vfxVariant,
}: StarfieldProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { size: viewportSize, camera } = useThree();

  // Variant-specific defaults. Minimal preserves prior behavior exactly:
  // 800 stars, radius 70, uniform white, opacity 0.55. Cinematic gets the
  // denser, brighter, color-varied backdrop.
  const isCinematic = vfxVariant === "cinematic";
  const resolvedCount = count ?? (isCinematic ? 1700 : 800);
  const resolvedRadius = radius ?? (isCinematic ? 80 : 70);
  const resolvedOpacity = isCinematic ? 0.85 : 0.55;

  const { positions, sizes, phases, speeds, colors } = useMemo(() => {
    const pos = new Float32Array(resolvedCount * 3);
    const siz = new Float32Array(resolvedCount);
    const pha = new Float32Array(resolvedCount);
    const spd = new Float32Array(resolvedCount);
    const col = new Float32Array(resolvedCount * 3);
    let seed = 0x9e3779b9;
    const rand = () => {
      seed = (seed + 0x6d2b79f5) >>> 0;
      let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
    for (let i = 0; i < resolvedCount; i++) {
      const u = rand();
      const v = rand();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = resolvedRadius * (0.7 + 0.3 * rand());
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      if (isCinematic) {
        const bright = rand();
        siz[i] = 0.07 + (bright > 0.92 ? 0.32 : bright > 0.7 ? 0.18 : 0.1) * rand() + 0.05;
        const palette = CINEMATIC_PALETTE[Math.floor(rand() * CINEMATIC_PALETTE.length)];
        col[i * 3] = palette[0];
        col[i * 3 + 1] = palette[1];
        col[i * 3 + 2] = palette[2];
      } else {
        siz[i] = 0.06 + rand() * 0.14;
        col[i * 3] = 1.0;
        col[i * 3 + 1] = 1.0;
        col[i * 3 + 2] = 1.0;
      }
      pha[i] = rand();
      spd[i] = 0.6 + rand() * 1.4;
    }
    return { positions: pos, sizes: siz, phases: pha, speeds: spd, colors: col };
  }, [resolvedCount, resolvedRadius, isCinematic]);

  useEffect(() => {
    if (!matRef.current) return;
    const persp = camera as THREE.PerspectiveCamera;
    const fov = persp.isPerspectiveCamera ? persp.fov : 55;
    const tanHalf = Math.tan((fov * Math.PI) / 360);
    const px = viewportSize.height / Math.max(0.001, tanHalf);
    matRef.current.uniforms.uPxScale.value = px;
  }, [viewportSize.height, camera]);

  useEffect(() => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTwinkleAmount.value = twinkle.enabled
      ? twinkle.amount
      : 0;
    matRef.current.uniforms.uTwinkleSpeed.value = twinkle.speed;
    matRef.current.uniforms.uFogEnabled.value = fog.enabled ? 1 : 0;
    matRef.current.uniforms.uFogNear.value = fog.near;
    matRef.current.uniforms.uFogFar.value = fog.far;
    matRef.current.uniforms.uOpacity.value = resolvedOpacity;
  }, [twinkle.enabled, twinkle.amount, twinkle.speed, fog.enabled, fog.near, fog.far, resolvedOpacity]);

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSize"
          array={sizes}
          count={sizes.length}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aPhase"
          array={phases}
          count={phases.length}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aSpeed"
          array={speeds}
          count={speeds.length}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aColor"
          array={colors}
          count={colors.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={STAR_VS}
        fragmentShader={STAR_FS}
        transparent
        depthWrite={false}
        depthTest
        blending={THREE.AdditiveBlending}
        toneMapped={false}
        uniforms={{
          uTime: { value: 0 },
          uPxScale: { value: 1000 },
          uTwinkleAmount: { value: twinkle.enabled ? twinkle.amount : 0 },
          uTwinkleSpeed: { value: twinkle.speed },
          uFogEnabled: { value: fog.enabled ? 1 : 0 },
          uFogNear: { value: fog.near },
          uFogFar: { value: fog.far },
          uOpacity: { value: resolvedOpacity },
        }}
      />
    </points>
  );
}
