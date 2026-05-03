import { useMemo, useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { GalaxyVfxConfig } from "./galaxy-vfx-config";

interface StarfieldProps {
  count?: number;
  radius?: number;
  twinkle: GalaxyVfxConfig["twinkle"];
  fog: GalaxyVfxConfig["fog"];
}

const STAR_VS = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;
  uniform float uTime;
  uniform float uPxScale;
  uniform float uTwinkleAmount;
  uniform float uTwinkleSpeed;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform float uFogEnabled;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPxScale / max(0.1, -mv.z);

    float tw = sin(uTime * uTwinkleSpeed * aSpeed + aPhase * 6.2831);
    // Map sin range [-1,1] -> [1-amount, 1]
    float twinkle = 1.0 - uTwinkleAmount * 0.5 * (1.0 - tw);

    float depth = length(mv.xyz);
    float fog = uFogEnabled > 0.5
      ? clamp((uFogFar - depth) / max(0.001, uFogFar - uFogNear), 0.0, 1.0)
      : 1.0;

    vAlpha = clamp(twinkle, 0.0, 1.0) * fog;
  }
`;

const STAR_FS = /* glsl */ `
  precision mediump float;
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.0, d);
    float soft = pow(core, 1.6);
    gl_FragColor = vec4(vec3(1.0), soft * vAlpha * uOpacity);
  }
`;

export function GalaxyStarfield({
  count = 800,
  radius = 70,
  twinkle,
  fog,
}: StarfieldProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { size: viewportSize, camera } = useThree();

  const { positions, sizes, phases, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    const pha = new Float32Array(count);
    const spd = new Float32Array(count);
    let seed = 0x9e3779b9;
    const rand = () => {
      seed = (seed + 0x6d2b79f5) >>> 0;
      let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
    for (let i = 0; i < count; i++) {
      const u = rand();
      const v = rand();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = radius * (0.7 + 0.3 * rand());
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      siz[i] = 0.06 + rand() * 0.14;
      pha[i] = rand();
      spd[i] = 0.6 + rand() * 1.4;
    }
    return { positions: pos, sizes: siz, phases: pha, speeds: spd };
  }, [count, radius]);

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
  }, [twinkle.enabled, twinkle.amount, twinkle.speed, fog.enabled, fog.near, fog.far]);

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
          uOpacity: { value: 0.55 },
        }}
      />
    </points>
  );
}
