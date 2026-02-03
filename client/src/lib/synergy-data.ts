import { Zap, Sparkles, Rocket, Heart, Activity, Brain, Crown, Moon, Shield, Dumbbell, Flame, Target, RefreshCw, Leaf, Pill, LucideIcon } from "lucide-react";

export interface KnownStack {
  name: string;
  peptides: string[];
  icon: LucideIcon;
  color: string;
  description: string;
  synergyBonus: number;
}

export interface PeptidePathway {
  name: string;
  pathways: string[];
  mechanisms: string[];
  systems: string[];
}

// Famous known stacks from research - expanded library based on scientific documentation
export const KNOWN_STACKS: KnownStack[] = [
  {
    name: "Wolverine Stack",
    peptides: ["bpc-157", "tb-500"],
    icon: Zap,
    color: "#22c55e",
    description: "Legendary healing combo - BPC-157's local repair + TB-500's systemic regeneration",
    synergyBonus: 95,
  },
  {
    name: "Total Regen",
    peptides: ["bpc-157", "tb-500", "ipamorelin"],
    icon: Shield,
    color: "#10b981",
    description: "Complete recovery - local healing + systemic repair + growth support",
    synergyBonus: 92,
  },
  {
    name: "Gut Restore",
    peptides: ["bpc-157", "kpv"],
    icon: Pill,
    color: "#14b8a6",
    description: "Digestive healing - gut lining repair + potent anti-inflammatory action",
    synergyBonus: 91,
  },
  {
    name: "Glow Protocol",
    peptides: ["bpc-157", "tb-500", "ghk-cu"],
    icon: Sparkles,
    color: "#ec4899",
    description: "Ultimate skin rejuvenation - collagen + blood vessels + tissue repair",
    synergyBonus: 90,
  },
  {
    name: "GH Amplifier",
    peptides: ["ipamorelin", "cjc-1295"],
    icon: Rocket,
    color: "#f59e0b",
    description: "Growth hormone synergy - GHRP + GHRH work better together",
    synergyBonus: 88,
  },
  {
    name: "Lean Mass",
    peptides: ["cjc-1295", "ipamorelin", "mots-c"],
    icon: Dumbbell,
    color: "#f97316",
    description: "GH amplification + metabolic enhancement for body composition",
    synergyBonus: 87,
  },
  {
    name: "Cognitive Edge",
    peptides: ["semax", "selank"],
    icon: Brain,
    color: "#21d8ff",
    description: "Nootropic synergy - focus enhancement + anxiety reduction",
    synergyBonus: 86,
  },
  {
    name: "Anti-Aging Protocol",
    peptides: ["epithalon", "ghk-cu", "ipamorelin"],
    icon: Leaf,
    color: "#84cc16",
    description: "Telomere support + collagen regeneration + natural GH optimization",
    synergyBonus: 85,
  },
  {
    name: "Longevity Protocol",
    peptides: ["epithalon", "ghk-cu"],
    icon: Crown,
    color: "#a855f7",
    description: "Telomere extension meets collagen regeneration",
    synergyBonus: 84,
  },
  {
    name: "Deep Sleep Formula",
    peptides: ["dsip", "ipamorelin", "epithalon"],
    icon: Moon,
    color: "#6366f1",
    description: "Sleep peptide + GH pulse + circadian rhythm optimization",
    synergyBonus: 84,
  },
  {
    name: "Fat Burner Stack",
    peptides: ["tesamorelin", "cjc-1295", "mots-c"],
    icon: Flame,
    color: "#ef4444",
    description: "Targeted fat reduction + GH elevation + metabolic acceleration",
    synergyBonus: 83,
  },
  {
    name: "Recovery+",
    peptides: ["bpc-157", "ghk-cu"],
    icon: Heart,
    color: "#22c55e",
    description: "Collagen synthesis meets tissue protection",
    synergyBonus: 82,
  },
  {
    name: "Performance Stack",
    peptides: ["cjc-1295", "ipamorelin", "bpc-157"],
    icon: Target,
    color: "#8b5cf6",
    description: "GH optimization + tissue protection for athletic performance",
    synergyBonus: 81,
  },
  {
    name: "Energy Stack",
    peptides: ["mots-c", "retatrutide"],
    icon: Activity,
    color: "#E7FB10",
    description: "Mitochondrial power + metabolic signaling",
    synergyBonus: 80,
  },
  {
    name: "Immune Boost",
    peptides: ["thymalin", "selank", "kpv"],
    icon: RefreshCw,
    color: "#06b6d4",
    description: "Thymus support + immune modulation + anti-inflammatory",
    synergyBonus: 79,
  },
];

