import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { KNOWN_STACKS } from "@/lib/synergy-data";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Layers, 
  Sparkles, 
  Zap, 
  Crown,
  Brain,
  Activity,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { useHoverCapable, hoverIf } from "@/hooks/use-hover-capable";

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
    color: "#D4FF1F",
    bgColor: "rgba(212, 255, 31, 0.15)",
    highlight: true
  },
];

function SynergyBarGraph({ isInView, extraStacks }: { isInView: boolean; extraStacks: number }) {
  return (
    <div className="space-y-3 md:space-y-4 w-full max-w-md mx-auto" data-testid="synergy-bar-graph">
      {synergyTiers.map((tier, index) => (
        <motion.div
          key={tier.label}
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.3 + index * 0.15, duration: 0.5 }}
          className="relative"
          data-testid={`bar-tier-${tier.label.toLowerCase()}`}
        >
          <div className="flex items-center gap-2 md:gap-3 mb-1">
            <span 
              className="text-xs md:text-sm font-semibold w-16 md:w-20"
              style={{ color: tier.color }}
              data-testid={`text-tier-label-${tier.label.toLowerCase()}`}
            >
              {tier.label}
            </span>
            <span className="text-[10px] md:text-xs text-muted-foreground" data-testid={`text-tier-percent-${tier.label.toLowerCase()}`}>
              {tier.level}%
            </span>
          </div>
          
          <div className="relative h-6 md:h-8 rounded-md overflow-hidden" style={{ backgroundColor: tier.bgColor }}>
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
            className="flex items-center gap-1 md:gap-2 mt-1"
          >
            <TrendingUp className="h-2.5 w-2.5 md:h-3 md:w-3 text-muted-foreground" />
            <span className="text-[10px] md:text-xs text-muted-foreground" data-testid={`text-tier-desc-${tier.label.toLowerCase()}`}>
              {tier.description}
            </span>
          </motion.div>
        </motion.div>
      ))}
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 2, duration: 0.5 }}
        className="pt-3 md:pt-4 text-center"
      >
        <Badge className="bg-[#D4FF1F]/20 text-[#D4FF1F] border-[#D4FF1F]/40 text-xs" data-testid="badge-wolverine-stack">
          <Zap className="h-3 w-3 mr-1" />
          Wolverine Stack = 95% Synergy
        </Badge>
        <p className="text-xs text-muted-foreground mt-3" data-testid="text-more-stacks">
          +{extraStacks} more stacks to discover
        </p>
      </motion.div>
    </div>
  );
}

export function StackBuilderTeaser() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const hoverCapable = useHoverCapable();
  const { data: stacksData } = useQuery<{ id: string }[]>({
    queryKey: ["/api/research-stacks"],
  });
  const knownStacksCount = KNOWN_STACKS.length;
  const extraStacks = Math.max(0, knownStacksCount - 1);

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
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#D4FF1F]/8 rounded-full blur-[100px] hidden md:block"
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
          className="text-center mb-6 md:mb-10"
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

        {/* Feature Badges */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mb-6 md:mb-10"
        >
          <Badge className="bg-[#D4FF1F]/20 text-[#D4FF1F] border-[#D4FF1F]/30 text-xs" data-testid="badge-legendary-stacks">
            <Crown className="h-3 w-3 mr-1" /> {knownStacksCount} Known Stacks
          </Badge>
          <Badge className="bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30 text-xs" data-testid="badge-synergy-scores">
            <Activity className="h-3 w-3 mr-1" /> Synergy Scores
          </Badge>
          <Badge className="bg-[#21d8ff]/20 text-[#21d8ff] border-[#21d8ff]/30 text-xs" data-testid="badge-ai-synergy">
            <Brain className="h-3 w-3 mr-1" /> AI Analysis
          </Badge>
          <Badge className="bg-[#ec4899]/20 text-[#ec4899] border-[#ec4899]/30 text-xs" data-testid="badge-pathway-map">
            <Sparkles className="h-3 w-3 mr-1" /> Pathway Map
          </Badge>
        </motion.div>

        {/* Centered Synergy Bar Graph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="max-w-lg mx-auto"
          data-testid="card-synergy-preview"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4 md:mb-6 text-center" data-testid="text-synergy-levels-label">
            Synergy Level Scale
          </p>
          <SynergyBarGraph isInView={isInView} extraStacks={extraStacks} />
        </motion.div>

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
              whileHover={hoverIf(hoverCapable, { scale: 1.05 })}
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
