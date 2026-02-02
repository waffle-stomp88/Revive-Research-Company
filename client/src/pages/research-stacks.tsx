import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { SEOHead } from "@/components/seo-head";
import { CategoryTabs } from "@/components/category-tabs";
import { Layers, FlaskConical, ArrowRight, Sparkles, Zap, Heart, Leaf, Star, Crown, Shield, X, Check, ShoppingCart, Beaker, Brain, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EarlyAccessModal } from "@/components/early-access-modal";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";
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
  peptides: string[];
  icon: typeof FlaskConical;
  color: string;
  badge?: string;
  badgeColor?: string;
  retailValue: number;
  stackPrice: number;
  synergy: SynergyCopy;
}

const researchStacks: ResearchStack[] = [
  {
    id: "recovery-tissue-stack",
    name: "Recovery + Tissue Mechanisms Stack",
    subtitle: "Dual Pathway Tissue Stack",
    description: "This stack combines two of the most extensively researched compounds for tissue mechanism pathways. Ideal for researchers studying synergistic repair signaling and cellular regeneration models.",
    peptides: ["BPC-157", "TB-500"],
    icon: Heart,
    color: "#22c55e",
    badge: "Most Popular",
    badgeColor: "#E7FB10",
    retailValue: 129,
    stackPrice: 109,
    synergy: {
      beginner: "BPC-157 helps cells repair faster while TB-500 helps the body build new blood vessels to deliver nutrients. Together, they create a 'repair + rebuild' combination that researchers find works better than either compound alone.",
      expert: "BPC-157 upregulates growth hormone receptors and VEGF expression while TB-500 (Thymosin Beta-4) promotes actin polymerization and angiogenesis. The dual-pathway activation creates synergistic tissue regeneration signaling through complementary GH/IGF-1 axis and cytoskeletal remodeling mechanisms."
    }
  },
  {
    id: "metabolic-pathway-stack",
    name: "Metabolic Pathway Research Stack",
    subtitle: "Triple-Pathway Research Bundle",
    description: "Explore incretin signaling and mitochondrial function pathways with this comprehensive metabolic research combination. Features compounds targeting multiple energy regulation mechanisms.",
    peptides: ["MOTS-C", "Retatrutide"],
    icon: Zap,
    color: "#E7FB10",
    badge: "Hot Research",
    badgeColor: "#ef4444",
    retailValue: 135,
    stackPrice: 115,
    synergy: {
      beginner: "MOTS-C helps cells produce energy more efficiently at the mitochondrial level, while Retatrutide signals the body to use stored fat for fuel. Together, they target metabolism from two different angles—one at the cellular power plant, one at the hormonal control center.",
      expert: "MOTS-C activates AMPK pathways and enhances mitochondrial biogenesis, while Retatrutide acts as a triple agonist (GLP-1/GIP/Glucagon receptors) modulating incretin signaling. This creates multi-target metabolic pathway activation: mitochondrial efficiency + peripheral insulin sensitivity + hepatic gluconeogenesis modulation."
    }
  },
  {
    id: "cellular-optimization-stack",
    name: "Cellular Optimization Stack",
    subtitle: "Signal Pathway Combo",
    description: "Research cellular signaling pathways and copper peptide mechanisms. This stack is designed for studies on mitochondrial function, cellular longevity models, and signal transduction research.",
    peptides: ["GHK-Cu (100mg)", "MOTS-C"],
    icon: Sparkles,
    color: "#a855f7",
    retailValue: 90,
    stackPrice: 76,
    synergy: {
      beginner: "GHK-Cu is a copper peptide that helps cells 'clean house' and produce healthy proteins, while MOTS-C improves how cells generate energy. Think of it as upgrading both the maintenance crew and the power supply at the cellular level.",
      expert: "GHK-Cu modulates gene expression for tissue remodeling (collagen, decorin, metalloproteinases) while MOTS-C enhances mitochondrial function via AMPK activation. The combination creates parallel signaling for extracellular matrix optimization and intracellular energy metabolism—addressing both structural and functional cellular pathways."
    }
  },
  {
    id: "starter-research-stack",
    name: "Premium Research Starter Stack",
    subtitle: "Beginner Research Essentials",
    description: "The ideal entry point for new research programs. Features two of the most well-characterized and widely-studied peptide compounds, perfect for establishing baseline protocols.",
    peptides: ["BPC-157", "MOTS-C"],
    icon: Star,
    color: "#21d8ff",
    badge: "Best for Beginners",
    badgeColor: "#21d8ff",
    retailValue: 105,
    stackPrice: 89,
    synergy: {
      beginner: "BPC-157 is one of the most studied repair peptides, helping tissues heal and regenerate. MOTS-C supports energy production at the cellular level. Together, they give researchers a solid foundation covering two fundamental areas: tissue repair and cellular energy.",
      expert: "BPC-157's cytoprotective and pro-angiogenic properties complement MOTS-C's mitochondrial biogenesis activation. This pairing covers two primary research domains—tissue regeneration signaling (BPC-157 via NO/GH pathways) and metabolic optimization (MOTS-C via AMPK/PGC-1α)—making it ideal for establishing baseline assays before advancing to more complex protocols."
    }
  },
  {
    id: "collagen-skin-stack",
    name: "Collagen & Skin Pathway Stack",
    subtitle: "Dermal Research Bundle",
    description: "Study collagen synthesis pathways and dermal tissue mechanisms. This combination targets complementary wound healing and structural protein research applications.",
    peptides: ["GHK-Cu", "BPC-157"],
    icon: Leaf,
    color: "#ec4899",
    retailValue: 115,
    stackPrice: 98,
    synergy: {
      beginner: "GHK-Cu directly stimulates collagen production and skin cell turnover, while BPC-157 supports the blood vessel growth needed to deliver nutrients to healing tissue. Together, they work on both the 'building blocks' and the 'supply chain' for skin and tissue research.",
      expert: "GHK-Cu upregulates collagen I, III, and elastin synthesis while modulating TGF-β signaling for controlled tissue remodeling. BPC-157 enhances angiogenesis via VEGF upregulation and provides cytoprotection. The combination creates synergistic dermal pathway activation: structural protein synthesis (GHK-Cu) + vascularization and tissue protection (BPC-157)."
    }
  },
  {
    id: "elite-triple-stack",
    name: "Elite Pathway Triple Stack",
    subtitle: "Advanced Multi-Mechanism Bundle",
    description: "Our most comprehensive research stack covering three major mechanism categories: incretin signaling, mitochondrial pathways, and tissue repair models. For advanced research programs requiring multi-target investigation.",
    peptides: ["Retatrutide", "MOTS-C", "BPC-157"],
    icon: Crown,
    color: "#f59e0b",
    badge: "Premium",
    badgeColor: "#f59e0b",
    retailValue: 200,
    stackPrice: 169,
    synergy: {
      beginner: "This triple stack covers three major research areas: Retatrutide for metabolic hormone signaling, MOTS-C for cellular energy production, and BPC-157 for tissue repair. It's designed for advanced researchers who want to study how these different systems interact and influence each other.",
      expert: "This triple-compound stack enables multi-pathway investigation: Retatrutide (GLP-1/GIP/GCGR triple agonist) for incretin and hepatic signaling, MOTS-C for mitochondrial biogenesis and AMPK activation, and BPC-157 for tissue regeneration via NO/GH pathways. The combination allows researchers to study cross-talk between metabolic, energetic, and regenerative signaling cascades in a single protocol."
    }
  },
];

