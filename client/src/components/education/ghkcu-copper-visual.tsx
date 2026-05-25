import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Atom, Sparkles, Dna, Shield, Zap, Activity } from "lucide-react";
import { useHoverCapable, hoverIf } from "@/hooks/use-hover-capable";

function CopperBindingAnimation({ isInView, activeGene }: { isInView: boolean; activeGene: number }) {
  const geneColors = ['#f97316', '#D4FF1F', '#21d8ff', '#ec4899'];
  
  return (
    <div className="relative w-full h-64 flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 rounded-xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(249, 115, 22, 0.12) 0%, transparent 70%)'
        }}
      />
      
      <svg viewBox="0 0 320 200" className="w-full h-full">
        <defs>
          <filter id="copperGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <radialGradient id="copperRadial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="70%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#c2410c" />
          </radialGradient>
          <linearGradient id="peptideGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#21d8ff" />
            <stop offset="50%" stopColor="#D4FF1F" />
            <stop offset="100%" stopColor="#21d8ff" />
          </linearGradient>
        </defs>
        
        <motion.circle
          cx="160"
          cy="100"
          r="25"
          fill="url(#copperRadial)"
          filter="url(#copperGlow)"
          initial={{ scale: 0 }}
          animate={isInView ? { 
            scale: [1, 1.1, 1],
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ filter: 'drop-shadow(0 0 20px rgba(249, 115, 22, 0.8))' }}
        />
        <motion.text
          x="160" y="104"
          textAnchor="middle"
          fill="white"
          fontSize="12"
          fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          Cu²⁺
        </motion.text>
        
        <motion.circle
          cx="160"
          cy="100"
          r="35"
          fill="none"
          stroke="#f97316"
          strokeWidth="1"
          strokeDasharray="3,3"
          initial={{ opacity: 0 }}
          animate={isInView ? { 
            opacity: [0.3, 0.8, 0.3],
            rotate: 360
          } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: '160px 100px' }}
        />
        <motion.circle
          cx="160"
          cy="100"
          r="45"
          fill="none"
          stroke="#f97316"
          strokeWidth="0.5"
          strokeDasharray="5,5"
          initial={{ opacity: 0 }}
          animate={isInView ? { 
            opacity: [0.2, 0.5, 0.2],
            rotate: -360
          } : {}}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: '160px 100px' }}
        />
        
        {['Gly', 'His', 'Lys'].map((aa, idx) => {
          const angles = [-120, 0, 120];
          const angle = (angles[idx] * Math.PI) / 180;
          const x = 160 + Math.cos(angle) * 55;
          const y = 100 + Math.sin(angle) * 55;
          
          return (
            <motion.g key={aa}>
              <motion.line
                x1="160"
                y1="100"
                x2={x}
                y2={y}
                stroke="#D4FF1F"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={isInView ? { pathLength: 1 } : {}}
                transition={{ delay: 0.8 + idx * 0.2, duration: 0.5 }}
                style={{ filter: 'drop-shadow(0 0 4px rgba(231, 251, 16, 0.6))' }}
              />
              
              <motion.circle
                cx={x}
                cy={y}
                r="18"
                fill="rgba(231, 251, 16, 0.15)"
                stroke="#D4FF1F"
                strokeWidth="2"
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ delay: 1 + idx * 0.2, type: "spring" }}
                style={{ filter: 'drop-shadow(0 0 8px rgba(231, 251, 16, 0.4))' }}
              />
              <motion.text
                x={x}
                y={y + 4}
                textAnchor="middle"
                fill="#D4FF1F"
                fontSize="10"
                fontWeight="bold"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 1.2 + idx * 0.2 }}
              >
                {aa}
              </motion.text>
            </motion.g>
          );
        })}
        
        {geneColors.map((color, idx) => {
          const startX = idx < 2 ? 50 : 270;
          const startY = idx % 2 === 0 ? 40 : 160;
          const endX = 160 + (idx < 2 ? -60 : 60);
          const endY = 100 + (idx % 2 === 0 ? -30 : 30);
          const isActive = activeGene === idx;
          
          return (
            <motion.g key={`gene-${idx}`}>
              <motion.path
                d={`M ${startX} ${startY} Q ${(startX + endX) / 2} ${startY} ${endX} ${endY}`}
                stroke={color}
                strokeWidth={isActive ? 3 : 1.5}
                strokeDasharray="4,4"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={isInView ? { 
                  pathLength: 1, 
                  opacity: isActive ? 1 : 0.4 
                } : {}}
                transition={{ delay: 1.5 + idx * 0.15, duration: 0.8 }}
                style={{ filter: isActive ? `drop-shadow(0 0 8px ${color})` : 'none' }}
              />
              
              <motion.rect
                x={startX - 25}
                y={startY - 12}
                width="50"
                height="24"
                rx="4"
                fill={isActive ? `${color}30` : `${color}15`}
                stroke={color}
                strokeWidth={isActive ? 2 : 1}
                initial={{ scale: 0 }}
                animate={isInView ? { 
                  scale: 1,
                  boxShadow: isActive ? `0 0 20px ${color}` : 'none'
                } : {}}
                transition={{ delay: 1.8 + idx * 0.1 }}
                style={{ filter: isActive ? `drop-shadow(0 0 10px ${color})` : 'none' }}
              />
              <motion.text
                x={startX}
                y={startY + 4}
                textAnchor="middle"
                fill={color}
                fontSize="8"
                fontWeight="bold"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 2 + idx * 0.1 }}
              >
                {['COL1A1', 'SOD', 'TGF-β', 'VEGF'][idx]}
              </motion.text>
              
              {isActive && (
                <motion.circle
                  r="3"
                  fill={color}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    cx: [startX, endX],
                    cy: [startY, endY],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{ filter: `drop-shadow(0 0 6px ${color})` }}
                />
              )}
            </motion.g>
          );
        })}
        
        <motion.text
          x="160"
          y="185"
          textAnchor="middle"
          fill="#f97316"
          fontSize="11"
          fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 2.5 }}
          style={{ textShadow: '0 0 8px rgba(249, 115, 22, 0.6)' }}
        >
          GHK-Cu Complex
        </motion.text>
      </svg>
    </div>
  );
}

