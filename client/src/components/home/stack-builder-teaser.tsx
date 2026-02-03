import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
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

function FloatingParticle({ delay, duration, x, y, size }: { delay: number; duration: number; x: string; y: string; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-[#22c55e]"
      style={{ left: x, top: y, width: size, height: size }}
      animate={{
        opacity: [0, 0.6, 0],
        scale: [0.5, 1, 0.5],
        y: [0, -30, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
}

function SynergyRingPreview() {
  return (
    <div className="relative w-40 h-40 mx-auto" data-testid="synergy-ring-preview">
      <motion.div
        className="absolute inset-0 rounded-full bg-[#22c55e]/20 blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.svg 
        className="w-full h-full -rotate-90 relative z-10" 
        viewBox="0 0 100 100"
        animate={{ rotate: [-90, -90 + 360] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="rgba(34, 197, 94, 0.15)"
          strokeWidth="6"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="url(#synergyGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ strokeDasharray: "0 264" }}
          animate={{ strokeDasharray: "250 264" }}
          transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
          style={{ filter: "drop-shadow(0 0 12px #22c55e)" }}
        />
        <defs>
          <linearGradient id="synergyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
      </motion.svg>
      
      <motion.div 
        className="absolute inset-0 flex items-center justify-center z-20"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1.5 }}
      >
        <span 
          className="text-3xl font-bold text-[#22c55e]" 
          style={{ textShadow: "0 0 20px rgba(34, 197, 94, 0.6)" }}
          data-testid="text-synergy-percent"
        >
          95%
        </span>
      </motion.div>

      <FloatingParticle delay={0} duration={4} x="10%" y="20%" size={4} />
      <FloatingParticle delay={1} duration={5} x="80%" y="30%" size={3} />
      <FloatingParticle delay={2} duration={4.5} x="20%" y="70%" size={5} />
      <FloatingParticle delay={1.5} duration={3.5} x="75%" y="60%" size={4} />
    </div>
  );
}

export function StackBuilderTeaser() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="py-16 md:py-24 relative overflow-hidden" data-testid="section-stack-builder">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-[#22c55e]/5 to-background" />
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#22c55e]/10 rounded-full blur-[120px]"
          animate={{ 
            opacity: [0.1, 0.2, 0.1],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#E7FB10]/8 rounded-full blur-[100px]"
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
          className="text-center mb-12"
        >
          <Badge className="bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/30 mb-4" data-testid="pill-stack-builder">
            <Layers className="h-3 w-3 mr-1" />
            Custom Stack Builder
          </Badge>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4" data-testid="text-stack-builder-heading">
            Build Your <span className="text-[#22c55e]">Research Stack</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg" data-testid="text-stack-builder-description">
            Combine 2-4 peptides and see real-time synergy scores based on documented research pathways. Unlock legendary combinations.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Visual Preview (no boxy card) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative"
            data-testid="card-synergy-preview"
          >
            <div className="text-center py-8">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-6" data-testid="text-live-preview-label">Live Synergy Preview</p>
              <SynergyRingPreview />
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 2, duration: 0.5 }}
                className="mt-6"
              >
                <Badge className="bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/40" data-testid="badge-wolverine-stack">
                  <Zap className="h-3 w-3 mr-1" />
                  Wolverine Stack Detected
                </Badge>
              </motion.div>

              <div className="flex flex-wrap justify-center gap-3 mt-6">
                <Badge variant="outline" data-testid="badge-peptide-bpc">BPC-157</Badge>
                <span className="text-muted-foreground text-lg" data-testid="text-peptide-separator">+</span>
                <Badge variant="outline" data-testid="badge-peptide-tb">TB-500</Badge>
              </div>

              <div className="flex flex-wrap justify-center gap-6 mt-8">
                <div className="text-center" data-testid="card-feature-ai">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-[#ec4899]/10 border border-[#ec4899]/20 flex items-center justify-center mb-2">
                    <Sparkles className="h-5 w-5 text-[#ec4899]" />
                  </div>
                  <p className="text-xs text-muted-foreground" data-testid="text-feature-ai">AI Analysis</p>
                </div>
                <div className="text-center" data-testid="card-feature-pathway">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-[#21d8ff]/10 border border-[#21d8ff]/20 flex items-center justify-center mb-2">
                    <Activity className="h-5 w-5 text-[#21d8ff]" />
                  </div>
                  <p className="text-xs text-muted-foreground" data-testid="text-feature-pathway">Pathway Map</p>
                </div>
                <div className="text-center" data-testid="card-feature-savings">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center mb-2">
                    <Percent className="h-5 w-5 text-[#22c55e]" />
                  </div>
                  <p className="text-xs text-muted-foreground" data-testid="text-feature-savings">10% Savings</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right - Features */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-6"
          >
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-[#E7FB10]/20 text-[#E7FB10] border-[#E7FB10]/30" data-testid="badge-legendary-stacks">
                <Crown className="h-3 w-3 mr-1" /> 9 Legendary Stacks
              </Badge>
              <Badge className="bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30" data-testid="badge-bundle-discount">
                <Percent className="h-3 w-3 mr-1" /> 10% Bundle Discount
              </Badge>
              <Badge className="bg-[#21d8ff]/20 text-[#21d8ff] border-[#21d8ff]/30" data-testid="badge-ai-synergy">
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
                    className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover-elevate cursor-default"
                    data-testid={`card-stack-${stack.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${stack.color}15`, border: `1px solid ${stack.color}30` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: stack.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium" data-testid={`text-stack-name-${index}`}>{stack.name}</span>
                      <span className="text-sm text-muted-foreground ml-2 hidden sm:inline" data-testid={`text-stack-synergy-${index}`}>— {stack.synergyBonus}% synergy</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="shrink-0"
                      style={{ borderColor: `${stack.color}50`, color: stack.color }}
                      data-testid={`badge-stack-count-${index}`}
                    >
                      {stack.peptides.length} peptides
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Centered CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <Link href="/research-stacks" onClick={() => trackEvent('stack_builder_cta_click', 'engagement', 'homepage')} data-testid="link-build-stack">
            <Button 
              size="lg"
              className="font-display gap-2 bg-[#22c55e] border border-[#22c55e] text-white"
              data-testid="button-build-stack"
            >
              <Layers className="h-5 w-5" />
              Build Your Stack
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-3">
            Select 2-4 peptides and unlock synergy bonuses
          </p>
        </motion.div>
      </div>
    </section>
  );
}
