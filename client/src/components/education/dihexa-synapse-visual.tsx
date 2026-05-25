import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Brain, Network, Sparkles, Shield, Zap } from "lucide-react";
import { useHoverCapable, hoverIf } from "@/hooks/use-hover-capable";

interface SynapsePhase {
  id: number;
  label: string;
  color: string;
  icon: typeof Brain;
  description: string;
}

const synapsePhases: SynapsePhase[] = [
  { id: 0, label: "HGF Binding", icon: Zap, color: "#D4FF1F", description: "Dihexa binds HGF with ultra-high affinity (Kd ≈ 65 pM)" },
  { id: 1, label: "c-Met Activation", icon: Network, color: "#21d8ff", description: "Potentiates c-Met receptor phosphorylation" },
  { id: 2, label: "Synaptogenesis", icon: Sparkles, color: "#9d4edd", description: "New synaptic connections form in hippocampus" },
  { id: 3, label: "Neuroprotection", icon: Shield, color: "#ec4899", description: "Enhanced neuronal survival and cognitive function" },
];

function SynapseFormationAnimation({ isInView, activePhase }: { isInView: boolean; activePhase: number }) {
  const dendrites = [
    { x1: 200, y1: 100, x2: 140, y2: 50 },
    { x1: 200, y1: 100, x2: 200, y2: 40 },
    { x1: 200, y1: 100, x2: 260, y2: 50 },
    { x1: 200, y1: 100, x2: 130, y2: 90 },
    { x1: 200, y1: 100, x2: 270, y2: 90 },
  ];

  const spines = [
    { cx: 135, cy: 48, delay: 0.5 },
    { cx: 200, cy: 35, delay: 0.7 },
    { cx: 265, cy: 48, delay: 0.9 },
    { cx: 125, cy: 88, delay: 1.1 },
    { cx: 275, cy: 88, delay: 1.3 },
    { cx: 155, cy: 60, delay: 1.5 },
    { cx: 245, cy: 60, delay: 1.7 },
  ];

  return (
    <div className="relative w-full h-56 flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 rounded-xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(157, 77, 221, 0.12) 0%, transparent 70%)'
        }}
      />
      
      <svg viewBox="0 0 400 200" className="w-full h-full max-w-lg">
        <defs>
          <filter id="synapseGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <radialGradient id="neuronGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#9d4edd" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#9d4edd" stopOpacity="0.1"/>
          </radialGradient>
        </defs>

        <motion.circle
          cx="200" cy="100" r="20"
          fill="url(#neuronGradient)"
          stroke="#9d4edd"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ duration: 0.5 }}
          filter="url(#synapseGlow)"
        />
        <motion.text x="200" y="104" textAnchor="middle" fill="#9d4edd" fontSize="8" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
        >
          NEURON
        </motion.text>

        {dendrites.map((d, i) => (
          <motion.line
            key={`dendrite-${i}`}
            x1={d.x1} y1={d.y1} x2={d.x2} y2={d.y2}
            stroke="#9d4edd"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={isInView ? { pathLength: 1, opacity: 0.8 } : {}}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
          />
        ))}

        {spines.map((spine, i) => (
          <motion.g key={`spine-${i}`}>
            <motion.circle
              cx={spine.cx} cy={spine.cy} r="6"
              fill={activePhase >= 2 ? "rgba(33, 216, 255, 0.3)" : "hsl(var(--foreground) / 0.1)"}
              stroke={activePhase >= 2 ? "#21d8ff" : "hsl(var(--foreground) / 0.3)"}
              strokeWidth="1.5"
              initial={{ scale: 0, opacity: 0 }}
              animate={isInView && activePhase >= 2 ? { 
                scale: [0, 1.2, 1],
                opacity: 1
              } : { scale: 0, opacity: 0 }}
              transition={{ delay: spine.delay, duration: 0.4 }}
              filter={activePhase >= 2 ? "url(#synapseGlow)" : undefined}
            />
            {activePhase >= 3 && (
              <motion.circle
                cx={spine.cx} cy={spine.cy} r="3"
                fill="#D4FF1F"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ delay: spine.delay + 0.5, duration: 1, repeat: Infinity }}
                style={{ filter: 'drop-shadow(0 0 4px rgba(231, 251, 16, 0.8))' }}
              />
            )}
          </motion.g>
        ))}

        <motion.g>
          <motion.circle
            cx="50" cy="100" r="18"
            fill="rgba(231, 251, 16, 0.2)"
            stroke="#D4FF1F"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={isInView && activePhase >= 0 ? { scale: 1 } : {}}
            transition={{ delay: 0.3 }}
            filter="url(#synapseGlow)"
          />
          <motion.text x="50" y="98" textAnchor="middle" fill="#D4FF1F" fontSize="7" fontWeight="bold"
            initial={{ opacity: 0 }}
            animate={isInView && activePhase >= 0 ? { opacity: 1 } : {}}
          >
            DIHEXA
          </motion.text>
          <motion.text x="50" y="107" textAnchor="middle" fill="#D4FF1F" fontSize="5"
            initial={{ opacity: 0 }}
            animate={isInView && activePhase >= 0 ? { opacity: 1 } : {}}
          >
            + HGF
          </motion.text>
        </motion.g>

        <motion.g>
          <motion.rect
            x="315" y="85" width="60" height="30" rx="6"
            fill="rgba(33, 216, 255, 0.2)"
            stroke="#21d8ff"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={isInView && activePhase >= 1 ? { scale: 1 } : {}}
            transition={{ delay: 0.5 }}
          />
          <motion.text x="345" y="103" textAnchor="middle" fill="#21d8ff" fontSize="8" fontWeight="bold"
            initial={{ opacity: 0 }}
            animate={isInView && activePhase >= 1 ? { opacity: 1 } : {}}
          >
            c-Met
          </motion.text>
        </motion.g>

        {activePhase >= 0 && (
          <motion.path
            d="M 70 100 Q 100 80 130 90"
            stroke="#D4FF1F"
            strokeWidth="2"
            strokeDasharray="4,4"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : {}}
            transition={{ delay: 0.6, duration: 0.8 }}
          />
        )}

        {activePhase >= 1 && (
          <motion.path
            d="M 270 90 Q 290 85 310 90"
            stroke="#21d8ff"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : {}}
            transition={{ delay: 0.8, duration: 0.5 }}
          />
        )}

        {activePhase >= 1 && [0, 1, 2].map((i) => (
          <motion.circle
            key={`signal-${i}`}
            r="3"
            fill="#21d8ff"
            initial={{ opacity: 0 }}
            animate={{
              cx: [130, 160, 195],
              cy: [90, 95, 100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              delay: 1 + i * 0.4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ filter: 'drop-shadow(0 0 4px rgba(33, 216, 255, 0.8))' }}
          />
        ))}

        <motion.text
          x="200" y="185"
          textAnchor="middle"
          fill="#9d4edd"
          fontSize="10"
          fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView && activePhase >= 3 ? { opacity: 1 } : {}}
          transition={{ delay: 2 }}
          style={{ textShadow: '0 0 8px rgba(157, 77, 221, 0.5)' }}
        >
          7× More Potent Than BDNF for Neurogenesis
        </motion.text>
      </svg>
    </div>
  );
}

