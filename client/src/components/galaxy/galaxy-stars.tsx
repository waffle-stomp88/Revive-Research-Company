import { useMemo, useRef, useEffect } from "react";
import { useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { GalaxyNode } from "@/lib/galaxy-layout";
import type { GalaxyVfxVariant } from "./galaxy-vfx-config";

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
  vfxVariant: GalaxyVfxVariant;
}

const SPRITE_VS = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aBoost;
  attribute float aStreak;
  uniform float uTime;
  uniform float uPxScale;
  varying vec3 vColor;
  varying float vBoost;
  varying float vStreak;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float sizeMul = 1.0 + max(0.0, aBoost - 1.0) * 0.35;
    gl_PointSize = aSize * sizeMul * uPxScale / max(0.1, -mv.z);
    vColor = aColor;
    vBoost = aBoost;
    vStreak = aStreak;
  }
`;

const SPRITE_FS = /* glsl */ `
  precision mediump float;
  varying vec3 vColor;
  varying float vBoost;
  varying float vStreak;
  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float r = length(uv);
    if (r > 0.5) discard;
    float core = exp(-r * r * 110.0);
    float halo = exp(-r * r * 11.0) * 0.28;
    float axisFalloff = mix(70.0, 14.0, clamp(vStreak, 0.0, 1.0));
    float crossX = exp(-uv.y * uv.y * 2400.0) * exp(-abs(uv.x) * axisFalloff);
    float crossY = exp(-uv.x * uv.x * 2400.0) * exp(-abs(uv.y) * axisFalloff);
    float streaks = (crossX + crossY) * vStreak;
    float intensity = core + halo + streaks;
    vec3 c = vColor * intensity * vBoost;
    float alphaMask = step(0.001, vBoost);
    gl_FragColor = vec4(c, intensity * alphaMask);
  }
