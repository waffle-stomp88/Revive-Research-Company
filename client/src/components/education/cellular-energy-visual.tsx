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
import { useHoverCapable, hoverIf } from "@/hooks/use-hover-capable";

// Mitochondrial DNA Strand Visualization
function MitochondrialDNAStrand({ pathways, activePathway, setActivePathway }: {
  pathways: { name: string; description: string; icon: any; color: string }[];
  activePathway: number | null;
  setActivePathway: (index: number | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-30px" });
  const hoverCapable = useHoverCapable();

  // DNA base pair colors
  const basePairColors = ['#D4FF1F', '#21d8ff', '#9d4edd', '#ec4899'];
  
  return (
    <div ref={containerRef} className="relative mb-8">
      {/* Background glow effect */}
      <div className="absolute inset-0 h-full w-full rounded-2xl bg-gradient-to-b from-[#9d4edd]/10 to-transparent blur-3xl -z-10" />
      
      <div className="text-center mb-6">
        <motion.div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border"
          style={{
            background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.15) 0%, rgba(33, 216, 255, 0.05) 100%)',
            borderColor: '#9d4edd',
            borderWidth: '1.5px',
            boxShadow: '0 0 20px rgba(157, 78, 221, 0.4)'
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.2 }}
        >
          <Dna className="h-5 w-5 text-[#D4FF1F]" style={{ filter: 'drop-shadow(0 0 4px rgba(231, 251, 16, 0.6))' }} />
          <span className="text-sm font-bold bg-gradient-to-r from-[#D4FF1F] to-[#21d8ff] bg-clip-text text-transparent">
            Mitochondrial DNA Origin
          </span>
        </motion.div>
      </div>
      
      <div className="relative flex flex-col items-center py-6">
        {/* Central DNA Double Helix */}
        <div className="relative w-full max-w-md mx-auto">
          {/* DNA Helix Visual */}
          <svg 
            viewBox="0 0 300 120" 
            className="w-full h-auto"
            style={{ filter: 'drop-shadow(0 0 25px rgba(231, 251, 16, 0.4)) drop-shadow(0 0 40px rgba(33, 216, 255, 0.2))' }}
          >
            {/* Enhanced gradients with more vibrant colors */}
            <defs>
              <linearGradient id="strandGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#D4FF1F" stopOpacity="1" />
                <stop offset="20%" stopColor="#21d8ff" stopOpacity="1" />
                <stop offset="40%" stopColor="#9d4edd" stopOpacity="1" />
                <stop offset="60%" stopColor="#ec4899" stopOpacity="1" />
                <stop offset="80%" stopColor="#21d8ff" stopOpacity="1" />
                <stop offset="100%" stopColor="#D4FF1F" stopOpacity="1" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* DNA backbone strands - thicker and more vibrant */}
            <motion.path
              d="M 20 60 Q 50 20, 80 60 Q 110 100, 140 60 Q 170 20, 200 60 Q 230 100, 260 60 Q 290 20, 320 60"
              fill="none"
              stroke="url(#strandGradient1)"
              strokeWidth="5"
              strokeLinecap="round"
              filter="url(#glow)"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : {}}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            <motion.path
              d="M 20 60 Q 50 100, 80 60 Q 110 20, 140 60 Q 170 100, 200 60 Q 230 20, 260 60 Q 290 100, 320 60"
              fill="none"
              stroke="url(#strandGradient1)"
              strokeWidth="5"
              strokeLinecap="round"
              filter="url(#glow)"
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
                  {/* Enhanced glowing line */}
                  <motion.line
                    x1={x}
                    y1={35}
                    x2={x}
                    y2={85}
                    stroke={basePairColors[index]}
                    strokeWidth={isActive ? 6 : 3}
                    strokeLinecap="round"
                    initial={{ scaleY: 0 }}
                    animate={isInView ? { scaleY: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.15 }}
                    style={{ 
                      transformOrigin: `${x}px 60px`,
                      filter: `drop-shadow(0 0 ${isActive ? '12' : '6'}px ${basePairColors[index]})`
                    }}
                  />
                  {/* Outer glow ring */}
                  <motion.circle
                    cx={x}
                    cy={35}
                    r={isActive ? 10 : 7}
                    fill="none"
                    stroke={basePairColors[index]}
                    strokeWidth="1"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={isInView ? { scale: 1, opacity: [0.3, 0.6, 0.3] } : {}}
                    transition={{ duration: 0.3, delay: 1.2 + index * 0.15, repeat: Infinity, repeatType: 'reverse' }}
                    style={{ 
                      transformOrigin: `${x}px 35px`,
                      filter: `drop-shadow(0 0 8px ${basePairColors[index]})`
                    }}
                  />
                  {/* Inner bright circle */}
                  <motion.circle
                    cx={x}
                    cy={35}
                    r={isActive ? 7 : 5}
                    fill={basePairColors[index]}
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ duration: 0.3, delay: 1.2 + index * 0.15 }}
                    style={{ 
                      filter: `drop-shadow(0 0 10px ${basePairColors[index]})`
                    }}
                  />
                  {/* Bottom circle with glow */}
                  <motion.circle
                    cx={x}
                    cy={85}
                    r={isActive ? 10 : 7}
                    fill="none"
                    stroke={basePairColors[index]}
                    strokeWidth="1"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={isInView ? { scale: 1, opacity: [0.3, 0.6, 0.3] } : {}}
                    transition={{ duration: 0.3, delay: 1.2 + index * 0.15, repeat: Infinity, repeatType: 'reverse' }}
                    style={{ 
                      transformOrigin: `${x}px 85px`,
                      filter: `drop-shadow(0 0 8px ${basePairColors[index]})`
                    }}
                  />
                  <motion.circle
                    cx={x}
                    cy={85}
                    r={isActive ? 7 : 5}
                    fill={basePairColors[index]}
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ duration: 0.3, delay: 1.2 + index * 0.15 }}
                    style={{ 
                      filter: `drop-shadow(0 0 10px ${basePairColors[index]})`
                    }}
                  />
                </motion.g>
              );
            })}
            
            {/* MOTS-c gene highlight - more vibrant */}
            <motion.rect
              x={100}
              y={25}
              width={100}
              height={70}
              rx={8}
              fill="none"
              stroke="#D4FF1F"
              strokeWidth="2"
              strokeDasharray="5,5"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: [0.3, 1, 0.3], strokeDashoffset: [10, 0, 10] } : {}}
              transition={{ duration: 2, delay: 1.5, repeat: Infinity }}
              style={{ 
                filter: 'drop-shadow(0 0 12px rgba(231, 251, 16, 0.6))'
              }}
            />
            
            {/* MOTS-c label - bright and glowing */}
            <motion.text
              x={150}
              y={16}
              textAnchor="middle"
              fill="#D4FF1F"
              fontSize="11"
              fontWeight="900"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 1.8 }}
              style={{ 
                textShadow: '0 0 8px rgba(231, 251, 16, 0.8)',
                filter: 'drop-shadow(0 0 6px rgba(231, 251, 16, 0.7))'
              }}
            >
              MOTS-c Gene
            </motion.text>
          </svg>
          
          {/* Multiple animated particles along DNA */}
          {[0, 1, 2].map((particle) => (
            <motion.div
              key={`particle-${particle}`}
              className="absolute w-2 h-2 rounded-full"
              style={{ 
                top: '50%',
                left: '10%',
                background: ['#D4FF1F', '#21d8ff', '#ec4899'][particle],
                filter: `blur(0.5px) drop-shadow(0 0 6px ${['#D4FF1F', '#21d8ff', '#ec4899'][particle]})`
              }}
              animate={{
                x: [0, 240, 0],
                y: [-20 + particle * 8, 20 - particle * 8, -20 + particle * 8],
                opacity: [0, 1, 1, 1, 0]
              }}
              transition={{
                duration: 4 + particle * 0.5,
                repeat: Infinity,
                ease: "linear",
                delay: particle * 1
              }}
            />
          ))}
        </div>
        
        {/* Pathway connections from DNA */}
        <div className="mt-8 relative w-full px-4">
          <motion.div
            className="flex justify-center items-center gap-2 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 2 }}
          >
            <Atom className="h-5 w-5 text-[#D4FF1F]" style={{ filter: 'drop-shadow(0 0 4px rgba(231, 251, 16, 0.6))' }} />
            <span className="text-sm font-medium bg-gradient-to-r from-[#D4FF1F] via-[#21d8ff] to-[#ec4899] bg-clip-text text-transparent">
              Peptide activates multiple cellular pathways
            </span>
          </motion.div>
          
          {/* Connection lines to pathways */}
          <div className="grid grid-cols-4 gap-3">
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
                  {/* Animated connection line */}
                  <motion.div
                    className="w-1 h-8 mb-2 rounded-full"
                    style={{ 
                      background: `linear-gradient(180deg, ${pathway.color}, transparent)`,
                      boxShadow: isActive ? `0 0 12px ${pathway.color}` : 'none'
                    }}
                    initial={{ scaleY: 0 }}
                    animate={isInView ? { scaleY: 1 } : {}}
                    transition={{ delay: 2.4 + index * 0.1 }}
                  />
                  
                  {/* Enhanced pathway node */}
                  <motion.div
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-all relative"
                    style={{ 
                      background: `linear-gradient(135deg, ${pathway.color}30 0%, ${pathway.color}10 100%)`,
                      border: `2.5px solid ${pathway.color}`,
                      boxShadow: isActive 
                        ? `0 0 25px ${pathway.color}80, inset 0 0 15px ${pathway.color}40` 
                        : `0 0 15px ${pathway.color}40`
                    }}
                    whileHover={hoverIf(hoverCapable, { scale: 1.15, boxShadow: `0 0 30px ${pathway.color}` })}
                    animate={isActive ? { scale: 1.1 } : {}}
                  >
                    <Icon className="h-6 w-6" style={{ color: pathway.color, filter: `drop-shadow(0 0 4px ${pathway.color})` }} />
                  </motion.div>
                  
                  {/* Pathway label - colorful */}
                  <span 
                    className="text-[11px] font-bold text-center mt-2 leading-tight"
                    style={{ 
                      color: pathway.color,
                      textShadow: isActive ? `0 0 8px ${pathway.color}` : 'none',
                      fontSize: isActive ? '12px' : '11px'
                    }}
                  >
                    {pathway.name.split(' ')[0]}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Enhanced Legend */}
      <motion.div
        className="mt-8 flex justify-center"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 2.8 }}
      >
        <div className="inline-flex items-center gap-6 px-6 py-3 rounded-xl text-xs font-medium"
          style={{
            background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.1) 0%, rgba(33, 216, 255, 0.05) 100%)',
            border: '1px solid rgba(231, 251, 16, 0.3)',
            boxShadow: '0 0 15px rgba(231, 251, 16, 0.15)'
          }}
        >
          <span className="flex items-center gap-2 text-[#D4FF1F]">
            <span className="w-3 h-3 rounded-full bg-[#D4FF1F]" style={{ boxShadow: '0 0 8px #D4FF1F' }}></span>
            mtDNA encoded
          </span>
          <span className="flex items-center gap-2 text-[#21d8ff]">
            <span className="w-8 h-0.5 rounded-full bg-gradient-to-r from-[#D4FF1F] via-[#21d8ff] to-[#ec4899]" style={{ boxShadow: '0 0 8px rgba(33, 216, 255, 0.6)' }}></span>
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
      { name: 'AMPK Activation', description: 'Energy sensor pathway', icon: Zap, color: '#D4FF1F' },
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
      { name: 'Sirtuin Activation', description: 'SIRT1-7 enzyme family', icon: Dna, color: '#D4FF1F' },
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
