import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Clock, Zap, Shield, Activity, TrendingUp } from "lucide-react";
import { useHoverCapable } from "@/hooks/use-hover-capable";

function AlbuminBindingAnimation({ isInView, showDAC }: { isInView: boolean; showDAC: boolean }) {
  return (
    <div className="relative w-full h-64 flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 rounded-xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(33, 216, 255, 0.1) 0%, transparent 70%)'
        }}
      />
      
      <svg viewBox="0 0 320 200" className="w-full h-full">
        <defs>
          <filter id="albuminGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="bloodGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(239, 68, 68, 0.1)" />
            <stop offset="50%" stopColor="rgba(239, 68, 68, 0.2)" />
            <stop offset="100%" stopColor="rgba(239, 68, 68, 0.1)" />
          </linearGradient>
        </defs>
        
        <motion.rect
          x="0" y="70" width="320" height="60"
          fill="url(#bloodGradient)"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        />
        <motion.text x="15" y="90" fill="rgba(239, 68, 68, 0.5)" fontSize="8">
          Bloodstream
        </motion.text>
        
        {!showDAC && (
          <motion.g>
            <motion.circle
              cx="60"
              cy="100"
              r="15"
              fill="rgba(157, 78, 221, 0.3)"
              stroke="#9d4edd"
              strokeWidth="2"
              initial={{ x: 0 }}
              animate={isInView ? { 
                x: [0, 200, 200],
                opacity: [1, 1, 0],
                scale: [1, 0.5, 0]
              } : {}}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
            />
            <motion.text x="60" y="104" textAnchor="middle" fill="#9d4edd" fontSize="7" fontWeight="bold"
              initial={{ x: 0 }}
              animate={isInView ? { 
                x: [0, 200, 200],
                opacity: [1, 1, 0]
              } : {}}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
            >
              GHRH
            </motion.text>
            
            {[0, 1, 2].map((i) => (
              <motion.g key={`enzyme-${i}`}>
                <motion.path
                  d="M 0 0 L 8 4 L 0 8 Z"
                  fill="#ef4444"
                  initial={{ opacity: 0 }}
                  animate={isInView ? {
                    opacity: [0, 1, 1, 0],
                    x: [100 + i * 40, 80 + i * 40],
                    y: [90, 95]
                  } : {}}
                  transition={{ 
                    duration: 1.5, 
                    delay: 0.5 + i * 0.3,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                />
              </motion.g>
            ))}
            
            <motion.text x="160" y="55" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: [0, 1, 1, 0] } : {}}
              transition={{ duration: 3, repeat: Infinity }}
            >
              DPP-IV Enzymes Degrade
            </motion.text>
            
            <motion.text x="160" y="160" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 1 }}
            >
              Half-life: ~10 minutes
            </motion.text>
          </motion.g>
        )}
        
        {showDAC && (
          <motion.g>
            <motion.ellipse
              cx="160"
              cy="100"
              rx="50"
              ry="35"
              fill="rgba(231, 251, 16, 0.1)"
              stroke="#E7FB10"
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ duration: 0.5 }}
              style={{ filter: 'drop-shadow(0 0 15px rgba(231, 251, 16, 0.4))' }}
            />
            <motion.text x="160" y="95" textAnchor="middle" fill="#E7FB10" fontSize="9" fontWeight="bold"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
            >
              Albumin
            </motion.text>
            <motion.text x="160" y="108" textAnchor="middle" fill="#E7FB10" fontSize="7"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
            >
              (Protective Carrier)
            </motion.text>
            
            <motion.circle
              cx="160"
              cy="75"
              r="18"
              fill="rgba(33, 216, 255, 0.3)"
              stroke="#21d8ff"
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ delay: 0.3, type: "spring" }}
              style={{ filter: 'drop-shadow(0 0 10px rgba(33, 216, 255, 0.5))' }}
            />
            <motion.text x="160" y="73" textAnchor="middle" fill="#21d8ff" fontSize="7" fontWeight="bold"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
            >
              CJC-1295
            </motion.text>
            <motion.text x="160" y="82" textAnchor="middle" fill="#21d8ff" fontSize="6"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
            >
              + DAC
            </motion.text>
            
            <motion.path
              d="M 160 90 L 160 65"
              stroke="#9d4edd"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.5 }}
              style={{ filter: 'drop-shadow(0 0 4px rgba(157, 78, 221, 0.6))' }}
            />
            
            {[0, 1, 2].map((i) => (
              <motion.g key={`blocked-${i}`}>
                <motion.path
                  d="M 0 0 L 8 4 L 0 8 Z"
                  fill="rgba(239, 68, 68, 0.3)"
                  stroke="#ef4444"
                  strokeWidth="0.5"
                  initial={{ opacity: 0 }}
                  animate={isInView ? {
                    opacity: [0, 0.5, 0.5, 0],
                    x: [80 + i * 30, 100 + i * 30],
                    y: [70 + i * 15, 80 + i * 15]
                  } : {}}
                  transition={{ 
                    duration: 2, 
                    delay: 1 + i * 0.3,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                />
                <motion.line
                  x1={75 + i * 30}
                  y1={65 + i * 15}
                  x2={95 + i * 30}
                  y2={85 + i * 15}
                  stroke="#22c55e"
                  strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={isInView ? {
                    pathLength: [0, 1],
                    opacity: [0, 1, 1, 0]
                  } : {}}
                  transition={{ 
                    duration: 1, 
                    delay: 1.5 + i * 0.3,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                />
              </motion.g>
            ))}
            
            <motion.text x="270" y="95" textAnchor="middle" fill="#22c55e" fontSize="8" fontWeight="bold"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 1.5 }}
            >
              Protected from
            </motion.text>
            <motion.text x="270" y="107" textAnchor="middle" fill="#22c55e" fontSize="8" fontWeight="bold"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 1.5 }}
            >
              degradation
            </motion.text>
            
            <motion.text x="160" y="160" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="bold"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 1 }}
              style={{ textShadow: '0 0 8px rgba(34, 197, 94, 0.6)' }}
            >
              Half-life: ~120 hours (5+ days)
            </motion.text>
          </motion.g>
        )}
      </svg>
    </div>
  );
}

