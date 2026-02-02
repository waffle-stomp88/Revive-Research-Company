import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SEOHead } from "@/components/seo-head";
import { CategoryTabs } from "@/components/category-tabs";
import { Layers, FlaskConical, ArrowRight, Sparkles, Zap, Heart, Leaf, Star, Crown, Shield, Plus, X, Check, ShoppingCart, Loader2, Beaker, Brain, Target, TrendingUp, Microscope, ToggleLeft, ToggleRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EarlyAccessModal } from "@/components/early-access-modal";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
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
type ExplanationMode = "simple" | "expert";

// Structured synergy analysis interface
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
  const [synergyAnalysis, setSynergyAnalysis] = useState<SynergyAnalysis | string | null>(null);
  const [isStructured, setIsStructured] = useState(false);
  const [explanationMode, setExplanationMode] = useState<ExplanationMode>("simple");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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
        setSynergyAnalysis(null);
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
      setSynergyAnalysis(null);
    } else if (selectedPeptides.length < 4) {
      setSelectedPeptides(prev => [...prev, product]);
      setSynergyAnalysis(null);
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

  const analyzeSymptoms = useMutation({
    mutationFn: async () => {
      const peptideNames = selectedPeptides.map(p => p.name).join(", ");
      const response = await apiRequest("POST", "/api/ai/synergy-analysis", {
        peptides: peptideNames,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setSynergyAnalysis(data.analysis);
      setIsStructured(data.structured === true);
      setIsAnalyzing(false);
    },
    onError: () => {
      setSynergyAnalysis("Unable to generate pathway analysis at this time. Please try again.");
      setIsStructured(false);
      setIsAnalyzing(false);
    },
  });

  const handleAnalyze = () => {
    if (selectedPeptides.length >= 2) {
      setIsAnalyzing(true);
      analyzeSymptoms.mutate();
    }
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
    setSynergyAnalysis(null);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#9d4edd]/20 via-[#21d8ff]/10 to-[#E7FB10]/10 rounded-2xl blur-3xl opacity-50" />
        <Card className="relative p-8 border-[#9d4edd]/30 bg-gradient-to-br from-[#1a1a1f] to-[#0f0f12] overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#9d4edd]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#9d4edd]/20 border border-[#9d4edd]/30">
              <Sparkles className="h-4 w-4 text-[#9d4edd]" />
              <span className="text-sm font-medium text-[#9d4edd]">Custom Stack Builder</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Create Your <span className="text-[#E7FB10]">Perfect</span> Research Bundle
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Select 2-4 peptides to build a custom research stack. Our AI will analyze pathway mechanisms, 
              and you'll unlock exclusive bundle discounts.
            </p>
          </div>

          {/* Discount Info */}
          <div className="flex justify-center gap-4 mt-8">
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl border-2 border-[#21d8ff]/40 bg-[#21d8ff]/10">
              <div className="text-center">
                <div className="font-display text-2xl font-bold text-[#21d8ff]">10%</div>
                <div className="text-xs text-muted-foreground">Custom Stack</div>
              </div>
            </div>
            <div className="flex items-center text-muted-foreground">vs</div>
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl border-2 border-[#E7FB10]/40 bg-[#E7FB10]/10">
              <div className="text-center">
                <div className="font-display text-2xl font-bold text-[#E7FB10]">15-20%</div>
                <div className="text-xs text-muted-foreground">Pre-Built Stacks</div>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Select 2-4 peptides below to save 10% on your custom bundle
          </p>
        </Card>
      </div>

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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {inStockPeptides.map(product => {
                const isSelected = selectedPeptides.find(p => p.id === product.id);
                const isDisabled = !isSelected && selectedPeptides.length >= 4;

                return (
                  <motion.div
                    key={product.id}
                    whileHover={{ scale: isDisabled ? 1 : 1.02 }}
                    whileTap={{ scale: isDisabled ? 1 : 0.98 }}
                  >
                    <Card
                      onClick={() => !isDisabled && togglePeptide(product)}
                      className={`p-2 cursor-pointer transition-all duration-300 relative overflow-hidden ${
                        isSelected
                          ? "border-2 border-[#21d8ff] bg-[#21d8ff]/5 shadow-[0_0_20px_rgba(33,216,255,0.3)]"
                          : isDisabled
                          ? "opacity-40 cursor-not-allowed border-[#2a2a32] grayscale"
                          : "border-[#2a2a32] hover:border-[#21d8ff]/60 hover:shadow-[0_0_15px_rgba(33,216,255,0.15)]"
                      }`}
                      data-testid={`card-select-peptide-${product.id}`}
                    >
                      {isSelected && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gradient-to-br from-[#21d8ff] to-[#9d4edd] flex items-center justify-center shadow-md"
                        >
                          <Check className="h-3 w-3 text-white" />
                        </motion.div>
                      )}
                      <div className="aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 rounded-md mb-2 overflow-hidden">
                        <img
                          src={product.imageUrl || productImage}
                          alt={product.name}
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                      <h3 className="font-display font-semibold text-xs mb-1 truncate">{product.name}</h3>
                      <div className="flex flex-wrap gap-0.5 mb-1.5">
                        {getPeptideCategories(product.name).slice(0, 2).map((cat, i) => {
                          const CatIcon = cat.icon;
                          return (
                            <span 
                              key={i}
                              className="inline-flex items-center px-1 py-0.5 rounded text-[8px] font-medium"
                              style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                            >
                              <CatIcon className="h-2 w-2 mr-0.5" />
                              {cat.label}
                            </span>
                          );
                        })}
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-[#E7FB10]">${product.price}</span>
                        {!isSelected && !isDisabled && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-[#21d8ff]/50 text-[#21d8ff]">
                            <Plus className="h-2.5 w-2.5 mr-0.5" />
                            Add
                          </Badge>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Build Panel (Sticky) */}
        <div className="lg:w-[35%]">
          <div className="lg:sticky lg:top-28 space-y-4">
            {/* Build Panel Card */}
            <Card className="border-2 border-[#21d8ff]/40 bg-gradient-to-br from-[#1a1a1f] to-[#0f0f12] shadow-[0_0_30px_rgba(33,216,255,0.1)]">
              <div className="p-4 border-b border-[#2a2a32]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#21d8ff] to-[#9d4edd] flex items-center justify-center">
                    <Layers className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg">Your Custom Stack</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{selectedPeptides.length}/4 peptides</span>
                      {selectedPeptides.length >= 2 && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px]">
                          10% OFF
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Selected Peptides List */}
                {selectedPeptides.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <FlaskConical className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Select peptides from the left to build your custom stack</p>
                    <p className="text-xs mt-1">Minimum 2 peptides required</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedPeptides.map(peptide => (
                      <motion.div
                        key={peptide.id}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -10, opacity: 0 }}
                        className="flex items-center gap-3 p-2 rounded-lg bg-[#21d8ff]/5 border border-[#21d8ff]/20"
                      >
                        <div className="w-10 h-10 rounded-md bg-muted overflow-hidden shrink-0">
                          <img 
                            src={peptide.imageUrl || productImage} 
                            alt={peptide.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-[#21d8ff] truncate">{peptide.name}</p>
                          <p className="text-xs text-muted-foreground">${peptide.price}</p>
                        </div>
                        <button
                          onClick={() => togglePeptide(peptide)}
                          className="p-1.5 rounded-full hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors"
                          data-testid={`button-remove-peptide-${peptide.id}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Pricing Summary */}
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

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  {selectedPeptides.length >= 2 && (
                    <Button
                      variant="outline"
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="w-full border-[#9d4edd] text-[#9d4edd] hover:bg-[#9d4edd]/10"
                      data-testid="button-analyze-synergy"
                    >
                      {isAnalyzing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Brain className="h-4 w-4 mr-2" />
                      )}
                      AI Pathway Analysis
                    </Button>
                  )}
                  <Button
                    onClick={handleAddToCart}
                    disabled={selectedPeptides.length < 2}
                    className="w-full bg-[#E7FB10] text-black hover:bg-[#E7FB10]/90 font-bold shadow-[0_0_20px_rgba(231,251,16,0.3)]"
                    data-testid="button-add-custom-stack"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </Card>

            {/* AI Synergy Analysis */}
            <AnimatePresence>
              {synergyAnalysis && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  {isStructured && typeof synergyAnalysis === 'object' ? (() => {
                    const pathways = synergyAnalysis.peptidePathways ?? [];
                    const benefits = synergyAnalysis.synergyBenefits ?? [];
                    const bestFor = synergyAnalysis.bestFor ?? [];
                    const score = synergyAnalysis.synergyScore ?? 75;
                    const simpleText = synergyAnalysis.simpleExplanation ?? "";
                    const expertText = synergyAnalysis.expertExplanation ?? "";
                    
                    return (
                      <Card className="border-[#a855f7]/30 bg-gradient-to-br from-[#a855f7]/5 to-transparent overflow-hidden" data-testid="card-synergy-analysis">
                        <div className="p-3 border-b border-[#a855f7]/20 bg-[#a855f7]/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Brain className="h-4 w-4 text-[#a855f7]" />
                              <span className="font-display font-bold text-sm">Analysis</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1" data-testid="synergy-score-display">
                                <TrendingUp className="h-3 w-3 text-[#22c55e]" />
                                <span className="text-sm font-bold text-[#22c55e]" data-testid="text-synergy-score">{score}%</span>
                              </div>
                              <button
                                onClick={() => setExplanationMode(prev => prev === "simple" ? "expert" : "simple")}
                                className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#1a1a1f] border border-[#2a2a32] text-[10px]"
                                data-testid="button-toggle-explanation-mode"
                              >
                                {explanationMode === "simple" ? (
                                  <><ToggleLeft className="h-3 w-3 text-[#21d8ff]" /><span className="text-[#21d8ff]">Simple</span></>
                                ) : (
                                  <><ToggleRight className="h-3 w-3 text-[#a855f7]" /><span className="text-[#a855f7]">Expert</span></>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 space-y-3">
                          <div className="p-2 rounded-lg bg-[#1a1a1f]/50 border border-[#2a2a32]" data-testid="text-explanation">
                            <p className="text-xs text-gray-300 leading-relaxed">
                              {explanationMode === "simple" ? simpleText : expertText}
                            </p>
                          </div>

                          {/* Pathways */}
                          <div className="space-y-1.5" data-testid="section-pathways">
                            <p className="text-[10px] font-semibold text-[#21d8ff] uppercase">Key Pathways</p>
                            {pathways.map((peptide, i) => (
                              <div key={i} className="p-1.5 rounded bg-[#21d8ff]/5 border border-[#21d8ff]/20" data-testid={`card-pathway-${i}`}>
                                <p className="font-semibold text-[10px] text-[#21d8ff]">{peptide.name ?? "Unknown"}</p>
                                <p className="text-[9px] text-muted-foreground">{peptide.pathway ?? ""}</p>
                              </div>
                            ))}
                          </div>

                          {/* Benefits */}
                          <div className="space-y-1.5" data-testid="section-benefits">
                            <p className="text-[10px] font-semibold text-[#22c55e] uppercase">Synergy Benefits</p>
                            {benefits.slice(0, 3).map((benefit, i) => (
                              <div key={i} className="flex items-start gap-1.5 p-1.5 rounded bg-[#22c55e]/5 border border-[#22c55e]/20" data-testid={`card-benefit-${i}`}>
                                <Check className="h-2.5 w-2.5 text-[#22c55e] mt-0.5 shrink-0" />
                                <p className="text-[9px] text-gray-300">{benefit}</p>
                              </div>
                            ))}
                          </div>

                          {/* Best For */}
                          <div className="space-y-1.5" data-testid="section-best-for">
                            <p className="text-[10px] font-semibold text-[#E7FB10] uppercase">Best For</p>
                            <div className="flex flex-wrap gap-1">
                              {bestFor.map((area, i) => (
                                <Badge 
                                  key={i}
                                  variant="outline"
                                  className="text-[9px] px-1.5 py-0 border-[#E7FB10]/30 text-[#E7FB10] bg-[#E7FB10]/5"
                                  data-testid={`badge-best-for-${i}`}
                                >
                                  {area}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="px-3 py-1.5 bg-[#0d0d10]/50 border-t border-[#2a2a32]">
                          <p className="text-[8px] text-muted-foreground text-center italic">
                            Research reference only
                          </p>
                        </div>
                      </Card>
                    );
                  })() : (
                    <Card className="p-4 border-[#a855f7]/30 bg-gradient-to-br from-[#a855f7]/5 to-transparent">
                      <div className="flex items-start gap-2">
                        <Brain className="h-4 w-4 text-[#a855f7] mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-300">{String(synergyAnalysis)}</p>
                          <p className="text-[9px] text-muted-foreground mt-2 italic">Research reference only</p>
                        </div>
                      </div>
                    </Card>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
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

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/30 mb-4">
            <Layers className="h-4 w-4 text-[#a855f7]" />
            <span className="text-sm font-medium text-[#a855f7]">Multi-Compound Research</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4" data-testid="heading-research-stacks">
            Research Stacks
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Curated multi-compound combinations designed for synergistic pathway research. 
            Each stack features complementary peptides for comprehensive mechanism studies.
          </p>
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

