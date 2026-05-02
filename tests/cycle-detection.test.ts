import { describe, it, expect } from "vitest";
import {
  detectCycles,
  computeCycleStats,
  getCompoundKey,
  GAP_DAYS,
  type CycleDetectionEntry,
} from "@shared/cycle-detection";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function makeEntry(overrides: Partial<CycleDetectionEntry> & { id: string; daysAgo: number }): CycleDetectionEntry {
  const now = new Date("2026-05-02T12:00:00Z");
  const date = new Date(now.getTime() - overrides.daysAgo * MS_PER_DAY);
  return {
    id: overrides.id,
    productId: overrides.productId ?? null,
    tags: overrides.tags ?? null,
    administeredAt: overrides.administeredAt !== undefined ? overrides.administeredAt : date,
    createdAt: overrides.createdAt ?? date,
    cycleMarker: overrides.cycleMarker ?? null,
    dose: overrides.dose,
    doseUnit: overrides.doseUnit,
  };
}

const NOW = new Date("2026-05-02T12:00:00Z");

describe("detectCycles", () => {
  it("returns no cycles for an empty list", () => {
    expect(detectCycles([], NOW)).toEqual([]);
  });

  it("creates a single cycle for one entry", () => {
    const entries = [makeEntry({ id: "a", daysAgo: 1, productId: "prod-1" })];
    const cycles = detectCycles(entries, NOW);
    expect(cycles).toHaveLength(1);
    expect(cycles[0].entries).toHaveLength(1);
    expect(cycles[0].status).toBe("active");
    expect(cycles[0].compoundKey).toBe("prod-1");
  });

  it("groups consecutive entries within the gap window into one cycle", () => {
    const entries = [
      makeEntry({ id: "a", daysAgo: 20, productId: "prod-1" }),
      makeEntry({ id: "b", daysAgo: 18, productId: "prod-1" }),
      makeEntry({ id: "c", daysAgo: 15, productId: "prod-1" }),
    ];
    const cycles = detectCycles(entries, NOW);
    expect(cycles).toHaveLength(1);
    expect(cycles[0].entries.map((e) => e.id)).toEqual(["a", "b", "c"]);
  });

  it("starts a new cycle when the gap exceeds GAP_DAYS", () => {
    const entries = [
      makeEntry({ id: "a", daysAgo: 60, productId: "prod-1" }),
      makeEntry({ id: "b", daysAgo: 58, productId: "prod-1" }),
      // 30-day gap > GAP_DAYS (14)
      makeEntry({ id: "c", daysAgo: 5, productId: "prod-1" }),
      makeEntry({ id: "d", daysAgo: 2, productId: "prod-1" }),
    ];
    const cycles = detectCycles(entries, NOW);
    expect(cycles).toHaveLength(2);
    const active = cycles.find((c) => c.status === "active")!;
    const completed = cycles.find((c) => c.status === "completed")!;
    expect(active.entries.map((e) => e.id)).toEqual(["c", "d"]);
    expect(completed.entries.map((e) => e.id)).toEqual(["a", "b"]);
  });

  it("respects an explicit 'end' marker on the previous entry", () => {
    const entries = [
      makeEntry({ id: "a", daysAgo: 10, productId: "prod-1" }),
      makeEntry({ id: "b", daysAgo: 8, productId: "prod-1", cycleMarker: "end" }),
      makeEntry({ id: "c", daysAgo: 6, productId: "prod-1" }),
      makeEntry({ id: "d", daysAgo: 1, productId: "prod-1" }),
    ];
    const cycles = detectCycles(entries, NOW);
    expect(cycles).toHaveLength(2);
    const completed = cycles.find((c) => c.endEntryId === "b")!;
    expect(completed.status).toBe("completed");
    const active = cycles.find((c) => c.startEntryId === "c")!;
    expect(active.entries.map((e) => e.id)).toEqual(["c", "d"]);
    expect(active.status).toBe("active");
  });

  it("respects an explicit 'start' marker on the current entry", () => {
    const entries = [
      makeEntry({ id: "a", daysAgo: 10, productId: "prod-1" }),
      makeEntry({ id: "b", daysAgo: 8, productId: "prod-1" }),
      makeEntry({ id: "c", daysAgo: 6, productId: "prod-1", cycleMarker: "start" }),
      makeEntry({ id: "d", daysAgo: 1, productId: "prod-1" }),
    ];
    const cycles = detectCycles(entries, NOW);
    expect(cycles).toHaveLength(2);
    const first = cycles.find((c) => c.startEntryId === "a")!;
    expect(first.entries.map((e) => e.id)).toEqual(["a", "b"]);
    const second = cycles.find((c) => c.startEntryId === "c")!;
    expect(second.entries.map((e) => e.id)).toEqual(["c", "d"]);
  });

  it("splits two interleaved compounds into separate cycles", () => {
    const entries = [
      makeEntry({ id: "a1", daysAgo: 10, productId: "prod-A" }),
      makeEntry({ id: "b1", daysAgo: 9, productId: "prod-B" }),
      makeEntry({ id: "a2", daysAgo: 8, productId: "prod-A" }),
      makeEntry({ id: "b2", daysAgo: 7, productId: "prod-B" }),
      makeEntry({ id: "a3", daysAgo: 1, productId: "prod-A" }),
    ];
    const cycles = detectCycles(entries, NOW);
    // Compound A entries are all within 14 days of each other so 1 cycle.
    // Compound B entries are within 14 days of each other so 1 cycle.
    expect(cycles).toHaveLength(2);
    const aCycle = cycles.find((c) => c.compoundKey === "prod-A")!;
    const bCycle = cycles.find((c) => c.compoundKey === "prod-B")!;
    expect(aCycle.entries.map((e) => e.id)).toEqual(["a1", "a2", "a3"]);
    expect(bCycle.entries.map((e) => e.id)).toEqual(["b1", "b2"]);
  });

  it("falls back to compound: tag for free-text compounds", () => {
    const entries = [
      makeEntry({
        id: "a",
        daysAgo: 5,
        productId: null,
        tags: ["compound:My Custom Peptide", "source:logbook"],
      }),
      makeEntry({
        id: "b",
        daysAgo: 1,
        productId: null,
        tags: ["compound:my custom peptide"],
      }),
    ];
    const cycles = detectCycles(entries, NOW);
    expect(cycles).toHaveLength(1);
    expect(cycles[0].compoundKey).toBe("custom:my custom peptide");
    expect(cycles[0].compoundLabel).toBeTruthy();
  });

  it("classifies a cycle as completed when the last entry is older than the active window", () => {
    const entries = [
      makeEntry({ id: "a", daysAgo: 60, productId: "prod-1" }),
      makeEntry({ id: "b", daysAgo: 50, productId: "prod-1" }),
    ];
    const cycles = detectCycles(entries, NOW);
    expect(cycles).toHaveLength(1);
    expect(cycles[0].status).toBe("completed");
  });

  it("uses the gap window of 14 days exactly", () => {
    expect(GAP_DAYS).toBe(14);
  });
});

