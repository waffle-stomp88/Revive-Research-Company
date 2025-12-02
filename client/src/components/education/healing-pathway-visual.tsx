import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { 
  Zap,
  Shield,
  Heart,
  Sparkles,
  ArrowRight,
  Activity
} from "lucide-react";

interface TissuePathwayVisualProps {
  peptide: 'bpc-157' | 'tb-500' | 'ghk-cu' | 'glow';
}

const peptideData = {
  'bpc-157': {
    name: 'BPC-157',
    color: '#E7FB10',
    fullName: 'Body Protection Compound',
    mechanism: 'Gastric Peptide',
    pathways: [
      { name: 'Angiogenesis', description: 'Blood vessel formation pathway', icon: Heart },
      { name: 'Growth Factors', description: 'VEGF & EGF modulation', icon: Zap },
      { name: 'Nitric Oxide', description: 'NO pathway activation', icon: Activity },
      { name: 'Tissue Mechanisms', description: 'Collagen synthesis pathway', icon: Shield },
    ],
    targets: ['Tendon Models', 'Ligament Models', 'Muscle Tissue', 'GI Models'],
  },
  'tb-500': {
    name: 'TB-500',
    color: '#21d8ff',
    fullName: 'Thymosin Beta-4 Fragment',
    mechanism: 'Actin-Binding Peptide',
    pathways: [
      { name: 'Cell Migration', description: 'Cellular motility mechanisms', icon: Activity },
      { name: 'Actin Regulation', description: 'Cytoskeleton organization', icon: Zap },
      { name: 'Inflammatory Modulation', description: 'Cytokine pathway research', icon: Shield },
      { name: 'Progenitor Signaling', description: 'Stem cell pathway research', icon: Sparkles },
    ],
    targets: ['Cardiac Models', 'Muscle Tissue', 'Dermal Models', 'Vascular Models'],
  },
  'ghk-cu': {
    name: 'GHK-Cu',
    color: '#f97316',
    fullName: 'Copper Tripeptide Complex',
    mechanism: 'Copper-Binding Peptide',
    pathways: [
      { name: 'Collagen Synthesis', description: 'Type I & III collagen', icon: Shield },
      { name: 'Antioxidant', description: 'SOD enzyme activation', icon: Sparkles },
      { name: 'Gene Expression', description: '4,000+ gene modulation', icon: Zap },
      { name: 'Matrix Remodeling', description: 'ECM research applications', icon: Heart },
    ],
    targets: ['Dermal Models', 'Follicle Research', 'Bone Models', 'Connective Tissue'],
  },
  'glow': {
    name: 'GLOW',
    color: '#ec4899',
    fullName: 'Multi-Peptide Complex',
    mechanism: 'Synergistic Blend',
    pathways: [
      { name: 'Fibroblast Activation', description: 'Cell stimulation pathway', icon: Activity },
      { name: 'Collagen I & III', description: 'Structural protein synthesis', icon: Shield },
      { name: 'Elastin Pathway', description: 'Elastin gene expression', icon: Sparkles },
      { name: 'Matrix Remodeling', description: 'ECM pathway research', icon: Heart },
    ],
    targets: ['Dermal Models', 'Epidermal Research', 'Follicle Studies', 'Nail Matrix'],
  },
};

export function HealingPathwayVisual({ peptide }: TissuePathwayVisualProps) {
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
            className="w-16 h-16 rounded-xl flex items-center justify-center"
            style={{ 
              backgroundColor: `${data.color}20`,
              boxShadow: `0 0 20px ${data.color}30`
            }}
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <Zap className="h-8 w-8" style={{ color: data.color }} />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold" style={{ color: data.color }}>{data.name}</h3>
            <p className="text-sm text-muted-foreground">{data.fullName}</p>
            <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block" style={{ backgroundColor: `${data.color}20`, color: data.color }}>
              {data.mechanism}
            </span>
          </div>
        </div>

        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Mechanism Pathways
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
                transition={{ delay: 0.3 + index * 0.1 }}
                className="relative rounded-lg p-4 cursor-pointer transition-all"
                style={{ 
                  backgroundColor: isActive ? `${data.color}20` : `${data.color}10`,
                  borderColor: isActive ? data.color : `${data.color}30`,
                  border: '1px solid',
                  boxShadow: isActive ? `0 0 15px ${data.color}30` : undefined
                }}
                onMouseEnter={() => setActivePathway(index)}
                onMouseLeave={() => setActivePathway(null)}
              >
                <div className="flex flex-col items-center text-center">
                  <motion.div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-2"
                    style={{ backgroundColor: `${data.color}20` }}
                    animate={{ scale: isActive ? 1.1 : 1 }}
                  >
                    <Icon className="h-5 w-5" style={{ color: data.color }} />
                  </motion.div>
                  <span className="text-sm font-medium mb-1">{pathway.name}</span>
                  <span className="text-[10px] text-muted-foreground">{pathway.description}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <ArrowRight className="h-4 w-4" style={{ color: data.color }} />
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Target Tissues
          </h4>
        </div>

        <div className="flex flex-wrap gap-2">
          {data.targets.map((target, index) => (
            <motion.span
              key={target}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.6 + index * 0.05 }}
              className="px-3 py-1.5 rounded-full text-sm font-medium"
              style={{ 
                backgroundColor: `${data.color}15`,
                color: data.color,
                border: `1px solid ${data.color}30`
              }}
            >
              {target}
            </motion.span>
          ))}
        </div>
      </div>

      <motion.div
        className="text-center text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.8 }}
      >
        <span className="px-3 py-1 rounded-full bg-muted/30">
          Illustration of research mechanisms • For educational purposes only
        </span>
      </motion.div>
    </div>
  );
}
