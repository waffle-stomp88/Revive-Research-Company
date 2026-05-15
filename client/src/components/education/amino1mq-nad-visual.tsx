import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Battery, Zap, Activity, Flame, TrendingUp } from "lucide-react";
import { useHoverCapable, hoverIf } from "@/hooks/use-hover-capable";

interface PathwayStep {
  id: number;
  label: string;
  color: string;
  icon: typeof Battery;
  description: string;
}

const pathwaySteps: PathwayStep[] = [
  { id: 0, label: "NNMT Active", icon: Activity, color: "#ef4444", description: "NNMT depletes NAD+ by methylating nicotinamide" },
  { id: 1, label: "5-Amino-1MQ", icon: Zap, color: "#E7FB10", description: "5-Amino-1MQ inhibits NNMT (IC₅₀ = 1.2 μM)" },
  { id: 2, label: "NAD+ Preserved", icon: Battery, color: "#21d8ff", description: "NAD+ levels restored for cellular energy" },
  { id: 3, label: "Metabolism Boost", icon: Flame, color: "#ec4899", description: "Enhanced mitochondrial function and fat oxidation" },
];

function NADSalvageAnimation({ isInView, activeStep }: { isInView: boolean; activeStep: number }) {
  return (
    <div className="relative w-full h-56 flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 rounded-xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(231, 251, 16, 0.1) 0%, transparent 70%)'
        }}
      />
      
      <svg viewBox="0 0 400 200" className="w-full h-full max-w-lg">
        <defs>
          <filter id="nadGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="nadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="33%" stopColor="#E7FB10" />
            <stop offset="66%" stopColor="#21d8ff" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>

        <motion.rect
          x="20" y="70" width="70" height="50" rx="8"
          fill={activeStep >= 0 ? "rgba(239, 68, 68, 0.2)" : "hsl(var(--foreground) / 0.05)"}
          stroke={activeStep >= 0 ? "#ef4444" : "hsl(var(--foreground) / 0.2)"}
          strokeWidth="2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.2 }}
        />
        <motion.text x="55" y="92" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
        >
          NNMT
        </motion.text>
        <motion.text x="55" y="105" textAnchor="middle" fill="currentColor" fillOpacity="0.6" fontSize="7"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          (Depletes NAD+)
        </motion.text>

        <motion.circle
          cx="160" cy="95" r="25"
          fill="rgba(231, 251, 16, 0.2)"
          stroke="#E7FB10"
          strokeWidth="3"
          filter="url(#nadGlow)"
          initial={{ scale: 0 }}
          animate={isInView && activeStep >= 1 ? { 
            scale: [1, 1.15, 1],
          } : { scale: 0 }}
          transition={{ duration: 1.5, repeat: activeStep === 1 ? Infinity : 0 }}
          style={{ filter: 'drop-shadow(0 0 15px rgba(231, 251, 16, 0.6))' }}
        />
        <motion.text x="160" y="90" textAnchor="middle" fill="#E7FB10" fontSize="8" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView && activeStep >= 1 ? { opacity: 1 } : {}}
        >
          5-AMINO
        </motion.text>
        <motion.text x="160" y="102" textAnchor="middle" fill="#E7FB10" fontSize="9" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView && activeStep >= 1 ? { opacity: 1 } : {}}
        >
          1MQ
        </motion.text>

        <motion.path
          d="M 95 95 L 130 95"
          stroke={activeStep >= 1 ? "#E7FB10" : "hsl(var(--foreground) / 0.3)"}
          strokeWidth="2"
          strokeDasharray={activeStep >= 1 ? "0" : "5,5"}
          fill="none"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ delay: 0.6 }}
          markerEnd="url(#arrowhead)"
        />
        
        <motion.line
          x1="100" y1="75" x2="125" y2="115"
          stroke="#ef4444"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={isInView && activeStep >= 1 ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
        />

        <motion.rect
          x="210" y="70" width="70" height="50" rx="8"
          fill={activeStep >= 2 ? "rgba(33, 216, 255, 0.2)" : "hsl(var(--foreground) / 0.05)"}
          stroke={activeStep >= 2 ? "#21d8ff" : "hsl(var(--foreground) / 0.2)"}
          strokeWidth="2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.3 }}
        />
        <motion.text x="245" y="92" textAnchor="middle" fill="#21d8ff" fontSize="11" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView && activeStep >= 2 ? { opacity: 1 } : {}}
        >
          NAD+
        </motion.text>
        <motion.text x="245" y="105" textAnchor="middle" fill="currentColor" fillOpacity="0.6" fontSize="7"
          initial={{ opacity: 0 }}
          animate={isInView && activeStep >= 2 ? { opacity: 1 } : {}}
        >
          (Preserved)
        </motion.text>

        <motion.path
          d="M 185 95 L 205 95"
          stroke={activeStep >= 2 ? "#21d8ff" : "hsl(var(--foreground) / 0.3)"}
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ delay: 0.9 }}
        />

        <motion.rect
          x="310" y="70" width="70" height="50" rx="8"
          fill={activeStep >= 3 ? "rgba(236, 72, 153, 0.2)" : "hsl(var(--foreground) / 0.05)"}
          stroke={activeStep >= 3 ? "#ec4899" : "hsl(var(--foreground) / 0.2)"}
          strokeWidth="2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.4 }}
        />
        <motion.text x="345" y="88" textAnchor="middle" fill="#ec4899" fontSize="8" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView && activeStep >= 3 ? { opacity: 1 } : {}}
        >
          METABOLISM
        </motion.text>
        <motion.text x="345" y="100" textAnchor="middle" fill="#ec4899" fontSize="9" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView && activeStep >= 3 ? { opacity: 1 } : {}}
        >
          BOOST
        </motion.text>
        <motion.text x="345" y="112" textAnchor="middle" fill="currentColor" fillOpacity="0.6" fontSize="6"
          initial={{ opacity: 0 }}
          animate={isInView && activeStep >= 3 ? { opacity: 1 } : {}}
        >
          (Sirtuins Active)
        </motion.text>

        <motion.path
          d="M 285 95 L 305 95"
          stroke={activeStep >= 3 ? "#ec4899" : "hsl(var(--foreground) / 0.3)"}
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ delay: 1.1 }}
        />

        {activeStep >= 2 && [0, 1, 2].map((i) => (
          <motion.circle
            key={`energy-${i}`}
            r="4"
            fill="#21d8ff"
            initial={{ opacity: 0 }}
            animate={{
              cx: [245, 280, 315],
              cy: [95, 85 + i * 10, 95],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              delay: 1.5 + i * 0.3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ filter: 'drop-shadow(0 0 4px rgba(33, 216, 255, 0.8))' }}
          />
        ))}

        <motion.text
          x="200" y="175"
          textAnchor="middle"
          fill="#E7FB10"
          fontSize="11"
          fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView && activeStep >= 3 ? { opacity: 1 } : {}}
          transition={{ delay: 1.5 }}
          style={{ textShadow: '0 0 8px rgba(231, 251, 16, 0.5)' }}
        >
          NNMT Inhibition → NAD+ Restoration → Enhanced Cellular Energy
        </motion.text>
      </svg>
    </div>
  );
}

