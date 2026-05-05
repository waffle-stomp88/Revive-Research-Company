import { PEPTIDE_PATHWAYS, type PeptidePathway } from "@/data/peptide-pathways";
import { KNOWN_STACKS, type KnownStack } from "@/lib/synergy-data";
import { BODY_SYSTEMS, getSystemColor } from "@/data/body-systems";

export interface GalaxyNode {
  id: string;
  slug: string;
  name: string;
  position: [number, number, number];
  color: string;
  size: number;
  systemId: string;
  systemName: string;
  pathways: string[];
  mechanisms: string[];
  systems: string[];
  synergyCount: number;
}

export function toProductSlug(id: string): string {
  return id.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export interface GalaxyEdge {
  fromId: string;
  toId: string;
  fromIndex: number;
  toIndex: number;
  fromColor: string;
  toColor: string;
  weight: number;
  stackName: string;
  stackId?: string;
  stacks: { name: string; id?: string; synergyBonus: number }[];
  synergyBonus: number;
}

export interface GalaxyLayout {
  nodes: GalaxyNode[];
  edges: GalaxyEdge[];
  nodeIndex: Record<string, number>;
}

const DEFAULT_SYSTEM_ID = "longevity";

const SYSTEM_ALIAS_MAP: Record<string, string> = {
  healing: "healing",
  gut: "healing",
  joints: "healing",
  recovery: "healing",
  metabolic: "metabolic",
  weight: "metabolic",
  energy: "metabolic",
  growth: "growth",
  muscle: "growth",
  cognitive: "cognitive",
  focus: "cognitive",
  neuroprotection: "cognitive",
  mood: "cognitive",
  sleep: "cognitive",
  skin: "skin",
  hair: "skin",
  cosmetic: "skin",
  longevity: "longevity",
  immune: "longevity",
  hormonal: "longevity",
  heart: "healing",
  vascular: "healing",
};

export function resolvePrimarySystem(systems: string[]): string {
  for (const raw of systems) {
    const key = raw.toLowerCase().trim();
    if (SYSTEM_ALIAS_MAP[key]) return SYSTEM_ALIAS_MAP[key];
    const direct = BODY_SYSTEMS.find((b) => b.id === key);
    if (direct) return direct.id;
  }
  return DEFAULT_SYSTEM_ID;
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

const GALAXY_RADIUS = 18;
const SYSTEM_RADIUS = 7;
const RNG_SEED = 0xc0ffee;

function systemCenters(): Record<string, [number, number, number]> {
  const result: Record<string, [number, number, number]> = {};
  const n = BODY_SYSTEMS.length;
  for (let i = 0; i < n; i++) {
    const sys = BODY_SYSTEMS[i];
    const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
    const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
    const x = GALAXY_RADIUS * Math.sin(phi) * Math.cos(theta);
    const y = GALAXY_RADIUS * Math.sin(phi) * Math.sin(theta) * 0.6;
    const z = GALAXY_RADIUS * Math.cos(phi);
    result[sys.id] = [x, y, z];
  }
  return result;
}

function normalizePeptideKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findNodeIdForPeptideRef(
  ref: string,
  nodes: { id: string; normalizedKey: string }[]
): string | undefined {
  const normRef = normalizePeptideKey(ref);
  // Exact key match wins
  const exact = nodes.find((n) => n.id === ref || n.normalizedKey === normRef);
  if (exact) return exact.id;
  // Substring match
  const partial = nodes.find(
    (n) =>
      n.normalizedKey.includes(normRef) || normRef.includes(n.normalizedKey)
  );
  return partial?.id;
}

let cachedLayout: GalaxyLayout | null = null;

export function buildGalaxyLayout(): GalaxyLayout {
  if (cachedLayout) return cachedLayout;

  const centers = systemCenters();
  const grouped: Record<string, string[]> = {};
  const peptideEntries = Object.entries(PEPTIDE_PATHWAYS).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  for (const [id, data] of peptideEntries) {
    const sys = resolvePrimarySystem(data.systems);
    if (!grouped[sys]) grouped[sys] = [];
    grouped[sys].push(id);
  }

  // Count synergies per peptide first (across all KNOWN_STACKS)
  const synergyCount: Record<string, number> = {};
  for (const stack of KNOWN_STACKS) {
    for (const p of stack.peptides) {
      synergyCount[p] = (synergyCount[p] || 0) + (stack.peptides.length - 1);
    }
  }

  const nodes: GalaxyNode[] = [];
  const nodeIndex: Record<string, number> = {};

  for (const sysId of Object.keys(grouped).sort()) {
    const ids = grouped[sysId];
    const center = centers[sysId] ?? [0, 0, 0];
    const sysColor =
      getSystemColor(sysId) ??
      BODY_SYSTEMS.find((b) => b.id === sysId)?.color ??
      "#21d8ff";
    const sysName =
      BODY_SYSTEMS.find((b) => b.id === sysId)?.name ??
      sysId.charAt(0).toUpperCase() + sysId.slice(1);

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const data: PeptidePathway = PEPTIDE_PATHWAYS[id];
      const rng = mulberry32(hashString(id) ^ RNG_SEED);

      // Stable spherical position around the system's center
      const u = rng();
      const v = rng();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = SYSTEM_RADIUS * (0.55 + 0.45 * rng());

      const ox = r * Math.sin(phi) * Math.cos(theta);
      const oy = r * Math.sin(phi) * Math.sin(theta);
      const oz = r * Math.cos(phi);

      const sCount = synergyCount[id] ?? 0;
      const size = 0.55 + Math.min(sCount, 8) * 0.13;

      nodeIndex[id] = nodes.length;
      nodes.push({
        id,
        slug: toProductSlug(id),
        name: data.name,
        position: [center[0] + ox, center[1] + oy, center[2] + oz],
        color: sysColor,
        size,
        systemId: sysId,
        systemName: sysName,
        pathways: data.pathways,
        mechanisms: data.mechanisms,
        systems: data.systems,
        synergyCount: sCount,
      });
    }
  }

  const lookup = nodes.map((n) => ({
    id: n.id,
    normalizedKey: normalizePeptideKey(n.id),
  }));

  const edges: GalaxyEdge[] = [];
  const edgeIndex = new Map<string, number>();

  for (const stack of KNOWN_STACKS) {
    // detailPageId is optional — only exists on the curated known-stacks entries
    const detailPageId = (stack as KnownStack & { detailPageId?: string }).detailPageId;

    // Resolve each peptide ref to a node id, deduplicating so a single peptide
    // that matches multiple refs (e.g. melanotan-i and melanotan-ii both → "melanotan")
    // doesn't appear twice in the same stack and create self-loop edges.
    const seen = new Set<string>();
    const stackIds: string[] = [];
    for (const ref of stack.peptides) {
      const matchId = findNodeIdForPeptideRef(ref, lookup);
      if (matchId && !seen.has(matchId)) {
        seen.add(matchId);
        stackIds.push(matchId);
      }
    }

    for (let i = 0; i < stackIds.length; i++) {
      for (let j = i + 1; j < stackIds.length; j++) {
        const a = stackIds[i];
        const b = stackIds[j];
        // Guard against any remaining self-loops
        if (a === b) continue;
        const key = a < b ? `${a}|${b}` : `${b}|${a}`;
        const ai = nodeIndex[a];
        const bi = nodeIndex[b];
        if (ai === undefined || bi === undefined) continue;
        const existingIdx = edgeIndex.get(key);
        if (existingIdx !== undefined) {
          const existing = edges[existingIdx];
          existing.stacks.push({
            name: stack.name,
            id: detailPageId,
            synergyBonus: stack.synergyBonus,
          });
          if (stack.synergyBonus > existing.synergyBonus) {
            existing.synergyBonus = stack.synergyBonus;
            existing.weight = Math.max(0.15, (stack.synergyBonus - 80) / 20);
            existing.stackName = stack.name;
            existing.stackId = detailPageId;
          }
          continue;
        }
        const weight = Math.max(0.15, (stack.synergyBonus - 80) / 20);
        edgeIndex.set(key, edges.length);
        edges.push({
          fromId: a,
          toId: b,
          fromIndex: ai,
          toIndex: bi,
          fromColor: nodes[ai].color,
          toColor: nodes[bi].color,
          weight,
          stackName: stack.name,
          stackId: detailPageId,
          stacks: [{ name: stack.name, id: detailPageId, synergyBonus: stack.synergyBonus }],
          synergyBonus: stack.synergyBonus,
        });
      }
    }
  }

  cachedLayout = { nodes, edges, nodeIndex };
  return cachedLayout;
}

export function getStacksForPeptide(peptideId: string): KnownStack[] {
  const norm = normalizePeptideKey(peptideId);
  return KNOWN_STACKS.filter((s) =>
    s.peptides.some((p) => {
      const np = normalizePeptideKey(p);
      return np === norm || np.includes(norm) || norm.includes(np);
    })
  );
}
