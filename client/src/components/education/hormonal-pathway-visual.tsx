import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { 
  Heart,
  Zap,
  Activity,
  Target,
  ArrowDown,
  CircleDot
} from "lucide-react";

const hcgPathway = [
  { 
    id: 'pituitary',
    name: 'Pituitary Gland',
    role: 'FSH/LH Mimic',
    description: 'HCG mimics LH action',
    color: '#9d4edd',
    icon: CircleDot
  },
  { 
    id: 'gonads',
    name: 'Gonads',
    role: 'Target Tissue',
    description: 'Receptor activation',
    color: '#21d8ff',
    icon: Target
  },
  { 
    id: 'steroid',
    name: 'Steroid Production',
    role: 'Hormone Synthesis',
    description: 'Testosterone/Estrogen',
    color: '#E7FB10',
    icon: Zap
  },
  { 
    id: 'effects',
    name: 'Physiological Effects',
    role: 'End Results',
    description: 'Downstream actions',
    color: '#ec4899',
    icon: Activity
  },
];

const researchApplications = [
  { name: 'Fertility Research', description: 'Ovulation and spermatogenesis studies' },
  { name: 'Hormonal Studies', description: 'Steroidogenesis pathway investigation' },
  { name: 'Leydig Cell Research', description: 'Testicular function studies' },
  { name: 'Pregnancy Research', description: 'Early development investigation' },
];

const keyFacts = [
  { label: 'Molecular Weight', value: '~37,000 Da' },
  { label: 'Half-life', value: '24-36 hours' },
  { label: 'Receptor', value: 'LH/CG Receptor' },
  { label: 'Structure', value: 'Glycoprotein' },
];

export function HormonalPathwayVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const mainColor = '#9d4edd';

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
            <Heart className="h-8 w-8" style={{ color: mainColor }} />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold" style={{ color: mainColor }}>HCG</h3>
            <p className="text-sm text-muted-foreground">Human Chorionic Gonadotropin</p>
            <div className="flex flex-wrap gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#9d4edd]/20 text-[#9d4edd]">
                Glycoprotein Hormone
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#21d8ff]/20 text-[#21d8ff]">
                LH Analog
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {keyFacts.map((fact, index) => (
            <motion.div
              key={fact.label}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="rounded-lg p-3 text-center"
              style={{ backgroundColor: `${mainColor}10`, border: `1px solid ${mainColor}20` }}
            >
              <span className="text-[10px] text-muted-foreground block">{fact.label}</span>
              <span className="text-sm font-bold" style={{ color: mainColor }}>{fact.value}</span>
            </motion.div>
          ))}
        </div>

        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Signaling Pathway
        </h4>

        <div className="relative mb-6">
          <div className="hidden md:block absolute top-0 left-1/2 bottom-0 w-0.5 -translate-x-1/2" style={{ backgroundColor: `${mainColor}20` }} />
          
          <div className="space-y-3">
            {hcgPathway.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.4 + index * 0.15 }}
                  className={`relative flex items-center gap-4 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  onMouseEnter={() => setActiveStep(step.id)}
                  onMouseLeave={() => setActiveStep(null)}
                >
                  <div className="hidden md:block flex-1" />
                  
                  <div 
                    className="flex-1 rounded-lg p-4 cursor-pointer transition-all"
                    style={{ 
                      backgroundColor: isActive ? `${step.color}20` : `${step.color}10`,
                      border: `1px solid ${isActive ? step.color : `${step.color}30`}`,
                      boxShadow: isActive ? `0 0 15px ${step.color}30` : undefined
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${step.color}20` }}
                        animate={{ scale: isActive ? 1.1 : 1 }}
                      >
                        <Icon className="h-5 w-5" style={{ color: step.color }} />
                      </motion.div>
                      <div>
                        <span className="text-sm font-bold block" style={{ color: step.color }}>
                          {step.name}
                        </span>
                        <span className="text-xs text-muted-foreground">{step.role}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 pl-13">{step.description}</p>
                  </div>
                  
                  {index < hcgPathway.length - 1 && (
                    <motion.div
                      className="hidden md:block absolute left-1/2 -translate-x-1/2"
                      style={{ top: 'calc(100% + 4px)' }}
                      initial={{ opacity: 0 }}
                      animate={isInView ? { opacity: 1 } : {}}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <ArrowDown className="h-4 w-4" style={{ color: `${mainColor}50` }} />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Research Applications
        </h4>

        <div className="grid grid-cols-2 gap-3">
          {researchApplications.map((app, index) => (
            <motion.div
              key={app.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.8 + index * 0.05 }}
              className="rounded-lg p-3"
              style={{ backgroundColor: `${mainColor}10`, border: `1px solid ${mainColor}20` }}
            >
              <span className="text-xs font-medium block" style={{ color: mainColor }}>{app.name}</span>
              <span className="text-[10px] text-muted-foreground">{app.description}</span>
            </motion.div>
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
          Hormonal pathway illustration • For research education only
        </span>
      </motion.div>
    </div>
  );
}