type StackTab = "pre-built" | "custom";

// ============================================
// SYNERGY SYSTEM - Known Combos & Pathways
// ============================================

interface KnownStack {
  name: string;
  peptides: string[];
  icon: string;
  color: string;
  description: string;
  synergyBonus: number;
}

interface PeptidePathway {
  name: string;
  pathways: string[];
  mechanisms: string[];
  systems: string[];
}

// Famous known stacks from research (Peptibase data)
const KNOWN_STACKS: KnownStack[] = [
  {
    name: "Wolverine Stack",
    peptides: ["bpc-157", "tb-500"],
    icon: "⚡",
    color: "#22c55e",
    description: "Legendary healing combo - BPC-157's local repair + TB-500's systemic regeneration",
    synergyBonus: 95,
  },
  {
    name: "Glow Protocol",
    peptides: ["bpc-157", "tb-500", "ghk-cu"],
    icon: "✨",
    color: "#ec4899",
    description: "Ultimate skin rejuvenation - collagen + blood vessels + tissue repair",
    synergyBonus: 90,
  },
  {
    name: "GH Amplifier",
    peptides: ["ipamorelin", "cjc-1295"],
    icon: "🚀",
    color: "#f59e0b",
    description: "Growth hormone synergy - GHRP + GHRH work better together",
    synergyBonus: 88,
  },
  {
    name: "Recovery+",
    peptides: ["bpc-157", "ghk-cu"],
    icon: "💚",
    color: "#22c55e",
    description: "Collagen synthesis meets tissue protection",
    synergyBonus: 82,
  },
  {
    name: "Energy Stack",
    peptides: ["mots-c", "retatrutide"],
    icon: "⚡",
    color: "#E7FB10",
    description: "Mitochondrial power + metabolic signaling",
    synergyBonus: 80,
  },
];

// Peptide pathway data for connections
const PEPTIDE_PATHWAYS: Record<string, PeptidePathway> = {
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
    systems: ["Metabolic", "Weight"],
  },
  "ipamorelin": {
    name: "Ipamorelin",
    pathways: ["Ghrelin Receptor", "GH Secretion"],
    mechanisms: ["Pituitary activation", "Selective GH release", "No cortisol spike"],
    systems: ["Growth", "Recovery", "Sleep"],
  },
  "cjc-1295": {
    name: "CJC-1295",
    pathways: ["GHRH Signaling", "GH Secretion"],
    mechanisms: ["Extended GH release", "Pituitary stimulation", "DAC variant for sustained"],
    systems: ["Growth", "Recovery", "Muscle"],
  },
  "epithalon": {
    name: "Epithalon",
    pathways: ["Telomerase Activation", "Pineal Function"],
    mechanisms: ["Telomere extension", "Melatonin regulation", "Circadian rhythm"],
    systems: ["Longevity", "Sleep"],
  },
  "semax": {
    name: "Semax",
    pathways: ["BDNF", "NGF", "Dopamine"],
    mechanisms: ["Neuroprotection", "Cognitive enhancement", "ACTH fragment"],
    systems: ["Cognitive", "Focus"],
  },
  "selank": {
    name: "Selank",
    pathways: ["GABA", "Serotonin", "Dopamine"],
    mechanisms: ["Anxiolytic", "Immunomodulation", "Tuftsin analog"],
    systems: ["Cognitive", "Mood", "Immune"],
  },
};

