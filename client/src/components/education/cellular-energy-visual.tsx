import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { 
  Zap,
  Battery,
  Flame,
  Dna,
  Activity,
  ArrowRight,
  CircleDot
} from "lucide-react";

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
