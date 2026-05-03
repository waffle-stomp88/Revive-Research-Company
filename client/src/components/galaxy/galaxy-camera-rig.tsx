import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import type { GalaxyVfxConfig } from "./galaxy-vfx-config";

export type FlyMode = "pan" | "warp";

export interface FlyTarget {
  position: [number, number, number];
  mode: FlyMode;
}

interface CameraRigProps {
  flyTarget: FlyTarget | null;
  onFlyComplete: () => void;
  resetSignal: number;
  autoRotate: boolean;
  onUserInteract: () => void;
  parallax: GalaxyVfxConfig["parallax"];
}

export function GalaxyCameraRig({
  flyTarget,
  onFlyComplete,
  resetSignal,
  autoRotate,
  onUserInteract,
  parallax,
}: CameraRigProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const { camera, gl } = useThree();
  const baseFovRef = useRef<number>(
    (camera as THREE.PerspectiveCamera).fov ?? 55
  );
  const flyState = useRef<{
    fromPos: THREE.Vector3;
    fromTarget: THREE.Vector3;
    toPos: THREE.Vector3;
    toTarget: THREE.Vector3;
    t: number;
    duration: number;
    easePower: number;
    fovPull: number;
  } | null>(null);

  // Parallax state
  const mouseRef = useRef({ x: 0, y: 0, hasInput: false });
  const draggingRef = useRef(false);
  const appliedOffsetRef = useRef(new THREE.Vector3());
  const currentOffsetRef = useRef(new THREE.Vector3());

  const restoreFovIfNeeded = () => {
    const prev = flyState.current;
    if (
      prev &&
      prev.fovPull > 0 &&
      (camera as THREE.PerspectiveCamera).isPerspectiveCamera
    ) {
      const persp = camera as THREE.PerspectiveCamera;
      persp.fov = baseFovRef.current;
      persp.updateProjectionMatrix();
    }
  };

  // Mouse listener for parallax — bound to the canvas element only
  useEffect(() => {
    if (!parallax.enabled) return;
    const canvas = gl.domElement;
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      mouseRef.current.x = Math.max(-1, Math.min(1, nx));
      mouseRef.current.y = Math.max(-1, Math.min(1, ny));
      mouseRef.current.hasInput = true;
    };
    const onLeave = () => {
      mouseRef.current.hasInput = false;
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    return () => {
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [gl, parallax.enabled]);

  // Fly-to behavior
  useEffect(() => {
    if (!flyTarget || !controlsRef.current) return;
    const target = new THREE.Vector3(...flyTarget.position);
    const dir = camera.position
      .clone()
      .sub(controlsRef.current.target)
      .normalize();
    if (dir.lengthSq() < 0.001) dir.set(0, 0, 1);
    const isWarp = flyTarget.mode === "warp";
    const distance = isWarp ? 6 : 12;
    const newPos = target.clone().add(dir.multiplyScalar(distance));
    restoreFovIfNeeded();
    flyState.current = {
      fromPos: camera.position.clone(),
      fromTarget: controlsRef.current.target.clone(),
      toPos: newPos,
      toTarget: target,
      t: 0,
      duration: isWarp ? 0.65 : 0.85,
      easePower: isWarp ? 4 : 3,
      fovPull: isWarp ? 13 : 0,
    };
  }, [flyTarget, camera]);

  // Reset behavior
  useEffect(() => {
    if (resetSignal === 0 || !controlsRef.current) return;
    restoreFovIfNeeded();
    flyState.current = {
      fromPos: camera.position.clone(),
      fromTarget: controlsRef.current.target.clone(),
      toPos: new THREE.Vector3(0, 6, 48),
      toTarget: new THREE.Vector3(0, 0, 0),
      t: 0,
      duration: 0.9,
      easePower: 3,
      fovPull: 0,
    };
  }, [resetSignal, camera]);

  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    // Remove any previously applied parallax offset before mutating state, so
    // OrbitControls works against the un-offset camera transform. We keep the
    // offset value itself in `currentOffsetRef` so it can keep easing toward
    // the desired position across frames.
    if (appliedOffsetRef.current.lengthSq() > 0) {
      camera.position.sub(appliedOffsetRef.current);
      controlsRef.current.target.sub(appliedOffsetRef.current);
      appliedOffsetRef.current.set(0, 0, 0);
    }

    if (flyState.current) {
      const fs = flyState.current;
      fs.t = Math.min(1, fs.t + delta / fs.duration);
      const e = 1 - Math.pow(1 - fs.t, fs.easePower);
      camera.position.lerpVectors(fs.fromPos, fs.toPos, e);
      controlsRef.current.target.lerpVectors(fs.fromTarget, fs.toTarget, e);
      if (fs.fovPull > 0 && (camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
        const persp = camera as THREE.PerspectiveCamera;
        const pull = Math.sin(fs.t * Math.PI) * fs.fovPull;
        persp.fov = baseFovRef.current - pull;
        persp.updateProjectionMatrix();
      }
      controlsRef.current.update();
      if (fs.t >= 1) {
        if (fs.fovPull > 0 && (camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
          const persp = camera as THREE.PerspectiveCamera;
          persp.fov = baseFovRef.current;
          persp.updateProjectionMatrix();
        }
        flyState.current = null;
        onFlyComplete();
      }
    } else {
      controlsRef.current.update();
    }

    // Apply parallax offset (after controls.update so we don't fight it).
    if (parallax.enabled && !draggingRef.current && !flyState.current) {
      // Build basis perpendicular to view direction
      const viewDir = controlsRef.current.target
        .clone()
        .sub(camera.position)
        .normalize();
      const right = new THREE.Vector3()
        .crossVectors(viewDir, camera.up)
        .normalize();
      const up = new THREE.Vector3().crossVectors(right, viewDir).normalize();

      const desired = new THREE.Vector3();
      if (mouseRef.current.hasInput) {
        desired
          .addScaledVector(right, mouseRef.current.x * parallax.strength)
          .addScaledVector(up, -mouseRef.current.y * parallax.strength);
      }
      // Ease the persistent current offset toward desired (toward 0 when no
      // input), so the sway accumulates over multiple frames instead of
      // resetting each frame.
      const lerpAmt = 1 - Math.exp(-parallax.lerp * delta);
      currentOffsetRef.current.lerp(desired, lerpAmt);

      appliedOffsetRef.current.copy(currentOffsetRef.current);
      camera.position.add(appliedOffsetRef.current);
      controlsRef.current.target.add(appliedOffsetRef.current);
    } else {
      // Parallax disabled or paused — decay any residual offset back to 0.
      currentOffsetRef.current.set(0, 0, 0);
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
      minDistance={4}
      maxDistance={90}
      autoRotate={autoRotate && !flyState.current}
      autoRotateSpeed={0.45}
      onStart={() => {
        draggingRef.current = true;
        onUserInteract();
      }}
      onEnd={() => {
        draggingRef.current = false;
      }}
    />
  );
}
