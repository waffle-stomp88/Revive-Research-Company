import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { X, ExternalLink, ArrowRight, Activity, Sparkles, BookOpen } from "lucide-react";
import { motion, useDragControls } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  type GalaxyNode,
  getStacksForPeptide,
} from "@/lib/galaxy-layout";
import { type KnownStack } from "@/lib/synergy-data";

const SYSTEM_GUIDE_LINKS: Record<string, { href: string; label: string }> = {
  healing: {
    href: "/guides/healing-peptides",
    label: "Tissue Repair & Healing Peptide Guide",
  },
  metabolic: {
    href: "/guides/metabolic-peptides",
    label: "AMPK, GLP-1 & Metabolic Peptide Guide",
  },
  growth: {
    href: "/guides/growth-hormone-peptides",
    label: "GH Secretagogue & Growth Hormone Peptide Guide",
  },
  cognitive: {
    href: "/guides/cognitive-peptides",
    label: "Neurotrophic & Cognitive Peptide Guide",
  },
  skin: {
    href: "/guides/skin-peptides",
    label: "Collagen & Skin Peptide Guide",
  },
  longevity: {
    href: "/guides/longevity-peptides",
    label: "Telomere & Longevity Peptide Guide",
  },
  hormonal: {
    href: "/guides/hormonal-peptides",
    label: "HPG Axis & Hormonal Peptide Guide",
  },
};

interface GalaxySidePanelProps {
  node: GalaxyNode | null;
  onClose: () => void;
  knownStacks?: KnownStack[];
}

function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < breakpoint);
    }
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}

