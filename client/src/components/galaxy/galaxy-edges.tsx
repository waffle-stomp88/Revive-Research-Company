import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { ThreeEvent } from "@react-three/fiber";
import type { GalaxyEdge, GalaxyNode } from "@/lib/galaxy-layout";

interface GalaxyEdgesProps {
  nodes: GalaxyNode[];
  edges: GalaxyEdge[];
  nodeVisibleMask: Uint8Array;
  hoveredNodeId: string | null;
  onEdgeHover: (
    edge: GalaxyEdge | null,
    pointer: { x: number; y: number } | null
  ) => void;
}

export function GalaxyEdges({
  nodes,
  edges,
  nodeVisibleMask,
  hoveredNodeId,
  onEdgeHover,
}: GalaxyEdgesProps) {
  const lineRef = useRef<THREE.LineSegments>(null);

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(edges.length * 6);
    const col = new Float32Array(edges.length * 6);
    for (let i = 0; i < edges.length; i++) {
      const e = edges[i];
      const a = nodes[e.fromIndex].position;
      const b = nodes[e.toIndex].position;
      pos.set([a[0], a[1], a[2], b[0], b[1], b[2]], i * 6);
      const ca = new THREE.Color(e.fromColor);
      const cb = new THREE.Color(e.toColor);
      col.set([ca.r, ca.g, ca.b, cb.r, cb.g, cb.b], i * 6);
    }
    return { positions: pos, colors: col };
  }, [nodes, edges]);

  // Update edge alpha/color based on node visibility & hover
  useEffect(() => {
    if (!lineRef.current) return;
    const colorAttr = lineRef.current.geometry.getAttribute("color") as
      | THREE.BufferAttribute
      | undefined;
    if (!colorAttr) return;
    for (let i = 0; i < edges.length; i++) {
      const e = edges[i];
      const aVisible = nodeVisibleMask[e.fromIndex] === 1;
      const bVisible = nodeVisibleMask[e.toIndex] === 1;
      const visible = aVisible && bVisible;
      const involvesHover =
        hoveredNodeId !== null &&
        (e.fromId === hoveredNodeId || e.toId === hoveredNodeId);
      const dim = hoveredNodeId !== null && !involvesHover;

      const intensity = !visible
        ? 0.04
        : involvesHover
        ? 1.6
        : dim
        ? 0.18
        : Math.max(0.35, e.weight);

      const ca = new THREE.Color(e.fromColor).multiplyScalar(intensity);
      const cb = new THREE.Color(e.toColor).multiplyScalar(intensity);
      colorAttr.setXYZ(i * 2, ca.r, ca.g, ca.b);
      colorAttr.setXYZ(i * 2 + 1, cb.r, cb.g, cb.b);
    }
    colorAttr.needsUpdate = true;
  }, [edges, nodeVisibleMask, hoveredNodeId]);

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (e.faceIndex === undefined && e.index === undefined) return;
    const segIndex = (e.index ?? e.faceIndex ?? 0) >> 1;
    const edge = edges[segIndex];
    if (!edge) return;
    if (
      nodeVisibleMask[edge.fromIndex] !== 1 ||
      nodeVisibleMask[edge.toIndex] !== 1
    ) {
      return;
    }
    onEdgeHover(edge, { x: e.clientX, y: e.clientY });
  };

  const handlePointerOut = () => {
    onEdgeHover(null, null);
  };

  return (
    <lineSegments
      ref={lineRef}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
      raycast={THREE.LineSegments.prototype.raycast}
    >
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          array={colors}
          count={colors.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.85}
        toneMapped={false}
      />
    </lineSegments>
  );
}
