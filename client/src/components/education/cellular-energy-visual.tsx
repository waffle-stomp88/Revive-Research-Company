import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { 
  Zap,
  Battery,
  Flame,
  Dna,
  Activity,
  ArrowRight,
  CircleDot,
  Atom
} from "lucide-react";

// Mitochondrial DNA Strand Visualization
function MitochondrialDNAStrand({ pathways, activePathway, setActivePathway }: {
  pathways: { name: string; description: string; icon: any; color: string }[];
  activePathway: number | null;
  setActivePathway: (index: number | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-30px" });

  // DNA base pair colors
  const basePairColors = ['#E7FB10', '#21d8ff', '#9d4edd', '#ec4899'];
  
  return (
    <div ref={containerRef} className="relative mb-8">
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#9d4edd]/10 border border-[#9d4edd]/30">
          <Dna className="h-4 w-4 text-[#9d4edd]" />
          <span className="text-xs font-medium text-[#9d4edd]">Mitochondrial DNA Origin</span>
        </div>
      </div>
      
      <div className="relative flex flex-col items-center">
        {/* Central DNA Double Helix */}
        <div className="relative w-full max-w-md mx-auto">
          {/* DNA Helix Visual */}
          <svg 
            viewBox="0 0 300 120" 
            className="w-full h-auto"
            style={{ filter: 'drop-shadow(0 0 10px rgba(157, 78, 221, 0.3))' }}
          >
            {/* Background glow */}
            <defs>
              <linearGradient id="dnaGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#9d4edd" stopOpacity="0" />
                <stop offset="50%" stopColor="#9d4edd" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#9d4edd" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="strandGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E7FB10" />
                <stop offset="25%" stopColor="#21d8ff" />
                <stop offset="50%" stopColor="#9d4edd" />
                <stop offset="75%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#E7FB10" />
              </linearGradient>
            </defs>
            
            {/* DNA backbone strands */}
            <motion.path
              d="M 20 60 Q 50 20, 80 60 Q 110 100, 140 60 Q 170 20, 200 60 Q 230 100, 260 60 Q 290 20, 320 60"
              fill="none"
              stroke="url(#strandGradient1)"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : {}}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            <motion.path
              d="M 20 60 Q 50 100, 80 60 Q 110 20, 140 60 Q 170 100, 200 60 Q 230 20, 260 60 Q 290 100, 320 60"
              fill="none"
              stroke="url(#strandGradient1)"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : {}}
              transition={{ duration: 2, ease: "easeInOut", delay: 0.2 }}
            />
            
            {/* Base pairs connecting the strands */}
            {[0, 1, 2, 3].map((index) => {
              const xPositions = [50, 110, 170, 230];
              const x = xPositions[index];
              const isActive = activePathway === index;
              
              return (
                <motion.g key={index}>
                  <motion.line
                    x1={x}
                    y1={35}
                    x2={x}
                    y2={85}
                    stroke={basePairColors[index]}
                    strokeWidth={isActive ? 4 : 2}
                    strokeLinecap="round"
                    initial={{ scaleY: 0 }}
                    animate={isInView ? { scaleY: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.15 }}
                    style={{ 
                      transformOrigin: `${x}px 60px`,
                      filter: isActive ? `drop-shadow(0 0 8px ${basePairColors[index]})` : 'none'
                    }}
                  />
                  <motion.circle
                    cx={x}
                    cy={35}
                    r={isActive ? 6 : 4}
                    fill={basePairColors[index]}
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ duration: 0.3, delay: 1.2 + index * 0.15 }}
                    style={{ 
                      filter: isActive ? `drop-shadow(0 0 6px ${basePairColors[index]})` : 'none'
                    }}
                  />
                  <motion.circle
                    cx={x}
                    cy={85}
                    r={isActive ? 6 : 4}
                    fill={basePairColors[index]}
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ duration: 0.3, delay: 1.2 + index * 0.15 }}
                    style={{ 
                      filter: isActive ? `drop-shadow(0 0 6px ${basePairColors[index]})` : 'none'
                    }}
                  />
                </motion.g>
              );
            })}
            
            {/* MOTS-c gene highlight */}
            <motion.rect
              x={100}
              y={25}
              width={100}
              height={70}
              rx={8}
              fill="none"
              stroke="#9d4edd"
              strokeWidth="2"
              strokeDasharray="5,5"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: [0, 1, 0.5, 1] } : {}}
              transition={{ duration: 2, delay: 1.5, repeat: Infinity, repeatType: "reverse" }}
            />
            
            {/* MOTS-c label */}
            <motion.text
              x={150}
              y={18}
              textAnchor="middle"
              fill="#9d4edd"
              fontSize="10"
              fontWeight="bold"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 1.8 }}
            >
              MOTS-c Gene
            </motion.text>
          </svg>
          
          {/* Animated particles along DNA */}
          <motion.div
            className="absolute top-1/2 left-0 w-3 h-3 rounded-full bg-[#E7FB10]"
            style={{ filter: 'blur(1px)' }}
            animate={{
              x: [0, 300, 0],
              y: [-15, 15, -15, 15, -15],
              opacity: [0, 1, 1, 1, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
        
        {/* Pathway connections from DNA */}
        <div className="mt-6 relative w-full">
          <motion.div
            className="flex justify-center items-center gap-2 mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 2 }}
          >
            <Atom className="h-4 w-4 text-[#9d4edd]" />
            <span className="text-xs text-muted-foreground">Peptide activates multiple cellular pathways</span>
          </motion.div>
          
          {/* Connection lines to pathways */}
          <div className="grid grid-cols-4 gap-2">
            {pathways.map((pathway, index) => {
              const Icon = pathway.icon;
              const isActive = activePathway === index;
              
              return (
                <motion.div
                  key={pathway.name}
                  className="relative flex flex-col items-center cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 2.2 + index * 0.1 }}
                  onMouseEnter={() => setActivePathway(index)}
                  onMouseLeave={() => setActivePathway(null)}
                >
                  {/* Vertical connection line */}
                  <motion.div
                    className="w-0.5 h-6 mb-2"
                    style={{ backgroundColor: pathway.color }}
                    initial={{ scaleY: 0 }}
                    animate={isInView ? { scaleY: 1 } : {}}
                    transition={{ delay: 2.4 + index * 0.1 }}
                  />
                  
                  {/* Pathway node */}
                  <motion.div
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-all"
                    style={{ 
                      backgroundColor: `${pathway.color}20`,
                      border: `2px solid ${pathway.color}`,
                      boxShadow: isActive ? `0 0 15px ${pathway.color}50` : 'none'
                    }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Icon className="h-5 w-5" style={{ color: pathway.color }} />
                  </motion.div>
                  
                  {/* Pathway label */}
                  <span 
                    className="text-[10px] font-medium text-center mt-1.5 leading-tight"
                    style={{ color: isActive ? pathway.color : 'inherit' }}
                  >
                    {pathway.name.split(' ')[0]}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <motion.div
        className="mt-6 flex justify-center"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 2.8 }}
      >
        <div className="inline-flex items-center gap-4 px-4 py-2 rounded-lg bg-muted/30 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#9d4edd]"></span>
            mtDNA encoded
          </span>
          <span className="flex items-center gap-1">
            <span className="w-6 h-0.5 bg-gradient-to-r from-[#E7FB10] to-[#ec4899]"></span>
            Double helix
          </span>
        </div>
      </motion.div>
    </div>
  );
}

interface CellularEnergyVisualProps {
  peptide: 'mots-c' | 'nad';
}

const peptideData = {
  'mots-c': {
    name: 'MOTS-c',
    color: '#9d4edd',
    fullName: 'Mitochondrial Open Reading Frame',
    mechanism: 'Mitochondrial-Derived Peptide',
    source: 'Encoded in mitochondrial DNA',
    pathways: [
      { name: 'AMPK Activation', description: 'Energy sensor pathway', icon: Zap, color: '#E7FB10' },
      { name: 'Glucose Uptake', description: 'Enhanced cellular glucose', icon: Flame, color: '#21d8ff' },
      { name: 'Folate Cycle', description: 'Metabolic regulation', icon: Activity, color: '#9d4edd' },
      { name: 'Fat Oxidation', description: 'Lipid metabolism', icon: Battery, color: '#ec4899' },
    ],
    benefits: ['Metabolic Homeostasis', 'Exercise Mimetic', 'Insulin Sensitivity', 'Longevity Research'],
  },
  'nad': {
    name: 'NAD+',
    color: '#21d8ff',
    fullName: 'Nicotinamide Adenine Dinucleotide',
    mechanism: 'Essential Coenzyme',
    source: 'Required in every cell',
    pathways: [
      { name: 'Sirtuin Activation', description: 'SIRT1-7 enzyme family', icon: Dna, color: '#E7FB10' },
      { name: 'ATP Production', description: 'Cellular energy currency', icon: Battery, color: '#21d8ff' },
      { name: 'DNA Repair', description: 'PARP enzyme function', icon: Activity, color: '#9d4edd' },
      { name: 'Mitochondrial Health', description: 'Biogenesis support', icon: CircleDot, color: '#ec4899' },
    ],
    benefits: ['Cellular Energy', 'DNA Integrity', 'Aging Research', 'Metabolic Function'],
  },
};

export function CellularEnergyVisual({ peptide }: CellularEnergyVisualProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const [activePathway, setActivePathway] = useState<number | null>(null);
  const data = peptideData[peptide];

  return (
    <div ref={containerRef} className="relative">
      <div 
        className="rounded-xl border p-6 mb-6"
        style={{ 
          borderColor: `${data.color}30`,
          background: `linear-gradient(135deg, ${data.color}08 0%, transparent 50%)`
        }}
      >
        <div className="flex items-center gap-4 mb-6">
          <motion.div
            className="w-16 h-16 rounded-xl flex items-center justify-center relative"
            style={{ 
              backgroundColor: `${data.color}20`,
              boxShadow: `0 0 20px ${data.color}30`
            }}
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <Battery className="h-8 w-8" style={{ color: data.color }} />
            <motion.div
              className="absolute inset-0 rounded-xl"
              style={{ border: `2px solid ${data.color}` }}
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold" style={{ color: data.color }}>{data.name}</h3>
            <p className="text-sm text-muted-foreground">{data.fullName}</p>
            <div className="flex flex-wrap gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${data.color}20`, color: data.color }}>
                {data.mechanism}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: `${data.color}10`, border: `1px solid ${data.color}20` }}>
          <div className="flex items-center gap-2 mb-2">
            <CircleDot className="h-4 w-4" style={{ color: data.color }} />
            <span className="text-sm font-medium">Origin</span>
          </div>
          <p className="text-sm text-muted-foreground">{data.source}</p>
        </div>

        {/* DNA Strand Infographic - Only for MOTS-c */}
        {peptide === 'mots-c' && (
          <MitochondrialDNAStrand 
            pathways={data.pathways}
            activePathway={activePathway}
            setActivePathway={setActivePathway}
          />
        )}

        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Key Pathways
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {data.pathways.map((pathway, index) => {
            const Icon = pathway.icon;
            const isActive = activePathway === index;
            
            return (
              <motion.div
                key={pathway.name}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="relative rounded-lg p-4 cursor-pointer transition-all text-center"
                style={{ 
                  backgroundColor: isActive ? `${pathway.color}20` : `${pathway.color}10`,
                  borderColor: isActive ? pathway.color : `${pathway.color}30`,
                  border: '1px solid',
                  boxShadow: isActive ? `0 0 15px ${pathway.color}30` : undefined
                }}
                onMouseEnter={() => setActivePathway(index)}
                onMouseLeave={() => setActivePathway(null)}
              >
                <motion.div
                  className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center"
                  style={{ backgroundColor: `${pathway.color}20` }}
                  animate={{ scale: isActive ? 1.1 : 1 }}
                >
                  <Icon className="h-5 w-5" style={{ color: pathway.color }} />
                </motion.div>
                <span className="text-sm font-medium block mb-1" style={{ color: pathway.color }}>
                  {pathway.name}
                </span>
                <span className="text-[10px] text-muted-foreground">{pathway.description}</span>
              </motion.div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <ArrowRight className="h-4 w-4" style={{ color: data.color }} />
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Research Applications
          </h4>
        </div>

        <div className="flex flex-wrap gap-2">
          {data.benefits.map((benefit, index) => (
            <motion.span
              key={benefit}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.7 + index * 0.05 }}
              className="px-3 py-1.5 rounded-full text-sm font-medium"
              style={{ 
                backgroundColor: `${data.color}15`,
                color: data.color,
                border: `1px solid ${data.color}30`
              }}
            >
              {benefit}
            </motion.span>
          ))}
        </div>
      </div>

      <motion.div
        className="text-center text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.9 }}
      >
        <span className="px-3 py-1 rounded-full bg-muted/30">
          Cellular energy pathway illustration • For research education only
        </span>
      </motion.div>
    </div>
  );
}
