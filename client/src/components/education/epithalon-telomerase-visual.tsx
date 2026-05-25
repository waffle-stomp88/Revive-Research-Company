import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Clock, Zap, Shield, TrendingUp, Dna, Activity } from "lucide-react";

function ChromosomeWithTelomeres({ isInView, telomereLength, isExtending }: { 
  isInView: boolean; 
  telomereLength: number;
  isExtending: boolean;
}) {
  return (
    <div className="relative w-full h-64 flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 rounded-xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(157, 78, 221, 0.12) 0%, transparent 70%)'
        }}
      />
      
      <svg viewBox="0 0 320 200" className="w-full h-full">
        <defs>
          <filter id="chromosomeGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="telomereGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#D4FF1F" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <linearGradient id="chromosomeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9d4edd" />
            <stop offset="50%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#9d4edd" />
          </linearGradient>
        </defs>
        
        <motion.path
          d="M 100 50 Q 85 100 100 150 Q 115 100 100 50"
          fill="url(#chromosomeGradient)"
          stroke="#9d4edd"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 1.5 }}
          filter="url(#chromosomeGlow)"
          style={{ filter: 'drop-shadow(0 0 10px rgba(157, 78, 221, 0.5))' }}
        />
        <motion.path
          d="M 140 50 Q 125 100 140 150 Q 155 100 140 50"
          fill="url(#chromosomeGradient)"
          stroke="#9d4edd"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 1.5, delay: 0.2 }}
          filter="url(#chromosomeGlow)"
          style={{ filter: 'drop-shadow(0 0 10px rgba(157, 78, 221, 0.5))' }}
        />
        
        <motion.ellipse
          cx="120"
          cy="100"
          rx="25"
          ry="15"
          fill="rgba(157, 78, 221, 0.3)"
          stroke="#9d4edd"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ delay: 0.8 }}
        />
        <motion.text
          x="120" y="104"
          textAnchor="middle"
          fill="#9d4edd"
          fontSize="8"
          fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1 }}
        >
          Centromere
        </motion.text>
        
        {[[100, 35], [140, 35], [100, 165], [140, 165]].map(([x, y], idx) => {
          const isTop = y < 100;
          const telomereLengthPx = 8 + (telomereLength / 100) * 15;
          const color = telomereLength > 70 ? '#22c55e' : telomereLength > 40 ? '#D4FF1F' : '#ef4444';
          
          return (
            <motion.g key={idx}>
              <motion.rect
                x={x - 8}
                y={isTop ? y - telomereLengthPx : y}
                width="16"
                height={telomereLengthPx}
                rx="3"
                fill={`${color}40`}
                stroke={color}
                strokeWidth="1.5"
                initial={{ scaleY: 0 }}
                animate={isInView ? { scaleY: 1 } : {}}
                transition={{ delay: 1.2 + idx * 0.1, duration: 0.5 }}
                style={{ 
                  transformOrigin: isTop ? `${x}px ${y}px` : `${x}px ${y}px`,
                  filter: `drop-shadow(0 0 8px ${color})`
                }}
              />
              
              {isExtending && (
                <motion.circle
                  cx={x}
                  cy={isTop ? y - telomereLengthPx - 5 : y + telomereLengthPx + 5}
                  r="4"
                  fill="#D4FF1F"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [0, 1.5, 1],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: idx * 0.2
                  }}
                  style={{ filter: 'drop-shadow(0 0 6px rgba(231, 251, 16, 0.8))' }}
                />
              )}
            </motion.g>
          );
        })}
        
        <motion.g
          initial={{ opacity: 0, x: 50 }}
          animate={isInView && isExtending ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
          transition={{ duration: 0.5 }}
        >
          <motion.ellipse
            cx="220"
            cy="100"
            rx="35"
            ry="25"
            fill="rgba(231, 251, 16, 0.15)"
            stroke="#D4FF1F"
            strokeWidth="2"
            animate={isExtending ? { 
              scale: [1, 1.05, 1],
            } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ filter: 'drop-shadow(0 0 15px rgba(231, 251, 16, 0.5))' }}
          />
          <motion.text x="220" y="95" textAnchor="middle" fill="#D4FF1F" fontSize="9" fontWeight="bold">
            Telomerase
          </motion.text>
          <motion.text x="220" y="108" textAnchor="middle" fill="#D4FF1F" fontSize="7">
            TERT + TERC
          </motion.text>
          
          <motion.path
            d="M 185 100 Q 170 90 155 100"
            stroke="#D4FF1F"
            strokeWidth="2"
            strokeDasharray="4,2"
            fill="none"
            animate={isExtending ? { strokeDashoffset: [0, -10] } : {}}
            transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
            style={{ filter: 'drop-shadow(0 0 4px rgba(231, 251, 16, 0.6))' }}
          />
        </motion.g>
        
        <motion.rect
          x="250"
          y="160"
          width="60"
          height="30"
          rx="5"
          fill="rgba(157, 78, 221, 0.2)"
          stroke="#9d4edd"
          strokeWidth="1.5"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.8 }}
        />
        <motion.text x="280" y="178" textAnchor="middle" fill="#9d4edd" fontSize="9" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 2 }}
        >
          Epithalon
        </motion.text>
        
        <motion.path
          d="M 280 160 Q 260 130 220 115"
          stroke="#9d4edd"
          strokeWidth="1.5"
          strokeDasharray="4,4"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={isInView && isExtending ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 0.8 }}
        />
      </svg>
    </div>
  );
}

