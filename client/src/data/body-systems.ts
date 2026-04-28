import { Heart, Zap, Target, Brain, Sparkles, Crown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface BodySystem {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  description: string;
}

export const BODY_SYSTEMS: BodySystem[] = [
  { id: "healing", name: "Healing", icon: Heart, color: "#22c55e", description: "Tissue repair, wound healing, and injury recovery through growth factor activation" },
  { id: "metabolic", name: "Metabolic", icon: Zap, color: "#E7FB10", description: "Energy production, fat metabolism, and mitochondrial function optimization" },
  { id: "growth", name: "Growth", icon: Target, color: "#f59e0b", description: "Growth hormone pathways supporting muscle, bone, and cellular development" },
  { id: "cognitive", name: "Cognitive", icon: Brain, color: "#21d8ff", description: "Neuroprotection, focus enhancement, and brain-derived growth factors" },
  { id: "skin", name: "Skin", icon: Sparkles, color: "#ec4899", description: "Collagen synthesis, elastin production, and dermal regeneration" },
  { id: "longevity", name: "Longevity", icon: Crown, color: "#a855f7", description: "Anti-aging mechanisms including telomere support and cellular renewal" },
];

const SYSTEM_ALIASES: Record<string, string> = {
  gut: "healing", joints: "healing",
  muscle: "growth", hormonal: "growth",
  energy: "metabolic", weight: "metabolic", "fat loss": "metabolic",
  focus: "cognitive", neuroprotection: "cognitive", mood: "cognitive",
  cosmetic: "skin", hair: "skin",
  "anti-aging": "longevity",
};

const SYSTEM_FALLBACK_COLORS: Record<string, string> = {
  sleep: "#8b5cf6",
  immune: "#34d399", immunity: "#34d399",
  recovery: "#60a5fa",
  heart: "#ef4444", vascular: "#ef4444",
};

export function getSystemColor(systemName: string): string | undefined {
  const key = systemName.toLowerCase();
  const direct = BODY_SYSTEMS.find(bs => bs.id === key);
  if (direct) return direct.color;
  const aliasId = SYSTEM_ALIASES[key];
  if (aliasId) {
    const aliased = BODY_SYSTEMS.find(bs => bs.id === aliasId);
    if (aliased) return aliased.color;
  }
  return SYSTEM_FALLBACK_COLORS[key];
}

export function getSystemIcon(systemId: string): LucideIcon | undefined {
  const key = systemId.toLowerCase();
  const direct = BODY_SYSTEMS.find(bs => bs.id === key);
  if (direct) return direct.icon;
  const aliasId = SYSTEM_ALIASES[key];
  if (aliasId) {
    const aliased = BODY_SYSTEMS.find(bs => bs.id === aliasId);
    if (aliased) return aliased.icon;
  }
  return undefined;
}
