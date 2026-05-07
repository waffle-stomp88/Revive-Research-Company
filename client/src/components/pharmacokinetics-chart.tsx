import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Lock, Clock, Info, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getHalfLifeByName, hasKineticMismatch, PK_VISIBLE_LOWER_RATIO, PK_VISIBLE_UPPER_RATIO } from "@/data/pharmacokinetics";
import type { HalfLifeEntry } from "@/data/pharmacokinetics";
import { isNonSCRoute, pkMidpoint, computeXMax, buildPKCurve, ptsToD } from "@/lib/pk-curve";
import { readStoredZoom, writeStoredZoom } from "@/lib/zoom-storage";

export interface StackPeptide {
  name: string;
  description: string;
}

const ROUTE_COLOR = "#ff2d8b";

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
  pT: 24, pR: 18, pB: 46, pL: 68,
  get plotW() { return this.vbW - this.pL - this.pR; },
  get plotH() { return this.vbH - this.pT - this.pB; },
  get x0() { return this.pL; },
  get y0() { return this.pT; },
  get x1() { return this.vbW - this.pR; },
  get y1() { return this.vbH - this.pB; },
};

function interpolateAtX(pts: { x: number; y: number }[], svgX: number): number {
  const frac = (svgX - CHART.x0) / CHART.plotW;
  const N = pts.length - 1;
  const rawIdx = frac * N;
  const lo = Math.max(0, Math.floor(rawIdx));
  const hi = Math.min(N, Math.ceil(rawIdx));
  const t = rawIdx - lo;
  return pts[lo].y + (pts[hi].y - pts[lo].y) * t;
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

const PK_PIN_STORAGE_PREFIX = "pk-pin-";

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

function useCountUp(finalValue: string, delay = 0, duration = 1.1): string {
  const [displayed, setDisplayed] = useState<string>("—");
  useEffect(() => {
    const numbers = finalValue.match(/\d+(?:\.\d+)?/g);
    if (!numbers) {
      const t = setTimeout(() => setDisplayed(finalValue), delay * 1000 + 200);
      return () => clearTimeout(t);
    }
    const startMs = Date.now() + delay * 1000;
    let raf: number;
    const tick = () => {
      const now = Date.now();
      if (now < startMs) { raf = requestAnimationFrame(tick); return; }
      const progress = Math.min((now - startMs) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      let result = finalValue;
      numbers.forEach(numStr => {
        const target = parseFloat(numStr);
        const current = target * eased;
        const formatted = numStr.includes(".") ? current.toFixed(1) : Math.round(current).toString();
        result = result.replace(numStr, formatted);
      });
      setDisplayed(result);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [finalValue, delay, duration]);
  return displayed;
}

function AnimatedStat({ label, value, color, delay }: { label: string; value: string; color: string; delay: number }) {
  const counted = useCountUp(value, delay);
  return (
    <motion.div
      className="flex flex-col items-center text-center"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: "easeOut" }}
    >
      <span className="text-[10px] text-muted-foreground/50 uppercase tracking-widest mb-1 leading-none">{label}</span>
      <span className="text-base font-bold leading-tight tabular-nums" style={{ color }}>{counted}</span>
    </motion.div>
  );
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
  const [ivMarkerTooltip, setIvMarkerTooltip] = useState<{ clientX: number; clientY: number; compoundName: string; ivHalfLifeLabel: string; citationLabel: string } | null>(null);
  const [crosshairSvgX, setCrosshairSvgX] = useState<number | null>(null);
  const chartWrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const lastInteractionWasTouch = useRef(false);

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

  useEffect(() => {
    const dismiss = () => {
      setTooltip(null);
      setIvMarkerTooltip(null);
      setCrosshairSvgX(null);
    };
    window.addEventListener('scroll', dismiss, { passive: true });
    return () => window.removeEventListener('scroll', dismiss);
  }, []);

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
    // "extendsNote" is true only when the half-life point is actually beyond the
    // right edge of the chart — the curve hasn't reached t½ in the visible window.
    const extendsNote = mid === null || mid > xMaxMin;
    const halfLifeXFrac = mid !== null && mid <= xMaxMin ? mid / xMaxMin : null;
    const peakIdx = pts.reduce((best, p, i) => p.y < pts[best].y ? i : best, 0);
    const tmaxXFrac = (pts[peakIdx].x - CHART.x0) / CHART.plotW;
    const tmaxSvgX = pts[peakIdx].x;
    const tmaxSvgY = pts[peakIdx].y;
    const showTmaxMarker = tmaxXFrac > 0.01 && tmaxXFrac < 1;
    // IV bolus overlay curve
    const ivMid = pk.ivHalfLifeLabel
      ? (pk.ivHalfLifeMin !== undefined && pk.ivHalfLifeMax !== undefined
          ? (pk.ivHalfLifeMin + pk.ivHalfLifeMax) / 2
          : pk.ivHalfLifeMin ?? pk.ivHalfLifeMax ?? null)
      : null;
    const ivPts = ivMid !== null ? buildPKCurve(ivMid, xMaxMin, CHART) : null;
    const ivCurveD = ivPts ? ptsToD(ivPts) : null;
    const ivHalfLifeXFrac = ivMid !== null && ivMid <= xMaxMin ? ivMid / xMaxMin : null;
    return { peptide, pk, color, pts, isExtended, extendsNote, halfLifeXFrac, lastY, curveD: ptsToD(pts), areaD: ptsToAreaD(pts), tmaxSvgX, tmaxSvgY, showTmaxMarker, ivCurveD, ivHalfLifeXFrac };
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
  const hasAnySC = pksWithData.some(pk => !isNonSCRoute(pk.route));
  const hasIVOverlay = pksWithData.some(pk => !!pk.ivHalfLifeLabel);
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

  const svgClientToX = useCallback((clientX: number, clientY: number): number | null => {
    if (!svgRef.current) return null;
    const svgEl = svgRef.current;
    const pt = svgEl.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const svgPt = pt.matrixTransform(svgEl.getScreenCTM()!.inverse());
    return Math.max(CHART.x0, Math.min(CHART.x1, svgPt.x));
  }, []);

  const getCrosshairData = useCallback((idx: number, e: React.MouseEvent) => {
    const c = curves[idx];
    if (!c || !svgRef.current) return null;
    const svgX = svgClientToX(e.clientX, e.clientY);
    if (svgX === null) return null;
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
  }, [curves, xMaxMin, useHours, svgClientToX]);

  const handleCurveHover = useCallback((idx: number, e: React.MouseEvent) => {
    const c = curves[idx];
    if (!c) return;
    setHoveredIdx(idx);
    const activeIdx = pinnedIdx ?? idx;
    const activeC = curves[activeIdx];
    if (!activeC) return;
    const crosshair = getCrosshairData(activeIdx, e);
    setCrosshairSvgX(crosshair?.svgX ?? null);
    setTooltip({
      clientX: e.clientX,
      clientY: e.clientY,
      label: activeC.peptide.name,
      halfLife: activeC.pk.halfLifeLabel,
      concentration: crosshair?.concentration ?? 0,
      timeDisp: crosshair?.timeDisp ?? "",
    });
  }, [curves, getCrosshairData, pinnedIdx]);

  const handleCurveMove = useCallback((idx: number, e: React.MouseEvent) => {
    const activeIdx = pinnedIdx ?? idx;
    const activeC = curves[activeIdx];
    if (!activeC) return;
    const crosshair = getCrosshairData(activeIdx, e);
    if (crosshair) {
      setCrosshairSvgX(crosshair.svgX);
      setTooltip(prev => prev ? {
        ...prev,
        clientX: e.clientX,
        clientY: e.clientY,
        label: activeC.peptide.name,
        halfLife: activeC.pk.halfLifeLabel,
        concentration: crosshair.concentration,
        timeDisp: crosshair.timeDisp,
      } : prev);
    }
  }, [curves, getCrosshairData, pinnedIdx]);

  const handleCurveLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  const handleTouchEnd = useCallback(() => {
    // Keep tooltip and crosshair visible after lifting finger so users can read the data.
    // The tooltip auto-dismisses on scroll (handled by the window scroll listener).
    // Users can pin a specific curve by tapping its row in the legend below.
  }, []);

  const handleChartMove = useCallback((e: React.MouseEvent) => {
    if (lastInteractionWasTouch.current) {
      lastInteractionWasTouch.current = false;
      return;
    }
    const svgX = svgClientToX(e.clientX, e.clientY);
    if (svgX === null) return;
    setCrosshairSvgX(svgX);
    const activeIdx = pinnedIdx ?? hoveredIdx;
    if (activeIdx !== null) {
      const c = curves[activeIdx];
      if (c) {
        const frac = (svgX - CHART.x0) / CHART.plotW;
        const N = c.pts.length - 1;
        const rawIdx = frac * N;
        const lo = Math.max(0, Math.floor(rawIdx));
        const hi = Math.min(N, Math.ceil(rawIdx));
        const t = rawIdx - lo;
        const yInterp = c.pts[lo].y + (c.pts[hi].y - c.pts[lo].y) * t;
        const concentration = Math.max(0, Math.min(1, 1 - (yInterp - CHART.y0) / CHART.plotH));
        const timeMin = frac * xMaxMin;
        const timeDisp = useHours ? `${(timeMin / 60).toFixed(1)} h` : `${Math.round(timeMin)} min`;
        setTooltip({
          clientX: e.clientX,
          clientY: e.clientY,
          label: c.peptide.name,
          halfLife: c.pk.halfLifeLabel,
          concentration,
          timeDisp,
        });
      }
    } else {
      if (curves.filter(Boolean).length > 1) {
        const frac = (svgX - CHART.x0) / CHART.plotW;
        const timeMin = frac * xMaxMin;
        const timeDisp = useHours ? `${(timeMin / 60).toFixed(1)} h` : `${Math.round(timeMin)} min`;
        setTooltip({ clientX: e.clientX, clientY: e.clientY, label: "", halfLife: "", concentration: -1, timeDisp });
      } else {
        setTooltip(null);
      }
    }
  }, [svgClientToX, curves, hoveredIdx, pinnedIdx, xMaxMin, useHours]);

  const handleChartLeave = useCallback(() => {
    setCrosshairSvgX(null);
    setHoveredIdx(null);
    setTooltip(null);
  }, []);

  const handleChartTouch = useCallback((e: React.TouchEvent) => {
    lastInteractionWasTouch.current = true;
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch || !svgRef.current) return;

    const svgX = svgClientToX(touch.clientX, touch.clientY);
    if (svgX === null) return;
    setCrosshairSvgX(svgX);
    const activeIdx = pinnedIdx ?? hoveredIdx;
    const frac = (svgX - CHART.x0) / CHART.plotW;
    const timeMin = frac * xMaxMin;
    const timeDisp = useHours ? `${(timeMin / 60).toFixed(1)} h` : `${Math.round(timeMin)} min`;

    if (activeIdx !== null) {
      // A curve is pinned — show only that curve's data.
      const c = curves[activeIdx];
      if (c) {
        const yInterp = interpolateAtX(c.pts, svgX);
        const concentration = Math.max(0, Math.min(1, 1 - (yInterp - CHART.y0) / CHART.plotH));
        setTooltip({
          clientX: touch.clientX,
          clientY: touch.clientY,
          label: c.peptide.name,
          halfLife: c.pk.halfLifeLabel,
          concentration,
          timeDisp,
        });
      }
    } else if (curves.some(Boolean)) {
      // No pin — set tooltip so the multi-curve combined box renders
      // (the actual per-curve values come from allCurveValues, which is
      // derived reactively from the crosshairSvgX we just set above).
      setTooltip({
        clientX: touch.clientX,
        clientY: touch.clientY,
        label: "",
        halfLife: "",
        concentration: -1,
        timeDisp,
      });
    }
  }, [svgClientToX, curves, hoveredIdx, pinnedIdx, xMaxMin, useHours]);

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

  const crosshairTimeDisp = crosshairSvgX !== null ? (() => {
    const frac = (crosshairSvgX - CHART.x0) / CHART.plotW;
    const timeMin = frac * xMaxMin;
    return useHours ? `${(timeMin / 60).toFixed(1)} h` : `${Math.round(timeMin)} min`;
  })() : null;

  const allCurveValues = crosshairSvgX !== null
    ? curves.map((c) => {
        if (!c) return null;
        const yInterp = interpolateAtX(c.pts, crosshairSvgX);
        const pct = Math.round(Math.max(0, Math.min(1, 1 - (yInterp - CHART.y0) / CHART.plotH)) * 100);
        return { name: c.peptide.name, color: c.color, pct, yInterp };
      })
    : null;

  return (
    <div className="mb-8" data-testid="section-compounds">
      {!isSingleCompound && (
        <h3 className="font-display font-semibold text-lg mb-3">Compounds in this Stack</h3>
      )}
      <Card className="border-border/40 bg-[#07070b] overflow-hidden">
          <div className="flex">
          {/* Stats sidebar — left of chart, single compound only */}
          {isSingleCompound && hasCurves && curves[0] && (() => {
            const c = curves[0]!;
            const effHL = pkMidpoint(c.pk) ?? xMaxMin * 80;
            const ke = Math.log(2) / effHL;
            const kaFloor = Math.log(2) / (0.08 * xMaxMin);
            const ka = Math.max(ke * 10, kaFloor);
            const safeKa = ka === ke ? ka * 1.0001 : ka;
            const tmaxMin = Math.log(safeKa / ke) / (safeKa - ke);
            const tmaxLabel = tmaxMin < 60
              ? `~${Math.round(tmaxMin)} min`
              : `~${parseFloat((tmaxMin / 60).toFixed(1))} h`;
            return (
              <div className="hidden md:flex flex-col gap-3 justify-center px-3 py-3 shrink-0 border-r border-white/5 w-24" data-testid="pk-stats-bar">
                {[
                  { label: "Plasma t½", value: c.pk.halfLifeLabel, delay: 0.1, color: c.color },
                  { label: "Tmax", value: tmaxLabel, delay: 0.3, color: c.color },
                  { label: "Route", value: routeAbbrev(c.pk.route), delay: 0.5, color: ROUTE_COLOR },
                ].map(s => (
                  <AnimatedStat key={s.label} label={s.label} value={s.value} color={s.color} delay={s.delay} />
                ))}
              </div>
            );
          })()}
          <div className="flex-1 flex flex-col min-w-0">
          {hasCurves && (
          <div className="px-1 pt-0 pb-0 relative" ref={chartWrapRef}>
            <div className="flex items-center justify-end gap-1 mb-1" data-testid="pk-zoom-controls">
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
            {(hasNonSC && hasAnySC || hasIVOverlay) && (
              <div className="flex items-center justify-end gap-3 mb-1.5 px-0.5 flex-wrap" data-testid="pk-line-style-key">
                <div className="flex items-center gap-1.5">
                  <svg width="18" height="4" viewBox="0 0 18 4" aria-hidden="true">
                    <line x1="0" y1="2" x2="18" y2="2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.45" />
                  </svg>
                  <span className="text-[10px] text-white/40 font-medium">SC</span>
                </div>
                {hasNonSC && hasAnySC && (
                  <div className="flex items-center gap-1.5">
                    <svg width="18" height="4" viewBox="0 0 18 4" aria-hidden="true">
                      <line x1="0" y1="2" x2="18" y2="2" stroke="#fff" strokeWidth="2" strokeDasharray="5 3" strokeLinecap="round" strokeOpacity="0.45" />
                    </svg>
                    <span className="text-[10px] text-white/40 font-medium">Other route</span>
                  </div>
                )}
                {hasIVOverlay && (
                  <div className="flex items-center gap-1.5" data-testid="pk-iv-overlay-key">
                    <svg width="18" height="4" viewBox="0 0 18 4" aria-hidden="true">
                      <line x1="0" y1="2" x2="18" y2="2" stroke="#f97316" strokeWidth="2" strokeDasharray="3 2" strokeLinecap="round" strokeOpacity="0.7" />
                    </svg>
                    <span className="text-[10px] font-medium" style={{ color: "#f97316", opacity: 0.7 }}>IV bolus</span>
                  </div>
                )}
              </div>
            )}
            <svg
              ref={svgRef}
              viewBox={`0 0 ${CHART.vbW} ${CHART.vbH}`}
              className="w-full"
              style={{ maxHeight: 260 }}
              role="img"
              aria-label="Plasma concentration–time curves for compounds in this stack"
              onMouseLeave={handleChartLeave}
            >
              <defs>
                <clipPath id={clipId}>
                  <rect x={CHART.x0} y={CHART.y0} width={CHART.plotW} height={CHART.plotH + 1} />
                </clipPath>
                {curves.map(c => c && (
                  <linearGradient key={`g-${toTestSlug(c.peptide.name)}`} id={`g-${toTestSlug(c.peptide.name)}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c.color} stopOpacity="0.42" />
                    <stop offset="55%" stopColor={c.color} stopOpacity="0.10" />
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
                  <text x={CHART.x0 - 5} y={CHART.y0 + Number(f) * CHART.plotH + 4} textAnchor="end" fontSize="9" fill="#fff" fillOpacity="0.7">{lbl}</text>
                </g>
              ))}

              {/* Y-axis label — horizontal, left side between 100% and 50% marks */}
              <text x={3} y={CHART.y0 + CHART.plotH * 0.33 + 3} textAnchor="start" fontSize="9" fill="#fff" fillOpacity="0.5">Relative C</text>

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

              {/* IV bolus t½ vertical markers — visual only, pointerEvents disabled */}
              {curves.map((c, idx) => c && c.ivHalfLifeXFrac !== null && c.ivHalfLifeXFrac !== undefined && (
                <g
                  key={`iv-m-${c.peptide.name}`}
                  style={{ opacity: markerOpacity(idx), transition: "opacity 0.18s ease" }}
                  pointerEvents="none"
                >
                  <line
                    x1={CHART.x0 + c.ivHalfLifeXFrac * CHART.plotW} y1={CHART.y0}
                    x2={CHART.x0 + c.ivHalfLifeXFrac * CHART.plotW} y2={CHART.y1}
                    stroke="#f97316" strokeOpacity="0.22" strokeWidth="1" strokeDasharray="2 3"
                  />
                  <text x={CHART.x0 + c.ivHalfLifeXFrac * CHART.plotW} y={CHART.y1 + 11}
                    textAnchor="middle" fontSize="7" fill="#f97316" fillOpacity="0.65">IV t½</text>
                </g>
              ))}

              {/* IV bolus overlay curves — rendered before SC curves so SC sits on top */}
              <g clipPath={`url(#${clipId})`}>
                {curves.map((c, idx) => c && c.ivCurveD && (
                  <g
                    key={`iv-sg-${c.peptide.name}`}
                    style={{ opacity: curveOpacity(idx) === 1 ? 0.6 : 0.06, transition: "opacity 0.18s ease" }}
                  >
                    <motion.path
                      d={c.ivCurveD}
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="3 2"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.2, delay: idx * 0.25 + 0.2, ease: "easeOut" }}
                      data-testid={`iv-overlay-curve-${toTestSlug(c.peptide.name)}`}
                    />
                  </g>
                ))}
              </g>

              {/* Tmax peak markers — glowing dot with pulse ring */}
              {curves.map((c, idx) => c && c.showTmaxMarker && (
                <g key={`tmax-${c.peptide.name}`} pointerEvents="none" style={{ opacity: markerOpacity(idx), transition: "opacity 0.18s ease" }}>
                  {/* Dashed vertical from peak dot down to x-axis */}
                  <line
                    x1={c.tmaxSvgX} y1={c.tmaxSvgY + 4}
                    x2={c.tmaxSvgX} y2={CHART.y1}
                    stroke={c.color} strokeOpacity="0.22" strokeWidth="1" strokeDasharray="3 3"
                  />
                  {/* Outer pulse ring */}
                  <motion.circle
                    cx={c.tmaxSvgX} cy={c.tmaxSvgY}
                    fill="none"
                    stroke={c.color}
                    strokeWidth="1.2"
                    initial={{ r: 3, opacity: 0 }}
                    animate={{ r: [3, 11], opacity: [0.7, 0] }}
                    transition={{ duration: 1.6, delay: 1.3, repeat: Infinity, ease: "easeOut" }}
                  />
                  {/* Glowing filled dot */}
                  <motion.circle
                    cx={c.tmaxSvgX} cy={c.tmaxSvgY}
                    r={3.5}
                    fill={c.color}
                    stroke="rgba(0,0,0,0.4)"
                    strokeWidth="1"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.35, delay: 1.1, ease: "easeOut" }}
                    style={{ filter: `drop-shadow(0 0 5px ${c.color})` }}
                  />
                  {/* "Peak" label above dot */}
                  <motion.text
                    x={c.tmaxSvgX} y={c.tmaxSvgY - 9}
                    textAnchor="middle" fontSize="10" fill={c.color} fillOpacity="0.9"
                    fontWeight="700"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.9 }}
                    transition={{ duration: 0.4, delay: 1.2 }}
                  >Peak</motion.text>
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
                      strokeDasharray={isNonSCRoute(c.pk.route) ? "7 4" : undefined}
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

              {/* Transparent overlay rect — tracks crosshair across entire plot area */}
              <rect
                x={CHART.x0}
                y={CHART.y0}
                width={CHART.plotW}
                height={CHART.plotH}
                fill="transparent"
                onMouseMove={handleChartMove}
                onMouseLeave={handleChartLeave}
                onTouchStart={handleChartTouch}
                onTouchMove={handleChartTouch}
                onTouchEnd={handleTouchEnd}
                style={{ cursor: "crosshair" }}
              />

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
                    onTouchStart={handleChartTouch}
                    onTouchMove={handleChartTouch}
                    onTouchEnd={handleTouchEnd}
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

              {/* IV marker hit-areas — rendered above the crosshair overlay so they intercept first */}
              {curves.map((c, idx) => c && c.ivHalfLifeXFrac !== null && c.ivHalfLifeXFrac !== undefined && (
                <rect
                  key={`iv-hit-${c.peptide.name}`}
                  x={CHART.x0 + c.ivHalfLifeXFrac * CHART.plotW - 7}
                  y={CHART.y0}
                  width={14}
                  height={CHART.plotH + 14}
                  fill="transparent"
                  style={{ cursor: "help", opacity: markerOpacity(idx) }}
                  data-testid={`iv-marker-hit-${toTestSlug(c.peptide.name)}`}
                  onMouseEnter={e => {
                    const cit = c.pk.citations[0];
                    setTooltip(null);
                    setCrosshairSvgX(null);
                    setIvMarkerTooltip({
                      clientX: e.clientX,
                      clientY: e.clientY,
                      compoundName: c.peptide.name,
                      ivHalfLifeLabel: c.pk.ivHalfLifeLabel!,
                      citationLabel: cit?.label ?? "",
                    });
                  }}
                  onMouseMove={e => {
                    setIvMarkerTooltip(prev => prev ? { ...prev, clientX: e.clientX, clientY: e.clientY } : prev);
                  }}
                  onMouseLeave={() => setIvMarkerTooltip(null)}
                />
              ))}

              {/* Vertical crosshair line */}
              {crosshairSvgX !== null && (
                <line
                  x1={crosshairSvgX} y1={CHART.y0}
                  x2={crosshairSvgX} y2={CHART.y1}
                  stroke={curves[effectiveIdx ?? -1]?.color ?? "#fff"}
                  strokeOpacity="0.55"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  pointerEvents="none"
                />
              )}

              {/* Dots on curve at crosshair position */}
              {crosshairSvgX !== null && allCurveValues && (
                <g clipPath={`url(#${clipId})`}>
                  {curves.map((c, idx) => {
                    if (!c || !allCurveValues[idx]) return null;
                    const isActive = effectiveIdx === null || effectiveIdx === idx;
                    return (
                      <circle
                        key={`dot-${c.peptide.name}`}
                        cx={crosshairSvgX}
                        cy={allCurveValues[idx]!.yInterp}
                        r={3.5}
                        fill={c.color}
                        stroke="rgba(0,0,0,0.5)"
                        strokeWidth="1"
                        pointerEvents="none"
                        style={{ opacity: isActive ? 1 : 0.2, transition: "opacity 0.18s ease" }}
                      />
                    );
                  })}
                </g>
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
                  textAnchor="middle" fontSize="11" fill="#fff" fillOpacity="0.7">{t.label}</text>
              ))}

              {/* X-axis unit */}
              <text x={CHART.x0 + CHART.plotW / 2} y={CHART.vbH - 3}
                textAnchor="middle" fontSize="10" fill="#fff" fillOpacity="0.55">
                Time ({useHours ? "hours" : "min"})
              </text>
            </svg>

            {/* IV marker tooltip — fixed positioning, shown on hover of IV t½ dashed-line markers */}
            {ivMarkerTooltip && (() => {
              const IV_COLOR = "#f97316";
              const TOOLTIP_WIDTH = 200;
              const rawLeft = ivMarkerTooltip.clientX + 14 + TOOLTIP_WIDTH > window.innerWidth
                ? ivMarkerTooltip.clientX - TOOLTIP_WIDTH - 8
                : ivMarkerTooltip.clientX + 14;
              const tooltipLeft = Math.max(8, Math.min(rawLeft, window.innerWidth - TOOLTIP_WIDTH - 8));
              const rawTop = ivMarkerTooltip.clientY - 42;
              const tooltipTop = Math.max(8, rawTop < 0 ? ivMarkerTooltip.clientY + 8 : rawTop);
              return (
                <div
                  className="pointer-events-none fixed z-50 px-3 py-2 rounded-md text-xs font-medium leading-tight"
                  style={{
                    left: tooltipLeft,
                    top: tooltipTop,
                    background: "rgba(10,10,16,0.94)",
                    border: `1px solid ${IV_COLOR}40`,
                    color: "#fff",
                    boxShadow: `0 2px 14px rgba(0,0,0,0.65), 0 0 0 1px ${IV_COLOR}18`,
                    backdropFilter: "blur(6px)",
                    whiteSpace: "nowrap",
                    minWidth: 160,
                  }}
                  role="tooltip"
                  data-testid="iv-marker-tooltip"
                >
                  <span className="block font-semibold text-[11px] mb-1" style={{ color: IV_COLOR }}>
                    {ivMarkerTooltip.compoundName} — IV bolus t½
                  </span>
                  <span className="block text-sm font-bold tabular-nums" style={{ color: IV_COLOR }}>
                    {ivMarkerTooltip.ivHalfLifeLabel}
                  </span>
                  <p className="text-[10px] opacity-55 mt-1 leading-relaxed whitespace-normal max-w-[190px]">
                    Intravenous route bypasses the SC absorption phase, producing a shorter observed plasma half-life.
                  </p>
                  {ivMarkerTooltip.citationLabel && (
                    <div className="flex items-center gap-1 mt-1.5 pt-1.5 border-t border-white/10">
                      <ExternalLink className="h-2.5 w-2.5 flex-shrink-0" style={{ color: "#21d8ff", opacity: 0.7 }} />
                      <span className="text-[10px]" style={{ color: "#21d8ff", opacity: 0.7 }}>{ivMarkerTooltip.citationLabel}</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Floating tooltip — fixed positioning so it's never clipped by overflow:hidden */}
            {tooltip && (() => {
              const TOOLTIP_WIDTH = 172;
              const rawLeft = tooltip.clientX + 14 + TOOLTIP_WIDTH > window.innerWidth
                ? tooltip.clientX - TOOLTIP_WIDTH - 8
                : tooltip.clientX + 14;
              const tooltipLeft = Math.max(8, Math.min(rawLeft, window.innerWidth - TOOLTIP_WIDTH - 8));
              const rawTop = tooltip.clientY - 42;
              const tooltipTop = Math.max(8, rawTop < 0 ? tooltip.clientY + 8 : rawTop);
              const activeCurve = curves[effectiveIdx ?? -1];
              const isMultiCurve = !isSingleCompound && allCurveValues !== null && crosshairTimeDisp !== null;
              return (
                <div
                  className="pointer-events-none fixed z-50 px-2.5 py-1.5 rounded-md text-xs font-medium leading-tight"
                  style={{
                    left: tooltipLeft,
                    top: tooltipTop,
                    background: "rgba(10,10,16,0.92)",
                    border: `1px solid ${activeCurve?.color ?? "#fff"}40`,
                    color: "#fff",
                    boxShadow: `0 2px 12px rgba(0,0,0,0.6)`,
                    backdropFilter: "blur(6px)",
                    whiteSpace: "nowrap",
                    minWidth: isMultiCurve ? 140 : undefined,
                  }}
                  role="tooltip"
                >
                  {isMultiCurve ? (
                    <>
                      <span className="block text-[10px] opacity-50 tabular-nums mb-1">{crosshairTimeDisp}</span>
                      {allCurveValues!.map((v, idx) => {
                        if (!v) return null;
                        // When pinned, dim non-pinned curves. When just hovering (no pin),
                        // show all curves at full opacity so the user can read everything.
                        const isActive = pinnedIdx === null || pinnedIdx === idx;
                        return (
                          <div key={v.name} className="flex items-center gap-1.5 tabular-nums" style={{ opacity: isActive ? 1 : 0.45 }}>
                            <span style={{ color: v.color, fontSize: 9, lineHeight: 1 }}>●</span>
                            <span className="flex-1 text-[11px]">{v.name}</span>
                            <span className="text-[11px] opacity-80 ml-2">{v.pct}%</span>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <>
                      <span className="block font-semibold text-[11px]" style={{ color: activeCurve?.color ?? "#fff" }}>{tooltip.label}</span>
                      {tooltip.concentration >= 0 && (
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-xl font-bold tabular-nums leading-none" style={{ color: activeCurve?.color ?? "#fff" }}>
                            {Math.round(tooltip.concentration * 100)}%
                          </span>
                          <span className="text-[10px] opacity-60">at {tooltip.timeDisp}</span>
                        </div>
                      )}
                      <span className="block opacity-40 text-[10px] mt-1">t½ {tooltip.halfLife}</span>
                    </>
                  )}
                </div>
              );
            })()}
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

            if (isSingleCompound) {
              return (
                <div
                  key={c.peptide.name}
                  className="flex flex-col gap-2"
                  data-testid={`legend-row-${toTestSlug(c.peptide.name)}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: c.color, boxShadow: `0 0 7px ${c.color}` }}
                    />
                    <span className="text-sm font-medium">{c.peptide.name}</span>
                    <span
                      className="text-[10px] font-medium px-1.5 py-px rounded"
                      style={{ backgroundColor: `${ROUTE_COLOR}18`, color: ROUTE_COLOR, border: `1px solid ${ROUTE_COLOR}40` }}
                      data-testid={`badge-route-${toTestSlug(c.peptide.name)}`}
                    >
                      {routeLabel(c.pk.route)}
                    </span>
                  </div>
                  <div className="flex flex-col pl-[18px]">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex items-center gap-1 text-xs font-medium cursor-help w-fit py-1" style={{ color: c.color }} data-testid={`chip-halflife-${toTestSlug(c.peptide.name)}`}>
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          {c.pk.altRoute ? <>{routeAbbrev(c.pk.route)} t½ {c.pk.halfLifeLabel}</> : <>Plasma t½ {c.pk.halfLifeLabel}</>}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[220px] text-xs leading-relaxed">
                        The half-life (t½) is how long it takes plasma concentration to fall to half its peak value — a measure of how quickly the compound clears the bloodstream.
                      </TooltipContent>
                    </Tooltip>
                    {c.pk.altRoute && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className="flex items-center gap-1 text-xs font-medium cursor-help w-fit py-1 opacity-70"
                            style={{ color: c.color }}
                            data-testid={`chip-halflife-altroute-${toTestSlug(c.peptide.name)}`}
                          >
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            {routeAbbrev(c.pk.altRoute.route)} t½ {c.pk.altRoute.halfLifeLabel}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[220px] text-xs leading-relaxed">
                          Half-life via {routeLabel(c.pk.altRoute.route).toLowerCase()} route.
                        </TooltipContent>
                      </Tooltip>
                    )}
                    <div className="flex flex-wrap gap-3 border-t border-border/20 pt-2 mt-1">
                      {c.pk.citations.map((cit, j) => (
                        <a key={j} href={cit.url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#21d8ff] hover:underline opacity-70 hover:opacity-100"
                          onClick={e => e.stopPropagation()}
                        >
                          <ExternalLink className="h-2.5 w-2.5" />
                          {cit.label}
                        </a>
                      ))}
                      {c.pk.altRoute && c.pk.altRoute.citations.map((cit, j) => (
                        <a key={`alt-${j}`} href={cit.url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#21d8ff] hover:underline opacity-70 hover:opacity-100"
                          onClick={e => e.stopPropagation()}
                        >
                          <ExternalLink className="h-2.5 w-2.5" />
                          {cit.label}
                        </a>
                      ))}
                    </div>
                    {c.pk.ivHalfLifeLabel && (() => {
                      const scMid = c.pk.halfLifeMin !== undefined && c.pk.halfLifeMax !== undefined
                        ? (c.pk.halfLifeMin + c.pk.halfLifeMax) / 2
                        : c.pk.halfLifeMin ?? c.pk.halfLifeMax ?? null;
                      const ivMid = c.pk.ivHalfLifeMin !== undefined && c.pk.ivHalfLifeMax !== undefined
                        ? (c.pk.ivHalfLifeMin + c.pk.ivHalfLifeMax) / 2
                        : c.pk.ivHalfLifeMin ?? c.pk.ivHalfLifeMax ?? null;
                      const maxMid = scMid !== null && ivMid !== null ? Math.max(scMid, ivMid) : null;
                      const IV_COLOR = "#f97316";
                      const scPct = maxMid && scMid !== null ? (scMid / maxMid) * 86 : 86;
                      const ivPct = maxMid && ivMid !== null ? (ivMid / maxMid) * 86 : 86;
                      return (
                        <motion.div
                          className="border-t border-border/20 pt-2 mt-2"
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.3 }}
                          data-testid="pk-route-comparison"
                        >
                          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest mb-2">Route comparison</p>
                          <div className="flex flex-col gap-1.5">
                            {[
                              { routeLabel: "SC", halfLifeLabel: c.pk.halfLifeLabel, pct: scPct, color: c.color },
                              { routeLabel: "IV", halfLifeLabel: c.pk.ivHalfLifeLabel, pct: ivPct, color: IV_COLOR },
                            ].map(row => (
                              <div key={row.routeLabel} className="flex items-center gap-2" data-testid={`pk-route-bar-${row.routeLabel.toLowerCase()}`}>
                                <span
                                  className="text-[10px] font-semibold tabular-nums shrink-0"
                                  style={{ color: row.color, width: "1.5rem", textAlign: "right" }}
                                >
                                  {row.routeLabel}
                                </span>
                                <div className="flex-1 flex items-center gap-1.5 min-w-0">
                                  <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                                    <motion.div
                                      className="h-full rounded-full"
                                      style={{ backgroundColor: row.color, boxShadow: `0 0 6px ${row.color}80` }}
                                      initial={{ width: "0%" }}
                                      animate={{ width: `${row.pct}%` }}
                                      transition={{ duration: 0.75, delay: 0.5 + (row.routeLabel === "IV" ? 0.15 : 0), ease: "easeOut" }}
                                    />
                                  </div>
                                  <span
                                    className="text-[11px] font-medium tabular-nums shrink-0"
                                    style={{ color: row.color }}
                                  >
                                    {row.halfLifeLabel}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <p className="text-[10px] text-muted-foreground/45 mt-1.5 leading-relaxed">
                            IV administration bypasses the subcutaneous absorption phase, resulting in a shorter observed plasma half-life.
                          </p>
                        </motion.div>
                      );
                    })()}
                    <p className="text-sm text-muted-foreground leading-relaxed border-t border-border/20 pt-2 mt-2">{c.pk.pkContext}</p>
                    {c.pk.note && <p className="text-xs text-muted-foreground/70 italic pt-1.5">{c.pk.note}</p>}
                  </div>
                </div>
              );
            }

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
                        style={{ backgroundColor: `${ROUTE_COLOR}18`, color: ROUTE_COLOR, border: `1px solid ${ROUTE_COLOR}40` }}
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
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                            <p className="text-sm font-semibold">
                              {c.pk.altRoute ? routeAbbrev(c.pk.route) : "Plasma"} t½: {c.pk.halfLifeLabel}
                            </p>
                          </div>
                          {c.pk.altRoute && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3 w-3 flex-shrink-0 text-muted-foreground opacity-60" />
                              <p className="text-sm font-semibold text-muted-foreground">
                                {routeAbbrev(c.pk.altRoute.route)} t½: {c.pk.altRoute.halfLifeLabel}
                              </p>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{c.pk.pkContext}</p>
                        {c.pk.note && <p className="text-[11px] text-muted-foreground/80 italic">{c.pk.note}</p>}
                        <div className="pt-1 border-t border-border/40">
                          <p className="text-[10px] text-muted-foreground mb-1">Citations:</p>
                          {c.pk.citations.map((cit, j) => (
                            <a key={j} href={cit.url} target="_blank" rel="noopener noreferrer"
                              className="text-[11px] text-[#21d8ff] hover:underline block">{cit.label}</a>
                          ))}
                          {c.pk.altRoute && c.pk.altRoute.citations.map((cit, j) => (
                            <a key={`alt-${j}`} href={cit.url} target="_blank" rel="noopener noreferrer"
                              className="text-[11px] text-[#21d8ff] hover:underline block">{cit.label}</a>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  {c.extendsNote && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/60 italic cursor-pointer hover:text-muted-foreground transition-colors"
                          data-testid={`button-extended-info-${toTestSlug(c.peptide.name)}`}
                          aria-label="What does curve extends beyond chart mean?"
                          onClick={e => e.stopPropagation()}
                        >
                          <span>t½ extends beyond chart</span>
                          <Info className="h-3 w-3 flex-shrink-0" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 text-xs" side="top" align="start">
                        <p className="font-medium text-foreground mb-1">Half-life extends beyond the current view</p>
                        <p className="text-muted-foreground leading-relaxed">
                          This compound's t½ point falls outside the current time window — the curve hasn't reached 50% decay yet. The › arrow at the right edge shows it continues. Widen the time range (e.g. switch to 7 d) to see the full kinetic profile.
                        </p>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
                {/* Citations row — visible directly below each compound in the legend */}
                {c.pk.citations.length > 0 && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 pl-[18px]" onClick={e => e.stopPropagation()}>
                    {c.pk.citations.map((cit, j) => (
                      <a
                        key={j}
                        href={cit.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-[#21d8ff]/70 hover:text-[#21d8ff] hover:underline transition-colors"
                        data-testid={`link-citation-${toTestSlug(c.peptide.name)}-${j}`}
                      >
                        <ExternalLink className="h-2.5 w-2.5 flex-shrink-0" />
                        {cit.label}
                      </a>
                    ))}
                  </div>
                )}
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
          </div>
          </div>
      </Card>
    </div>
  );
}
