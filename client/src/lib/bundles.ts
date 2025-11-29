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
    tagline: "Legendary Recovery",
    icon: Zap,
    description: "BPC-157 + TB-500 combination for accelerated tissue repair and healing research. The most popular peptide stack worldwide.",
    products: ["BPC-157", "TB-500"],
    originalPrice: 104.98,
    bundlePrice: 89.99,
    savings: 15,
    color: "cyan",
    benefits: [
      "Accelerated tissue repair research",
      "Enhanced healing factor studies",
      "Synergistic peptide combination",
      "Most popular stack worldwide",
    ],
  },
  {
    id: "longevity-stack",
    name: "Longevity Stack",
    tagline: "Age Optimization",
    icon: Timer,
    description: "Epithalon + GHK-Cu + NAD+ for comprehensive cellular rejuvenation and longevity research applications.",
    products: ["Epithalon", "GHK-Cu", "NAD+ Precursor"],
    originalPrice: 219.97,
    bundlePrice: 189.99,
    savings: 14,
    color: "yellow",
    benefits: [
      "Telomerase activation research",
      "Cellular rejuvenation studies",
      "NAD+ pathway optimization",
      "Comprehensive longevity protocol",
    ],
  },
  {
    id: "performance-stack",
    name: "Performance Stack",
    tagline: "Peak Output",
    icon: Flame,
    description: "CJC-1295 + Ipamorelin for natural growth hormone optimization research. Ideal for athletic performance studies.",
    products: ["CJC-1295", "Ipamorelin"],
    originalPrice: 234.98,
    bundlePrice: 199.99,
    savings: 15,
    color: "cyan",
    benefits: [
      "Natural GH optimization",
      "Athletic performance research",
      "Synergistic GHRH/GHRP combo",
      "Extended release formula",
    ],
  },
  {
    id: "healing-protocol",
    name: "Complete Healing Protocol",
    tagline: "Full Spectrum Repair",
    icon: Heart,
    description: "BPC-157 + TB-500 + GHK-Cu for comprehensive tissue regeneration and wound healing research.",
    products: ["BPC-157", "TB-500", "GHK-Cu"],
    originalPrice: 144.97,
    bundlePrice: 119.99,
    savings: 17,
    color: "yellow",
    benefits: [
      "Full spectrum tissue repair",
      "Collagen synthesis enhancement",
      "Multi-pathway healing approach",
      "Maximum savings bundle",
    ],
  },
];

export function getBundleById(id: string): Bundle | undefined {
  return BUNDLES.find(b => b.id === id);
}
