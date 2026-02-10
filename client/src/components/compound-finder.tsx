import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb,
  ArrowLeft,
  ArrowRight,
  Flame,
  Heart,
  Brain,
  Sparkles,
  Dumbbell,
  Moon,
  Shield,
  Leaf,
  FlaskConical,
  Beaker,
  Target,
  RotateCcw,
  ShoppingCart,
  ChevronRight,
  Zap,
  Clock,
} from "lucide-react";
import type { Product } from "@shared/schema";
import { getPairingReasons } from "@/lib/pairing-intelligence";

interface CompoundFinderProps {
  products: Product[];
  onAddToCart?: (product: Product) => void;
}

type ResearchGoal = "healing" | "cognitive" | "longevity" | "performance" | "skin" | "immune" | "metabolic" | "sleep";
type ExperienceLevel = "new" | "some" | "experienced";
type FormatPref = "individual" | "stacks" | "unsure";
type BudgetRange = "under50" | "50to100" | "100to200" | "over200";

interface QuizAnswers {
  goal?: ResearchGoal;
  experience?: ExperienceLevel;
  format?: FormatPref;
  budget?: BudgetRange;
}

const goalOptions: { value: ResearchGoal; label: string; subtitle: string; icon: typeof Heart }[] = [
  { value: "healing", label: "Healing & Recovery", subtitle: "Tissue repair, injury recovery", icon: Heart },
  { value: "cognitive", label: "Cognitive Enhancement", subtitle: "Focus, memory, mental clarity", icon: Brain },
  { value: "longevity", label: "Anti-Aging & Longevity", subtitle: "Slow aging, cellular health", icon: Sparkles },
  { value: "performance", label: "Muscle & Performance", subtitle: "Growth, strength, endurance", icon: Dumbbell },
  { value: "skin", label: "Skin & Regeneration", subtitle: "Collagen, skin health, repair", icon: Leaf },
  { value: "immune", label: "Immune Support", subtitle: "Immune function, defense", icon: Shield },
  { value: "metabolic", label: "Fat Loss & Metabolism", subtitle: "Metabolic health, weight management", icon: Flame },
  { value: "sleep", label: "Sleep & Relaxation", subtitle: "Better sleep, reduce stress", icon: Moon },
];

const experienceOptions: { value: ExperienceLevel; label: string; subtitle: string }[] = [
  { value: "new", label: "New to Peptide Research", subtitle: "Just starting to explore" },
  { value: "some", label: "Some Familiarity", subtitle: "I've read about a few compounds" },
  { value: "experienced", label: "Experienced Researcher", subtitle: "I know what I'm looking for" },
];

const formatOptions: { value: FormatPref; label: string; subtitle: string }[] = [
  { value: "individual", label: "Individual Compounds", subtitle: "Start with a single compound" },
  { value: "stacks", label: "Research Stacks", subtitle: "Pre-built combinations for synergy" },
  { value: "unsure", label: "Not Sure Yet", subtitle: "Show me both options" },
];

const budgetOptions: { value: BudgetRange; label: string }[] = [
  { value: "under50", label: "Under $50" },
  { value: "50to100", label: "$50 – $100" },
  { value: "100to200", label: "$100 – $200" },
  { value: "over200", label: "$200+" },
];

const goalToCompounds: Record<ResearchGoal, string[]> = {
  healing: ["BPC-157", "TB-500", "GHK-Cu", "KPV", "KLOW Peptide Complex"],
  cognitive: ["Semax", "Selank", "Cerebrolysin", "DSIP", "Pinealon"],
  longevity: ["Epithalon", "GHK-Cu", "MOTS-c", "NAD+ Precursor", "Thymalin", "FOXO4-DRI"],
  performance: ["CJC-1295 w/ DAC", "CJC-1295 (No DAC)", "Ipamorelin", "IGF-1 LR3", "Sermorelin", "Tesamorelin", "MGF"],
  skin: ["GHK-Cu", "GLOW Peptide Complex", "Snap-8", "BPC-157", "Hyaluronic Acid"],
  immune: ["Thymosin Alpha-1", "LL-37", "Thymalin"],
  metabolic: ["RR-A3", "AOD-9604", "5-Amino-1MQ", "MOTS-c", "Mazdutide", "Survodutide", "Cagrilintide"],
  sleep: ["DSIP", "Melatonin", "Epithalon", "Selank"],
};

