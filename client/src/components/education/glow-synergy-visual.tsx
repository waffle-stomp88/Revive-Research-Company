import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Sparkles, Activity, Zap } from "lucide-react";

function PeptideSynergyAnimation({ isInView, activationLevel }: { isInView: boolean; activationLevel: number }) {
  return (
    <div className="relative w-full flex flex-col items-center justify-center overflow-hidden">
      <svg viewBox="0 0 400 240" className="w-full h-auto" style={{ maxHeight: '280px' }}>
        <defs>
          <linearGradient id="peptideGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.1" />
          </linearGradient>
          <radialGradient id="fibroblastGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Title */}
        <motion.text x="200" y="25" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="10" fontWeight="600"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          GLOW Multi-Peptide Synergy
        </motion.text>
        
        {/* Three incoming peptides */}
        {[0, 1, 2].map((i) => {
          const startX = 50 + i * 150;
          const startY = 70;
          const endX = 200;
          const endY = 120;
          
          return (
            <motion.g key={`peptide-${i}`}>
              <motion.circle
                cx={startX}
                cy={startY}
                r="12"
                fill="#ec4899"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                style={{ filter: 'drop-shadow(0 0 8px rgba(236, 72, 153, 0.6))' }}
              />
              <motion.path
                d={`M ${startX} ${startY} L ${endX} ${endY}`}
                stroke="#ec4899"
                strokeWidth="2"
                strokeDasharray="4,4"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={isInView && activationLevel > 0 ? { pathLength: 1 } : {}}
                transition={{ duration: 1.5, delay: i * 0.2 }}
                style={{ filter: 'drop-shadow(0 0 4px rgba(236, 72, 153, 0.6))' }}
              />
            </motion.g>
          );
        })}
        
        {/* Central synergy point */}
        <motion.circle
          cx="200" cy="120" r="20"
          fill="rgba(236, 72, 153, 0.2)"
          stroke="#ec4899"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={isInView && activationLevel > 30 ? { scale: 1 } : {}}
          style={{ filter: 'drop-shadow(0 0 12px rgba(236, 72, 153, 0.8))' }}
        />
        <motion.text x="200" y="125" textAnchor="middle" fill="#ec4899" fontSize="7" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView && activationLevel > 30 ? { opacity: 1 } : {}}
        >
          Synergy
        </motion.text>
        
        {/* Activated fibroblasts */}
        {[0, 1, 2].map((i) => {
          const positions = [
            { x: 100, y: 180 },
            { x: 200, y: 180 },
            { x: 300, y: 180 }
          ];
          const pos = positions[i];
          const isActivated = activationLevel > (i * 20 + 30);
          
          return (
            <motion.g key={`fibroblast-${i}`}>
              <motion.circle
                cx={pos.x} cy={pos.y} r="18"
                fill={isActivated ? "rgba(236, 72, 153, 0.3)" : "rgba(236, 72, 153, 0.1)"}
                stroke="#ec4899"
                strokeWidth="2"
                initial={{ scale: 0 }}
                animate={isInView && activationLevel > i * 20 ? { scale: 1 } : {}}
                transition={{ delay: 0.5 + i * 0.3 }}
                style={{ filter: isActivated ? 'drop-shadow(0 0 12px rgba(236, 72, 153, 0.6))' : 'none' }}
              />
              <motion.text x={pos.x} y={pos.y} textAnchor="middle" fill="#ec4899" fontSize="6" fontWeight="600"
                initial={{ opacity: 0 }}
                animate={isInView && activationLevel > i * 20 ? { opacity: 1 } : {}}
              >
                FB
              </motion.text>
            </motion.g>
          );
        })}
        
        {/* Collagen synthesis strands */}
        {activationLevel > 40 && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.path
                key={`collagen-${i}`}
                d={`M ${100 + i * 100} 200 L ${100 + i * 100} 220 Q ${95 + i * 100} 225 ${90 + i * 100} 220`}
                stroke="#22c55e"
                strokeWidth="2.5"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={activationLevel > 50 ? { pathLength: 1, opacity: 1 } : {}}
                transition={{ duration: 1, delay: i * 0.2 }}
                style={{ filter: 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.6))' }}
              />
            ))}
            <motion.text x="200" y="235" textAnchor="middle" fill="#22c55e" fontSize="7" fontWeight="600"
              initial={{ opacity: 0 }}
              animate={activationLevel > 50 ? { opacity: 1 } : {}}
            >
              Collagen Synthesis
            </motion.text>
          </>
        )}
        
        {/* Elastin formation */}
        {activationLevel > 60 && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.path
                key={`elastin-${i}`}
                d={`M ${100 + i * 100} 200 L ${100 + i * 100} 215`}
                stroke="#f97316"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={activationLevel > 70 ? { pathLength: 1, opacity: 1 } : {}}
                transition={{ duration: 1, delay: i * 0.2 }}
                style={{ filter: 'drop-shadow(0 0 6px rgba(249, 115, 22, 0.8))' }}
              />
            ))}
          </>
        )}
      </svg>
      
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-3 text-[9px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ec4899]" style={{ boxShadow: '0 0 6px #ec4899' }}></span>
          <span>Peptide Molecules</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" style={{ boxShadow: '0 0 6px #22c55e' }}></span>
          <span>Collagen</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" style={{ boxShadow: '0 0 6px #f97316' }}></span>
          <span>Elastin</span>
        </div>
      </div>
    </div>
  );
}

