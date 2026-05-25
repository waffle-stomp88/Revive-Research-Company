import { lazy, Suspense, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, ArrowRight, Volume2, VolumeX, Search, X, Zap, Pause, Play, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo-head";
import { BODY_SYSTEMS } from "@/data/body-systems";
import {
  buildGalaxyLayout,
  type GalaxyNode,
} from "@/lib/galaxy-layout";
import { type KnownStack, KNOWN_STACKS } from "@/lib/synergy-data";
import type { ResearchStackApiResponse } from "@/lib/research-stacks-api";
import { GalaxySvgFallback } from "@/components/galaxy/galaxy-svg-fallback";
import { GalaxyFilterBar } from "@/components/galaxy/galaxy-filter-bar";
import { GalaxySidePanel } from "@/components/galaxy/galaxy-side-panel";
import { resolveVfxVariant } from "@/components/galaxy/galaxy-vfx-config";
import { useGalaxyAudio } from "@/hooks/useGalaxyAudio";
import { GalaxyHyperspaceOverlay } from "@/components/galaxy/galaxy-hyperspace-overlay";
import { GalaxyHoverHUD } from "@/components/galaxy/galaxy-hover-hud";
import { WarpBanner } from "@/components/galaxy/galaxy-warp-banner";
import { GalaxyMobileOnboarding, isTouchDevice } from "@/components/galaxy/galaxy-mobile-onboarding";
import { GalaxyMobileSearch, GalaxyMobileSearchTrigger } from "@/components/galaxy/galaxy-mobile-search";
import { useRecentGalaxySearches } from "@/hooks/useRecentGalaxySearches";

const GalaxyScene = lazy(() =>
  import("@/components/galaxy/galaxy-scene").then((m) => ({
    default: m.GalaxyScene,
  }))
);

function detectWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    return !!gl;
  } catch {
    return false;
  }
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type EntryPhase = "loading" | "entry" | "done";

