import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SEOHead } from "@/components/seo-head";
import { CategoryTabs } from "@/components/category-tabs";
import { Layers, FlaskConical, ArrowRight, Sparkles, Zap, Heart, Leaf, Star, Crown, Shield, Plus, X, Check, ShoppingCart, Loader2, Beaker, Brain } from "lucide-react";
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

// Custom Stack Builder Component
function CustomStackBuilder({ onSwitchToPreBuilt }: { onSwitchToPreBuilt: () => void }) {
  const [selectedPeptides, setSelectedPeptides] = useState<Product[]>([]);
  const [synergyAnalysis, setSynergyAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const inStockPeptides = products?.filter(p => p.inStock && p.category?.toLowerCase() === "peptides") || [];

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
    if (selectedPeptides.length === 2) return 10;
    if (selectedPeptides.length === 3) return 12;
    if (selectedPeptides.length === 4) return 15;
    return 0;
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
      setIsAnalyzing(false);
    },
    onError: () => {
      setSynergyAnalysis("Unable to generate pathway analysis at this time. Please try again.");
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
    });

    // Reset
    setSelectedPeptides([]);
    setSynergyAnalysis(null);
  };

  return (
    <div className="space-y-8">
      {/* Selection Header */}
      <div className="text-center">
        <Badge className="mb-4 bg-[#21d8ff]/20 text-[#21d8ff] border-[#21d8ff]/30">
          <Beaker className="h-3 w-3 mr-1" />
          Select 2-4 Compounds
        </Badge>
        <p className="text-muted-foreground">
          Choose peptides to create your custom research bundle. Bundle discounts apply automatically.
        </p>
      </div>

      {/* Discount Tiers */}
      <div className="flex justify-center gap-4 flex-wrap">
        {[
          { count: 2, discount: 10 },
          { count: 3, discount: 12 },
          { count: 4, discount: 15 },
        ].map(tier => (
          <div
            key={tier.count}
            className={`px-4 py-2 rounded-lg border transition-all ${
              selectedPeptides.length === tier.count
                ? "border-[#E7FB10] bg-[#E7FB10]/10 text-[#E7FB10]"
                : "border-[#2a2a32] text-muted-foreground"
            }`}
          >
            <span className="font-medium">{tier.count} Peptides</span>
            <span className="ml-2 text-green-500">{tier.discount}% off</span>
          </div>
        ))}
      </div>

      {/* Selected Peptides Summary */}
      {selectedPeptides.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-[#1a1a1f] border border-[#21d8ff]/30"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#21d8ff]">Your Custom Stack</span>
            <Badge variant="outline" className="border-green-500/50 text-green-500">
              {getDiscount()}% Bundle Discount
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedPeptides.map(peptide => (
              <Badge
                key={peptide.id}
                className="bg-[#21d8ff]/20 text-[#21d8ff] pr-1 flex items-center gap-1"
              >
                {peptide.name}
                <button
                  onClick={() => togglePeptide(peptide)}
                  className="ml-1 p-0.5 rounded-full hover:bg-[#21d8ff]/30"
                  data-testid={`button-remove-peptide-${peptide.id}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">
                Retail: <span className="line-through">${getRetailTotal().toFixed(2)}</span>
              </div>
              <div className="text-xl font-bold text-[#E7FB10]">
                ${getBundlePrice().toFixed(2)}
                <span className="text-xs text-green-500 ml-2">Save ${getSavings().toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {selectedPeptides.length >= 2 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="border-[#a855f7] text-[#a855f7]"
                  data-testid="button-analyze-synergy"
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Brain className="h-4 w-4 mr-1" />
                  )}
                  Analyze Pathways
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleAddToCart}
                disabled={selectedPeptides.length < 2}
                className="bg-[#E7FB10] text-black hover:bg-[#E7FB10]/90"
                data-testid="button-add-custom-stack"
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Add to Cart
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* AI Synergy Analysis */}
      <AnimatePresence>
        {synergyAnalysis && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 border-[#a855f7]/30 bg-gradient-to-br from-[#a855f7]/5 to-transparent">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#a855f7]/20">
                  <Brain className="h-5 w-5 text-[#a855f7]" />
                </div>
                <div className="flex-1">
                  <h4 className="font-display font-bold text-[#a855f7] mb-2">Pathway Mechanism Analysis</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">{synergyAnalysis}</p>
                  <p className="text-xs text-muted-foreground mt-3 italic">
                    This analysis is for research reference only and describes known molecular pathway interactions from peer-reviewed literature.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Peptide Selection Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="aspect-square rounded-lg mb-3" />
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </Card>
          ))}
        </div>
      ) : inStockPeptides.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-[#2a2a32]">
          <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-display text-xl font-bold mb-2">No Peptides Available</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            All peptides are currently out of stock. Please check back soon or browse our pre-built stacks for available options.
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={onSwitchToPreBuilt}
          >
            View Pre-Built Stacks
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                  className={`p-4 cursor-pointer transition-all duration-200 relative ${
                    isSelected
                      ? "border-2 border-[#21d8ff] shadow-[0_0_20px_rgba(33,216,255,0.3)]"
                      : isDisabled
                      ? "opacity-50 cursor-not-allowed border-[#2a2a32]"
                      : "border-[#2a2a32] hover:border-[#21d8ff]/50"
                  }`}
                  data-testid={`card-select-peptide-${product.id}`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#21d8ff] flex items-center justify-center">
                      <Check className="h-4 w-4 text-black" />
                    </div>
                  )}
                  <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-lg mb-3 overflow-hidden">
                    <img
                      src={product.imageUrl || productImage}
                      alt={product.name}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <h3 className="font-display font-semibold text-sm mb-1">{product.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{product.shortDescription}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#E7FB10]">${product.price}</span>
                    {!isSelected && !isDisabled && (
                      <Badge variant="outline" className="text-xs border-[#21d8ff]/50 text-[#21d8ff]">
                        <Plus className="h-3 w-3 mr-1" />
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
              <CustomStackBuilder onSwitchToPreBuilt={() => setActiveTab("pre-built")} />
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

