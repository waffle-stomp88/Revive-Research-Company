import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Lock, Clock, Info, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getHalfLifeByName, hasKineticMismatch, PK_VISIBLE_LOWER_RATIO, PK_VISIBLE_UPPER_RATIO } from "@/data/pharmacokinetics";
import type { HalfLifeEntry } from "@/data/pharmacokinetics";
import { isNonSCRoute, pkMidpoint, computeXMax, buildPKCurve, ptsToD } from "@/lib/pk-curve";

export interface StackPeptide {
  name: string;
  description: string;
}

function routeAbbrev(route: string): string {
  const r = route.toLowerCase();
  if (r === "subcutaneous") return "SC";
  if (r === "intravenous") return "IV";
  if (r === "intranasal") return "IN";
  if (r === "oral") return "Oral";
  if (r === "topical") return "Topical";
  return route;
}

const ROUTE_LABELS: Record<string, string> = {
  subcutaneous: "Subcutaneous — injected just under the skin",
  intravenous:  "Intravenous — administered directly into a vein",
  intranasal:   "Intranasal — administered through the nasal passage",
  oral:         "Oral — taken by mouth",
  topical:      "Topical — applied directly to the skin",
};

function routeLabel(route: string): string {
  return ROUTE_LABELS[route.toLowerCase()] ?? route.charAt(0).toUpperCase() + route.slice(1);
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

const PK_ZOOM_STORAGE_KEY_PREFIX = "pk-zoom-range-";
const PK_PIN_STORAGE_PREFIX = "pk-pin-";

function readStoredZoom(stackId: string): number | null {
  try {
    const raw = localStorage.getItem(PK_ZOOM_STORAGE_KEY_PREFIX + stackId);
    if (raw === null || raw === "auto") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function writeStoredZoom(stackId: string, value: number | null): void {
  try {
    if (value === null) {
      localStorage.removeItem(PK_ZOOM_STORAGE_KEY_PREFIX + stackId);
    } else {
      localStorage.setItem(PK_ZOOM_STORAGE_KEY_PREFIX + stackId, String(value));
    }
  } catch {
    // ignore
  }
}

function readStoredPin(stackId: string): string | null {
  try {
    return sessionStorage.getItem(PK_PIN_STORAGE_PREFIX + stackId);
  } catch {
    return null;
  }
}

function writeStoredPin(stackId: string, name: string | null): void {
  try {
    if (name === null) {
      sessionStorage.removeItem(PK_PIN_STORAGE_PREFIX + stackId);
    } else {
      sessionStorage.setItem(PK_PIN_STORAGE_PREFIX + stackId, name);
    }
  } catch {
    // ignore
  }
}

export function PharmacokineticsChart({ peptides, stackId }: { peptides: StackPeptide[]; stackId: string }) {
  const [selectedRange, setSelectedRange] = useState<number | null>(() => readStoredZoom(stackId));
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [pinnedIdx, setPinnedIdx] = useState<number | null>(() => {
    const storedName = readStoredPin(stackId);
    if (storedName === null) return null;
    const idx = peptides.findIndex(p => p.name === storedName);
    return idx >= 0 ? idx : null;
  });
  const [tooltip, setTooltip] = useState<{ clientX: number; clientY: number; label: string; halfLife: string; concentration: number; timeDisp: string } | null>(null);
  const [crosshairSvgX, setCrosshairSvgX] = useState<number | null>(null);
  const chartWrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const isSingleCompound = peptides.length === 1;

  function handleRangeChange(value: number | null) {
    writeStoredZoom(stackId, value);
    setSelectedRange(value);
  }

  const peptideKey = peptides.map(p => p.name).join("|");
  useEffect(() => {
    setSelectedRange(readStoredZoom(stackId));
    setPinnedIdx(null);
    writeStoredPin(stackId, null);
  }, [peptideKey, stackId]);

  useEffect(() => {
    if (pinnedIdx === null) {
      writeStoredPin(stackId, null);
    } else {
      const name = peptides[pinnedIdx]?.name ?? null;
      writeStoredPin(stackId, name);
    }
  }, [pinnedIdx, stackId]); // eslint-disable-line react-hooks/exhaustive-deps

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
    const pts = buildPKCurve(mid, xMaxMin, CHART);
    const lastY = pts[pts.length - 1].y;
    const isExtended = mid === null || mid > xMaxMin * 0.5;
    const halfLifeXFrac = mid !== null && mid <= xMaxMin ? mid / xMaxMin : null;
    return { peptide, pk, color, pts, isExtended, halfLifeXFrac, lastY, curveD: ptsToD(pts), areaD: ptsToAreaD(pts) };
  });

  const definedPks = pksWithData;

  const visiblePks = definedPks.filter((pk) => {
    const mid = pkMidpoint(pk);
    if (mid === null) return false;
    return mid >= xMaxMin / PK_VISIBLE_LOWER_RATIO && mid <= xMaxMin * PK_VISIBLE_UPPER_RATIO;
  });
  const showMismatch = visiblePks.length >= 2 ? hasKineticMismatch(visiblePks) : false;

  const beyondViewNames = definedPks
    .filter((pk) => { const mid = pkMidpoint(pk); return mid !== null && mid > xMaxMin; })
    .map((pk) => pk.name);

  const hasCurves = curves.some(Boolean);
  const hasNonSC = pksWithData.some(pk => isNonSCRoute(pk.route));
  const clipId = "pk-clip-" + peptides.map(p => toTestSlug(p.name)).join("-");

  const effectiveIdx = pinnedIdx ?? hoveredIdx;

  const curveOpacity = useCallback((idx: number) => {
    if (effectiveIdx === null) return 1;
    return idx === effectiveIdx ? 1 : 0.12;
  }, [effectiveIdx]);

  const markerOpacity = useCallback((idx: number) => {
    if (effectiveIdx === null) return 1;
    return idx === effectiveIdx ? 1 : 0.06;
  }, [effectiveIdx]);

  const getCrosshairData = useCallback((idx: number, e: React.MouseEvent) => {
    const c = curves[idx];
    if (!c || !svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = Math.max(CHART.x0, Math.min(CHART.x1,
      ((e.clientX - rect.left) / rect.width) * CHART.vbW
    ));
    const frac = (svgX - CHART.x0) / CHART.plotW;
    const N = c.pts.length - 1;
    const rawIdx = frac * N;
    const lo = Math.max(0, Math.floor(rawIdx));
    const hi = Math.min(N, Math.ceil(rawIdx));
    const t = rawIdx - lo;
    const yLo = c.pts[lo].y;
    const yHi = c.pts[hi].y;
    const yInterp = yLo + (yHi - yLo) * t;
    const concentration = Math.max(0, Math.min(1, 1 - (yInterp - CHART.y0) / CHART.plotH));
    const timeMin = frac * xMaxMin;
    const timeDisp = useHours
      ? `${(timeMin / 60).toFixed(1)} h`
      : `${Math.round(timeMin)} min`;
    return { svgX, concentration, timeDisp };
  }, [curves, xMaxMin, useHours]);

  const handleCurveHover = useCallback((idx: number, e: React.MouseEvent) => {
    const c = curves[idx];
    if (!c) return;
    setHoveredIdx(idx);
    const crosshair = getCrosshairData(idx, e);
    setCrosshairSvgX(crosshair?.svgX ?? null);
    setTooltip({
      clientX: e.clientX,
      clientY: e.clientY,
      label: c.peptide.name,
      halfLife: c.pk.halfLifeLabel,
      concentration: crosshair?.concentration ?? 0,
      timeDisp: crosshair?.timeDisp ?? "",
    });
  }, [curves, getCrosshairData]);

  const handleCurveMove = useCallback((idx: number, e: React.MouseEvent) => {
    const c = curves[idx];
    if (!c) return;
    const crosshair = getCrosshairData(idx, e);
    if (crosshair) {
      setCrosshairSvgX(crosshair.svgX);
      setTooltip(prev => prev ? {
        ...prev,
        clientX: e.clientX,
        clientY: e.clientY,
        concentration: crosshair.concentration,
        timeDisp: crosshair.timeDisp,
      } : prev);
    }
  }, [curves, getCrosshairData]);

  const handleCurveLeave = useCallback(() => {
    setHoveredIdx(null);
    setTooltip(null);
    setCrosshairSvgX(null);
  }, []);

  const handleCurveClick = useCallback((idx: number) => {
    const c = curves[idx];
    if (!c) return;
    setPinnedIdx(prev => prev === idx ? null : idx);
  }, [curves]);

  const handleLegendEnter = useCallback((idx: number, e?: React.MouseEvent | React.FocusEvent) => {
    const c = curves[idx];
    if (!c) return;
    setHoveredIdx(idx);
    const clientX = (e as React.MouseEvent)?.clientX ?? 0;
    const clientY = (e as React.MouseEvent)?.clientY ?? 0;
    if (clientX || clientY) {
      setTooltip({ clientX, clientY, label: c.peptide.name, halfLife: c.pk.halfLifeLabel, concentration: -1, timeDisp: "" });
    }
  }, [curves]);

  const handleLegendMove = useCallback((idx: number, e: React.MouseEvent) => {
    const c = curves[idx];
    if (!c) return;
    setTooltip({ clientX: e.clientX, clientY: e.clientY, label: c.peptide.name, halfLife: c.pk.halfLifeLabel, concentration: -1, timeDisp: "" });
  }, [curves]);

  const handleLegendLeave = useCallback(() => {
    setHoveredIdx(null);
    setTooltip(null);
    setCrosshairSvgX(null);
  }, []);

  const handleLegendClick = useCallback((idx: number) => {
    const c = curves[idx];
    if (!c) return;
    setPinnedIdx(prev => prev === idx ? null : idx);
  }, [curves]);

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
              ref={svgRef}
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

              {/* Invisible wide hit-areas for curve hover/click — rendered on top */}
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
                    style={{ cursor: "pointer" }}
                    onMouseEnter={e => handleCurveHover(idx, e)}
                    onMouseMove={e => handleCurveMove(idx, e)}
                    onMouseLeave={handleCurveLeave}
                    onClick={() => handleCurveClick(idx)}
                    role="button"
                    aria-label={`${c.peptide.name} plasma concentration curve, t½ ${c.pk.halfLifeLabel}${pinnedIdx === idx ? " (pinned)" : ""}`}
                    aria-pressed={pinnedIdx === idx}
                    tabIndex={0}
                    onFocus={() => handleLegendEnter(idx)}
                    onBlur={handleCurveLeave}
                    onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleCurveClick(idx); } }}
                  />
                ))}
              </g>

              {/* Vertical crosshair line */}
              {crosshairSvgX !== null && hoveredIdx !== null && (
                <line
                  x1={crosshairSvgX} y1={CHART.y0}
                  x2={crosshairSvgX} y2={CHART.y1}
                  stroke={curves[hoveredIdx]?.color ?? "#fff"}
                  strokeOpacity="0.55"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  pointerEvents="none"
                />
              )}

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
                {tooltip.concentration >= 0 && (
                  <span className="block opacity-80 tabular-nums">~{Math.round(tooltip.concentration * 100)}% at {tooltip.timeDisp}</span>
                )}
                <span className="block opacity-50 text-[10px] mt-0.5">t½ {tooltip.halfLife}</span>
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="p-3 pt-2 space-y-3">
          {hasCurves && !isSingleCompound && (

            <p className="text-[10px] text-muted-foreground/50 mb-1 select-none" data-testid="text-pin-hint">
              {pinnedIdx !== null ? "Click the highlighted row to unpin" : "Click a curve or row to pin the highlight"}
            </p>
          )}
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
            const isPinned = pinnedIdx === i;
            const isActive = effectiveIdx === i;
            const isDimmed = effectiveIdx !== null && !isActive;
            return (
              <div
                key={c.peptide.name}
                className="flex flex-col gap-1 rounded-md px-1.5 py-1 -mx-1.5 cursor-pointer select-none"
                style={{
                  opacity: isDimmed ? 0.3 : 1,
                  transition: "opacity 0.18s ease",
                  outline: isActive ? `1px solid ${c.color}${isPinned ? "60" : "30"}` : "1px solid transparent",
                  background: isActive ? `${c.color}${isPinned ? "14" : "08"}` : "transparent",
                }}
                onMouseEnter={e => handleLegendEnter(i, e)}
                onMouseMove={e => handleLegendMove(i, e)}
                onMouseLeave={handleLegendLeave}
                onClick={() => handleLegendClick(i)}
                onFocus={e => handleLegendEnter(i, e)}
                onBlur={handleLegendLeave}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleLegendClick(i); } }}
                tabIndex={0}
                role="button"
                aria-pressed={isPinned}
                aria-label={`${c.peptide.name}, half-life ${c.pk.halfLifeLabel}${isPinned ? " (pinned)" : ""}`}
                data-testid={`legend-row-${toTestSlug(c.peptide.name)}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: c.color,
                      boxShadow: isActive ? `0 0 ${isPinned ? "14px" : "10px"} ${c.color}` : `0 0 7px ${c.color}`,
                      transition: "box-shadow 0.18s ease",
                    }}
                  />
                  {isNonSCRoute(c.pk.route) && (
                    <svg width="14" height="4" viewBox="0 0 14 4" aria-hidden="true" className="flex-shrink-0">
                      <line x1="0" y1="2" x2="14" y2="2" stroke={c.color} strokeWidth="2" strokeDasharray="4 2.5" strokeLinecap="round" />
                    </svg>
                  )}
                  <span className="text-sm font-medium">{c.peptide.name}</span>
                  {isPinned && (
                    <Lock
                      className="h-3 w-3 flex-shrink-0"
                      style={{ color: c.color, opacity: 0.85 }}
                      aria-hidden="true"
                      data-testid={`icon-pinned-${toTestSlug(c.peptide.name)}`}
                    />
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className="text-[10px] font-medium px-1.5 py-px rounded cursor-default"
                        style={{ backgroundColor: `${c.color}18`, color: c.color, border: `1px solid ${c.color}30` }}
                        data-testid={`badge-route-${toTestSlug(c.peptide.name)}`}
                      >
                        {routeAbbrev(c.pk.route)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">{routeLabel(c.pk.route)}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border cursor-pointer"
                        style={{ borderColor: `${c.color}45`, backgroundColor: `${c.color}18`, color: c.color }}
                        data-testid={`chip-halflife-${toTestSlug(c.peptide.name)}`}
                        aria-label={`Pharmacokinetic half-life data for ${c.peptide.name}`}
                        onClick={e => e.stopPropagation()}
                      >
                        <Clock className="h-3 w-3" />
                        <span>t½ {c.pk.halfLifeLabel}</span>
                        <ExternalLink className="h-2.5 w-2.5 opacity-60 ml-0.5" />
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
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/60 italic cursor-pointer hover:text-muted-foreground transition-colors"
                          data-testid={`button-extended-info-${toTestSlug(c.peptide.name)}`}
                          aria-label="What does curve extends beyond chart mean?"
                          onClick={e => e.stopPropagation()}
                        >
                          <span>curve extends beyond chart</span>
                          <Info className="h-3 w-3 flex-shrink-0" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 text-xs" side="top" align="start">
                        <p className="font-medium text-foreground mb-1">Extends beyond the current view</p>
                        <p className="text-muted-foreground leading-relaxed">
                          This compound has not yet reached its 50% decay point (t½) within the selected time window. Its full peak-to-trough profile extends past the right edge of the chart, so the curve's descent is not visible here. Widen the time range to see the complete kinetic profile.
                        </p>
                      </PopoverContent>
                    </Popover>
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
            <div className="text-xs text-muted-foreground leading-relaxed">
              Kinetic profiles differ — researchers may account for peak timing in experimental design.
              {beyondViewNames.length > 0 && (
                <div className="flex items-center mt-0.5">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        data-testid="button-beyond-view-info"
                        className="inline-flex items-center gap-1 text-left text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="What does extends beyond the current view mean?"
                      >
                        <span>
                          {beyondViewNames.length === 1
                            ? `${beyondViewNames[0]} extends beyond the current view.`
                            : beyondViewNames.length === 2
                              ? `${beyondViewNames[0]} and ${beyondViewNames[1]} extend beyond the current view.`
                              : `${beyondViewNames.slice(0, -1).join(", ")}, and ${beyondViewNames[beyondViewNames.length - 1]} extend beyond the current view.`}
                        </span>
                        <Info className="h-3 w-3 flex-shrink-0" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 text-xs" side="top" align="start">
                      <p className="font-medium text-foreground mb-1">Extends beyond the current view</p>
                      <p className="text-muted-foreground leading-relaxed">
                        This compound has not yet reached its 50% decay point (t½) within the selected time window. Its full peak-to-trough profile extends past the right edge of the chart, so the curve's descent is not visible here. Widen the time range to see the complete kinetic profile.
                      </p>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
