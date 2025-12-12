import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { TrendingUp, Zap, Activity, Target, ArrowRight } from "lucide-react";

function SignalingCascadeAnimation({ isInView, activeStep }: { isInView: boolean; activeStep: number }) {
  const cascadeSteps = [
    { id: 0, name: 'IGF-1 LR3', y: 25, color: '#E7FB10' },
    { id: 1, name: 'IGF-1R', y: 55, color: '#21d8ff' },
    { id: 2, name: 'IRS-1/PI3K', y: 90, color: '#9d4edd' },
    { id: 3, name: 'Akt/mTOR', y: 125, color: '#ec4899' },
    { id: 4, name: 'Protein Synthesis', y: 160, color: '#22c55e' },
  ];
  
  return (
    <div className="relative w-full flex items-center justify-center overflow-hidden" style={{ minHeight: '300px' }}>
      <div 
        className="absolute inset-0 rounded-xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(231, 251, 16, 0.1) 0%, transparent 70%)'
        }}
      />
      
      <svg viewBox="0 0 320 240" className="w-full h-full">
        <defs>
          <filter id="cascadeGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <marker id="cascadeArrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="rgba(255,255,255,0.4)" />
          </marker>
        </defs>
        
        {cascadeSteps.map((step, idx) => {
          const isActive = activeStep >= idx;
          const isCurrent = activeStep === idx;
          
          return (
            <motion.g key={step.id}>
              {idx < cascadeSteps.length - 1 && (
                <motion.line
                  x1="160"
                  y1={step.y + 12}
                  x2="160"
                  y2={cascadeSteps[idx + 1].y - 12}
                  stroke={isActive ? step.color : 'rgba(255,255,255,0.1)'}
                  strokeWidth="2"
                  strokeDasharray={isActive ? "0" : "4,4"}
                  markerEnd="url(#cascadeArrow)"
                  initial={{ pathLength: 0 }}
                  animate={isInView && isActive ? { pathLength: 1 } : {}}
                  transition={{ delay: 0.5 + idx * 0.3, duration: 0.5 }}
                  style={{ filter: isActive ? `drop-shadow(0 0 4px ${step.color})` : 'none' }}
                />
              )}
              
              <motion.rect
                x="90"
                y={step.y - 10}
                width="140"
                height="24"
                rx="6"
                fill={isActive ? `${step.color}25` : 'rgba(255,255,255,0.03)'}
                stroke={isActive ? step.color : 'rgba(255,255,255,0.1)'}
                strokeWidth={isCurrent ? 2.5 : 1.5}
                initial={{ scale: 0, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : {}}
                transition={{ delay: 0.2 + idx * 0.15, type: "spring" }}
                style={{ filter: isCurrent ? `drop-shadow(0 0 15px ${step.color})` : isActive ? `drop-shadow(0 0 6px ${step.color})` : 'none' }}
              />
              
              <motion.text
                x="160"
                y={step.y + 4}
                textAnchor="middle"
                fill={isActive ? step.color : 'rgba(255,255,255,0.3)'}
                fontSize="10"
                fontWeight="bold"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.3 + idx * 0.15 }}
              >
                {step.name}
              </motion.text>
              
              {isCurrent && (
                <motion.circle
                  cx="235"
                  cy={step.y}
                  r="6"
                  fill={step.color}
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  style={{ filter: `drop-shadow(0 0 8px ${step.color})` }}
                />
              )}
            </motion.g>
          );
        })}
        
        <motion.g
          initial={{ opacity: 0 }}
          animate={isInView && activeStep >= 4 ? { opacity: 1 } : {}}
          transition={{ delay: 2 }}
        >
          {[45, 160, 275].map((x, i) => (
            <motion.g key={`result-${i}`}>
              <motion.line
                x1="160"
                y1="180"
                x2={x}
                y2="210"
                stroke="#22c55e"
                strokeWidth="1.5"
                strokeDasharray="3,2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 2.2 + i * 0.15 }}
              />
              <motion.rect
                x={x - 35}
                y="210"
                width="70"
                height="20"
                rx="4"
                fill="rgba(34, 197, 94, 0.15)"
                stroke="#22c55e"
                strokeWidth="1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2.4 + i * 0.15 }}
              />
              <motion.text
                x={x}
                y="223"
                textAnchor="middle"
                fill="#22c55e"
                fontSize="7"
                fontWeight="bold"
              >
                {['Muscle Growth', 'Cell Division', 'Fat Metabolism'][i]}
              </motion.text>
            </motion.g>
          ))}
        </motion.g>
        
        <motion.text x="20" y="28" fill="#E7FB10" fontSize="8" fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          LR3 Modification:
        </motion.text>
        <motion.text x="20" y="40" fill="rgba(255,255,255,0.5)" fontSize="7"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          • Arg→Glu substitution
        </motion.text>
        <motion.text x="20" y="52" fill="rgba(255,255,255,0.5)" fontSize="7"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          • 13 AA extension
        </motion.text>
        <motion.text x="20" y="64" fill="rgba(255,255,255,0.5)" fontSize="7"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          • ↓ IGFBP binding
        </motion.text>
      </svg>
    </div>
  );
}

