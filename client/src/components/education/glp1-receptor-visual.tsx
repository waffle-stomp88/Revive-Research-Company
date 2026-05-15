import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Target, Zap, Activity, TrendingDown, Info } from "lucide-react";
import { useHoverCapable } from "@/hooks/use-hover-capable";

function CellMembraneWithReceptors({ isInView, activeReceptors, peptide }: { 
  isInView: boolean; 
  activeReceptors: string[];
  peptide: string;
}) {
  const receptorData = [
    { id: 'glp1', name: 'GLP-1R', x: 80, color: '#21d8ff' },
    { id: 'gip', name: 'GIPR', x: 160, color: '#E7FB10' },
    { id: 'glucagon', name: 'GCGR', x: 240, color: '#ec4899' },
  ];
  
  return (
    <div className="relative w-full h-72 flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 rounded-xl"
        style={{
          background: 'radial-gradient(ellipse at center bottom, rgba(33, 216, 255, 0.1) 0%, transparent 70%)'
        }}
      />
      
      <svg viewBox="0 0 320 220" className="w-full h-full">
        <defs>
          <filter id="receptorGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="membraneGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.05" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" />
          </linearGradient>
          <pattern id="phospholipid" patternUnits="userSpaceOnUse" width="20" height="40">
            <circle cx="10" cy="8" r="6" fill="currentColor" fillOpacity="0.15" />
            <line x1="10" y1="14" x2="10" y2="32" stroke="currentColor" strokeOpacity="0.1" strokeWidth="2" />
          </pattern>
        </defs>
        
        <motion.rect
          x="0" y="100" width="320" height="50"
          fill="url(#membraneGradient)"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        />
        <motion.rect
          x="0" y="100" width="320" height="50"
          fill="url(#phospholipid)"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 0.5 } : {}}
          transition={{ duration: 0.8 }}
        />
        
        <motion.text x="10" y="95" fill="currentColor" fillOpacity="0.4" fontSize="8">
          Extracellular
        </motion.text>
        <motion.text x="10" y="165" fill="currentColor" fillOpacity="0.4" fontSize="8">
          Intracellular
        </motion.text>
        
        {receptorData.map((receptor, idx) => {
          const isActive = activeReceptors.includes(receptor.id);
          
          return (
            <motion.g key={receptor.id}>
              <motion.rect
                x={receptor.x - 12}
                y="85"
                width="24"
                height="80"
                rx="8"
                fill={isActive ? `${receptor.color}30` : 'hsl(var(--foreground) / 0.08)'}
                stroke={isActive ? receptor.color : 'hsl(var(--foreground) / 0.2)'}
                strokeWidth={isActive ? 2.5 : 1.5}
                initial={{ scaleY: 0 }}
                animate={isInView ? { 
                  scaleY: 1,
                  boxShadow: isActive ? `0 0 20px ${receptor.color}` : 'none'
                } : {}}
                transition={{ delay: 0.3 + idx * 0.15 }}
                style={{ 
                  transformOrigin: `${receptor.x}px 125px`,
                  filter: isActive ? `drop-shadow(0 0 12px ${receptor.color})` : 'none'
                }}
              />
              
              <motion.circle
                cx={receptor.x}
                cy="75"
                r={isActive ? 12 : 10}
                fill={isActive ? `${receptor.color}50` : 'hsl(var(--foreground) / 0.1)'}
                stroke={isActive ? receptor.color : 'hsl(var(--foreground) / 0.3)'}
                strokeWidth={isActive ? 2 : 1}
                initial={{ scale: 0 }}
                animate={isInView ? { 
                  scale: 1,
                } : {}}
                transition={{ delay: 0.5 + idx * 0.15, type: "spring" }}
                style={{ filter: isActive ? `drop-shadow(0 0 8px ${receptor.color})` : 'none' }}
              />
              
              {isActive && (
                <motion.circle
                  cx={receptor.x}
                  cy="75"
                  r="16"
                  fill="none"
                  stroke={receptor.color}
                  strokeWidth="1"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.8, 0, 0.8]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              
              <motion.text
                x={receptor.x}
                y="180"
                textAnchor="middle"
                fill={isActive ? receptor.color : 'hsl(var(--foreground) / 0.4)'}
                fontSize="9"
                fontWeight="bold"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.7 + idx * 0.1 }}
              >
                {receptor.name}
              </motion.text>
              
              {isActive && (
                <motion.g>
                  <motion.path
                    d={`M ${receptor.x} 175 L ${receptor.x} 195 L ${receptor.x - 15} 210 M ${receptor.x} 195 L ${receptor.x + 15} 210`}
                    stroke={receptor.color}
                    strokeWidth="1.5"
                    fill="none"
                    strokeDasharray="3,2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: 1 }}
                    style={{ filter: `drop-shadow(0 0 4px ${receptor.color})` }}
                  />
                  <motion.text x={receptor.x} y="218" textAnchor="middle" fill={receptor.color} fontSize="7"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                  >
                    Signaling
                  </motion.text>
                </motion.g>
              )}
            </motion.g>
          );
        })}
        
        {activeReceptors.map((receptorId, idx) => {
          const receptor = receptorData.find(r => r.id === receptorId);
          if (!receptor) return null;
          
          return (
            <motion.g key={`peptide-${idx}`}>
              <motion.circle
                r="7"
                fill={receptor.color}
                initial={{ opacity: 0, cy: 10, cx: receptor.x }}
                animate={isInView ? {
                  opacity: [0, 1, 1, 1],
                  cy: [10, 40, 75, 75],
                  scale: [1, 1, 1.3, 1]
                } : {}}
                transition={{ duration: 1.5, delay: 0.8 + idx * 0.2 }}
                style={{ filter: `drop-shadow(0 0 8px ${receptor.color})` }}
              />
            </motion.g>
          );
        })}
        
        <motion.rect
          x="130"
          y="5"
          width="60"
          height="25"
          rx="5"
          fill="rgba(33, 216, 255, 0.2)"
          stroke="#21d8ff"
          strokeWidth="1.5"
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.5 }}
          style={{ filter: 'drop-shadow(0 0 8px rgba(33, 216, 255, 0.4))' }}
        />
        <motion.text x="160" y="21" textAnchor="middle" fill="#21d8ff" fontSize="9" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.7 }}
        >
          {peptide}
        </motion.text>
      </svg>
    </div>
  );
}

