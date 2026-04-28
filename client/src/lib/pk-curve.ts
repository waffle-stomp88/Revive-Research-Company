import type { HalfLifeEntry } from "@/data/pharmacokinetics";

export function isNonSCRoute(route: string): boolean {
  return route.toLowerCase() !== "subcutaneous";
}

export function pkMidpoint(pk: HalfLifeEntry): number | null {
  if (pk.halfLifeMin !== undefined && pk.halfLifeMax !== undefined) return (pk.halfLifeMin + pk.halfLifeMax) / 2;
  if (pk.halfLifeMin !== undefined) return pk.halfLifeMin;
  if (pk.halfLifeMax !== undefined) return pk.halfLifeMax;
  return null;
}

export function computeXMax(pks: HalfLifeEntry[]): { xMaxMin: number; shortFocus: boolean } {
  const mids = pks.map(pkMidpoint).filter((v): v is number => v !== null && v > 0);
  if (mids.length === 0) return { xMaxMin: 1440, shortFocus: false };
  const minM = Math.min(...mids);
  const maxM = Math.max(...mids);
  if (mids.length >= 2 && maxM / minM > 30) {
    return { xMaxMin: Math.min(10 * minM, 4320), shortFocus: true };
  }
  return { xMaxMin: Math.min(5 * maxM, 7200), shortFocus: false };
}

export function buildPKCurve(
  halfLifeMidMin: number | null,
  xMaxMin: number,
  chart: { x0: number; y0: number; plotW: number; plotH: number },
  N = 240,
): { x: number; y: number }[] {
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
    x: chart.x0 + (i / N) * chart.plotW,
    y: chart.y0 + chart.plotH * (1 - v / maxV),
  }));
}

export function ptsToD(pts: { x: number; y: number }[]): string {
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
