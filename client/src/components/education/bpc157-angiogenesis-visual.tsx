import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Heart, Zap, Activity, Shield, Droplets } from "lucide-react";
import { useHoverCapable, hoverIf } from "@/hooks/use-hover-capable";

interface VesselBranch {
  id: number;
  path: string;
  delay: number;
  color: string;
}

function AnimatedBloodVessels({ isInView, activePhase }: { isInView: boolean; activePhase: number }) {
  const vesselBranches: VesselBranch[] = [
    { id: 1, path: "M 150 180 Q 150 140 150 100", delay: 0, color: "#D4FF1F" },
    { id: 2, path: "M 150 100 Q 120 80 90 60", delay: 0.3, color: "#D4FF1F" },
    { id: 3, path: "M 150 100 Q 180 80 210 60", delay: 0.4, color: "#D4FF1F" },
    { id: 4, path: "M 90 60 Q 60 50 40 30", delay: 0.7, color: "#21d8ff" },
    { id: 5, path: "M 90 60 Q 80 40 70 20", delay: 0.8, color: "#21d8ff" },
    { id: 6, path: "M 210 60 Q 230 50 250 30", delay: 0.9, color: "#21d8ff" },
    { id: 7, path: "M 210 60 Q 220 40 230 20", delay: 1.0, color: "#21d8ff" },
    { id: 8, path: "M 40 30 Q 25 20 15 10", delay: 1.3, color: "#ec4899" },
    { id: 9, path: "M 250 30 Q 265 20 275 10", delay: 1.4, color: "#ec4899" },
    { id: 10, path: "M 70 20 Q 55 10 45 5", delay: 1.5, color: "#ec4899" },
    { id: 11, path: "M 230 20 Q 245 10 255 5", delay: 1.6, color: "#ec4899" },
  ];

  return (
    <div className="relative w-full h-48 flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 rounded-xl"
        style={{
          background: 'radial-gradient(ellipse at center bottom, rgba(212, 255, 31, 0.15) 0%, transparent 70%)'
        }}
      />
      
      <svg viewBox="0 0 300 200" className="w-full h-full max-w-md">
        <defs>
          <filter id="vesselGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="vesselGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#D4FF1F" />
            <stop offset="50%" stopColor="#21d8ff" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        
        <motion.circle
          cx="150"
          cy="185"
          r="12"
          fill="#D4FF1F"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ filter: 'drop-shadow(0 0 10px rgba(212, 255, 31, 0.8))' }}
        />
        <motion.text
          x="150"
          y="188"
          textAnchor="middle"
          fill="#1a1a1f"
          fontSize="8"
          fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          BPC
        </motion.text>
        
        {vesselBranches.map((branch) => (
          <motion.path
            key={branch.id}
            d={branch.path}
            fill="none"
            stroke={branch.color}
            strokeWidth={branch.id <= 3 ? 4 : branch.id <= 7 ? 3 : 2}
            strokeLinecap="round"
            filter="url(#vesselGlow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={isInView && activePhase >= Math.floor(branch.delay / 0.5) ? { 
              pathLength: 1, 
              opacity: 1 
            } : {}}
            transition={{ 
              duration: 1.5, 
              delay: branch.delay,
              ease: "easeOut"
            }}
          />
        ))}
        
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.circle
            key={`particle-${i}`}
            r="3"
            fill="#ef4444"
            style={{ filter: 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.8))' }}
            initial={{ opacity: 0 }}
            animate={isInView ? {
              opacity: [0, 1, 1, 0],
              cx: [150, 150 + (i % 2 === 0 ? -60 - i * 10 : 60 + i * 10), 150 + (i % 2 === 0 ? -100 - i * 15 : 100 + i * 15)],
              cy: [180, 100, 30],
            } : {}}
            transition={{
              duration: 3,
              delay: 1 + i * 0.5,
              repeat: Infinity,
              repeatDelay: 1,
              ease: "easeOut"
            }}
          />
        ))}
        
        <motion.text
          x="150"
          y="12"
          textAnchor="middle"
          fill="#D4FF1F"
          fontSize="10"
          fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: [0, 1] } : {}}
          transition={{ delay: 2.5 }}
          style={{ textShadow: '0 0 8px rgba(212, 255, 31, 0.6)' }}
        >
          New Vessel Formation
        </motion.text>
      </svg>
    </div>
  );
}

