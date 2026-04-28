import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { STACK_COMPONENTS, buildPriceLookup, calculateStackPricing } from "@/lib/stack-pricing";
import { SEOHead } from "@/components/seo-head";
import {
  ArrowLeft, FlaskConical, ShoppingCart, Sparkles, AlertTriangle, Package, GraduationCap, Shield, FileCheck, Truck, RefreshCw, ShoppingBag, Repeat, CheckCircle, Minus, Plus, BookOpen, ChevronRight, ChevronDown, Clock, Info
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getHalfLifeByName, hasKineticMismatch, PK_VISIBLE_LOWER_RATIO, PK_VISIBLE_UPPER_RATIO } from "@/data/pharmacokinetics";
import { ImageLoader } from "@/components/image-loader";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { getSynergyPartners, normalizePeptideName } from "@/lib/synergy-data";
import { getTopPairingForProduct } from "@/lib/pairing-intelligence";
import { detectPathwayOverlaps, resolveDatasetSlug } from "@/lib/pathway-overlaps";
import { PathwayOverlapCard } from "@/components/pathway-overlap-card";
import { Layers, Zap } from "lucide-react";
import type { Product } from "@shared/schema";
import productImage from "@assets/reta bottle_1764310671562.jpg";
import { RESEARCH_STACKS_BY_ID } from "@/data/research-stacks";
import type { StackPeptide } from "@/data/research-stacks";
import type { HalfLifeEntry } from "@/data/pharmacokinetics";

// ─── Pharmacokinetics Chart ───────────────────────────────────────────────────

function routeAbbrev(route: string): string {
  const r = route.toLowerCase();
  if (r === "subcutaneous") return "SC";
  if (r === "intravenous") return "IV";
  if (r === "intranasal") return "IN";
  if (r === "oral") return "Oral";
  if (r === "topical") return "Topical";
  return route;
}

function isNonSCRoute(route: string): boolean {
  return route.toLowerCase() !== "subcutaneous";
}

const PK_CURVE_COLORS = ["#21d8ff", "#E7FB10", "#22c55e", "#f59e0b", "#a855f7"];

const CHART = {
  vbW: 500, vbH: 195,
  pT: 14, pR: 28, pB: 46, pL: 44,
  get plotW() { return this.vbW - this.pL - this.pR; },
  get plotH() { return this.vbH - this.pT - this.pB; },
  get x0() { return this.pL; },
  get y0() { return this.pT; },
  get x1() { return this.vbW - this.pR; },
  get y1() { return this.vbH - this.pB; },
};

function pkMidpoint(pk: HalfLifeEntry): number | null {
  if (pk.halfLifeMin !== undefined && pk.halfLifeMax !== undefined) return (pk.halfLifeMin + pk.halfLifeMax) / 2;
  if (pk.halfLifeMin !== undefined) return pk.halfLifeMin;
  if (pk.halfLifeMax !== undefined) return pk.halfLifeMax;
  return null;
}

function computeXMax(pks: HalfLifeEntry[]): { xMaxMin: number; shortFocus: boolean } {
  const mids = pks.map(pkMidpoint).filter((v): v is number => v !== null && v > 0);
  if (mids.length === 0) return { xMaxMin: 1440, shortFocus: false };
  const minM = Math.min(...mids);
  const maxM = Math.max(...mids);
  if (mids.length >= 2 && maxM / minM > 30) {
    return { xMaxMin: Math.min(10 * minM, 4320), shortFocus: true };
  }
  return { xMaxMin: Math.min(5 * maxM, 7200), shortFocus: false };
}

function buildPKCurve(halfLifeMidMin: number | null, xMaxMin: number): { x: number; y: number }[] {
  const N = 240;
  const effHL = halfLifeMidMin === null ? xMaxMin * 80 : halfLifeMidMin;
  const ke = Math.log(2) / effHL;
  const kaFloor = Math.log(2) / (0.08 * xMaxMin);
  const ka = Math.max(ke * 10, kaFloor);
  const safeKa = ka === ke ? ka * 1.0001 : ka;

  const raw: number[] = [];
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * xMaxMin;
    const v = (Math.exp(-ke * t) - Math.exp(-safeKa * t)) / (safeKa - ke);
    raw.push(Math.max(0, v));
  }
  const maxV = Math.max(...raw, 1e-9);
  return raw.map((v, i) => ({
    x: CHART.x0 + (i / N) * CHART.plotW,
    y: CHART.y0 + CHART.plotH * (1 - v / maxV),
  }));
}

function ptsToD(pts: { x: number; y: number }[]): string {
  if (!pts.length) return "";
  let d = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const cx = (pts[i].x + pts[i + 1].x) / 2;
    const cy = (pts[i].y + pts[i + 1].y) / 2;
    d += ` Q ${pts[i].x.toFixed(1)},${pts[i].y.toFixed(1)} ${cx.toFixed(1)},${cy.toFixed(1)}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${last.x.toFixed(1)},${last.y.toFixed(1)}`;
  return d;
}

function ptsToAreaD(pts: { x: number; y: number }[]): string {
  const c = ptsToD(pts);
  const f = pts[0], l = pts[pts.length - 1];
  return `${c} L ${l.x.toFixed(1)},${CHART.y1.toFixed(1)} L ${f.x.toFixed(1)},${CHART.y1.toFixed(1)} Z`;
}

function toTestSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

const PK_ZOOM_PRESETS: { label: string; minutes: number }[] = [
  { label: "1 h",  minutes: 60 },
  { label: "6 h",  minutes: 360 },
  { label: "24 h", minutes: 1440 },
  { label: "7 d",  minutes: 10080 },
];

const PK_ZOOM_STORAGE_KEY = "pk-zoom-range";

