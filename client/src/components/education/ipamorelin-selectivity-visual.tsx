import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Target, Check, X, Zap, Shield, Activity, Brain } from "lucide-react";

function GHRPReceptorComparison({ isInView, showIpamorelin }: { isInView: boolean; showIpamorelin: boolean }) {
  const receptors = [
    { id: 'ghrelin', name: 'Ghrelin Receptor', x: 80, ipaActive: true, otherActive: true, color: '#E7FB10' },
    { id: 'cortisol', name: 'Cortisol Path', x: 160, ipaActive: false, otherActive: true, color: '#ef4444' },
    { id: 'prolactin', name: 'Prolactin Path', x: 240, ipaActive: false, otherActive: true, color: '#f97316' },
  ];
  
  return (
    <div className="relative w-full h-64 flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 rounded-xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(231, 251, 16, 0.08) 0%, transparent 70%)'
        }}
      />
      
      <svg viewBox="0 0 320 200" className="w-full h-full">
        <defs>
          <filter id="selectiveGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <motion.ellipse
          cx="160"
          cy="45"
          rx="40"
          ry="25"
          fill="rgba(157, 78, 221, 0.2)"
          stroke="#9d4edd"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ duration: 0.5 }}
          style={{ filter: 'drop-shadow(0 0 10px rgba(157, 78, 221, 0.4))' }}
        />
        <motion.text x="160" y="42" textAnchor="middle" fill="#9d4edd" fontSize="9" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          Pituitary
        </motion.text>
        <motion.text x="160" y="52" textAnchor="middle" fill="#9d4edd" fontSize="7"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          GH Release
        </motion.text>
        
        {receptors.map((receptor, idx) => {
          const isActive = showIpamorelin ? receptor.ipaActive : receptor.otherActive;
          const activeColor = showIpamorelin && receptor.ipaActive ? '#E7FB10' : 
                             !showIpamorelin && receptor.otherActive ? receptor.color : 
                             'rgba(255,255,255,0.2)';
          
          return (
            <motion.g key={receptor.id}>
              <motion.line
                x1="160"
                y1="70"
                x2={receptor.x}
                y2="110"
                stroke={isActive ? activeColor : 'rgba(255,255,255,0.1)'}
                strokeWidth={isActive ? 3 : 1}
                strokeDasharray={isActive ? "0" : "4,4"}
                initial={{ pathLength: 0 }}
                animate={isInView ? { pathLength: 1 } : {}}
                transition={{ delay: 0.5 + idx * 0.15 }}
                style={{ filter: isActive ? `drop-shadow(0 0 6px ${activeColor})` : 'none' }}
              />
              
              <motion.circle
                cx={receptor.x}
                cy="130"
                r="25"
                fill={isActive ? `${activeColor}20` : 'rgba(255,255,255,0.03)'}
                stroke={isActive ? activeColor : 'rgba(255,255,255,0.15)'}
                strokeWidth={isActive ? 2.5 : 1}
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ delay: 0.8 + idx * 0.1, type: "spring" }}
                style={{ filter: isActive ? `drop-shadow(0 0 12px ${activeColor})` : 'none' }}
              />
              
              <motion.text
                x={receptor.x}
                y="128"
                textAnchor="middle"
                fill={isActive ? activeColor : 'rgba(255,255,255,0.3)'}
                fontSize="8"
                fontWeight="bold"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 1 }}
              >
                {receptor.name.split(' ')[0]}
              </motion.text>
              <motion.text
                x={receptor.x}
                y="138"
                textAnchor="middle"
                fill={isActive ? activeColor : 'rgba(255,255,255,0.3)'}
                fontSize="7"
              >
                {receptor.name.split(' ')[1]}
              </motion.text>
              
              <motion.g
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ delay: 1.2 + idx * 0.1, type: "spring" }}
              >
                {isActive ? (
                  <motion.circle
                    cx={receptor.x}
                    cy="165"
                    r="10"
                    fill={receptor.ipaActive && showIpamorelin ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}
                    stroke={receptor.ipaActive && showIpamorelin ? '#22c55e' : '#ef4444'}
                    strokeWidth="1.5"
                  />
                ) : (
                  <motion.circle
                    cx={receptor.x}
                    cy="165"
                    r="10"
                    fill="rgba(34, 197, 94, 0.3)"
                    stroke="#22c55e"
                    strokeWidth="1.5"
                  />
                )}
                {isActive ? (
                  receptor.ipaActive && showIpamorelin ? (
                    <Check className="h-3 w-3 text-[#22c55e]" style={{ transform: `translate(${receptor.x - 6}px, 159px)` }} />
                  ) : (
                    <motion.text x={receptor.x} y="168" textAnchor="middle" fill="#ef4444" fontSize="10">!</motion.text>
                  )
                ) : (
                  <Check className="h-3 w-3 text-[#22c55e]" style={{ transform: `translate(${receptor.x - 6}px, 159px)` }} />
                )}
              </motion.g>
              
              <motion.text
                x={receptor.x}
                y="185"
                textAnchor="middle"
                fill={isActive && (!receptor.ipaActive || !showIpamorelin) && !(!isActive) ? '#ef4444' : '#22c55e'}
                fontSize="7"
                fontWeight="bold"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 1.4 }}
              >
                {isActive && (!receptor.ipaActive || !showIpamorelin) && !(!isActive) ? 'Activated' : 'No Effect'}
              </motion.text>
            </motion.g>
          );
        })}
        
        <motion.rect
          x="130"
          y="5"
          width="60"
          height="22"
          rx="4"
          fill={showIpamorelin ? "rgba(231, 251, 16, 0.2)" : "rgba(157, 78, 221, 0.2)"}
          stroke={showIpamorelin ? "#E7FB10" : "#9d4edd"}
          strokeWidth="1.5"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          style={{ filter: `drop-shadow(0 0 8px ${showIpamorelin ? 'rgba(231, 251, 16, 0.4)' : 'rgba(157, 78, 221, 0.4)'})` }}
        />
        <motion.text x="160" y="19" textAnchor="middle" fill={showIpamorelin ? "#E7FB10" : "#9d4edd"} fontSize="9" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          {showIpamorelin ? 'Ipamorelin' : 'Other GHRPs'}
        </motion.text>
      </svg>
    </div>
  );
}

