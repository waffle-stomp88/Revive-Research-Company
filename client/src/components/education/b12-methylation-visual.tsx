import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Brain, Heart, Dna, Activity, Droplets } from "lucide-react";

interface B12Phase {
  id: number;
  label: string;
  color: string;
  icon: typeof Brain;
  description: string;
}

const b12Phases: B12Phase[] = [
  { id: 0, label: "Absorption", icon: Droplets, color: "#ef4444", description: "B12 binds intrinsic factor in stomach for ileal absorption" },
  { id: 1, label: "Methylation", icon: Dna, color: "#E7FB10", description: "Methylcobalamin transfers methyl groups for DNA synthesis" },
  { id: 2, label: "Homocysteine", icon: Heart, color: "#21d8ff", description: "Converts homocysteine to methionine, reducing CVD risk" },
  { id: 3, label: "Nerve Function", icon: Brain, color: "#ec4899", description: "Supports myelin synthesis and nerve signal transmission" },
];

function B12PathwayAnimation({ isInView, activePhase }: { isInView: boolean; activePhase: number }) {
  return (
    <div className="relative w-full h-56 flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 rounded-xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(239, 68, 68, 0.08) 0%, transparent 70%)'
        }}
      />
      
      <svg viewBox="0 0 400 200" className="w-full h-full max-w-lg">
        <defs>
          <filter id="b12Glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="b12Gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#E7FB10" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>

        <motion.g>
          <motion.ellipse
            cx="60" cy="100" rx="35" ry="25"
            fill={activePhase >= 0 ? "rgba(239, 68, 68, 0.15)" : "hsl(var(--foreground) / 0.05)"}
            stroke={activePhase >= 0 ? "#ef4444" : "hsl(var(--foreground) / 0.2)"}
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: 0.2 }}
          />
          <motion.text x="60" y="95" textAnchor="middle" fill="#ef4444" fontSize="8" fontWeight="bold"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
          >
            GI TRACT
          </motion.text>
          <motion.text x="60" y="108" textAnchor="middle" fill="currentColor" fillOpacity="0.5" fontSize="6"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
          >
            + Intrinsic Factor
          </motion.text>
        </motion.g>

        <motion.circle
          cx="60" cy="55" r="12"
          fill="rgba(239, 68, 68, 0.3)"
          stroke="#ef4444"
          strokeWidth="2"
          initial={{ scale: 0, y: -20 }}
          animate={isInView && activePhase >= 0 ? { 
            scale: 1, 
            y: 0,
          } : {}}
          transition={{ type: "spring", delay: 0.5 }}
          filter="url(#b12Glow)"
        />
        <motion.text x="60" y="58" textAnchor="middle" fill="#ef4444" fontSize="7" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView && activePhase >= 0 ? { opacity: 1 } : {}}
        >
          B12
        </motion.text>

        {activePhase >= 0 && (
          <motion.path
            d="M 60 70 L 60 75"
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="3,3"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : {}}
            transition={{ delay: 0.8 }}
          />
        )}

        <motion.g>
          <motion.circle
            cx="160" cy="100" r="28"
            fill={activePhase >= 1 ? "rgba(231, 251, 16, 0.2)" : "hsl(var(--foreground) / 0.05)"}
            stroke={activePhase >= 1 ? "#E7FB10" : "hsl(var(--foreground) / 0.2)"}
            strokeWidth={activePhase >= 1 ? 3 : 2}
            initial={{ scale: 0 }}
            animate={isInView ? { 
              scale: activePhase === 1 ? [1, 1.08, 1] : 1
            } : {}}
            transition={{ duration: 1.5, repeat: activePhase === 1 ? Infinity : 0 }}
            filter={activePhase >= 1 ? "url(#b12Glow)" : undefined}
          />
          <motion.text x="160" y="95" textAnchor="middle" fill="#E7FB10" fontSize="8" fontWeight="bold"
            initial={{ opacity: 0 }}
            animate={isInView && activePhase >= 1 ? { opacity: 1 } : {}}
          >
            METHYL
          </motion.text>
          <motion.text x="160" y="107" textAnchor="middle" fill="#E7FB10" fontSize="8" fontWeight="bold"
            initial={{ opacity: 0 }}
            animate={isInView && activePhase >= 1 ? { opacity: 1 } : {}}
          >
            -B12
          </motion.text>
        </motion.g>

        {activePhase >= 1 && (
          <motion.path
            d="M 95 100 L 128 100"
            stroke="#E7FB10"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : {}}
            transition={{ delay: 0.5 }}
            markerEnd="url(#arrow)"
          />
        )}

        <motion.g>
          <motion.rect
            x="220" y="50" width="60" height="40" rx="8"
            fill={activePhase >= 2 ? "rgba(33, 216, 255, 0.2)" : "hsl(var(--foreground) / 0.05)"}
            stroke={activePhase >= 2 ? "#21d8ff" : "hsl(var(--foreground) / 0.2)"}
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: 0.4 }}
          />
          <motion.text x="250" y="68" textAnchor="middle" fill="#21d8ff" fontSize="7" fontWeight="bold"
            initial={{ opacity: 0 }}
            animate={isInView && activePhase >= 2 ? { opacity: 1 } : {}}
          >
            HOMOCYST.
          </motion.text>
          <motion.text x="250" y="80" textAnchor="middle" fill="rgba(33, 216, 255, 0.7)" fontSize="6"
            initial={{ opacity: 0 }}
            animate={isInView && activePhase >= 2 ? { opacity: 1 } : {}}
          >
            → Methionine
          </motion.text>
        </motion.g>

        {activePhase >= 1 && (
          <motion.path
            d="M 185 85 L 218 70"
            stroke="#21d8ff"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : {}}
            transition={{ delay: 0.7 }}
          />
        )}

        <motion.g>
          <motion.rect
            x="220" y="110" width="60" height="40" rx="8"
            fill={activePhase >= 2 ? "rgba(33, 216, 255, 0.15)" : "hsl(var(--foreground) / 0.05)"}
            stroke={activePhase >= 2 ? "#21d8ff" : "hsl(var(--foreground) / 0.2)"}
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: 0.5 }}
          />
          <motion.text x="250" y="128" textAnchor="middle" fill="#21d8ff" fontSize="7" fontWeight="bold"
            initial={{ opacity: 0 }}
            animate={isInView && activePhase >= 2 ? { opacity: 1 } : {}}
          >
            SAM
          </motion.text>
          <motion.text x="250" y="140" textAnchor="middle" fill="rgba(33, 216, 255, 0.7)" fontSize="6"
            initial={{ opacity: 0 }}
            animate={isInView && activePhase >= 2 ? { opacity: 1 } : {}}
          >
            (Methyl Donor)
          </motion.text>
        </motion.g>

        {activePhase >= 1 && (
          <motion.path
            d="M 185 115 L 218 125"
            stroke="#21d8ff"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : {}}
            transition={{ delay: 0.8 }}
          />
        )}

        <motion.g>
          <motion.ellipse
            cx="340" cy="100" rx="40" ry="35"
            fill={activePhase >= 3 ? "rgba(236, 72, 153, 0.15)" : "hsl(var(--foreground) / 0.05)"}
            stroke={activePhase >= 3 ? "#ec4899" : "hsl(var(--foreground) / 0.2)"}
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={isInView ? { 
              scale: activePhase === 3 ? [1, 1.05, 1] : 1
            } : {}}
            transition={{ duration: 2, repeat: activePhase === 3 ? Infinity : 0 }}
          />
          <motion.text x="340" y="90" textAnchor="middle" fill="#ec4899" fontSize="8" fontWeight="bold"
            initial={{ opacity: 0 }}
            animate={isInView && activePhase >= 3 ? { opacity: 1 } : {}}
          >
            MYELIN
          </motion.text>
          <motion.text x="340" y="103" textAnchor="middle" fill="#ec4899" fontSize="8" fontWeight="bold"
            initial={{ opacity: 0 }}
            animate={isInView && activePhase >= 3 ? { opacity: 1 } : {}}
          >
            SYNTHESIS
          </motion.text>
          <motion.text x="340" y="118" textAnchor="middle" fill="rgba(236, 72, 153, 0.7)" fontSize="6"
            initial={{ opacity: 0 }}
            animate={isInView && activePhase >= 3 ? { opacity: 1 } : {}}
          >
            Nerve Protection
          </motion.text>
        </motion.g>

        {activePhase >= 2 && (
          <motion.path
            d="M 282 100 L 298 100"
            stroke="#ec4899"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : {}}
            transition={{ delay: 1 }}
          />
        )}

        {activePhase >= 2 && [0, 1].map((i) => (
          <motion.circle
            key={`methyl-${i}`}
            r="4"
            fill="#E7FB10"
            initial={{ opacity: 0 }}
            animate={{
              cx: [188, 210, 235],
              cy: [100, 80 + i * 40, 70 + i * 60],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              delay: 1 + i * 0.4,
              repeat: activePhase >= 2 ? Infinity : 0,
              ease: "easeInOut"
            }}
            style={{ filter: 'drop-shadow(0 0 4px rgba(231, 251, 16, 0.8))' }}
          />
        ))}

        <motion.text
          x="200" y="185"
          textAnchor="middle"
          fill="currentColor" fillOpacity="0.6"
          fontSize="9"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 2 }}
        >
          Methylcobalamin: Active Coenzyme Form in Cytoplasm
        </motion.text>
      </svg>
    </div>
  );
}

