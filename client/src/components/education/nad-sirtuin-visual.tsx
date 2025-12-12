import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Battery, Zap, Activity, Dna, Sparkles, TrendingUp } from "lucide-react";

function MitochondriaAnimation({ isInView, activePathway }: { isInView: boolean; activePathway: number }) {
  return (
    <div className="relative w-full h-64 flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 rounded-xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(33, 216, 255, 0.1) 0%, transparent 70%)'
        }}
      />
      
      <svg viewBox="0 0 320 200" className="w-full h-full">
        <defs>
          <filter id="mitoGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="mitoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#21d8ff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#E7FB10" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        
        <motion.ellipse
          cx="160"
          cy="100"
          rx="90"
          ry="55"
          fill="url(#mitoGradient)"
          stroke="#21d8ff"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ duration: 0.8 }}
          style={{ filter: 'drop-shadow(0 0 15px rgba(33, 216, 255, 0.4))' }}
        />
        
        {[0, 1, 2, 3].map((i) => (
          <motion.path
            key={`crista-${i}`}
            d={`M ${85 + i * 25} 70 Q ${95 + i * 25} 100 ${85 + i * 25} 130`}
            stroke="#21d8ff"
            strokeWidth="1.5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : {}}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
            style={{ opacity: 0.5 }}
          />
        ))}
        
        <motion.text x="160" y="60" textAnchor="middle" fill="#21d8ff" fontSize="8" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          Mitochondrion
        </motion.text>
        
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.circle
            key={`atp-${i}`}
            r="4"
            fill="#E7FB10"
            initial={{ opacity: 0 }}
            animate={isInView ? {
              cx: [100 + i * 15, 120 + i * 15, 140 + i * 15],
              cy: [95 + (i % 2) * 10, 100, 95 + (i % 2) * 10],
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1, 1, 0.5]
            } : {}}
            transition={{
              duration: 2,
              delay: 1 + i * 0.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ filter: 'drop-shadow(0 0 4px rgba(231, 251, 16, 0.8))' }}
          />
        ))}
        
        <motion.rect
          x="130"
          y="85"
          width="60"
          height="30"
          rx="8"
          fill="rgba(231, 251, 16, 0.2)"
          stroke="#E7FB10"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ delay: 0.8, type: "spring" }}
          style={{ filter: 'drop-shadow(0 0 10px rgba(231, 251, 16, 0.5))' }}
        />
        <motion.text x="160" y="103" textAnchor="middle" fill="#E7FB10" fontSize="10" fontWeight="bold">
          NAD+
        </motion.text>
        
        {[
          { x: 50, y: 50, name: 'SIRT1', color: '#ec4899' },
          { x: 270, y: 50, name: 'SIRT3', color: '#9d4edd' },
          { x: 50, y: 150, name: 'PARPs', color: '#f97316' },
          { x: 270, y: 150, name: 'CD38', color: '#22c55e' },
        ].map((item, i) => {
          const isActive = activePathway === i;
          
          return (
            <motion.g key={item.name}>
              <motion.path
                d={`M 160 100 Q ${(160 + item.x) / 2} ${(100 + item.y) / 2 + (i < 2 ? -20 : 20)} ${item.x} ${item.y}`}
                stroke={item.color}
                strokeWidth={isActive ? 2.5 : 1.5}
                strokeDasharray={isActive ? "0" : "4,4"}
                fill="none"
                initial={{ pathLength: 0 }}
                animate={isInView ? { pathLength: 1 } : {}}
                transition={{ delay: 1 + i * 0.15, duration: 0.5 }}
                style={{ filter: isActive ? `drop-shadow(0 0 6px ${item.color})` : 'none' }}
              />
              
              <motion.circle
                cx={item.x}
                cy={item.y}
                r={isActive ? 22 : 18}
                fill={isActive ? `${item.color}30` : `${item.color}15`}
                stroke={item.color}
                strokeWidth={isActive ? 2.5 : 1.5}
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ delay: 1.2 + i * 0.1, type: "spring" }}
                style={{ filter: isActive ? `drop-shadow(0 0 12px ${item.color})` : 'none' }}
              />
              <motion.text 
                x={item.x} 
                y={item.y + 4} 
                textAnchor="middle" 
                fill={item.color} 
                fontSize="9" 
                fontWeight="bold"
              >
                {item.name}
              </motion.text>
              
              {isActive && (
                <motion.circle
                  cx={item.x}
                  cy={item.y}
                  r="28"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="1"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.6, 0, 0.6]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.g>
          );
        })}
        
        <motion.text x="160" y="190" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 2 }}
        >
          NAD+ is consumed by all pathways
        </motion.text>
      </svg>
    </div>
  );
}

