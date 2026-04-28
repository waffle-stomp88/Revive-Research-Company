import { Heart, Zap, Target, Brain, Sparkles, Crown, Moon, Shield, Activity, Beaker } from "lucide-react";
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

export const COMPOUND_LABELS: Record<string, { icon: LucideIcon; color: string }> = {
  sleep:    { icon: Moon,     color: "#8b5cf6" },
  immune:   { icon: Shield,   color: "#22c55e" },
  gut:      { icon: Shield,   color: "#3b82f6" },
  hormonal: { icon: Activity, color: "#f59e0b" },
  mobility: { icon: Zap,      color: "#f59e0b" },
  mood:     { icon: Heart,    color: "#3b82f6" },
  energy:   { icon: Activity, color: "#f59e0b" },
  research: { icon: Beaker,   color: "#6b7280" },
};

const SYSTEM_ALIASES: Record<string, string> = {
  joints: "healing",
  muscle: "growth",
  "weight": "metabolic", "fat loss": "metabolic",
  focus: "cognitive", neuroprotection: "cognitive",
  cosmetic: "skin", hair: "skin",
  "anti-aging": "longevity",
};

const SYSTEM_FALLBACK_COLORS: Record<string, string> = {
  recovery: "#60a5fa",
  heart: "#ef4444", vascular: "#ef4444",
};

export function getSystemColor(systemName: string): string | undefined {
  const key = systemName.toLowerCase();
  const direct = BODY_SYSTEMS.find(bs => bs.id === key);
  if (direct) return direct.color;
  const compound = COMPOUND_LABELS[key];
  if (compound) return compound.color;
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
  const compound = COMPOUND_LABELS[key];
  if (compound) return compound.icon;
  const aliasId = SYSTEM_ALIASES[key];
  if (aliasId) {
    const aliased = BODY_SYSTEMS.find(bs => bs.id === aliasId);
    if (aliased) return aliased.icon;
  }
  return undefined;
}
