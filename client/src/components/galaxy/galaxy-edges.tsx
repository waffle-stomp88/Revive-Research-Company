import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import type { GalaxyEdge, GalaxyNode } from "@/lib/galaxy-layout";
import type { GalaxyVfxConfig } from "./galaxy-vfx-config";

interface GalaxyEdgesProps {
  nodes: GalaxyNode[];
  edges: GalaxyEdge[];
  nodeVisibleMask: Uint8Array;
  hoveredNodeId: string | null;
  edgeConfig: GalaxyVfxConfig["edges"];
  onEdgeHover: (
    edge: GalaxyEdge | null,
    pointer: { x: number; y: number } | null
  ) => void;
}

const EDGE_VS = /* glsl */ `
  attribute vec3 aColor;
  attribute float aSegT;
  attribute float aSegId;
  attribute float aIntensity;
  attribute float aBoost;
  varying vec3 vColor;
  varying float vSegT;
  varying float vSegId;
  varying float vIntensity;
  varying float vBoost;
  void main() {
    vColor = aColor;
    vSegT = aSegT;
    vSegId = aSegId;
    vIntensity = aIntensity;
    vBoost = aBoost;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const EDGE_FS = /* glsl */ `
  precision mediump float;
  varying vec3 vColor;
  varying float vSegT;
  varying float vSegId;
  varying float vIntensity;
  varying float vBoost;
  uniform float uTime;
  uniform float uPulseStrength;
  uniform float uPulseSpeed;
  uniform float uBaseGlow;

  void main() {
    // Hard-suppress edges marked as not visible (intensity ~ 0)
    if (vIntensity < 0.02) discard;

    // base color with intensity
    vec3 base = vColor * vIntensity * uBaseGlow;

    // pulse: a soft moving bump along the segment
    float speed = uPulseSpeed * mix(1.0, 1.8, step(1.5, vBoost));
    float offset = fract(vSegId * 0.3137);
    float head = fract(vSegT - uTime * speed + offset);
    // Sharp bright pulse (smooth bump near 0)
    float pulse = exp(-pow(head * 6.0, 2.0))
                + 0.5 * exp(-pow((head - 1.0) * 6.0, 2.0));
    float pulseScale = uPulseStrength * mix(0.6, 1.6, step(1.5, vBoost));

    vec3 col = base + vColor * pulse * pulseScale * vIntensity;
    float alpha = clamp(vIntensity * 0.9 + pulse * pulseScale * 0.6 * vIntensity, 0.0, 1.4);
    gl_FragColor = vec4(col, alpha);
  }
`;

export function GalaxyEdges({
  nodes,
  edges,
  nodeVisibleMask,
  hoveredNodeId,
  edgeConfig,
  onEdgeHover,
}: GalaxyEdgesProps) {
  const lineRef = useRef<THREE.LineSegments>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, colors, segT, segId } = useMemo(() => {
    const pos = new Float32Array(edges.length * 6);
    const col = new Float32Array(edges.length * 6);
    const t = new Float32Array(edges.length * 2);
    const id = new Float32Array(edges.length * 2);
    for (let i = 0; i < edges.length; i++) {
      const e = edges[i];
      const a = nodes[e.fromIndex].position;
      const b = nodes[e.toIndex].position;
      pos.set([a[0], a[1], a[2], b[0], b[1], b[2]], i * 6);
      const ca = new THREE.Color(e.fromColor);
      const cb = new THREE.Color(e.toColor);
      col.set([ca.r, ca.g, ca.b, cb.r, cb.g, cb.b], i * 6);
      t[i * 2] = 0.0;
      t[i * 2 + 1] = 1.0;
      id[i * 2] = i;
      id[i * 2 + 1] = i;
    }
    return { positions: pos, colors: col, segT: t, segId: id };
  }, [nodes, edges]);

  const intensities = useMemo(
    () => new Float32Array(edges.length * 2),
    [edges.length]
  );
  const boosts = useMemo(
    () => new Float32Array(edges.length * 2),
    [edges.length]
  );

  useEffect(() => {
    if (!lineRef.current) return;
    const geom = lineRef.current.geometry;
    const intAttr = geom.getAttribute("aIntensity") as
      | THREE.BufferAttribute
      | undefined;
    const boostAttr = geom.getAttribute("aBoost") as
      | THREE.BufferAttribute
      | undefined;
    if (!intAttr || !boostAttr) return;

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
        ? 0.0
        : involvesHover
        ? 1.6
        : dim
        ? 0.18
        : Math.max(0.4, e.weight * 1.05);

      const boost = !visible ? 0 : involvesHover ? 2 : 1;

      intAttr.setX(i * 2, intensity);
      intAttr.setX(i * 2 + 1, intensity);
      boostAttr.setX(i * 2, boost);
      boostAttr.setX(i * 2 + 1, boost);
    }
    intAttr.needsUpdate = true;
    boostAttr.needsUpdate = true;
  }, [edges, nodeVisibleMask, hoveredNodeId]);

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  // Sync shader uniforms when variant changes
  useEffect(() => {
    if (!matRef.current) return;
    matRef.current.uniforms.uPulseStrength.value = edgeConfig.pulseStrength;
    matRef.current.uniforms.uPulseSpeed.value = edgeConfig.pulseSpeed;
    matRef.current.uniforms.uBaseGlow.value = edgeConfig.baseGlow;
  }, [edgeConfig.pulseStrength, edgeConfig.pulseSpeed, edgeConfig.baseGlow]);

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
          attach="attributes-aColor"
          array={colors}
          count={colors.length / 3}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSegT"
          array={segT}
          count={segT.length}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aSegId"
          array={segId}
          count={segId.length}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aIntensity"
          array={intensities}
          count={intensities.length}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aBoost"
          array={boosts}
          count={boosts.length}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={EDGE_VS}
        fragmentShader={EDGE_FS}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
        uniforms={{
          uTime: { value: 0 },
          uPulseStrength: { value: edgeConfig.pulseStrength },
          uPulseSpeed: { value: edgeConfig.pulseSpeed },
          uBaseGlow: { value: edgeConfig.baseGlow },
        }}
      />
    </lineSegments>
  );
}