// Body systems with icons
const BODY_SYSTEMS = [
  { id: "healing", name: "Healing", icon: Heart, color: "#22c55e" },
  { id: "metabolic", name: "Metabolic", icon: Zap, color: "#E7FB10" },
  { id: "growth", name: "Growth", icon: Target, color: "#f59e0b" },
  { id: "cognitive", name: "Cognitive", icon: Brain, color: "#21d8ff" },
  { id: "skin", name: "Skin", icon: Sparkles, color: "#ec4899" },
  { id: "longevity", name: "Longevity", icon: Crown, color: "#a855f7" },
];

// Helper to normalize peptide names for matching
const normalizePeptideName = (name: string): string => {
  return name.toLowerCase()
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/[^a-z0-9-]/g, '')
    .trim();
};

// Get peptide pathway data
const getPeptidePathway = (productName: string): PeptidePathway | null => {
  const normalized = normalizePeptideName(productName);
  for (const [key, data] of Object.entries(PEPTIDE_PATHWAYS)) {
    if (normalized.includes(key.replace(/-/g, ''))) {
      return data;
    }
  }
  return null;
};

// Check if selected peptides form a known stack
const checkKnownStack = (selectedNames: string[]): KnownStack | null => {
  const normalizedSelected = selectedNames.map(normalizePeptideName);
  
  for (const stack of KNOWN_STACKS) {
    const stackPeptides = stack.peptides;
    const hasAll = stackPeptides.every(p => 
      normalizedSelected.some(s => s.includes(p.replace(/-/g, '')))
    );
    const isExactMatch = stackPeptides.length === normalizedSelected.length;
    
    if (hasAll && isExactMatch) {
      return stack;
    }
  }
  return null;
};

// Get recommendation to complete a known stack
const getStackRecommendation = (selectedNames: string[]): { stack: KnownStack; missing: string[] } | null => {
  const normalizedSelected = selectedNames.map(normalizePeptideName);
  
  for (const stack of KNOWN_STACKS) {
    const matchCount = stack.peptides.filter(p => 
      normalizedSelected.some(s => s.includes(p.replace(/-/g, '')))
    ).length;
    
    // If they have at least 1 but not all
    if (matchCount >= 1 && matchCount < stack.peptides.length) {
      const missing = stack.peptides.filter(p => 
        !normalizedSelected.some(s => s.includes(p.replace(/-/g, '')))
      );
      return { stack, missing };
    }
  }
  return null;
};

// Find shared pathways between peptides
const findSharedPathways = (peptideNames: string[]): string[] => {
  const allPathways: string[][] = [];
  
  for (const name of peptideNames) {
    const pathway = getPeptidePathway(name);
    if (pathway) {
      allPathways.push(pathway.pathways);
    }
  }
  
  if (allPathways.length < 2) return [];
  
  // Find pathways that appear in multiple peptides
  const pathwayCounts = new Map<string, number>();
  for (const paths of allPathways) {
    for (const p of paths) {
      pathwayCounts.set(p, (pathwayCounts.get(p) || 0) + 1);
    }
  }
  
  return Array.from(pathwayCounts.entries())
    .filter(([, count]) => count >= 2)
    .map(([pathway]) => pathway);
};

// Calculate synergy score
const calculateSynergyScore = (peptideNames: string[]): number => {
  if (peptideNames.length < 2) return 0;
  
  // Check for known stacks first
  const knownStack = checkKnownStack(peptideNames);
  if (knownStack) return knownStack.synergyBonus;
  
  // Calculate based on shared pathways and systems
  const sharedPathways = findSharedPathways(peptideNames);
  const baseScore = 50;
  const pathwayBonus = sharedPathways.length * 10;
  
  return Math.min(baseScore + pathwayBonus, 85);
};

// Get active body systems based on selection
const getActiveSystems = (peptideNames: string[]): string[] => {
  const systems = new Set<string>();
  
  for (const name of peptideNames) {
    const pathway = getPeptidePathway(name);
    if (pathway) {
      pathway.systems.forEach(s => systems.add(s.toLowerCase()));
    }
  }
  
  return Array.from(systems);
};

// Structured synergy analysis interface (for AI response)
interface SynergyAnalysis {
  peptidePathways: Array<{
    name: string;
    pathway: string;
    mechanism: string;
  }>;
  synergyBenefits: string[];
  bestFor: string[];
  simpleExplanation: string;
  expertExplanation: string;
  synergyScore: number;
}

