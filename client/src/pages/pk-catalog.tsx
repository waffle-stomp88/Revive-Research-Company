import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Activity,
  ArrowLeft,
  ArrowLeftRight,
  AlertTriangle,
  ArrowUpDown,
  Clock,
  Download,
  GitCompareArrows,
  Info,
  Layers,
  Link2,
  Search,
  SortAsc,
  SortDesc,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SEOHead } from "@/components/seo-head";
import { PEPTIDE_HALF_LIVES, getCitationQuality } from "@/data/pharmacokinetics";
import type { HalfLifeEntry } from "@/data/pharmacokinetics";
import { isEstimatedLabel, formatPKLabel, getEstimateTooltip, getEstimateShortLabel } from "@/lib/pk-label";
import { MiniPKChart } from "@/components/mini-pk-chart";
import { ARTICLE_VISUAL_SLUGS } from "@/pages/education";

// Exclude composite multi-peptide stacks from the catalog
const COMPOSITE_SLUGS = new Set([
  "bpc-157-tb-500-stack",
  "cjc-1295-ipamorelin-stack",
  "glow-peptide-complex",
  "klow-peptide-complex",
  "cag-sema-blend",
]);

const CATALOG_ENTRIES = PEPTIDE_HALF_LIVES.filter(
  (e) => !COMPOSITE_SLUGS.has(e.slug)
);

type SortKey = "name" | "half-life" | "route";
type SortDir = "asc" | "desc";
type RouteFilter = "all" | "subcutaneous" | "intravenous" | "intranasal" | "oral" | "topical";
type DualRouteFilter = "all" | "dual-only";
type DurationFilter = "all" | "short" | "medium" | "long";

// Canonical section order for the group-by-system view.
// Any compound whose bodySystem is not in this list falls under "Other".
const SYSTEM_ORDER = [
  "Healing",
  "Metabolic",
  "Growth",
  "Cognitive",
  "Skin",
  "Longevity",
  "Hormonal",
  "Immune",
] as const;

type CanonicalSystem = typeof SYSTEM_ORDER[number];

const SYSTEM_COLORS: Record<CanonicalSystem, string> = {
  Healing:   "#21d8ff",
  Metabolic: "#E7FB10",
  Growth:    "#a78bfa",
  Cognitive: "#34d399",
  Skin:      "#f472b6",
  Longevity: "#fbbf24",
  Hormonal:  "#fb923c",
  Immune:    "#60a5fa",
};

const ROUTE_ABBREV: Record<string, string> = {
  subcutaneous: "SC",
  intravenous: "IV",
  intranasal: "IN",
  oral: "Oral",
  topical: "Topical",
};

const ROUTE_COLORS: Record<string, { bg: string; text: string; border: string; hex: string }> = {
  subcutaneous: { bg: "bg-[#21d8ff]/10", text: "text-[#21d8ff]", border: "border-[#21d8ff]/30", hex: "#21d8ff" },
  intravenous:  { bg: "bg-purple-500/10",  text: "text-purple-400",  border: "border-purple-500/30", hex: "#a78bfa" },
  intranasal:   { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30", hex: "#34d399" },
  oral:         { bg: "bg-amber-500/10",   text: "text-amber-400",   border: "border-amber-500/30", hex: "#fbbf24" },
  topical:      { bg: "bg-pink-500/10",    text: "text-pink-400",    border: "border-pink-500/30", hex: "#f472b6" },
};

function routeColor(route: string) {
  return ROUTE_COLORS[route.toLowerCase()] ?? { bg: "bg-white/5", text: "text-muted-foreground", border: "border-white/10", hex: "#ffffff33" };
}

function pkMidpointMin(entry: HalfLifeEntry): number {
  if (entry.halfLifeMin !== undefined && entry.halfLifeMax !== undefined) {
    return (entry.halfLifeMin + entry.halfLifeMax) / 2;
  }
  return entry.halfLifeMin ?? entry.halfLifeMax ?? Infinity;
}

// Duration bar helpers
// Log-scale ceiling at 24 h (1440 min) — compounds ≥ 24 h get a full bar.
// Using log scale so short-acting compounds still show a visible bar.
const BAR_CEILING_MIN = 1440;
function pkBarPct(entry: HalfLifeEntry): number {
  const mid = pkMidpointMin(entry);
  if (!isFinite(mid) || mid <= 0) return 0;
  return Math.min(Math.log(mid + 1) / Math.log(BAR_CEILING_MIN + 1), 1) * 100;
}

// Duration bucket thresholds (minutes)
const DURATION_THRESHOLDS = { short: 30, medium: 360 } as const;

/** Returns the plain-language summary for the indirect-evidence popover.
 *  Prefers the dedicated `shortNote` field; falls back to extracting the first
 *  1–2 sentences from `entry.note` when `shortNote` is absent. */
function getIndirectNote(entry: HalfLifeEntry): string {
  if (entry.shortNote?.trim()) {
    const s = entry.shortNote.trim();
    return s.endsWith(".") ? s : s + ".";
  }
  const raw = entry.note?.trim();
  if (!raw) {
    return "No direct plasma concentration data. Half-life is inferred from indirect or analogous-compound evidence.";
  }
  // Split on sentence boundaries (". " or ".\n") and take the first two sentences.
  const sentences = raw.split(/\.(?:\s|\n)+/).filter(Boolean);
  const preview = sentences.slice(0, 2).join(". ").trim();
  // Ensure it ends with a period.
  return preview.endsWith(".") ? preview : preview + ".";
}

function hasDualRoute(entry: HalfLifeEntry): boolean {
  return !!(entry.altRoute && entry.altRoute.halfLifeMin !== undefined);
}

function hasIvOverlay(entry: HalfLifeEntry): boolean {
  return !!entry.ivHalfLifeLabel;
}

// True when the compound has an IV vs SC contrast that's meaningfully shown
function hasRouteContrast(entry: HalfLifeEntry): boolean {
  return hasDualRoute(entry) || hasIvOverlay(entry);
}

function EstimateBadge({ label, shortNote, testId }: { label: string; shortNote?: string; testId?: string }) {
  const tooltipText = shortNote
    ? (shortNote.endsWith(".") ? shortNote : shortNote + ".")
    : getEstimateTooltip(label);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className="flex items-center gap-0.5 text-[10px] cursor-help leading-none"
          style={{ color: "#f59e0b", opacity: 0.8 }}
          data-testid={testId}
        >
          <Info className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
          {getEstimateShortLabel(label)}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  );
}

