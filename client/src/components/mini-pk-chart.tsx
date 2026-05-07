import { useRef, useEffect } from "react";
import { getHalfLifeByName } from "@/data/pharmacokinetics";
import type { HalfLifeEntry } from "@/data/pharmacokinetics";
import { isNonSCRoute, pkMidpoint, computeXMax, buildPKCurve, ptsToD } from "@/lib/pk-curve";

function routeAbbrev(route: string): string {
  const r = route.toLowerCase();
  if (r === "subcutaneous") return "SC";
  if (r === "intravenous") return "IV";
  if (r === "intranasal") return "IN";
  if (r === "oral") return "Oral";
  if (r === "topical") return "Topical";
  return route;
}

const MINI_CHART = {
  vbW: 300, vbH: 64,
  pT: 4, pR: 4, pB: 4, pL: 4,
  get plotW() { return this.vbW - this.pL - this.pR; },
  get plotH() { return this.vbH - this.pT - this.pB; },
  get x0() { return this.pL; },
  get y0() { return this.pT; },
};

export const MINI_PK_COLORS = ["#a3e635", "#21d8ff", "#22c55e", "#f59e0b", "#a855f7"];

const IV_OVERLAY_COLOR = "#f97316";

interface TooltipEntry {
  name: string;
  color: string;
  scLabel: string;
  ivLabel: string;
}

