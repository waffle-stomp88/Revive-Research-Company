import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { 
  TrendingUp,
  Dna,
  Zap,
  Target,
  ArrowRight,
  ArrowDown
} from "lucide-react";

const pathwaySteps = [
  {
    id: 'igf1',
    label: 'IGF-1 LR3',
    description: 'Extended half-life analog',
    color: '#D4FF1F',
    icon: Dna,
  },
  {
    id: 'receptor',
    label: 'IGF-1 Receptor',
    description: 'Tyrosine kinase activation',
    color: '#21d8ff',
    icon: Target,
  },
  {
    id: 'signaling',
    label: 'PI3K/Akt Pathway',
    description: 'Intracellular signaling cascade',
    color: '#9d4edd',
    icon: Zap,
  },
  {
    id: 'effects',
    label: 'Cellular Effects',
    description: 'Protein synthesis & growth',
    color: '#ec4899',
    icon: TrendingUp,
  },
];

const comparisonData = [
  { name: 'IGF-1', halfLife: '~20 min', bioavailability: 'Low', binding: 'Normal', color: '#6b7280' },
  { name: 'IGF-1 LR3', halfLife: '~20 hrs', bioavailability: 'High', binding: 'Reduced', color: '#D4FF1F' },
];

const cellularEffects = [
  { name: 'Muscle Hypertrophy', description: 'Protein synthesis stimulation' },
  { name: 'Cell Proliferation', description: 'Enhanced cell division' },
  { name: 'Anti-Apoptosis', description: 'Cell survival pathways' },
  { name: 'Satellite Cell Activation', description: 'Muscle stem cell recruitment' },
];

export function IGF1PathwayVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const [activeStep, setActiveStep] = useState<string | null>(null);

  return (
    <div ref={containerRef} className="relative">
      <div 
        className="rounded-xl border p-6 mb-6"
        style={{ 
          borderColor: '#D4FF1F30',
          background: 'linear-gradient(135deg, #D4FF1F08 0%, transparent 50%)'
        }}
      >
        <div className="flex items-center gap-4 mb-6">
          <motion.div
            className="w-16 h-16 rounded-xl flex items-center justify-center"
            style={{ 
              backgroundColor: '#D4FF1F20',
              boxShadow: '0 0 20px #D4FF1F30'
            }}
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <Dna className="h-8 w-8 text-[#D4FF1F]" />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-[#D4FF1F]">IGF-1 LR3</h3>
            <p className="text-sm text-muted-foreground">Long R3 Insulin-like Growth Factor-1</p>
            <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block bg-[#D4FF1F]/20 text-[#D4FF1F]">
              83 Amino Acid Analog
            </span>
          </div>
        </div>

        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Signal Transduction Pathway
        </h4>

        <div className="relative mb-8">
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-[#D4FF1F] via-[#21d8ff] via-[#9d4edd] to-[#ec4899] -translate-y-1/2 rounded-full opacity-30" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
            {pathwaySteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 + index * 0.15 }}
                  className="relative"
                  onMouseEnter={() => setActiveStep(step.id)}
                  onMouseLeave={() => setActiveStep(null)}
                >
                  <div 
                    className="rounded-xl p-4 text-center transition-all cursor-pointer"
                    style={{ 
                      backgroundColor: isActive ? `${step.color}20` : `${step.color}10`,
                      borderColor: isActive ? step.color : `${step.color}30`,
                      border: '1px solid',
                      boxShadow: isActive ? `0 0 20px ${step.color}30` : undefined
                    }}
                  >
                    <motion.div
                      className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center"
                      style={{ backgroundColor: `${step.color}20` }}
                      animate={{ scale: isActive ? 1.1 : 1 }}
                    >
                      <Icon className="h-6 w-6" style={{ color: step.color }} />
                    </motion.div>
                    <span className="text-sm font-bold block mb-1" style={{ color: step.color }}>
                      {step.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{step.description}</span>
                  </div>
                  
                  {index < pathwaySteps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                      <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          IGF-1 vs IGF-1 LR3 Comparison
        </h4>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {comparisonData.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="rounded-lg p-4"
              style={{ 
                backgroundColor: `${item.color}10`,
                border: `1px solid ${item.color}30`
              }}
            >
              <h5 className="font-bold mb-3" style={{ color: item.color }}>{item.name}</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Half-life:</span>
                  <span className="font-medium">{item.halfLife}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bioavailability:</span>
                  <span className="font-medium">{item.bioavailability}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IGFBP Binding:</span>
                  <span className="font-medium">{item.binding}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <ArrowDown className="h-4 w-4 text-[#ec4899]" />
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Downstream Effects
          </h4>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {cellularEffects.map((effect, index) => (
            <motion.div
              key={effect.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.9 + index * 0.05 }}
              className="rounded-lg p-3 text-center bg-[#ec4899]/10 border border-[#ec4899]/30"
            >
              <span className="text-xs font-medium text-[#ec4899] block">{effect.name}</span>
              <span className="text-[9px] text-muted-foreground">{effect.description}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        className="text-center text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 1.1 }}
      >
        <span className="px-3 py-1 rounded-full bg-muted/30">
          Simplified signaling pathway • For research education only
        </span>
      </motion.div>
    </div>
  );
}
