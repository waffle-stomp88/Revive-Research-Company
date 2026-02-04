import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Layers, 
  Sparkles, 
  Zap, 
  Crown,
  Percent,
  Brain,
  Activity,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { KNOWN_STACKS } from "@/lib/synergy-data";

const featuredStacks = [
  KNOWN_STACKS.find(s => s.name === "Wolverine Stack")!,
  KNOWN_STACKS.find(s => s.name === "Cognitive Edge")!,
  KNOWN_STACKS.find(s => s.name === "GH Amplifier")!,
];

const synergyTiers = [
  { 
    level: 50, 
    label: "Basic", 
    description: "Individual benefits",
    color: "#6b7280",
    bgColor: "rgba(107, 114, 128, 0.15)"
  },
  { 
    level: 75, 
    label: "Good", 
    description: "Some shared pathways",
    color: "#21d8ff",
    bgColor: "rgba(33, 216, 255, 0.15)"
  },
  { 
    level: 85, 
    label: "Great", 
    description: "Complementary mechanisms",
    color: "#22c55e",
    bgColor: "rgba(34, 197, 94, 0.15)"
  },
  { 
    level: 95, 
    label: "Legendary", 
    description: "Research-proven synergy",
    color: "#E7FB10",
    bgColor: "rgba(231, 251, 16, 0.15)",
    highlight: true
  },
];

function SynergyBarGraph({ isInView }: { isInView: boolean }) {
  return (
    <div className="space-y-4 w-full max-w-sm mx-auto" data-testid="synergy-bar-graph">
      {synergyTiers.map((tier, index) => (
        <motion.div
          key={tier.label}
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.3 + index * 0.15, duration: 0.5 }}
          className="relative"
          data-testid={`bar-tier-${tier.label.toLowerCase()}`}
        >
          <div className="flex items-center gap-3 mb-1">
            <span 
              className="text-sm font-semibold w-20"
              style={{ color: tier.color }}
              data-testid={`text-tier-label-${tier.label.toLowerCase()}`}
            >
              {tier.label}
            </span>
            <span className="text-xs text-muted-foreground" data-testid={`text-tier-percent-${tier.label.toLowerCase()}`}>
              {tier.level}%
            </span>
          </div>
          
          <div className="relative h-8 rounded-md overflow-hidden" style={{ backgroundColor: tier.bgColor }}>
            <motion.div
              className="absolute inset-y-0 left-0 rounded-md"
              style={{ 
                backgroundColor: tier.color,
                boxShadow: tier.highlight ? `0 0 20px ${tier.color}60` : undefined
              }}
              initial={{ width: 0 }}
              animate={isInView ? { width: `${tier.level}%` } : { width: 0 }}
              transition={{ 
                delay: 0.5 + index * 0.2, 
                duration: 1,
                ease: "easeOut"
              }}
            />
            
            {tier.highlight && (
              <motion.div
                className="absolute inset-y-0 left-0 rounded-md bg-gradient-to-r from-transparent via-white/60 to-transparent"
                initial={{ x: "-100%" }}
                animate={isInView ? { x: "300%" } : { x: "-100%" }}
                transition={{
                  delay: 1.5,
                  duration: 1,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: "easeInOut"
                }}
                style={{ width: "40%" }}
              />
            )}
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1 + index * 0.15, duration: 0.4 }}
            className="flex items-center gap-2 mt-1"
          >
            <TrendingUp className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground" data-testid={`text-tier-desc-${tier.label.toLowerCase()}`}>
              {tier.description}
            </span>
          </motion.div>
        </motion.div>
      ))}
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 2, duration: 0.5 }}
        className="pt-4 text-center"
      >
        <Badge className="bg-[#E7FB10]/20 text-[#E7FB10] border-[#E7FB10]/40" data-testid="badge-wolverine-stack">
          <Zap className="h-3 w-3 mr-1" />
          Wolverine Stack = 95% Synergy
        </Badge>
      </motion.div>
    </div>
  );
}

