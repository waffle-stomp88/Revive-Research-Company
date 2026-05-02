export const GAP_DAYS = 14;
export const ACTIVE_WINDOW_DAYS = 14;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface CycleDetectionEntry {
  id: string;
  productId: string | null;
  tags: string[] | null;
  administeredAt: Date | string | null;
  createdAt: Date | string | null;
  cycleMarker: string | null;
  dose?: string | number | null;
  doseUnit?: string | null;
}

export interface DetectedCycle<E extends CycleDetectionEntry = CycleDetectionEntry> {
  compoundKey: string;
  compoundLabel: string | null;
  startEntryId: string;
  endEntryId: string;
  entries: E[];
  startDate: Date;
  endDate: Date;
  status: "active" | "completed";
}

const COMPOUND_TAG_PREFIX = "compound:";

export function getCompoundKey(entry: CycleDetectionEntry): {
  key: string;
  label: string | null;
} {
  if (entry.productId) {
    return { key: entry.productId, label: null };
  }
  const tag = (entry.tags ?? []).find((t) =>
    typeof t === "string" && t.toLowerCase().startsWith(COMPOUND_TAG_PREFIX),
  );
  if (tag) {
    const raw = tag.slice(COMPOUND_TAG_PREFIX.length).trim();
    if (raw.length > 0) {
      return { key: `custom:${raw.toLowerCase()}`, label: raw };
    }
  }
  return { key: "unknown", label: null };
}

export function effectiveTimestamp(entry: CycleDetectionEntry): Date {
  const raw = entry.administeredAt ?? entry.createdAt;
  if (!raw) return new Date(0);
  const d = raw instanceof Date ? raw : new Date(raw);
  return isNaN(d.getTime()) ? new Date(0) : d;
}

export function detectCycles<E extends CycleDetectionEntry>(
  entries: E[],
  now: Date = new Date(),
): DetectedCycle<E>[] {
  if (!entries.length) return [];

  const groups = new Map<string, { label: string | null; items: E[] }>();
  for (const entry of entries) {
    const { key, label } = getCompoundKey(entry);
    let g = groups.get(key);
    if (!g) {
      g = { label, items: [] };
      groups.set(key, g);
    }
    g.items.push(entry);
    if (!g.label && label) g.label = label;
  }

  const cycles: DetectedCycle<E>[] = [];

  for (const [compoundKey, group] of groups.entries()) {
    const sorted = [...group.items].sort(
      (a, b) => effectiveTimestamp(a).getTime() - effectiveTimestamp(b).getTime(),
    );

    let current: E[] = [];
    let prevEntry: E | null = null;

    const flush = () => {
      if (!current.length) return;
      const first = current[0];
      const last = current[current.length - 1];
      const endDate = effectiveTimestamp(last);
      const ageDays = (now.getTime() - endDate.getTime()) / MS_PER_DAY;
      const isActive =
        ageDays <= ACTIVE_WINDOW_DAYS && last.cycleMarker !== "end";
      cycles.push({
        compoundKey,
        compoundLabel: group.label,
        startEntryId: first.id,
        endEntryId: last.id,
        entries: current,
        startDate: effectiveTimestamp(first),
        endDate,
        status: isActive ? "active" : "completed",
      });
      current = [];
    };

    for (const entry of sorted) {
      if (!prevEntry) {
        current.push(entry);
        prevEntry = entry;
        continue;
      }
      const gapMs = effectiveTimestamp(entry).getTime() - effectiveTimestamp(prevEntry).getTime();
      const gapDays = gapMs / MS_PER_DAY;
      if (gapDays > GAP_DAYS || prevEntry.cycleMarker === "end" || entry.cycleMarker === "start") {
        flush();
      }
      current.push(entry);
      prevEntry = entry;
    }
    flush();
  }

  cycles.sort((a, b) => {
    if (a.status !== b.status) return a.status === "active" ? -1 : 1;
    return b.endDate.getTime() - a.endDate.getTime();
  });

  return cycles;
}

export interface CycleStats {
  totalDoses: number;
  daysRunning: number;
  averageDose: number | null;
  averageDoseUnit: string | null;
  dosesPerWeek: number | null;
}

export function computeCycleStats(cycle: DetectedCycle): CycleStats {
  const totalDoses = cycle.entries.length;
  const ms = cycle.endDate.getTime() - cycle.startDate.getTime();
  const daysRunning = totalDoses <= 1 ? 1 : Math.max(1, Math.round(ms / MS_PER_DAY) + 1);

  const unitCounts = new Map<string, { count: number; sum: number }>();
  for (const e of cycle.entries) {
    if (e.dose == null || e.doseUnit == null) continue;
    const num = typeof e.dose === "number" ? e.dose : parseFloat(String(e.dose));
    if (!Number.isFinite(num)) continue;
    const u = e.doseUnit;
    const bucket = unitCounts.get(u) ?? { count: 0, sum: 0 };
    bucket.count += 1;
    bucket.sum += num;
    unitCounts.set(u, bucket);
  }
  let topUnit: string | null = null;
  let topBucket: { count: number; sum: number } | null = null;
  for (const [u, b] of unitCounts.entries()) {
    if (!topBucket || b.count > topBucket.count) {
      topUnit = u;
      topBucket = b;
    }
  }
  const averageDose = topBucket && topBucket.count > 0 ? topBucket.sum / topBucket.count : null;

  let dosesPerWeek: number | null = null;
  if (totalDoses >= 2 && ms > 0) {
    const weeks = ms / (MS_PER_DAY * 7);
    if (weeks > 0) dosesPerWeek = (totalDoses - 1) / weeks;
  }

  return {
    totalDoses,
    daysRunning,
    averageDose,
    averageDoseUnit: topUnit,
    dosesPerWeek,
  };
}