const geneCategories = [
  {
    id: 0,
    name: 'Collagen Synthesis',
    gene: 'COL1A1/COL3A1',
    icon: Shield,
    description: 'Upregulates collagen type I and III production for structural tissue support',
    color: '#f97316',
    count: '847 genes'
  },
  {
    id: 1,
    name: 'Antioxidant Defense',
    gene: 'SOD/GPX',
    icon: Sparkles,
    description: 'Activates superoxide dismutase and antioxidant enzyme systems',
    color: '#D4FF1F',
    count: '623 genes'
  },
  {
    id: 2,
    name: 'Growth Factors',
    gene: 'TGF-β/FGF',
    icon: Zap,
    description: 'Modulates transforming growth factor and fibroblast growth factor signaling',
    color: '#21d8ff',
    count: '1,024 genes'
  },
  {
    id: 3,
    name: 'Angiogenesis',
    gene: 'VEGF/HIF-1α',
    icon: Activity,
    description: 'Promotes vascular endothelial growth factor for blood vessel formation',
    color: '#ec4899',
    count: '512 genes'
  },
];

function GeneExpressionBar({ category, isActive, progress }: { 
  category: typeof geneCategories[0]; 
  isActive: boolean;
  progress: number;
}) {
  const Icon = category.icon;
  const hoverCapable = useHoverCapable();
  
  return (
    <motion.div
      className="p-3 rounded-lg cursor-pointer transition-all"
      style={{
        backgroundColor: isActive ? `${category.color}15` : 'hsl(var(--foreground) / 0.02)',
        border: `1px solid ${isActive ? category.color : 'hsl(var(--foreground) / 0.05)'}`,
      }}
      whileHover={hoverIf(hoverCapable, { scale: 1.01 })}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <Icon className="h-4 w-4" style={{ color: category.color }} />
          </div>
          <div>
            <span className="text-xs font-bold" style={{ color: category.color }}>
              {category.name}
            </span>
            <span className="text-[10px] text-muted-foreground block">
              {category.gene}
            </span>
          </div>
        </div>
        <span className="text-[10px] font-medium" style={{ color: category.color }}>
          {category.count}
        </span>
      </div>
      
      <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: category.color }}
          initial={{ width: 0 }}
          animate={{ width: `${isActive ? progress : 30}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
    </motion.div>
  );
}

export function GHKCuCopperVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const [activeGene, setActiveGene] = useState(0);

  return (
    <div ref={containerRef} className="relative">
      <div 
        className="absolute inset-0 h-full w-full rounded-2xl blur-3xl -z-10"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(249, 115, 22, 0.08) 0%, transparent 70%)'
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
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(231, 251, 16, 0.05) 100%)',
            borderColor: '#f97316',
            boxShadow: '0 0 20px rgba(249, 115, 22, 0.3)'
          }}
        >
          <Atom className="h-5 w-5 text-[#f97316]" style={{ filter: 'drop-shadow(0 0 4px rgba(249, 115, 22, 0.6))' }} />
          <span className="text-sm font-bold bg-gradient-to-r from-[#f97316] to-[#D4FF1F] bg-clip-text text-transparent">
            Copper Ion Binding & Gene Activation
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          How GHK-Cu's copper complex modulates over 4,000 genes for tissue regeneration
        </p>
      </motion.div>

      <div 
        className="rounded-xl border p-6 mb-6"
        style={{ 
          borderColor: 'rgba(249, 115, 22, 0.3)',
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, transparent 50%)'
        }}
      >
        <CopperBindingAnimation isInView={isInView} activeGene={activeGene} />
        
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Dna className="h-4 w-4 text-[#f97316]" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Gene Expression Modulation
            </span>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-[#f97316]/20 text-[#f97316] font-bold">
              4,000+ Genes
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {geneCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveGene(category.id)}
                data-testid={`gene-category-${category.id}`}
                className="w-full text-left"
                type="button"
              >
                <GeneExpressionBar 
                  category={category} 
                  isActive={activeGene === category.id}
                  progress={activeGene === category.id ? 85 : 30}
                />
              </button>
            ))}
          </div>
          
          <motion.div
            key={activeGene}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-lg text-center"
            style={{
              backgroundColor: `${geneCategories[activeGene].color}10`,
              border: `1px solid ${geneCategories[activeGene].color}30`
            }}
          >
            <p className="text-sm text-muted-foreground">
              {geneCategories[activeGene].description}
            </p>
          </motion.div>
        </div>

        <motion.div
          className="mt-6 flex justify-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 2.5 }}
        >
          <div 
            className="inline-flex items-center gap-6 px-6 py-3 rounded-xl text-xs font-medium"
            style={{
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(231, 251, 16, 0.05) 100%)',
              border: '1px solid rgba(249, 115, 22, 0.3)',
            }}
          >
            <span className="flex items-center gap-2 text-[#f97316]">
              <span className="w-3 h-3 rounded-full bg-[#f97316]" style={{ boxShadow: '0 0 8px #f97316' }}></span>
              Cu²⁺ Ion
            </span>
            <span className="flex items-center gap-2 text-[#D4FF1F]">
              <span className="w-3 h-3 rounded-full bg-[#D4FF1F]" style={{ boxShadow: '0 0 8px #D4FF1F' }}></span>
              Tripeptide
            </span>
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
          GHK-Cu gene modulation visualization • For research education only
        </span>
      </motion.div>
    </div>
  );
}
