import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Layers, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Crown,
  Percent,
  Brain,
  Activity
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { KNOWN_STACKS } from "@/lib/synergy-data";

const featuredStacks = KNOWN_STACKS.slice(0, 4);

function SynergyRingPreview() {
  return (
    <div className="relative w-32 h-32 mx-auto" data-testid="synergy-ring-preview">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="rgba(231, 251, 16, 0.2)"
          strokeWidth="8"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="#22c55e"
          strokeWidth="8"
          strokeLinecap="round"
          initial={{ strokeDasharray: "0 264" }}
          animate={{ strokeDasharray: "250 264" }}
          transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
          style={{ filter: "drop-shadow(0 0 8px #22c55e)" }}
        />
      </svg>
      <motion.div 
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1.5 }}
      >
        <span 
          className="text-2xl font-bold text-[#22c55e]" 
          style={{ textShadow: "0 0 10px rgba(34, 197, 94, 0.5)" }}
          data-testid="text-synergy-percent"
        >
          95%
        </span>
      </motion.div>
    </div>
  );
}

export function StackBuilderTeaser() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="py-16 md:py-24 relative overflow-hidden" data-testid="section-stack-builder">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-[#E7FB10]/5 to-background" />
        <motion.div 
          className="absolute top-1/3 right-1/4 w-72 h-72 bg-[#E7FB10]/10 rounded-full blur-[100px]"
          animate={{ 
            opacity: [0.1, 0.25, 0.1],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-[#22c55e]/10 rounded-full blur-[80px]"
          animate={{ 
            opacity: [0.15, 0.3, 0.15],
            scale: [1.1, 1, 1.1]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="inline-flex flex-wrap items-center gap-2 px-4 py-2 rounded-full bg-[#E7FB10]/10 border border-[#E7FB10]/30 mb-4" data-testid="pill-stack-builder">
            <Layers className="h-4 w-4 text-[#E7FB10]" />
            <span className="text-sm font-medium text-[#E7FB10]" data-testid="text-stack-builder-label">Custom Stack Builder</span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4" data-testid="text-stack-builder-heading">
            Build Your <span className="text-[#E7FB10]">Research Stack</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg" data-testid="text-stack-builder-description">
            Combine 2-4 peptides and see real-time synergy scores based on documented research pathways. Unlock legendary combinations.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left - Visual Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Card className="p-6 md:p-8 border-2 border-[#E7FB10]/30 bg-gradient-to-br from-[#E7FB10]/5 to-transparent" data-testid="card-synergy-preview">
              <div className="text-center mb-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2" data-testid="text-live-preview-label">Live Synergy Preview</p>
                <SynergyRingPreview />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 2, duration: 0.5 }}
                  className="mt-4"
                >
                  <Badge className="bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30 gap-1" data-testid="badge-wolverine-stack">
                    <Zap className="h-3 w-3" />
                    Wolverine Stack Detected
                  </Badge>
                </motion.div>
              </div>

              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <Badge variant="outline" className="text-xs" data-testid="badge-peptide-bpc">BPC-157</Badge>
                <span className="text-muted-foreground" data-testid="text-peptide-separator">+</span>
                <Badge variant="outline" className="text-xs" data-testid="badge-peptide-tb">TB-500</Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-white/5 border border-white/10" data-testid="card-feature-ai">
                  <Sparkles className="h-5 w-5 mx-auto mb-1 text-[#ec4899]" />
                  <p className="text-xs text-muted-foreground" data-testid="text-feature-ai">AI Analysis</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10" data-testid="card-feature-pathway">
                  <Activity className="h-5 w-5 mx-auto mb-1 text-[#21d8ff]" />
                  <p className="text-xs text-muted-foreground" data-testid="text-feature-pathway">Pathway Map</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10" data-testid="card-feature-savings">
                  <Percent className="h-5 w-5 mx-auto mb-1 text-[#22c55e]" />
                  <p className="text-xs text-muted-foreground" data-testid="text-feature-savings">10% Savings</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Right - Features & CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-6"
          >
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="text-xs bg-[#E7FB10]/20 text-[#E7FB10] border-[#E7FB10]/30" data-testid="badge-legendary-stacks">
                <Crown className="h-3 w-3 mr-1" /> 9 Legendary Stacks
              </Badge>
              <Badge className="text-xs bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30" data-testid="badge-bundle-discount">
                <Percent className="h-3 w-3 mr-1" /> 10% Bundle Discount
              </Badge>
              <Badge className="text-xs bg-[#21d8ff]/20 text-[#21d8ff] border-[#21d8ff]/30" data-testid="badge-ai-synergy">
                <Brain className="h-3 w-3 mr-1" /> AI Synergy Analysis
              </Badge>
            </div>

            <h3 className="font-display text-xl md:text-2xl font-bold" data-testid="text-discover-heading">
              Discover What Works Together
            </h3>
            <p className="text-muted-foreground" data-testid="text-discover-description">
              Our stack builder shows you <span className="text-foreground">why</span> certain peptides complement each other — shared pathways, complementary mechanisms, and documented research combinations.
            </p>

            <div className="space-y-3">
              {featuredStacks.slice(0, 3).map((stack, index) => {
                const Icon = stack.icon;
                return (
                  <motion.div
                    key={stack.name}
                    initial={{ opacity: 0, x: 10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                    className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                    data-testid={`card-stack-${stack.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${stack.color}20`, border: `1px solid ${stack.color}40` }}
                    >
                      <Icon className="h-4 w-4" style={{ color: stack.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm" data-testid={`text-stack-name-${index}`}>{stack.name}</span>
                      <span className="text-xs text-muted-foreground ml-2 hidden sm:inline" data-testid={`text-stack-synergy-${index}`}>— {stack.synergyBonus}% synergy</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="text-xs shrink-0"
                      style={{ borderColor: `${stack.color}50`, color: stack.color }}
                      data-testid={`badge-stack-count-${index}`}
                    >
                      {stack.peptides.length} peptides
                    </Badge>
                  </motion.div>
                );
              })}
            </div>

            <Link href="/research-stacks" onClick={() => trackEvent('stack_builder_cta_click', 'engagement', 'homepage')} data-testid="link-build-stack">
              <Button 
                size="lg"
                className="w-full sm:w-auto font-display gap-2 bg-[#E7FB10] text-black"
                data-testid="button-build-stack"
              >
                Build Your Stack
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
