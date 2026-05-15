import { describe, it, expect } from "vitest";
import {
  buildGalaxyLayout,
  resolvePrimarySystem,
  getStacksForPeptide,
  toProductSlug,
} from "@/lib/galaxy-layout";
import { PEPTIDE_PATHWAYS } from "@/data/peptide-pathways";
import { KNOWN_STACKS } from "@/lib/synergy-data";
import { BODY_SYSTEMS } from "@/data/body-systems";

describe("galaxy layout", () => {
  it("includes a node for every peptide in PEPTIDE_PATHWAYS", () => {
    const layout = buildGalaxyLayout();
    const peptideIds = Object.keys(PEPTIDE_PATHWAYS).sort();
    const nodeIds = layout.nodes.map((n) => n.id).sort();
    expect(nodeIds).toEqual(peptideIds);
  });

  it("returns identical positions across calls (deterministic)", () => {
    const a = buildGalaxyLayout();
    const b = buildGalaxyLayout();
    expect(a.nodes.length).toBe(b.nodes.length);
    for (let i = 0; i < a.nodes.length; i++) {
      expect(a.nodes[i].position).toEqual(b.nodes[i].position);
      expect(a.nodes[i].color).toEqual(b.nodes[i].color);
      expect(a.nodes[i].systemId).toEqual(b.nodes[i].systemId);
    }
  });

  it("assigns each node to one of the canonical body systems", () => {
    const layout = buildGalaxyLayout();
    const validSystems = new Set(BODY_SYSTEMS.map((s) => s.id));
    for (const n of layout.nodes) {
      expect(validSystems.has(n.systemId)).toBe(true);
    }
  });

  it("creates an edge for each unique peptide pair in KNOWN_STACKS", () => {
    const layout = buildGalaxyLayout();
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const findId = (ref: string): string | undefined => {
      const r = norm(ref);
      const exact = layout.nodes.find((n) => n.id === ref || norm(n.id) === r);
      if (exact) return exact.id;
      const partial = layout.nodes.find((n) => {
        const k = norm(n.id);
        return k.includes(r) || r.includes(k);
      });
      return partial?.id;
    };
    const expectedPairs = new Set<string>();
    for (const stack of KNOWN_STACKS) {
      const ids = stack.peptides
        .map((p) => findId(p))
        .filter((x): x is string => Boolean(x));
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          const a = ids[i];
          const b = ids[j];
          expectedPairs.add(a < b ? `${a}|${b}` : `${b}|${a}`);
        }
      }
    }
    const actualPairs = new Set(
      layout.edges.map((e) =>
        e.fromId < e.toId ? `${e.fromId}|${e.toId}` : `${e.toId}|${e.fromId}`
      )
    );
    expect(actualPairs.size).toBe(expectedPairs.size);
    expect(expectedPairs.size).toBeGreaterThan(0);
    for (const pair of expectedPairs) {
      expect(actualPairs.has(pair)).toBe(true);
    }
  });

  it("edge weights are clamped to a minimum of 0.15", () => {
    const layout = buildGalaxyLayout();
    for (const e of layout.edges) {
      expect(e.weight).toBeGreaterThanOrEqual(0.15);
    }
  });

  it("resolvePrimarySystem maps known aliases", () => {
    expect(resolvePrimarySystem(["gut"])).toBe("healing");
    expect(resolvePrimarySystem(["weight"])).toBe("metabolic");
    expect(resolvePrimarySystem(["focus"])).toBe("cognitive");
    expect(resolvePrimarySystem(["unknown-system"])).toBe("longevity");
  });

  it("getStacksForPeptide returns stacks containing the peptide", () => {
    const stacks = getStacksForPeptide("bpc-157");
    expect(stacks.length).toBeGreaterThan(0);
    for (const s of stacks) {
      expect(s.peptides.some((p) => p.toLowerCase().includes("bpc"))).toBe(
        true
      );
    }
  });

  it("normalizes ids with spaces into product slugs", () => {
    expect(toProductSlug("thymosin alpha")).toBe("thymosin-alpha");
    expect(toProductSlug("igf-1 lr3")).toBe("igf-1-lr3");
    expect(toProductSlug("bpc-157")).toBe("bpc-157");
    const layout = buildGalaxyLayout();
    for (const n of layout.nodes) {
      expect(n.slug).toMatch(/^[a-z0-9-]+$/);
      expect(n.slug.includes(" ")).toBe(false);
    }
  });

  it("nodeIndex maps every node id to its index", () => {
    const layout = buildGalaxyLayout();
    for (let i = 0; i < layout.nodes.length; i++) {
      expect(layout.nodeIndex[layout.nodes[i].id]).toBe(i);
    }
  });
});