function getRecommendations(answers: QuizAnswers, products: Product[]) {
  if (!answers.goal) return [];

  const targetNames = goalToCompounds[answers.goal] || [];
  let candidates = products.filter(p =>
    targetNames.some(name => p.name.toLowerCase() === name.toLowerCase()) &&
    p.category !== "Supplies"
  );

  if (answers.budget) {
    const maxPrice: Record<BudgetRange, number> = {
      under50: 50,
      "50to100": 100,
      "100to200": 200,
      over200: Infinity,
    };
    const limit = maxPrice[answers.budget];
    const filtered = candidates.filter(p => Number(p.price) <= limit);
    if (filtered.length >= 2) candidates = filtered;
  }

  if (answers.format === "individual") {
    candidates = candidates.filter(p => p.category !== "Research Stacks");
  } else if (answers.format === "stacks") {
    const stacks = candidates.filter(p => p.category === "Research Stacks");
    if (stacks.length > 0) {
      candidates = [...stacks, ...candidates.filter(p => p.category !== "Research Stacks")];
    }
  }

  if (answers.experience === "new") {
    const beginner = ["BPC-157", "GHK-Cu", "Ipamorelin", "Selank", "MOTS-c", "Melatonin", "Epithalon", "AOD-9604", "RR-A3"];
    candidates.sort((a, b) => {
      const aB = beginner.includes(a.name) ? 0 : 1;
      const bB = beginner.includes(b.name) ? 0 : 1;
      return aB - bB;
    });
  }

  const inStock = candidates.filter(p => p.inStock);
  const outOfStock = candidates.filter(p => !p.inStock);

  return [...inStock, ...outOfStock].slice(0, 3);
}

function getWhyText(goal: ResearchGoal, productName: string): string {
  const reasons: Record<string, Record<string, string>> = {
    healing: {
      "BPC-157": "One of the most studied tissue repair peptides — great starting point for regenerative research.",
      "TB-500": "Extensively studied for wound healing and tissue repair through thymosin beta-4 pathways.",
      "GHK-Cu": "Copper peptide complex studied for collagen synthesis and tissue remodeling.",
      "KPV": "Tripeptide studied for anti-inflammatory properties and gut lining repair.",
      "KLOW Peptide Complex": "Quad-peptide stack combining BPC-157, TB-500, GHK-Cu, and KPV for comprehensive repair research.",
    },
    cognitive: {
      "Semax": "Derived from ACTH — studied for BDNF upregulation and cognitive enhancement.",
      "Selank": "Tuftsin analog studied for anxiolytic and nootropic effects in neuroscience.",
      "Cerebrolysin": "Neurotrophic peptide preparation studied for neuroprotective properties.",
      "DSIP": "Delta Sleep-Inducing Peptide studied for sleep regulation and stress response.",
      "Pinealon": "Tripeptide studied for pineal gland function and circadian rhythm support.",
    },
    longevity: {
      "Epithalon": "Tetrapeptide studied for telomerase activation — a cornerstone of longevity research.",
      "GHK-Cu": "Copper peptide studied for DNA repair gene activation and cellular regeneration.",
      "MOTS-c": "Mitochondrial-derived peptide studied for metabolic regulation and cellular energy.",
      "NAD+ Precursor": "Critical coenzyme studied for cellular energy production and aging pathways.",
      "Thymalin": "Thymic polypeptide studied for immune system modulation and aging.",
      "FOXO4-DRI": "Cell-penetrating peptide studied for senescent cell clearance research.",
    },
    performance: {
      "CJC-1295 w/ DAC": "GHRH analog with extended half-life for sustained GH release research.",
      "CJC-1295 (No DAC)": "GHRH analog for pulsatile GH release pattern studies.",
      "Ipamorelin": "Selective GH secretagogue — well-tolerated and widely studied.",
      "IGF-1 LR3": "Modified IGF-1 with extended half-life for growth factor research.",
      "Sermorelin": "GHRH analog for pituitary GH secretion studies.",
      "Tesamorelin": "GHRH analog studied for body composition and metabolic parameters.",
      "MGF": "IGF-1 splice variant for muscle damage response research.",
    },
    skin: {
      "GHK-Cu": "Premier copper peptide studied for collagen synthesis and skin remodeling.",
      "GLOW Peptide Complex": "Multi-peptide blend formulated for skin regeneration research.",
      "Snap-8": "Octapeptide studied for SNARE complex modulation and expression line reduction.",
      "BPC-157": "Studied for wound healing and tissue repair that supports skin recovery.",
      "Hyaluronic Acid": "Glycosaminoglycan studied for tissue hydration and wound healing.",
    },
    immune: {
      "Thymosin Alpha-1": "Thymic peptide studied for T-cell mediated immune response enhancement.",
      "LL-37": "Human cathelicidin studied for innate immunity and antimicrobial defense.",
      "Thymalin": "Thymic polypeptide studied for immune system modulation.",
    },
    metabolic: {
      "RR-A3": "Triple-agonist targeting multiple metabolic receptors simultaneously.",
      "AOD-9604": "HGH fragment studied for lipolytic pathway interactions.",
      "5-Amino-1MQ": "Small molecule studied for NNMT enzyme interactions in metabolic research.",
      "MOTS-c": "Mitochondrial peptide studied for metabolic regulation and AMPK activation.",
      "Mazdutide": "Dual metabolic receptor agonist for synergistic metabolic research.",
      "Survodutide": "Dual metabolic receptor agonist studied for metabolic effects.",
      "Cagrilintide": "Long-acting amylin analog for appetite and glucose metabolism research.",
    },
    sleep: {
      "DSIP": "Delta Sleep-Inducing Peptide — directly studied for somnogenic effects.",
      "Melatonin": "Indoleamine hormone central to circadian rhythm and sleep research.",
      "Epithalon": "Tetrapeptide studied for its effects on pineal gland melatonin production.",
      "Selank": "Tuftsin analog with anxiolytic properties that may support relaxation.",
    },
  };

  return reasons[goal]?.[productName] || "Matched to your research goals based on published study areas.";
}