export function MiniPKChart({ peptideNames, stackId }: { peptideNames: string[]; stackId: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const entries = peptideNames.map((name, i) => ({
    name,
    pk: getHalfLifeByName(name),
    color: MINI_PK_COLORS[i % MINI_PK_COLORS.length],
  }));

  const pksWithData = entries.map(e => e.pk).filter((pk): pk is HalfLifeEntry => pk !== undefined);
  if (pksWithData.length === 0) return null;

  const xMaxMin = computeXMax(pksWithData).xMaxMin;
  const hasNonSC = pksWithData.some(pk => isNonSCRoute(pk.route));
  const hasAnySC = pksWithData.some(pk => !isNonSCRoute(pk.route));
  const hasIVOverlay = pksWithData.some(pk => !!pk.ivHalfLifeLabel);

  // Derive the label and line style for the primary-route key entry.
  // When there are SC compounds the solid line represents SC routes.
  // When ALL compounds are non-SC every curve is dashed, so the key entry
  // should reflect the actual route (e.g. "IN" for intranasal) and be dashed.
  let primaryRouteLabel: string;
  let primaryRouteDashed: boolean;
  if (hasAnySC) {
    primaryRouteLabel = "SC";
    primaryRouteDashed = false;
  } else {
    const uniqueRoutes = [...new Set(pksWithData.map(pk => pk.route))];
    primaryRouteLabel = uniqueRoutes.length === 1 ? routeAbbrev(uniqueRoutes[0]) : "Primary route";
    primaryRouteDashed = true;
  }

  const curves = entries.flatMap(({ name, pk, color }) => {
    if (!pk) return [];
    const mid = pkMidpoint(pk);
    const pts = buildPKCurve(mid, xMaxMin, MINI_CHART, 120);
    const ivMid = pk.ivHalfLifeLabel
      ? (pk.ivHalfLifeMin !== undefined && pk.ivHalfLifeMax !== undefined
          ? (pk.ivHalfLifeMin + pk.ivHalfLifeMax) / 2
          : pk.ivHalfLifeMin ?? pk.ivHalfLifeMax ?? null)
      : null;
    const ivPts = ivMid !== null ? buildPKCurve(ivMid, xMaxMin, MINI_CHART, 120) : null;
    const ivCurveD = ivPts ? ptsToD(ivPts) : null;
    return [{ name, pk, color, d: ptsToD(pts), isNonSC: isNonSCRoute(pk.route), ivCurveD }];
  });

  if (curves.length === 0) return null;

  const showLegend = (hasNonSC && hasAnySC) || hasIVOverlay;

  const tooltipEntries: TooltipEntry[] = curves
    .filter(c => !!c.pk.ivHalfLifeLabel)
    .map(c => ({
      name: c.name,
      color: c.color,
      scLabel: c.pk.halfLifeLabel,
      ivLabel: c.pk.ivHalfLifeLabel!,
    }));

  const hasTooltip = hasIVOverlay && tooltipEntries.length > 0;

  // Native DOM event listeners — bypasses React's synthetic event system entirely.
  // This ensures Playwright's hover action reliably triggers show/hide.
  // Only attach listeners on devices that have a fine-pointer hover capability
  // (i.e. mouse/trackpad), so touch-only devices never show the tooltip.
  useEffect(() => {
    if (!hasTooltip) return;
    const wrapper = wrapperRef.current;
    const tooltip = tooltipRef.current;
    if (!wrapper || !tooltip) return;

    // Guard: skip on touch-only devices (stylus/finger primary input with no hover)
    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!hoverQuery.matches) return;

    const show = () => {
      tooltip.style.opacity = "1";
      tooltip.style.visibility = "visible";
    };
    const hide = () => {
      tooltip.style.opacity = "0";
      tooltip.style.visibility = "hidden";
    };

    wrapper.addEventListener("mouseenter", show);
    wrapper.addEventListener("mouseleave", hide);
    return () => {
      wrapper.removeEventListener("mouseenter", show);
      wrapper.removeEventListener("mouseleave", hide);
    };
  }, [hasTooltip]);

  return (
    <div className="mt-3">
      <div
        ref={wrapperRef}
        className="relative"
        data-testid={`pk-mini-hover-${stackId}`}
      >
        <svg
          viewBox={`0 0 ${MINI_CHART.vbW} ${MINI_CHART.vbH}`}
          className="w-full"
          style={{ maxHeight: 64, pointerEvents: "none" }}
          aria-hidden="true"
          data-testid={`mini-pk-chart-${stackId}`}
        >
          {curves.map((c) => (
            <path
              key={c.name}
              d={c.d}
              fill="none"
              stroke={c.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={c.isNonSC ? "6 3" : undefined}
              strokeOpacity="0.75"
            />
          ))}
          {curves.map((c) =>
            c.ivCurveD ? (
              <path
                key={`iv-${c.name}`}
                d={c.ivCurveD}
                fill="none"
                stroke={IV_OVERLAY_COLOR}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="3 2"
                strokeOpacity="0.7"
              />
            ) : null
          )}
        </svg>

        {hasTooltip && (
          <div
            ref={tooltipRef}
            role="tooltip"
            data-testid={`mini-pk-chart-tooltip-${stackId}`}
            className="absolute top-0.5 right-0.5 z-20 pointer-events-none select-none
                       rounded-md border border-white/10 px-2.5 py-2 shadow-xl"
            style={{
              background: "rgba(10,10,16,0.96)",
              minWidth: 130,
              opacity: 0,
              visibility: "hidden",
            }}
          >
            <p
              className="text-[9px] uppercase tracking-widest mb-1.5"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Route comparison
            </p>
            {tooltipEntries.map(entry => (
              <div key={entry.name} className="mb-1.5 last:mb-0">
                {tooltipEntries.length > 1 && (
                  <p
                    className="text-[9px] font-semibold mb-0.5 truncate max-w-[140px]"
                    style={{ color: entry.color }}
                  >
                    {entry.name}
                  </p>
                )}
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <svg width="10" height="3" viewBox="0 0 10 3" aria-hidden="true">
                      <line x1="0" y1="1.5" x2="10" y2="1.5" stroke={entry.color} strokeWidth="2" strokeLinecap="round" strokeOpacity="0.75" />
                    </svg>
                    <span
                      className="text-[10px] font-medium tabular-nums"
                      style={{ color: entry.color }}
                    >
                      SC t½ {entry.scLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg width="10" height="3" viewBox="0 0 10 3" aria-hidden="true">
                      <line x1="0" y1="1.5" x2="10" y2="1.5" stroke={IV_OVERLAY_COLOR} strokeWidth="2" strokeDasharray="3 2" strokeLinecap="round" strokeOpacity="0.75" />
                    </svg>
                    <span
                      className="text-[10px] font-medium tabular-nums"
                      style={{ color: IV_OVERLAY_COLOR }}
                    >
                      IV t½ {entry.ivLabel}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showLegend && (
        <div className="flex items-center justify-end gap-3 mt-1" data-testid={`pk-line-style-key-${stackId}`}>
          <div className="flex items-center gap-1.5" data-testid={`pk-primary-route-key-${stackId}`}>
            <svg width="14" height="4" viewBox="0 0 14 4" aria-hidden="true">
              <line
                x1="0" y1="2" x2="14" y2="2"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeOpacity="0.45"
                strokeDasharray={primaryRouteDashed ? "4 2" : undefined}
              />
            </svg>
            <span className="text-[9px] text-white/40 font-medium" data-testid={`pk-primary-route-label-${stackId}`}>{primaryRouteLabel}</span>
          </div>
          {hasNonSC && hasAnySC && (
            <div className="flex items-center gap-1.5">
              <svg width="14" height="4" viewBox="0 0 14 4" aria-hidden="true">
                <line x1="0" y1="2" x2="14" y2="2" stroke="#fff" strokeWidth="2" strokeDasharray="4 2" strokeLinecap="round" strokeOpacity="0.45" />
              </svg>
              <span className="text-[9px] text-white/40 font-medium">Other route</span>
            </div>
          )}
          {hasIVOverlay && (
            <div className="flex items-center gap-1.5" data-testid={`pk-iv-overlay-key-${stackId}`}>
              <svg width="14" height="4" viewBox="0 0 14 4" aria-hidden="true">
                <line x1="0" y1="2" x2="14" y2="2" stroke={IV_OVERLAY_COLOR} strokeWidth="2" strokeDasharray="3 2" strokeLinecap="round" strokeOpacity="0.7" />
              </svg>
              <span className="text-[9px] font-medium" style={{ color: IV_OVERLAY_COLOR, opacity: 0.7 }}>IV bolus</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
