import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Zap, Activity, Battery, Flame, Heart, TrendingUp, Dumbbell } from "lucide-react";

function ExerciseMimeticAnimation({ isInView, activePhase }: { isInView: boolean; activePhase: number }) {
  return (
    <div className="relative w-full h-64 flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 rounded-xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(231, 251, 16, 0.1) 0%, transparent 70%)'
        }}
      />
      
      <svg viewBox="0 0 400 200" className="w-full h-full max-w-xl">
        <defs>
          <filter id="errGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="errGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E7FB10" />
            <stop offset="50%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#21d8ff" />
          </linearGradient>
          <linearGradient id="energyGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#E7FB10" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        <motion.text x="200" y="18" textAnchor="middle" fill="#E7FB10" fontSize="11" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
          style={{ textShadow: '0 0 10px rgba(231, 251, 16, 0.6)' }}
        >
          SLU-PP-332 Exercise Mimetic Pathway
        </motion.text>

        <motion.rect
          x="30" y="70" width="80" height="60" rx="12"
          fill={activePhase >= 0 ? "rgba(231, 251, 16, 0.2)" : "rgba(255,255,255,0.05)"}
          stroke={activePhase >= 0 ? "#E7FB10" : "rgba(255,255,255,0.2)"}
          strokeWidth="2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { 
            opacity: 1, 
            scale: activePhase === 0 ? 1.05 : 1,
            fill: activePhase === 0 ? "rgba(231, 251, 16, 0.3)" : "rgba(231, 251, 16, 0.2)"
          } : {}}
          transition={{ duration: 0.5 }}
          style={{ filter: activePhase === 0 ? 'drop-shadow(0 0 20px rgba(231, 251, 16, 0.8))' : undefined }}
        />
        <motion.text x="70" y="92" textAnchor="middle" fill="#E7FB10" fontSize="11" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          SLU-PP-332
        </motion.text>
        <motion.text x="70" y="107" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
        >
          ERR Pan-Agonist
        </motion.text>
        <motion.text x="70" y="120" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7 }}
        >
          (First-in-class)
        </motion.text>

        <motion.path
          d="M 110 100 L 140 100"
          stroke="#E7FB10"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ delay: 0.8 }}
          style={{ filter: 'drop-shadow(0 0 6px rgba(231, 251, 16, 0.6))' }}
        />
        <motion.polygon
          points="138,95 148,100 138,105"
          fill="#E7FB10"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.9 }}
        />

        <motion.g initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1 }}>
          {[
            { label: "ERRα", y: 55, color: "#22c55e", desc: "Mitochondria" },
            { label: "ERRβ", y: 100, color: "#21d8ff", desc: "Differentiation" },
            { label: "ERRγ", y: 145, color: "#9d4edd", desc: "Oxidation" },
          ].map((receptor, i) => (
            <motion.g key={receptor.label}>
              <motion.ellipse
                cx="195"
                cy={receptor.y}
                rx="40"
                ry="18"
                fill={activePhase === 1 ? `${receptor.color}40` : `${receptor.color}15`}
                stroke={receptor.color}
                strokeWidth={activePhase === 1 ? 3 : 1.5}
                initial={{ scale: 0 }}
                animate={isInView ? { 
                  scale: activePhase === 1 ? 1.1 : 1,
                  opacity: 1 
                } : {}}
                transition={{ duration: 0.5 }}
                style={{ filter: activePhase === 1 ? `drop-shadow(0 0 15px ${receptor.color})` : undefined }}
              />
              <motion.text x="195" y={receptor.y - 3} textAnchor="middle" fill={receptor.color} fontSize="10" fontWeight="bold"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 1.2 + i * 0.15 }}
              >
                {receptor.label}
              </motion.text>
              <motion.text x="195" y={receptor.y + 10} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 1.3 + i * 0.15 }}
              >
                {receptor.desc}
              </motion.text>
            </motion.g>
          ))}
        </motion.g>

        <motion.path
          d="M 235 100 L 265 100"
          stroke="url(#errGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ delay: 1.6 }}
        />
        <motion.polygon
          points="263,95 273,100 263,105"
          fill="#21d8ff"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.7 }}
        />

        <motion.rect
          x="275" y="40" width="105" height="120" rx="12"
          fill={activePhase >= 2 ? "rgba(34, 197, 94, 0.2)" : "rgba(255,255,255,0.03)"}
          stroke={activePhase >= 2 ? "#22c55e" : "rgba(255,255,255,0.15)"}
          strokeWidth="2"
          strokeDasharray={activePhase >= 2 ? "0" : "4,4"}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { 
            opacity: 1, 
            scale: activePhase >= 2 ? 1.02 : 1 
          } : {}}
          transition={{ duration: 0.5 }}
          style={{ filter: activePhase >= 2 ? 'drop-shadow(0 0 25px rgba(34, 197, 94, 0.5))' : undefined }}
        />
        <motion.text x="327" y="58" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.9 }}
        >
          EXERCISE BENEFITS
        </motion.text>
        
        {[
          { icon: "⚡", text: "+70% Endurance", y: 78, color: "#E7FB10" },
          { icon: "🔥", text: "Fat Oxidation ↑", y: 98, color: "#f97316" },
          { icon: "💪", text: "Type I Fibers", y: 118, color: "#21d8ff" },
          { icon: "📊", text: "Glucose Control", y: 138, color: "#9d4edd" },
        ].map((benefit, i) => (
          <motion.g key={benefit.text}>
            <motion.text x="292" y={benefit.y} fill={benefit.color} fontSize="10"
              initial={{ opacity: 0, x: -10 }}
              animate={isInView ? { 
                opacity: 1, 
                x: 0,
                scale: activePhase === 3 ? 1.1 : 1
              } : {}}
              transition={{ delay: 0.1 * i }}
            >
              {benefit.icon}
            </motion.text>
            <motion.text x="307" y={benefit.y} fill="rgba(255,255,255,0.8)" fontSize="8"
              initial={{ opacity: 0, x: -10 }}
              animate={isInView ? { 
                opacity: 1, 
                x: 0,
                fill: activePhase === 3 ? "#ffffff" : "rgba(255,255,255,0.8)"
              } : {}}
              transition={{ delay: 0.1 * i }}
            >
              {benefit.text}
            </motion.text>
          </motion.g>
        ))}

        {[0, 1, 2].map((i) => (
          <motion.circle
            key={`pulse-${i}`}
            r="4"
            fill="#E7FB10"
            initial={{ opacity: 0 }}
            animate={isInView ? {
              cx: [110, 150, 235, 275],
              cy: [100, 100, 100, 100],
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1, 1, 0.5]
            } : {}}
            transition={{
              duration: 2,
              delay: 2.5 + i * 0.6,
              repeat: Infinity,
              repeatDelay: 1,
              ease: "easeInOut"
            }}
            style={{ filter: 'drop-shadow(0 0 8px rgba(231, 251, 16, 0.8))' }}
          />
        ))}

        <motion.text x="200" y="188" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 2.8 }}
        >
          First-in-class ERR pan-agonist mimics endurance exercise benefits
        </motion.text>
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
