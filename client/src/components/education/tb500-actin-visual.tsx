import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Activity, Zap, Move, Shield, ArrowRight } from "lucide-react";

function ActinFilamentAnimation({ isInView, activeMechanism }: { isInView: boolean; activeMechanism: string }) {
  const filamentColors = ['#21d8ff', '#E7FB10', '#9d4edd'];
  const isActin = activeMechanism === 'actin';
  const isMigration = activeMechanism === 'migration';
  const isDifferentiation = activeMechanism === 'differentiation';
  const isInflammation = activeMechanism === 'inflammation';
  
  return (
    <div className="relative w-full flex flex-col items-center justify-center overflow-hidden">
      <div 
        className="relative w-full h-56"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(33, 216, 255, 0.1) 0%, transparent 70%)'
        }}
      >
        <svg viewBox="0 0 320 180" className="w-full h-full">
          <defs>
            <filter id="actinGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <linearGradient id="cellGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#21d8ff" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#E7FB10" stopOpacity="0.3" />
            </linearGradient>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#E7FB10" />
            </marker>
          </defs>
          
          <motion.text
            x="100" y="20"
            textAnchor="middle"
            fill="rgba(255,255,255,0.6)"
            fontSize="8"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
          >
            CELL BODY
          </motion.text>
          <motion.path
            d="M 100 25 L 100 40"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : {}}
            transition={{ delay: 0.3 }}
          />
          
          <motion.ellipse
            cx="100"
            cy="90"
            rx="55"
            ry="45"
            fill="url(#cellGradient)"
            stroke="#21d8ff"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ duration: 0.8 }}
            style={{ filter: 'drop-shadow(0 0 10px rgba(33, 216, 255, 0.4))' }}
          />
          
          <motion.circle
            cx="100"
            cy="90"
            r="15"
            fill="rgba(157, 78, 221, 0.3)"
            stroke="#9d4edd"
            strokeWidth="1.5"
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: 0.3 }}
          />
          <motion.text
            x="100" y="93"
            textAnchor="middle"
            fill="#9d4edd"
            fontSize="7"
            fontWeight="bold"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
          >
            Nucleus
          </motion.text>
          
          {filamentColors.map((color, idx) => {
            const startAngle = idx * 40 - 20;
            const endX = 100 + Math.cos((startAngle * Math.PI) / 180) * 50;
            const endY = 90 + Math.sin((startAngle * Math.PI) / 180) * 35;
            
            return (
              <motion.g key={`filament-${idx}`}>
                {[0, 1, 2, 3, 4, 5, 6].map((segment) => {
                  const segX = 100 + ((endX - 100) / 7) * segment;
                  const segY = 90 + ((endY - 90) / 7) * segment;
                  
                  return (
                    <motion.circle
                      key={segment}
                      cx={segX}
                      cy={segY}
                      r="4"
                      fill={color}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={isInView ? { scale: 1, opacity: 1 } : {}}
                      transition={{ delay: 0.8 + idx * 0.2 + segment * 0.05 }}
                      style={{ filter: `drop-shadow(0 0 4px ${color})` }}
                    />
                  );
                })}
              </motion.g>
            );
          })}
          
          <motion.text
            x="35" y="70"
            textAnchor="middle"
            fill="#21d8ff"
            fontSize="6"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 1.2 }}
          >
            Actin
          </motion.text>
          <motion.text
            x="35" y="78"
            textAnchor="middle"
            fill="#21d8ff"
            fontSize="6"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 1.2 }}
          >
            Filaments
          </motion.text>
          <motion.path
            d="M 42 75 Q 50 80 55 75"
            stroke="#21d8ff"
            strokeWidth="1"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : {}}
            transition={{ delay: 1.3 }}
            markerEnd="url(#smallArrow)"
          />
          <defs>
            <marker id="smallArrow" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="#21d8ff" />
            </marker>
          </defs>
          
          {isMigration && (
            <motion.g
              initial={{ x: 0 }}
              animate={isInView ? { x: [0, 80, 0] } : {}}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.ellipse
                cx="220"
                cy="90"
                rx="55"
                ry="45"
                fill="url(#cellGradient)"
                stroke="#E7FB10"
                strokeWidth="2"
                strokeDasharray="5,3"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: [0.3, 0.8, 0.3] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ filter: 'drop-shadow(0 0 8px rgba(231, 251, 16, 0.3))' }}
              />
              <motion.text
                x="220" y="88"
                textAnchor="middle"
                fill="#E7FB10"
                fontSize="7"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
              >
                Future
              </motion.text>
              <motion.text
                x="220" y="97"
                textAnchor="middle"
                fill="#E7FB10"
                fontSize="7"
                fontWeight="bold"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
              >
                Position
              </motion.text>
            </motion.g>
          )}
          
          {isMigration && (
            <>
              <motion.text
                x="175" y="65"
                textAnchor="middle"
                fill="#E7FB10"
                fontSize="7"
                fontWeight="bold"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 1.5 }}
              >
                Cell Migration
              </motion.text>
              <motion.path
                d="M 155 85 Q 175 75 195 85"
                stroke="#E7FB10"
                strokeWidth="2"
                fill="none"
                strokeDasharray="4,2"
                initial={{ pathLength: 0 }}
                animate={isInView ? { pathLength: [0, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
                markerEnd="url(#arrowhead)"
                style={{ filter: 'drop-shadow(0 0 4px rgba(231, 251, 16, 0.6))' }}
              />
              
              {[0, 1, 2, 3].map((i) => (
                <motion.circle
                  key={`tb-particle-${i}`}
                  r="5"
                  fill="#21d8ff"
                  initial={{ opacity: 0 }}
                  animate={isInView ? {
                    cx: [80, 100, 120 + i * 15],
                    cy: [90, 85 - i * 3, 90],
                    opacity: [0, 1, 1, 0],
                    scale: [0.5, 1, 1, 0.5]
                  } : {}}
                  transition={{
                    duration: 2.5,
                    delay: i * 0.4,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                  style={{ filter: 'drop-shadow(0 0 6px rgba(33, 216, 255, 0.8))' }}
                />
              ))}
            </>
          )}
          
          {isActin && (
            <>
              <motion.text
                x="175" y="50"
                textAnchor="middle"
                fill="#21d8ff"
                fontSize="7"
                fontWeight="bold"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
              >
                Actin Sequestration
              </motion.text>
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.circle
                  key={`sequester-${i}`}
                  cx={170 + (i % 3) * 25}
                  cy={70 + Math.floor(i / 3) * 30}
                  r="8"
                  fill="rgba(33, 216, 255, 0.2)"
                  stroke="#21d8ff"
                  strokeWidth="1.5"
                  initial={{ scale: 0 }}
                  animate={isInView ? { 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  } : {}}
                  transition={{ 
                    duration: 1.5, 
                    delay: i * 0.2,
                    repeat: Infinity 
                  }}
                  style={{ filter: 'drop-shadow(0 0 6px rgba(33, 216, 255, 0.6))' }}
                />
              ))}
              <motion.text
                x="195" y="130"
                textAnchor="middle"
                fill="rgba(255,255,255,0.7)"
                fontSize="9"
                fontWeight="500"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
              >
                G-actin monomers bound
              </motion.text>
            </>
          )}
          
          {isDifferentiation && (
            <>
              <motion.text
                x="210" y="50"
                textAnchor="middle"
                fill="#9d4edd"
                fontSize="7"
                fontWeight="bold"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
              >
                Stem Cell Signaling
              </motion.text>
              {[0, 1, 2].map((i) => (
                <motion.g key={`stem-${i}`}>
                  <motion.circle
                    cx={180 + i * 30}
                    cy={80}
                    r="12"
                    fill="rgba(157, 78, 221, 0.2)"
                    stroke="#9d4edd"
                    strokeWidth="2"
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ delay: i * 0.3 }}
                    style={{ filter: 'drop-shadow(0 0 8px rgba(157, 78, 221, 0.6))' }}
                  />
                  <motion.path
                    d={`M ${180 + i * 30} 95 L ${180 + i * 30} 115`}
                    stroke="#9d4edd"
                    strokeWidth="2"
                    strokeDasharray="3,2"
                    initial={{ pathLength: 0 }}
                    animate={isInView ? { pathLength: 1 } : {}}
                    transition={{ delay: i * 0.3 + 0.5, duration: 0.5 }}
                  />
                  <motion.text
                    x={180 + i * 30}
                    y={128}
                    textAnchor="middle"
                    fill="#9d4edd"
                    fontSize="8"
                    fontWeight="600"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ delay: i * 0.3 + 0.8 }}
                  >
                    {['Progenitor', 'Diff.', 'Mature'][i]}
                  </motion.text>
                </motion.g>
              ))}
            </>
          )}
          
          {isInflammation && (
            <>
              <motion.text
                x="210" y="45"
                textAnchor="middle"
                fill="#ec4899"
                fontSize="7"
                fontWeight="bold"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
              >
                Inflammatory Modulation
              </motion.text>
              
              <motion.circle
                cx="210" cy="90" r="30"
                fill="rgba(236, 72, 153, 0.1)"
                stroke="#ec4899"
                strokeWidth="1.5"
                strokeDasharray="4,2"
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                style={{ filter: 'drop-shadow(0 0 10px rgba(236, 72, 153, 0.3))' }}
              />
              
              {[0, 1, 2, 3].map((i) => {
                const angle = (i * 90) * Math.PI / 180;
                const x = 210 + Math.cos(angle) * 20;
                const y = 90 + Math.sin(angle) * 20;
                return (
                  <motion.circle
                    key={`cytokine-${i}`}
                    cx={x}
                    cy={y}
                    r="5"
                    fill={i < 2 ? "#ef4444" : "#22c55e"}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { 
                      opacity: i < 2 ? [1, 0.3, 1] : [0.3, 1, 0.3],
                      scale: i < 2 ? [1, 0.7, 1] : [0.7, 1, 0.7]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    style={{ filter: `drop-shadow(0 0 6px ${i < 2 ? '#ef4444' : '#22c55e'})` }}
                  />
                );
              })}
              
              <motion.text
                x="175" y="135"
                textAnchor="middle"
                fill="#ef4444"
                fontSize="8"
                fontWeight="600"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
              >
                Pro-inflam. ↓
              </motion.text>
              <motion.text
                x="245" y="135"
                textAnchor="middle"
                fill="#22c55e"
                fontSize="8"
                fontWeight="600"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
              >
                Anti-inflam. ↑
              </motion.text>
            </>
          )}
          
          <motion.rect
            x="75"
            y="140"
            width="50"
            height="22"
            rx="5"
            fill="rgba(33, 216, 255, 0.15)"
            stroke="#21d8ff"
            strokeWidth="1.5"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 1.5 }}
          />
          <motion.text x="100" y="154" textAnchor="middle" fill="#21d8ff" fontSize="7" fontWeight="bold"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 1.6 }}
          >
            TB-500
          </motion.text>
          
          <motion.path
            d="M 100 140 L 100 120"
            stroke="#21d8ff"
            strokeWidth="2"
            strokeDasharray="3,2"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : {}}
            transition={{ delay: 1.8, duration: 0.5 }}
            style={{ filter: 'drop-shadow(0 0 4px rgba(33, 216, 255, 0.6))' }}
          />
          
          <motion.text
            x="100" y="172"
            textAnchor="middle"
            fill="rgba(255,255,255,0.4)"
            fontSize="6"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 2 }}
          >
            Binds actin monomers to enable polymerization
          </motion.text>
        </svg>
      </div>
      
      <div className="flex flex-wrap justify-center gap-4 mt-2 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#21d8ff]" style={{ boxShadow: '0 0 6px #21d8ff' }}></span>
          <span>Actin Monomers</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E7FB10]" style={{ boxShadow: '0 0 6px #E7FB10' }}></span>
          <span>G-Actin Subunits</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#9d4edd]" style={{ boxShadow: '0 0 6px #9d4edd' }}></span>
          <span>F-Actin Chains</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-6 h-0.5 border border-dashed border-[#E7FB10]"></span>
          <span>Migration Direction</span>
        </div>
      </div>
    </div>
  );
}

