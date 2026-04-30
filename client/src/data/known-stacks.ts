import { LucideIcon, Zap, Sparkles, Rocket, Brain, Crown } from "lucide-react";
import { getSystemColor } from "@/data/body-systems";

export interface KnownStack {
  name: string;
  peptides: string[];
  icon: LucideIcon;
  color: string;
  description: string;
  synergyBonus: number;
  detailPageId?: string;
}

export const KNOWN_STACKS: KnownStack[] = [
  {
    name: "Wolverine Stack",
    peptides: ["bpc-157", "tb-500"],
    icon: Zap,
    color: getSystemColor("healing")!,
    description: "Legendary healing combo - BPC-157's local repair + TB-500's systemic regeneration",
    synergyBonus: 95,
    detailPageId: "recovery-tissue-stack",
  },
  {
    name: "Glow Protocol",
    peptides: ["bpc-157", "tb-500", "ghk-cu"],
    icon: Sparkles,
    color: getSystemColor("skin")!,
    description: "Ultimate skin rejuvenation - collagen + blood vessels + tissue repair",
    synergyBonus: 90,
    detailPageId: "glow-protocol",
  },
  {
    name: "GH Amplifier",
    peptides: ["ipamorelin", "cjc-1295"],
    icon: Rocket,
    color: getSystemColor("growth")!,
    description: "Growth hormone synergy - GHRP + GHRH work better together",
    synergyBonus: 88,
    detailPageId: "gh-amplifier",
  },
  {
    name: "Cognitive Edge",
    peptides: ["semax", "selank"],
    icon: Brain,
    color: getSystemColor("cognitive")!,
    description: "Nootropic synergy - focus enhancement + anxiety reduction",
    synergyBonus: 86,
    detailPageId: "cognitive-edge-stack",
  },
  {
    name: "Longevity Protocol",
    peptides: ["epithalon", "ghk-cu"],
    icon: Crown,
    color: getSystemColor("longevity")!,
    description: "Telomere extension meets collagen regeneration",
    synergyBonus: 84,
    detailPageId: "longevity-protocol",
  },
  {
    name: "Fat Burner",
    peptides: ["aod-9604", "5-amino-1mq"],
    icon: Zap,
    color: getSystemColor("metabolic")!,
    description: "GH fragment fat breakdown + NNMT enzyme inhibitor — complementary fat metabolism pathways",
    synergyBonus: 84,
    detailPageId: "fat-burner",
  },
];