describe("computeCycleStats", () => {
  it("computes totals, average dose, and doses-per-week", () => {
    const entries = [
      makeEntry({ id: "a", daysAgo: 14, productId: "p", dose: "250", doseUnit: "mcg" }),
      makeEntry({ id: "b", daysAgo: 7, productId: "p", dose: "300", doseUnit: "mcg" }),
      makeEntry({ id: "c", daysAgo: 0, productId: "p", dose: "250", doseUnit: "mcg" }),
    ];
    const cycles = detectCycles(entries, NOW);
    expect(cycles).toHaveLength(1);
    const stats = computeCycleStats(cycles[0]);
    expect(stats.totalDoses).toBe(3);
    expect(stats.averageDose).toBeCloseTo((250 + 300 + 250) / 3, 5);
    expect(stats.averageDoseUnit).toBe("mcg");
    expect(stats.dosesPerWeek).toBeGreaterThan(0);
  });

  it("returns dosesPerWeek=null for a single-entry cycle", () => {
    const entries = [makeEntry({ id: "a", daysAgo: 1, productId: "p", dose: "100", doseUnit: "mcg" })];
    const cycles = detectCycles(entries, NOW);
    const stats = computeCycleStats(cycles[0]);
    expect(stats.totalDoses).toBe(1);
    expect(stats.dosesPerWeek).toBeNull();
    expect(stats.daysRunning).toBe(1);
  });
});

describe("getCompoundKey", () => {
  it("prefers productId over tags", () => {
    const entry = makeEntry({
      id: "x",
      daysAgo: 0,
      productId: "prod-1",
      tags: ["compound:Other Name"],
    });
    expect(getCompoundKey(entry)).toEqual({ key: "prod-1", label: null });
  });

  it("uses the compound: tag when productId is missing", () => {
    const entry = makeEntry({
      id: "x",
      daysAgo: 0,
      productId: null,
      tags: ["compound:BPC-157", "source:logbook"],
    });
    expect(getCompoundKey(entry)).toEqual({
      key: "custom:bpc-157",
      label: "BPC-157",
    });
  });

  it("returns 'unknown' when no productId or compound tag is present", () => {
    const entry = makeEntry({
      id: "x",
      daysAgo: 0,
      productId: null,
      tags: ["source:logbook"],
    });
    expect(getCompoundKey(entry)).toEqual({ key: "unknown", label: null });
  });
});