export function StackBuilderTeaser() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="py-10 md:py-24 relative overflow-hidden" data-testid="section-stack-builder">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-[#22c55e]/5 to-background" />
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#22c55e]/10 rounded-full blur-[120px] hidden md:block"
          animate={{ 
            opacity: [0.1, 0.2, 0.1],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#E7FB10]/8 rounded-full blur-[100px] hidden md:block"
          animate={{ 
            opacity: [0.08, 0.15, 0.08],
            scale: [1.1, 1, 1.1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-6 md:mb-12"
        >
          <Badge className="bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/30 mb-3 md:mb-4" data-testid="pill-stack-builder">
            <Layers className="h-3 w-3 mr-1" />
            Custom Stack Builder
          </Badge>
          <h2 className="font-display text-2xl md:text-5xl font-bold mb-2 md:mb-4" data-testid="text-stack-builder-heading">
            Build Your <span className="text-[#22c55e]">Research Stack</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-lg" data-testid="text-stack-builder-description">
            Combine 2-4 peptides and see real-time synergy scores based on documented research pathways.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-12 items-center">
          {/* Left - Synergy Bar Graph (hidden on mobile) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative hidden md:block"
            data-testid="card-synergy-preview"
          >
            <div className="py-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-6 text-center" data-testid="text-synergy-levels-label">
                Synergy Level Scale
              </p>
              <SynergyBarGraph isInView={isInView} />

              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <div className="text-center" data-testid="card-feature-ai">
                  <div className="w-10 h-10 mx-auto rounded-lg bg-[#ec4899]/10 border border-[#ec4899]/20 flex items-center justify-center mb-2">
                    <Sparkles className="h-4 w-4 text-[#ec4899]" />
                  </div>
                  <p className="text-xs text-muted-foreground" data-testid="text-feature-ai">AI Analysis</p>
                </div>
                <div className="text-center" data-testid="card-feature-pathway">
                  <div className="w-10 h-10 mx-auto rounded-lg bg-[#21d8ff]/10 border border-[#21d8ff]/20 flex items-center justify-center mb-2">
                    <Activity className="h-4 w-4 text-[#21d8ff]" />
                  </div>
                  <p className="text-xs text-muted-foreground" data-testid="text-feature-pathway">Pathway Map</p>
                </div>
                <div className="text-center" data-testid="card-feature-savings">
                  <div className="w-10 h-10 mx-auto rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center mb-2">
                    <Percent className="h-4 w-4 text-[#22c55e]" />
                  </div>
                  <p className="text-xs text-muted-foreground" data-testid="text-feature-savings">10% Savings</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right - Features (full width on mobile) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-4 md:space-y-6"
          >
            {/* Mobile: Compact badges in single row */}
            <div className="flex flex-wrap gap-2 mb-2 md:mb-4">
              <Badge className="bg-[#E7FB10]/20 text-[#E7FB10] border-[#E7FB10]/30 text-xs" data-testid="badge-legendary-stacks">
                <Crown className="h-3 w-3 mr-1" /> <span className="hidden sm:inline">9 </span>Legendary Stacks
              </Badge>
              <Badge className="bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30 text-xs" data-testid="badge-bundle-discount">
                <Percent className="h-3 w-3 mr-1" /> 10% Discount
              </Badge>
              <Badge className="bg-[#21d8ff]/20 text-[#21d8ff] border-[#21d8ff]/30 text-xs hidden sm:flex" data-testid="badge-ai-synergy">
                <Brain className="h-3 w-3 mr-1" /> AI Analysis
              </Badge>
            </div>

            <h3 className="font-display text-lg md:text-2xl font-bold" data-testid="text-discover-heading">
              Discover What Works Together
            </h3>
            <p className="text-muted-foreground text-sm md:text-base" data-testid="text-discover-description">
              Our stack builder shows you <span className="text-foreground">why</span> certain peptides complement each other — shared pathways and documented research combinations.
            </p>

            <div className="space-y-2 md:space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider" data-testid="text-examples-header">
                Popular Stacks
              </p>
              {/* Show only 2 on mobile, 3 on desktop */}
              {featuredStacks.slice(0, 2).map((stack, index) => {
                const Icon = stack.icon;
                return (
                  <motion.div
                    key={stack.name}
                    initial={{ opacity: 0, x: 10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.5 + index * 0.08, duration: 0.4 }}
                    className="flex items-center gap-3 p-2 md:p-3 rounded-lg bg-white/5 border border-white/10"
                    data-testid={`card-stack-${stack.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div 
                      className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${stack.color}15`, border: `1px solid ${stack.color}30` }}
                    >
                      <Icon className="h-4 w-4 md:h-5 md:w-5" style={{ color: stack.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm md:text-base" data-testid={`text-stack-name-${index}`}>{stack.name}</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="shrink-0 text-xs"
                      style={{ borderColor: `${stack.color}50`, color: stack.color }}
                      data-testid={`badge-stack-count-${index}`}
                    >
                      {stack.peptides.length} peptides
                    </Badge>
                  </motion.div>
                );
              })}
              {/* Third stack only on desktop */}
              {featuredStacks[2] && (() => {
                const thirdStack = featuredStacks[2];
                const ThirdIcon = thirdStack.icon;
                return (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.66, duration: 0.4 }}
                    className="hidden md:flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                    data-testid={`card-stack-${thirdStack.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${thirdStack.color}15`, border: `1px solid ${thirdStack.color}30` }}
                    >
                      <ThirdIcon className="h-5 w-5" style={{ color: thirdStack.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium" data-testid="text-stack-name-2">{thirdStack.name}</span>
                      <span className="text-sm text-muted-foreground ml-2" data-testid="text-stack-synergy-2">— {thirdStack.synergyBonus}% synergy</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="shrink-0"
                      style={{ borderColor: `${thirdStack.color}50`, color: thirdStack.color }}
                      data-testid="badge-stack-count-2"
                    >
                      {thirdStack.peptides.length} peptides
                    </Badge>
                  </motion.div>
                );
              })()}
              <motion.p 
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 1, duration: 0.5 }}
                className="text-xs md:text-sm text-muted-foreground text-center pt-1 md:pt-2"
                data-testid="text-more-stacks"
              >
                +{KNOWN_STACKS.length - 2} more stacks to discover
              </motion.p>
            </div>
          </motion.div>
        </div>

        {/* Centered CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-8 md:mt-12 text-center"
        >
          <Link href="/research-stacks?tab=custom" onClick={() => trackEvent('stack_builder_cta_click', 'engagement', 'homepage')} data-testid="link-build-stack">
            <motion.div 
              className="inline-block relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {/* Pulsing glow behind button */}
              <motion.div
                className="absolute inset-0 rounded-md bg-[#21d8ff]/50 blur-xl pointer-events-none"
                animate={{
                  opacity: [0.5, 0.9, 0.5],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <Button 
                size="lg"
                className="relative font-display gap-2 md:gap-3 bg-gradient-to-r from-[#21d8ff] to-[#0ea5e9] border border-[#21d8ff] text-black shadow-lg shadow-[#21d8ff]/40 text-sm md:text-base"
                data-testid="button-build-stack"
              >
                <Sparkles className="h-4 w-4 md:h-5 md:w-5" />
                Build Your Stack
                <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