function TelomereTimeline({ isInView, currentStage }: { isInView: boolean; currentStage: number }) {
  const stages = [
    { age: "Young", length: 100, color: "#22c55e" },
    { age: "Middle", length: 65, color: "#D4FF1F" },
    { age: "Aged", length: 35, color: "#f97316" },
    { age: "Critical", length: 15, color: "#ef4444" },
  ];
  
  return (
    <div className="space-y-3">
      {stages.map((stage, idx) => {
        const isActive = currentStage === idx;
        
        return (
          <motion.div
            key={stage.age}
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.5 + idx * 0.1 }}
            className="flex items-center gap-3"
          >
            <div className="w-16 text-right">
              <span 
                className="text-xs font-bold"
                style={{ color: isActive ? stage.color : 'hsl(var(--foreground) / 0.5)' }}
              >
                {stage.age}
              </span>
            </div>
            
            <div className="flex-1 h-6 bg-muted/20 rounded-full overflow-hidden relative">
              <motion.div
                className="h-full rounded-full"
                style={{ 
                  backgroundColor: stage.color,
                  boxShadow: isActive ? `0 0 12px ${stage.color}` : 'none'
                }}
                initial={{ width: 0 }}
                animate={isInView ? { width: `${stage.length}%` } : {}}
                transition={{ duration: 1, delay: 0.8 + idx * 0.15 }}
              />
              
              {isActive && (
                <motion.div
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <span className="text-[10px] font-bold" style={{ color: stage.color }}>
                    {stage.length}%
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export function EpithalonTelomeraseVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const telomereRef = useRef<HTMLDivElement>(null);
  const telomereInView = useInView(telomereRef, { margin: "-20px" });
  const [telomereLength, setTelomereLength] = useState(35);
  const [isExtending, setIsExtending] = useState(false);
  const [currentStage, setCurrentStage] = useState(2);

  const activateTelomerase = (length: number = telomereLength) => {
    setIsExtending(true);
    let currentLength = length;
    const interval = setInterval(() => {
      currentLength += 3;
      setTelomereLength(Math.min(currentLength, 90));
      
      if (currentLength >= 70) setCurrentStage(0);
      else if (currentLength >= 50) setCurrentStage(1);
      else if (currentLength >= 30) setCurrentStage(2);
      
      if (currentLength >= 90) {
        clearInterval(interval);
        setTimeout(() => {
          setIsExtending(false);
          setTelomereLength(35);
          setCurrentStage(2);
        }, 2000);
      }
    }, 150);
  };

  useEffect(() => {
    if (!telomereInView) return;
    
    const runTelomeraseCycle = () => {
      setTelomereLength(35);
      setCurrentStage(2);
      setIsExtending(true);
      
      let length = 35;
      const interval = setInterval(() => {
        length += 3;
        setTelomereLength(Math.min(length, 90));
        
        if (length >= 70) setCurrentStage(0);
        else if (length >= 50) setCurrentStage(1);
        else if (length >= 30) setCurrentStage(2);
        
        if (length >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            setIsExtending(false);
            setTelomereLength(35);
            setCurrentStage(2);
            setTimeout(runTelomeraseCycle, 1500);
          }, 2000);
        }
      }, 150);
      
      return interval;
    };
    
    const interval = runTelomeraseCycle();
    return () => clearInterval(interval);
  }, [telomereInView]);

  return (
    <div ref={containerRef} className="relative">
      <div 
        className="absolute inset-0 h-full w-full rounded-2xl blur-3xl -z-10"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(157, 78, 221, 0.08) 0%, transparent 70%)'
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
            background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.15) 0%, rgba(231, 251, 16, 0.05) 100%)',
            borderColor: '#9d4edd',
            boxShadow: '0 0 20px rgba(157, 78, 221, 0.3)'
          }}
        >
          <Dna className="h-5 w-5 text-[#9d4edd]" style={{ filter: 'drop-shadow(0 0 4px rgba(157, 78, 221, 0.6))' }} />
          <span className="text-sm font-bold bg-gradient-to-r from-[#9d4edd] to-[#D4FF1F] bg-clip-text text-transparent">
            Telomerase Activation & Telomere Extension
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          How Epithalon may stimulate telomerase to extend chromosome protective caps
        </p>
      </motion.div>

      <div 
        className="rounded-xl border p-6 mb-6"
        style={{ 
          borderColor: 'rgba(157, 78, 221, 0.3)',
          background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.05) 0%, transparent 50%)'
        }}
      >
        <div ref={telomereRef}>
          <ChromosomeWithTelomeres 
            isInView={isInView} 
            telomereLength={telomereLength}
            isExtending={isExtending}
          />
        </div>
        
        <div className="flex justify-center mb-6">
          <span className="text-xs text-[#9d4edd]/60 italic">
            Auto-plays when visible
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-[#9d4edd]" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Telomere Length Over Time
              </span>
            </div>
            <TelomereTimeline isInView={isInView} currentStage={currentStage} />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4 text-[#D4FF1F]" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Research Applications
              </span>
            </div>
            
            {[
              { icon: Shield, title: "Cellular Longevity", desc: "Maintained telomeres may extend cellular lifespan", color: "#22c55e" },
              { icon: Zap, title: "Telomerase Activation", desc: "Epithalon may stimulate TERT gene expression", color: "#D4FF1F" },
              { icon: TrendingUp, title: "Anti-Aging Research", desc: "Focus on cellular regeneration mechanisms", color: "#9d4edd" },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 1.5 + idx * 0.1 }}
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: `${item.color}10`,
                    border: `1px solid ${item.color}30`
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4" style={{ color: item.color }} />
                    <span className="text-xs font-bold" style={{ color: item.color }}>{item.title}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
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
          Epithalon telomerase research visualization • For educational purposes only
        </span>
      </motion.div>
    </div>
  );
}
