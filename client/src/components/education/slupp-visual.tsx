import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Zap, Activity, Battery, Flame, Heart, TrendingUp, Dumbbell } from "lucide-react";

function ExerciseMimeticAnimation({ isInView, activePhase }: { isInView: boolean; activePhase: number }) {
  return (
    <div className="relative w-full h-72 flex items-center justify-center overflow-hidden bg-black/20 rounded-xl border border-white/5">
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(231, 251, 16, 0.05) 0%, transparent 70%)'
        }}
      />
      
      <svg viewBox="0 0 450 250" className="w-full h-full max-w-2xl drop-shadow-2xl">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="dnaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E7FB10" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#E7FB10" stopOpacity="1" />
            <stop offset="100%" stopColor="#E7FB10" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Nucleus/Cell Boundary */}
        <motion.circle
          cx="225" cy="125" r="110"
          fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="5,5"
        />

        {/* Phase 0: Compound Entry */}
        <motion.g animate={{ opacity: activePhase === 0 ? 1 : 0.4 }}>
          <motion.rect
            x="20" y="105" width="70" height="40" rx="8"
            fill="rgba(231, 251, 16, 0.1)"
            stroke="#E7FB10" strokeWidth="2"
            animate={activePhase === 0 ? { 
              scale: [1, 1.05, 1],
              boxShadow: "0 0 20px rgba(231, 251, 16, 0.5)"
            } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <text x="55" y="130" textAnchor="middle" fill="#E7FB10" fontSize="10" fontWeight="bold">SLU-PP-332</text>
        </motion.g>

        {/* Signaling Path */}
        <motion.path
          d="M 90 125 Q 150 125 180 125"
          fill="none" stroke="#E7FB10" strokeWidth="2" strokeDasharray="4,4"
          animate={{ strokeDashoffset: [0, -20] }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          style={{ opacity: activePhase >= 0 ? 1 : 0.1 }}
        />

        {/* Phase 1: ERR Activation (The "Switch") */}
        <motion.g transform="translate(180, 85)" animate={{ scale: activePhase === 1 ? 1.1 : 1 }}>
          <motion.ellipse
            cx="45" cy="40" rx="35" ry="15"
            fill={activePhase === 1 ? "rgba(34, 197, 94, 0.3)" : "rgba(34, 197, 94, 0.1)"}
            stroke="#22c55e" strokeWidth="2"
            style={{ filter: activePhase === 1 ? 'url(#glow)' : '' }}
          />
          <text x="45" y="43" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="bold">ERR-α Receptor</text>
          
          {/* Docking Animation */}
          {activePhase === 1 && (
            <motion.circle
              cx="45" cy="40" r="4" fill="#E7FB10"
              animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          )}
        </motion.g>

        {/* Phase 2: Gene Expression (Mitochondrial Program) */}
        <motion.g transform="translate(180, 140)" animate={{ opacity: activePhase >= 2 ? 1 : 0.1 }}>
          <motion.path
            d="M 10 30 Q 45 10 80 30"
            fill="none" stroke="url(#dnaGradient)" strokeWidth="3"
            animate={activePhase === 2 ? { y: [0, -5, 0] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <text x="45" y="55" textAnchor="middle" fill="#21d8ff" fontSize="8" fontWeight="bold">PGC-1α CO-ACTIVATION</text>
          <text x="45" y="65" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7">Mitochondrial Biogenesis</text>
        </motion.g>

        {/* Phase 3: Muscle Transformation */}
        <motion.g transform="translate(320, 85)" animate={{ x: activePhase === 3 ? [0, 5, 0] : 0 }}>
          <rect x="0" y="0" width="100" height="80" rx="10" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" />
          <text x="50" y="20" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontWeight="bold">SKELETAL MUSCLE</text>
          
          {/* Fiber Type Switch */}
          <motion.g animate={{ fill: activePhase === 3 ? "#E7FB10" : "#666" }}>
            <circle cx="30" cy="45" r="8" />
            <circle cx="50" cy="45" r="8" />
            <circle cx="70" cy="45" r="8" />
            <text x="50" y="65" textAnchor="middle" fontSize="7" fill={activePhase === 3 ? "#E7FB10" : "#666"}>Type I (Slow-Twitch)</text>
          </motion.g>
          
          {activePhase === 3 && (
            <motion.path
              d="M 20 75 L 80 75"
              stroke="#E7FB10" strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
            />
          )}
        </motion.g>

        {/* Connecting Arrows */}
        <motion.path
          d="M 260 110 L 310 110"
          stroke="#22c55e" strokeWidth="2" markerEnd="url(#arrow)"
          initial={{ opacity: 0 }}
          animate={{ opacity: activePhase >= 2 ? 1 : 0.1 }}
        />
      </svg>
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