export function GLOWSynergyVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const glowRef = useRef<HTMLDivElement>(null);
  const glowInView = useInView(glowRef, { margin: "-20px" });
  const [activationLevel, setActivationLevel] = useState(0);

  useEffect(() => {
    if (!glowInView) return;
    
    const runActivationCycle = () => {
      let level = 0;
      setActivationLevel(0);
      
      const interval = setInterval(() => {
        level += 2;
        setActivationLevel(level);
        
        if (level >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setActivationLevel(0);
            setTimeout(runActivationCycle, 1000);
          }, 2000);
        }
      }, 50);
      
      return interval;
    };
    
    const interval = runActivationCycle();
    return () => clearInterval(interval);
  }, [glowInView]);

  return (
    <div ref={containerRef} className="relative">
      <div 
        className="absolute inset-0 h-full w-full rounded-2xl blur-3xl -z-10"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(236, 72, 153, 0.12) 0%, transparent 70%)'
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
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(249, 115, 22, 0.05) 100%)',
            borderColor: '#ec4899',
            boxShadow: '0 0 20px rgba(236, 72, 153, 0.3)'
          }}
        >
          <Sparkles className="h-5 w-5 text-[#ec4899]" style={{ filter: 'drop-shadow(0 0 4px rgba(236, 72, 153, 0.6))' }} />
          <span className="text-sm font-bold bg-gradient-to-r from-[#ec4899] to-[#f97316] bg-clip-text text-transparent">
            Multi-Peptide Synergistic Complex
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          How GLOW combines multiple peptides for enhanced fibroblast activation and matrix remodeling
        </p>
      </motion.div>

      <div 
        className="rounded-xl border p-6 mb-6"
        style={{ 
          borderColor: 'rgba(236, 72, 153, 0.3)',
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.05) 0%, transparent 50%)'
        }}
      >
        <div ref={glowRef}>
          <PeptideSynergyAnimation isInView={isInView} activationLevel={activationLevel} />
        </div>
        
        <div className="mt-6 text-center">
          <span className="text-xs text-[#ec4899]/60 italic">Auto-plays when visible</span>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.5 }}
            className="p-3 rounded-lg"
            style={{
              backgroundColor: 'rgba(236, 72, 153, 0.1)',
              border: '1px solid rgba(236, 72, 153, 0.3)'
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-[#ec4899]" />
              <span className="text-xs font-bold text-[#ec4899]">Synergistic Blend</span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Multiple peptides work together to amplify fibroblast response
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            className="p-3 rounded-lg"
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)'
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-[#22c55e]" />
              <span className="text-xs font-bold text-[#22c55e]">Matrix Building</span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Stimulates collagen I & III synthesis for structural integrity
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.7 }}
            className="p-3 rounded-lg"
            style={{
              backgroundColor: 'rgba(249, 115, 22, 0.1)',
              border: '1px solid rgba(249, 115, 22, 0.3)'
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-[#f97316]" />
              <span className="text-xs font-bold text-[#f97316]">Elasticity & Remodeling</span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Elastin pathway activation promotes tissue flexibility
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
          GLOW multi-peptide synergy visualization • For research education only
        </span>
      </motion.div>
    </div>
  );
}
