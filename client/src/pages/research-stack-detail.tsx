import { useState } from "react";
import { useRoute, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, FlaskConical, ShoppingCart, Sparkles, CheckCircle2, AlertTriangle, Info, Package, GraduationCap, Beaker } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import productImage from "@assets/reta bottle_1764310671562.jpg";

interface SynergyCopy {
  beginner: string;
  expert: string;
}

interface ResearchStack {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  longDescription: string;
  peptides: { name: string; description: string }[];
  researchApplications: string[];
  icon: string;
  color: string;
  badge?: string;
  badgeColor?: string;
  retailValue: number;
  stackPrice: number;
  launchPrice: number;
  synergy: SynergyCopy;
}

const researchStacksData: Record<string, ResearchStack> = {
  "recovery-tissue-stack": {
    id: "recovery-tissue-stack",
    name: "Recovery + Tissue Mechanisms Stack",
    subtitle: "Dual Pathway Tissue Stack",
    description: "This stack combines two of the most extensively researched compounds for tissue mechanism pathways.",
    longDescription: "This synergistic combination brings together BPC-157 and TB-500, two of the most extensively researched peptides in tissue mechanism studies. Researchers have documented extensive literature on the complementary signaling pathways these compounds target. The combination is ideal for studies investigating cellular repair mechanisms, tissue regeneration models, and synergistic peptide interactions.",
    peptides: [
      { name: "BPC-157", description: "Extensively studied for tissue mechanism pathways and cellular signaling research" },
      { name: "TB-500", description: "Research focus on thymosin beta-4 derived sequences and tissue modeling" },
    ],
    researchApplications: [
      "Tissue mechanism pathway studies",
      "Synergistic peptide interaction research",
      "Cellular signaling model development",
      "Regenerative mechanism investigations",
    ],
    icon: "Heart",
    color: "#22c55e",
    badge: "Most Popular",
    badgeColor: "#E7FB10",
    retailValue: 189,
    stackPrice: 149,
    launchPrice: 129,
    synergy: {
      beginner: "BPC-157 helps cells repair faster while TB-500 helps the body build new blood vessels to deliver nutrients. Together, they create a 'repair + rebuild' combination that researchers find works better than either compound alone.",
      expert: "BPC-157 upregulates growth hormone receptors and VEGF expression while TB-500 (Thymosin Beta-4) promotes actin polymerization and angiogenesis. The dual-pathway activation creates synergistic tissue regeneration signaling through complementary GH/IGF-1 axis and cytoskeletal remodeling mechanisms."
    }
  },
  "metabolic-pathway-stack": {
    id: "metabolic-pathway-stack",
    name: "Metabolic Pathway Research Stack",
    subtitle: "Triple-Pathway Research Bundle",
    description: "Explore incretin signaling and mitochondrial function pathways with this comprehensive metabolic research combination.",
    longDescription: "This advanced research stack combines MOTS-C and Retatrutide for comprehensive metabolic pathway studies. MOTS-C, a mitochondrial-derived peptide, has been extensively studied for its role in cellular energy regulation. Retatrutide represents a novel triple-agonist approach targeting GIP, GLP-1, and glucagon receptor pathways. Together, they provide researchers with tools for investigating multiple metabolic signaling mechanisms.",
    peptides: [
      { name: "MOTS-C", description: "Mitochondrial-derived peptide studied for cellular energy metabolism pathways" },
      { name: "Retatrutide", description: "Triple-agonist compound for incretin and glucagon receptor pathway research" },
    ],
    researchApplications: [
      "Incretin signaling pathway investigations",
      "Mitochondrial function studies",
      "Metabolic regulation mechanism research",
      "Multi-receptor interaction models",
    ],
    icon: "Zap",
    color: "#E7FB10",
    badge: "Hot Research",
    badgeColor: "#ef4444",
    retailValue: 449,
    stackPrice: 379,
    launchPrice: 329,
    synergy: {
      beginner: "MOTS-C helps cells produce energy more efficiently at the mitochondrial level, while Retatrutide signals the body to use stored fat for fuel. Together, they target metabolism from two different angles—one at the cellular power plant, one at the hormonal control center.",
      expert: "MOTS-C activates AMPK pathways and enhances mitochondrial biogenesis, while Retatrutide acts as a triple agonist (GLP-1/GIP/Glucagon receptors) modulating incretin signaling. This creates multi-target metabolic pathway activation: mitochondrial efficiency + peripheral insulin sensitivity + hepatic gluconeogenesis modulation."
    }
  },
  "cellular-optimization-stack": {
    id: "cellular-optimization-stack",
    name: "Cellular Optimization Stack",
    subtitle: "Signal Pathway Combo",
    description: "Research cellular signaling pathways and copper peptide mechanisms.",
    longDescription: "This stack combines GHK-Cu and MOTS-C for comprehensive cellular optimization research. GHK-Cu (glycyl-l-histidyl-l-lysine copper) is a naturally occurring tripeptide with copper that has been studied for its role in various cellular signaling pathways. Combined with MOTS-C's mitochondrial pathway activity, this stack enables multi-target cellular mechanism research.",
    peptides: [
      { name: "GHK-Cu (100mg)", description: "Copper peptide studied for cellular signaling and matrix protein pathway research" },
      { name: "MOTS-C", description: "Mitochondrial-derived peptide for energy pathway and cellular optimization studies" },
    ],
    researchApplications: [
      "Copper peptide mechanism research",
      "Mitochondrial pathway studies",
      "Cellular longevity model development",
      "Signal transduction investigations",
    ],
    icon: "Sparkles",
    color: "#a855f7",
    retailValue: 249,
    stackPrice: 199,
    launchPrice: 169,
    synergy: {
      beginner: "GHK-Cu is a copper peptide that helps cells 'clean house' and produce healthy proteins, while MOTS-C improves how cells generate energy. Think of it as upgrading both the maintenance crew and the power supply at the cellular level.",
      expert: "GHK-Cu modulates gene expression for tissue remodeling (collagen, decorin, metalloproteinases) while MOTS-C enhances mitochondrial function via AMPK activation. The combination creates parallel signaling for extracellular matrix optimization and intracellular energy metabolism—addressing both structural and functional cellular pathways."
    }
  },
  "starter-research-stack": {
    id: "starter-research-stack",
    name: "Premium Research Starter Stack",
    subtitle: "Beginner Research Essentials",
    description: "The ideal entry point for new research programs.",
    longDescription: "Designed as an accessible entry point for new research programs, this stack features two of the most well-characterized peptide compounds available. BPC-157 and MOTS-C both have extensive documentation in peer-reviewed literature, making them ideal for researchers establishing baseline protocols and familiarizing themselves with peptide research methodologies.",
    peptides: [
      { name: "BPC-157", description: "Well-documented peptide for tissue mechanism and cellular signaling studies" },
      { name: "MOTS-C", description: "Extensively researched mitochondrial peptide with established protocols" },
    ],
    researchApplications: [
      "Protocol development and standardization",
      "Baseline mechanism studies",
      "Introduction to peptide research methodologies",
      "Multi-pathway preliminary investigations",
    ],
    icon: "Star",
    color: "#21d8ff",
    badge: "Best for Beginners",
    badgeColor: "#21d8ff",
    retailValue: 199,
    stackPrice: 159,
    launchPrice: 139,
    synergy: {
      beginner: "BPC-157 is one of the most studied repair peptides, helping tissues heal and regenerate. MOTS-C supports energy production at the cellular level. Together, they give researchers a solid foundation covering two fundamental areas: tissue repair and cellular energy.",
      expert: "BPC-157's cytoprotective and pro-angiogenic properties complement MOTS-C's mitochondrial biogenesis activation. This pairing covers two primary research domains—tissue regeneration signaling (BPC-157 via NO/GH pathways) and metabolic optimization (MOTS-C via AMPK/PGC-1α)—making it ideal for establishing baseline assays before advancing to more complex protocols."
    }
  },
  "collagen-skin-stack": {
    id: "collagen-skin-stack",
    name: "Collagen & Skin Pathway Stack",
    subtitle: "Dermal Research Bundle",
    description: "Study collagen synthesis pathways and dermal tissue mechanisms.",
    longDescription: "This stack combines GHK-Cu and BPC-157 for comprehensive dermal and collagen pathway research. GHK-Cu has been extensively studied for its role in extracellular matrix protein interactions and collagen-related signaling. BPC-157 complements this with its documented tissue mechanism activity. Together, they provide a robust toolkit for dermal research applications.",
    peptides: [
      { name: "GHK-Cu", description: "Copper peptide for collagen pathway and matrix protein research" },
      { name: "BPC-157", description: "Tissue mechanism peptide complementing dermal pathway studies" },
    ],
    researchApplications: [
      "Collagen synthesis pathway studies",
      "Dermal tissue mechanism research",
      "Extracellular matrix protein interactions",
      "Wound healing model development",
    ],
    icon: "Leaf",
    color: "#ec4899",
    retailValue: 179,
    stackPrice: 149,
    launchPrice: 119,
    synergy: {
      beginner: "GHK-Cu directly stimulates collagen production and skin cell turnover, while BPC-157 supports the blood vessel growth needed to deliver nutrients to healing tissue. Together, they work on both the 'building blocks' and the 'supply chain' for skin and tissue research.",
      expert: "GHK-Cu upregulates collagen I, III, and elastin synthesis while modulating TGF-β signaling for controlled tissue remodeling. BPC-157 enhances angiogenesis via VEGF upregulation and provides cytoprotection. The combination creates synergistic dermal pathway activation: structural protein synthesis (GHK-Cu) + vascularization and tissue protection (BPC-157)."
    }
  },
  "elite-triple-stack": {
    id: "elite-triple-stack",
    name: "Elite Pathway Triple Stack",
    subtitle: "Advanced Multi-Mechanism Bundle",
    description: "Our most comprehensive research stack covering three major mechanism categories.",
    longDescription: "Our most comprehensive research offering combines Retatrutide, MOTS-C, and BPC-157 for advanced multi-target investigations. This triple stack covers incretin signaling pathways, mitochondrial function mechanisms, and tissue repair models—three of the most actively researched areas in peptide science. Ideal for established research programs requiring multi-target pathway analysis.",
    peptides: [
      { name: "Retatrutide", description: "Triple-agonist for GIP, GLP-1, and glucagon receptor pathway research" },
      { name: "MOTS-C", description: "Mitochondrial peptide for cellular energy and metabolism studies" },
      { name: "BPC-157", description: "Extensively documented peptide for tissue mechanism research" },
    ],
    researchApplications: [
      "Multi-pathway synergy investigations",
      "Advanced metabolic mechanism studies",
      "Comprehensive tissue pathway research",
      "Complex peptide interaction modeling",
    ],
    icon: "Crown",
    color: "#f59e0b",
    badge: "Premium",
    badgeColor: "#f59e0b",
    retailValue: 549,
    stackPrice: 449,
    launchPrice: 399,
    synergy: {
      beginner: "This triple stack covers three major research areas: Retatrutide for metabolic hormone signaling, MOTS-C for cellular energy production, and BPC-157 for tissue repair. It's designed for advanced researchers who want to study how these different systems interact and influence each other.",
      expert: "This triple-compound stack enables multi-pathway investigation: Retatrutide (GLP-1/GIP/GCGR triple agonist) for incretin and hepatic signaling, MOTS-C for mitochondrial biogenesis and AMPK activation, and BPC-157 for tissue regeneration via NO/GH pathways. The combination allows researchers to study cross-talk between metabolic, energetic, and regenerative signaling cascades in a single protocol."
    }
  },
};