function NOPathwayVisual({ isInView, isActive }: { isInView: boolean; isActive: boolean }) {
  return (
    <div className="relative h-32">
      <svg viewBox="0 0 200 100" className="w-full h-full">
        <defs>
          <linearGradient id="noGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#21d8ff" />
            <stop offset="100%" stopColor="#D4FF1F" />
          </linearGradient>
        </defs>
        
        <motion.rect
          x="10" y="35" width="40" height="30" rx="5"
          fill="rgba(33, 216, 255, 0.2)"
          stroke="#21d8ff"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
        />
        <motion.text x="30" y="54" textAnchor="middle" fill="#21d8ff" fontSize="8" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          eNOS
        </motion.text>
        
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={i}
            r="4"
            fill="#D4FF1F"
            initial={{ opacity: 0 }}
            animate={isInView && isActive ? {
              cx: [60, 100, 140],
              cy: [50, 45 + i * 5, 50],
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1, 1, 0.5]
            } : { opacity: 0 }}
            transition={{
              duration: 2,
              delay: i * 0.3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ filter: 'drop-shadow(0 0 6px rgba(212, 255, 31, 0.8))' }}
          />
        ))}
        
        <motion.path
          d="M 55 50 Q 100 40 145 50"
          stroke="url(#noGradient)"
          strokeWidth="2"
          strokeDasharray="5,5"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ duration: 1, delay: 0.5 }}
        />
        
        <motion.circle
          cx="165" cy="50" r="20"
          fill="rgba(212, 255, 31, 0.1)"
          stroke="#D4FF1F"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={isInView ? { 
            scale: isActive ? [1, 1.1, 1] : 1,
          } : {}}
          transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
        />
        <motion.text x="165" y="46" textAnchor="middle" fill="#D4FF1F" fontSize="7" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          VESSEL
        </motion.text>
        <motion.text x="165" y="56" textAnchor="middle" fill="#D4FF1F" fontSize="6"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          DILATION
        </motion.text>
      </svg>
    </div>
  );
}

const phases = [
  { 
    id: 0, 
    name: "VEGF Release", 
    icon: Zap, 
    description: "BPC-157 upregulates vascular endothelial growth factor",
    color: "#D4FF1F"
  },
  { 
    id: 1, 
    name: "Endothelial Migration", 
    icon: Activity, 
    description: "Endothelial cells begin migrating toward injury site",
    color: "#21d8ff"
  },
  { 
    id: 2, 
    name: "Vessel Sprouting", 
    icon: Droplets, 
    description: "New blood vessel branches form and extend",
    color: "#9d4edd"
  },
  { 
    id: 3, 
    name: "Tissue Perfusion", 
    icon: Heart, 
    description: "Blood flow restored to healing tissue",
    color: "#ec4899"
  },
];

export function BPC157AngiogenesisVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const hoverCapable = useHoverCapable();
  const [activePhase, setActivePhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying || !isInView) return;
    
    const interval = setInterval(() => {
      setActivePhase((prev) => (prev + 1) % phases.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isPlaying, isInView]);

  return (
    <div ref={containerRef} className="relative">
      <div 
        className="absolute inset-0 h-full w-full rounded-2xl blur-3xl -z-10"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(212, 255, 31, 0.08) 0%, transparent 70%)'
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
            background: 'linear-gradient(135deg, rgba(212, 255, 31, 0.15) 0%, rgba(33, 216, 255, 0.05) 100%)',
            borderColor: '#D4FF1F',
            boxShadow: '0 0 20px rgba(212, 255, 31, 0.3)'
          }}
        >
          <Heart className="h-5 w-5 text-[#D4FF1F]" style={{ filter: 'drop-shadow(0 0 4px rgba(212, 255, 31, 0.6))' }} />
          <span className="text-sm font-bold bg-gradient-to-r from-[#D4FF1F] to-[#21d8ff] bg-clip-text text-transparent">
            Angiogenesis Mechanism
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          How BPC-157 promotes new blood vessel formation for tissue repair
        </p>
      </motion.div>

      <div 
        className="rounded-xl border p-6 mb-6"
        style={{ 
          borderColor: 'rgba(212, 255, 31, 0.3)',
          background: 'linear-gradient(135deg, rgba(212, 255, 31, 0.05) 0%, transparent 50%)'
        }}
      >
        <AnimatedBloodVessels isInView={isInView} activePhase={activePhase} />
        
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Angiogenesis Phases
            </span>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-xs px-3 py-1 rounded-full transition-all"
              style={{
                backgroundColor: isPlaying ? 'rgba(212, 255, 31, 0.2)' : 'hsl(var(--foreground) / 0.1)',
                color: isPlaying ? '#D4FF1F' : 'hsl(var(--foreground) / 0.5)',
                border: `1px solid ${isPlaying ? 'rgba(212, 255, 31, 0.4)' : 'hsl(var(--foreground) / 0.1)'}`
              }}
              data-testid="button-toggle-animation"
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {phases.map((phase) => {
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
                    {phase.name}
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
              backgroundColor: `${phases[activePhase].color}10`,
              border: `1px solid ${phases[activePhase].color}30`
            }}
          >
            <p className="text-sm text-muted-foreground">
              {phases[activePhase].description}
            </p>
          </motion.div>
        </div>

        <div className="mt-6 pt-6 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-[#21d8ff]" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Nitric Oxide Pathway
            </span>
          </div>
          <NOPathwayVisual isInView={isInView} isActive={activePhase >= 2} />
        </div>
      </div>

      <motion.div
        className="text-center text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 2 }}
      >
        <span className="px-3 py-1 rounded-full bg-muted/30">
          BPC-157 angiogenesis research visualization • For educational purposes only
        </span>
      </motion.div>
    </div>
  );
}
