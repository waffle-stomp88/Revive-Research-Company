import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import {
  buildGalaxyLayout,
  type GalaxyEdge,
  type GalaxyNode,
} from "@/lib/galaxy-layout";
import { GalaxyStars } from "./galaxy-stars";
import { GalaxyEdges } from "./galaxy-edges";
import { GalaxyStarfield } from "./galaxy-starfield";
import { GalaxyCameraRig, type FlyTarget } from "./galaxy-camera-rig";
import { GalaxyHalos } from "./galaxy-halos";
import { GalaxyEffects } from "./galaxy-effects";
import { GalaxyNebula } from "./galaxy-nebula";
import { GalaxyDistantGalaxy } from "./galaxy-distant-galaxy";
import { GalaxyWarpStreaks } from "./galaxy-warp-streaks";
import {
  GALAXY_VFX,
  type GalaxyVfxVariant,
} from "./galaxy-vfx-config";

interface GalaxySceneProps {
  visibleSystemIds: Set<string>;
  searchTerm: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  onNodeMeta: (nodes: GalaxyNode[]) => void;
  resetSignal: number;
  vfxVariant?: GalaxyVfxVariant;
  onLoaded?: () => void;
  doEntry?: boolean;
  onWarp?: () => void;
  onHoverSound?: () => void;
  externalWarpId?: string | null;
  onExternalWarpConsumed?: () => void;
}