export function GalaxySidePanel({ node, onClose, knownStacks }: GalaxySidePanelProps) {
  if (!node) return null;

  const isMobile = useIsMobile();
  const dragControls = useDragControls();
  const panelScrollRef = useRef<HTMLElement>(null);
  const isAtTopRef = useRef(true);
  const stacks = getStacksForPeptide(node.id, knownStacks);
  const accentColor = node.color;
  const borderColor = `${accentColor}60`;
  const cornerColor = `${accentColor}b3`;

  function handleDragEnd(_: unknown, info: { offset: { y: number }; velocity: { y: number } }) {
    const DISTANCE_THRESHOLD = 80;
    const VELOCITY_THRESHOLD = 400;
    if (info.offset.y > DISTANCE_THRESHOLD || info.velocity.y > VELOCITY_THRESHOLD) {
      onClose();
    }
  }

  function handleScroll() {
    const el = panelScrollRef.current;
    isAtTopRef.current = !el || el.scrollTop === 0;
  }

  function isInteractive(target: EventTarget | null): boolean {
    if (!target) return false;
    return !!(target as HTMLElement).closest('button, a, [role="button"], input, textarea, select');
  }

  function handlePanelPointerDown(e: React.PointerEvent) {
    if (!isMobile) return;
    if (isInteractive(e.target)) return;
    if (!isAtTopRef.current) return;

    // Defer drag start until we know the gesture is downward.
    // This prevents hijacking an upward "read more" scroll that starts at the top.
    const DIRECTION_THRESHOLD = 8; // px of downward movement to confirm intent
    const nativeDown = e.nativeEvent as PointerEvent;
    const startY = nativeDown.clientY;
    const pointerId = nativeDown.pointerId;

    function onMove(ev: PointerEvent) {
      if (ev.pointerId !== pointerId) return;
      const deltaY = ev.clientY - startY;
      if (deltaY > DIRECTION_THRESHOLD) {
        cleanup();
        dragControls.start(ev);
      } else if (deltaY < -DIRECTION_THRESHOLD) {
        cleanup();
      }
    }

    function onUp(ev: PointerEvent) {
      if (ev.pointerId !== pointerId) return;
      cleanup();
    }

    function cleanup() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }

  // Header drag — always fires drag start regardless of scroll position
  // so users can dismiss from anywhere in the content
  function handleHeaderPointerDown(e: React.PointerEvent) {
    if (!isMobile) return;
    if (isInteractive(e.target)) return;
    e.stopPropagation();
    dragControls.start(e);
  }

  // Mobile: slide up from bottom as a full-width drawer
  // Desktop: slide in from the right as a sidebar
  const motionProps = isMobile
    ? {
        initial: { y: "100%", opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: "100%", opacity: 0 },
        transition: { type: "spring" as const, damping: 28, stiffness: 240 },
        drag: "y" as const,
        dragControls,
        dragListener: false,
        dragConstraints: { top: 0, bottom: 0 },
        dragElastic: { top: 0, bottom: 0.35 },
        onDragEnd: handleDragEnd,
      }
    : {
        initial: { x: "100%", opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: "100%", opacity: 0 },
        transition: { type: "spring" as const, damping: 26, stiffness: 220 },
      };

  // Mobile: flex-col so the sticky header sits above the scrollable body.
  // The outer aside is NOT overflow-y-auto; only the inner body div scrolls.
  const panelClassName = isMobile
    ? "absolute bottom-0 left-0 right-0 max-h-[80vh] backdrop-blur-sm z-30 rounded-t-2xl flex flex-col"
    : "absolute top-24 md:top-28 bottom-0 right-0 w-full max-w-md backdrop-blur-sm z-30 overflow-y-auto";

  const panelStyle = isMobile
    ? {
        background: "rgba(0,0,0,0.97)",
        borderTop: `2px solid ${borderColor}`,
        borderLeft: `1px solid ${borderColor}`,
        borderRight: `1px solid ${borderColor}`,
      }
    : {
        background: "rgba(0,0,0,0.95)",
        borderLeft: `2px solid ${borderColor}`,
        borderTop: `1px solid ${borderColor}`,
      };

  // Background for the sticky mobile header so content doesn't bleed through
  const stickyHeaderStyle = {
    background: "rgba(0,0,0,0.97)",
    borderBottom: `1px solid ${borderColor}`,
  };

  return (
    <motion.aside
      {...motionProps}
      ref={!isMobile ? (panelScrollRef as React.Ref<HTMLElement>) : undefined}
      className={panelClassName}
      style={panelStyle}
      data-testid="galaxy-side-panel"
    >
      {/* Scan-line overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.018) 2px, rgba(255,255,255,0.018) 4px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Corner decorations — desktop only */}
      {!isMobile && (
        <>
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              width: 10,
              height: 10,
              borderTop: `2px solid ${cornerColor}`,
              borderLeft: `2px solid ${cornerColor}`,
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 10,
              height: 10,
              borderTop: `2px solid ${cornerColor}`,
              borderRight: `2px solid ${cornerColor}`,
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: 8,
              left: 8,
              width: 10,
              height: 10,
              borderBottom: `2px solid ${cornerColor}`,
              borderLeft: `2px solid ${cornerColor}`,
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: 8,
              right: 8,
              width: 10,
              height: 10,
              borderBottom: `2px solid ${cornerColor}`,
              borderRight: `2px solid ${cornerColor}`,
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
        </>
      )}

      {/* Sticky header for mobile drawer — always visible, drag starts dismiss regardless of scroll */}
      {isMobile && (
        <div
          className="flex-shrink-0 relative z-10"
          style={stickyHeaderStyle}
        >
          {/* Drag handle */}
          <div
            className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none select-none"
            onPointerDown={(e) => { e.stopPropagation(); dragControls.start(e); }}
            data-testid="galaxy-panel-drag-handle"
            aria-hidden="true"
          >
            <div className="w-10 h-1 rounded-full bg-white/30" />
          </div>

          {/* Title row */}
          <div
            className="flex items-start justify-between gap-3 px-5 pb-4 touch-none select-none"
            onPointerDown={handleHeaderPointerDown}
            data-testid="galaxy-panel-header"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 0 6px ${accentColor}`,
                  }}
                />
                <span
                  className="text-[9px] uppercase tracking-wider font-mono font-semibold"
                  style={{ color: accentColor }}
                >
                  &gt; {node.systemName}
                </span>
              </div>
              <h2
                className="text-2xl font-bold leading-tight text-white"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                data-testid="galaxy-panel-title"
              >
                {node.name}
              </h2>
              <p className="text-[11px] font-mono mt-1" style={{ color: `${accentColor}99` }}>
                {node.synergyCount} researched synergy link
                {node.synergyCount === 1 ? "" : "s"}
              </p>
            </div>
            {/* Close button */}
            <Button
              variant="ghost"
              onClick={onClose}
              data-testid="galaxy-panel-close"
              aria-label="Close peptide details"
              className="flex-shrink-0 flex items-center justify-center text-white/60 hover:text-white w-11 h-11 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Content body — on mobile this is the scroll container; on desktop the outer aside scrolls */}
      <div
        ref={isMobile ? (panelScrollRef as React.Ref<HTMLDivElement>) : undefined}
        className={isMobile ? "flex-1 overflow-y-auto" : "contents"}
        onScroll={isMobile ? handleScroll : undefined}
        onPointerDown={isMobile ? handlePanelPointerDown : undefined}
      >
        {/* Content — keyed to node.id for glitch-reveal on each new selection */}
        <motion.div
          key={node.id}
          initial={{ opacity: 0, filter: "blur(4px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative p-5 md:p-6"
          style={{ zIndex: 2 }}
        >
          {/* Desktop header row (on mobile this lives in the sticky section above) */}
          {!isMobile && (
            <div
              className="flex items-start justify-between gap-3 mb-5 touch-none select-none"
              onPointerDown={handleHeaderPointerDown}
              data-testid="galaxy-panel-header"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: accentColor,
                      boxShadow: `0 0 6px ${accentColor}`,
                    }}
                  />
                  <span
                    className="text-[9px] uppercase tracking-wider font-mono font-semibold"
                    style={{ color: accentColor }}
                  >
                    &gt; {node.systemName}
                  </span>
                </div>
                <h2
                  className="text-2xl font-bold leading-tight text-white"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  data-testid="galaxy-panel-title"
                >
                  {node.name}
                </h2>
                <p className="text-[11px] font-mono mt-1" style={{ color: `${accentColor}99` }}>
                  {node.synergyCount} researched synergy link
                  {node.synergyCount === 1 ? "" : "s"}
                </p>
              </div>
              {/* Close button — 44px touch target guaranteed on mobile via explicit sizing */}
              <Button
                variant="ghost"
                onClick={onClose}
                data-testid="galaxy-panel-close"
                aria-label="Close peptide details"
                className="flex-shrink-0 flex items-center justify-center text-white/60 hover:text-white w-11 h-11 md:w-9 md:h-9 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Body systems */}
          {node.systems.length > 0 && (
            <div className="mb-5">
              <p
                className="text-[9px] uppercase tracking-wider font-mono mb-2 flex items-center gap-1"
                style={{ color: accentColor }}
              >
                &gt; BODY SYSTEMS
              </p>
              <div className="flex flex-wrap gap-1.5">
                {node.systems.map((s) => (
                  <Badge
                    key={s}
                    variant="outline"
                    className="text-xs font-mono"
                    style={{
                      borderColor: `${accentColor}40`,
                      color: "rgba(255,255,255,0.75)",
                    }}
                    data-testid={`galaxy-panel-system-${s.toLowerCase()}`}
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Pathways */}
          {node.pathways.length > 0 && (
            <div className="mb-5">
              <p
                className="text-[9px] uppercase tracking-wider font-mono mb-2 flex items-center gap-1.5"
                style={{ color: accentColor }}
              >
                &gt; PATHWAYS
                <Activity className="h-3 w-3" />
              </p>
              <ul className="space-y-1">
                {node.pathways.map((p) => (
                  <li
                    key={p}
                    className="text-sm flex items-center gap-2 text-white/70"
                  >
                    <span
                      className="inline-block w-1 h-1 rounded-full flex-shrink-0"
                      style={{ backgroundColor: accentColor }}
                    />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mechanisms */}
          {node.mechanisms.length > 0 && (
            <div className="mb-5">
              <p
                className="text-[9px] uppercase tracking-wider font-mono mb-2 flex items-center gap-1.5"
                style={{ color: accentColor }}
              >
                &gt; MECHANISMS
                <Sparkles className="h-3 w-3" />
              </p>
              <ul className="space-y-1">
                {node.mechanisms.map((m) => (
                  <li key={m} className="text-sm text-white/50">
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Synergies */}
          {stacks.length > 0 && (
            <div className="mb-5">
              <p
                className="text-[9px] uppercase tracking-wider font-mono mb-2"
                style={{ color: accentColor }}
              >
                &gt; SYNERGIES
              </p>
              <div className="space-y-2">
                {stacks.map((s) => {
                  const detailId = (s as typeof s & { detailPageId?: string }).detailPageId;
                  const partners = s.peptides
                    .filter(
                      (p) =>
                        p.toLowerCase().replace(/[^a-z0-9]/g, "") !==
                        node.id.toLowerCase().replace(/[^a-z0-9]/g, "")
                    )
                    .join(" + ");
                  const inner = (
                    <div
                      className="flex items-center justify-between gap-3 rounded-md p-3 hover-elevate cursor-pointer"
                      style={{
                        background: `${accentColor}0d`,
                        border: `1px solid ${accentColor}30`,
                      }}
                      data-testid={`galaxy-panel-synergy-${detailId ?? s.name.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate text-white/90">{s.name}</p>
                        <p className="text-xs truncate font-mono" style={{ color: `${accentColor}80` }}>
                          with {partners}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className="text-xs font-mono"
                          style={{ color: s.color }}
                        >
                          {s.synergyBonus}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-white/30" />
                      </div>
                    </div>
                  );
                  return detailId ? (
                    <Link
                      key={s.name}
                      href={`/research-stacks/${detailId}`}
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div key={s.name}>{inner}</div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div
            className="space-y-2 pt-2"
            style={{ borderTop: `1px solid ${accentColor}30` }}
          >
            <Link href={`/peptides/${node.slug}`}>
              <Button
                size="default"
                className="w-full bg-[#D4FF1F] text-black hover:bg-[#D4FF1F]/90"
                data-testid="galaxy-panel-view-product"
              >
                View {node.name} product
                <ExternalLink className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>

            {/* System-specific guide link — check all systems, not just the primary */}
            {(() => {
              const matchedKey = node.systems
                .map((s) => s.toLowerCase())
                .find((s) => SYSTEM_GUIDE_LINKS[s]);
              const guide = matchedKey ? SYSTEM_GUIDE_LINKS[matchedKey] : undefined;
              if (!guide) return null;
              return (
                <Link href={guide.href}>
                  <Button
                    size="default"
                    variant="outline"
                    className="w-full"
                    style={{
                      borderColor: `${accentColor}50`,
                      color: accentColor,
                    }}
                    data-testid="galaxy-panel-guide-link"
                  >
                    <BookOpen className="h-4 w-4 mr-1.5" />
                    {guide.label}
                  </Button>
                </Link>
              );
            })()}
          </div>
        </motion.div>
      </div>
    </motion.aside>
  );
}
