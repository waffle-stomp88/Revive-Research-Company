import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Clock, Zap, Shield, TrendingUp } from "lucide-react";

export function TelomereVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [showMechanism, setShowMechanism] = useState(false);

  const telomereStages = [
    { age: "Young Cell", length: 100, color: "#22c55e", label: "Full telomeres" },
    { age: "Middle Age", length: 70, color: "#E7FB10", label: "Shortened" },
    { age: "Aged Cell", length: 40, color: "#f97316", label: "Critical length" },
    { age: "Senescent", length: 15, color: "#ef4444", label: "Cell death/dysfunction" },
  ];

  return (
    <div ref={ref} className="py-8" data-testid="telomere-visual">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h3 className="text-xl font-bold text-foreground mb-2">
          Telomere Shortening & Telomerase
        </h3>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Each cell division shortens telomeres—protective caps on chromosomes. 
          Telomerase can help maintain telomere length.
        </p>
      </motion.div>

      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative bg-card border rounded-xl p-6"
          style={{ borderColor: "rgba(157, 78, 221, 0.2)" }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Clock className="h-4 w-4 text-[#9d4edd]" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Telomere Length Over Time
            </span>
          </div>

          <div className="space-y-4">
            {telomereStages.map((stage, i) => (
              <motion.div
                key={stage.age}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.4 + i * 0.15 }}
                className="flex items-center gap-4"
              >
                <div className="w-24 text-right">
                  <span className="text-sm font-medium text-foreground">{stage.age}</span>
                </div>
                
                <div className="flex-1 relative h-8">
                  <div className="absolute inset-y-0 left-0 right-0 bg-muted/20 rounded" />
                  
                  <div className="absolute inset-y-1 left-1 flex items-center">
                    <div 
                      className="h-3 w-4 rounded-l bg-[#9d4edd]/30"
                      style={{ borderRight: "2px solid #9d4edd" }}
                    />
                    
                    <motion.div
                      className="h-6 rounded-sm flex items-center justify-end pr-2"
                      style={{ 
                        backgroundColor: `${stage.color}30`,
                        borderTop: `2px solid ${stage.color}`,
                        borderBottom: `2px solid ${stage.color}`,
                      }}
                      initial={{ width: 0 }}
                      animate={isInView ? { width: `${stage.length}%` } : {}}
                      transition={{ duration: 1, delay: 0.6 + i * 0.2 }}
                    >
                      {stage.length > 30 && (
                        <span className="text-xs font-medium" style={{ color: stage.color }}>
                          {stage.length}%
                        </span>
                      )}
                    </motion.div>
                    
                    <div 
                      className="h-3 w-4 rounded-r bg-[#9d4edd]/30"
                      style={{ borderLeft: "2px solid #9d4edd" }}
                    />
                  </div>
                </div>
                
                <div className="w-36">
                  <span className="text-xs text-muted-foreground">{stage.label}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 1.5 }}
            className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-border/30"
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#9d4edd]" />
              <span className="text-xs text-muted-foreground">Chromosome</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-3 rounded-sm" style={{ background: "linear-gradient(90deg, #22c55e, #ef4444)" }} />
              <span className="text-xs text-muted-foreground">Telomere (shortens with age)</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1 }}
          className="mt-6"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMechanism(!showMechanism);
            }}
            className="flex items-center gap-2 mx-auto px-4 py-2 rounded-lg bg-[#9d4edd]/10 border border-[#9d4edd]/30 text-[#9d4edd] hover:bg-[#9d4edd]/20 transition-colors"
            data-testid="button-toggle-mechanism"
          >
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium">
              {showMechanism ? "Hide" : "Show"} How Telomerase Works
            </span>
          </button>

          {showMechanism && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 grid md:grid-cols-3 gap-4"
            >
              {[
                {
                  icon: Shield,
                  title: "Telomerase Enzyme",
                  desc: "Adds DNA sequences to telomere ends, counteracting shortening"
                },
                {
                  icon: TrendingUp,
                  title: "Research Focus",
                  desc: "Epithalon may stimulate telomerase activity in certain cell types"
                },
                {
                  icon: Clock,
                  title: "Cellular Longevity",
                  desc: "Maintained telomeres may extend cellular lifespan and function"
                }
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-lg bg-card/50 border border-[#9d4edd]/20"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4 text-[#9d4edd]" />
                      <span className="text-sm font-medium text-foreground">{item.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
