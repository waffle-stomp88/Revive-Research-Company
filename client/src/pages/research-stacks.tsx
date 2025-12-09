import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Layers, FlaskConical, ArrowRight, Sparkles, Zap, Heart, Leaf, Star, Crown, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import productImage from "@assets/reta bottle_1764310671562.jpg";

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
  price: number;
  originalPrice: number;
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
    price: 89.99,
    originalPrice: 109.98,
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
    price: 299.99,
    originalPrice: 379.98,
  },
  {
    id: "cellular-optimization-stack",
    name: "Cellular Optimization Stack",
    subtitle: "Signal Pathway Combo",
    description: "Research cellular signaling pathways and copper peptide mechanisms. This stack is designed for studies on mitochondrial function, cellular longevity models, and signal transduction research.",
    peptides: ["GHK-Cu (100mg)", "MOTS-C"],
    icon: Sparkles,
    color: "#a855f7",
    price: 149.99,
    originalPrice: 189.98,
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
    price: 119.99,
    originalPrice: 149.98,
  },
  {
    id: "collagen-skin-stack",
    name: "Collagen & Skin Pathway Stack",
    subtitle: "Dermal Research Bundle",
    description: "Study collagen synthesis pathways and dermal tissue mechanisms. This combination targets complementary wound healing and structural protein research applications.",
    peptides: ["GHK-Cu", "BPC-157"],
    icon: Leaf,
    color: "#ec4899",
    price: 99.99,
    originalPrice: 129.98,
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
    price: 349.99,
    originalPrice: 449.97,
  },
];

export default function ResearchStacks() {
  const [hoveredStack, setHoveredStack] = useState<string | null>(null);

  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
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
            Each stack features complementary peptides for comprehensive mechanism studies.
          </p>
        </motion.div>

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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {researchStacks.map((stack, index) => {
            const Icon = stack.icon;
            const isHovered = hoveredStack === stack.id;
            const savings = Math.round(((stack.originalPrice - stack.price) / stack.originalPrice) * 100);

            return (
              <motion.div
                key={stack.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => setHoveredStack(stack.id)}
                onMouseLeave={() => setHoveredStack(null)}
              >
                <Card
                  className={`relative overflow-hidden h-full transition-all duration-300 ${
                    isHovered
                      ? "border-2 shadow-lg"
                      : "border border-[#2a2a32]"
                  }`}
                  style={{
                    borderColor: isHovered ? stack.color : undefined,
                    boxShadow: isHovered ? `0 0 30px ${stack.color}30` : undefined,
                  }}
                  data-testid={`card-stack-${stack.id}`}
                >
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
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        background: `radial-gradient(circle at 50% 100%, ${stack.color}40, transparent 70%)`,
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={{
                          scale: isHovered ? 1.1 : 1,
                          rotate: isHovered ? 5 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                        className="relative"
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
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold" style={{ color: stack.color }}>
                            ${stack.price.toFixed(2)}
                          </span>
                          <span className="text-sm text-muted-foreground line-through">
                            ${stack.originalPrice.toFixed(2)}
                          </span>
                        </div>
                        <Badge variant="outline" className="mt-1 border-green-500/50 text-green-500 text-xs">
                          Save {savings}%
                        </Badge>
                      </div>

                      <Link href={`/research-stacks/${stack.id}`}>
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
                      </Link>
                    </div>
                  </div>
                </Card>
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
      </div>
    </main>
  );
}
