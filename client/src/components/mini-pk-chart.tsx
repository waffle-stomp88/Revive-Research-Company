import { getHalfLifeByName } from "@/data/pharmacokinetics";
import type { HalfLifeEntry } from "@/data/pharmacokinetics";
import { isNonSCRoute, pkMidpoint, computeXMax, buildPKCurve, ptsToD } from "@/lib/pk-curve";

const MINI_CHART = {
  vbW: 300, vbH: 64,
  pT: 4, pR: 4, pB: 4, pL: 4,
  get plotW() { return this.vbW - this.pL - this.pR; },
  get plotH() { return this.vbH - this.pT - this.pB; },
  get x0() { return this.pL; },
  get y0() { return this.pT; },
};

export const MINI_PK_COLORS = ["#21d8ff", "#E7FB10", "#22c55e", "#f59e0b", "#a855f7"];

const IV_OVERLAY_COLOR = "#f97316";

export function MiniPKChart({ peptideNames, stackId }: { peptideNames: string[]; stackId: string }) {
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

  return (
    <div className="mt-3">
      <svg
        viewBox={`0 0 ${MINI_CHART.vbW} ${MINI_CHART.vbH}`}
        className="w-full"
        style={{ maxHeight: 64 }}
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
      {showLegend && (
        <div className="flex items-center justify-end gap-3 mt-1" data-testid={`pk-line-style-key-${stackId}`}>
          <div className="flex items-center gap-1.5">
            <svg width="14" height="4" viewBox="0 0 14 4" aria-hidden="true">
              <line x1="0" y1="2" x2="14" y2="2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.45" />
            </svg>
            <span className="text-[9px] text-white/40 font-medium">SC</span>
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
