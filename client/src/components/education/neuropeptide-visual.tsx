import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { 
  Brain,
  Zap,
  Activity,
  Shield,
  Sparkles,
  ArrowRight
} from "lucide-react";

const brainRegions = [
  { name: 'Hippocampus', function: 'Memory formation', color: '#E7FB10' },
  { name: 'Prefrontal Cortex', function: 'Executive function', color: '#21d8ff' },
  { name: 'Amygdala', function: 'Emotional processing', color: '#9d4edd' },
  { name: 'Cerebral Cortex', function: 'Higher cognition', color: '#ec4899' },
];

const mechanisms = [
  { name: 'BDNF Expression', description: 'Brain-derived neurotrophic factor', icon: Zap, color: '#E7FB10' },
  { name: 'Dopamine Modulation', description: 'Neurotransmitter regulation', icon: Activity, color: '#21d8ff' },
  { name: 'Neuroprotection', description: 'Oxidative stress defense', icon: Shield, color: '#9d4edd' },
  { name: 'Neuroplasticity', description: 'Synaptic adaptation', icon: Sparkles, color: '#ec4899' },
];

const researchAreas = [
  'Nootropic Mechanisms',
  'Neuroprotective Pathways',
  'Ischemia Models',
  'Stress Response Research',
  'Attention Pathway Studies',
  'Memory Mechanism Research',
];

export function NeuropeptideVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const [activeMechanism, setActiveMechanism] = useState<number | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<number | null>(null);
  const mainColor = '#21d8ff';

  return (
    <div ref={containerRef} className="relative">
      <div 
        className="rounded-xl border p-6 mb-6"
        style={{ 
          borderColor: `${mainColor}30`,
          background: `linear-gradient(135deg, ${mainColor}08 0%, transparent 50%)`
        }}
      >
        <div className="flex items-center gap-4 mb-6">
          <motion.div
            className="w-16 h-16 rounded-xl flex items-center justify-center relative"
            style={{ 
              backgroundColor: `${mainColor}20`,
              boxShadow: `0 0 20px ${mainColor}30`
            }}
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <Brain className="h-8 w-8" style={{ color: mainColor }} />
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E7FB10] flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="h-2.5 w-2.5 text-black" />
            </motion.div>
          </motion.div>
          <div>
            <h3 className="text-xl font-bold" style={{ color: mainColor }}>Semax</h3>
            <p className="text-sm text-muted-foreground">ACTH-Derived Heptapeptide</p>
            <div className="flex flex-wrap gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#21d8ff]/20 text-[#21d8ff]">
                7 Amino Acids
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#9d4edd]/20 text-[#9d4edd]">
                ACTH 4-10 Analog
              </span>
            </div>
          </div>
        </div>

        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Target Brain Regions
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {brainRegions.map((region, index) => {
            const isHovered = hoveredRegion === index;
            
            return (
              <motion.div
                key={region.name}
                initial={{ opacity: 0, y: 15 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="rounded-lg p-3 text-center cursor-pointer transition-all"
                style={{ 
                  backgroundColor: isHovered ? `${region.color}25` : `${region.color}10`,
                  border: `1px solid ${isHovered ? region.color : `${region.color}30`}`,
                  boxShadow: isHovered ? `0 0 15px ${region.color}30` : undefined
                }}
                onMouseEnter={() => setHoveredRegion(index)}
                onMouseLeave={() => setHoveredRegion(null)}
              >
                <motion.div
                  className="w-3 h-3 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: region.color }}
                  animate={{ scale: isHovered ? 1.3 : 1 }}
                />
                <span className="text-xs font-bold block" style={{ color: region.color }}>
                  {region.name}
                </span>
                <span className="text-[10px] text-muted-foreground">{region.function}</span>
              </motion.div>
            );
          })}
        </div>

        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Mechanism of Action
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {mechanisms.map((mechanism, index) => {
            const Icon = mechanism.icon;
            const isActive = activeMechanism === index;
            
            return (
              <motion.div
                key={mechanism.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="rounded-lg p-4 cursor-pointer transition-all text-center"
                style={{ 
                  backgroundColor: isActive ? `${mechanism.color}20` : `${mechanism.color}10`,
                  borderColor: isActive ? mechanism.color : `${mechanism.color}30`,
                  border: '1px solid',
                  boxShadow: isActive ? `0 0 15px ${mechanism.color}30` : undefined
                }}
                onMouseEnter={() => setActiveMechanism(index)}
                onMouseLeave={() => setActiveMechanism(null)}
              >
                <motion.div
                  className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center"
                  style={{ backgroundColor: `${mechanism.color}20` }}
                  animate={{ scale: isActive ? 1.1 : 1 }}
                >
                  <Icon className="h-5 w-5" style={{ color: mechanism.color }} />
                </motion.div>
                <span className="text-xs font-bold block mb-1" style={{ color: mechanism.color }}>
                  {mechanism.name}
                </span>
                <span className="text-[9px] text-muted-foreground">{mechanism.description}</span>
              </motion.div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <ArrowRight className="h-4 w-4" style={{ color: mainColor }} />
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Research Applications
          </h4>
        </div>

        <div className="flex flex-wrap gap-2">
          {researchAreas.map((area, index) => (
            <motion.span
              key={area}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.8 + index * 0.05 }}
              className="px-3 py-1.5 rounded-full text-sm font-medium"
              style={{ 
                backgroundColor: `${mainColor}15`,
                color: mainColor,
                border: `1px solid ${mainColor}30`
              }}
            >
              {area}
            </motion.span>
          ))}
        </div>
      </div>

      <motion.div
        className="text-center text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 1 }}
      >
        <span className="px-3 py-1 rounded-full bg-muted/30">
          Neuropeptide mechanism illustration • For research education only
        </span>
      </motion.div>
    </div>
  );
}