export default function ResearchStackDetail() {
  const [match, params] = useRoute("/research-stacks/:id");
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [synergyMode, setSynergyMode] = useState<"beginner" | "expert">("beginner");

  if (!match || !params?.id) {
    return null;
  }

  const stack = researchStacksData[params.id];

  if (!stack) {
    return (
      <main className="min-h-screen pt-32 md:pt-40 pb-12">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Stack Not Found</h1>
          <p className="text-muted-foreground mb-6">The research stack you're looking for doesn't exist.</p>
          <Link href="/research-stacks">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Research Stacks
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      productId: stack.id,
      bundleId: stack.id,
      name: stack.name,
      price: stack.launchPrice,
      quantity: 1,
      dosage: "Research Stack",
      image: productImage,
      isBundle: true,
    });
    toast({
      title: "Added to Cart",
      description: `${stack.name} has been added to your cart.`,
    });
  };

  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-4">
          <Link href="/research-stacks">
            <Button variant="ghost" className="gap-2 -ml-4" data-testid="button-back-stacks">
              <ArrowLeft className="h-4 w-4" />
              Back to Research Stacks
            </Button>
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col">
            <Card className="overflow-hidden border-[#2a2a32] sticky top-24">
              <div
                className="relative aspect-square bg-gradient-to-br from-[#1a1a1f] to-[#0d0d10] flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${stack.color}15, transparent 70%), linear-gradient(135deg, #1a1a1f, #0d0d10)`,
                }}
              >
                {stack.badge && (
                  <Badge
                    className="absolute top-4 right-4"
                    style={{
                      backgroundColor: stack.badgeColor,
                      color: stack.badgeColor === "#E7FB10" || stack.badgeColor === "#f59e0b" ? "black" : "white",
                    }}
                    data-testid="badge-stack-type"
                  >
                    {stack.badge}
                  </Badge>
                )}
                <div className="text-center">
                  <div className="w-32 h-32 rounded-3xl mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: `${stack.color}20` }}>
                    <Package className="h-16 w-16" style={{ color: stack.color }} />
                  </div>
                  <div className="flex justify-center gap-2 mt-4">
                    {stack.peptides.map((peptide, i) => (
                      <div key={i} className="w-4 h-4 rounded-full border-2 border-[#1a1a1f]" style={{ backgroundColor: stack.color }} />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {stack.peptides.length} peptide{stack.peptides.length > 1 ? "s" : ""} included
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-red-950/30 border-2 border-red-500/50 animate-pulse-subtle mt-6" data-testid="card-ruo-disclaimer">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-red-500/20 border border-red-500/30">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-red-400 uppercase tracking-wider text-lg mb-2">Research Use Only</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This product is sold for research purposes only and is not intended for human consumption. By purchasing, you confirm you are a qualified researcher and will use this product in accordance with all applicable federal and state laws and regulations.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="secondary" className="text-xs uppercase tracking-wider">
                Research Stack
              </Badge>
            </div>

            <h1 className="font-display text-2xl md:text-3xl font-bold mb-2" data-testid="text-stack-name">
              {stack.name}
            </h1>

            <p className="text-sm text-muted-foreground leading-relaxed mb-6" data-testid="text-stack-description">
              {stack.longDescription}
            </p>

            <Card className="p-5 bg-[#0d0d10] border-[#2a2a32] mb-6">
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Retail Value: <span className="line-through" data-testid="text-stack-retail-value">${stack.retailValue}</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-4xl font-bold" style={{ color: stack.color }} data-testid="text-stack-price">
                    ${stack.launchPrice}
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#21d8ff]/10 text-[#21d8ff]" data-testid="badge-launch-price">
                    Launch Price
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Stack Price: <span className="text-gray-400">${stack.stackPrice}</span>
                </div>
                <Badge variant="outline" className="border-[#21d8ff]/50 text-[#21d8ff]" data-testid="badge-savings">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Curated Research Combination
                </Badge>
              </div>
            </Card>

            <div className="flex gap-3 mb-6">
              <Button
                size="lg"
                onClick={handleAddToCart}
                style={{
                  backgroundColor: stack.color,
                  color: stack.color === "#E7FB10" || stack.color === "#f59e0b" || stack.color === "#22c55e" ? "black" : "white",
                }}
                className="flex-1"
                data-testid="button-add-to-cart"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>

            <Card className="p-5 border-[#2a2a32] bg-gradient-to-br from-[#1a1a1f] to-[#0d0d10] mb-6" data-testid="card-whats-included">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${stack.color}20` }}>
                  <Package className="h-5 w-5" style={{ color: stack.color }} />
                </div>
                <h3 className="font-display text-base font-bold uppercase tracking-wider">What's Included</h3>
              </div>
              <ul className="space-y-2">
                {stack.peptides.map((peptide) => (
                  <li key={peptide.name} className="text-sm text-gray-300 flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3" style={{ color: stack.color }} />
                    {peptide.name}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5 border-[#2a2a32] bg-gradient-to-br from-[#1a1a1f] to-[#0d0d10]" data-testid="card-synergy">
              <div className="flex items-center justify-between mb-4 gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${stack.color}20` }}>
                    <Sparkles className="h-5 w-5" style={{ color: stack.color }} />
                  </div>
                  <h3 className="font-display text-base font-bold uppercase tracking-wider">Why These Peptides Work Together</h3>
                </div>
                <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0d0d10] border border-[#2a2a32] flex-shrink-0">
                  <button
                    onClick={() => setSynergyMode("beginner")}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                      synergyMode === "beginner" ? "bg-[#21d8ff]/20 text-[#21d8ff]" : "text-muted-foreground hover:text-white"
                    }`}
                    data-testid="button-synergy-beginner"
                  >
                    <GraduationCap className="h-3 w-3" />
                    Quick
                  </button>
                  <button
                    onClick={() => setSynergyMode("expert")}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                      synergyMode === "expert" ? "bg-[#a855f7]/20 text-[#a855f7]" : "text-muted-foreground hover:text-white"
                    }`}
                    data-testid="button-synergy-expert"
                  >
                    <Beaker className="h-3 w-3" />
                    Deep
                  </button>
                </div>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={synergyMode}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="p-3 rounded-lg bg-[#0d0d10] border border-[#2a2a32]"
                >
                  <p className={`text-xs leading-relaxed ${synergyMode === "beginner" ? "text-gray-300" : "text-gray-400"}`} data-testid={`text-synergy-${synergyMode}`}>
                    {synergyMode === "beginner" ? stack.synergy.beginner : stack.synergy.expert}
                  </p>
                  {synergyMode === "expert" && (
                    <div className="mt-2 pt-2 border-t border-[#2a2a32] flex items-center gap-2 text-xs text-muted-foreground">
                      <Info className="h-3 w-3 flex-shrink-0" />
                      <span>Pathway-level mechanistic overview</span>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </Card>
          </motion.div>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-6 h-full border-[#2a2a32]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${stack.color}20` }}>
                  <FlaskConical className="h-5 w-5" style={{ color: stack.color }} />
                </div>
                <h3 className="font-display text-xl font-bold">Included Peptides</h3>
              </div>
              <div className="space-y-4">
                {stack.peptides.map((peptide) => (
                  <div key={peptide.name} className="p-4 rounded-lg bg-[#0d0d10] border border-[#2a2a32]">
                    <h4 className="font-medium text-white mb-1">{peptide.name}</h4>
                    <p className="text-sm text-muted-foreground">{peptide.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="p-6 h-full border-[#2a2a32]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${stack.color}20` }}>
                  <Sparkles className="h-5 w-5" style={{ color: stack.color }} />
                </div>
                <h3 className="font-display text-xl font-bold">Research Applications</h3>
              </div>
              <ul className="space-y-3">
                {stack.researchApplications.map((application, index) => (
                  <li key={index} className="flex items-start gap-3 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{application}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
