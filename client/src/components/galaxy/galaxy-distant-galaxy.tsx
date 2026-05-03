import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { GalaxyVfxConfig } from "./galaxy-vfx-config";

interface GalaxyDistantGalaxyProps {
  config: GalaxyVfxConfig["distantGalaxy"];
}

const VS = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FS = /* glsl */ `
  precision highp float;
  uniform vec3 uCoreColor;
  uniform vec3 uArmColor;
  uniform float uBrightness;
  uniform float uTilt;
  uniform float uArmSweep;
  uniform float uDust;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 p = (vUv - 0.5) * 2.0;
    vec2 ps = vec2(p.x, p.y / max(0.05, uTilt));
    float r = length(ps);
    if (r > 1.0) discard;

    float theta = atan(ps.y, ps.x);

    float core  = exp(-r * r * 60.0);
    float bulge = exp(-r * r * 8.0);

    float armPhase = theta - uArmSweep * log(max(r, 0.02));
    float armRaw = sin(armPhase * 2.0);
    float arms = pow(max(0.0, armRaw), 8.0);
    float armEnv = r * exp(-r * r * 3.5) * 2.4;
    arms *= armEnv;

    float dustY = ps.y - 0.06;
    float dust  = exp(-dustY * dustY * 220.0);
    dust *= smoothstep(0.85, 0.5, r);

    float discMass = core * 1.6 + bulge * 0.35 + arms * 0.9;

    float dustHit = dust * uDust;
    float intensityR = discMass * (1.0 - dustHit * 0.55);
    float intensityB = discMass * (1.0 - dustHit * 0.95);

    vec3 baseTint = mix(uCoreColor, uArmColor, smoothstep(0.0, 0.5, r));
    vec3 col = baseTint * vec3(intensityR, (intensityR + intensityB) * 0.5, intensityB);

    float edgeFade = smoothstep(1.0, 0.82, r);
    float a = discMass * uBrightness * edgeFade;

    float n = (hash(gl_FragCoord.xy) - 0.5) / 255.0;
    a += n;

    if (a < 0.0008) discard;
    gl_FragColor = vec4(col, a);
  }
`;

const ANCHOR_DEPTH = 130;
const ANCHOR_RIGHT = 35;
const ANCHOR_UP = 22;

export function GalaxyDistantGalaxy({ config }: GalaxyDistantGalaxyProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const fwd = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);
  const upVec = useMemo(() => new THREE.Vector3(), []);
  const tmpPos = useMemo(() => new THREE.Vector3(), []);

  const tiltSquash = useMemo(
    () => Math.max(0.05, Math.cos((config.tiltDeg * Math.PI) / 180)),
    [config.tiltDeg]
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    const camera = state.camera;
    camera.getWorldDirection(fwd);
    right.crossVectors(fwd, camera.up).normalize();
    upVec.crossVectors(right, fwd).normalize();
    tmpPos
      .copy(camera.position)
      .addScaledVector(fwd, ANCHOR_DEPTH)
      .addScaledVector(right, ANCHOR_RIGHT)
      .addScaledVector(upVec, ANCHOR_UP);
    meshRef.current.position.copy(tmpPos);
    meshRef.current.lookAt(camera.position);
  });

  if (!config.enabled) return null;

  return (
    <mesh ref={meshRef} renderOrder={-9} frustumCulled={false}>
      <planeGeometry args={[config.size, config.size]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={VS}
        fragmentShader={FS}
        transparent
        depthWrite={false}
        depthTest={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
        uniforms={{
          uCoreColor: { value: new THREE.Color(config.coreColor) },
          uArmColor: { value: new THREE.Color(config.armColor) },
          uBrightness: { value: config.brightness },
          uTilt: { value: tiltSquash },
          uArmSweep: { value: config.armSweep },
          uDust: { value: config.dustStrength },
        }}
      />
    </mesh>
  );
}