function DualRouteBar({
  primary,
  primaryRoute,
  alt,
  altRoute,
  altShortNote,
}: {
  primary: string;
  primaryRoute: string;
  alt: string;
  altRoute: string;
  altShortNote?: string;
}) {
  const pc = routeColor(primaryRoute);
  const ac = routeColor(altRoute);
  const primaryEst = isEstimatedLabel(primary);
  const altEst = isEstimatedLabel(alt);
  return (
    <div className="flex items-stretch gap-1.5 mt-2.5" data-testid="dual-route-bar">
      <div className={`flex-1 rounded px-2 py-1.5 border ${pc.bg} ${pc.border}`}>
        <div className="text-[9px] uppercase tracking-widest text-muted-foreground/50 mb-0.5">
          {ROUTE_ABBREV[primaryRoute.toLowerCase()] ?? primaryRoute}
        </div>
        <div className={`flex items-center gap-1 text-sm font-bold tabular-nums leading-tight ${pc.text}`}>
          <span>{formatPKLabel(primary)}</span>
          {primaryEst && <EstimateBadge label={primary} />}
        </div>
      </div>
      <div className="flex items-center shrink-0">
        <ArrowLeftRight className="h-3 w-3 text-muted-foreground/30" />
      </div>
      <div className={`flex-1 rounded px-2 py-1.5 border ${ac.bg} ${ac.border}`}>
        <div className="text-[9px] uppercase tracking-widest text-muted-foreground/50 mb-0.5">
          {ROUTE_ABBREV[altRoute.toLowerCase()] ?? altRoute}
        </div>
        <div className={`flex items-center gap-1 text-sm font-bold tabular-nums leading-tight ${ac.text}`}>
          <span>{formatPKLabel(alt)}</span>
          {altEst && <EstimateBadge label={alt} shortNote={altShortNote} />}
        </div>
      </div>
    </div>
  );
}