function WoundClosureVisual({ isInView, progress }: { isInView: boolean; progress: number }) {
  const woundGap = Math.max(0, 40 - (progress * 0.4));
  
  return (
    <div className="relative">
      <svg viewBox="0 0 200 80" className="w-full h-auto" style={{ maxHeight: '180px' }}>
        <defs>
          <linearGradient id="tissueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        <motion.rect
          x="15" y="20" width="70" height="35" rx="2"
          fill="url(#tissueGradient)"
          stroke="#ec4899"
          strokeWidth="1"
          initial={{ x: 15 }}
          animate={{ x: 15 + (progress * 0.2) }}
          transition={{ duration: 0.3 }}
        />
        <motion.text x="50" y="42" textAnchor="middle" fill="#ec4899" fontSize="6" fontWeight="500"
          initial={{ x: 50 }}
          animate={{ x: 50 + (progress * 0.2) }}
        >
          Wound Edge
        </motion.text>
        
        <motion.rect
          x="115" y="20" width="70" height="35" rx="2"
          fill="url(#tissueGradient)"
          stroke="#ec4899"
          strokeWidth="1"
          initial={{ x: 115 }}
          animate={{ x: 115 - (progress * 0.2) }}
          transition={{ duration: 0.3 }}
        />
        <motion.text x="150" y="42" textAnchor="middle" fill="#ec4899" fontSize="6" fontWeight="500"
          initial={{ x: 150 }}
          animate={{ x: 150 - (progress * 0.2) }}
        >
          Wound Edge
        </motion.text>
        
        <motion.rect
          x={100 - woundGap/2}
          y="20"
          width={woundGap}
          height="35"
          fill={progress < 80 ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.3)"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
        
        {progress < 80 && (
          <motion.text 
            x="100" y="42" 
            textAnchor="middle" 
            fill={progress < 50 ? "#ef4444" : "#E7FB10"} 
            fontSize="6"
            fontWeight="bold"
          >
            {progress < 30 ? "GAP" : "Closing"}
          </motion.text>
        )}
        
        {progress >= 80 && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <line x1="100" y1="20" x2="100" y2="55" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="2,2" />
            <motion.text x="100" y="42" textAnchor="middle" fill="#22c55e" fontSize="6" fontWeight="bold">
              SEALED
            </motion.text>
          </motion.g>
        )}
        
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={`cell-left-${i}`}
            r="2.5"
            fill="#21d8ff"
            initial={{ opacity: 0 }}
            animate={progress > 20 ? {
              cx: [78 + (progress * 0.2), 88 + (progress * 0.1), 100],
              cy: [28 + i * 10, 32 + i * 8, 37 + i * 6],
              opacity: progress < 90 ? [0.3, 1, 0] : 0,
            } : {}}
            transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
            style={{ filter: 'drop-shadow(0 0 3px #21d8ff)' }}
          />
        ))}
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={`cell-right-${i}`}
            r="2.5"
            fill="#21d8ff"
            initial={{ opacity: 0 }}
            animate={progress > 20 ? {
              cx: [122 - (progress * 0.2), 112 - (progress * 0.1), 100],
              cy: [28 + i * 10, 32 + i * 8, 37 + i * 6],
              opacity: progress < 90 ? [0.3, 1, 0] : 0,
            } : {}}
            transition={{ duration: 2, delay: i * 0.3 + 0.15, repeat: Infinity }}
            style={{ filter: 'drop-shadow(0 0 3px #21d8ff)' }}
          />
        ))}
        
        <motion.text x="100" y="68" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="6">
          {progress < 30 && "Wound open"}
          {progress >= 30 && progress < 60 && "Cells migrating"}
          {progress >= 60 && progress < 90 && "Gap closing"}
          {progress >= 90 && "Healed!"}
        </motion.text>
        
        <motion.text x="100" y="78" textAnchor="middle" fill="#21d8ff" fontSize="5" fontWeight="500">
          {progress < 90 ? `${Math.round(progress)}%` : "Complete"}
        </motion.text>
      </svg>
      
      <div className="flex justify-center gap-4 mt-1.5 text-[8px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded bg-[#ec4899]/40 border border-[#ec4899]"></span>
          <span>Tissue Edge</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#21d8ff]" style={{ boxShadow: '0 0 3px #21d8ff' }}></span>
          <span>Cells</span>
        </div>
      </div>
    </div>
  );
}

