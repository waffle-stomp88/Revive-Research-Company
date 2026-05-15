import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const CORE_VS = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const CORE_FS = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  uniform float uAlpha;
  uniform float uPulse;
  varying vec2 vUv;
  void main() {
    vec2 c = vUv - 0.5;
    float d = length(c) * 2.0;
    float glow = 1.0 - smoothstep(0.0, 1.0, d);
    glow = pow(glow, 1.8);
    float a = glow * uAlpha * (0.92 + uPulse * 0.08);
    gl_FragColor = vec4(uColor * a * 1.5, a);
  }
`;

interface CoreLayerProps {
  radius: number;
  color: string;
  alpha: number;
  renderOrder: number;
  pulseRef: React.MutableRefObject<number>;
}

function CoreLayer({ radius, color, alpha, renderOrder, pulseRef }: CoreLayerProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const col = new THREE.Color(color);

  useFrame(() => {
    if (matRef.current) {
      matRef.current.uniforms.uPulse.value = pulseRef.current;
    }
  });

  return (
    <mesh renderOrder={renderOrder}>
      <planeGeometry args={[radius * 2, radius * 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={CORE_VS}
        fragmentShader={CORE_FS}
        uniforms={{
          uColor: { value: new THREE.Vector3(col.r, col.g, col.b) },
          uAlpha: { value: alpha },
          uPulse: { value: 0 },
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

interface GalaxyCoreProps {
  /** When true, render only the nucleus layer (for very small screens / low-end devices). */
  reduceLayers?: boolean;
}

/**
 * GalaxyCore — three billboard planes creating a layered glowing galactic core.
 * Nucleus (white), mid-glow (warm yellow), outer halo (soft gold).
 * All use AdditiveBlending so they stack beautifully.
 * On reduceLayers mode, only the nucleus is rendered to save GPU budget.
 */
export function GalaxyCore({ reduceLayers = false }: GalaxyCoreProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pulseRef = useRef(0);

  useFrame(({ camera, clock }) => {
    if (groupRef.current) {
      // Billboard: face camera at all times
      groupRef.current.quaternion.copy(camera.quaternion);
    }
    pulseRef.current = Math.sin(clock.elapsedTime * 1.1) * 0.5 + 0.5;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Outer halo — omitted in reduce mode */}
      {!reduceLayers && (
        <CoreLayer radius={28} color="#FFE696" alpha={0.18} renderOrder={1} pulseRef={pulseRef} />
      )}
      {/* Mid-glow — omitted in reduce mode */}
      {!reduceLayers && (
        <CoreLayer radius={12} color="#FFE0A0" alpha={0.55} renderOrder={2} pulseRef={pulseRef} />
      )}
      {/* Nucleus — always rendered */}
      <CoreLayer radius={4} color="#FFFDF0" alpha={0.95} renderOrder={3} pulseRef={pulseRef} />
    </group>
  );
}
