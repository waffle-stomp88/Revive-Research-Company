import { PEPTIDE_PATHWAYS, type PeptidePathway } from "@/data/peptide-pathways";
import { KNOWN_STACKS, type KnownStack } from "@/lib/synergy-data";
import { BODY_SYSTEMS, getSystemColor } from "@/data/body-systems";
import { resolvePrimarySystem } from "@/lib/peptide-systems";

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
  isHub: boolean;
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

export { resolvePrimarySystem } from "@/lib/peptide-systems";
export { SYSTEM_ALIAS_MAP } from "@/lib/peptide-systems";

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

function normalizePeptideKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Galaxy scale constants
const GALAXY_RADIUS = 60;
const MIN_R = 8;
const SPIRAL_OFFSET = 0.5; // radians — rotates all arms slightly for aesthetics
const ARM_WIDTH = 4.5;     // perpendicular jitter (half-width of arm band)
const RNG_SEED = 0xc0ffee;

// Explicit hub peptide IDs (normalized for matching)
const HUB_NAMES_NORMALIZED = new Set([
  "bpc157", "tb500", "ipamorelin", "cjc1295", "epithalon", "semax",
  "selank", "igf1lr3", "semaglutide", "nadprecursor", "ghkcu", "ss31",
]);

function isHubPeptide(id: string, synergyCount: number): boolean {
  if (synergyCount >= 5) return true;
  const norm = normalizePeptideKey(id);
  return HUB_NAMES_NORMALIZED.has(norm);
}

/**
 * Compute a logarithmic spiral arm position for a peptide.
 * t ranges [0.15, 0.90] along the arm; theta is derived from r via log spiral.
 */
function spiralPosition(
  t: number,
  armBase: number,
  rng: () => number
): [number, number, number] {
  const r = MIN_R + t * (GALAXY_RADIUS - MIN_R);
  const theta = armBase + Math.log(r * 0.01 + 1) / 0.55;

  // Perpendicular jitter to give arm some width
  const perpAngle = theta + Math.PI / 2;
  const perpDist = (rng() - 0.5) * 2 * ARM_WIDTH;

  const x = r * Math.cos(theta) + perpDist * Math.cos(perpAngle);
  const z = r * Math.sin(theta) + perpDist * Math.sin(perpAngle);
  const y = (rng() - 0.5) * 2 * 1.8; // very thin disc on Y axis

  return [x, y, z];
}

function findNodeIdForPeptideRef(
  ref: string,
  nodes: { id: string; normalizedKey: string }[]
): string | undefined {
  const normRef = normalizePeptideKey(ref);
  const exact = nodes.find((n) => n.id === ref || n.normalizedKey === normRef);
  if (exact) return exact.id;
  const partial = nodes.find(
    (n) =>
      n.normalizedKey.includes(normRef) || normRef.includes(n.normalizedKey)
  );
  return partial?.id;
}

let cachedLayout: GalaxyLayout | null = null;

