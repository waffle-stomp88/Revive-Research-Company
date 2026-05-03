import { lazy, Suspense, useEffect, useMemo, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo-head";
import { BODY_SYSTEMS } from "@/data/body-systems";
import {
  buildGalaxyLayout,
  type GalaxyNode,
} from "@/lib/galaxy-layout";
import { GalaxySvgFallback } from "@/components/galaxy/galaxy-svg-fallback";
import { GalaxyFilterBar } from "@/components/galaxy/galaxy-filter-bar";
import { GalaxySidePanel } from "@/components/galaxy/galaxy-side-panel";
import { resolveVfxVariant } from "@/components/galaxy/galaxy-vfx-config";

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

export default function GalaxyPage() {
  const allSystems = useMemo(() => new Set(BODY_SYSTEMS.map((s) => s.id)), []);
  const [visibleSystems, setVisibleSystems] = useState<Set<string>>(allSystems);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const [forceFallback, setForceFallback] = useState(false);
  const [nodeMeta, setNodeMeta] = useState<GalaxyNode[]>([]);

  // Decide rendering path on mount
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
    const reducedMotion = prefersReducedMotion();
    if (noWebGL) {
      setFallbackReason("no-webgl");
      setUseFallback(true);
    } else if (reducedMotion) {
      setFallbackReason("reduced-motion");
      setUseFallback(true);
    } else {
      setFallbackReason(null);
      setUseFallback(false);
    }
  }, []);

  // Deep-link via ?peptide=<slug-or-id> to auto-open a side panel
  const [location] = useLocation();

  // VFX variant via ?vfx=cinematic|minimal (defaults to cinematic)
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const target = params.get("peptide");
    if (!target) return;
    const layout = buildGalaxyLayout();
    const norm = (s: string) =>
      s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const t = norm(target);
    const match = layout.nodes.find(
      (n) => n.id === target || n.slug === t || norm(n.id) === t
    );
    if (match) setSelectedId(match.id);
  }, [location]);

  // Surface node list for the side panel
  const layout = useMemo(() => buildGalaxyLayout(), []);
  const handleNodeMeta = useCallback((nodes: GalaxyNode[]) => {
    setNodeMeta(nodes);
  }, []);
  const nodes = nodeMeta.length > 0 ? nodeMeta : layout.nodes;
  const selectedNode = useMemo(
    () => (selectedId ? nodes.find((n) => n.id === selectedId) ?? null : null),
    [selectedId, nodes]
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

  const showFallback = forceFallback || useFallback === true;

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

  return (
    <main
      className="min-h-screen bg-[#0d0d10] text-foreground relative"
      data-testid="page-galaxy"
    >
      <SEOHead
        title="Peptide Synergy Galaxy"
        description="Explore every research peptide as a star in a 3D galaxy. Discover synergy connections between peptides, filter by body system, and find researched stack combinations."
        canonicalPath="/galaxy"
        ogImage="https://reviveresearch.co/assets/logo.png"
      />

      {/* Header strip */}
      <div className="absolute top-0 left-0 right-0 z-20 pt-24 md:pt-28 pb-3 px-4 md:px-8 pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-end justify-between gap-4 flex-wrap">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="pointer-events-auto"
          >
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E7FB10]/10 border border-[#E7FB10]/30 mb-2">
              <Sparkles className="h-3 w-3 text-[#E7FB10]" />
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#E7FB10]">
                Synergy Galaxy
              </span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold leading-tight">
              The Peptide Universe
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground max-w-md mt-0.5">
              Each star is a peptide. Lines connect researched synergy pairs.
              Drag to orbit, click a star to inspect.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Galaxy canvas / fallback */}
      {useFallback === null ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#E7FB10]" />
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
          />
        </div>
      ) : (
        <>
          <GalaxyFilterBar
            visibleSystems={visibleSystems}
            toggleSystem={toggleSystem}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onReset={handleReset}
          />

          <Suspense
            fallback={
              <div
                className="absolute inset-0 flex items-center justify-center"
                data-testid="galaxy-loading"
              >
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-[#E7FB10]" />
                  <p className="text-xs text-muted-foreground">
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
              />
            </ErrorBoundary>
          </Suspense>

          <AnimatePresence>
            {selectedNode && (
              <GalaxySidePanel
                node={selectedNode}
                onClose={() => setSelectedId(null)}
              />
            )}
          </AnimatePresence>

          {/* Bottom hint strip */}
          <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <div className="px-3 py-1.5 rounded-full bg-background/70 backdrop-blur-md border border-border text-[10px] text-muted-foreground">
              Drag to orbit · scroll to zoom · click a star to inspect · double-click to warp in
            </div>
          </div>

          {/* Discover stacks footer link */}
          <div className="absolute bottom-3 md:bottom-4 right-4 md:right-8 z-10">
            <Link href="/research-stacks">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                data-testid="galaxy-view-all-stacks"
              >
                View all stacks
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
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