// Goal-based category mapping for peptides
const peptideCategories: Record<string, { label: string; color: string; icon: typeof Heart }[]> = {
  "bpc-157": [{ label: "Healing", color: "#22c55e", icon: Heart }, { label: "Gut", color: "#3b82f6", icon: Shield }],
  "tb-500": [{ label: "Healing", color: "#22c55e", icon: Heart }, { label: "Mobility", color: "#f59e0b", icon: Zap }],
  "ghk-cu": [{ label: "Skin", color: "#ec4899", icon: Sparkles }, { label: "Longevity", color: "#a855f7", icon: Crown }],
  "mots-c": [{ label: "Metabolic", color: "#E7FB10", icon: Zap }, { label: "Energy", color: "#f59e0b", icon: Zap }],
  "retatrutide": [{ label: "Metabolic", color: "#E7FB10", icon: Zap }],
  "semaglutide": [{ label: "Metabolic", color: "#E7FB10", icon: Zap }],
  "tirzepatide": [{ label: "Metabolic", color: "#E7FB10", icon: Zap }],
  "epithalon": [{ label: "Longevity", color: "#a855f7", icon: Crown }],
  "semax": [{ label: "Cognitive", color: "#21d8ff", icon: Brain }],
  "selank": [{ label: "Cognitive", color: "#21d8ff", icon: Brain }, { label: "Mood", color: "#3b82f6", icon: Heart }],
  "ipamorelin": [{ label: "Growth", color: "#f59e0b", icon: Zap }],
  "cjc-1295": [{ label: "Growth", color: "#f59e0b", icon: Zap }],
  "default": [{ label: "Research", color: "#6b7280", icon: Beaker }],
};

const getPeptideCategories = (productName: string) => {
  const normalizedName = productName.toLowerCase().replace(/\s*\([^)]*\)/g, '').trim();
  for (const key of Object.keys(peptideCategories)) {
    if (key !== 'default' && normalizedName.includes(key)) {
      return peptideCategories[key];
    }
  }
  return peptideCategories.default;
};

// Custom Stack Builder Component
interface CustomStackBuilderProps {
  onSwitchToPreBuilt: () => void;
  templatePeptideNames?: string[];
  onTemplateApplied?: () => void;
}