const comparisonPoints = [
  { 
    label: "GH Stimulation", 
    ipamorelin: true, 
    other: true, 
    icon: Zap,
    description: "Both stimulate growth hormone release from pituitary"
  },
  { 
    label: "Cortisol Effect", 
    ipamorelin: false, 
    other: true, 
    icon: Activity,
    description: "Ipamorelin does not elevate cortisol levels"
  },
  { 
    label: "Prolactin Effect", 
    ipamorelin: false, 
    other: true, 
    icon: Brain,
    description: "Ipamorelin does not affect prolactin secretion"
  },
  { 
    label: "ACTH Effect", 
    ipamorelin: false, 
    other: true, 
    icon: Target,
    description: "Ipamorelin does not stimulate ACTH release"
  },
  { 
    label: "Appetite Increase", 
    ipamorelin: false, 
    other: true, 
    icon: Activity,
    description: "Minimal impact on hunger signaling"
  },
  { 
    label: "Selective Action", 
    ipamorelin: true, 
    other: false, 
    icon: Shield,
    description: "Targets only GH release pathway"
  },
];

export function IpamorelinSelectivityVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const [showIpamorelin, setShowIpamorelin] = useState(true);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

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
          <Target className="h-5 w-5 text-[#E7FB10]" style={{ filter: 'drop-shadow(0 0 4px rgba(231, 251, 16, 0.6))' }} />
          <span className="text-sm font-bold bg-gradient-to-r from-[#E7FB10] to-[#21d8ff] bg-clip-text text-transparent">
            Selective GH Secretagogue Action
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Why Ipamorelin is called the "selective" growth hormone releasing peptide
        </p>
      </motion.div>

      <div 
        className="rounded-xl border p-6 mb-6"
        style={{ 
          borderColor: 'rgba(231, 251, 16, 0.3)',
          background: 'linear-gradient(135deg, rgba(231, 251, 16, 0.05) 0%, transparent 50%)'
        }}
      >
        <div className="flex justify-center gap-3 mb-6">
          <motion.button
            onClick={() => setShowIpamorelin(true)}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              backgroundColor: showIpamorelin ? 'rgba(231, 251, 16, 0.2)' : 'rgba(255,255,255,0.03)',
              border: `1.5px solid ${showIpamorelin ? '#E7FB10' : 'rgba(255,255,255,0.1)'}`,
              color: showIpamorelin ? '#E7FB10' : 'rgba(255,255,255,0.5)',
              boxShadow: showIpamorelin ? '0 0 15px rgba(231, 251, 16, 0.3)' : 'none'
            }}
            whileHover={{ scale: 1.02 }}
            data-testid="button-ipamorelin"
          >
            Ipamorelin (Selective)
          </motion.button>
          <motion.button
            onClick={() => setShowIpamorelin(false)}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              backgroundColor: !showIpamorelin ? 'rgba(157, 78, 221, 0.2)' : 'rgba(255,255,255,0.03)',
              border: `1.5px solid ${!showIpamorelin ? '#9d4edd' : 'rgba(255,255,255,0.1)'}`,
              color: !showIpamorelin ? '#9d4edd' : 'rgba(255,255,255,0.5)',
              boxShadow: !showIpamorelin ? '0 0 15px rgba(157, 78, 221, 0.3)' : 'none'
            }}
            whileHover={{ scale: 1.02 }}
            data-testid="button-other-ghrp"
          >
            Other GHRPs
          </motion.button>
        </div>
        
        <GHRPReceptorComparison isInView={isInView} showIpamorelin={showIpamorelin} />
        
        <div className="mt-6">
          <span className="text-xs text-muted-foreground uppercase tracking-wider mb-4 block">
            Selectivity Comparison
          </span>
          
          <div className="space-y-2">
            {comparisonPoints.map((point, idx) => {
              const Icon = point.icon;
              const ipaBetter = point.ipamorelin !== point.other && 
                               ((point.ipamorelin && point.label.includes('Selective')) || 
                                (!point.ipamorelin && !point.label.includes('Selective')));
              
              return (
                <motion.div
                  key={point.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.5 + idx * 0.08 }}
                  className="p-3 rounded-lg transition-all cursor-pointer"
                  style={{
                    backgroundColor: hoveredRow === idx ? 'rgba(231, 251, 16, 0.1)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${hoveredRow === idx ? 'rgba(231, 251, 16, 0.3)' : 'rgba(255,255,255,0.05)'}`
                  }}
                  onMouseEnter={() => setHoveredRow(idx)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{point.label}</span>
                    </div>
                    
                    <div className="flex justify-center">
                      <motion.div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: point.ipamorelin ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          border: `1.5px solid ${point.ipamorelin ? '#22c55e' : '#ef4444'}`
                        }}
                        animate={hoveredRow === idx ? { scale: 1.1 } : { scale: 1 }}
                      >
                        {point.ipamorelin ? (
                          <Check className="h-4 w-4 text-[#22c55e]" />
                        ) : (
                          <X className="h-4 w-4 text-[#ef4444]" />
                        )}
                      </motion.div>
                    </div>
                    
                    <div className="flex justify-center">
                      <motion.div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: point.other ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                          border: `1.5px solid ${point.other ? '#ef4444' : '#22c55e'}`
                        }}
                        animate={hoveredRow === idx ? { scale: 1.1 } : { scale: 1 }}
                      >
                        {point.other ? (
                          <Check className="h-4 w-4 text-[#ef4444]" />
                        ) : (
                          <X className="h-4 w-4 text-[#22c55e]" />
                        )}
                      </motion.div>
                    </div>
                  </div>
                  
                  {hoveredRow === idx && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-xs text-muted-foreground mt-2 pl-6"
                    >
                      {point.description}
                    </motion.p>
                  )}
                </motion.div>
              );
            })}
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <div></div>
            <div className="text-center">
              <span className="text-xs font-bold text-[#E7FB10]">Ipamorelin</span>
              <p className="text-[10px] text-muted-foreground">Selective</p>
            </div>
            <div className="text-center">
              <span className="text-xs font-bold text-[#9d4edd]">Other GHRPs</span>
              <p className="text-[10px] text-muted-foreground">Non-selective</p>
            </div>
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
          Ipamorelin selectivity visualization • For research education only
        </span>
      </motion.div>
    </div>
  );
}
