import { useState } from "react";
import { useRoute, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, FlaskConical, ShoppingCart, Sparkles, CheckCircle2, AlertTriangle, Info, Package, GraduationCap, Beaker, Shield, FileCheck, Truck, RefreshCw, ShoppingBag, Repeat, CheckCircle, Minus, Plus, BookOpen, ChevronRight, Clock, ExternalLink, Star, User
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Review } from "@shared/schema";
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
  keyBenefits: string[];
  researchApplications: string[];
  storageGuide: string;
  educationLinks: { peptideName: string; articleUrl: string; articleTitle: string }[];
  icon: string;
  color: string;
  badge?: string;
  badgeColor?: string;
  retailValue: number;
  stackPrice: number;
  launchPrice: number;
  synergy: SynergyCopy;
}

type PurchaseType = "one-time" | "subscription";
type SubscriptionInterval = "weekly" | "biweekly" | "monthly";

const subscriptionOptions: { value: SubscriptionInterval; label: string; discount: number }[] = [
  { value: "weekly", label: "Weekly", discount: 15 },
  { value: "biweekly", label: "Every 2 Weeks", discount: 12 },
  { value: "monthly", label: "Monthly", discount: 10 },
];

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
    keyBenefits: [
      "Dual pathway tissue regeneration support",
      "Synergistic peptide interaction research",
      "Comprehensive cellular repair mechanisms",
      "Blood vessel growth and tissue perfusion support",
    ],
    researchApplications: [
      "Tissue mechanism pathway studies",
      "Synergistic peptide interaction research",
      "Cellular signaling model development",
      "Regenerative mechanism investigations",
    ],
    storageGuide: "Store between 2-8°C (36-46°F) in original packaging. Protect from light and excessive heat.",
    educationLinks: [
      { peptideName: "BPC-157", articleUrl: "/education/bpc-157-guide", articleTitle: "BPC-157: Comprehensive Research Guide" },
      { peptideName: "TB-500", articleUrl: "/education/tb-500-mechanisms", articleTitle: "TB-500: Mechanism of Action Overview" },
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
    keyBenefits: [
      "Multi-target metabolic pathway investigation",
      "Mitochondrial energy optimization research",
      "Triple-agonist receptor signaling",
      "Comprehensive metabolic model development",
    ],
    researchApplications: [
      "Incretin signaling pathway investigations",
      "Mitochondrial function studies",
      "Metabolic regulation mechanism research",
      "Multi-receptor interaction models",
    ],
    storageGuide: "Maintain 2-8°C (36-46°F) for optimal stability. Store away from direct sunlight.",
    educationLinks: [
      { peptideName: "MOTS-C", articleUrl: "/education/mots-c-guide", articleTitle: "MOTS-C: Mitochondrial Pathway Research" },
      { peptideName: "Retatrutide", articleUrl: "/education/retatrutide-mechanisms", articleTitle: "Retatrutide: Triple Agonist Overview" },
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
    keyBenefits: [
      "Copper peptide signaling research support",
      "Cellular energy optimization",
      "Gene expression modulation research",
      "Comprehensive cellular health model development",
    ],
    researchApplications: [
      "Copper peptide mechanism research",
      "Mitochondrial pathway studies",
      "Cellular longevity model development",
      "Signal transduction investigations",
    ],
    storageGuide: "Keep refrigerated at 2-8°C (36-46°F). Copper peptides are sensitive to temperature fluctuations.",
    educationLinks: [
      { peptideName: "GHK-Cu", articleUrl: "/education/ghk-cu-guide", articleTitle: "GHK-Cu: Copper Peptide Research Guide" },
      { peptideName: "MOTS-C", articleUrl: "/education/mots-c-mechanisms", articleTitle: "MOTS-C: Cellular Energy Pathways" },
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
    keyBenefits: [
      "Well-characterized research compounds",
      "Established research protocols",
      "Multi-domain pathway exploration",
      "Ideal for new research programs",
    ],
    researchApplications: [
      "Protocol development and standardization",
      "Baseline mechanism studies",
      "Introduction to peptide research methodologies",
      "Multi-pathway preliminary investigations",
    ],
    storageGuide: "Refrigerate at 2-8°C (36-46°F). These are research-grade compounds requiring proper storage.",
    educationLinks: [
      { peptideName: "BPC-157", articleUrl: "/education/bpc-157-starter", articleTitle: "BPC-157: Starter's Guide to Tissue Pathways" },
      { peptideName: "MOTS-C", articleUrl: "/education/mots-c-starter", articleTitle: "MOTS-C: Introduction to Mitochondrial Research" },
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
    keyBenefits: [
      "Collagen synthesis pathway support",
      "Dermal tissue mechanism research",
      "Extracellular matrix optimization",
      "Comprehensive dermal health modeling",
    ],
    researchApplications: [
      "Collagen synthesis pathway studies",
      "Dermal tissue mechanism research",
      "Extracellular matrix protein interactions",
      "Wound healing model development",
    ],
    storageGuide: "Store at 2-8°C (36-46°F). Keep both compounds protected from light and temperature variation.",
    educationLinks: [
      { peptideName: "GHK-Cu", articleUrl: "/education/ghk-cu-collagen", articleTitle: "GHK-Cu: Collagen and Matrix Research" },
      { peptideName: "BPC-157", articleUrl: "/education/bpc-157-dermal", articleTitle: "BPC-157: Tissue Mechanisms in Skin Research" },
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
    keyBenefits: [
      "Triple-pathway multi-target research",
      "Metabolic and mitochondrial optimization",
      "Comprehensive tissue regeneration support",
      "Advanced peptide interaction modeling",
    ],
    researchApplications: [
      "Multi-pathway synergy investigations",
      "Advanced metabolic mechanism studies",
      "Comprehensive tissue pathway research",
      "Complex peptide interaction modeling",
    ],
    storageGuide: "Maintain 2-8°C (36-46°F) storage conditions for all three compounds. Handle with appropriate research protocols.",
    educationLinks: [
      { peptideName: "Retatrutide", articleUrl: "/education/retatrutide-advanced", articleTitle: "Retatrutide: Advanced Multi-Target Research" },
      { peptideName: "MOTS-C", articleUrl: "/education/mots-c-advanced", articleTitle: "MOTS-C: Advanced Metabolic Pathways" },
      { peptideName: "BPC-157", articleUrl: "/education/bpc-157-advanced", articleTitle: "BPC-157: Advanced Tissue Mechanisms" },
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
  const { isAuthenticated } = useAuth();
  const [synergyMode, setSynergyMode] = useState<"beginner" | "expert">("beginner");
  const [quantity, setQuantity] = useState(1);
  const [purchaseType, setPurchaseType] = useState<PurchaseType>("one-time");
  const [subscriptionInterval, setSubscriptionInterval] = useState<SubscriptionInterval>("monthly");

  // Query for research stack reviews
  const { data: reviewsData } = useQuery<{ reviews: (Review & { reviewerName: string; isVerifiedPurchase: boolean })[]; average: number; count: number }>({
    queryKey: ["/api/research-stacks", params?.id, "reviews"],
    enabled: !!params?.id,
  });

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

  const getBasePrice = () => stack.launchPrice;

  const getSelectedDiscount = () => {
    if (purchaseType === "one-time") return 0;
    const option = subscriptionOptions.find(o => o.value === subscriptionInterval);
    return option?.discount || 0;
  };

  const getDiscountedPrice = () => {
    const basePrice = getBasePrice();
    const discount = getSelectedDiscount();
    return basePrice * (1 - discount / 100);
  };

  const getTotalPrice = () => {
    return getDiscountedPrice() * quantity;
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(10, prev + delta)));
  };

  const handleAddToCart = () => {
    addToCart({
      productId: stack.id,
      bundleId: stack.id,
      name: stack.name,
      price: getBasePrice(),
      quantity,
      dosage: "Research Stack",
      image: productImage,
      isBundle: true,
    });
    toast({
      title: "Added to Cart",
      description: `${stack.name} has been added to your cart.`,
    });
  };

  const handleBuyNow = () => {
    // Navigate to checkout with stack parameters
    window.location.href = `/checkout?stackId=${stack.id}&quantity=${quantity}${purchaseType === "subscription" ? `&subscription=true&interval=${subscriptionInterval}` : ""}`;
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

            <Card className="p-2.5 bg-red-950/30 border border-red-500/50 animate-pulse-subtle mt-3" data-testid="card-ruo-disclaimer">
              <div className="flex items-start gap-2">
                <div className="p-1 rounded bg-red-500/20 flex-shrink-0">
                  <AlertTriangle className="h-3 w-3 text-red-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-display font-bold text-red-400 uppercase tracking-wider text-xs mb-0.5">Research Use Only</h4>
                  <p className="text-xs text-muted-foreground leading-tight">
                    For research purposes only. Not for human consumption.
                  </p>
                </div>
              </div>
            </Card>

            {stack.educationLinks.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.12 }}
                className="mt-6"
                data-testid="section-education"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5" style={{ color: stack.color }} />
                    <h3 className="font-display text-lg font-bold">Learn About These Peptides</h3>
                  </div>
                  <Link href="/education">
                    <Button variant="outline" size="sm" className="border-[#ec4899]/30 hover:border-[#ec4899]" data-testid="link-view-all-education">
                      All Articles
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>

                <div className="space-y-2">
                  {stack.educationLinks.slice(0, 1).map((link) => (
                    <a key={link.peptideName} href={link.articleUrl} target="_blank" rel="noopener noreferrer">
                      <Card
                        className="p-4 border-[#ec4899]/20 hover:border-[#ec4899]/40 transition-all duration-300 cursor-pointer group hover:scale-[1.02]"
                        data-testid={`card-article-${link.peptideName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-[#ec4899]/10 flex-shrink-0">
                            <BookOpen className="h-5 w-5 text-[#ec4899]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="border-[#ec4899]/50 text-[#ec4899] text-xs">
                                Research Guide
                              </Badge>
                            </div>
                            <h4 className="font-display text-sm font-bold group-hover:text-[#ec4899] transition-colors">{link.articleTitle}</h4>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </div>
                      </Card>
                    </a>
                  ))}
                </div>
              </motion.section>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="secondary" className="text-xs uppercase tracking-wider">
                Research Stack
              </Badge>
              {stack.peptides.map((peptide) => (
                <Badge
                  key={peptide.name}
                  variant="outline"
                  className="text-xs"
                  style={{ borderColor: stack.color, color: stack.color }}
                  data-testid={`badge-peptide-${peptide.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                >
                  {peptide.name}
                </Badge>
              ))}
            </div>

            <h1 className="font-display text-2xl md:text-3xl font-bold mb-2" data-testid="text-stack-name">
              {stack.name}
            </h1>

            <div className="flex items-baseline gap-3 mb-3 flex-wrap">
              <span className="font-display text-3xl font-bold text-[#E7FB10]" data-testid="text-stack-price">
                ${getBasePrice().toFixed(2)}
              </span>
              <span className="text-lg text-muted-foreground line-through" data-testid="text-stack-retail-value">
                ${stack.retailValue}
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed mb-3" data-testid="text-stack-description">
              {stack.longDescription}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label className="text-xs font-medium mb-1 block text-muted-foreground">Quantity</Label>
                <div className="flex items-center border rounded-md h-9 border-border">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    data-testid="button-quantity-minus"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="flex-1 text-center font-medium text-sm" data-testid="text-quantity">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 10}
                    data-testid="button-quantity-plus"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <Label className="text-xs font-medium mb-1 block text-muted-foreground">Purchase Option</Label>
              <div className="grid grid-cols-2 gap-2">
                <div
                  className={`relative flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    purchaseType === "one-time" ? "border-[#E7FB10] bg-[#E7FB10]/5" : "border-border hover:border-border/80"
                  }`}
                  onClick={() => setPurchaseType("one-time")}
                  data-testid="option-one-time"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <ShoppingCart className="h-3.5 w-3.5" />
                      <span className="font-medium text-sm">One-time</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">${getBasePrice().toFixed(2)}</p>
                  </div>
                </div>

                <div
                  className={`relative flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    purchaseType === "subscription" ? "border-[#21d8ff] bg-[#21d8ff]/5" : "border-border hover:border-border/80"
                  }`}
                  onClick={() => setPurchaseType("subscription")}
                  data-testid="option-subscription"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <Repeat className="h-3.5 w-3.5" />
                      <span className="font-medium text-sm">Subscribe</span>
                      <Badge className="bg-[#21d8ff] text-[10px] px-1 py-0">15% off</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Auto-delivery</p>
                  </div>
                </div>
              </div>
            </div>

            {purchaseType === "subscription" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3"
              >
                <Label className="text-xs font-medium mb-1 block text-muted-foreground">Delivery Frequency</Label>
                <div className="grid grid-cols-3 gap-2">
                  {subscriptionOptions.map((option) => {
                    const discountedPrice = getBasePrice() * (1 - option.discount / 100);
                    return (
                      <div
                        key={option.value}
                        className={`relative flex flex-col items-center p-2 rounded-lg border cursor-pointer transition-all ${
                          subscriptionInterval === option.value ? "border-[#21d8ff] bg-[#21d8ff]/5" : "border-border hover:border-border/80"
                        }`}
                        onClick={() => setSubscriptionInterval(option.value)}
                        data-testid={`option-interval-${option.value}`}
                      >
                        <span className="font-medium text-xs">{option.label}</span>
                        <span className="text-[10px] text-[#21d8ff]">{option.discount}% off</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                In Stock
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Lab Tested
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="h-3 w-3" /> Fast Ship
                </span>
              </div>
            </div>

            <div className="flex gap-3 mb-3">
              <Button
                size="lg"
                variant="outline"
                className="flex-1 font-display gap-2 border-2"
                onClick={handleAddToCart}
                data-testid="button-add-to-cart"
              >
                <ShoppingBag className="h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                className={`flex-1 font-display gap-2 transition-shadow duration-300 text-black ${
                  purchaseType === "subscription"
                    ? "bg-[#21d8ff] border-[#21d8ff] hover:bg-[#21d8ff]/90 shadow-[0_0_20px_rgba(33,216,255,0.4)]"
                    : "bg-[#E7FB10] border-[#E7FB10] hover:bg-[#E7FB10]/90 shadow-[0_0_20px_rgba(231,251,16,0.4)]"
                }`}
                onClick={handleBuyNow}
                data-testid="button-buy-now"
              >
                {purchaseType === "subscription" ? (
                  <>
                    <Repeat className="h-5 w-5" />
                    Subscribe
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    Buy Now
                  </>
                )}
              </Button>
            </div>

            {purchaseType === "subscription" && (
              <p className="text-[10px] text-center text-muted-foreground mb-3">
                Save ${((getBasePrice() - getDiscountedPrice()) * quantity).toFixed(2)} per order • Cancel anytime
              </p>
            )}

            <Separator className="my-4" />

            <div className="grid grid-cols-4 gap-2 text-center mb-4">
              <div className="flex flex-col items-center gap-1">
                <Shield className="h-4 w-4 text-[#21d8ff]" />
                <span className="text-[10px] text-muted-foreground">3rd Party Tested</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <FileCheck className="h-4 w-4 text-[#21d8ff]" />
                <span className="text-[10px] text-muted-foreground">COA Included</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Truck className="h-4 w-4 text-[#21d8ff]" />
                <span className="text-[10px] text-muted-foreground">Fast Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RefreshCw className="h-4 w-4 text-[#21d8ff]" />
                <span className="text-[10px] text-muted-foreground">Guaranteed</span>
              </div>
            </div>

            {stack.keyBenefits.length > 0 && (
              <div className="mb-8">
                <h3 className="font-display font-semibold text-lg mb-4">Key Benefits</h3>
                <ul className="space-y-3">
                  {stack.keyBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-[#E7FB10] mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Why These Work Together */}
            <div className="mb-8">
              <h3 className="font-display font-semibold text-lg mb-4">Why These Work Together</h3>
              <Card className="p-4 border-[#2a2a32]">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[#0d0d10] border border-[#2a2a32]">
                    <button
                      onClick={() => setSynergyMode("beginner")}
                      className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-all ${
                        synergyMode === "beginner" ? "bg-[#21d8ff]/20 text-[#21d8ff]" : "text-muted-foreground hover:text-white"
                      }`}
                      data-testid="button-synergy-beginner"
                    >
                      <GraduationCap className="h-4 w-4 inline mr-1" />
                      Quick Breakdown
                    </button>
                    <button
                      onClick={() => setSynergyMode("expert")}
                      className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-all ${
                        synergyMode === "expert" ? "bg-[#a855f7]/20 text-[#a855f7]" : "text-muted-foreground hover:text-white"
                      }`}
                      data-testid="button-synergy-expert"
                    >
                      <Beaker className="h-4 w-4 inline mr-1" />
                      Deep Dive
                    </button>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div key={synergyMode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="p-4 rounded-lg bg-[#0d0d10] border border-[#2a2a32]">
                      <p className={`text-sm leading-relaxed ${synergyMode === "beginner" ? "text-gray-200" : "text-gray-300"}`} data-testid={`text-synergy-${synergyMode}`}>
                        {synergyMode === "beginner" ? stack.synergy.beginner : stack.synergy.expert}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </Card>
            </div>

            {/* Storage Information - Matching Product Page Style */}
            <div>
              <h3 className="font-display font-semibold text-lg mb-4">Storage Information</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {stack.storageGuide}
              </p>
              <Link href="/education/storage-101">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    className="gap-2 bg-gradient-to-r from-[#21d8ff] to-[#9d4edd] text-black font-semibold hover:shadow-[0_0_20px_rgba(33,216,255,0.6)] transition-shadow" 
                    data-testid="link-learn-storage"
                  >
                    <BookOpen className="h-4 w-4" />
                    Learn More: Storage Best Practices
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-12"
          data-testid="section-reviews"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-2xl font-bold">Customer Reviews</h2>
              {reviewsData && reviewsData.count > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(reviewsData.average)
                            ? "text-[#E7FB10] fill-[#E7FB10]"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold">{reviewsData.average.toFixed(1)}</span>
                  <span className="text-muted-foreground">({reviewsData.count} reviews)</span>
                </div>
              )}
            </div>
          </div>

          {/* Verified Purchase Notice */}
          <Card className="p-4 mb-6 border border-muted bg-muted/30">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm">Verified Purchase Reviews Only</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Only customers who have purchased this research stack can leave a review. 
                  {isAuthenticated ? (
                    <> Reviews can be submitted 30 days after your order from your <Link href="/dashboard" className="text-primary hover:underline">dashboard</Link>.</>
                  ) : (
                    <> <Link href="/api/login" className="text-primary hover:underline">Sign in</Link> and make a purchase to leave a verified review.</>
                  )}
                </p>
              </div>
            </div>
          </Card>

          {reviewsData && reviewsData.reviews.length > 0 ? (
            <div className="space-y-4">
              {reviewsData.reviews.map((review) => (
                <Card key={review.id} className="p-5" data-testid={`card-review-${review.id}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold" data-testid={`text-reviewer-${review.id}`}>
                            {review.reviewerName}
                          </span>
                          {review.isVerifiedPurchase && (
                            <Badge variant="secondary" className="text-[10px] gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3.5 w-3.5 ${
                                  star <= review.rating
                                    ? "text-[#E7FB10] fill-[#E7FB10]"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {review.createdAt && new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {review.title && (
                    <h4 className="font-semibold mb-2" data-testid={`text-review-title-${review.id}`}>
                      {review.title}
                    </h4>
                  )}
                  <p className="text-muted-foreground leading-relaxed" data-testid={`text-review-comment-${review.id}`}>
                    {review.comment}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Star className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">No reviews yet</h3>
              <p className="text-sm text-muted-foreground">
                Reviews from verified purchasers will appear here.
              </p>
            </Card>
          )}
        </motion.section>

      </div>
    </main>
  );
}
