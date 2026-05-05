import { useMemo } from "react";
import * as THREE from "three";

interface GalaxyDustStarsProps {
  count?: number;
  discRadius?: number;
  ySpread?: number;
}

const DUST_VS = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  uniform float uPxScale;
  varying vec3 vColor;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPxScale / max(0.1, -mv.z);
    vColor = aColor;
  }
`;

const DUST_FS = /* glsl */ `
  precision mediump float;
  varying vec3 vColor;
  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.0, d) * 0.55;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

// Subtle blue-white dust palette that reads as distant starlight
const DUST_PALETTE: [number, number, number][] = [
  [1.0, 1.0, 1.0],
  [0.92, 0.95, 1.0],
  [0.80, 0.88, 1.0],
  [0.70, 0.82, 1.0],
  [1.0, 0.94, 0.84],
  [0.96, 0.98, 1.0],
];

export function GalaxyDustStars({
  count = 2000,
  discRadius = 120,
  ySpread = 8,
}: GalaxyDustStarsProps) {
  const { positions, sizes, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    const col = new Float32Array(count * 3);

    let seed = 0xdeadbeef;
    const rand = () => {
      seed = (seed + 0x6d2b79f5) >>> 0;
      let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };

    for (let i = 0; i < count; i++) {
      // Uniform disc distribution in XZ plane (galactic plane)
      const angle = 2 * Math.PI * rand();
      // Use sqrt for uniform area density; skew toward outer disc
      const radius = discRadius * (0.15 + 0.85 * Math.sqrt(rand()));
      pos[i * 3]     = radius * Math.cos(angle);
      pos[i * 3 + 1] = (rand() - 0.5) * 2 * ySpread;
      pos[i * 3 + 2] = radius * Math.sin(angle);

      // Tinier sizes than the peptide stars so they read as background fill
      siz[i] = 0.04 + rand() * 0.10;

      const palette = DUST_PALETTE[Math.floor(rand() * DUST_PALETTE.length)];
      col[i * 3]     = palette[0];
      col[i * 3 + 1] = palette[1];
      col[i * 3 + 2] = palette[2];
    }

    return { positions: pos, sizes: siz, colors: col };
  }, [count, discRadius, ySpread]);

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSize"
          array={sizes}
          count={count}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aColor"
          array={colors}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={DUST_VS}
        fragmentShader={DUST_FS}
        transparent
        depthWrite={false}
        depthTest
        blending={THREE.AdditiveBlending}
        toneMapped={false}
        uniforms={{
          uPxScale: { value: 1000 },
        }}
      />
    </points>
  );
}