const pathwayDetails = [
  {
    step: 0,
    title: 'IGF-1 LR3 Binding',
    description: 'Long R3 modification reduces binding to IGF binding proteins (IGFBPs), increasing bioavailability and extending half-life from 12 hours to 20-30 hours.',
    color: '#E7FB10'
  },
  {
    step: 1,
    title: 'Receptor Activation',
    description: 'IGF-1 LR3 binds to IGF-1 receptor (IGF-1R), a tyrosine kinase receptor that auto-phosphorylates upon ligand binding.',
    color: '#21d8ff'
  },
  {
    step: 2,
    title: 'IRS-1/PI3K Pathway',
    description: 'Insulin receptor substrate-1 (IRS-1) is phosphorylated, activating phosphatidylinositol-3-kinase (PI3K) signaling.',
    color: '#9d4edd'
  },
  {
    step: 3,
    title: 'Akt/mTOR Activation',
    description: 'Protein kinase B (Akt) and mechanistic target of rapamycin (mTOR) pathways are activated, promoting anabolic processes.',
    color: '#ec4899'
  },
  {
    step: 4,
    title: 'Protein Synthesis',
    description: 'mTOR activation leads to increased protein synthesis, cell proliferation, and suppression of protein degradation pathways.',
    color: '#22c55e'
  },
];

export function IGF1SignalingVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const cascadeRef = useRef<HTMLDivElement>(null);
  const cascadeInView = useInView(cascadeRef, { margin: "-20px" });
  const [activeStep, setActiveStep] = useState(0);

  // Auto-play animation when visible
  useEffect(() => {
    if (!cascadeInView) return;
    
    const runAnimationCycle = () => {
      let step = 0;
      setActiveStep(0);
      
      const interval = setInterval(() => {
        step += 1;
        setActiveStep(step);
        
        if (step >= 4) {
          clearInterval(interval);
          setTimeout(() => {
            setActiveStep(0);
            setTimeout(runAnimationCycle, 1000);
          }, 2500);
        }
      }, 600);
      
      return interval;
    };
    
    const interval = runAnimationCycle();
    return () => clearInterval(interval);
  }, [cascadeInView]);

  return (
    <div ref={containerRef} className="relative">
      <div 
        className="absolute inset-0 h-full w-full rounded-2xl blur-3xl -z-10"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(231, 251, 16, 0.08) 0%, transparent 70%)'
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
            background: 'linear-gradient(135deg, rgba(231, 251, 16, 0.15) 0%, rgba(33, 216, 255, 0.05) 100%)',
            borderColor: '#E7FB10',
            boxShadow: '0 0 20px rgba(231, 251, 16, 0.3)'
          }}
        >
          <TrendingUp className="h-5 w-5 text-[#E7FB10]" style={{ filter: 'drop-shadow(0 0 4px rgba(231, 251, 16, 0.6))' }} />
          <span className="text-sm font-bold bg-gradient-to-r from-[#E7FB10] to-[#22c55e] bg-clip-text text-transparent">
            IGF-1 LR3 Signaling Cascade
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          How the Long R3 modification enhances IGF-1 activity and downstream anabolic signaling
        </p>
      </motion.div>

      <div 
        className="rounded-xl border p-6 mb-6"
        style={{ 
          borderColor: 'rgba(231, 251, 16, 0.3)',
          background: 'linear-gradient(135deg, rgba(231, 251, 16, 0.05) 0%, transparent 50%)'
        }}
      >
        <div ref={cascadeRef}>
          <SignalingCascadeAnimation isInView={isInView} activeStep={activeStep} />
        </div>
        
        <div className="mt-6">
          <div className="flex items-center justify-center mb-4">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Signaling Steps
            </span>
          </div>
          <div className="flex justify-center gap-1 mb-4">
            {pathwayDetails.map((_, idx) => (
              <div
                key={idx}
                className="w-8 h-2 rounded-full transition-all"
                style={{
                  backgroundColor: activeStep >= idx ? pathwayDetails[idx].color : 'rgba(255,255,255,0.1)'
                }}
              />
            ))}
          </div>
          
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 rounded-lg"
            style={{
              backgroundColor: `${pathwayDetails[activeStep].color}10`,
              border: `1px solid ${pathwayDetails[activeStep].color}30`
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ 
                  backgroundColor: `${pathwayDetails[activeStep].color}30`,
                  color: pathwayDetails[activeStep].color
                }}
              >
                {activeStep + 1}
              </div>
              <span className="text-sm font-bold" style={{ color: pathwayDetails[activeStep].color }}>
                {pathwayDetails[activeStep].title}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {pathwayDetails[activeStep].description}
            </p>
          </motion.div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { icon: Zap, title: "Extended Half-life", desc: "20-30 hours vs 12", color: "#E7FB10" },
            { icon: Target, title: "↓ IGFBP Binding", desc: "Higher free IGF-1", color: "#21d8ff" },
            { icon: Activity, title: "mTOR Activation", desc: "Anabolic signaling", color: "#22c55e" },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 1.5 + idx * 0.1 }}
                className="p-3 rounded-lg text-center"
                style={{
                  backgroundColor: `${item.color}10`,
                  border: `1px solid ${item.color}30`
                }}
              >
                <Icon className="h-5 w-5 mx-auto mb-2" style={{ color: item.color }} />
                <span className="text-xs font-bold block" style={{ color: item.color }}>{item.title}</span>
                <span className="text-[10px] text-muted-foreground">{item.desc}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.div
        className="text-center text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 2 }}
      >
        <span className="px-3 py-1 rounded-full bg-muted/30">
          IGF-1 LR3 signaling cascade • For research education only
        </span>
      </motion.div>
    </div>
  );
}
