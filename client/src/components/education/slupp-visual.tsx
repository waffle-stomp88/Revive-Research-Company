import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Zap, Activity, Battery, Flame, Database } from "lucide-react";

export function SLUPP332Visual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  const pathways = [
    { label: "Mitochondrial Function", icon: Battery, color: "#E7FB10", percent: 85 },
    { label: "Fat Oxidation", icon: Flame, color: "#f97316", percent: 92 },
    { label: "Glucose Homeostasis", icon: Database, color: "#21d8ff", percent: 78 },
    { label: "Exercise Capacity", icon: Activity, color: "#22c55e", percent: 88 },
  ];

  return (
    <div ref={containerRef} className="relative p-6 rounded-xl border border-[#E7FB10]/20 bg-black/40 overflow-hidden">
      <div 
        className="absolute inset-0 blur-3xl -z-10"
        style={{
          background: 'radial-gradient(circle at center, rgba(231, 251, 16, 0.05) 0%, transparent 70%)'
        }}
      />
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-[#E7FB10]/10 border border-[#E7FB10]/30 shadow-[0_0_15px_rgba(231,251,16,0.2)]">
          <Zap className="h-5 w-5 text-[#E7FB10]" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-foreground">ERR Agonist Pathway</h4>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Metabolic Mimetic Mechanism</p>
        </div>
      </div>

      <div className="space-y-4">
        {pathways.map((path, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <path.icon className="h-3.5 w-3.5" style={{ color: path.color }} />
                <span className="text-xs font-medium text-muted-foreground">{path.label}</span>
              </div>
              <span className="text-[10px] font-bold" style={{ color: path.color }}>{path.percent}% Activation</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: path.color, boxShadow: `0 0 10px ${path.color}40` }}
                initial={{ width: 0 }}
                animate={isInView ? { width: `${path.percent}%` } : {}}
                transition={{ delay: 0.2 + i * 0.1, duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>

      <motion.div 
        className="mt-6 p-3 rounded-lg bg-white/5 border border-white/10 text-center"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 1 }}
      >
        <p className="text-[11px] text-muted-foreground leading-relaxed italic">
          "SLU-PP-332 activates Estrogen-Related Receptors (ERRs), mimicking the metabolic benefits of endurance exercise by upregulating mitochondrial biogenesis and fat oxidation."
        </p>
      </motion.div>
    </div>
  );
}
