import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { 
  FlaskConical, 
  FileCheck, 
  Beaker, 
  Snowflake,
  DollarSign,
  Info
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const pricingFactors = [
  {
    id: "synthesis",
    label: "Synthesis",
    percentage: 35,
    icon: FlaskConical,
    color: "#D4FF1F",
    description: "Raw materials, amino acids, specialized equipment, and skilled technician time for solid-phase peptide synthesis.",
    details: ["High-grade amino acids", "Automated synthesis", "Sequence optimization"],
  },
  {
    id: "purity",
    label: "Purity & Purification",
    percentage: 25,
    icon: Beaker,
    color: "#9d4edd",
    description: "Achieving 98%+ purity requires multiple purification steps, HPLC processing, and careful quality control.",
    details: ["HPLC purification", "Multiple rounds", "98%+ target"],
  },
  {
    id: "testing",
    label: "Third-Party Testing",
    percentage: 20,
    icon: FileCheck,
    color: "#21d8ff",
    description: "Every batch sent to accredited labs for independent HPLC purity analysis and mass spectrometry verification.",
    details: ["Independent labs", "Mass spec verification", "COA generation"],
  },
  {
    id: "handling",
    label: "Stability & Handling",
    percentage: 15,
    icon: Snowflake,
    color: "#22c55e",
    description: "Proper lyophilization, temperature-controlled storage facilities, and discreet protective packaging for transit.",
    details: ["Lyophilization", "Cold storage", "Dry packaging"],
  },
  {
    id: "operations",
    label: "Operations",
    percentage: 5,
    icon: DollarSign,
    color: "#f97316",
    description: "Packaging, labeling, customer support, and business operations that keep everything running smoothly.",
    details: ["QR labeling", "Support team", "Secure packaging"],
  },
];

export function PricingBreakdownInfographic() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [activeFactor, setActiveFactor] = useState<string | null>(null);
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  return (
    <div ref={containerRef} className="relative">
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="relative bg-card border border-border/50 rounded-2xl p-6 overflow-hidden"
          >
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                background: "radial-gradient(circle at 30% 30%, #D4FF1F 0%, transparent 50%)",
              }}
            />

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-display text-lg font-bold">Cost Breakdown</h4>
                <span className="text-xs text-muted-foreground">per compound</span>
              </div>

              <div className="relative h-12 rounded-lg overflow-hidden bg-muted/30 mb-6">
                {pricingFactors.map((factor, index) => {
                  const prevPercentage = pricingFactors
                    .slice(0, index)
                    .reduce((sum, f) => sum + f.percentage, 0);
                  
                  return (
                    <motion.div
                      key={factor.id}
                      className="absolute top-0 bottom-0 cursor-pointer transition-all duration-300"
                      style={{
                        left: `${prevPercentage}%`,
                        width: `${factor.percentage}%`,
                        backgroundColor: factor.color,
                        opacity: hoveredBar && hoveredBar !== factor.id ? 0.4 : 1,
                        zIndex: hoveredBar === factor.id ? 10 : 1,
                      }}
                      initial={{ scaleX: 0 }}
                      animate={isInView ? { scaleX: 1 } : {}}
                      transition={{ 
                        delay: 0.3 + index * 0.1, 
                        duration: 0.5,
                        ease: "easeOut"
                      }}
                      onMouseEnter={() => {
                        setActiveFactor(factor.id);
                        setHoveredBar(factor.id);
                      }}
                      onMouseLeave={() => {
                        setActiveFactor(null);
                        setHoveredBar(null);
                      }}
                      data-testid={`bar-segment-${factor.id}`}
                    >
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        animate={hoveredBar === factor.id ? { scale: 1.05 } : { scale: 1 }}
                      >
                        {factor.percentage >= 15 && (
                          <span className="text-xs font-bold text-black/80">
                            {factor.percentage}%
                          </span>
                        )}
                      </motion.div>

                      {hoveredBar === factor.id && (
                        <motion.div
                          className="absolute -top-14 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap z-20"
                          style={{ 
                            backgroundColor: factor.color,
                            color: "#000"
                          }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {factor.label}: {factor.percentage}%
                          <div 
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0"
                            style={{
                              borderLeft: "6px solid transparent",
                              borderRight: "6px solid transparent",
                              borderTop: `6px solid ${factor.color}`,
                            }}
                          />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              <div className="space-y-3">
                {pricingFactors.map((factor, index) => {
                  const Icon = factor.icon;
                  const isActive = activeFactor === factor.id;
                  
                  return (
                    <motion.div
                      key={factor.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-300 cursor-pointer ${
                        isActive ? 'bg-muted/50' : ''
                      }`}
                      onMouseEnter={() => {
                        setActiveFactor(factor.id);
                        setHoveredBar(factor.id);
                      }}
                      onMouseLeave={() => {
                        setActiveFactor(null);
                        setHoveredBar(null);
                      }}
                      data-testid={`legend-item-${factor.id}`}
                    >
                      <div
                        className="w-3 h-3 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: factor.color }}
                      />
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${factor.color}20` }}
                      >
                        <Icon className="h-4 w-4" style={{ color: factor.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{factor.label}</span>
                          <span 
                            className="text-sm font-bold"
                            style={{ color: factor.color }}
                          >
                            {factor.percentage}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted/50 rounded-full mt-1 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: factor.color }}
                            initial={{ width: 0 }}
                            animate={isInView ? { width: `${factor.percentage}%` } : {}}
                            transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                          />
                        </div>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                            <Info className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-xs">
                          <p className="text-sm">{factor.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="space-y-4">
          {activeFactor ? (
            <motion.div
              key={activeFactor}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {(() => {
                const factor = pricingFactors.find(f => f.id === activeFactor);
                if (!factor) return null;
                const Icon = factor.icon;
                
                return (
                  <div 
                    className="bg-card border rounded-2xl p-6"
                    style={{ borderColor: `${factor.color}40` }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <motion.div
                        className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${factor.color}20` }}
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Icon className="h-7 w-7" style={{ color: factor.color }} />
                      </motion.div>
                      <div>
                        <h4 className="font-display text-xl font-bold" style={{ color: factor.color }}>
                          {factor.label}
                        </h4>
                        <p className="text-lg font-bold text-muted-foreground">
                          {factor.percentage}% of total cost
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">
                      {factor.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {factor.details.map((detail, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="px-3 py-1.5 rounded-full text-sm"
                          style={{ 
                            backgroundColor: `${factor.color}15`,
                            color: factor.color,
                            border: `1px solid ${factor.color}30`
                          }}
                        >
                          {detail}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8 }}
              className="bg-card border border-border/50 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  className="w-12 h-12 rounded-xl bg-[#D4FF1F]/20 flex items-center justify-center"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <DollarSign className="h-6 w-6 text-[#D4FF1F]" />
                </motion.div>
                <div>
                  <h4 className="font-display text-lg font-bold">Transparent Pricing</h4>
                  <p className="text-sm" style={{ color: "#21d8ff" }}>Hover to explore each cost factor</p>
                </div>
              </div>
              
              <p className="text-muted-foreground text-sm leading-relaxed">
                Every dollar you spend goes toward quality you can verify. From synthesis to shipping, 
                we've optimized costs without cutting corners on what matters: purity, testing, and 
                proper handling.
              </p>

              <div className="mt-4 pt-4 border-t border-border/30">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Quality Investment</span>
                  <span className="font-bold text-[#D4FF1F]">
                    {pricingFactors.slice(0, 4).reduce((sum, f) => sum + f.percentage, 0)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Operations</span>
                  <span className="font-bold text-[#f97316]">
                    {pricingFactors[4].percentage}%
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="bg-card border border-[#22c55e]/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-display font-bold text-[#22c55e]">95%</div>
              <div className="text-xs text-muted-foreground">Goes to quality</div>
            </div>
            <div className="bg-card border border-[#21d8ff]/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-display font-bold text-[#21d8ff]">0%</div>
              <div className="text-xs text-muted-foreground">Hidden fees</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
