import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Zap, Activity, Battery, Flame, Heart, TrendingUp, Dumbbell } from "lucide-react";

const phases = [
  { id: 0, label: "Compound", icon: Zap, color: "#E7FB10", description: "SLU-PP-332 binds to ERR receptors" },
  { id: 1, label: "ERR Activation", icon: Activity, color: "#22c55e", description: "Pan-agonist activates ERR-α, β, and γ" },
  { id: 2, label: "Gene Expression", icon: Battery, color: "#21d8ff", description: "Upregulates mitochondrial & metabolic genes" },
  { id: 3, label: "Exercise Effects", icon: TrendingUp, color: "#f97316", description: "Mimics endurance training adaptations" },
];

export function SLUPP332Visual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const [activePhase, setActivePhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying || !isInView) return;
    
    const interval = setInterval(() => {
      setActivePhase((prev) => (prev + 1) % phases.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isPlaying, isInView]);

  const researchFindings = [
    { stat: "+70%", label: "Endurance", desc: "Treadmill running time in mice", color: "#E7FB10" },
    { stat: "+45%", label: "Distance", desc: "Running distance improvement", color: "#22c55e" },
    { stat: "↓ Fat", label: "Body Composition", desc: "Decreased fat mass accumulation", color: "#f97316" },
    { stat: "↑ Type I", label: "Muscle Fibers", desc: "Slow-twitch oxidative conversion", color: "#21d8ff" },
  ];

  return (
    <div ref={containerRef} className="relative">
      <div 
        className="absolute inset-0 h-full w-full rounded-2xl blur-3xl -z-10"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(231, 251, 16, 0.08) 0%, transparent 70%)'
        }}
      />
      
      {/* Header */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
      >
        <div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4"
          style={{
            background: 'linear-gradient(135deg, rgba(231, 251, 16, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)',
            borderColor: '#E7FB10',
            boxShadow: '0 0 20px rgba(231, 251, 16, 0.3)'
          }}
        >
          <Dumbbell className="h-5 w-5 text-[#E7FB10]" style={{ filter: 'drop-shadow(0 0 4px rgba(231, 251, 16, 0.6))' }} />
          <span className="text-sm font-bold bg-gradient-to-r from-[#E7FB10] to-[#22c55e] bg-clip-text text-transparent">
            Exercise in a Pill
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          SLU-PP-332 activates the same genetic programs as endurance exercise—without physical activity
        </p>
      </motion.div>

      {/* Main Visual - Two Column Layout */}
      <div 
        className="rounded-xl border overflow-hidden"
        style={{ 
          borderColor: 'rgba(231, 251, 16, 0.3)',
          background: 'linear-gradient(135deg, rgba(231, 251, 16, 0.03) 0%, transparent 50%)'
        }}
      >
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left: Mechanism Pathway */}
          <div className="p-6 border-r border-border/5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-[#E7FB10]">Mechanism of Action</h4>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-[10px] px-2 py-1 rounded-full transition-all"
                style={{
                  backgroundColor: isPlaying ? 'rgba(231, 251, 16, 0.2)' : 'hsl(var(--foreground) / 0.1)',
                  color: isPlaying ? '#E7FB10' : 'hsl(var(--foreground) / 0.6)',
                  border: `1px solid ${isPlaying ? '#E7FB10' : 'hsl(var(--foreground) / 0.2)'}`
                }}
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>
            </div>
            
            {/* Vertical Timeline */}
            <div className="space-y-3">
              {phases.map((phase, index) => {
                const Icon = phase.icon;
                const isActive = activePhase === index;
                const isPast = activePhase > index;
                
                return (
                  <motion.div
                    key={phase.id}
                    className="flex items-start gap-3 cursor-pointer"
                    onClick={() => {
                      setIsPlaying(false);
                      setActivePhase(index);
                    }}
                    animate={{ opacity: isActive ? 1 : isPast ? 0.7 : 0.4 }}
                  >
                    {/* Timeline dot and line */}
                    <div className="flex flex-col items-center">
                      <motion.div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ 
                          backgroundColor: isActive || isPast ? `${phase.color}30` : 'hsl(var(--foreground) / 0.05)',
                          border: `2px solid ${isActive ? phase.color : isPast ? `${phase.color}60` : 'hsl(var(--foreground) / 0.1)'}`,
                          boxShadow: isActive ? `0 0 15px ${phase.color}50` : 'none'
                        }}
                        animate={{ scale: isActive ? 1.1 : 1 }}
                      >
                        <Icon className="h-4 w-4" style={{ color: isActive || isPast ? phase.color : '#666' }} />
                      </motion.div>
                      {index < phases.length - 1 && (
                        <div 
                          className="w-0.5 h-6 mt-1"
                          style={{ backgroundColor: isPast ? phase.color : 'hsl(var(--foreground) / 0.1)' }}
                        />
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pt-1">
                      <h5 
                        className="text-xs font-bold mb-0.5"
                        style={{ color: isActive ? phase.color : isPast ? phase.color : '#888' }}
                      >
                        {phase.label}
                      </h5>
                      <p className="text-[10px] text-muted-foreground leading-snug">
                        {phase.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
          
          {/* Right: Research Results */}
          <div className="p-6 bg-black/20">
            <h4 className="text-sm font-bold text-[#22c55e] mb-4">2024 Research Results</h4>
            <p className="text-[10px] text-muted-foreground mb-4">
              Billon et al. • J Pharmacol Exp Ther
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {researchFindings.map((finding, i) => (
                <motion.div
                  key={i}
                  className="p-3 rounded-lg"
                  style={{ 
                    backgroundColor: 'hsl(var(--foreground) / 0.03)',
                    border: '1px solid hsl(var(--foreground) / 0.08)'
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <div 
                    className="text-lg font-bold mb-1"
                    style={{ color: finding.color }}
                  >
                    {finding.stat}
                  </div>
                  <div className="text-[11px] font-medium text-foreground mb-1">
                    {finding.label}
                  </div>
                  <div className="text-[9px] text-muted-foreground leading-tight">
                    {finding.desc}
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Key Insight */}
            <motion.div
              className="mt-4 p-3 rounded-lg bg-[#E7FB10]/5 border border-[#E7FB10]/20"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 1 }}
            >
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                <span className="text-[#E7FB10] font-medium">Key finding:</span> Mice treated with SLU-PP-332 showed metabolic improvements 
                <span className="text-[#22c55e]"> without any change in food intake</span>—pure metabolic enhancement.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <motion.div
        className="text-center text-xs text-muted-foreground mt-4"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 1.5 }}
      >
        <span className="px-3 py-1 rounded-full bg-muted/30">
          For research purposes only • Not FDA approved
        </span>
      </motion.div>
    </div>
  );
}

export function SLUPP332ComparisonTable() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  const pathways = [
    { label: "Mitochondrial Function", icon: Battery, color: "#E7FB10", percent: 85 },
    { label: "Fat Oxidation", icon: Flame, color: "#f97316", percent: 92 },
    { label: "Glucose Homeostasis", icon: Heart, color: "#21d8ff", percent: 78 },
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
          <h4 className="text-sm font-bold text-foreground">ERR Activation Profile</h4>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Metabolic Pathway Activation</p>
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
            <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
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
        className="mt-6 p-3 rounded-lg bg-foreground/5 border border-border/10 text-center"
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