export function CompoundFinder({ products, onAddToCart }: CompoundFinderProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const totalSteps = 4;

  const recommendations = useMemo(() => {
    if (step < totalSteps) return [];
    return getRecommendations(answers, products);
  }, [step, answers, products]);

  const reset = () => {
    setStep(0);
    setAnswers({});
  };

  if (step === 0) {
    return (
      <Card className="border-[#21d8ff]/30 bg-gradient-to-br from-[#21d8ff]/5 via-[#E7FB10]/3 to-transparent" data-testid="compound-finder-intro">
        <CardContent className="p-6 sm:p-8 text-center">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-[#21d8ff]/20 to-[#E7FB10]/10 mb-5">
            <Lightbulb className="h-8 w-8 text-[#21d8ff]" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.02em" }}>
            Find Your Ideal Compound
          </h3>
          <p className="text-sm text-muted-foreground mb-1 max-w-md mx-auto">
            Answer 4 quick questions to get personalized compound recommendations based on your research goals.
          </p>
          <p className="text-xs text-muted-foreground mb-6 flex items-center justify-center gap-1">
            <Clock className="h-3 w-3" />
            Takes less than 1 minute
          </p>
          <Button
            onClick={() => setStep(1)}
            className="bg-[#21d8ff] text-black font-semibold px-8"
            data-testid="button-start-finder"
          >
            Get Started
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step <= totalSteps) {
    return (
      <Card className="border-[#21d8ff]/30 bg-gradient-to-br from-[#21d8ff]/5 via-transparent to-transparent" data-testid="compound-finder-questions">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              className="flex items-center gap-1 text-sm text-muted-foreground"
              data-testid="button-finder-back"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i < step ? "w-6 bg-[#21d8ff]" : i === step ? "w-6 bg-[#21d8ff]/40" : "w-4 bg-muted/30"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{step}/{totalSteps}</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && (
                <div>
                  <h3 className="text-lg font-semibold mb-1">What's your primary research goal?</h3>
                  <p className="text-sm text-muted-foreground mb-4">Choose the main area you're looking to explore</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {goalOptions.map((opt) => {
                      const Icon = opt.icon;
                      const selected = answers.goal === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setAnswers(prev => ({ ...prev, goal: opt.value }));
                            setTimeout(() => setStep(2), 200);
                          }}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                            selected
                              ? "border-[#21d8ff]/60 bg-[#21d8ff]/10"
                              : "border-muted/20 bg-muted/5 hover-elevate"
                          }`}
                          data-testid={`finder-goal-${opt.value}`}
                        >
                          <div className={`p-2 rounded-lg ${selected ? "bg-[#21d8ff]/20" : "bg-muted/20"}`}>
                            <Icon className={`h-4 w-4 ${selected ? "text-[#21d8ff]" : "text-muted-foreground"}`} />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{opt.label}</p>
                            <p className="text-xs text-muted-foreground">{opt.subtitle}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h3 className="text-lg font-semibold mb-1">What's your experience level?</h3>
                  <p className="text-sm text-muted-foreground mb-4">This helps us tailor our recommendations</p>
                  <div className="space-y-2">
                    {experienceOptions.map((opt) => {
                      const selected = answers.experience === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setAnswers(prev => ({ ...prev, experience: opt.value }));
                            setTimeout(() => setStep(3), 200);
                          }}
                          className={`flex items-center gap-3 p-3 rounded-xl border w-full text-left transition-all ${
                            selected
                              ? "border-[#21d8ff]/60 bg-[#21d8ff]/10"
                              : "border-muted/20 bg-muted/5 hover-elevate"
                          }`}
                          data-testid={`finder-exp-${opt.value}`}
                        >
                          <div className={`p-2 rounded-lg ${selected ? "bg-[#21d8ff]/20" : "bg-muted/20"}`}>
                            <FlaskConical className={`h-4 w-4 ${selected ? "text-[#21d8ff]" : "text-muted-foreground"}`} />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{opt.label}</p>
                            <p className="text-xs text-muted-foreground">{opt.subtitle}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h3 className="text-lg font-semibold mb-1">Individual or stacks?</h3>
                  <p className="text-sm text-muted-foreground mb-4">Would you prefer a single compound or a combination?</p>
                  <div className="space-y-2">
                    {formatOptions.map((opt) => {
                      const selected = answers.format === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setAnswers(prev => ({ ...prev, format: opt.value }));
                            setTimeout(() => setStep(4), 200);
                          }}
                          className={`flex items-center gap-3 p-3 rounded-xl border w-full text-left transition-all ${
                            selected
                              ? "border-[#21d8ff]/60 bg-[#21d8ff]/10"
                              : "border-muted/20 bg-muted/5 hover-elevate"
                          }`}
                          data-testid={`finder-format-${opt.value}`}
                        >
                          <div className={`p-2 rounded-lg ${selected ? "bg-[#21d8ff]/20" : "bg-muted/20"}`}>
                            <Target className={`h-4 w-4 ${selected ? "text-[#21d8ff]" : "text-muted-foreground"}`} />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{opt.label}</p>
                            <p className="text-xs text-muted-foreground">{opt.subtitle}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <h3 className="text-lg font-semibold mb-1">What's your budget range?</h3>
                  <p className="text-sm text-muted-foreground mb-4">We'll match compounds within your range</p>
                  <div className="grid grid-cols-2 gap-2">
                    {budgetOptions.map((opt) => {
                      const selected = answers.budget === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setAnswers(prev => ({ ...prev, budget: opt.value }));
                            setTimeout(() => setStep(totalSteps + 1), 200);
                          }}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            selected
                              ? "border-[#21d8ff]/60 bg-[#21d8ff]/10"
                              : "border-muted/20 bg-muted/5 hover-elevate"
                          }`}
                          data-testid={`finder-budget-${opt.value}`}
                        >
                          <p className="font-medium text-sm">{opt.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    );
  }

  const goalLabel = goalOptions.find(g => g.value === answers.goal)?.label || "";

  return (
    <Card className="border-[#21d8ff]/30 bg-gradient-to-br from-[#21d8ff]/5 via-transparent to-transparent" data-testid="compound-finder-results">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#E7FB10]" />
              Your Recommendations
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Based on: {goalLabel}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={reset} data-testid="button-retake-finder">
            <RotateCcw className="h-4 w-4 mr-1" />
            Retake
          </Button>
        </div>

        {recommendations.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground text-sm">No exact matches found for your criteria. Try adjusting your budget or format preference.</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={reset} data-testid="button-try-again">
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className={`flex items-start gap-3 p-3 rounded-xl border ${
                  product.inStock ? "border-muted/20 bg-muted/5" : "border-muted/10 bg-muted/5 opacity-60"
                }`}>
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#21d8ff]/10 text-[#21d8ff] font-bold text-sm shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{product.name}</p>
                      {!product.inStock && (
                        <Badge variant="outline" className="text-[10px] text-red-400 border-red-400/30">
                          Out of Stock
                        </Badge>
                      )}
                      {product.inStock && idx === 0 && (
                        <Badge className="bg-[#E7FB10]/20 text-[#E7FB10] border-[#E7FB10]/30 text-[10px]">
                          Top Pick
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {answers.goal && getWhyText(answers.goal, product.name)}
                    </p>
                    {(() => {
                      const topPairing = getPairingReasons(product.name).slice(0, 1);
                      if (topPairing.length === 0) return null;
                      return (
                        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-[#22c55e]/80" data-testid={`text-finder-pairing-${product.id}`}>
                          <Zap className="h-3 w-3 text-[#22c55e]" />
                          <span>Pairs with {topPairing[0].partner}: {topPairing[0].mechanism}</span>
                        </div>
                      );
                    })()}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm font-semibold text-[#21d8ff]">
                        ${Number(product.price).toFixed(2)}
                      </span>
                      <Link href={`/product/${product.id}`}>
                        <Button variant="ghost" size="sm" className="text-xs h-7 px-2" data-testid={`button-view-${product.id}`}>
                          View Details
                          <ChevronRight className="h-3 w-3 ml-0.5" />
                        </Button>
                      </Link>
                      {product.inStock && onAddToCart && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 px-2 border-[#21d8ff]/30 text-[#21d8ff]"
                          onClick={() => onAddToCart(product)}
                          data-testid={`button-add-cart-${product.id}`}
                        >
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            <div className="pt-2 border-t border-muted/10">
              <Link href="/products">
                <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" data-testid="button-browse-all">
                  Browse All Compounds
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
