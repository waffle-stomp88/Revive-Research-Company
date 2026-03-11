import { Zap, Timer, Flame, Heart, type LucideIcon } from "lucide-react";

export interface Bundle {
  id: string;
  name: string;
  tagline: string;
  icon: LucideIcon;
  description: string;
  products: string[];
  originalPrice: number;
  bundlePrice: number;
  savings: number;
  color: "cyan" | "yellow";
  benefits?: string[];
}

export const BUNDLES: Bundle[] = [
  {
    id: "wolverine-stack",
    name: "The Wolverine Stack",
    tagline: "Premium Research Duo",
    icon: Zap,
    description: "BPC-157 + TB-500 combination for tissue repair mechanism research. The most popular peptide research stack worldwide.",
    products: ["BPC-157", "TB-500"],
    originalPrice: 100.98,
    bundlePrice: 85.99,
    savings: 15,
    color: "cyan",
    benefits: [
      "Tissue repair mechanism research",
      "Cellular signaling pathway studies",
      "Synergistic peptide combination",
      "Most popular stack worldwide",
    ],
  },
  {
    id: "longevity-stack",
    name: "Cellular Research Stack",
    tagline: "Advanced Cellular Studies",
    icon: Timer,
    description: "Epithalon + GHK-Cu + NAD+ for comprehensive cellular mechanism and telomere research applications.",
    products: ["Epithalon", "GHK-Cu", "NAD+ Precursor"],
    originalPrice: 145.97,
    bundlePrice: 123.99,
    savings: 15,
    color: "yellow",
    benefits: [
      "Telomerase activation research",
      "Cellular mechanism studies",
      "NAD+ pathway research",
      "Comprehensive cellular protocol",
    ],
  },
  {
    id: "performance-stack",
    name: "GH Secretagogue Stack",
    tagline: "GHRH/GHRP Research",
    icon: Flame,
    description: "CJC-1295 + Ipamorelin for growth hormone secretagogue mechanism research. Ideal for endocrine pathway studies.",
    products: ["CJC-1295", "Ipamorelin"],
    originalPrice: 92.98,
    bundlePrice: 78.99,
    savings: 15,
    color: "cyan",
    benefits: [
      "GH secretagogue research",
      "Endocrine pathway studies",
      "Synergistic GHRH/GHRP combo",
      "Extended release formula",
    ],
  },
  {
    id: "healing-protocol",
    name: "Complete Tissue Research Protocol",
    tagline: "Multi-Pathway Studies",
    icon: Heart,
    description: "BPC-157 + TB-500 + GHK-Cu for comprehensive tissue mechanism and collagen synthesis research.",
    products: ["BPC-157", "TB-500", "GHK-Cu"],
    originalPrice: 155.97,
    bundlePrice: 132.99,
    savings: 15,
    color: "yellow",
    benefits: [
      "Multi-pathway tissue research",
      "Collagen synthesis studies",
      "Comprehensive mechanism approach",
      "Maximum savings bundle",
    ],
  },
];

export function getBundleById(id: string): Bundle | undefined {
  return BUNDLES.find(b => b.id === id);
}