function CustomStackBuilder({ onSwitchToPreBuilt, templatePeptideNames, onTemplateApplied }: CustomStackBuilderProps) {
  const [selectedPeptides, setSelectedPeptides] = useState<Product[]>([]);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const inStockPeptides = products?.filter(p => p.inStock && p.category?.toLowerCase() === "peptides") || [];

  // Apply template peptides when provided
  useEffect(() => {
    if (templatePeptideNames && templatePeptideNames.length > 0 && products) {
      const matchedPeptides = templatePeptideNames
        .map(name => products.find(p => 
          p.name.toLowerCase().includes(name.toLowerCase().replace(/\s*\([^)]*\)/g, '')) ||
          name.toLowerCase().includes(p.name.toLowerCase())
        ))
        .filter((p): p is Product => p !== undefined && p.inStock === true)
        .slice(0, 4);
      
      if (matchedPeptides.length > 0) {
        setSelectedPeptides(matchedPeptides);
        onTemplateApplied?.();
        toast({
          title: "Template Applied",
          description: `${matchedPeptides.length} peptide${matchedPeptides.length > 1 ? 's' : ''} from the template have been pre-selected. Customize as needed!`,
        });
      }
    }
  }, [templatePeptideNames, products, onTemplateApplied, toast]);

  const togglePeptide = (product: Product) => {
    if (selectedPeptides.find(p => p.id === product.id)) {
      setSelectedPeptides(prev => prev.filter(p => p.id !== product.id));
    } else if (selectedPeptides.length < 4) {
      setSelectedPeptides(prev => [...prev, product]);
    }
  };

  const getDiscount = () => {
    // Flat 10% for custom stacks (pre-built stacks offer 15-20%)
    return selectedPeptides.length >= 2 ? 10 : 0;
  };

  const getRetailTotal = () => {
    return selectedPeptides.reduce((sum, p) => sum + parseFloat(String(p.price)), 0);
  };

  const getBundlePrice = () => {
    const retail = getRetailTotal();
    const discount = getDiscount();
    return retail * (1 - discount / 100);
  };

  const getSavings = () => {
    return getRetailTotal() - getBundlePrice();
  };

  const handleAddToCart = () => {
    if (selectedPeptides.length < 2) return;

    const customStackName = `Custom Stack: ${selectedPeptides.map(p => p.name).join(" + ")}`;
    const bundleId = `custom-${Date.now()}`;
    
    // Add as a bundle to cart (matching CartItem interface)
    addToCart({
      productId: bundleId,
      bundleId: bundleId,
      name: customStackName,
      price: getBundlePrice(),
      originalPrice: getRetailTotal(),
      quantity: 1,
      dosage: "Custom Bundle",
      image: selectedPeptides[0]?.imageUrl || productImage,
      isBundle: true,
    });

    toast({
      title: "Added to Cart",
      description: `${customStackName} added with ${getDiscount()}% bundle discount`,
      action: (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate("/cart")}
          className="border-[#E7FB10] text-[#E7FB10] hover:bg-[#E7FB10]/10"
          data-testid="button-toast-view-cart"
        >
          View Cart
        </Button>
      ),
    });

    // Reset
    setSelectedPeptides([]);
  };

  return (
    <div className="space-y-6">
      {/* Two Column Layout: Peptides Left, Build Panel Right */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Peptide Selection */}
        <div className="flex-1 lg:max-w-[65%]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-xl font-bold">Select Your Peptides</h3>
              <p className="text-sm text-muted-foreground">
                Click to select • {inStockPeptides.length} available
              </p>
            </div>
            {selectedPeptides.length > 0 && (
              <Badge className="bg-[#21d8ff]/20 text-[#21d8ff] border-[#21d8ff]/30">
                {selectedPeptides.length}/4 Selected
              </Badge>
            )}
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[...Array(12)].map((_, i) => (
                <Card key={i} className="p-2">
                  <Skeleton className="aspect-[4/3] rounded-md mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-1/2" />
                </Card>
              ))}
            </div>
          ) : inStockPeptides.length === 0 ? (
            <Card className="p-8 text-center border-dashed border-[#2a2a32]">
              <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-display text-xl font-bold mb-2">No Peptides Available</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                All peptides are currently out of stock.
              </p>
              <Button variant="outline" className="mt-4" onClick={onSwitchToPreBuilt}>
                View Pre-Built Stacks
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {inStockPeptides.map(product => {
                const isSelected = selectedPeptides.find(p => p.id === product.id);
                const isDisabled = !isSelected && selectedPeptides.length >= 4;
                const categories = getPeptideCategories(product.name);
                const primaryCategory = categories[0];

                return (
                  <motion.button
                    key={product.id}
                    whileHover={{ scale: isDisabled ? 1 : 1.01 }}
                    whileTap={{ scale: isDisabled ? 1 : 0.99 }}
                    onClick={() => !isDisabled && togglePeptide(product)}
                    disabled={isDisabled}
                    className={`text-left p-3 rounded-lg border transition-all duration-200 ${
                      isSelected
                        ? "border-2 border-[#21d8ff] bg-[#21d8ff]/10"
                        : isDisabled
                        ? "opacity-40 cursor-not-allowed border-[#2a2a32] bg-[#1a1a1f]"
                        : "border-[#2a2a32] bg-[#1a1a1f] hover:border-[#21d8ff]/50 hover:bg-[#21d8ff]/5"
                    }`}
                    data-testid={`card-select-peptide-${product.id}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className={`font-display font-bold text-base truncate ${isSelected ? "text-[#21d8ff]" : "text-white"}`}>
                          {product.name.replace(/\s*\([^)]*\)/g, '')}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: primaryCategory.color }}>
                          {primaryCategory.label}
                        </p>
                      </div>
                      {isSelected && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-5 h-5 rounded-full bg-[#21d8ff] flex items-center justify-center shrink-0"
                        >
                          <Check className="h-3 w-3 text-black" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Synergy Visualization Panel */}
        <div className="lg:w-[35%]">
          <div className="lg:sticky lg:top-28 space-y-4">
            
            {/* ====== SYNERGY RING & SCORE ====== */}
            {(() => {
              const peptideNames = selectedPeptides.map(p => p.name);
              const synergyScore = calculateSynergyScore(peptideNames);
              const knownStack = checkKnownStack(peptideNames);
              const recommendation = getStackRecommendation(peptideNames);
              const sharedPathways = findSharedPathways(peptideNames);
              const activeSystems = getActiveSystems(peptideNames);
              
              return (
                <>
                  {/* Synergy Ring Visualization */}
                  <Card className="border-2 border-[#9d4edd]/40 bg-gradient-to-br from-[#1a1a1f] to-[#0f0f12] overflow-hidden" data-testid="card-synergy-ring">
                    <div className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Animated Synergy Ring */}
                        <div className="relative w-24 h-24 flex-shrink-0">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            {/* Background ring */}
                            <circle
                              cx="50"
                              cy="50"
                              r="42"
                              fill="none"
                              stroke="#2a2a32"
                              strokeWidth="8"
                            />
                            {/* Progress ring */}
                            <motion.circle
                              cx="50"
                              cy="50"
                              r="42"
                              fill="none"
                              stroke={knownStack ? knownStack.color : synergyScore > 70 ? "#22c55e" : synergyScore > 50 ? "#E7FB10" : "#21d8ff"}
                              strokeWidth="8"
                              strokeLinecap="round"
                              initial={{ strokeDasharray: "0 264" }}
                              animate={{ 
                                strokeDasharray: `${(synergyScore / 100) * 264} 264`,
                              }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              style={{
                                filter: knownStack ? `drop-shadow(0 0 8px ${knownStack.color})` : undefined
                              }}
                            />
                          </svg>
                          {/* Center content */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <motion.span 
                              key={synergyScore}
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="font-display text-2xl font-bold"
                              style={{ color: knownStack ? knownStack.color : "#fff" }}
                            >
                              {synergyScore}%
                            </motion.span>
                            <span className="text-[10px] text-muted-foreground">SYNERGY</span>
                          </div>
                        </div>
                        
                        {/* Stack Status */}
                        <div className="flex-1 min-w-0">
                          {selectedPeptides.length === 0 ? (
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">Select peptides to see synergy</p>
                              <p className="text-xs text-muted-foreground/70 mt-1">Known combos unlock bonuses</p>
                            </div>
                          ) : knownStack ? (
                            <motion.div
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="text-center"
                            >
                              <div className="text-2xl mb-1">{knownStack.icon}</div>
                              <p className="font-display font-bold text-lg" style={{ color: knownStack.color }}>
                                {knownStack.name}
                              </p>
                              <Badge className="mt-1 text-[10px]" style={{ backgroundColor: `${knownStack.color}20`, color: knownStack.color, border: `1px solid ${knownStack.color}40` }}>
                                Legendary Combo
                              </Badge>
                            </motion.div>
                          ) : selectedPeptides.length >= 2 ? (
                            <div>
                              <p className="font-display font-bold text-sm">Custom Stack</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {sharedPathways.length > 0 
                                  ? `${sharedPathways.length} shared pathway${sharedPathways.length > 1 ? 's' : ''} detected`
                                  : "Building synergy..."}
                              </p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm text-muted-foreground">Add 1 more peptide</p>
                              <p className="text-xs text-muted-foreground/70">to unlock synergy analysis</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Known Stack Description */}
                      {knownStack && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          className="mt-4 pt-3 border-t border-[#2a2a32]"
                        >
                          <p className="text-sm text-gray-300">{knownStack.description}</p>
                        </motion.div>
                      )}
                    </div>
                  </Card>

                  {/* ====== RECOMMENDATION CARD ====== */}
                  {recommendation && selectedPeptides.length < 4 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card 
                        className="border-2 border-dashed overflow-hidden cursor-pointer hover-elevate"
                        style={{ borderColor: `${recommendation.stack.color}60` }}
                        data-testid="card-recommendation"
                      >
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-4 w-4" style={{ color: recommendation.stack.color }} />
                            <span className="font-bold text-sm" style={{ color: recommendation.stack.color }}>
                              Complete {recommendation.stack.name}!
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">
                            Add {recommendation.missing.map(m => m.toUpperCase()).join(" + ")} to unlock this legendary combo
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{recommendation.stack.icon}</span>
                              <span className="font-display font-bold" style={{ color: recommendation.stack.color }}>
                                {recommendation.stack.synergyBonus}% synergy
                              </span>
                            </div>
                            <Badge className="text-[10px]" style={{ backgroundColor: `${recommendation.stack.color}20`, color: recommendation.stack.color }}>
                              +{recommendation.stack.synergyBonus - synergyScore}% boost
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )}

                  {/* ====== BODY SYSTEMS HEATMAP ====== */}
                  {selectedPeptides.length > 0 && (
                    <Card className="border-[#2a2a32] bg-[#1a1a1f]/50" data-testid="card-body-systems">
                      <div className="p-3">
                        <p className="text-xs font-semibold text-muted-foreground mb-3">TARGETING</p>
                        <div className="flex flex-wrap gap-2">
                          {BODY_SYSTEMS.map(system => {
                            const isActive = activeSystems.includes(system.id);
                            const SystemIcon = system.icon;
                            return (
                              <motion.div
                                key={system.id}
                                initial={{ scale: 0.8 }}
                                animate={{ 
                                  scale: isActive ? 1 : 0.9,
                                  opacity: isActive ? 1 : 0.3
                                }}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
                                  isActive 
                                    ? "border-opacity-50" 
                                    : "border-[#2a2a32] bg-[#1a1a1f]"
                                }`}
                                style={isActive ? { 
                                  borderColor: system.color,
                                  backgroundColor: `${system.color}15`,
                                  boxShadow: `0 0 12px ${system.color}30`
                                } : undefined}
                                data-testid={`system-${system.id}`}
                              >
                                <SystemIcon 
                                  className="h-3.5 w-3.5" 
                                  style={{ color: isActive ? system.color : "#6b7280" }} 
                                />
                                <span 
                                  className="text-xs font-medium"
                                  style={{ color: isActive ? system.color : "#6b7280" }}
                                >
                                  {system.name}
                                </span>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* ====== SHARED PATHWAYS ====== */}
                  {sharedPathways.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="border-[#22c55e]/30 bg-[#22c55e]/5" data-testid="card-shared-pathways">
                        <div className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="h-4 w-4 text-[#22c55e]" />
                            <span className="font-bold text-sm text-[#22c55e]">Synergy Detected</span>
                          </div>
                          <p className="text-xs text-gray-400 mb-2">These peptides share pathways:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {sharedPathways.map((pathway, i) => (
                              <Badge 
                                key={i}
                                className="text-[10px] bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30"
                              >
                                {pathway}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )}

                  {/* ====== SELECTED PEPTIDES & PRICING ====== */}
                  <Card className="border-[#21d8ff]/40 bg-gradient-to-br from-[#1a1a1f] to-[#0f0f12]">
                    <div className="p-4 border-b border-[#2a2a32]">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display font-bold">Your Stack</h3>
                        <span className="text-xs text-muted-foreground">{selectedPeptides.length}/4</span>
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-3">
                      {selectedPeptides.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">
                          <FlaskConical className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Select peptides to begin</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {selectedPeptides.map(peptide => (
                            <div 
                              key={peptide.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-[#21d8ff]/5 border border-[#21d8ff]/20"
                            >
                              <span className="font-medium text-sm">
                                {peptide.name.replace(/\s*\([^)]*\)/g, '')}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">${peptide.price}</span>
                                <button
                                  onClick={() => togglePeptide(peptide)}
                                  className="p-1 rounded-full hover:bg-red-500/20 text-muted-foreground hover:text-red-400"
                                  data-testid={`button-remove-peptide-${peptide.id}`}
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Pricing */}
                      {selectedPeptides.length >= 2 && (
                        <div className="pt-3 border-t border-[#2a2a32] space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="line-through text-muted-foreground">${getRetailTotal().toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-green-400">Bundle Discount (10%)</span>
                            <span className="text-green-400">-${getSavings().toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-[#2a2a32]">
                            <span className="font-bold">Total</span>
                            <span className="font-display text-2xl font-bold text-[#E7FB10]">${getBundlePrice().toFixed(2)}</span>
                          </div>
                        </div>
                      )}

                      {/* Add to Cart */}
                      <Button
                        onClick={handleAddToCart}
                        disabled={selectedPeptides.length < 2}
                        className="w-full bg-[#E7FB10] text-black hover:bg-[#E7FB10]/90 font-bold shadow-[0_0_20px_rgba(231,251,16,0.3)]"
                        data-testid="button-add-custom-stack"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {selectedPeptides.length < 2 ? "Select 2+ Peptides" : "Add to Cart"}
                      </Button>
                    </div>
                  </Card>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Research Disclaimer */}
      <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-red-400">Research Use Only</p>
            <p className="text-xs text-gray-400">
              Custom stacks are intended for laboratory research purposes only. 
              Pathway analysis is based on published literature and does not constitute guidance for any application.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResearchStacks() {
  const [activeTab, setActiveTab] = useState<StackTab>("pre-built");
  const [templatePeptideNames, setTemplatePeptideNames] = useState<string[]>([]);

  const handleUseAsTemplate = (peptideNames: string[]) => {
    setTemplatePeptideNames([...peptideNames]); // Create new array to trigger useEffect
    setActiveTab("custom");
  };

  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-12">
      <SEOHead title="Research Stacks" description="Curated peptide combinations for specific research goals. Save with bundle pricing." canonicalPath="/research-stacks" />
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {/* Category Navigation Tabs */}
          <div className="mb-6">
            <CategoryTabs />
          </div>

          {/* Animated Title Switch */}
          <AnimatePresence mode="wait">
            {activeTab === "pre-built" ? (
              <motion.div
                key="prebuilt-title"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/30 mb-4">
                  <Layers className="h-4 w-4 text-[#a855f7]" />
                  <span className="text-sm font-medium text-[#a855f7]">Multi-Compound Research</span>
                </div>
                <h1 className="font-display text-4xl md:text-5xl font-bold mb-4" data-testid="heading-research-stacks">
                  Research Stacks
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                  Curated multi-compound combinations designed for synergistic pathway research.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="custom-title"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#9d4edd]/20 border border-[#9d4edd]/40 mb-4">
                  <Sparkles className="h-4 w-4 text-[#9d4edd]" />
                  <span className="text-sm font-medium text-[#9d4edd]">Custom Stack Builder</span>
                </div>
                <h1 className="font-display text-4xl md:text-5xl font-bold mb-4" data-testid="heading-research-stacks">
                  Create Your <span className="text-[#E7FB10]">Perfect</span> Stack
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                  Select 2-4 peptides and save 10% on your custom research bundle.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Toggle Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex p-1 rounded-xl bg-[#1a1a1f] border border-[#2a2a32]">
            <button
              onClick={() => setActiveTab("pre-built")}
              className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === "pre-built"
                  ? "bg-[#a855f7] text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                  : "text-muted-foreground hover:text-white"
              }`}
              data-testid="tab-pre-built"
            >
              <Layers className="h-4 w-4 inline mr-2" />
              Pre-Built Stacks
            </button>
            <button
              onClick={() => setActiveTab("custom")}
              className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === "custom"
                  ? "bg-[#21d8ff] text-black shadow-[0_0_20px_rgba(33,216,255,0.4)]"
                  : "text-muted-foreground hover:text-white"
              }`}
              data-testid="tab-build-custom"
            >
              <Beaker className="h-4 w-4 inline mr-2" />
              Build Custom
            </button>
          </div>
        </motion.div>

        {/* Research Use Notice */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-4 rounded-xl bg-[#1a1a1f] border border-[#2a2a32]"
        >
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-[#21d8ff] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-300">
                <span className="text-[#21d8ff] font-medium">Research Use Only:</span>{" "}
                All research stacks are intended for laboratory and scientific research purposes only. 
                Compounds are selected based on complementary mechanism pathways documented in peer-reviewed literature.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "custom" ? (
            <motion.div
              key="custom"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <CustomStackBuilder 
                onSwitchToPreBuilt={() => setActiveTab("pre-built")}
                templatePeptideNames={templatePeptideNames}
                onTemplateApplied={() => setTemplatePeptideNames([])}
              />
            </motion.div>
          ) : (
            <motion.div
              key="pre-built"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {researchStacks.map((stack, index) => {
            const Icon = stack.icon;

            return (
              <motion.div
                key={stack.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <Link href={`/research-stacks/${stack.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "tween", duration: 0.15 }}
                    className="group"
                  >
                  <motion.div
                    initial={{ borderColor: "#2a2a32", boxShadow: "none" }}
                    whileHover={{ 
                      borderColor: stack.color,
                      boxShadow: `0 0 40px ${stack.color}60, 0 0 20px ${stack.color}40`
                    }}
                    transition={{ duration: 0.2, type: "tween" }}
                    className="border-2 rounded-lg"
                    data-testid={`card-stack-${stack.id}`}
                  >
                    <Card className="relative overflow-hidden h-full cursor-pointer">
                    {stack.badge && (
                      <Badge
                        className="absolute top-3 right-3 z-10"
                        style={{
                          backgroundColor: stack.badgeColor,
                          color: stack.badgeColor === "#E7FB10" || stack.badgeColor === "#f59e0b" ? "black" : "white",
                        }}
                      >
                        {stack.badge}
                      </Badge>
                    )}

                    <div className="relative h-40 bg-gradient-to-br from-[#1a1a1f] to-[#0d0d10] overflow-hidden">
                      <motion.div
                        initial={{ opacity: 0.2 }}
                        whileHover={{ opacity: 0.4 }}
                        transition={{ duration: 0.2, type: "tween" }}
                        className="absolute inset-0"
                        style={{
                          background: `radial-gradient(circle at 50% 100%, ${stack.color}40, transparent 70%)`,
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <motion.div
                          whileHover={{
                            scale: 1.1,
                            rotate: 5,
                          }}
                          transition={{ duration: 0.15, type: "tween" }}
                          className="relative pointer-events-auto"
                        >
                          <div
                            className="w-20 h-20 rounded-2xl flex items-center justify-center"
                            style={{ backgroundColor: `${stack.color}20` }}
                          >
                            <Icon
                              className="h-10 w-10"
                              style={{ color: stack.color }}
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 flex gap-0.5">
                            {stack.peptides.map((_, i) => (
                              <div
                                key={i}
                                className="w-3 h-3 rounded-full border-2 border-[#1a1a1f]"
                                style={{ backgroundColor: stack.color }}
                              />
                            ))}
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    <div className="p-5 space-y-4">
                    <div>
                      <p
                        className="text-xs font-medium mb-1"
                        style={{ color: stack.color }}
                      >
                        {stack.subtitle}
                      </p>
                      <h3 className="font-display text-lg font-bold text-white leading-tight">
                        {stack.name}
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {stack.peptides.map((peptide) => (
                        <Badge
                          key={peptide}
                          variant="outline"
                          className="text-xs border-[#3a3a42] text-gray-300"
                        >
                          <FlaskConical className="h-3 w-3 mr-1" style={{ color: stack.color }} />
                          {peptide}
                        </Badge>
                      ))}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {stack.description}
                    </p>

                    <div className="flex items-end justify-between pt-2 border-t border-[#2a2a32]">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">
                          If bought separately: <span className="line-through">${stack.retailValue}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold" style={{ color: stack.color }}>
                            ${stack.stackPrice}
                          </span>
                          <span className="text-xs text-green-500 font-medium">
                            Save ${stack.retailValue - stack.stackPrice}
                          </span>
                        </div>
                        <Badge variant="outline" className="border-[#21d8ff]/50 text-[#21d8ff] text-xs">
                          Curated Stack
                        </Badge>
                      </div>

                      <Button
                        size="sm"
                        className="group"
                        style={{
                          backgroundColor: stack.color,
                          color: stack.color === "#E7FB10" || stack.color === "#f59e0b" || stack.color === "#22c55e" ? "black" : "white",
                        }}
                        data-testid={`button-view-stack-${stack.id}`}
                      >
                        View Stack
                        <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                    </div>
                    </Card>
                  </motion.div>
                  </motion.div>
                </Link>
                <div className="mt-2 flex justify-center">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#a855f7]/50 text-[#a855f7] w-full"
                    onClick={() => handleUseAsTemplate(stack.peptides)}
                    data-testid={`button-use-template-${stack.id}`}
                  >
                    <Layers className="h-3 w-3 mr-1" />
                    Use as Template
                  </Button>
                </div>
              </motion.div>
            );
          })}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-12 text-center"
              >
                <Card className="p-8 bg-gradient-to-r from-[#a855f7]/10 via-[#21d8ff]/10 to-[#E7FB10]/10 border-[#2a2a32]">
                  <h3 className="font-display text-2xl font-bold mb-3">
                    Looking for Individual Peptides?
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                    All peptides in our research stacks are also available individually. 
                    Browse our full catalog for single-compound options.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/peptides">
                      <Button variant="outline" className="border-[#a855f7] text-[#a855f7] hover:bg-[#a855f7]/10">
                        <FlaskConical className="h-4 w-4 mr-2" />
                        Browse Peptides
                      </Button>
                    </Link>
                    <Link href="/shop">
                      <Button className="bg-[#E7FB10] text-black hover:bg-[#E7FB10]/90">
                        Shop All Products
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-8 p-4 rounded-xl bg-red-500/5 border border-red-500/20"
              >
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-red-400">Research Use Only</p>
                    <p className="text-xs text-gray-400">
                      These products are sold for laboratory and scientific research purposes only. 
                      They are not intended for human consumption, therapeutic use, or any application 
                      in humans or animals. By purchasing, you confirm you are a qualified researcher 
                      and will use these compounds solely for legitimate research purposes.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

export default function ResearchStacksWrapper() {
  return (
    <>
      <EarlyAccessModal showOnProductPages={true} />
      <ResearchStacks />
    </>
  );
}