export function B12MethylationVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const [activePhase, setActivePhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying || !isInView) return;
    
    const interval = setInterval(() => {
      setActivePhase((prev) => (prev + 1) % b12Phases.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isPlaying, isInView]);

  return (
    <div ref={containerRef} className="relative">
      <div 
        className="absolute inset-0 h-full w-full rounded-2xl blur-3xl -z-10"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(239, 68, 68, 0.08) 0%, transparent 70%)'
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
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(236, 72, 153, 0.05) 100%)',
            borderColor: '#ef4444',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)'
          }}
        >
          <Dna className="h-5 w-5 text-[#ef4444]" style={{ filter: 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.6))' }} />
          <span className="text-sm font-bold bg-gradient-to-r from-[#ef4444] to-[#ec4899] bg-clip-text text-transparent">
            B12 Methylation Pathway
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          How Vitamin B12 supports DNA synthesis, homocysteine metabolism, and nerve function
        </p>
      </motion.div>

      <div 
        className="rounded-xl border p-6 mb-6"
        style={{ 
          borderColor: 'rgba(239, 68, 68, 0.3)',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, transparent 50%)'
        }}
      >
        <B12PathwayAnimation isInView={isInView} activePhase={activePhase} />
        
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Cobalamin Functions
            </span>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-xs px-3 py-1 rounded-full transition-all"
              style={{
                backgroundColor: isPlaying ? 'rgba(239, 68, 68, 0.2)' : 'hsl(var(--foreground) / 0.1)',
                color: isPlaying ? '#ef4444' : 'hsl(var(--foreground) / 0.5)',
                border: `1px solid ${isPlaying ? 'rgba(239, 68, 68, 0.4)' : 'hsl(var(--foreground) / 0.1)'}`
              }}
              data-testid="button-toggle-animation"
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {b12Phases.map((phase) => {
              const Icon = phase.icon;
              const isActive = activePhase === phase.id;
              
              return (
                <motion.button
                  key={phase.id}
                  onClick={() => {
                    setActivePhase(phase.id);
                    setIsPlaying(false);
                  }}
                  className="relative p-3 rounded-lg text-center transition-all cursor-pointer"
                  style={{
                    backgroundColor: isActive ? `${phase.color}20` : 'hsl(var(--foreground) / 0.03)',
                    border: `1.5px solid ${isActive ? phase.color : 'hsl(var(--foreground) / 0.1)'}`,
                    boxShadow: isActive ? `0 0 20px ${phase.color}30` : 'none'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  data-testid={`phase-${phase.id}`}
                >
                  <motion.div
                    className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center"
                    style={{ backgroundColor: `${phase.color}20` }}
                    animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
                  >
                    <Icon className="h-4 w-4" style={{ color: phase.color, filter: `drop-shadow(0 0 4px ${phase.color})` }} />
                  </motion.div>
                  <span className="text-[10px] font-bold block" style={{ color: isActive ? phase.color : 'hsl(var(--foreground) / 0.6)' }}>
                    {phase.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
          
          <motion.div
            key={activePhase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-lg text-center"
            style={{
              backgroundColor: `${b12Phases[activePhase].color}10`,
              border: `1px solid ${b12Phases[activePhase].color}30`
            }}
          >
            <p className="text-sm text-muted-foreground">
              {b12Phases[activePhase].description}
            </p>
          </motion.div>
        </div>

        <div className="mt-6 pt-6 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-[#21d8ff]" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Forms
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            {[
              { label: "Methylcobalamin", location: "Cytoplasmic", function: "Methyl transfer" },
              { label: "Adenosylcobalamin", location: "Mitochondrial", function: "Energy metabolism" }
            ].map((form, i) => (
              <motion.div
                key={i}
                className="p-3 rounded-lg"
                style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.2)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 1.5 + i * 0.1 }}
              >
                <div className="text-sm font-bold text-[#ec4899]">{form.label}</div>
                <div className="text-[10px] text-muted-foreground">{form.location}</div>
                <div className="text-[9px] text-muted-foreground mt-1">{form.function}</div>
              </motion.div>
            ))}
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
          Vitamin B12 methylation pathway • For educational purposes only
        </span>
      </motion.div>
    </div>
  );
}