export function buildGalaxyLayout(knownStacks?: KnownStack[]): GalaxyLayout {
  const stacks = knownStacks ?? KNOWN_STACKS;
  if (!knownStacks && cachedLayout) return cachedLayout;

  // Group peptides by primary body system
  const grouped: Record<string, string[]> = {};
  const peptideEntries = Object.entries(PEPTIDE_PATHWAYS).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  for (const [id, data] of peptideEntries) {
    const sys = resolvePrimarySystem(data.systems);
    if (!grouped[sys]) grouped[sys] = [];
    grouped[sys].push(id);
  }

  // Count synergies per peptide (across all stacks)
  const synergyCount: Record<string, number> = {};
  for (const stack of stacks) {
    for (const p of stack.peptides) {
      synergyCount[p] = (synergyCount[p] || 0) + (stack.peptides.length - 1);
    }
  }

  const nodes: GalaxyNode[] = [];
  const nodeIndex: Record<string, number> = {};

  // Build spiral arms in BODY_SYSTEMS order so each system has a consistent arm
  const numSystems = BODY_SYSTEMS.length;

  for (let sysIdx = 0; sysIdx < numSystems; sysIdx++) {
    const sys = BODY_SYSTEMS[sysIdx];
    const sysId = sys.id;
    const ids = grouped[sysId] ?? [];
    if (ids.length === 0) continue;

    const armBase = (2 * Math.PI / numSystems) * sysIdx + SPIRAL_OFFSET;
    const sysColor = getSystemColor(sysId) ?? sys.color ?? "#21d8ff";
    const sysName = sys.name;

    // Sort peptide IDs for stable ordering, then assign t-positions along the arm
    const sortedIds = [...ids].sort();
    const count = sortedIds.length;

    for (let i = 0; i < count; i++) {
      const id = sortedIds[i];
      const data: PeptidePathway = PEPTIDE_PATHWAYS[id];
      const rng = mulberry32(hashString(id) ^ RNG_SEED);

      // t: evenly spaced along [0.15, 0.90] with a small deterministic jitter
      const tBase = 0.15 + (i / Math.max(count - 1, 1)) * 0.75;
      const tJitter = (rng() - 0.5) * (0.75 / Math.max(count, 1)) * 0.6;
      const t = Math.max(0.05, Math.min(0.95, tBase + tJitter));

      const position = spiralPosition(t, armBase, rng);

      const sCount = synergyCount[id] ?? 0;
      const size = 0.55 + Math.min(sCount, 8) * 0.13;
      const hub = isHubPeptide(id, sCount);

      nodeIndex[id] = nodes.length;
      nodes.push({
        id,
        slug: toProductSlug(id),
        name: data.name,
        position,
        color: sysColor,
        size,
        systemId: sysId,
        systemName: sysName,
        pathways: data.pathways,
        mechanisms: data.mechanisms,
        systems: data.systems,
        synergyCount: sCount,
        isHub: hub,
      });
    }
  }

  // Handle any peptides that didn't map to a known system (use longevity as fallback)
  const longevityArm = BODY_SYSTEMS.findIndex((s) => s.id === "longevity");
  const fallbackArmBase = (2 * Math.PI / numSystems) * longevityArm + SPIRAL_OFFSET;
  const fallbackColor = getSystemColor("longevity") ?? "#a855f7";

  for (const [id, data] of peptideEntries) {
    if (nodeIndex[id] !== undefined) continue;
    const rng = mulberry32(hashString(id) ^ RNG_SEED);
    const t = 0.15 + rng() * 0.75;
    const position = spiralPosition(t, fallbackArmBase, rng);
    const sCount = synergyCount[id] ?? 0;
    const size = 0.55 + Math.min(sCount, 8) * 0.13;
    nodeIndex[id] = nodes.length;
    nodes.push({
      id,
      slug: toProductSlug(id),
      name: data.name,
      position,
      color: fallbackColor,
      size,
      systemId: "longevity",
      systemName: "Longevity",
      pathways: data.pathways,
      mechanisms: data.mechanisms,
      systems: data.systems,
      synergyCount: sCount,
      isHub: isHubPeptide(id, sCount),
    });
  }

  const lookup = nodes.map((n) => ({
    id: n.id,
    normalizedKey: normalizePeptideKey(n.id),
  }));

  const edges: GalaxyEdge[] = [];
  const edgeIndex = new Map<string, number>();

  for (const stack of stacks) {
    const detailPageId = (stack as KnownStack & { detailPageId?: string }).detailPageId;

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

  const result = { nodes, edges, nodeIndex };
  if (!knownStacks) cachedLayout = result;
  return result;
}

export function getStacksForPeptide(peptideId: string, knownStacks?: KnownStack[]): KnownStack[] {
  const stacks = knownStacks ?? KNOWN_STACKS;
  const norm = normalizePeptideKey(peptideId);
  return stacks.filter((s) =>
    s.peptides.some((p) => {
      const np = normalizePeptideKey(p);
      return np === norm || np.includes(norm) || norm.includes(np);
    })
  );
}