const nadPathways = [
  {
    id: 0,
    name: 'SIRT1 Activation',
    fullName: 'Sirtuin 1 (Nuclear)',
    description: 'Master metabolic regulator controlling gene expression, inflammation, and longevity pathways',
    icon: Sparkles,
    color: '#ec4899',
    effects: ['Gene silencing', 'Metabolic regulation', 'Longevity research']
  },
  {
    id: 1,
    name: 'SIRT3 Activation',
    fullName: 'Sirtuin 3 (Mitochondrial)',
    description: 'Primary mitochondrial deacetylase regulating oxidative metabolism and ROS defense',
    icon: Battery,
    color: '#9d4edd',
    effects: ['ATP production', 'Antioxidant defense', 'Fat oxidation']
  },
  {
    id: 2,
    name: 'PARP Function',
    fullName: 'Poly(ADP-ribose) Polymerases',
    description: 'DNA repair enzymes that consume NAD+ to maintain genomic integrity',
    icon: Dna,
    color: '#f97316',
    effects: ['DNA repair', 'Genomic stability', 'Stress response']
  },
  {
    id: 3,
    name: 'CD38 Activity',
    fullName: 'Cyclic ADP-ribose Hydrolase',
    description: 'Major NAD+ consumer in aging; inhibition may preserve NAD+ levels',
    icon: Activity,
    color: '#22c55e',
    effects: ['Calcium signaling', 'Immune function', 'NAD+ consumption']
  },
];

export function NADSirtuinVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const [activePathway, setActivePathway] = useState(0);

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
          <Battery className="h-5 w-5 text-[#21d8ff]" style={{ filter: 'drop-shadow(0 0 4px rgba(33, 216, 255, 0.6))' }} />
          <span className="text-sm font-bold bg-gradient-to-r from-[#21d8ff] to-[#E7FB10] bg-clip-text text-transparent">
            NAD+ & Sirtuin Activation Pathways
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          How NAD+ precursors support cellular energy, DNA repair, and longevity research pathways
        </p>
      </motion.div>

      <div 
        className="rounded-xl border p-6 mb-6"
        style={{ 
          borderColor: 'rgba(33, 216, 255, 0.3)',
          background: 'linear-gradient(135deg, rgba(33, 216, 255, 0.05) 0%, transparent 50%)'
        }}
      >
        <MitochondriaAnimation isInView={isInView} activePathway={activePathway} />
        
        <div className="mt-6">
          <span className="text-xs text-muted-foreground uppercase tracking-wider mb-4 block">
            NAD+ Dependent Pathways
          </span>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {nadPathways.map((pathway) => {
              const Icon = pathway.icon;
              const isActive = activePathway === pathway.id;
              
              return (
                <motion.button
                  key={pathway.id}
                  onClick={() => setActivePathway(pathway.id)}
                  className="p-3 rounded-lg text-center transition-all cursor-pointer"
                  style={{
                    backgroundColor: isActive ? `${pathway.color}20` : 'rgba(255,255,255,0.02)',
                    border: `1.5px solid ${isActive ? pathway.color : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: isActive ? `0 0 15px ${pathway.color}30` : 'none'
                  }}
                  whileHover={{ scale: 1.02 }}
                  data-testid={`pathway-${pathway.id}`}
                >
                  <motion.div
                    className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center"
                    style={{ backgroundColor: `${pathway.color}20` }}
                    animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
                  >
                    <Icon className="h-5 w-5" style={{ color: pathway.color, filter: `drop-shadow(0 0 4px ${pathway.color})` }} />
                  </motion.div>
                  <span className="text-[10px] font-bold" style={{ color: isActive ? pathway.color : 'rgba(255,255,255,0.6)' }}>
                    {pathway.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
          
          <motion.div
            key={activePathway}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-lg"
            style={{
              backgroundColor: `${nadPathways[activePathway].color}10`,
              border: `1px solid ${nadPathways[activePathway].color}30`
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold" style={{ color: nadPathways[activePathway].color }}>
                {nadPathways[activePathway].fullName}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {nadPathways[activePathway].description}
            </p>
            <div className="flex flex-wrap gap-2">
              {nadPathways[activePathway].effects.map((effect, idx) => (
                <motion.span
                  key={effect}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * idx }}
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${nadPathways[activePathway].color}20`,
                    color: nadPathways[activePathway].color,
                    border: `1px solid ${nadPathways[activePathway].color}40`
                  }}
                >
                  {effect}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 2 }}
          className="mt-4 p-3 rounded-lg bg-[#21d8ff]/10 border border-[#21d8ff]/20"
        >
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-[#21d8ff] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Research insight:</strong> NAD+ levels decline 
              with age. NAD+ precursor research focuses on supporting sirtuin activity and 
              mitochondrial function for cellular health and longevity studies.
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
          NAD+ cellular pathway visualization • For research education only
        </span>
      </motion.div>
    </div>
  );
}
