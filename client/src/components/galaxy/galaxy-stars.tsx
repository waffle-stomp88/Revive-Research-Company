import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { ThreeEvent } from "@react-three/fiber";
import type { GalaxyNode } from "@/lib/galaxy-layout";

interface GalaxyStarsProps {
  nodes: GalaxyNode[];
  visibleMask: Uint8Array;
  highlightMask: Uint8Array;
  connectedMask: Uint8Array | null;
  hoveredId: string | null;
  selectedId: string | null;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
  onDoubleClick: (id: string) => void;
}

export function GalaxyStars({
  nodes,
  visibleMask,
  highlightMask,
  connectedMask,
  hoveredId,
  selectedId,
  onHover,
  onClick,
  onDoubleClick,
}: GalaxyStarsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tmpColor = useMemo(() => new THREE.Color(), []);

  // Initial transform setup (positions & sizes only change on layout — set once)
  useEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      dummy.position.set(n.position[0], n.position[1], n.position[2]);
      dummy.scale.setScalar(n.size);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [nodes, dummy]);

  // Color updates (per-frame-cheap; only run when masks change)
  useEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const visible = visibleMask[i] === 1;
      const highlight = highlightMask[i] === 1;
      const isSelected = selectedId === n.id;
      const isHovered = hoveredId === n.id;
      const connected = connectedMask ? connectedMask[i] === 1 : false;
      const dimNeighbors =
        hoveredId !== null && !isHovered && !connected;

      tmpColor.set(n.color);
      if (!visible) {
        tmpColor.multiplyScalar(0.06);
      } else if (isSelected || isHovered) {
        // bloom-friendly HDR multiplier
        tmpColor.multiplyScalar(2.4);
      } else if (connected) {
        tmpColor.multiplyScalar(1.55);
      } else if (dimNeighbors) {
        tmpColor.multiplyScalar(0.22);
      } else if (highlight) {
        tmpColor.multiplyScalar(1.15);
      } else {
        tmpColor.multiplyScalar(0.85);
      }
      meshRef.current.setColorAt(i, tmpColor);
    }
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [
    nodes,
    visibleMask,
    highlightMask,
    connectedMask,
    hoveredId,
    selectedId,
    tmpColor,
  ]);

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (e.instanceId === undefined) return;
    const n = nodes[e.instanceId];
    if (!n) return;
    if (visibleMask[e.instanceId] !== 1) return;
    onHover(n.id);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = () => {
    onHover(null);
    document.body.style.cursor = "";
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.instanceId === undefined) return;
    const n = nodes[e.instanceId];
    if (!n || visibleMask[e.instanceId] !== 1) return;
    onClick(n.id);
  };

  const handleDoubleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.instanceId === undefined) return;
    const n = nodes[e.instanceId];
    if (!n || visibleMask[e.instanceId] !== 1) return;
    onDoubleClick(n.id);
  };

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, nodes.length]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 18, 18]} />
      <meshStandardMaterial
        emissive={"#ffffff"}
        emissiveIntensity={0.55}
        roughness={0.4}
        metalness={0.15}
        toneMapped={false}
      />
    </instancedMesh>
  );
}
