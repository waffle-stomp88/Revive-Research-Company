import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";

interface CameraRigProps {
  flyTarget: [number, number, number] | null;
  onFlyComplete: () => void;
  resetSignal: number;
  autoRotate: boolean;
  onUserInteract: () => void;
}

export function GalaxyCameraRig({
  flyTarget,
  onFlyComplete,
  resetSignal,
  autoRotate,
  onUserInteract,
}: CameraRigProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const { camera } = useThree();
  const flyState = useRef<{
    fromPos: THREE.Vector3;
    fromTarget: THREE.Vector3;
    toPos: THREE.Vector3;
    toTarget: THREE.Vector3;
    t: number;
    duration: number;
  } | null>(null);

  // Fly-to behavior
  useEffect(() => {
    if (!flyTarget || !controlsRef.current) return;
    const target = new THREE.Vector3(...flyTarget);
    const dir = camera.position.clone().sub(controlsRef.current.target).normalize();
    if (dir.lengthSq() < 0.001) dir.set(0, 0, 1);
    const newPos = target.clone().add(dir.multiplyScalar(8));
    flyState.current = {
      fromPos: camera.position.clone(),
      fromTarget: controlsRef.current.target.clone(),
      toPos: newPos,
      toTarget: target,
      t: 0,
      duration: 0.85,
    };
  }, [flyTarget, camera]);

  // Reset behavior
  useEffect(() => {
    if (resetSignal === 0 || !controlsRef.current) return;
    flyState.current = {
      fromPos: camera.position.clone(),
      fromTarget: controlsRef.current.target.clone(),
      toPos: new THREE.Vector3(0, 6, 48),
      toTarget: new THREE.Vector3(0, 0, 0),
      t: 0,
      duration: 0.9,
    };
  }, [resetSignal, camera]);

  useFrame((_, delta) => {
    if (!controlsRef.current) return;
    if (flyState.current) {
      const fs = flyState.current;
      fs.t = Math.min(1, fs.t + delta / fs.duration);
      const e = 1 - Math.pow(1 - fs.t, 3);
      camera.position.lerpVectors(fs.fromPos, fs.toPos, e);
      controlsRef.current.target.lerpVectors(fs.fromTarget, fs.toTarget, e);
      controlsRef.current.update();
      if (fs.t >= 1) {
        flyState.current = null;
        onFlyComplete();
      }
    } else {
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={(c) => {
        controlsRef.current = c;
      }}
      enableDamping
      dampingFactor={0.08}
      enablePan={false}
      minDistance={8}
      maxDistance={90}
      autoRotate={autoRotate && !flyState.current}
      autoRotateSpeed={0.45}
      onStart={onUserInteract}
    />
  );
}
