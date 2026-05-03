import { useMemo, useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { GalaxyNode } from "@/lib/galaxy-layout";
import type { GalaxyVfxConfig } from "./galaxy-vfx-config";

interface GalaxyHalosProps {
  nodes: GalaxyNode[];
  visibleMask: Uint8Array;
  highlightMask: Uint8Array;
  hoveredId: string | null;
  selectedId: string | null;
  haloConfig: GalaxyVfxConfig["halo"];
}

const HALO_VS = /* glsl */ `
  attribute float aSize;
  attribute float aBoost;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPulseAmount;
  uniform float uPxScale;
  uniform float uBaseAlpha;
  uniform float uHoverAlpha;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vColor = aColor;
    // boost: 0=hidden, 1=base, 2=highlight, 3=hover/selected
    float visible = step(0.5, aBoost);
    float pulse = 1.0 + uPulseAmount * sin(uTime * 1.8) * step(2.5, aBoost);
    float size = aSize * pulse;
    float alphaScale = 0.0;
    if (aBoost < 0.5) alphaScale = 0.0;
    else if (aBoost < 1.5) alphaScale = uBaseAlpha;
    else if (aBoost < 2.5) alphaScale = mix(uBaseAlpha, uHoverAlpha, 0.55);
    else alphaScale = uHoverAlpha;
    vAlpha = alphaScale * visible;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    // Size in pixels: halo diameter ratio (aSize already = nodeRadius * scaleRatio)
    // multiplied by viewport-derived px factor, attenuated by depth.
    gl_PointSize = size * uPxScale / max(0.1, -mv.z);
  }
`;

const HALO_FS = /* glsl */ `
  precision mediump float;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.0, d);
    float soft = pow(core, 2.2);
    gl_FragColor = vec4(vColor * soft, soft * vAlpha);
  }
`;

export function GalaxyHalos({
  nodes,
  visibleMask,
  highlightMask,
  hoveredId,
  selectedId,
  haloConfig,
}: GalaxyHalosProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { size: viewportSize, camera } = useThree();

  // Compute viewport-aware px factor so halo px diameter ≈
  // (aSize) * (viewportH / (tan(fov/2) * d)). aSize is set in JS as
  // nodeRadius * haloRatio, so the resulting halo diameter on screen
  // is haloRatio * (sphere px diameter).
  useEffect(() => {
    if (!matRef.current) return;
    const persp = camera as THREE.PerspectiveCamera;
    const fov = persp.isPerspectiveCamera ? persp.fov : 55;
    const tanHalf = Math.tan((fov * Math.PI) / 360);
    const px = viewportSize.height / Math.max(0.001, tanHalf);
    matRef.current.uniforms.uPxScale.value = px;
  }, [viewportSize.height, camera]);

  // Sync alpha uniforms when variant config changes
  useEffect(() => {
    if (!matRef.current) return;
    matRef.current.uniforms.uBaseAlpha.value = haloConfig.baseAlpha;
    matRef.current.uniforms.uHoverAlpha.value = haloConfig.hoverAlpha;
    matRef.current.uniforms.uPulseAmount.value = haloConfig.pulseAmount;
  }, [haloConfig.baseAlpha, haloConfig.hoverAlpha, haloConfig.pulseAmount]);

  const { positions, sizes, colors, boosts } = useMemo(() => {
    const pos = new Float32Array(nodes.length * 3);
    const siz = new Float32Array(nodes.length);
    const col = new Float32Array(nodes.length * 3);
    const bst = new Float32Array(nodes.length);
    const c = new THREE.Color();
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      pos[i * 3] = n.position[0];
      pos[i * 3 + 1] = n.position[1];
      pos[i * 3 + 2] = n.position[2];
      siz[i] = n.size * haloConfig.baseScale;
      c.set(n.color);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
      bst[i] = 1;
    }
    return { positions: pos, sizes: siz, colors: col, boosts: bst };
  }, [nodes, haloConfig.baseScale]);

  // Update boosts and sizes whenever masks/hover/selected change
  useEffect(() => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const sizeAttr = geom.getAttribute("aSize") as THREE.BufferAttribute;
    const boostAttr = geom.getAttribute("aBoost") as THREE.BufferAttribute;
    if (!sizeAttr || !boostAttr) return;

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const visible = visibleMask[i] === 1;
      const isHover = hoveredId === n.id;
      const isSelected = selectedId === n.id;
      const highlight = highlightMask[i] === 1;
      // Dim non-connected when hovered: only the hovered node itself gets the big halo here.
      // (Edges + stars handle the connectivity dimming.)
      let boost = 0;
      let size = n.size * haloConfig.baseScale;
      if (!visible) {
        boost = 0;
      } else if (isHover) {
        boost = 3;
        size = n.size * haloConfig.hoverScale;
      } else if (isSelected) {
        boost = 3;
        size = n.size * haloConfig.selectedScale;
      } else if (highlight) {
        boost = 2;
        size = n.size * haloConfig.baseScale;
      } else {
        boost = 1;
        size = n.size * haloConfig.baseScale;
      }
      sizeAttr.setX(i, size);
      boostAttr.setX(i, boost);
    }
    sizeAttr.needsUpdate = true;
    boostAttr.needsUpdate = true;
  }, [
    nodes,
    visibleMask,
    highlightMask,
    hoveredId,
    selectedId,
    haloConfig.baseScale,
    haloConfig.hoverScale,
    haloConfig.selectedScale,
  ]);

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
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
          array={sizes}
          count={nodes.length}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aColor"
          array={colors}
          count={nodes.length}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aBoost"
          array={boosts}
          count={nodes.length}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={HALO_VS}
        fragmentShader={HALO_FS}
        transparent
        depthWrite={false}
        depthTest
        blending={THREE.AdditiveBlending}
        toneMapped={false}
        uniforms={{
          uTime: { value: 0 },
          uPulseAmount: { value: haloConfig.pulseAmount },
          uPxScale: { value: 1000 },
          uBaseAlpha: { value: haloConfig.baseAlpha },
          uHoverAlpha: { value: haloConfig.hoverAlpha },
        }}
      />
    </points>
  );
}