function CompoundCard({
  entry,
  index,
  highlighted,
  comparisonMode,
  isSelected,
  onToggleCompare,
}: {
  entry: HalfLifeEntry;
  index: number;
  highlighted?: boolean;
  comparisonMode?: boolean;
  isSelected?: boolean;
  onToggleCompare?: (slug: string) => void;
}) {
  const { toast } = useToast();
  const dual = hasDualRoute(entry);
  const ivOverlay = !dual && hasIvOverlay(entry);
  const rc = routeColor(entry.route);

  // Derive the primary source citation (first non-proxy citation)
  const sourceCitation = entry.citations.find((c) => !c.isOffCompoundProxy) ?? null;

  function handleCopyLink() {
    const url =
      window.location.origin +
      "/tools/peptide-pk-catalog?compound=" +
      entry.slug;
    navigator.clipboard.writeText(url).then(() => {
      toast({ description: "Link copied", duration: 2000 });
    });
  }

  const altRouteAbbrev = entry.altRoute
    ? (ROUTE_ABBREV[entry.altRoute.route.toLowerCase()] ?? entry.altRoute.route)
    : null;

  const isEstimate = isEstimatedLabel(entry.halfLifeLabel);
  const primaryIsIndirect = getCitationQuality(entry) === "estimated";
  const altIsIndirect = dual && getCitationQuality(entry, "alt") === "estimated";
  const isIndirectEvidence = primaryIsIndirect || altIsIndirect;

  const indirectNote = (!primaryIsIndirect && altIsIndirect && entry.altRoute?.shortNote?.trim())
    ? (() => { const s = entry.altRoute!.shortNote!.trim(); return s.endsWith(".") ? s : s + "."; })()
    : getIndirectNote(entry);

  const [pkExpanded, setPkExpanded] = useState(false);
  const pkContextRef = useRef<HTMLParagraphElement>(null);

  // Defer MiniPKChart until the card is near the viewport
  const [chartVisible, setChartVisible] = useState(false);
  const chartSlotRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = chartSlotRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setChartVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setChartVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function handleCaveatClick() {
    setPkExpanded(true);
    setTimeout(() => {
      pkContextRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
  }

  const routeAbbrev = ROUTE_ABBREV[entry.route.toLowerCase()] ?? entry.route;

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index < 12 ? index * 0.02 : 0, duration: 0.3 }}
    >
      <div
        className={`relative h-full flex flex-col rounded-md bg-[#07070b] border overflow-hidden transition-all duration-150${highlighted ? " pk-highlight-pulse" : ""}${isSelected ? " ring-2 ring-[#E7FB10]/60 border-[#E7FB10]/30" : " border-white/8"}`}
        style={{ borderLeft: `3px solid ${isSelected ? "#E7FB10" : rc.hex}` }}
        data-testid={`card-compound-${entry.slug}`}
      >
        {/* Comparison checkbox overlay */}
        {comparisonMode && (
          <button
            type="button"
            onClick={() => onToggleCompare?.(entry.slug)}
            className="absolute top-2 left-2 z-10 flex items-center justify-center w-5 h-5 rounded border-2 transition-all duration-150 focus:outline-none"
            style={{
              backgroundColor: isSelected ? "#E7FB10" : "rgba(0,0,0,0.6)",
              borderColor: isSelected ? "#E7FB10" : "rgba(255,255,255,0.3)",
            }}
            aria-label={isSelected ? `Remove ${entry.name} from comparison` : `Add ${entry.name} to comparison`}
            aria-pressed={isSelected}
            data-testid={`checkbox-compare-${entry.slug}`}
          >
            {isSelected && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                <path d="M1 4L3.5 6.5L9 1" stroke="#0a0a0f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        )}

        {/* Route watermark */}
        <span
          className="absolute right-2 top-1 font-['Bebas_Neue'] text-[4.5rem] leading-none select-none pointer-events-none"
          style={{ color: rc.hex, opacity: 0.05 }}
          aria-hidden="true"
        >
          {routeAbbrev}
        </span>

        <div className={`relative flex flex-col flex-1 p-4${comparisonMode ? " pt-4 pl-9" : ""}`}>
          {/* Top row: name + badges */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <span
              className="font-semibold text-sm leading-snug pr-10"
              data-testid={`text-compound-name-${entry.slug}`}
            >
              {entry.name}
            </span>
            <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center justify-center rounded p-0.5 text-muted-foreground/30 hover:text-muted-foreground/70 transition-colors"
                    data-testid={`button-copy-link-${entry.slug}`}
                    aria-label="Copy link to this compound"
                  >
                    <Link2 className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">Copy link</TooltipContent>
              </Tooltip>
              {isIndirectEvidence && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={handleCaveatClick}
                      data-testid={`badge-indirect-evidence-${entry.slug}`}
                      className="inline-flex items-center gap-0.5 rounded text-[9px] px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/25 cursor-pointer hover-elevate"
                    >
                      <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
                      Indirect{!primaryIsIndirect && altIsIndirect && altRouteAbbrev ? ` (${altRouteAbbrev})` : ""}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed space-y-1">
                    <p>{indirectNote}</p>
                    <p className="text-muted-foreground/60">Click to read the full context.</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {(dual || ivOverlay) && (
                <Badge
                  className="text-[9px] px-1.5 py-0.5 gap-0.5 bg-[#E7FB10]/10 text-[#E7FB10] border border-[#E7FB10]/25 shrink-0"
                  data-testid={`badge-dual-route-${entry.slug}`}
                >
                  <ArrowLeftRight className="h-2.5 w-2.5" />
                  Dual
                </Badge>
              )}
              <Badge
                className={`text-[9px] px-1.5 py-0.5 border ${rc.bg} ${rc.text} ${rc.border} shrink-0`}
                data-testid={`badge-route-${entry.slug}`}
              >
                {routeAbbrev}
              </Badge>
            </div>
          </div>

          {/* Hero half-life — single route */}
          {!dual && !ivOverlay && (
            <div className="mb-3 flex items-end gap-2">
              <span
                className="font-['Bebas_Neue'] text-4xl leading-none tabular-nums"
                style={{ color: rc.hex, textShadow: `0 0 24px ${rc.hex}55` }}
                data-testid={`text-halflife-${entry.slug}`}
              >
                {formatPKLabel(entry.halfLifeLabel)}
              </span>
              <span className="text-[10px] text-muted-foreground/40 mb-0.5 flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                t½
                {isEstimate && (
                  <EstimateBadge
                    label={entry.halfLifeLabel}
                    testId={`badge-estimate-${entry.slug}`}
                  />
                )}
              </span>
            </div>
          )}

          {/* IV bolus overlay */}
          {ivOverlay && (
            <DualRouteBar
              primary={entry.halfLifeLabel}
              primaryRoute={entry.route}
              alt={entry.ivHalfLifeLabel!}
              altRoute="intravenous"
            />
          )}

          {/* Full dual-route comparison */}
          {dual && (
            <DualRouteBar
              primary={entry.halfLifeLabel}
              primaryRoute={entry.route}
              alt={entry.altRoute!.halfLifeLabel}
              altRoute={entry.altRoute!.route}
              altShortNote={entry.altRoute!.shortNote}
            />
          )}

          {/* Duration bar — proportional t½ relative to 24 h ceiling, log-scaled */}
          <div
            className="mt-2 mb-1 h-[3px] rounded-full bg-white/5 overflow-hidden"
            data-testid={`bar-duration-${entry.slug}`}
            title={`~${Math.round(pkBarPct(entry))}% of 24 h ceiling`}
          >
            <div
              className="h-full rounded-full"
              style={{ width: `${pkBarPct(entry)}%`, backgroundColor: rc.hex, opacity: 0.55 }}
            />
          </div>

          <div className="flex-1" />

          {/* Mini PK curve thumbnail — deferred until card is near viewport */}
          <div ref={chartSlotRef} style={{ height: 64 }}>
            {chartVisible && (
              <MiniPKChart peptideNames={[entry.name]} stackId={entry.slug} />
            )}
          </div>

          {/* PK context */}
          <p
            ref={pkContextRef}
            className={`text-[11px] text-muted-foreground/45 leading-snug mt-3 ${pkExpanded ? "" : "line-clamp-2"}`}
            data-testid={`text-pk-context-${entry.slug}`}
          >
            {(dual && entry.altRoute?.pkContext) ? entry.altRoute.pkContext : entry.pkContext}
          </p>
          {pkExpanded && (
            <button
              type="button"
              onClick={() => setPkExpanded(false)}
              className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground/70 mt-1 text-left transition-colors"
              data-testid={`button-collapse-context-${entry.slug}`}
            >
              Show less
            </button>
          )}

          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-3">
              {ARTICLE_VISUAL_SLUGS.has(`what-is-${entry.slug}-peptide`) ? (
                <Link
                  href={`/guides/what-is-${entry.slug}-peptide?from=pk-catalog`}
                  data-testid={`link-article-${entry.slug}`}
                >
                  <span className="text-[10px] text-[#21d8ff]/50 hover:text-[#21d8ff]/80 transition-colors cursor-pointer">
                    Read article →
                  </span>
                </Link>
              ) : null}
              {sourceCitation && (
                <a
                  href={sourceCitation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
                  data-testid={`link-citation-${entry.slug}`}
                >
                  Source ↗
                </a>
              )}
            </div>
            {altRouteAbbrev && dual && (
              <span className="text-[10px] text-muted-foreground/30">
                {ROUTE_ABBREV[entry.route.toLowerCase()] ?? entry.route} vs {altRouteAbbrev}
              </span>
            )}
            {ivOverlay && (
              <span className="text-[10px] text-muted-foreground/30">
                {ROUTE_ABBREV[entry.route.toLowerCase()] ?? entry.route} vs IV
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Compact card used inside the comparison tray ──────────────────────────────
function TrayCompactCard({
  entry,
  onRemove,
}: {
  entry: HalfLifeEntry;
  onRemove: () => void;
}) {
  const rc = routeColor(entry.route);
  const routeAbbrev = ROUTE_ABBREV[entry.route.toLowerCase()] ?? entry.route;
  const dual = hasDualRoute(entry);
  const ivOverlay = !dual && hasIvOverlay(entry);

  return (
    <div
      className="flex-1 min-w-0 flex flex-col rounded-md bg-[#0d0d14] border border-white/10 p-3 relative"
      style={{ borderTop: `2px solid ${rc.hex}` }}
    >
      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 flex items-center justify-center w-4 h-4 rounded text-muted-foreground/40 hover:text-muted-foreground/80 transition-colors"
        aria-label={`Remove ${entry.name} from comparison`}
      >
        <X className="h-3 w-3" />
      </button>

      {/* Route badge */}
      <Badge
        className={`self-start text-[9px] px-1.5 py-0 border ${rc.bg} ${rc.text} ${rc.border} mb-1.5`}
      >
        {routeAbbrev}
      </Badge>

      {/* Name */}
      <span className="text-xs font-semibold leading-snug mb-2 pr-4 line-clamp-2">
        {entry.name}
      </span>

      {/* t½ value(s) */}
      {!dual && !ivOverlay && (
        <div className="flex items-baseline gap-1 mb-1.5">
          <span
            className="font-['Bebas_Neue'] text-2xl leading-none tabular-nums"
            style={{ color: rc.hex, textShadow: `0 0 16px ${rc.hex}44` }}
          >
            {formatPKLabel(entry.halfLifeLabel)}
          </span>
          <span className="text-[9px] text-muted-foreground/40">t½</span>
        </div>
      )}
      {ivOverlay && (
        <div className="flex flex-col gap-0.5 mb-1.5">
          <div className="flex items-baseline gap-1">
            <span className="font-['Bebas_Neue'] text-xl leading-none tabular-nums" style={{ color: rc.hex }}>
              {formatPKLabel(entry.halfLifeLabel)}
            </span>
            <span className="text-[9px] text-muted-foreground/40">{routeAbbrev}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-['Bebas_Neue'] text-xl leading-none tabular-nums text-[#a78bfa]">
              {formatPKLabel(entry.ivHalfLifeLabel!)}
            </span>
            <span className="text-[9px] text-muted-foreground/40">IV</span>
          </div>
        </div>
      )}
      {dual && (
        <div className="flex flex-col gap-0.5 mb-1.5">
          <div className="flex items-baseline gap-1">
            <span className="font-['Bebas_Neue'] text-xl leading-none tabular-nums" style={{ color: rc.hex }}>
              {formatPKLabel(entry.halfLifeLabel)}
            </span>
            <span className="text-[9px] text-muted-foreground/40">{routeAbbrev}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className="font-['Bebas_Neue'] text-xl leading-none tabular-nums"
              style={{ color: routeColor(entry.altRoute!.route).hex }}
            >
              {formatPKLabel(entry.altRoute!.halfLifeLabel)}
            </span>
            <span className="text-[9px] text-muted-foreground/40">
              {ROUTE_ABBREV[entry.altRoute!.route.toLowerCase()] ?? entry.altRoute!.route}
            </span>
          </div>
        </div>
      )}

      {/* Duration bar */}
      <div className="h-[3px] rounded-full bg-white/5 overflow-hidden mb-2">
        <div
          className="h-full rounded-full"
          style={{ width: `${pkBarPct(entry)}%`, backgroundColor: rc.hex, opacity: 0.55 }}
        />
      </div>

      {/* Mini PK chart */}
      <MiniPKChart peptideNames={[entry.name]} stackId={`tray-${entry.slug}`} />
    </div>
  );
}

// ── Comparison tray ───────────────────────────────────────────────────────────
function ComparisonTray({
  selectedEntries,
  onRemove,
  onClear,
}: {
  selectedEntries: HalfLifeEntry[];
  onRemove: (slug: string) => void;
  onClear: () => void;
}) {
  const { toast } = useToast();
  const trayRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (!trayRef.current) return;
    setExporting(true);
    try {
      // Lazy import html2canvas to avoid bundle bloat
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(trayRef.current, {
        backgroundColor: "#0a0a0f",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = "pk-comparison.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast({ description: "Comparison saved as pk-comparison.png", duration: 3000 });
    } catch {
      toast({ description: "Export failed — please try again.", duration: 3000 });
    } finally {
      setExporting(false);
    }
  }

  return (
    <AnimatePresence>
      {selectedEntries.length >= 2 && (
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50"
          data-testid="section-comparison-tray"
        >
          {/* Backdrop blur */}
          <div className="absolute inset-0 bg-[#07070b]/90 backdrop-blur-md border-t border-white/10" />

          <div className="relative max-w-6xl mx-auto px-4 py-3">
            {/* Header row */}
            <div className="flex items-center justify-between mb-2.5 gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <GitCompareArrows className="h-4 w-4 text-[#E7FB10]" />
                <span className="text-sm font-semibold text-foreground">
                  Comparing {selectedEntries.length} compounds
                </span>
                <span className="text-xs text-muted-foreground/50">
                  {selectedEntries.length < 4 ? `(add up to ${4 - selectedEntries.length} more)` : "(max 4)"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExport}
                  disabled={exporting}
                  className="gap-1.5 text-xs border-white/15 text-muted-foreground"
                  data-testid="button-export-comparison"
                >
                  <Download className="h-3.5 w-3.5" />
                  {exporting ? "Exporting…" : "Export as image"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onClear}
                  className="gap-1.5 text-xs text-muted-foreground/70"
                  data-testid="button-clear-comparison"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear comparison
                </Button>
              </div>
            </div>

            {/* Cards row — this is what gets captured for export */}
            <div ref={trayRef} className="flex gap-2 overflow-x-auto pb-1">
              {selectedEntries.map((entry) => (
                <TrayCompactCard
                  key={entry.slug}
                  entry={entry}
                  onRemove={() => onRemove(entry.slug)}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function PkCatalog() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [routeFilter, setRouteFilter] = useState<RouteFilter>("all");
  const [dualFilter, setDualFilter] = useState<DualRouteFilter>("all");
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [highlightedSlug, setHighlightedSlug] = useState<string | null>(null);
  const [groupBySystem, setGroupBySystem] = useState(false);

  // Comparison mode state
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());

  const MAX_COMPARE = 4;

  function toggleComparisonMode() {
    setComparisonMode((prev) => {
      if (prev) {
        // Exiting comparison mode — clear selections
        setSelectedSlugs(new Set());
      }
      return !prev;
    });
  }

  const handleToggleCompare = useCallback((slug: string) => {
    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        if (next.size >= MAX_COMPARE) {
          toast({
            description: "Maximum 4 compounds. Deselect one to add another.",
            duration: 3000,
          });
          return prev;
        }
        next.add(slug);
      }
      return next;
    });
  }, [toast]);

  function handleRemoveFromTray(slug: string) {
    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      next.delete(slug);
      return next;
    });
  }

  function handleClearComparison() {
    setSelectedSlugs(new Set());
  }

  // Read ?compound= param on mount, clear filters so the card is visible, then scroll to it
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("compound");
    if (!slug) return;

    // Make sure the card is visible by clearing all filters
    setSearch("");
    setRouteFilter("all");
    setDualFilter("all");
    setDurationFilter("all");
    setSortKey("name");
    setSortDir("asc");
    setHighlightedSlug(slug);

    // Scroll after a tick so the grid has rendered with cleared filters
    const timer = setTimeout(() => {
      const el = document.querySelector(`[data-testid="card-compound-${slug}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      // Remove highlight after animation completes (1.5 s)
      setTimeout(() => setHighlightedSlug(null), 1800);
    }, 80);

    return () => clearTimeout(timer);
  }, []);

  const routes = useMemo(() => {
    const seen = new Set<string>();
    CATALOG_ENTRIES.forEach((e) => seen.add(e.route.toLowerCase()));
    return Array.from(seen).sort();
  }, []);

  const dualCount = useMemo(
    () => CATALOG_ENTRIES.filter(hasRouteContrast).length,
    []
  );

  const filtered = useMemo(() => {
    let entries = CATALOG_ENTRIES.slice();

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      entries = entries.filter((e) => e.name.toLowerCase().includes(q));
    }

    if (routeFilter !== "all") {
      entries = entries.filter(
        (e) => e.route.toLowerCase() === routeFilter
      );
    }

    if (dualFilter === "dual-only") {
      entries = entries.filter(hasRouteContrast);
    }

    if (durationFilter !== "all") {
      entries = entries.filter((e) => {
        const mid = pkMidpointMin(e);
        if (durationFilter === "short")  return mid < DURATION_THRESHOLDS.short;
        if (durationFilter === "medium") return mid >= DURATION_THRESHOLDS.short && mid <= DURATION_THRESHOLDS.medium;
        if (durationFilter === "long")   return mid > DURATION_THRESHOLDS.medium;
        return true;
      });
    }

    entries.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (sortKey === "half-life") {
        cmp = pkMidpointMin(a) - pkMidpointMin(b);
      } else if (sortKey === "route") {
        cmp = a.route.localeCompare(b.route) || a.name.localeCompare(b.name);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return entries;
  }, [search, routeFilter, dualFilter, durationFilter, sortKey, sortDir]);

  // Build grouped sections when groupBySystem is on.
  // Sections with zero visible compounds are excluded automatically.
  const groupedSections = useMemo(() => {
    if (!groupBySystem) return null;
    const buckets = new Map<string, HalfLifeEntry[]>();
    // Seed canonical buckets in order so iteration order is preserved
    SYSTEM_ORDER.forEach((s) => buckets.set(s, []));
    buckets.set("Other", []);

    filtered.forEach((e) => {
      const sys = e.bodySystem;
      const canonical = sys && (SYSTEM_ORDER as readonly string[]).includes(sys) ? sys : "Other";
      buckets.get(canonical)!.push(e);
    });

    // Return only non-empty sections; "Other" appended at the end if non-empty
    const sections: Array<{ system: string; entries: HalfLifeEntry[] }> = [];
    SYSTEM_ORDER.forEach((s) => {
      const list = buckets.get(s)!;
      if (list.length > 0) sections.push({ system: s, entries: list });
    });
    const other = buckets.get("Other")!;
    if (other.length > 0) sections.push({ system: "Other", entries: other });

    return sections;
  }, [groupBySystem, filtered]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const SortIcon = sortDir === "asc" ? SortAsc : SortDesc;

  // Derive selected entries for tray (preserve order by selection — use catalog order as fallback)
  const selectedEntries = useMemo(
    () => CATALOG_ENTRIES.filter((e) => selectedSlugs.has(e.slug)),
    [selectedSlugs]
  );

  // When tray is visible, add bottom padding so content isn't hidden behind it
  const trayVisible = selectedEntries.length >= 2;

  return (
    <>
      <style>{`
        @keyframes pk-card-highlight {
          0%   { box-shadow: 0 0 0 0 rgba(33, 216, 255, 0); }
          20%  { box-shadow: 0 0 0 4px rgba(33, 216, 255, 0.45), 0 0 20px rgba(33, 216, 255, 0.25); }
          80%  { box-shadow: 0 0 0 4px rgba(33, 216, 255, 0.15), 0 0 10px rgba(33, 216, 255, 0.10); }
          100% { box-shadow: 0 0 0 0 rgba(33, 216, 255, 0); }
        }
        .pk-highlight-pulse {
          animation: pk-card-highlight 1.6s ease-out forwards;
        }
      `}</style>
      <SEOHead
        title="Peptide Half-Life Catalog — IV vs SC Route Comparison | Revive Research"
        description="Compare pharmacokinetic half-lives for research peptides side-by-side. Filter by route, identify dual-route compounds, and see IV vs SC differences at a glance."
      />

      <div className={`min-h-screen bg-[#0a0a0f] text-foreground transition-all duration-300`}>
        <div className={`max-w-6xl mx-auto px-4 pt-24 pb-8${trayVisible ? " pb-56" : ""}`}>
          {/* Back link */}
          <Link href="/tools/peptide-reconstitution-calculator" data-testid="link-back-tools">
            <Button variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground">
              <ArrowLeft className="h-3.5 w-3.5" />
              Research Tools
            </Button>
          </Link>

          {/* Page header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-[#21d8ff]" />
              <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
                Peptide Half-Life Catalog
              </h1>
            </div>
            <p className="text-muted-foreground text-sm max-w-2xl">
              Published pharmacokinetic half-life data for{" "}
              <span className="text-foreground font-medium">{CATALOG_ENTRIES.length} research compounds</span>.{" "}
              <span className="text-[#E7FB10]/80">{dualCount} compounds</span> have meaningful route-dependent
              kinetics — their IV and SC half-lives are shown side-by-side without needing a toggle.
            </p>
          </div>

          {/* RUO disclaimer */}
          <div className="flex gap-2 items-start rounded-md bg-amber-500/5 border border-amber-500/20 px-3 py-2.5 mb-6">
            <AlertTriangle className="h-4 w-4 text-amber-500/60 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="text-amber-500/80 font-medium">Research use only.</span>{" "}
              Pharmacokinetic data is drawn from published scientific literature and presented for
              informational purposes. We do not recommend, suggest, or endorse any specific dosage,
              administration protocol, or use of these compounds in humans or animals.
            </p>
          </div>

          {/* PK info box */}
          <div className="flex gap-2 items-start rounded-md bg-[#21d8ff]/5 border border-[#21d8ff]/15 px-3 py-2.5 mb-6">
            <Info className="h-4 w-4 text-[#21d8ff]/60 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="text-[#21d8ff]/80 font-medium">About dual-route compounds.</span>{" "}
              Some compounds are studied via multiple administration routes (e.g. IV and SC). Route
              of administration affects the absorption phase, altering the apparent half-life
              researchers observe in plasma. Compounds marked{" "}
              <span className="inline-flex items-center gap-0.5 text-[#E7FB10] font-medium">
                <ArrowLeftRight className="h-3 w-3 inline" /> Dual Route
              </span>{" "}
              have published data for both routes shown side-by-side.
            </p>
          </div>

          {/* ── Filters — two-row toolbar ─────────────────────────────── */}
          <div className="mb-6 space-y-2" data-testid="section-filters">

            {/* Row 1 — Search + result count + Sort + Compare toggle */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative w-56 shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 pointer-events-none" />
                <Input
                  placeholder="Search compounds…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 bg-white/5 border-white/10 text-xs"
                  data-testid="input-search-compound"
                />
              </div>

              {/* Result count */}
              <span className="text-xs text-muted-foreground/40 tabular-nums" data-testid="text-result-count">
                {filtered.length === CATALOG_ENTRIES.length
                  ? `${CATALOG_ENTRIES.length} compounds`
                  : `${filtered.length} / ${CATALOG_ENTRIES.length}`}
              </span>

              <div className="flex-1" />

              {/* Group by system toggle */}
              <button
                type="button"
                onClick={() => setGroupBySystem((v) => !v)}
                className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded border transition-colors ${
                  groupBySystem
                    ? "bg-[#E7FB10]/10 text-[#E7FB10] border-[#E7FB10]/30"
                    : "bg-transparent text-muted-foreground/60 border-white/15 hover:border-white/30 hover:text-muted-foreground"
                }`}
                data-testid="button-group-by-system"
                aria-pressed={groupBySystem}
              >
                <Layers className="h-3.5 w-3.5" />
                Group by system
              </button>

              {/* Compare toggle */}
              <button
                type="button"
                onClick={toggleComparisonMode}
                className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded border transition-colors ${
                  comparisonMode
                    ? "bg-[#E7FB10]/10 text-[#E7FB10] border-[#E7FB10]/30"
                    : "bg-transparent text-muted-foreground/60 border-white/15 hover:border-white/30 hover:text-muted-foreground"
                }`}
                data-testid="button-toggle-comparison"
                aria-pressed={comparisonMode}
              >
                <GitCompareArrows className="h-3.5 w-3.5" />
                Compare
                {comparisonMode && selectedSlugs.size > 0 && (
                  <span className="text-[10px] opacity-70 tabular-nums">{selectedSlugs.size}</span>
                )}
              </button>

              {/* Sort */}
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="h-3 w-3 text-muted-foreground/30 shrink-0" />
                {(["name", "half-life", "route"] as SortKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => toggleSort(key)}
                    className={`inline-flex items-center gap-0.5 text-[11px] px-2 py-1 rounded border transition-colors ${
                      sortKey === key
                        ? "bg-white/10 text-foreground border-white/20"
                        : "bg-transparent text-muted-foreground/60 border-white/8 hover:border-white/20 hover:text-muted-foreground"
                    }`}
                    data-testid={`button-sort-${key}`}
                  >
                    {key === "half-life" ? "t½" : key.charAt(0).toUpperCase() + key.slice(1)}
                    {sortKey === key && <SortIcon className="h-2.5 w-2.5 ml-0.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Comparison mode hint */}
            {comparisonMode && (
              <div className="flex items-center gap-2 text-[11px] text-[#E7FB10]/60 bg-[#E7FB10]/5 border border-[#E7FB10]/15 rounded px-3 py-1.5">
                <GitCompareArrows className="h-3 w-3 shrink-0" />
                Select 2–4 compounds to compare their PK profiles side-by-side.
                {selectedSlugs.size >= 2 && (
                  <span className="text-[#E7FB10]/80 font-medium ml-1">
                    Comparison tray is ready below.
                  </span>
                )}
              </div>
            )}

            {/* Row 2 — Filter chips */}
            <div className="flex items-center gap-0 flex-wrap rounded-md border border-white/8 bg-white/[0.02] px-3 py-1.5">

              {/* Route group */}
              <span className="text-[10px] text-muted-foreground/30 uppercase tracking-widest mr-2 shrink-0">Route</span>
              <div className="flex items-center gap-1 flex-wrap">
                {(["all", ...routes] as (RouteFilter | string)[]).map((r) => {
                  const active = routeFilter === r;
                  const label = r === "all" ? "All" : (ROUTE_ABBREV[r] ?? r);
                  const col = r !== "all" ? routeColor(r) : null;
                  return (
                    <button
                      key={r}
                      onClick={() => setRouteFilter(r as RouteFilter)}
                      style={active && col ? { backgroundColor: col.hex + "22", color: col.hex, borderColor: col.hex + "55" } : undefined}
                      className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                        active && !col
                          ? "bg-white/10 text-foreground border-white/20"
                          : !active
                          ? "bg-transparent text-muted-foreground/60 border-white/8 hover:border-white/20 hover:text-muted-foreground"
                          : "border-transparent"
                      }`}
                      data-testid={`button-route-filter-${r}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="mx-3 h-4 w-px bg-white/10 shrink-0" />

              {/* Duration group */}
              <Clock className="h-3 w-3 text-muted-foreground/25 mr-1.5 shrink-0" />
              <div className="flex items-center gap-1 flex-wrap">
                {(
                  [
                    { key: "all",    label: "Any" },
                    { key: "short",  label: "< 30 min" },
                    { key: "medium", label: "30 min – 6 h" },
                    { key: "long",   label: "> 6 h" },
                  ] as const
                ).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setDurationFilter(key)}
                    className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                      durationFilter === key
                        ? "bg-white/10 text-foreground border-white/20"
                        : "bg-transparent text-muted-foreground/60 border-white/8 hover:border-white/20 hover:text-muted-foreground"
                    }`}
                    data-testid={`button-duration-${key}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="mx-3 h-4 w-px bg-white/10 shrink-0" />

              {/* Dual Route toggle */}
              <button
                onClick={() => setDualFilter((f) => (f === "all" ? "dual-only" : "all"))}
                className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded border transition-colors ${
                  dualFilter === "dual-only"
                    ? "bg-[#E7FB10]/10 text-[#E7FB10] border-[#E7FB10]/30"
                    : "bg-transparent text-muted-foreground/60 border-white/8 hover:border-white/20 hover:text-muted-foreground"
                }`}
                data-testid="button-filter-dual-route"
              >
                <ArrowLeftRight className="h-3 w-3" />
                Dual Route
                {dualFilter === "dual-only" && (
                  <span className="text-[9px] opacity-70 tabular-nums">{filtered.length}</span>
                )}
              </button>
            </div>
          </div>

          {/* Compound grid — flat or grouped by body system */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground/40 text-sm" data-testid="text-no-results">
              No compounds match your filters.
            </div>
          ) : groupedSections ? (
            <div className="space-y-10" data-testid="grid-compounds-grouped">
              {groupedSections.map(({ system, entries }) => {
                const accentColor =
                  system !== "Other"
                    ? (SYSTEM_COLORS[system as CanonicalSystem] ?? "#E7FB10")
                    : "#ffffff44";
                const sectionTestId = `section-system-${system.toLowerCase()}`;
                // Running index for stagger animation — continues across sections
                return (
                  <section
                    key={system}
                    data-testid={sectionTestId}
                    aria-label={`${system} compounds`}
                  >
                    {/* Section header */}
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className="font-['Bebas_Neue'] text-xl tracking-widest"
                        style={{ color: accentColor, textShadow: `0 0 16px ${accentColor}55` }}
                      >
                        {system}
                      </span>
                      <span className="text-xs text-muted-foreground/40 tabular-nums">
                        {entries.length} compound{entries.length !== 1 ? "s" : ""}
                      </span>
                      <div
                        className="flex-1 h-px"
                        style={{ background: `linear-gradient(to right, ${accentColor}40, transparent)` }}
                      />
                    </div>

                    {/* Compound grid for this section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {entries.map((entry, i) => (
                        <CompoundCard
                          key={entry.slug}
                          entry={entry}
                          index={i}
                          highlighted={highlightedSlug === entry.slug}
                          comparisonMode={comparisonMode}
                          isSelected={selectedSlugs.has(entry.slug)}
                          onToggleCompare={handleToggleCompare}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
              data-testid="grid-compounds"
            >
              {filtered.map((entry, i) => (
                <CompoundCard
                  key={entry.slug}
                  entry={entry}
                  index={i}
                  highlighted={highlightedSlug === entry.slug}
                  comparisonMode={comparisonMode}
                  isSelected={selectedSlugs.has(entry.slug)}
                  onToggleCompare={handleToggleCompare}
                />
              ))}
            </div>
          )}

          {/* Bottom context */}
          <div className="mt-12 border-t border-white/5 pt-8 text-xs text-muted-foreground/40 leading-relaxed space-y-2">
            <p>
              Half-life values are sourced from PubMed-indexed pharmacokinetic studies. Where no
              compound-specific study was identified, values are estimated from structurally
              analogous compound class data and are labelled as estimates. All citations are
              accessible via the individual compound PK profiles on each article page.
            </p>
            <p>
              SC = subcutaneous · IV = intravenous · IN = intranasal · Oral = oral administration ·
              Topical = topical/transdermal application.
            </p>
            <div className="flex gap-4 pt-1">
              <Link href="/guides/peptide-education-center">
                <span className="text-[#21d8ff]/40 hover:text-[#21d8ff]/70 transition-colors cursor-pointer">
                  Education Center
                </span>
              </Link>
              <Link href="/tools/peptide-reconstitution-calculator">
                <span className="text-[#21d8ff]/40 hover:text-[#21d8ff]/70 transition-colors cursor-pointer">
                  Reconstitution Calculator
                </span>
              </Link>
              <Link href="/reconstitution-wizard">
                <span className="text-[#21d8ff]/40 hover:text-[#21d8ff]/70 transition-colors cursor-pointer">
                  Reconstitution Wizard
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison tray — fixed at the bottom of the viewport */}
      <ComparisonTray
        selectedEntries={selectedEntries}
        onRemove={handleRemoveFromTray}
        onClear={handleClearComparison}
      />
    </>
  );
}