// Peptide pathway data for connections
export const PEPTIDE_PATHWAYS: Record<string, PeptidePathway> = {
  "bpc-157": {
    name: "BPC-157",
    pathways: ["Nitric Oxide", "Angiogenesis", "Collagen Synthesis"],
    mechanisms: ["VEGF upregulation", "GH receptor activation", "Cytoprotection"],
    systems: ["Healing", "Gut", "Joints"],
  },
  "tb-500": {
    name: "TB-500",
    pathways: ["Actin Regulation", "Angiogenesis", "Cell Migration"],
    mechanisms: ["Thymosin Beta-4 fragment", "Blood vessel formation", "Tissue repair"],
    systems: ["Healing", "Muscle", "Heart"],
  },
  "ghk-cu": {
    name: "GHK-Cu",
    pathways: ["Collagen Synthesis", "Copper Signaling", "Matrix Remodeling"],
    mechanisms: ["TGF-β modulation", "Elastin production", "Wound healing"],
    systems: ["Skin", "Hair", "Longevity"],
  },
  "mots-c": {
    name: "MOTS-C",
    pathways: ["AMPK Activation", "Mitochondrial Biogenesis"],
    mechanisms: ["PGC-1α pathway", "Metabolic regulation", "Energy production"],
    systems: ["Metabolic", "Energy", "Longevity"],
  },
  "retatrutide": {
    name: "Retatrutide",
    pathways: ["GLP-1", "GIP", "Glucagon"],
    mechanisms: ["Triple receptor agonist", "Insulin sensitivity", "Fat oxidation"],
    systems: ["Metabolic", "Weight", "Blood Sugar"],
  },
  "ipamorelin": {
    name: "Ipamorelin",
    pathways: ["GHRP", "Ghrelin Receptor"],
    mechanisms: ["Selective GH release", "No cortisol spike", "Appetite neutral"],
    systems: ["Growth", "Recovery", "Sleep"],
  },
  "cjc-1295": {
    name: "CJC-1295",
    pathways: ["GHRH", "GH Axis"],
    mechanisms: ["Extended GH pulses", "IGF-1 elevation", "DAC stabilization"],
    systems: ["Growth", "Recovery", "Metabolism"],
  },
  "epithalon": {
    name: "Epithalon",
    pathways: ["Telomerase", "Pineal Gland"],
    mechanisms: ["Telomere elongation", "Melatonin regulation", "Anti-aging"],
    systems: ["Longevity", "Sleep", "Immunity"],
  },
  "semax": {
    name: "Semax",
    pathways: ["BDNF", "NGF", "ACTH Fragment"],
    mechanisms: ["Neuroprotection", "Cognitive enhancement", "Memory formation"],
    systems: ["Cognitive", "Neuroprotection", "Focus"],
  },
  "selank": {
    name: "Selank",
    pathways: ["GABA", "Tuftsin Analog"],
    mechanisms: ["Anxiolytic", "Immune modulation", "Mood regulation"],
    systems: ["Cognitive", "Mood", "Immunity"],
  },
  "kpv": {
    name: "KPV",
    pathways: ["Alpha-MSH Fragment", "NF-κB Inhibition"],
    mechanisms: ["Potent anti-inflammatory", "Gut barrier repair", "Immune modulation"],
    systems: ["Gut", "Immunity", "Healing"],
  },
  "dsip": {
    name: "DSIP",
    pathways: ["Delta Sleep", "Hypothalamus"],
    mechanisms: ["Sleep induction", "Stress modulation", "Circadian regulation"],
    systems: ["Sleep", "Recovery", "Mood"],
  },
  "tesamorelin": {
    name: "Tesamorelin",
    pathways: ["GHRH Analog", "GH Axis"],
    mechanisms: ["Targeted visceral fat reduction", "GH release", "Lipodystrophy treatment"],
    systems: ["Metabolic", "Fat Loss", "Growth"],
  },
  "thymalin": {
    name: "Thymalin",
    pathways: ["Thymus", "Immune Restoration"],
    mechanisms: ["T-cell maturation", "Immune reconstitution", "Thymic regeneration"],
    systems: ["Immunity", "Longevity", "Recovery"],
  },
};

// Helper to normalize peptide names for matching
export function normalizePeptideName(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/\s*\(.*?\)\s*/g, ''); // Remove dosage info like (100mg)
}

// Find synergy partners for a given peptide
export function getSynergyPartners(peptideName: string): { partner: string; stack: KnownStack; synergyBonus: number }[] {
  const normalizedName = normalizePeptideName(peptideName);
  const partners: { partner: string; stack: KnownStack; synergyBonus: number }[] = [];
  
  for (const stack of KNOWN_STACKS) {
    if (stack.peptides.includes(normalizedName)) {
      for (const partner of stack.peptides) {
        if (partner !== normalizedName) {
          partners.push({
            partner: PEPTIDE_PATHWAYS[partner]?.name || partner.toUpperCase(),
            stack,
            synergyBonus: stack.synergyBonus,
          });
        }
      }
    }
  }
  
  // Remove duplicates and sort by synergy bonus
  const uniquePartners = partners.reduce((acc, curr) => {
    const existing = acc.find(p => p.partner === curr.partner);
    if (!existing || existing.synergyBonus < curr.synergyBonus) {
      return [...acc.filter(p => p.partner !== curr.partner), curr];
    }
    return acc;
  }, [] as typeof partners);
  
  return uniquePartners.sort((a, b) => b.synergyBonus - a.synergyBonus);
}