const mechanisms = [
  {
    id: 'actin',
    name: 'Actin Sequestration',
    icon: Activity,
    description: 'TB-500 binds G-actin monomers, preventing excessive polymerization and promoting controlled cytoskeleton reorganization',
    color: '#21d8ff'
  },
  {
    id: 'migration',
    name: 'Cell Migration',
    icon: Move,
    description: 'Enhances cellular motility by regulating actin dynamics, enabling cells to move toward injury sites',
    color: '#E7FB10'
  },
  {
    id: 'differentiation',
    name: 'Stem Cell Signaling',
    icon: Zap,
    description: 'Promotes progenitor cell differentiation and recruitment to damaged tissue areas',
    color: '#9d4edd'
  },
  {
    id: 'inflammation',
    name: 'Inflammatory Modulation',
    icon: Shield,
    description: 'Modulates inflammatory cytokine expression to create optimal healing environment',
    color: '#ec4899'
  },
];

export function TB500ActinVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const woundRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const woundInView = useInView(woundRef, { margin: "-20px" });
  const [activeMechanism, setActiveMechanism] = useState<string>('actin');
  const [healingProgress, setHealingProgress] = useState(0);

  useEffect(() => {
    if (!woundInView) return;
    
    const runHealingCycle = () => {
      let progress = 0;
      setHealingProgress(0);
      
      const interval = setInterval(() => {
        progress += 2;
        setHealingProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(runHealingCycle, 2500);
        }
      }, 80);
      
      return interval;
    };
    
    const interval = runHealingCycle();
    return () => clearInterval(interval);
  }, [woundInView]);

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
          <Activity className="h-5 w-5 text-[#21d8ff]" style={{ filter: 'drop-shadow(0 0 4px rgba(33, 216, 255, 0.6))' }} />
          <span className="text-sm font-bold bg-gradient-to-r from-[#21d8ff] to-[#E7FB10] bg-clip-text text-transparent">
            Actin Cytoskeleton Regulation
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          How TB-500 (Thymosin Beta-4) orchestrates cellular migration and tissue repair
        </p>
      </motion.div>

      <div 
        className="rounded-xl border p-6 mb-6"
        style={{ 
          borderColor: 'rgba(33, 216, 255, 0.3)',
          background: 'linear-gradient(135deg, rgba(33, 216, 255, 0.05) 0%, transparent 50%)'
        }}
      >
        <ActinFilamentAnimation isInView={isInView} activeMechanism={activeMechanism} />
        
        <div className="mt-6">
          <span className="text-xs text-muted-foreground uppercase tracking-wider mb-4 block">
            Mechanism of Action
          </span>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {mechanisms.map((mechanism) => {
              const Icon = mechanism.icon;
              const isActive = activeMechanism === mechanism.id;
              
              return (
                <motion.button
                  key={mechanism.id}
                  onClick={() => setActiveMechanism(mechanism.id)}
                  className="relative p-3 rounded-lg text-center transition-all cursor-pointer"
                  style={{
                    backgroundColor: isActive ? `${mechanism.color}20` : 'rgba(255,255,255,0.03)',
                    border: `1.5px solid ${isActive ? mechanism.color : 'rgba(255,255,255,0.1)'}`,
                    boxShadow: isActive ? `0 0 15px ${mechanism.color}30` : 'none'
                  }}
                  whileHover={{ scale: 1.02 }}
                  data-testid={`mechanism-${mechanism.id}`}
                >
                  <motion.div
                    className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center"
                    style={{ backgroundColor: `${mechanism.color}20` }}
                    animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
                  >
                    <Icon className="h-5 w-5" style={{ color: mechanism.color, filter: `drop-shadow(0 0 4px ${mechanism.color})` }} />
                  </motion.div>
                  <span className="text-[10px] font-bold" style={{ color: isActive ? mechanism.color : 'rgba(255,255,255,0.6)' }}>
                    {mechanism.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
          
          <motion.div
            key={activeMechanism}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-lg"
            style={{
              backgroundColor: `${mechanisms.find(m => m.id === activeMechanism)?.color}10`,
              border: `1px solid ${mechanisms.find(m => m.id === activeMechanism)?.color}30`
            }}
          >
            <p className="text-sm text-muted-foreground text-center">
              {mechanisms.find(m => m.id === activeMechanism)?.description}
            </p>
          </motion.div>
        </div>

        <div ref={woundRef} className="mt-6 pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-2 mb-3">
            <ArrowRight className="h-4 w-4 text-[#22c55e]" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Wound Closure Simulation
            </span>
            <span className="ml-auto text-xs text-[#22c55e]/60 italic">Auto-plays when visible</span>
          </div>
          <WoundClosureVisual isInView={isInView} progress={healingProgress} />
        </div>
      </div>

      <motion.div
        className="text-center text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 2 }}
      >
        <span className="px-3 py-1 rounded-full bg-muted/30">
          TB-500 actin regulation visualization • For research education only
        </span>
      </motion.div>
    </div>
  );
}