export function GalaxyScene({
  visibleSystemIds,
  searchTerm,
  selectedId,
  onSelect,
  hoveredId,
  onHover,
  onNodeMeta,
  resetSignal,
  vfxVariant = "cinematic",
  onLoaded,
  doEntry = false,
  onWarp,
  onHoverSound,
  externalWarpId,
  onExternalWarpConsumed,
}: GalaxySceneProps) {
  const layout = useMemo(() => buildGalaxyLayout(), []);
  const { nodes, edges } = layout;
  const vfx = GALAXY_VFX[vfxVariant];
  const [edgeHover, setEdgeHover] = useState<{
    edge: GalaxyEdge;
    pointer: { x: number; y: number };
  } | null>(null);
  const [flyTarget, setFlyTarget] = useState<FlyTarget | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Warp streak state
  const [isWarping, setIsWarping] = useState(false);
  const [warpKey, setWarpKey] = useState(0);

  // External warp trigger (e.g. from search-to-warp)
  useEffect(() => {
    if (!externalWarpId) return;
    const n = nodes.find((x) => x.id === externalWarpId);
    if (!n) return;
    handleUserInteract();
    setFlyTarget({ position: [n.position[0], n.position[1], n.position[2]], mode: "warp" });
    setIsWarping(true);
    setWarpKey((k) => k + 1);
    onWarp?.();
    onExternalWarpConsumed?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalWarpId]);

  // Signal parent that scene has mounted
  useEffect(() => {
    onLoaded?.();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Surface node meta to parent
  useEffect(() => {
    onNodeMeta(nodes);
  }, [nodes, onNodeMeta]);

  useEffect(() => {
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  // Fire hover sound when hoveredId changes to a non-null value
  const prevHoveredId = useRef<string | null>(null);
  useEffect(() => {
    if (hoveredId && hoveredId !== prevHoveredId.current) {
      onHoverSound?.();
    }
    prevHoveredId.current = hoveredId;
  }, [hoveredId, onHoverSound]);

  const adjacency = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const e of edges) {
      if (!m.has(e.fromId)) m.set(e.fromId, new Set());
      if (!m.has(e.toId)) m.set(e.toId, new Set());
      m.get(e.fromId)!.add(e.toId);
      m.get(e.toId)!.add(e.fromId);
    }
    return m;
  }, [edges]);

  const visibleMask = useMemo(() => {
    const m = new Uint8Array(nodes.length);
    const lower = searchTerm.trim().toLowerCase();
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const sysOk = visibleSystemIds.has(n.systemId);
      if (!sysOk) { m[i] = 0; continue; }
      if (lower.length > 0) {
        const matches =
          n.name.toLowerCase().includes(lower) ||
          n.id.toLowerCase().includes(lower) ||
          n.pathways.some((p) => p.toLowerCase().includes(lower)) ||
          n.systems.some((s) => s.toLowerCase().includes(lower));
        m[i] = matches ? 1 : 0;
      } else {
        m[i] = 1;
      }
    }
    return m;
  }, [nodes, visibleSystemIds, searchTerm]);

  const highlightMask = useMemo(() => {
    const m = new Uint8Array(nodes.length);
    if (searchTerm.trim().length === 0) {
      for (let i = 0; i < nodes.length; i++) m[i] = visibleMask[i];
      return m;
    }
    for (let i = 0; i < nodes.length; i++) m[i] = visibleMask[i] === 1 ? 1 : 0;
    return m;
  }, [nodes, visibleMask, searchTerm]);

  const connectedMask = useMemo(() => {
    if (!hoveredId) return null;
    const set = adjacency.get(hoveredId);
    if (!set) return null;
    const m = new Uint8Array(nodes.length);
    for (let i = 0; i < nodes.length; i++) m[i] = set.has(nodes[i].id) ? 1 : 0;
    return m;
  }, [adjacency, hoveredId, nodes]);

  const handleUserInteract = useCallback(() => {
    setAutoRotate(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setAutoRotate(true), 6000);
  }, []);

  const handleDoubleClick = useCallback(
    (id: string) => {
      const n = nodes.find((x) => x.id === id);
      if (!n) return;
      handleUserInteract();
      setFlyTarget({ position: [n.position[0], n.position[1], n.position[2]], mode: "warp" });
      onSelect(id);
      // Trigger warp streaks
      setIsWarping(true);
      setWarpKey((k) => k + 1);
      onWarp?.();
    },
    [nodes, onSelect, handleUserInteract, onWarp]
  );

  const handleSelect = useCallback(
    (id: string) => {
      const n = nodes.find((x) => x.id === id);
      if (n) {
        handleUserInteract();
        setFlyTarget({ position: [n.position[0], n.position[1], n.position[2]], mode: "pan" });
      }
      onSelect(id);
    },
    [nodes, onSelect, handleUserInteract]
  );

  const hoveredNode = hoveredId ? nodes.find((x) => x.id === hoveredId) : null;

  // Canvas starts far out in deep space for the discovery entry; normal view otherwise.
  const initialCamPos: [number, number, number] = doEntry ? [0, 30, 320] : [0, 6, 48];

  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: initialCamPos, fov: 55, near: 0.1, far: 500 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor(
            new THREE.Color(vfxVariant === "cinematic" ? "#000000" : "#0d0d10"),
            1
          );
        }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[20, 20, 20]} intensity={0.6} color="#ffffff" />
        <pointLight position={[-20, -10, -20]} intensity={0.45} color="#21d8ff" />
        <GalaxyStarfield twinkle={vfx.twinkle} fog={vfx.fog} vfxVariant={vfxVariant} />
        <GalaxyNebula nodes={nodes} config={vfx.nebula} fog={vfx.fog} />
        <GalaxyDistantGalaxy config={vfx.distantGalaxy} />
        <GalaxyEdges
          nodes={nodes}
          edges={edges}
          nodeVisibleMask={visibleMask}
          hoveredNodeId={hoveredId}
          selectedNodeId={selectedId}
          edgeConfig={vfx.edges}
          onEdgeHover={(edge, pointer) => {
            if (edge && pointer) setEdgeHover({ edge, pointer });
            else setEdgeHover(null);
          }}
        />
        <GalaxyHalos
          nodes={nodes}
          visibleMask={visibleMask}
          highlightMask={highlightMask}
          hoveredId={hoveredId}
          selectedId={selectedId}
          haloConfig={vfx.halo}
          searchActive={searchTerm.trim().length > 0}
        />
        <GalaxyStars
          nodes={nodes}
          visibleMask={visibleMask}
          highlightMask={highlightMask}
          connectedMask={connectedMask}
          hoveredId={hoveredId}
          selectedId={selectedId}
          onHover={onHover}
          onClick={handleSelect}
          onDoubleClick={handleDoubleClick}
          vfxVariant={vfxVariant}
        />
        <GalaxyEffects config={vfx.bloom} />
        <GalaxyWarpStreaks isWarping={isWarping} warpKey={warpKey} />

        {/* Targeting reticle on hover */}
        {hoveredNode && (
          <Html
            position={hoveredNode.position}
            center
            zIndexRange={[100, 200]}
            style={{ pointerEvents: "none" }}
          >
            <div
              className="galaxy-reticle"
              style={{ color: hoveredNode.color }}
              data-testid="galaxy-reticle"
            >
              <div className="galaxy-reticle-corner galaxy-reticle-corner-tl" style={{ borderColor: hoveredNode.color }} />
              <div className="galaxy-reticle-corner galaxy-reticle-corner-tr" style={{ borderColor: hoveredNode.color }} />
              <div className="galaxy-reticle-corner galaxy-reticle-corner-bl" style={{ borderColor: hoveredNode.color }} />
              <div className="galaxy-reticle-corner galaxy-reticle-corner-br" style={{ borderColor: hoveredNode.color }} />
              <div className="galaxy-reticle-dot" style={{ backgroundColor: hoveredNode.color }} />
            </div>
          </Html>
        )}

        {/* Star hover label */}
        {hoveredId &&
          (() => {
            const n = nodes.find((x) => x.id === hoveredId);
            if (!n) return null;
            return (
              <Html
                position={n.position}
                center
                zIndexRange={[100, 0]}
                style={{ pointerEvents: "none" }}
              >
                <div
                  className="px-3 py-1.5 rounded-md bg-background/85 backdrop-blur-md border flex items-center gap-2 shadow-lg whitespace-nowrap -translate-y-8 transition-opacity duration-150"
                  style={{ fontSize: "13px", borderColor: `${n.color}66` }}
                  data-testid="galaxy-hover-label"
                >
                  <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: n.color }} />
                  <span className="font-medium">{n.name}</span>
                  <span className="text-muted-foreground">·</span>
                  <span style={{ color: n.color }}>{n.systemName}</span>
                  {n.synergyCount > 0 && (
                    <>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">
                        {n.synergyCount} link{n.synergyCount === 1 ? "" : "s"}
                      </span>
                    </>
                  )}
                </div>
              </Html>
            );
          })()}

        <GalaxyCameraRig
          flyTarget={flyTarget}
          onFlyComplete={() => {
            setFlyTarget(null);
            setIsWarping(false);
          }}
          resetSignal={resetSignal}
          autoRotate={autoRotate && !hoveredId}
          parallax={vfx.parallax}
          doEntry={doEntry}
        />
      </Canvas>

      {/* Edge hover tooltip */}
      {edgeHover && (
        <div
          className="pointer-events-none fixed z-20"
          style={{ left: edgeHover.pointer.x + 12, top: edgeHover.pointer.y + 12 }}
          data-testid="galaxy-edge-tooltip"
        >
          <div className="px-3 py-1.5 rounded-md bg-background/90 border border-[#E7FB10]/40 text-xs shadow-lg max-w-xs">
            {edgeHover.edge.stacks.length > 1 ? (
              <div className="space-y-0.5">
                <div className="text-muted-foreground text-[0.7rem] uppercase tracking-wide">
                  Appears in {edgeHover.edge.stacks.length} stacks
                </div>
                {edgeHover.edge.stacks.map((s, i) => (
                  <div key={`${s.name}-${i}`} className="flex items-center gap-2">
                    <span className="font-medium text-[#E7FB10]">{s.name}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">synergy {s.synergyBonus}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-medium text-[#E7FB10]">{edgeHover.edge.stackName}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">synergy {edgeHover.edge.synergyBonus}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