const peptideProfiles = [
  {
    id: 'rr-a1',
    name: 'RR-A1',
    type: 'Single Agonist',
    receptors: ['glp1'],
    color: '#21d8ff',
    halfLife: '~7 days',
    mechanism: 'GLP-1 receptor agonism with albumin binding for extended action',
    benefits: ['Glycemic control', 'Appetite modulation', 'Cardiovascular research']
  },
  {
    id: 'rr-a2',
    name: 'RR-A2',
    type: 'Dual Agonist',
    receptors: ['glp1', 'gip'],
    color: '#E7FB10',
    halfLife: '~5 days',
    mechanism: 'Imbalanced dual agonism for synergistic incretin signaling',
    benefits: ['Enhanced glycemic effects', 'Weight research', 'Metabolic studies']
  },
  {
    id: 'rr-a3',
    name: 'RR-A3',
    type: 'Triple Agonist',
    receptors: ['glp1', 'gip', 'glucagon'],
    color: '#ec4899',
    halfLife: '~6 days',
    mechanism: 'First triple-receptor approach combining all incretin pathways',
    benefits: ['Multi-pathway activation', 'Thermogenesis', 'Comprehensive metabolic research']
  },
];

export function GLP1ReceptorVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const hoverCapable = useHoverCapable();
  const [activePeptide, setActivePeptide] = useState(peptideProfiles[0]);

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
          <Target className="h-5 w-5 text-[#21d8ff]" style={{ filter: 'drop-shadow(0 0 4px rgba(33, 216, 255, 0.6))' }} />
          <span className="text-sm font-bold bg-gradient-to-r from-[#21d8ff] via-[#E7FB10] to-[#ec4899] bg-clip-text text-transparent">
            Incretin Receptor Binding Mechanism
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          How GLP-1 agonists bind to cell membrane receptors and trigger intracellular signaling
        </p>
      </motion.div>

      <div 
        className="rounded-xl border p-6 mb-6"
        style={{ 
          borderColor: `${activePeptide.color}30`,
          background: `linear-gradient(135deg, ${activePeptide.color}05 0%, transparent 50%)`
        }}
      >
        <div className="flex justify-center gap-3 mb-6">
          {peptideProfiles.map((peptide) => (
            <motion.button
              key={peptide.id}
              onClick={() => setActivePeptide(peptide)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                backgroundColor: activePeptide.id === peptide.id ? `${peptide.color}20` : 'hsl(var(--foreground) / 0.03)',
                border: `1.5px solid ${activePeptide.id === peptide.id ? peptide.color : 'hsl(var(--foreground) / 0.1)'}`,
                color: activePeptide.id === peptide.id ? peptide.color : 'hsl(var(--foreground) / 0.5)',
                boxShadow: activePeptide.id === peptide.id ? `0 0 15px ${peptide.color}30` : 'none'
              }}
              whileHover={hoverCapable ? { scale: 1.02 } : {}}
              data-testid={`peptide-${peptide.id}`}
            >
              {peptide.name}
            </motion.button>
          ))}
        </div>
        
        <CellMembraneWithReceptors 
          isInView={isInView} 
          activeReceptors={activePeptide.receptors}
          peptide={activePeptide.name}
        />
        
        <motion.div
          key={activePeptide.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6 grid md:grid-cols-2 gap-4"
        >
          <div 
            className="p-4 rounded-lg"
            style={{
              backgroundColor: `${activePeptide.color}10`,
              border: `1px solid ${activePeptide.color}30`
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4" style={{ color: activePeptide.color }} />
              <span className="text-sm font-bold" style={{ color: activePeptide.color }}>
                {activePeptide.type}
              </span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full" 
                style={{ backgroundColor: `${activePeptide.color}20`, color: activePeptide.color }}>
                {activePeptide.receptors.length} receptor{activePeptide.receptors.length > 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {activePeptide.mechanism}
            </p>
            <div className="flex items-center gap-2 text-xs">
              <Activity className="h-3 w-3" style={{ color: activePeptide.color }} />
              <span className="text-muted-foreground">Half-life:</span>
              <span className="font-bold" style={{ color: activePeptide.color }}>{activePeptide.halfLife}</span>
            </div>
          </div>
          
          <div 
            className="p-4 rounded-lg"
            style={{
              backgroundColor: 'hsl(var(--foreground) / 0.02)',
              border: '1px solid hsl(var(--foreground) / 0.05)'
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="h-4 w-4 text-[#22c55e]" />
              <span className="text-sm font-bold text-foreground">Research Applications</span>
            </div>
            <div className="space-y-2">
              {activePeptide.benefits.map((benefit, idx) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="flex items-center gap-2"
                >
                  <span 
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: activePeptide.color }}
                  />
                  <span className="text-xs text-muted-foreground">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 2 }}
          className="mt-4 p-3 rounded-lg bg-[#21d8ff]/10 border border-[#21d8ff]/20"
        >
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-[#21d8ff] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Research context:</strong> Each additional receptor 
              target adds distinct signaling pathways. Triple agonists combine GLP-1, GIP, and 
              glucagon receptor activation for comprehensive metabolic research.
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="text-center text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 2 }}
      >
        <span className="px-3 py-1 rounded-full bg-muted/30">
          Incretin receptor mechanism visualization • For research education only
        </span>
      </motion.div>
    </div>
  );
}