export function DihexaSynapseVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const hoverCapable = useHoverCapable();
  const [activePhase, setActivePhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying || !isInView) return;
    
    const interval = setInterval(() => {
      setActivePhase((prev) => (prev + 1) % synapsePhases.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isPlaying, isInView]);

  return (
    <div ref={containerRef} className="relative">
      <div 
        className="absolute inset-0 h-full w-full rounded-2xl blur-3xl -z-10"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(157, 77, 221, 0.08) 0%, transparent 70%)'
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
            background: 'linear-gradient(135deg, rgba(157, 77, 221, 0.15) 0%, rgba(33, 216, 255, 0.05) 100%)',
            borderColor: '#9d4edd',
            boxShadow: '0 0 20px rgba(157, 77, 221, 0.3)'
          }}
        >
          <Brain className="h-5 w-5 text-[#9d4edd]" style={{ filter: 'drop-shadow(0 0 4px rgba(157, 77, 221, 0.6))' }} />
          <span className="text-sm font-bold bg-gradient-to-r from-[#9d4edd] to-[#21d8ff] bg-clip-text text-transparent">
            HGF/c-Met Synaptogenesis
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          How Dihexa promotes new synaptic connections through HGF pathway activation
        </p>
      </motion.div>

      <div 
        className="rounded-xl border p-6 mb-6"
        style={{ 
          borderColor: 'rgba(157, 77, 221, 0.3)',
          background: 'linear-gradient(135deg, rgba(157, 77, 221, 0.05) 0%, transparent 50%)'
        }}
      >
        <SynapseFormationAnimation isInView={isInView} activePhase={activePhase} />
        
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Neurogenic Pathway
            </span>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-xs px-3 py-1 rounded-full transition-all"
              style={{
                backgroundColor: isPlaying ? 'rgba(157, 77, 221, 0.2)' : 'hsl(var(--foreground) / 0.1)',
                color: isPlaying ? '#9d4edd' : 'hsl(var(--foreground) / 0.5)',
                border: `1px solid ${isPlaying ? 'rgba(157, 77, 221, 0.4)' : 'hsl(var(--foreground) / 0.1)'}`
              }}
              data-testid="button-toggle-animation"
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {synapsePhases.map((phase) => {
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
                  whileHover={hoverIf(hoverCapable, { scale: 1.02 })}
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
              backgroundColor: `${synapsePhases[activePhase].color}10`,
              border: `1px solid ${synapsePhases[activePhase].color}30`
            }}
          >
            <p className="text-sm text-muted-foreground">
              {synapsePhases[activePhase].description}
            </p>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="text-center text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 2 }}
      >
        <span className="px-3 py-1 rounded-full bg-muted/30">
          Dihexa synaptogenesis visualization • For educational purposes only
        </span>
      </motion.div>
    </div>
  );
}
