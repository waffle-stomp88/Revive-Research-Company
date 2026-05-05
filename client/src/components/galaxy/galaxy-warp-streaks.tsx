import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface GalaxyWarpStreaksProps {
  isWarping: boolean;
  warpKey: number;
}

const N_STREAKS = 180;

// Pre-generate per-streak random data (angles + lengths + radii)
function buildStreakData() {
  // azimuth: random angle around forward axis (0–2π)
  const azimuths = new Float32Array(N_STREAKS);
  // cone angle from forward axis: 4–40 degrees in radians
  const coneAngles = new Float32Array(N_STREAKS);
  // streak length factor (0.5–1)
  const lengths = new Float32Array(N_STREAKS);
  // speed stagger: 0–0.3
  const offsets = new Float32Array(N_STREAKS);
  // color mix: 0 = white, 1 = cyan
  const colorMix = new Float32Array(N_STREAKS);

  for (let i = 0; i < N_STREAKS; i++) {
    azimuths[i] = Math.random() * Math.PI * 2;
    // More streaks near center (lower cone angles feel more hyperspace-like)
    coneAngles[i] = (0.07 + Math.random() * 0.6) * (Math.PI / 4);
    lengths[i] = 0.5 + Math.random() * 0.5;
    offsets[i] = Math.random() * 0.25;
    colorMix[i] = Math.random();
  }

  return { azimuths, coneAngles, lengths, offsets, colorMix };
}

// Temp vectors reused every frame to avoid GC pressure
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3();
const _streakDir = new THREE.Vector3();

export function GalaxyWarpStreaks({ isWarping, warpKey }: GalaxyWarpStreaksProps) {
  const progressRef = useRef(0);
  const activeRef = useRef(false);
  const lineRef = useRef<THREE.LineSegments | null>(null);
  const { camera } = useThree();

  const { azimuths, coneAngles, lengths, offsets, colorMix } = useMemo(
    () => buildStreakData(),
    []
  );

  // Persistent typed arrays for the buffer attributes
  const posArr = useMemo(() => new Float32Array(N_STREAKS * 2 * 3), []);
  const colArr = useMemo(() => new Float32Array(N_STREAKS * 2 * 3), []);

  // Reset and start animation on each warp
  useEffect(() => {
    if (isWarping) {
      progressRef.current = 0;
      activeRef.current = true;
    }
  }, [warpKey, isWarping]);

  useEffect(() => {
    if (!isWarping) {
      activeRef.current = false;
    }
  }, [isWarping]);

  useFrame((_, delta) => {
    if (!lineRef.current) return;

    const geo = lineRef.current.geometry as THREE.BufferGeometry;
    const posAttr = geo.getAttribute("position") as THREE.BufferAttribute;
    const colAttr = geo.getAttribute("color") as THREE.BufferAttribute;

    if (!activeRef.current) {
      // Zero all positions to hide streaks
      posArr.fill(0);
      (posAttr.array as Float32Array).set(posArr);
      posAttr.needsUpdate = true;
      return;
    }

    progressRef.current = Math.min(1, progressRef.current + delta / 0.6);
    const p = progressRef.current;

    // Global alpha: ramp up in first 15%, full from 15-70%, fade out last 30%
    const globalAlpha =
      p < 0.15 ? p / 0.15 : p > 0.70 ? 1 - (p - 0.70) / 0.30 : 1;

    // Camera-space basis vectors
    _forward.set(0, 0, -1).applyQuaternion(camera.quaternion);
    _right.set(1, 0, 0).applyQuaternion(camera.quaternion);
    _up.set(0, 1, 0).applyQuaternion(camera.quaternion);

    const camPos = camera.position;

    // Max streak distance from camera (world units)
    const MAX_DIST = 32;

    for (let i = 0; i < N_STREAKS; i++) {
      const az = azimuths[i];
      const cone = coneAngles[i];
      const len = lengths[i];
      const off = offsets[i];
      const cmix = colorMix[i];

      // Local progress per streak (staggered)
      const localP = Math.max(0, Math.min(1, (p - off) / (1 - off)));

      // Streak direction in world space:
      // forward component: cos(cone), radial component: sin(cone) at azimuth az
      const sinCone = Math.sin(cone);
      const cosCone = Math.cos(cone);
      const cosAz = Math.cos(az);
      const sinAz = Math.sin(az);

      _streakDir
        .set(0, 0, 0)
        .addScaledVector(_forward, cosCone)
        .addScaledVector(_right, sinCone * cosAz)
        .addScaledVector(_up, sinCone * sinAz);

      // Streaks rush AWAY from camera (hyperspace: stars fly past you)
      // endDist is always ahead of startDist — creates a "tail" effect
      const endDist = localP * MAX_DIST;                      // lead point (further)
      const startDist = Math.max(0, localP - 0.22 * len) * MAX_DIST; // tail point (closer)

      const pi = i * 2 * 3;

      // Start vertex (tail — closer to camera)
      posArr[pi + 0] = camPos.x + _streakDir.x * startDist;
      posArr[pi + 1] = camPos.y + _streakDir.y * startDist;
      posArr[pi + 2] = camPos.z + _streakDir.z * startDist;

      // End vertex (lead — further from camera)
      posArr[pi + 3] = camPos.x + _streakDir.x * endDist;
      posArr[pi + 4] = camPos.y + _streakDir.y * endDist;
      posArr[pi + 5] = camPos.z + _streakDir.z * endDist;

      // Color: mix white and cyan, modulated by globalAlpha
      // Cyan is (0, 1, 1); White is (1, 1, 1)
      const alpha = globalAlpha * (0.55 + 0.45 * len);
      const r = (1.0 - cmix * 1.0) * alpha;          // white→cyan: R drops
      const g = alpha;                                 // G stays 1
      const b = alpha;                                 // B stays 1

      colArr[pi + 0] = r;
      colArr[pi + 1] = g;
      colArr[pi + 2] = b;
      colArr[pi + 3] = r;
      colArr[pi + 4] = g;
      colArr[pi + 5] = b;
    }

    (posAttr.array as Float32Array).set(posArr);
    (colAttr.array as Float32Array).set(colArr);
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;

    if (progressRef.current >= 1) {
      activeRef.current = false;
    }
  });

  return (
    <lineSegments ref={lineRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(N_STREAKS * 2 * 3), 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[new Float32Array(N_STREAKS * 2 * 3), 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        transparent
      />
    </lineSegments>
  );
}
