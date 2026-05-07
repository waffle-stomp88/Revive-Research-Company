import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Target, Zap, TrendingUp, Info } from "lucide-react";

interface ReceptorData {
  name: string;
  type: string;
  color: string;
  receptors: {
    name: string;
    active: boolean;
    effect: string;
  }[];
  halfLife: string;
  keyFeature: string;
}

const peptideComparison: ReceptorData[] = [
  {
    name: "RR-A1",
    type: "Single Agonist",
    color: "#21d8ff",
    receptors: [
      { name: "GLP-1", active: true, effect: "Incretin pathway modulation" },
      { name: "GIP", active: false, effect: "" },
      { name: "Glucagon", active: false, effect: "" }
    ],
    halfLife: "~7 days",
    keyFeature: "Albumin binding for extended action"
  },
  {
    name: "RR-A2",
    type: "Dual Agonist",
    color: "#E7FB10",
    receptors: [
      { name: "GLP-1", active: true, effect: "Incretin pathway modulation" },
      { name: "GIP", active: true, effect: "Secondary incretin signaling" },
      { name: "Glucagon", active: false, effect: "" }
    ],
    halfLife: "~5 days",
    keyFeature: "Imbalanced agonism for synergy"
  },
  {
    name: "RR-A3",
    type: "Triple Agonist",
    color: "#ec4899",
    receptors: [
      { name: "GLP-1", active: true, effect: "Incretin pathway modulation" },
      { name: "GIP", active: true, effect: "Secondary incretin signaling" },
      { name: "Glucagon", active: true, effect: "Metabolic pathway activation" }
    ],
    halfLife: "~6 days",
    keyFeature: "First triple-receptor approach"
  }
];

export function GLP1ReceptorComparison() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [activePeptide, setActivePeptide] = useState<string | null>(null);

  return (
    <div ref={ref} className="py-8" data-testid="glp1-receptor-comparison">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h3 className="text-xl font-bold text-foreground mb-2">
          Incretin Receptor Agonist Comparison
        </h3>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Understanding the difference between single, dual, and triple receptor agonists
        </p>
      </motion.div>

      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-3 gap-4">
          {peptideComparison.map((peptide, i) => {
            const isActive = activePeptide === peptide.name;
            const activeCount = peptide.receptors.filter(r => r.active).length;
            
            return (
              <motion.div
                key={peptide.name}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
                className="relative"
                onMouseEnter={() => setActivePeptide(peptide.name)}
                onMouseLeave={() => setActivePeptide(null)}
                data-testid={`peptide-card-${peptide.name.toLowerCase()}`}
              >
                <motion.div
                  animate={isActive ? { scale: 1.02, y: -5 } : { scale: 1, y: 0 }}
                  className="relative bg-card border rounded-xl p-5 h-full transition-all duration-300"
                  style={{ 
                    borderColor: isActive ? peptide.color : 'hsl(var(--foreground) / 0.1)',
                    boxShadow: isActive ? `0 10px 40px ${peptide.color}20` : "none"
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="glow"
                      className="absolute inset-0 rounded-xl opacity-20"
                      style={{ 
                        background: `radial-gradient(circle at center, ${peptide.color}, transparent 70%)`
                      }}
                    />
                  )}

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-lg" style={{ color: peptide.color }}>
                          {peptide.name}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {peptide.type}
                        </span>
                      </div>
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${peptide.color}20` }}
                      >
                        <span className="text-lg font-bold" style={{ color: peptide.color }}>
                          {activeCount}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {peptide.receptors.map((receptor) => (
                        <div 
                          key={receptor.name}
                          className="flex items-center gap-3"
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={isInView ? { scale: 1 } : {}}
                            transition={{ delay: 0.6 + i * 0.1, type: "spring" }}
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              receptor.active 
                                ? "bg-gradient-to-br from-white/20 to-white/5" 
                                : "bg-muted/20"
                            }`}
                            style={{ 
                              border: receptor.active 
                                ? `2px solid ${peptide.color}` 
                                : "2px solid hsl(var(--foreground) / 0.1)"
                            }}
                          >
                            {receptor.active && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={isInView ? { scale: 1 } : {}}
                                transition={{ delay: 0.8 + i * 0.1 }}
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: peptide.color }}
                              />
                            )}
                          </motion.div>
                          <div className="flex-1">
                            <span className={`text-sm font-medium ${
                              receptor.active ? "text-foreground" : "text-muted-foreground/50"
                            }`}>
                              {receptor.name}
                            </span>
                          </div>
                          {receptor.active && (
                            <Target className="h-3 w-3" style={{ color: peptide.color }} />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-border/30 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Half-life:</span>
                        <span className="font-medium text-foreground">{peptide.halfLife}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <Zap className="h-3 w-3 inline mr-1" style={{ color: peptide.color }} />
                        {peptide.keyFeature}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.2 }}
          className="mt-6 p-4 rounded-lg bg-[#21d8ff]/10 border border-[#21d8ff]/20"
        >
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-[#21d8ff] mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <strong className="text-foreground">Research context:</strong> Each additional 
              receptor target adds distinct signaling pathways. Triple agonists like RR-A3 
              combine GLP-1 incretin modulation, GIP pathway activation, and glucagon receptor 
              signaling for multi-pathway research applications.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function GLP1ComparisonCompact() {
  return (
    <div className="flex items-center justify-around gap-4 py-4" data-testid="glp1-comparison-compact">
      {peptideComparison.map((peptide) => {
        const activeCount = peptide.receptors.filter(r => r.active).length;
        return (
          <div key={peptide.name} className="text-center">
            <div 
              className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
              style={{ 
                backgroundColor: `${peptide.color}20`,
                border: `2px solid ${peptide.color}`
              }}
            >
              <span className="text-lg font-bold" style={{ color: peptide.color }}>
                {activeCount}
              </span>
            </div>
            <div className="text-xs font-medium text-foreground">{peptide.name}</div>
            <div className="text-xs text-muted-foreground">{peptide.type}</div>
          </div>
        );
      })}
    </div>
  );
}