`;

export function GalaxyStars(props: GalaxyStarsProps) {
  if (props.vfxVariant === "cinematic") {
    return <CinematicStars {...props} />;
  }
  return <MinimalStars {...props} />;
}

// ---------------------------------------------------------------------------
// Minimal variant: original instanced visible sphere renderer (unchanged
// behavior — only the new cinematic VFX package introduces sprite stars).
// ---------------------------------------------------------------------------
function MinimalStars({
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

  useEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const visible = visibleMask[i] === 1;
      const highlight = highlightMask[i] === 1;
      const isSelected = selectedId === n.id;
      const isHovered = hoveredId === n.id;
      const connected = connectedMask ? connectedMask[i] === 1 : false;
      const dimNeighbors = hoveredId !== null && !isHovered && !connected;

      tmpColor.set(n.color);
      if (!visible) {
        tmpColor.multiplyScalar(0.06);
      } else if (isSelected || isHovered) {
        tmpColor.multiplyScalar(2.4);
      } else if (connected) {
        tmpColor.multiplyScalar(1.55);
      } else if (dimNeighbors) {
        tmpColor.multiplyScalar(0.22);
      } else if (highlight) {
        tmpColor.multiplyScalar(1.15);
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
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

// ---------------------------------------------------------------------------
// Cinematic variant: invisible InstancedMesh picker + sprite Points cloud
// with Gaussian core, soft halo, and 4-pointed diffraction streaks.
// ---------------------------------------------------------------------------
function CinematicStars({
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
  const pointsRef = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const { size: viewportSize, camera } = useThree();

  // Picker transforms — invisible (no color, no depth writes) but still
  // raycastable so existing hover/click/double-click handlers work.
  useEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      dummy.position.set(n.position[0], n.position[1], n.position[2]);
      dummy.scale.setScalar(Math.max(n.size, 0.7) * 1.15);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [nodes, dummy]);

  const { positions, baseSizes, baseColors } = useMemo(() => {
    const pos = new Float32Array(nodes.length * 3);
    const siz = new Float32Array(nodes.length);
    const col = new Float32Array(nodes.length * 3);
    const tmp = new THREE.Color();
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      pos[i * 3] = n.position[0];
      pos[i * 3 + 1] = n.position[1];
      pos[i * 3 + 2] = n.position[2];
      siz[i] = Math.max(0.8, n.size * 2.4);
      tmp.set(n.color);
      col[i * 3] = tmp.r;
      col[i * 3 + 1] = tmp.g;
      col[i * 3 + 2] = tmp.b;
    }
    return { positions: pos, baseSizes: siz, baseColors: col };
  }, [nodes]);

  const sizesAttr = useMemo(() => new Float32Array(baseSizes), [baseSizes]);
  const boostsAttr = useMemo(() => new Float32Array(nodes.length), [nodes.length]);
  const streaksAttr = useMemo(() => new Float32Array(nodes.length), [nodes.length]);

  useEffect(() => {
    if (!matRef.current) return;
    const persp = camera as THREE.PerspectiveCamera;
    const fov = persp.isPerspectiveCamera ? persp.fov : 55;
    const tanHalf = Math.tan((fov * Math.PI) / 360);
    const px = viewportSize.height / Math.max(0.001, tanHalf);
    matRef.current.uniforms.uPxScale.value = px;
  }, [viewportSize.height, camera]);

  useEffect(() => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const sizeA = geom.getAttribute("aSize") as THREE.BufferAttribute | undefined;
    const boostA = geom.getAttribute("aBoost") as THREE.BufferAttribute | undefined;
    const streakA = geom.getAttribute("aStreak") as THREE.BufferAttribute | undefined;
    if (!sizeA || !boostA || !streakA) return;

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const visible = visibleMask[i] === 1;
      const highlight = highlightMask[i] === 1;
      const isHover = hoveredId === n.id;
      const isSelected = selectedId === n.id;
      const connected = connectedMask ? connectedMask[i] === 1 : false;
      const dimNeighbor = hoveredId !== null && !isHover && !connected;

      let boost = 1.0;
      let streak = 0.18;
      let size = baseSizes[i];

      if (!visible) {
        boost = 0.0;
        streak = 0.0;
      } else if (isHover) {
        boost = 3.6;
        streak = 1.0;
        size = baseSizes[i] * 1.25;
      } else if (isSelected) {
        boost = 3.2;
        streak = 0.95;
        size = baseSizes[i] * 1.2;
      } else if (connected) {
        boost = 2.0;
        streak = 0.55;
      } else if (dimNeighbor) {
        boost = 0.32;
        streak = 0.05;
      } else if (highlight) {
        boost = 1.25;
        streak = 0.25;
      }

      sizeA.setX(i, size);
      boostA.setX(i, boost);
      streakA.setX(i, streak);
    }
    sizeA.needsUpdate = true;
    boostA.needsUpdate = true;
    streakA.needsUpdate = true;
  }, [
    nodes,
    visibleMask,
    highlightMask,
    connectedMask,
    hoveredId,
    selectedId,
    baseSizes,
  ]);

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

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
    <>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, nodes.length]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial
          colorWrite={false}
          depthWrite={false}
          depthTest={false}
          transparent
          opacity={0}
          toneMapped={false}
        />
      </instancedMesh>

      <points ref={pointsRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={positions}
            count={nodes.length}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-aSize"
            array={sizesAttr}
            count={nodes.length}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-aColor"
            array={baseColors}
            count={nodes.length}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-aBoost"
            array={boostsAttr}
            count={nodes.length}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-aStreak"
            array={streaksAttr}
            count={nodes.length}
            itemSize={1}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={matRef}
          vertexShader={SPRITE_VS}
          fragmentShader={SPRITE_FS}
          transparent
          depthWrite={false}
          depthTest
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          uniforms={{
            uTime: { value: 0 },
            uPxScale: { value: 1000 },
          }}
        />
      </points>
    </>
  );
}