export function Amino1MQNADVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const hoverCapable = useHoverCapable();
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying || !isInView) return;
    
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % pathwaySteps.length);
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
            background: 'linear-gradient(135deg, rgba(231, 251, 16, 0.15) 0%, rgba(33, 216, 255, 0.05) 100%)',
            borderColor: '#E7FB10',
            boxShadow: '0 0 20px rgba(231, 251, 16, 0.3)'
          }}
        >
          <Battery className="h-5 w-5 text-[#E7FB10]" style={{ filter: 'drop-shadow(0 0 4px rgba(231, 251, 16, 0.6))' }} />
          <span className="text-sm font-bold bg-gradient-to-r from-[#E7FB10] to-[#21d8ff] bg-clip-text text-transparent">
            NAD+ Salvage Pathway
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          How 5-Amino-1MQ preserves NAD+ by inhibiting NNMT enzyme activity
        </p>
      </motion.div>

      <div 
        className="rounded-xl border p-6 mb-6"
        style={{ 
          borderColor: 'rgba(231, 251, 16, 0.3)',
          background: 'linear-gradient(135deg, rgba(231, 251, 16, 0.05) 0%, transparent 50%)'
        }}
      >
        <NADSalvageAnimation isInView={isInView} activeStep={activeStep} />
        
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Inhibition Pathway
            </span>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-xs px-3 py-1 rounded-full transition-all"
              style={{
                backgroundColor: isPlaying ? 'rgba(231, 251, 16, 0.2)' : 'hsl(var(--foreground) / 0.1)',
                color: isPlaying ? '#E7FB10' : 'hsl(var(--foreground) / 0.5)',
                border: `1px solid ${isPlaying ? 'rgba(231, 251, 16, 0.4)' : 'hsl(var(--foreground) / 0.1)'}`
              }}
              data-testid="button-toggle-animation"
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {pathwaySteps.map((step) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              
              return (
                <motion.button
                  key={step.id}
                  onClick={() => {
                    setActiveStep(step.id);
                    setIsPlaying(false);
                  }}
                  className="relative p-3 rounded-lg text-center transition-all cursor-pointer"
                  style={{
                    backgroundColor: isActive ? `${step.color}20` : 'hsl(var(--foreground) / 0.03)',
                    border: `1.5px solid ${isActive ? step.color : 'hsl(var(--foreground) / 0.1)'}`,
                    boxShadow: isActive ? `0 0 20px ${step.color}30` : 'none'
                  }}
                  whileHover={hoverIf(hoverCapable, { scale: 1.02 })}
                  whileTap={{ scale: 0.98 }}
                  data-testid={`step-${step.id}`}
                >
                  <motion.div
                    className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center"
                    style={{ backgroundColor: `${step.color}20` }}
                    animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
                  >
                    <Icon className="h-4 w-4" style={{ color: step.color, filter: `drop-shadow(0 0 4px ${step.color})` }} />
                  </motion.div>
                  <span className="text-[10px] font-bold block" style={{ color: isActive ? step.color : 'hsl(var(--foreground) / 0.6)' }}>
                    {step.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
          
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-lg text-center"
            style={{
              backgroundColor: `${pathwaySteps[activeStep].color}10`,
              border: `1px solid ${pathwaySteps[activeStep].color}30`
            }}
          >
            <p className="text-sm text-muted-foreground">
              {pathwaySteps[activeStep].description}
            </p>
          </motion.div>
        </div>

        <div className="mt-6 pt-6 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-[#21d8ff]" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Research Benefits
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Adipocyte Size", value: "↓ 30%" },
              { label: "Cholesterol", value: "↓ 30%" },
              { label: "Peak Torque", value: "↑ 70%" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="p-2 rounded-lg"
                style={{ backgroundColor: 'rgba(33, 216, 255, 0.1)', border: '1px solid rgba(33, 216, 255, 0.2)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 1.5 + i * 0.1 }}
              >
                <div className="text-lg font-bold text-[#21d8ff]">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground">{stat.label}</div>
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
          5-Amino-1MQ NNMT inhibition visualization • For educational purposes only
        </span>
      </motion.div>
    </div>
  );
}
