import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, FlaskConical, ShoppingCart, Shield, Layers, Sparkles, CheckCircle2, AlertTriangle, Info, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import productImage from "@assets/reta bottle_1764310671562.jpg";

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
  price: number;
  originalPrice: number;
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
    price: 89.99,
    originalPrice: 109.98,
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
    price: 299.99,
    originalPrice: 379.98,
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
    price: 149.99,
    originalPrice: 189.98,
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
    price: 119.99,
    originalPrice: 149.98,
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
    price: 99.99,
    originalPrice: 129.98,
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
    price: 349.99,
    originalPrice: 449.97,
  },
};

export default function ResearchStackDetail() {
  const [match, params] = useRoute("/research-stacks/:id");
  const { addToCart } = useCart();
  const { toast } = useToast();

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

  const savings = Math.round(((stack.originalPrice - stack.price) / stack.originalPrice) * 100);

  const handleAddToCart = () => {
    addToCart({
      productId: stack.id,
      bundleId: stack.id,
      name: stack.name,
      price: stack.price,
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
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <Link href="/research-stacks">
          <Button variant="ghost" className="mb-6 text-muted-foreground hover:text-white" data-testid="button-back-stacks">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Research Stacks
          </Button>
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="overflow-hidden border-[#2a2a32]">
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
                  <div
                    className="w-32 h-32 rounded-3xl mx-auto flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${stack.color}20` }}
                  >
                    <Layers className="h-16 w-16" style={{ color: stack.color }} />
                  </div>
                  <div className="flex justify-center gap-2 mt-4">
                    {stack.peptides.map((peptide, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-full border-2 border-[#1a1a1f]"
                        style={{ backgroundColor: stack.color }}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {stack.peptides.length} peptide{stack.peptides.length > 1 ? 's' : ''} included
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: stack.color }} data-testid="text-stack-subtitle">
                {stack.subtitle}
              </p>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-3" data-testid="text-stack-name">
                {stack.name}
              </h1>
              <p className="text-muted-foreground" data-testid="text-stack-description">
                {stack.longDescription}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {stack.peptides.map((peptide) => (
                <Badge
                  key={peptide.name}
                  variant="outline"
                  className="border-[#3a3a42] text-gray-300 px-3 py-1.5"
                  data-testid={`badge-peptide-${peptide.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                >
                  <FlaskConical className="h-3.5 w-3.5 mr-1.5" style={{ color: stack.color }} />
                  {peptide.name}
                </Badge>
              ))}
            </div>

            <Card className="p-4 bg-[#0d0d10] border-[#2a2a32]">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Stack Price</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold" style={{ color: stack.color }} data-testid="text-stack-price">
                      ${stack.price.toFixed(2)}
                    </span>
                    <span className="text-lg text-muted-foreground line-through" data-testid="text-stack-original-price">
                      ${stack.originalPrice.toFixed(2)}
                    </span>
                  </div>
                  <Badge variant="outline" className="mt-2 border-green-500/50 text-green-500" data-testid="badge-savings">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Save {savings}% vs individual purchase
                  </Badge>
                </div>
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  style={{
                    backgroundColor: stack.color,
                    color: stack.color === "#E7FB10" || stack.color === "#f59e0b" || stack.color === "#22c55e" ? "black" : "white",
                  }}
                  data-testid="button-add-to-cart"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </Card>

            <div className="p-4 rounded-xl bg-[#21d8ff]/10 border border-[#21d8ff]/20">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-[#21d8ff] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[#21d8ff]">What's Included</p>
                  <ul className="mt-2 space-y-1">
                    {stack.peptides.map((peptide) => (
                      <li key={peptide.name} className="text-sm text-gray-300 flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-[#21d8ff]" />
                        {peptide.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 h-full border-[#2a2a32]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${stack.color}20` }}>
                  <FlaskConical className="h-5 w-5" style={{ color: stack.color }} />
                </div>
                <h3 className="font-display text-xl font-bold">Included Peptides</h3>
              </div>
              <div className="space-y-4">
                {stack.peptides.map((peptide, index) => (
                  <div key={peptide.name} className="p-4 rounded-lg bg-[#0d0d10] border border-[#2a2a32]">
                    <h4 className="font-medium text-white mb-1">{peptide.name}</h4>
                    <p className="text-sm text-muted-foreground">{peptide.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-4 rounded-xl bg-red-500/5 border border-red-500/20"
        >
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-red-400">Research Use Only</p>
              <p className="text-xs text-gray-400">
                This research stack is sold for laboratory and scientific research purposes only. 
                It is not intended for human consumption, therapeutic use, or any application 
                in humans or animals. By purchasing, you confirm you are a qualified researcher 
                and will use these compounds solely for legitimate research purposes.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