function HalfLifeComparison({ isInView }: { isInView: boolean }) {
  const compounds = [
    { name: 'Native GHRH', halfLife: 10, unit: 'min', color: '#ef4444', width: 5 },
    { name: 'CJC-1295 (no DAC)', halfLife: 30, unit: 'min', color: '#f97316', width: 15 },
    { name: 'CJC-1295 with DAC', halfLife: 7200, unit: 'min', color: '#22c55e', width: 100, label: '~120 hours' },
  ];
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="h-4 w-4 text-[#21d8ff]" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Half-Life Comparison
        </span>
      </div>
      
      {compounds.map((compound, idx) => (
        <motion.div
          key={compound.name}
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.5 + idx * 0.15 }}
          className="flex items-center gap-3"
        >
          <div className="w-32 text-right">
            <span className="text-xs font-medium text-foreground">{compound.name}</span>
          </div>
          
          <div className="flex-1 h-6 bg-muted/20 rounded-full overflow-hidden relative">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: compound.color }}
              initial={{ width: 0 }}
              animate={isInView ? { width: `${compound.width}%` } : {}}
              transition={{ duration: 1, delay: 0.8 + idx * 0.2 }}
            />
          </div>
          
          <div className="w-24">
            <span className="text-xs font-bold" style={{ color: compound.color }}>
              {compound.label || `${compound.halfLife} ${compound.unit}`}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function CJC1295AlbuminVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const hoverCapable = useHoverCapable();
  const [showDAC, setShowDAC] = useState(false);

  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setShowDAC(prev => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <div ref={containerRef} className="relative">
      <div 
        className="absolute inset-0 h-full w-full rounded-2xl blur-3xl -z-10"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(33, 216, 255, 0.08) 0%, transparent 70%)'
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
            background: 'linear-gradient(135deg, rgba(33, 216, 255, 0.15) 0%, rgba(231, 251, 16, 0.05) 100%)',
            borderColor: '#21d8ff',
            boxShadow: '0 0 20px rgba(33, 216, 255, 0.3)'
          }}
        >
          <Shield className="h-5 w-5 text-[#21d8ff]" style={{ filter: 'drop-shadow(0 0 4px rgba(33, 216, 255, 0.6))' }} />
          <span className="text-sm font-bold bg-gradient-to-r from-[#21d8ff] to-[#E7FB10] bg-clip-text text-transparent">
            Drug Affinity Complex (DAC) Technology
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          How the DAC modification enables CJC-1295 to bind albumin and extend its half-life
        </p>
      </motion.div>

      <div 
        className="rounded-xl border p-6 mb-6"
        style={{ 
          borderColor: 'rgba(33, 216, 255, 0.3)',
          background: 'linear-gradient(135deg, rgba(33, 216, 255, 0.05) 0%, transparent 50%)'
        }}
      >
        <div className="flex justify-center gap-3 mb-6">
          <motion.button
            onClick={() => setShowDAC(false)}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              backgroundColor: !showDAC ? 'rgba(239, 68, 68, 0.2)' : 'hsl(var(--foreground) / 0.03)',
              border: `1.5px solid ${!showDAC ? '#ef4444' : 'hsl(var(--foreground) / 0.1)'}`,
              color: !showDAC ? '#ef4444' : 'hsl(var(--foreground) / 0.5)',
              boxShadow: !showDAC ? '0 0 15px rgba(239, 68, 68, 0.3)' : 'none'
            }}
            whileHover={hoverCapable ? { scale: 1.02 } : {}}
            data-testid="button-no-dac"
          >
            Without DAC
          </motion.button>
          <motion.button
            onClick={() => setShowDAC(true)}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              backgroundColor: showDAC ? 'rgba(33, 216, 255, 0.2)' : 'hsl(var(--foreground) / 0.03)',
              border: `1.5px solid ${showDAC ? '#21d8ff' : 'hsl(var(--foreground) / 0.1)'}`,
              color: showDAC ? '#21d8ff' : 'hsl(var(--foreground) / 0.5)',
              boxShadow: showDAC ? '0 0 15px rgba(33, 216, 255, 0.3)' : 'none'
            }}
            whileHover={hoverCapable ? { scale: 1.02 } : {}}
            data-testid="button-with-dac"
          >
            With DAC
          </motion.button>
        </div>
        
        <AlbuminBindingAnimation isInView={isInView} showDAC={showDAC} />
        
        <motion.div
          key={showDAC ? 'dac' : 'no-dac'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-lg text-center"
          style={{
            backgroundColor: showDAC ? 'rgba(33, 216, 255, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${showDAC ? 'rgba(33, 216, 255, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
          }}
        >
          <p className="text-sm text-muted-foreground">
            {showDAC 
              ? "DAC creates a covalent bond with serum albumin, protecting CJC-1295 from enzymatic degradation and enabling sustained GH stimulation with less frequent dosing."
              : "Native GHRH and unmodified peptides are rapidly degraded by DPP-IV enzymes in the bloodstream, resulting in very short half-lives."
            }
          </p>
        </motion.div>

        <div className="mt-6 pt-6 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
          <HalfLifeComparison isInView={isInView} />
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { icon: Zap, title: "Extended Action", desc: "120+ hour half-life", color: "#21d8ff" },
            { icon: Activity, title: "Sustained Release", desc: "Steady GH stimulation", color: "#E7FB10" },
            { icon: TrendingUp, title: "Weekly Dosing", desc: "Less frequent administration", color: "#22c55e" },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 1.5 + idx * 0.1 }}
                className="p-3 rounded-lg text-center"
                style={{
                  backgroundColor: `${item.color}10`,
                  border: `1px solid ${item.color}30`
                }}
              >
                <Icon className="h-5 w-5 mx-auto mb-2" style={{ color: item.color }} />
                <span className="text-xs font-bold block" style={{ color: item.color }}>{item.title}</span>
                <span className="text-[10px] text-muted-foreground">{item.desc}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.div
        className="text-center text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 2 }}
      >
        <span className="px-3 py-1 rounded-full bg-muted/30">
          CJC-1295 DAC mechanism visualization • For research education only
        </span>
      </motion.div>
    </div>
  );
}