export default function GalaxyPage() {
  const allSystems = useMemo(() => new Set(BODY_SYSTEMS.map((s) => s.id)), []);
  const [visibleSystems, setVisibleSystems] = useState<Set<string>>(allSystems);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchActiveIdx, setSearchActiveIdx] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchListRef = useRef<HTMLUListElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [warpToId, setWarpToId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [rotationPaused, setRotationPaused] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(0.45);
  const [forceFallback, setForceFallback] = useState(false);
  const [nodeMeta, setNodeMeta] = useState<GalaxyNode[]>([]);
  const [warpingToNode, setWarpingToNode] = useState<GalaxyNode | null>(null);
  const [warpNonce, setWarpNonce] = useState(0);
  const [hoveredScreenPos, setHoveredScreenPos] = useState<{ x: number; y: number } | null>(null);
  const prevScreenPosRef = useRef<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Recent warp history (sessionStorage)
  const [recentSearchIds, addRecentSearch, clearRecentSearches] = useRecentGalaxySearches();

  // Mobile / touch detection
  const [isTouch] = useState(() => isTouchDevice());
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  useEffect(() => {
    function onResize() { setViewportWidth(window.innerWidth); }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  // Page Visibility API — pause rotation when tab is hidden
  const [pageVisible, setPageVisible] = useState(true);
  useEffect(() => {
    function handleVisibility() {
      setPageVisible(!document.hidden);
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Audio hook
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);

  // Reduce effects when: touch device OR very small screen (<= 640px) OR prefers-reduced-motion
  // (prefers-reduced-motion forces fallback normally, but may be in 3D via force3d=1 param)
  const reduceEffects = isTouch || viewportWidth <= 640 || reducedMotion;
  // Drop core billboard layers entirely on very narrow screens (< 400px)
  const ultraSmall = viewportWidth < 400;
  const audio = useGalaxyAudio();
  const ambientStarted = useRef(false);

  const doEntry = useMemo(() => !reducedMotion, [reducedMotion]);

  const [entryPhase, setEntryPhase] = useState<EntryPhase>("loading");
  const entryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [useFallback, setUseFallback] = useState<boolean | null>(null);
  const [fallbackReason, setFallbackReason] = useState<
    "reduced-motion" | "no-webgl" | null
  >(null);
  useEffect(() => {
    const params = new URLSearchParams(
      typeof window === "undefined" ? "" : window.location.search
    );
    const force3d = params.get("force3d") === "1";
    if (force3d) {
      setUseFallback(false);
      setFallbackReason(null);
      return;
    }
    const noWebGL = !detectWebGL();
    const rm = prefersReducedMotion();
    if (noWebGL) {
      setFallbackReason("no-webgl");
      setUseFallback(true);
    } else if (rm) {
      setFallbackReason("reduced-motion");
      setUseFallback(true);
    } else {
      setFallbackReason(null);
      setUseFallback(false);
    }
  }, []);

  const handleSceneLoaded = useCallback(() => {
    if (!doEntry) {
      setEntryPhase("done");
      return;
    }
    setEntryPhase("entry");
    entryTimerRef.current = setTimeout(() => setEntryPhase("done"), 4800);
  }, [doEntry]);

  useEffect(() => {
    return () => {
      if (entryTimerRef.current) clearTimeout(entryTimerRef.current);
    };
  }, []);

  const [location] = useLocation();

  const [vfxVariant, setVfxVariant] = useState(() => {
    if (typeof window === "undefined") return resolveVfxVariant(null);
    const params = new URLSearchParams(window.location.search);
    return resolveVfxVariant(params.get("vfx"));
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setVfxVariant(resolveVfxVariant(params.get("vfx")));
  }, [location]);

  const { data: stacksApiData } = useQuery<ResearchStackApiResponse[]>({
    queryKey: ["/api/research-stacks"],
  });

  const knownStacksFromApi: KnownStack[] = useMemo(() => {
    if (!stacksApiData || stacksApiData.length === 0) return KNOWN_STACKS;
    return stacksApiData.map((s) => ({
      name: s.name,
      peptides: s.peptideIds,
      icon: Sparkles,
      color: s.color,
      description: s.description,
      synergyBonus: s.synergyBonus,
      detailPageId: s.detailPageId ?? undefined,
    }));
  }, [stacksApiData]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const target = params.get("peptide");
    if (!target) return;
    const layout = buildGalaxyLayout(knownStacksFromApi);
    const norm = (s: string) =>
      s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const t = norm(target);
    const match = layout.nodes.find(
      (n) => n.id === target || n.slug === t || norm(n.id) === t
    );
    if (match) setSelectedId(match.id);
  }, [location, knownStacksFromApi]);

  const layout = useMemo(() => buildGalaxyLayout(knownStacksFromApi), [knownStacksFromApi]);
  const handleNodeMeta = useCallback((nodes: GalaxyNode[]) => {
    setNodeMeta(nodes);
  }, []);
  const nodes = nodeMeta.length > 0 ? nodeMeta : layout.nodes;
  const selectedNode = useMemo(
    () => (selectedId ? nodes.find((n) => n.id === selectedId) ?? null : null),
    [selectedId, nodes]
  );
  const hoveredNode = useMemo(
    () => (hoveredId ? nodes.find((n) => n.id === hoveredId) ?? null : null),
    [hoveredId, nodes]
  );

  const toggleSystem = useCallback((id: string) => {
    setVisibleSystems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setVisibleSystems(new Set(BODY_SYSTEMS.map((s) => s.id)));
    setSearchTerm("");
    setSelectedId(null);
    setResetSignal((n) => n + 1);
  }, []);

  const handleWarpTo = useCallback((id: string) => {
    setSelectedId(id);
    setWarpToId(id);
  }, []);

  const handleWarpStart = useCallback((node: GalaxyNode) => {
    setWarpingToNode(node);
    setWarpNonce((n) => n + 1);
  }, []);

  // Throttled screen-pos handler: only update React state when pos changes by >1px
  const handleHoveredScreenPos = useCallback(
    (pos: { x: number; y: number } | null) => {
      if (pos === null) {
        if (prevScreenPosRef.current !== null) {
          prevScreenPosRef.current = null;
          setHoveredScreenPos(null);
        }
        return;
      }
      const prev = prevScreenPosRef.current;
      if (prev && Math.abs(prev.x - pos.x) < 1.5 && Math.abs(prev.y - pos.y) < 1.5) return;
      prevScreenPosRef.current = pos;
      setHoveredScreenPos({ x: pos.x, y: pos.y });
    },
    []
  );

  // Inline galaxy search helpers
  const searchLower = searchTerm.trim().toLowerCase();
  const searchMatches = useMemo(
    () =>
      searchLower.length === 0
        ? []
        : nodes
            .filter(
              (n) =>
                n.name.toLowerCase().includes(searchLower) ||
                n.id.toLowerCase().includes(searchLower) ||
                n.systemName.toLowerCase().includes(searchLower)
            )
            .slice(0, 8),
    [nodes, searchLower]
  );
  const desktopRecentNodes = useMemo(
    () =>
      recentSearchIds
        .map((id) => nodes.find((n) => n.id === id))
        .filter((n): n is GalaxyNode => !!n),
    [recentSearchIds, nodes]
  );
  const showSearchDropdown =
    searchOpen &&
    (searchMatches.length > 0 ||
      (searchLower.length === 0 && desktopRecentNodes.length > 0));

  const handleSearchSelect = useCallback(
    (id: string) => {
      addRecentSearch(id);
      handleWarpTo(id);
      setSearchTerm("");
      setSearchOpen(false);
      setSearchActiveIdx(-1);
      searchInputRef.current?.blur();
    },
    [handleWarpTo, addRecentSearch]
  );

  const handleFallbackSearchSelect = useCallback((id: string) => {
    const el = document.getElementById(`fallback-node-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("fallback-node-highlight");
      setTimeout(() => el.classList.remove("fallback-node-highlight"), 1800);
    }
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSearchDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSearchActiveIdx((i) => Math.min(i + 1, searchMatches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSearchActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (searchActiveIdx >= 0 && searchMatches[searchActiveIdx]) {
        e.preventDefault();
        handleSearchSelect(searchMatches[searchActiveIdx].id);
      }
    } else if (e.key === "Escape") {
      setSearchOpen(false);
    }
  };

  useEffect(() => {
    setSearchActiveIdx(-1);
  }, [searchTerm]);

  useEffect(() => {
    if (searchActiveIdx >= 0 && searchListRef.current) {
      const item = searchListRef.current.children[searchActiveIdx] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [searchActiveIdx]);

  const handleCanvasFirstClick = useCallback(() => {
    if (ambientStarted.current || reducedMotion) return;
    ambientStarted.current = true;
    audio.startAmbient();
  }, [audio, reducedMotion]);

  const showFallback = forceFallback || useFallback === true;
  const uiVisible = entryPhase === "done";

  const handleTry3D = useCallback(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.set("force3d", "1");
      if (!params.get("vfx")) params.set("vfx", "minimal");
      const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
      window.history.replaceState({}, "", newUrl);
      setVfxVariant(resolveVfxVariant(params.get("vfx")));
    } else {
      setVfxVariant(resolveVfxVariant("minimal"));
    }
    setForceFallback(false);
    setUseFallback(false);
    setFallbackReason(null);
  }, []);

  // Compute canvas dimensions for HUD positioning
  const [canvasDims, setCanvasDims] = useState({ w: 0, h: 0 });
  useEffect(() => {
    function updateDims() {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setCanvasDims({ w: rect.width, h: rect.height });
      }
    }
    updateDims();
    window.addEventListener("resize", updateDims);
    return () => window.removeEventListener("resize", updateDims);
  }, []);

  return (
    <main
      className={`min-h-screen ${vfxVariant === "cinematic" ? "bg-black" : "bg-[#0d0d10]"} text-foreground relative`}
      data-testid="page-galaxy"
    >
      {/* Mobile welcome overlay — touch devices only, once per session */}
      <GalaxyMobileOnboarding onDismiss={() => {}} />

      <SEOHead
        title="Peptide Synergy Galaxy"
        description="Explore every research peptide as a star in a 3D galaxy. Discover synergy connections between peptides, filter by body system, and find researched stack combinations."
        canonicalPath="/galaxy"
        ogImage="https://reviveresearch.co/assets/logo.png"
      />

      {/* Header strip — fades in after entry */}
      <motion.div
        className="absolute top-0 left-0 right-0 z-20 pt-24 md:pt-28 pb-3 px-4 md:px-8 pointer-events-none"
        animate={{ opacity: uiVisible || showFallback ? 1 : 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ pointerEvents: uiVisible || showFallback ? undefined : "none" }}
      >
        <div className="max-w-7xl mx-auto flex items-end justify-between gap-4 flex-wrap">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="pointer-events-auto"
          >
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D4FF1F]/10 border border-[#D4FF1F]/30 mb-2">
              <Sparkles className="h-3 w-3 text-[#D4FF1F]" />
              <span className="text-[10px] uppercase tracking-wider font-mono font-semibold text-[#D4FF1F]">
                Synergy Galaxy
              </span>
            </div>
            <h1 className="font-mono text-2xl md:text-3xl font-bold leading-tight tracking-tight">
              The Peptide Universe
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground max-w-md mt-0.5 font-mono">
              Each star is a peptide. Lines connect researched synergy pairs.
              Drag to orbit · click a star to inspect.
            </p>

            {/* Inline galaxy search — desktop only; mobile uses the bottom-sheet */}
            {uiVisible && !isTouch && (
              <div className="relative mt-3 w-64" data-testid="galaxy-inline-search-wrap">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none z-10" />
                <Input
                  ref={searchInputRef}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Find a peptide — warp to it"
                  className="h-9 pl-8 pr-8 text-sm font-mono bg-black/50 border-white/15 backdrop-blur-sm placeholder:text-white/30 focus-visible:border-[#21d8ff]/50 focus-visible:ring-0"
                  data-testid="galaxy-search-input"
                  aria-label="Search peptides"
                  aria-autocomplete="list"
                  aria-expanded={showSearchDropdown}
                  role="combobox"
                />
                {searchTerm && (
                  <button
                    onMouseDown={(e) => { e.preventDefault(); setSearchTerm(""); setSearchOpen(false); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
                    aria-label="Clear search"
                    data-testid="galaxy-search-clear"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}

                {/* Autocomplete / Recent dropdown */}
                {showSearchDropdown && (
                  <div
                    className="absolute left-0 right-0 top-[calc(100%+4px)] rounded-lg bg-black/90 backdrop-blur-xl border border-white/10 shadow-xl overflow-hidden z-30"
                    data-testid="galaxy-search-dropdown"
                  >
                    {searchLower.length === 0 && desktopRecentNodes.length > 0 ? (
                      <>
                        <div className="flex items-center gap-1.5 px-3 pt-2 pb-1">
                          <Clock className="h-3 w-3 text-white/30" />
                          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-white/30 flex-1">
                            Recent
                          </span>
                          <button
                            onMouseDown={(e) => {
                              e.preventDefault();
                              clearRecentSearches();
                            }}
                            className="text-xs font-mono text-white/30 hover:text-white/60 transition-colors"
                            aria-label="Clear recent searches"
                            data-testid="galaxy-search-clear-recent"
                          >
                            Clear
                          </button>
                        </div>
                        <ul
                          ref={searchListRef}
                          role="listbox"
                          data-testid="galaxy-search-recent-list"
                        >
                          {desktopRecentNodes.map((node, i) => (
                            <li
                              key={node.id}
                              role="option"
                              aria-selected={i === searchActiveIdx}
                              onMouseDown={() => handleSearchSelect(node.id)}
                              onMouseEnter={() => setSearchActiveIdx(i)}
                              className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                                i === searchActiveIdx
                                  ? "bg-white/10"
                                  : "hover:bg-white/5"
                              }`}
                              data-testid={`galaxy-search-recent-${node.id}`}
                            >
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: node.color }}
                              />
                              <span className="flex-1 min-w-0">
                                <span className="text-sm font-mono font-medium text-white/90 truncate block">
                                  {node.name}
                                </span>
                                <span className="text-xs font-mono text-white/40">
                                  {node.systemName}
                                </span>
                              </span>
                              <Zap className="h-3 w-3 flex-shrink-0 opacity-40" style={{ color: node.color }} />
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <ul
                        ref={searchListRef}
                        role="listbox"
                      >
                        {searchMatches.map((node, i) => (
                          <li
                            key={node.id}
                            role="option"
                            aria-selected={i === searchActiveIdx}
                            onMouseDown={() => handleSearchSelect(node.id)}
                            onMouseEnter={() => setSearchActiveIdx(i)}
                            className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                              i === searchActiveIdx
                                ? "bg-white/10"
                                : "hover:bg-white/5"
                            }`}
                            data-testid={`galaxy-search-result-${node.id}`}
                          >
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: node.color }}
                            />
                            <span className="flex-1 min-w-0">
                              <span className="text-sm font-mono font-medium text-white/90 truncate block">
                                {node.name}
                              </span>
                              <span className="text-xs font-mono text-white/40">
                                {node.systemName}
                              </span>
                            </span>
                            <Zap className="h-3 w-3 flex-shrink-0 opacity-50" style={{ color: node.color }} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Mobile full-screen search modal — touch devices only */}
      {isTouch && (
        <GalaxyMobileSearch
          nodes={nodes}
          onSelect={showFallback ? handleFallbackSearchSelect : handleSearchSelect}
          open={mobileSearchOpen}
          onClose={() => setMobileSearchOpen(false)}
          recentIds={recentSearchIds}
          onClearRecent={clearRecentSearches}
        />
      )}

      {/* Mobile search trigger for SVG fallback — fixed to viewport bottom-right */}
      {isTouch && showFallback && (
        <GalaxyMobileSearchTrigger
          visible={true}
          onClick={() => setMobileSearchOpen(true)}
        />
      )}

      {/* Galaxy canvas / fallback */}
      {useFallback === null ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#D4FF1F]" />
        </div>
      ) : showFallback ? (
        <div className="pt-32 md:pt-36 pb-12">
          <GalaxySvgFallback
            onTry3D={
              fallbackReason === "reduced-motion" || forceFallback
                ? handleTry3D
                : undefined
            }
            try3DReason={
              fallbackReason === "reduced-motion"
                ? "reduced-motion"
                : forceFallback
                ? "error"
                : null
            }
            knownStacks={knownStacksFromApi}
          />
        </div>
      ) : (
        <>
          {/* Filter bar — fades in after entry */}
          <motion.div
            animate={{ opacity: uiVisible ? 1 : 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ pointerEvents: uiVisible ? undefined : "none" }}
          >
            <GalaxyFilterBar
              visibleSystems={visibleSystems}
              toggleSystem={toggleSystem}
              onReset={handleReset}
            />
          </motion.div>

          {/* Canvas wrapper — captures first click to start ambient audio */}
          <div
            ref={canvasRef}
            className="absolute inset-0"
            onClick={handleCanvasFirstClick}
          >
            <Suspense
              fallback={
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  data-testid="galaxy-loading"
                >
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-[#D4FF1F]" />
                    <p className="text-xs font-mono text-muted-foreground">
                      Loading constellation...
                    </p>
                  </div>
                </div>
              }
            >
              <ErrorBoundary onError={() => setForceFallback(true)}>
                <GalaxyScene
                  visibleSystemIds={visibleSystems}
                  searchTerm={searchTerm}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  hoveredId={hoveredId}
                  onHover={setHoveredId}
                  onNodeMeta={handleNodeMeta}
                  resetSignal={resetSignal}
                  vfxVariant={vfxVariant}
                  onLoaded={handleSceneLoaded}
                  doEntry={doEntry}
                  onWarp={audio.playWarp}
                  onHoverSound={audio.playHover}
                  externalWarpId={warpToId}
                  onExternalWarpConsumed={() => setWarpToId(null)}
                  rotationPaused={rotationPaused || !pageVisible}
                  rotationSpeed={rotationSpeed}
                  onHoveredScreenPos={handleHoveredScreenPos}
                  onWarpStart={handleWarpStart}
                  knownStacks={knownStacksFromApi}
                  reduceEffects={reduceEffects}
                  reduceCoreLayers={ultraSmall}
                />
              </ErrorBoundary>
            </Suspense>
          </div>

          {/* Hyperspace overlay — 2D canvas that draws radial streak lines during entry */}
          {doEntry && (
            <GalaxyHyperspaceOverlay
              isActive={entryPhase !== "done"}
              totalDurationMs={3800}
            />
          )}

          {/* Hover HUD — targeting brackets + telemetry panel */}
          {uiVisible && (
            <GalaxyHoverHUD
              hoveredNode={hoveredNode}
              hoveredScreenPos={hoveredScreenPos}
              canvasWidth={canvasDims.w}
              canvasHeight={canvasDims.h}
            />
          )}

          {/* Mobile search trigger — touch devices only */}
          {isTouch && (
            <GalaxyMobileSearchTrigger
              visible={uiVisible}
              onClick={() => setMobileSearchOpen(true)}
            />
          )}

          {/* Warp flash banner */}
          <WarpBanner warpingToNode={warpingToNode} warpNonce={warpNonce} />

          <AnimatePresence>
            {selectedNode && (
              <GalaxySidePanel
                node={selectedNode}
                onClose={() => {
                    setSelectedId(null);
                    setResetSignal((n) => n + 1);
                  }}
                knownStacks={knownStacksFromApi}
              />
            )}
          </AnimatePresence>

          {/* Bottom-left controls: mute · pause/resume · speed */}
          <motion.div
            className="absolute bottom-3 md:bottom-4 left-4 md:left-8 z-20 flex items-center gap-1.5"
            animate={{ opacity: uiVisible ? 1 : 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ pointerEvents: uiVisible ? undefined : "none" }}
          >
            {/* Mute */}
            <Button
              size="icon"
              variant="ghost"
              onClick={audio.toggleMute}
              aria-label={audio.isMuted ? "Unmute ambient sound" : "Mute ambient sound"}
              data-testid="button-galaxy-mute"
              className="text-white/50 hover:text-white/90 bg-black/40 backdrop-blur-sm"
            >
              {audio.isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>

            {/* Divider */}
            <div className="w-px h-5 bg-white/20 mx-0.5" />

            {/* Pause / Resume rotation */}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setRotationPaused((p) => !p)}
              aria-label={rotationPaused ? "Resume rotation" : "Pause rotation"}
              data-testid="button-galaxy-rotation-pause"
              className="text-white/50 hover:text-white/90 bg-black/40 backdrop-blur-sm"
            >
              {rotationPaused ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
            </Button>

            {/* Speed slider */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-black/40 backdrop-blur-sm"
              data-testid="galaxy-rotation-speed-control"
            >
              <span className="text-[10px] font-mono text-white/40 select-none whitespace-nowrap">Speed</span>
              <input
                type="range"
                min={0.05}
                max={3}
                step={0.05}
                value={rotationSpeed}
                onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                disabled={rotationPaused}
                aria-label="Rotation speed"
                data-testid="slider-galaxy-rotation-speed"
                className="w-20 accent-[#D4FF1F] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              />
              <span className="text-[10px] font-mono text-white/50 w-6 text-right select-none tabular-nums">
                {rotationSpeed.toFixed(1)}×
              </span>
            </div>
          </motion.div>

          {/* Bottom hints — fades in after entry; touch-specific copy on mobile */}
          <motion.div
            className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
            animate={{ opacity: uiVisible ? 1 : 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="px-3 py-1.5 rounded-full bg-background/70 backdrop-blur-md border border-border text-[10px] font-mono text-muted-foreground whitespace-nowrap">
              {isTouch
                ? "Drag to orbit · pinch to zoom · tap a star to inspect"
                : "Drag to orbit · scroll to zoom · click a star to inspect · double-click to warp in"}
            </div>
          </motion.div>

          {/* Stacks link — fades in after entry */}
          <motion.div
            className="absolute bottom-3 md:bottom-4 right-4 md:right-8 z-10"
            animate={{ opacity: uiVisible ? 1 : 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ pointerEvents: uiVisible ? undefined : "none" }}
          >
            <Link href="/research-stacks">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 font-mono"
                data-testid="galaxy-view-all-stacks"
              >
                View all stacks
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </motion.div>
        </>
      )}
    </main>
  );
}

import { Component, type ReactNode } from "react";

class ErrorBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