function readStoredZoom(): number | null {
  try {
    const raw = localStorage.getItem(PK_ZOOM_STORAGE_KEY);
    if (raw === null || raw === "auto") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function writeStoredZoom(value: number | null): void {
  try {
    if (value === null) {
      localStorage.removeItem(PK_ZOOM_STORAGE_KEY);
    } else {
      localStorage.setItem(PK_ZOOM_STORAGE_KEY, String(value));
    }
  } catch {
    // ignore
  }
}

function PharmacokineticsChart({ peptides }: { peptides: StackPeptide[] }) {
  const [selectedRange, setSelectedRange] = useState<number | null>(readStoredZoom);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{ clientX: number; clientY: number; label: string; halfLife: string } | null>(null);
  const chartWrapRef = useRef<HTMLDivElement>(null);

  function handleRangeChange(value: number | null) {
    writeStoredZoom(value);
    setSelectedRange(value);
  }

  const peptideKey = peptides.map(p => p.name).join("|");
  useEffect(() => {
    setSelectedRange(readStoredZoom());
  }, [peptideKey]);

  const entries = peptides.map((p, i) => ({
    peptide: p,
    pk: getHalfLifeByName(p.name),
    color: PK_CURVE_COLORS[i % PK_CURVE_COLORS.length],
  }));

  const pksWithData = entries.map(e => e.pk).filter((pk): pk is HalfLifeEntry => pk !== undefined);
  const { xMaxMin: autoXMaxMin, shortFocus } = computeXMax(pksWithData);
  const xMaxMin = selectedRange ?? autoXMaxMin;

  const useHours = xMaxMin >= 120;
  const xMaxDisp = useHours ? xMaxMin / 60 : xMaxMin;

  const xTicks = [0, 0.25, 0.5, 0.75, 1].map(f => {
    const val = f * xMaxDisp;
    return { frac: f, label: useHours ? (val < 10 ? val.toFixed(1) : Math.round(val).toString()) : Math.round(val).toString() };
  });

  const curves = entries.map(({ peptide, pk, color }) => {
    if (!pk) return null;
    const mid = pkMidpoint(pk);
    const pts = buildPKCurve(mid, xMaxMin);
    const lastY = pts[pts.length - 1].y;
    const isExtended = mid === null || mid > xMaxMin * 0.5;
    const halfLifeXFrac = mid !== null && mid <= xMaxMin ? mid / xMaxMin : null;
    return { peptide, pk, color, pts, isExtended, halfLifeXFrac, lastY, curveD: ptsToD(pts), areaD: ptsToAreaD(pts) };
  });

  const definedPks = pksWithData;

  // Zoom-aware mismatch: only flag a kinetic difference when both fast and slow
  // compounds are meaningfully visible in the active zoom window.
  // Thresholds are defined in pharmacokinetics.ts as PK_VISIBLE_LOWER_RATIO / PK_VISIBLE_UPPER_RATIO.
  const visiblePks = definedPks.filter((pk) => {
    const mid = pkMidpoint(pk);
    if (mid === null) return false;
    return mid >= xMaxMin / PK_VISIBLE_LOWER_RATIO && mid <= xMaxMin * PK_VISIBLE_UPPER_RATIO;
  });
  // Require at least 2 meaningful compounds in the window; if only one side of the
  // mismatch is visible, suppress the warning rather than mislead the researcher.
  const showMismatch = visiblePks.length >= 2 ? hasKineticMismatch(visiblePks) : false;

  // Compounds whose half-life exceeds the zoom window (they reach < 50 % decay within view).
  const beyondViewNames = definedPks
    .filter((pk) => { const mid = pkMidpoint(pk); return mid !== null && mid > xMaxMin; })
    .map((pk) => pk.name);

  const hasCurves = curves.some(Boolean);
  const hasNonSC = pksWithData.some(pk => isNonSCRoute(pk.route));
  const clipId = "pk-clip-" + peptides.map(p => toTestSlug(p.name)).join("-");

  const curveOpacity = useCallback((idx: number) => {
    if (hoveredIdx === null) return 1;
    return idx === hoveredIdx ? 1 : 0.12;
  }, [hoveredIdx]);

  const markerOpacity = useCallback((idx: number) => {
    if (hoveredIdx === null) return 1;
    return idx === hoveredIdx ? 1 : 0.06;
  }, [hoveredIdx]);

  const handleCurveHover = useCallback((idx: number, e: React.MouseEvent) => {
    const c = curves[idx];
    if (!c) return;
    setHoveredIdx(idx);
    setTooltip({
      clientX: e.clientX,
      clientY: e.clientY,
      label: c.peptide.name,
      halfLife: c.pk.halfLifeLabel,
    });
  }, [curves]);

  const handleCurveMove = useCallback((idx: number, e: React.MouseEvent) => {
    const c = curves[idx];
    if (!c) return;
    setTooltip(prev => prev ? { ...prev, clientX: e.clientX, clientY: e.clientY } : prev);
  }, [curves]);

  const handleCurveLeave = useCallback(() => {
    setHoveredIdx(null);
    setTooltip(null);
  }, []);

  const handleLegendEnter = useCallback((idx: number, e?: React.MouseEvent | React.FocusEvent) => {
    const c = curves[idx];
    if (!c) return;
    setHoveredIdx(idx);
    const clientX = (e as React.MouseEvent)?.clientX ?? 0;
    const clientY = (e as React.MouseEvent)?.clientY ?? 0;
    if (clientX || clientY) {
      setTooltip({ clientX, clientY, label: c.peptide.name, halfLife: c.pk.halfLifeLabel });
    }
  }, [curves]);

  const handleLegendMove = useCallback((idx: number, e: React.MouseEvent) => {
    const c = curves[idx];
    if (!c) return;
    setTooltip({ clientX: e.clientX, clientY: e.clientY, label: c.peptide.name, halfLife: c.pk.halfLifeLabel });
  }, [curves]);

  const handleLegendLeave = useCallback(() => {
    setHoveredIdx(null);
    setTooltip(null);
  }, []);

  return (
    <div className="mb-8" data-testid="section-compounds">
      <h3 className="font-display font-semibold text-lg mb-3">Compounds in this Stack</h3>
      <Card className="border-border/40 bg-[#07070b] overflow-hidden">
        {hasCurves && (
          <div className="p-3 pb-0 relative" ref={chartWrapRef}>
            <div className="flex items-center justify-end gap-1 mb-2" data-testid="pk-zoom-controls">
              <button
                className={`relative px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  selectedRange === null
                    ? "bg-white/15 text-white"
                    : "text-white/40 hover:text-white/70"
                }`}
                onClick={() => handleRangeChange(null)}
                data-testid="pk-zoom-auto"
                aria-pressed={selectedRange === null}
                title={selectedRange !== null ? "Reset to Auto (clears saved preference)" : "Auto zoom"}
              >
                Auto
                {selectedRange !== null && (
                  <span
                    className="absolute -top-0.5 -right-0.5 block w-1.5 h-1.5 rounded-full bg-white/60"
                    aria-label="saved preference active"
                    data-testid="pk-zoom-auto-saved-indicator"
                  />
                )}
              </button>
              {PK_ZOOM_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    selectedRange === preset.minutes
                      ? "bg-white/15 text-white"
                      : "text-white/40 hover:text-white/70"
                  }`}
                  onClick={() => handleRangeChange(preset.minutes)}
                  data-testid={`pk-zoom-${preset.label.replace(/\s/g, "").toLowerCase()}`}
                  aria-pressed={selectedRange === preset.minutes}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            {hasNonSC && (
              <div className="flex items-center justify-end gap-3 mb-1.5 px-0.5" data-testid="pk-line-style-key">
                <div className="flex items-center gap-1.5">
                  <svg width="18" height="4" viewBox="0 0 18 4" aria-hidden="true">
                    <line x1="0" y1="2" x2="18" y2="2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.45" />
                  </svg>
                  <span className="text-[10px] text-white/40 font-medium">SC</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg width="18" height="4" viewBox="0 0 18 4" aria-hidden="true">
                    <line x1="0" y1="2" x2="18" y2="2" stroke="#fff" strokeWidth="2" strokeDasharray="5 3" strokeLinecap="round" strokeOpacity="0.45" />
                  </svg>
                  <span className="text-[10px] text-white/40 font-medium">Other route</span>
                </div>
              </div>
            )}
            <svg
              viewBox={`0 0 ${CHART.vbW} ${CHART.vbH}`}
              className="w-full"
              style={{ maxHeight: 200 }}
              role="img"
              aria-label="Plasma concentration–time curves for compounds in this stack"
              onMouseLeave={handleCurveLeave}
            >
              <defs>
                <clipPath id={clipId}>
                  <rect x={CHART.x0} y={CHART.y0} width={CHART.plotW} height={CHART.plotH + 1} />
                </clipPath>
                {curves.map(c => c && (
                  <linearGradient key={`g-${toTestSlug(c.peptide.name)}`} id={`g-${toTestSlug(c.peptide.name)}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c.color} stopOpacity="0.22" />
                    <stop offset="100%" stopColor={c.color} stopOpacity="0" />
                  </linearGradient>
                ))}
              </defs>

              {/* Grid */}
              {[0.25, 0.5, 0.75].map((f, i) => (
                <line key={i} x1={CHART.x0} y1={CHART.y0 + f * CHART.plotH} x2={CHART.x1} y2={CHART.y0 + f * CHART.plotH}
                  stroke="#fff" strokeOpacity="0.05" strokeWidth="1" />
              ))}

              {/* Axes */}
              <line x1={CHART.x0} y1={CHART.y0} x2={CHART.x0} y2={CHART.y1} stroke="#fff" strokeOpacity="0.12" strokeWidth="1" />
              <line x1={CHART.x0} y1={CHART.y1} x2={CHART.x1} y2={CHART.y1} stroke="#fff" strokeOpacity="0.12" strokeWidth="1" />

              {/* Y-axis ticks */}
              {[["100%", 0], ["50%", 0.5], ["0%", 1]].map(([lbl, f]) => (
                <g key={String(f)}>
                  <line x1={CHART.x0 - 3} y1={CHART.y0 + Number(f) * CHART.plotH} x2={CHART.x0} y2={CHART.y0 + Number(f) * CHART.plotH}
                    stroke="#fff" strokeOpacity="0.15" strokeWidth="1" />
                  <text x={CHART.x0 - 5} y={CHART.y0 + Number(f) * CHART.plotH + 3} textAnchor="end" fontSize="8" fill="#fff" fillOpacity="0.3">{lbl}</text>
                </g>
              ))}

              {/* Y-axis label */}
              <text x={9} y={CHART.y0 + CHART.plotH / 2} textAnchor="middle" fontSize="8" fill="#fff" fillOpacity="0.25"
                transform={`rotate(-90,9,${CHART.y0 + CHART.plotH / 2})`}>Relative C</text>

              {/* Area fills */}
              <g clipPath={`url(#${clipId})`}>
                {curves.map((c, idx) => c && (
                  <path
                    key={`a-${c.peptide.name}`}
                    d={c.areaD}
                    fill={`url(#g-${toTestSlug(c.peptide.name)})`}
                    style={{ opacity: curveOpacity(idx), transition: "opacity 0.18s ease" }}
                  />
                ))}
              </g>

              {/* t½ vertical markers */}
              {curves.map((c, idx) => c && c.halfLifeXFrac !== null && (
                <g
                  key={`m-${c.peptide.name}`}
                  style={{ opacity: markerOpacity(idx), transition: "opacity 0.18s ease" }}
                >
                  <line
                    x1={CHART.x0 + c.halfLifeXFrac * CHART.plotW} y1={CHART.y0}
                    x2={CHART.x0 + c.halfLifeXFrac * CHART.plotW} y2={CHART.y1}
                    stroke={c.color} strokeOpacity="0.25" strokeWidth="1" strokeDasharray="3 3"
                  />
                  <text x={CHART.x0 + c.halfLifeXFrac * CHART.plotW} y={CHART.y1 + 11}
                    textAnchor="middle" fontSize="7.5" fill={c.color} fillOpacity="0.6">t½</text>
                </g>
              ))}

              {/* Animated curve strokes */}
              <g clipPath={`url(#${clipId})`}>
                {curves.map((c, idx) => c && (
                  <g
                    key={`sg-${c.peptide.name}`}
                    style={{ opacity: curveOpacity(idx), transition: "opacity 0.18s ease" }}
                  >
                    <motion.path
                      d={c.curveD}
                      fill="none"
                      stroke={c.color}
                      strokeWidth={hoveredIdx === idx ? 2.8 : 2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.4, delay: idx * 0.25, ease: "easeOut" }}
                      style={{
                        filter: hoveredIdx === idx
                          ? `drop-shadow(0 0 8px ${c.color}c0)`
                          : `drop-shadow(0 0 5px ${c.color}90)`,
                      }}
                    />
                  </g>
                ))}
              </g>

              {/* Invisible wide hit-areas for curve hover — rendered on top */}
              <g clipPath={`url(#${clipId})`}>
                {curves.map((c, idx) => c && (
                  <path
                    key={`hit-${c.peptide.name}`}
                    d={c.curveD}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={isNonSCRoute(c.pk.route) ? "7 4" : undefined}
                    style={{ cursor: "crosshair" }}
                    onMouseEnter={e => handleCurveHover(idx, e)}
                    onMouseMove={e => handleCurveMove(idx, e)}
                    onMouseLeave={handleCurveLeave}
                    role="img"
                    aria-label={`${c.peptide.name} plasma concentration curve, t½ ${c.pk.halfLifeLabel}`}
                    tabIndex={0}
                    onFocus={() => handleLegendEnter(idx)}
                    onBlur={handleCurveLeave}
                  />
                ))}
              </g>

              {/* Continuation arrows for extended curves */}
              {curves.map((c, idx) => c && c.isExtended && (
                <text key={`arr-${c.peptide.name}`}
                  x={CHART.x1 + 3} y={c.lastY + 1}
                  fontSize="11" fill={c.color}
                  style={{ opacity: curveOpacity(idx), transition: "opacity 0.18s ease", fillOpacity: 0.7 }}>›</text>
              ))}

              {/* X-axis tick labels */}
              {xTicks.map((t, i) => (
                <text key={i} x={CHART.x0 + t.frac * CHART.plotW} y={CHART.y1 + 20}
                  textAnchor="middle" fontSize="9" fill="#fff" fillOpacity="0.35">{t.label}</text>
              ))}

              {/* X-axis unit */}
              <text x={CHART.x0 + CHART.plotW / 2} y={CHART.vbH - 3}
                textAnchor="middle" fontSize="8" fill="#fff" fillOpacity="0.22">
                Time ({useHours ? "hours" : "min"})
              </text>
            </svg>

            {/* Floating tooltip — fixed positioning so it's never clipped by overflow:hidden */}
            {tooltip && (
              <div
                className="pointer-events-none fixed z-50 px-2.5 py-1.5 rounded-md text-xs font-medium leading-tight"
                style={{
                  left: tooltip.clientX + 14,
                  top: tooltip.clientY - 42,
                  background: "rgba(10,10,16,0.92)",
                  border: `1px solid ${curves[hoveredIdx!]?.color ?? "#fff"}40`,
                  color: curves[hoveredIdx!]?.color ?? "#fff",
                  boxShadow: `0 2px 12px rgba(0,0,0,0.6)`,
                  backdropFilter: "blur(6px)",
                  whiteSpace: "nowrap",
                }}
                role="tooltip"
              >
                <span className="block font-semibold">{tooltip.label}</span>
                <span className="block opacity-70">t½ {tooltip.halfLife}</span>
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="p-3 pt-2 space-y-3">
          {curves.map((c, i) => {
            if (!c) {
              const missing = entries[i];
              return (
                <div key={missing.peptide.name} className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{missing.peptide.name}</span>
                  <p className="text-xs text-muted-foreground">{missing.peptide.description}</p>
                </div>
              );
            }
            const isActive = hoveredIdx === i;
            const isDimmed = hoveredIdx !== null && !isActive;
            return (
              <div
                key={c.peptide.name}
                className="flex flex-col gap-1 rounded-md px-1.5 py-1 -mx-1.5 cursor-default"
                style={{
                  opacity: isDimmed ? 0.3 : 1,
                  transition: "opacity 0.18s ease",
                  outline: isActive ? `1px solid ${c.color}30` : "1px solid transparent",
                  background: isActive ? `${c.color}08` : "transparent",
                }}
                onMouseEnter={e => handleLegendEnter(i, e)}
                onMouseMove={e => handleLegendMove(i, e)}
                onMouseLeave={handleLegendLeave}
                onFocus={e => handleLegendEnter(i, e)}
                onBlur={handleLegendLeave}
                tabIndex={0}
                role="listitem"
                aria-label={`${c.peptide.name}, half-life ${c.pk.halfLifeLabel}`}
                data-testid={`legend-row-${toTestSlug(c.peptide.name)}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: c.color,
                      boxShadow: isActive ? `0 0 10px ${c.color}` : `0 0 7px ${c.color}`,
                      transition: "box-shadow 0.18s ease",
                    }}
                  />
                  {isNonSCRoute(c.pk.route) && (
                    <svg width="14" height="4" viewBox="0 0 14 4" aria-hidden="true" className="flex-shrink-0">
                      <line x1="0" y1="2" x2="14" y2="2" stroke={c.color} strokeWidth="2" strokeDasharray="4 2.5" strokeLinecap="round" />
                    </svg>
                  )}
                  <span className="text-sm font-medium">{c.peptide.name}</span>
                  <span
                    className="text-[10px] font-medium px-1.5 py-px rounded"
                    style={{ backgroundColor: `${c.color}18`, color: c.color, border: `1px solid ${c.color}30` }}
                    data-testid={`badge-route-${toTestSlug(c.peptide.name)}`}
                  >
                    {routeAbbrev(c.pk.route)}
                  </span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border cursor-pointer"
                        style={{ borderColor: `${c.color}45`, backgroundColor: `${c.color}18`, color: c.color }}
                        data-testid={`chip-halflife-${toTestSlug(c.peptide.name)}`}
                        aria-label={`Pharmacokinetic half-life data for ${c.peptide.name}`}
                      >
                        <Clock className="h-3 w-3" />
                        <span>t½ {c.pk.halfLifeLabel}</span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4" side="top" align="start">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold">Plasma half-life: {c.pk.halfLifeLabel} ({c.pk.route})</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{c.pk.pkContext}</p>
                        {c.pk.note && <p className="text-[11px] text-muted-foreground/80 italic">{c.pk.note}</p>}
                        <div className="pt-1 border-t border-border/40">
                          <p className="text-[10px] text-muted-foreground mb-1">Primary citation:</p>
                          {c.pk.citations.map((cit, j) => (
                            <a key={j} href={cit.url} target="_blank" rel="noopener noreferrer"
                              className="text-[11px] text-[#21d8ff] hover:underline block">{cit.label}</a>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  {c.isExtended && (
                    <span className="text-[10px] text-muted-foreground/60 italic">curve extends beyond chart</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground pl-[18px]">{c.peptide.description}</p>
              </div>
            );
          })}
        </div>

        {showMismatch && (
          <div className="mx-3 mb-3 flex items-start gap-2 p-2.5 rounded-md bg-muted/20 border border-border/30">
            <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Kinetic profiles differ — researchers may account for peak timing in experimental design.
              {beyondViewNames.length > 0 && (
                <span className="block mt-0.5">
                  {beyondViewNames.length === 1
                    ? `${beyondViewNames[0]} extends beyond the current view.`
                    : beyondViewNames.length === 2
                      ? `${beyondViewNames[0]} and ${beyondViewNames[1]} extend beyond the current view.`
                      : `${beyondViewNames.slice(0, -1).join(", ")}, and ${beyondViewNames[beyondViewNames.length - 1]} extend beyond the current view.`}
                </span>
              )}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── End Pharmacokinetics Chart ───────────────────────────────────────────────

type PurchaseType = "one-time" | "subscription";
type SubscriptionInterval = "weekly" | "biweekly" | "monthly";

const subscriptionOptions: { value: SubscriptionInterval; label: string; discount: number }[] = [
  { value: "weekly", label: "Weekly", discount: 15 },
  { value: "biweekly", label: "Every 2 Weeks", discount: 12 },
  { value: "monthly", label: "Monthly", discount: 10 },
];


export default function ResearchStackDetail() {
  const [match, params] = useRoute("/research-stacks/:id");
  const [, setLocation] = useLocation();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [purchaseType, setPurchaseType] = useState<PurchaseType>("one-time");
  const [subscriptionInterval, setSubscriptionInterval] = useState<SubscriptionInterval>("monthly");
  const [synergyLevel, setSynergyLevel] = useState<"beginner" | "expert">("beginner");

  useEffect(() => {
    setSynergyLevel("beginner");
  }, [params?.id]);

  useEffect(() => {
    if (!match || !params?.id) return;
    const stack = RESEARCH_STACKS_BY_ID[params.id];
    if (!stack) {
      sessionStorage.setItem("stack-retired-redirect", "1");
      setLocation("/research-stacks");
    }
  }, [match, params?.id]);

  const { data: allProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: productsWithStock } = useQuery<any[]>({
    queryKey: ["/api/products-with-stock"],
  });

  const priceLookup = useMemo(() => {
    if (!productsWithStock) return new Map<string, number>();
    return buildPriceLookup(productsWithStock);
  }, [productsWithStock]);

  if (!match || !params?.id) {
    return null;
  }

  const stack = RESEARCH_STACKS_BY_ID[params.id];

  if (!stack) {
    return null;
  }

  const pricing = calculateStackPricing(params.id, priceLookup);
  const pricingReady = pricing !== null;

  const pathwayOverlaps = detectPathwayOverlaps(
    stack.peptides
      .map(p => resolveDatasetSlug(p.name))
      .filter((s): s is string => Boolean(s))
  );
  const getBasePrice = () => pricing?.stackPrice ?? 0;

  const getSelectedDiscount = () => {
    if (purchaseType === "one-time") return 0;
    const option = subscriptionOptions.find(o => o.value === subscriptionInterval);
    return option?.discount || 0;
  };

  const getDiscountedPrice = () => {
    const basePrice = getBasePrice();
    const discount = getSelectedDiscount();
    return basePrice * (1 - discount / 100);
  };

  const getTotalPrice = () => {
    return getDiscountedPrice() * quantity;
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(10, prev + delta)));
  };

  const handleAddToCart = async () => {
    await addToCart({
      productId: stack.id,
      bundleId: stack.id,
      name: stack.name,
      price: getBasePrice(),
      quantity,
      dosage: "Research Stack",
      image: productImage,
      isBundle: true,
    });
    toast({
      title: "Added to Cart",
      description: `${stack.name} has been added to your cart.`,
      action: (
        <ToastAction altText="View Cart" onClick={() => setLocation('/cart')} className="bg-[#E7FB10] text-black border-[#E7FB10] hover:bg-[#E7FB10]/90 font-semibold">
          View Cart
        </ToastAction>
      ),
    });
  };

  const handleBuyNow = async () => {
    await addToCart({
      productId: stack.id,
      bundleId: stack.id,
      name: stack.name,
      price: getBasePrice(),
      quantity,
      dosage: "Research Stack",
      image: productImage,
      isBundle: true,
    });
    window.location.href = '/checkout?fromCart=true';
  };

  return (
    <main className="min-h-screen pt-24 md:pt-40 pb-12 overflow-x-hidden">
      <SEOHead 
        title={`${stack.name} | Research Stack`}
        description={stack.description}
        canonicalPath={`/research-stacks/${stack.id}`}
      />
      <div className="max-w-7xl mx-auto px-4 pr-6 md:px-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-2 md:mb-4">
          <Link href="/research-stacks">
            <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 md:-ml-4 md:gap-2" data-testid="button-back-stacks">
              <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden md:inline">Back to Research Stacks</span>
              <span className="md:hidden">Back</span>
            </Button>
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col">
            <Card className="overflow-hidden border-[#2a2a32] sticky top-24">
              <div
                className="relative aspect-square bg-gradient-to-br from-[#1a1a1f] to-[#0d0d10] flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${stack.color}15, transparent 70%), linear-gradient(135deg, #1a1a1f, #0d0d10)`,
                }}
              >
                {stack.badge && (
                  <Badge
                    className="absolute top-4 right-4"
                    style={{
                      backgroundColor: stack.badgeColor,
                      color: stack.badgeColor === "#E7FB10" || stack.badgeColor === "#f59e0b" ? "black" : "white",
                    }}
                    data-testid="badge-stack-type"
                  >
                    {stack.badge}
                  </Badge>
                )}
                <div className="text-center">
                  <div className="w-40 h-40 md:w-48 md:h-48 rounded-3xl mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: `${stack.color}20` }}>
                    <Package className="h-20 w-20 md:h-24 md:w-24" style={{ color: stack.color }} />
                  </div>
                  <div className="flex justify-center gap-2 mt-4">
                    {stack.peptides.map((peptide, i) => (
                      <div key={i} className="w-4 h-4 rounded-full border-2 border-[#1a1a1f]" style={{ backgroundColor: stack.color }} />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {stack.peptides.length} peptide{stack.peptides.length > 1 ? "s" : ""} included
                  </p>
                </div>
              </div>
            </Card>


            {stack.educationLinks.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.12 }}
                className="mt-16 hidden md:block relative z-10 bg-background"
                data-testid="section-education-desktop"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-[#ec4899]" />
                    <h3 className="font-display text-lg font-bold">Learn About These Peptides</h3>
                  </div>
                  <Link href="/guides/peptide-education-center">
                    <Button variant="outline" size="sm" className="border-[#ec4899]/30 hover:border-[#ec4899]" data-testid="link-view-all-education">
                      All Articles
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>

                <div className="space-y-2">
                  {stack.educationLinks.map((link) => (
                    <Link key={link.peptideName} href={link.articleUrl}>
                      <Card
                        className="p-4 border-[#ec4899]/20 md:hover:border-[#ec4899]/40 transition-all duration-300 cursor-pointer group md:hover:scale-[1.02] md:active:scale-[1.02] md:hover:shadow-[0_0_20px_rgba(236,72,153,0.3)]"
                        data-testid={`card-article-${link.peptideName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-[#ec4899]/10 flex-shrink-0">
                            <BookOpen className="h-5 w-5 text-[#ec4899]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="border-[#ec4899]/50 text-[#ec4899] text-xs">
                                Research Guide
                              </Badge>
                            </div>
                            <h4 className="font-display text-base md:text-lg font-bold group-hover:text-[#ec4899] transition-colors uppercase tracking-tight leading-tight">{link.articleTitle}</h4>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Storage Information - DESKTOP ONLY */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.14 }}
              className="mt-8 hidden md:block"
              data-testid="section-storage-desktop"
            >
              <h3 className="font-display font-semibold text-lg mb-4">Storage Information</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {stack.storageGuide}
              </p>
              <div className="py-2">
                <Link href="/guides/storage-101">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-block"
                  >
                    <Button 
                      className="gap-2 bg-gradient-to-r from-[#21d8ff] to-[#9d4edd] text-black font-semibold md:hover:shadow-[0_0_20px_rgba(33,216,255,0.6)] transition-shadow" 
                      data-testid="link-learn-storage-desktop"
                    >
                      <BookOpen className="h-4 w-4" />
                      Learn More: Storage Best Practices
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </motion.section>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="min-w-0 overflow-hidden">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="secondary" className="text-xs uppercase tracking-wider">
                Research Stack
              </Badge>
              {stack.peptides.map((peptide) => (
                <Badge
                  key={peptide.name}
                  variant="outline"
                  className="text-xs"
                  style={{ borderColor: stack.color, color: stack.color }}
                  data-testid={`badge-peptide-${peptide.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                >
                  {peptide.name}
                </Badge>
              ))}
            </div>

            <h1 className="font-display text-3xl md:text-6xl font-bold mb-1 md:mb-2 uppercase tracking-tighter leading-none" data-testid="text-stack-name">
              {stack.name}
            </h1>

            <div className="mb-2 md:mb-3">
              <div className="flex items-baseline gap-2 md:gap-3 flex-wrap">
                <span className="font-display text-2xl md:text-3xl font-bold text-[#E7FB10]" data-testid="text-stack-price">
                  ${getBasePrice().toFixed(2)}
                </span>
                <span className="text-lg text-muted-foreground line-through" data-testid="text-stack-retail-value">
                  ${pricing?.retailValue.toFixed(2) ?? "—"}
                </span>
              </div>
            </div>

            <p className="hidden md:block text-sm text-muted-foreground leading-relaxed mb-4" data-testid="text-stack-description">
              {stack.longDescription}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-3 md:mb-4">
              <div>
                <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">Quantity</Label>
                <div className="flex items-center border rounded-md h-9 border-border">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    data-testid="button-quantity-minus"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="flex-1 text-center font-medium text-sm" data-testid="text-quantity">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 10}
                    data-testid="button-quantity-plus"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mb-3 md:mb-4">
              <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">Purchase Option</Label>
              <div className="grid grid-cols-2 gap-2">
                <div
                  className={`relative flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    purchaseType === "one-time" ? "border-[#E7FB10] bg-[#E7FB10]/5" : "border-border hover:border-border/80"
                  }`}
                  onClick={() => setPurchaseType("one-time")}
                  data-testid="option-one-time"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <ShoppingCart className="h-3.5 w-3.5" />
                      <span className="font-medium text-sm">One-time</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">${getBasePrice().toFixed(2)}</p>
                  </div>
                </div>

                <div
                  className={`relative flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    purchaseType === "subscription" ? "border-[#21d8ff] bg-[#21d8ff]/5" : "border-border hover:border-border/80"
                  }`}
                  onClick={() => setPurchaseType("subscription")}
                  data-testid="option-subscription"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <Repeat className="h-3.5 w-3.5" />
                      <span className="font-medium text-sm">Subscribe</span>
                      <Badge className="bg-[#21d8ff] text-[10px] px-1 py-0">15% off</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Auto-delivery</p>
                  </div>
                </div>
              </div>
            </div>

            {purchaseType === "subscription" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 md:mb-4"
              >
                <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">Delivery Frequency</Label>
                <div className="grid grid-cols-3 gap-2">
                  {subscriptionOptions.map((option) => {
                    const discountedPrice = getBasePrice() * (1 - option.discount / 100);
                    return (
                      <div
                        key={option.value}
                        className={`relative flex flex-col items-center p-2 rounded-lg border cursor-pointer transition-all ${
                          subscriptionInterval === option.value ? "border-[#21d8ff] bg-[#21d8ff]/5" : "border-border hover:border-border/80"
                        }`}
                        onClick={() => setSubscriptionInterval(option.value)}
                        data-testid={`option-interval-${option.value}`}
                      >
                        <span className="font-medium text-xs">{option.label}</span>
                        <span className="text-[10px] text-[#21d8ff]">{option.discount}% off</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 md:mb-3">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                In Stock
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Lab Tested
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="h-3 w-3" /> Fast Ship
                </span>
              </div>
            </div>

            <div className="md:hidden flex items-center gap-2 p-2.5 rounded-lg bg-red-950/30 border border-red-500/40 mb-3" data-testid="card-ruo-mobile">
              <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <span className="text-xs text-red-400 font-medium">Research Use Only - Not for human consumption</span>
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                variant="outline"
                className="flex-1 font-display gap-2 border-2 md:hover:border-[#21d8ff] md:hover:text-[#21d8ff] md:hover:shadow-[0_0_15px_rgba(33,216,255,0.3)] transition-all duration-300"
                onClick={handleAddToCart}
                disabled={!pricingReady}
                data-testid="button-add-to-cart"
              >
                <ShoppingBag className="h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                className={`flex-1 font-display gap-2 transition-shadow duration-300 text-black ${
                  purchaseType === "subscription"
                    ? "bg-[#21d8ff] border-[#21d8ff] md:hover:bg-[#21d8ff]/90 shadow-[0_0_20px_rgba(33,216,255,0.4)] md:hover:shadow-[0_0_40px_rgba(33,216,255,0.6)]"
                    : "bg-[#E7FB10] border-[#E7FB10] md:hover:bg-[#E7FB10]/90 shadow-[0_0_20px_rgba(231,251,16,0.4)] md:hover:shadow-[0_0_40px_rgba(231,251,16,0.6)]"
                }`}
                onClick={handleBuyNow}
                disabled={!pricingReady}
                data-testid="button-buy-now"
              >
                {purchaseType === "subscription" ? (
                  <>
                    <Repeat className="h-5 w-5" />
                    Subscribe
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    Buy Now
                  </>
                )}
              </Button>
            </div>

            {purchaseType === "subscription" && (
              <p className="text-[10px] text-center text-muted-foreground mt-1">
                Save ${((getBasePrice() - getDiscountedPrice()) * quantity).toFixed(2)} per order • Cancel anytime
              </p>
            )}

            <Collapsible className="md:hidden mt-4">
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="w-full justify-between text-sm"
                  data-testid="button-toggle-description-mobile"
                >
                  <span className="text-muted-foreground">About this stack</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-stack-description-mobile">
                  {stack.longDescription}
                </p>
              </CollapsibleContent>
            </Collapsible>

            <Separator className="my-4 md:my-6" />

            <div className="grid grid-cols-4 gap-2 text-center mb-4 md:mb-6">
              <div className="flex flex-col items-center gap-1">
                <Shield className="h-4 w-4 text-[#21d8ff]" />
                <span className="text-[10px] text-muted-foreground">3rd Party Tested</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <FileCheck className="h-4 w-4 text-[#21d8ff]" />
                <span className="text-[10px] text-muted-foreground">COA Included</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Truck className="h-4 w-4 text-[#21d8ff]" />
                <span className="text-[10px] text-muted-foreground">Fast Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RefreshCw className="h-4 w-4 text-[#21d8ff]" />
                <span className="text-[10px] text-muted-foreground">Guaranteed</span>
              </div>
            </div>

            {stack.educationLinks.length > 0 && (
              <Collapsible className="md:hidden mb-6">
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between border-[#ec4899]/30 hover:border-[#ec4899] text-sm"
                    data-testid="button-toggle-education-mobile"
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-[#ec4899]" />
                      <span>Learn About These Peptides</span>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-2">
                  {stack.educationLinks.map((link) => (
                    <Link key={link.peptideName} href={link.articleUrl}>
                      <Card 
                        className="p-3 border-[#ec4899]/20 hover:border-[#ec4899]/40 transition-all cursor-pointer"
                        data-testid={`card-article-mobile-${link.peptideName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-4 w-4 text-[#ec4899] flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium truncate">{link.articleTitle}</h4>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </Card>
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            {stack.keyBenefits.length > 0 && (
              <div className="mb-8">
                <h3 className="font-display font-semibold text-lg mb-4">Key Benefits</h3>
                <ul className="space-y-3">
                  {stack.keyBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-[#E7FB10] mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <PharmacokineticsChart peptides={stack.peptides} />

            <div className="mb-8" data-testid="section-synergy-explanation">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" style={{ color: stack.color }} />
                  <h3 className="font-display font-semibold text-lg">Why These Peptides Work Together</h3>
                </div>
                <div role="group" aria-label="Synergy explanation level" className="flex items-center gap-1 p-0.5 rounded-md border border-border bg-muted/30">
                  <Button
                    aria-pressed={synergyLevel === "beginner"}
                    variant="ghost"
                    size="sm"
                    className={`h-7 px-3 text-xs rounded-sm transition-colors ${synergyLevel === "beginner" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
                    onClick={() => setSynergyLevel("beginner")}
                    data-testid="button-synergy-beginner"
                  >
                    Overview
                  </Button>
                  <Button
                    aria-pressed={synergyLevel === "expert"}
                    variant="ghost"
                    size="sm"
                    className={`h-7 px-3 text-xs rounded-sm transition-colors ${synergyLevel === "expert" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
                    onClick={() => setSynergyLevel("expert")}
                    data-testid="button-synergy-expert"
                  >
                    Mechanistic
                  </Button>
                </div>
              </div>
              <Card className="p-4 border-border/60" data-testid="card-synergy-content">
                <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-synergy-copy">
                  {synergyLevel === "beginner" ? stack.synergy.beginner : stack.synergy.expert}
                </p>
              </Card>
            </div>

            {pathwayOverlaps.length > 0 && (
              <div id="pathway-overlap" className="mb-6" data-testid="section-pathway-overlap-detail">
                <PathwayOverlapCard overlaps={pathwayOverlaps} intentional={stack.intentionalOverlap} />
              </div>
            )}

            <div className="mb-8 overflow-visible md:hidden">
              <h3 className="font-display font-semibold text-lg mb-4">Storage Information</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {stack.storageGuide}
              </p>
              <Link href="/guides/storage-101">
                <Button 
                  className="gap-2 bg-gradient-to-r from-[#21d8ff] to-[#9d4edd] text-black font-semibold transition-shadow" 
                  data-testid="link-learn-storage-mobile"
                >
                  <BookOpen className="h-4 w-4" />
                  Learn More: Storage Best Practices
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>

          </motion.div>
        </div>

        {/* RUO Disclaimer - DESKTOP ONLY - Full width below both columns */}
        <Card className="p-6 bg-red-950/30 border-2 border-red-500/50 animate-pulse-subtle mt-8 hidden md:block" data-testid="card-ruo-disclaimer-desktop">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-red-500/20 border border-red-500/30 flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h4 className="font-display font-bold text-red-400 uppercase tracking-wider text-lg mb-2">
                Research Use Only
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This product is sold for research purposes only and is not intended 
                for human consumption. By purchasing, you confirm you are a qualified 
                researcher and will use this product in accordance with all applicable 
                federal and state laws and regulations.
              </p>
            </div>
          </div>
        </Card>

        {/* Works Well With - Synergy Recommendations */}
        {(() => {
          const stackPeptideNames = stack.peptides.map(p => p.name);
          const stackNorms = new Set(stackPeptideNames.map(n => normalizePeptideName(n)));

          const partnerMap = new Map<string, { partner: string; stack: { name: string }; synergyBonus: number }>();
          for (const peptideName of stackPeptideNames) {
            const partners = getSynergyPartners(peptideName);
            for (const p of partners) {
              const norm = normalizePeptideName(p.partner);
              if (stackNorms.has(norm)) continue;
              const existing = partnerMap.get(norm);
              if (!existing || p.synergyBonus > existing.synergyBonus) {
                partnerMap.set(norm, p);
              }
            }
          }

          const sortedPartners = Array.from(partnerMap.values()).sort((a, b) => b.synergyBonus - a.synergyBonus);

          const matchingProducts = sortedPartners
            .map(sp => {
              const product = allProducts?.find(p => {
                if (p.category === "Research Stacks" || p.category === "Supplies" || p.category === "Research Compounds") return false;
                const normalizedProductName = normalizePeptideName(p.name);
                return normalizePeptideName(sp.partner) === normalizedProductName ||
                  normalizedProductName.includes(normalizePeptideName(sp.partner)) ||
                  normalizePeptideName(sp.partner).includes(normalizedProductName);
              });
              return product ? { product, synergy: sp } : null;
            })
            .filter(Boolean) as { product: Product; synergy: { partner: string; stack: { name: string }; synergyBonus: number } }[];

          if (matchingProducts.length === 0) return null;

          return (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-12"
              data-testid="section-synergy-recommendations"
            >
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Layers className="h-6 w-6 text-[#22c55e]" />
                <h2 className="font-display text-2xl font-bold">Works Well With</h2>
              </div>

              <p className="text-muted-foreground mb-6">
                Research-backed pairings based on complementary mechanisms of action.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                {matchingProducts.slice(0, 3).map(({ product: partnerProduct, synergy }) => {
                  const pairingReason = (() => {
                    for (const peptideName of stackPeptideNames) {
                      const reason = getTopPairingForProduct(peptideName, partnerProduct.name);
                      if (reason) return reason;
                    }
                    return null;
                  })();

                  return (
                    <Link key={partnerProduct.id} href={`/peptides/${partnerProduct.slug || partnerProduct.id}`} className="h-full" data-testid={`link-synergy-${partnerProduct.id}`}>
                      <Card
                        className="p-4 border-[#22c55e]/20 cursor-pointer hover-elevate h-full"
                        data-testid={`card-synergy-${partnerProduct.slug}`}
                      >
                        <div className="flex flex-wrap items-start gap-4 h-full">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-card flex-shrink-0">
                            <img
                              src={partnerProduct.imageUrl || productImage}
                              alt={partnerProduct.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col h-full">
                            <p className="font-medium text-sm truncate">
                              {partnerProduct.name}
                            </p>
                            <Badge
                              className="mt-2 text-xs bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30"
                            >
                              <Zap className="h-3 w-3 mr-1" />
                              {synergy.stack.name} • {synergy.synergyBonus}%
                            </Badge>
                            {pairingReason && (
                              <p className="text-xs text-muted-foreground mt-2 line-clamp-2 flex-1">
                                {pairingReason.mechanism}
                              </p>
                            )}
                            {!pairingReason && <div className="flex-1" />}
                            <p className="text-sm font-bold text-[#E7FB10] mt-2 mt-auto">
                              ${Number(partnerProduct.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-center">
                <Link href="/research-stacks?tab=custom" data-testid="link-build-custom-stack">
                  <Button className="bg-gradient-to-r from-[#22c55e] to-[#21d8ff] text-black font-bold">
                    <Layers className="h-4 w-4 mr-2" />
                    Build a Custom Stack
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </motion.section>
          );
        })()}

      </div>
    </main>
  );
}
