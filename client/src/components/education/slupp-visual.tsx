import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Zap, Activity, Battery, Flame, Heart, TrendingUp, Dumbbell } from "lucide-react";

function ExerciseMimeticAnimation({ isInView, activePhase }: { isInView: boolean; activePhase: number }) {
  const steps = [
    {
      id: 0,
      title: "SLU-PP-332",
      subtitle: "Compound Entry",
      color: "#E7FB10",
      detail: "Binds to nuclear ERR receptors"
    },
    {
      id: 1,
      title: "ERR-α Activation",
      subtitle: "Receptor Binding",
      color: "#22c55e",
      detail: "Triggers conformational change"
    },
    {
      id: 2,
      title: "PGC-1α Recruitment",
      subtitle: "Gene Transcription",
      color: "#21d8ff",
      detail: "Master switch for mitochondria"
    },
    {
      id: 3,
      title: "Exercise Adaptation",
      subtitle: "Muscle Transformation",
      color: "#f97316",
      detail: "Type I fiber conversion"
    }
  ];

  return (
    <div className="relative w-full p-6 bg-black/30 rounded-xl border border-white/10">
      {/* Linear Pipeline */}
      <div className="flex items-center justify-between gap-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step Card */}
            <motion.div
              className="flex-1 p-4 rounded-lg text-center relative"
              style={{
                backgroundColor: activePhase === index ? `${step.color}20` : 'rgba(255,255,255,0.03)',
                border: `2px solid ${activePhase === index ? step.color : 'rgba(255,255,255,0.1)'}`,
                boxShadow: activePhase === index ? `0 0 20px ${step.color}40` : 'none'
              }}
              animate={{
                scale: activePhase === index ? 1.02 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Step Number */}
              <div 
                className="absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ 
                  backgroundColor: activePhase >= index ? step.color : '#333',
                  color: activePhase >= index ? '#000' : '#666'
                }}
              >
                {index + 1}
              </div>
              
              <h4 
                className="text-sm font-bold mb-1"
                style={{ color: step.color }}
              >
                {step.title}
              </h4>
              <p className="text-[10px] text-muted-foreground mb-2">
                {step.subtitle}
              </p>
              
              {/* Active Detail */}
              {activePhase === index && (
                <motion.p
                  className="text-[9px] mt-2 pt-2 border-t border-white/10"
                  style={{ color: step.color }}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {step.detail}
                </motion.p>
              )}
            </motion.div>

            {/* Arrow Connector */}
            {index < steps.length - 1 && (
              <div className="flex-shrink-0 w-8 flex items-center justify-center">
                <motion.div
                  className="w-6 h-0.5 relative"
                  style={{ 
                    backgroundColor: activePhase > index ? steps[index + 1].color : 'rgba(255,255,255,0.2)'
                  }}
                >
                  <motion.div
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0"
                    style={{
                      borderTop: '4px solid transparent',
                      borderBottom: '4px solid transparent',
                      borderLeft: `6px solid ${activePhase > index ? steps[index + 1].color : 'rgba(255,255,255,0.2)'}`
                    }}
                  />
                </motion.div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Summary */}
      <motion.div
        className="mt-6 pt-4 border-t border-white/10 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: isInView ? 1 : 0 }}
      >
        <p className="text-xs text-muted-foreground">
          <span className="text-[#E7FB10] font-medium">SLU-PP-332</span> activates ERR nuclear receptors → recruits{" "}
          <span className="text-[#21d8ff] font-medium">PGC-1α coactivator</span> → triggers{" "}
          <span className="text-[#f97316] font-medium">endurance exercise adaptations</span>
        </p>
      </motion.div>
    </div>
  );
}

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
    }, 2500);
    
    return () => clearInterval(interval);
  }, [isPlaying, isInView]);

  return (
    <div ref={containerRef} className="relative">
      <div 
        className="absolute inset-0 h-full w-full rounded-2xl blur-3xl -z-10"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(231, 251, 16, 0.08) 0%, transparent 70%)'
        }}
      />
      
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
            Exercise Mimetic Mechanism
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          How SLU-PP-332 activates ERR receptors to replicate endurance exercise benefits
        </p>
      </motion.div>

      <div 
        className="rounded-xl border p-6 mb-6"
        style={{ 
          borderColor: 'rgba(231, 251, 16, 0.3)',
          background: 'linear-gradient(135deg, rgba(231, 251, 16, 0.05) 0%, transparent 50%)'
        }}
      >
        <ExerciseMimeticAnimation isInView={isInView} activePhase={activePhase} />
        
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Activation Pathway
            </span>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-xs px-3 py-1 rounded-full transition-all"
              style={{
                backgroundColor: isPlaying ? 'rgba(231, 251, 16, 0.2)' : 'rgba(255,255,255,0.1)',
                color: isPlaying ? '#E7FB10' : 'rgba(255,255,255,0.6)',
                border: `1px solid ${isPlaying ? '#E7FB10' : 'rgba(255,255,255,0.2)'}`
              }}
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {phases.map((phase, index) => {
              const Icon = phase.icon;
              const isActive = activePhase === index;
              
              return (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="relative rounded-lg p-3 cursor-pointer transition-all text-center"
                  style={{ 
                    backgroundColor: isActive ? `${phase.color}20` : `${phase.color}08`,
                    border: `1.5px solid ${isActive ? phase.color : `${phase.color}30`}`,
                    boxShadow: isActive ? `0 0 20px ${phase.color}30` : undefined
                  }}
                  onClick={() => {
                    setIsPlaying(false);
                    setActivePhase(index);
                  }}
                >
                  <motion.div
                    className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center"
                    style={{ backgroundColor: `${phase.color}20` }}
                    animate={{ scale: isActive ? 1.1 : 1 }}
                  >
                    <Icon className="h-5 w-5" style={{ color: phase.color, filter: isActive ? `drop-shadow(0 0 6px ${phase.color})` : undefined }} />
                  </motion.div>
                  <span className="text-xs font-bold block mb-1" style={{ color: phase.color }}>
                    {phase.label}
                  </span>
                  <span className="text-[9px] text-muted-foreground leading-tight block">
                    {phase.description}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <motion.div
        className="text-center text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 2 }}
      >
        <span className="px-3 py-1 rounded-full bg-muted/30">
          SLU-PP-332 ERR agonist visualization • For educational purposes only
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
