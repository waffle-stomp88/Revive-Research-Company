import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Activity,
  ArrowLeft,
  ArrowLeftRight,
  AlertTriangle,
  ArrowUpDown,
  Clock,
  Info,
  Search,
  SortAsc,
  SortDesc,
} from "lucide-react";
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

function CompoundCard({ entry, index }: { entry: HalfLifeEntry; index: number }) {
  const dual = hasDualRoute(entry);
  const ivOverlay = !dual && hasIvOverlay(entry);
  const rc = routeColor(entry.route);

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
      transition={{ delay: index * 0.02, duration: 0.3 }}
    >
      <div
        className="relative h-full flex flex-col rounded-md bg-[#07070b] border border-white/8 overflow-hidden"
        style={{ borderLeft: `3px solid ${rc.hex}` }}
        data-testid={`card-compound-${entry.slug}`}
      >
        {/* Route watermark */}
        <span
          className="absolute right-2 top-1 font-['Bebas_Neue'] text-[4.5rem] leading-none select-none pointer-events-none"
          style={{ color: rc.hex, opacity: 0.05 }}
          aria-hidden="true"
        >
          {routeAbbrev}
        </span>

        <div className="relative flex flex-col flex-1 p-4">
          {/* Top row: name + badges */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <span
              className="font-semibold text-sm leading-snug pr-10"
              data-testid={`text-compound-name-${entry.slug}`}
            >
              {entry.name}
            </span>
            <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
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

          {/* Mini PK curve thumbnail */}
          <div style={{ maxHeight: 64 }}>
            <MiniPKChart peptideNames={[entry.name]} stackId={entry.slug} />
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
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
            {ARTICLE_VISUAL_SLUGS.has(`what-is-${entry.slug}-peptide`) ? (
              <Link
                href={`/guides/what-is-${entry.slug}-peptide?from=pk-catalog`}
                data-testid={`link-article-${entry.slug}`}
              >
                <span className="text-[10px] text-[#21d8ff]/50 hover:text-[#21d8ff]/80 transition-colors cursor-pointer">
                  Read article →
                </span>
              </Link>
            ) : (
              <span />
            )}
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

export default function PkCatalog() {
  const [search, setSearch] = useState("");
  const [routeFilter, setRouteFilter] = useState<RouteFilter>("all");
  const [dualFilter, setDualFilter] = useState<DualRouteFilter>("all");
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

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

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const SortIcon = sortDir === "asc" ? SortAsc : SortDesc;

  return (
    <>
      <SEOHead
        title="Peptide Half-Life Catalog — IV vs SC Route Comparison | Revive Research"
        description="Compare pharmacokinetic half-lives for research peptides side-by-side. Filter by route, identify dual-route compounds, and see IV vs SC differences at a glance."
      />

      <div className="min-h-screen bg-[#0a0a0f] text-foreground">
        <div className="max-w-6xl mx-auto px-4 pt-24 pb-8">
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

            {/* Row 1 — Search + result count + Sort */}
            <div className="flex items-center gap-3">
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

          {/* Compound grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground/40 text-sm" data-testid="text-no-results">
              No compounds match your filters.
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
              data-testid="grid-compounds"
            >
              {filtered.map((entry, i) => (
                <CompoundCard key={entry.slug} entry={entry} index={i} />
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
    </>
  );
}
