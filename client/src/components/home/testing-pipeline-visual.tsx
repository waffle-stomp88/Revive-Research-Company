import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { 
  Package, 
  FlaskConical, 
  FileCheck, 
  QrCode, 
  CheckCircle2,
  ArrowRight,
  Sparkles,
  X
} from "lucide-react";
import { useHoverCapable, hoverIf } from "@/hooks/use-hover-capable";

const pipelineSteps = [
  {
    id: 1,
    icon: Package,
    title: "Sourcing",
    subtitle: "Premium Raw Materials",
    description: "Carefully selected ingredients from certified suppliers",
    color: "#D4FF1F",
    glowColor: "rgba(231, 251, 16, 0.4)",
    details: [
      "Pharmaceutical-grade amino acids",
      "Vetted supplier network",
      "Batch documentation tracked",
      "Incoming quality inspection"
    ]
  },
  {
    id: 2,
    icon: FlaskConical,
    title: "Synthesis",
    subtitle: "Precision Manufacturing",
    description: "State-of-the-art synthesis with strict quality controls",
    color: "#21d8ff",
    glowColor: "rgba(33, 216, 255, 0.4)",
    details: [
      "Solid-phase peptide synthesis",
      "Automated protocols",
      "Real-time process monitoring",
      "Temperature-controlled environment"
    ]
  },
  {
    id: 3,
    icon: FileCheck,
    title: "Lab Testing",
    subtitle: "Third-Party Analysis",
    description: "Independent verification of purity and identity",
    color: "#9d4edd",
    glowColor: "rgba(157, 78, 221, 0.4)",
    details: [
      "HPLC purity analysis",
      "Mass spectrometry verification",
      "Amino acid sequencing",
      "Endotoxin testing"
    ]
  },
  {
    id: 4,
    icon: QrCode,
    title: "COA Generation",
    subtitle: "Certificate of Analysis",
    description: "Detailed documentation of all test results",
    color: "#ec4899",
    glowColor: "rgba(236, 72, 153, 0.4)",
    details: [
      "Unique batch identifier",
      "Full test results documented",
      "QR code linked to results",
      "Downloadable PDF available"
    ]
  },
  {
    id: 5,
    icon: CheckCircle2,
    title: "Verified",
    subtitle: "Ready for Research",
    description: "QR-scannable proof of authenticity",
    color: "#22c55e",
    glowColor: "rgba(34, 197, 94, 0.4)",
    details: [
      "Scan to verify authenticity",
      "Complete traceability",
      "Tamper-evident packaging",
      "Ready for your research"
    ]
  }
];

function AnimatedConnector({ fromColor, toColor, isActive, delay }: { 
  fromColor: string; 
  toColor: string; 
  isActive: boolean;
  delay: number;
}) {
  return (
    <div className="hidden md:flex items-center justify-center flex-1 px-2">
      <svg className="w-full h-12" viewBox="0 0 100 40" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`connector-${delay}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={fromColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={toColor} stopOpacity="0.8" />
          </linearGradient>
        </defs>
        
        <motion.path
          d="M 0 20 L 100 20"
          stroke={`url(#connector-${delay})`}
          strokeWidth="2"
          fill="none"
          strokeDasharray="6 4"
          initial={{ pathLength: 0 }}
          animate={isActive ? { pathLength: 1 } : {}}
          transition={{ duration: 0.8, delay }}
        />
        
        <motion.circle
          cx="50"
          cy="20"
          r="4"
          fill={fromColor}
          initial={{ scale: 0, opacity: 0 }}
          animate={isActive ? { 
            scale: [0, 1.2, 1],
            opacity: 1,
            x: [0, 40, 0]
          } : {}}
          transition={{ 
            duration: 2, 
            delay: delay + 0.5,
            repeat: Infinity,
            repeatDelay: 3
          }}
          style={{ filter: `drop-shadow(0 0 6px ${fromColor})` }}
        />
      </svg>
    </div>
  );
}

function PipelineStep({ step, index, isActive, isExpanded, onToggle, totalSteps }: { 
  step: typeof pipelineSteps[0]; 
  index: number;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  totalSteps: number;
}) {
  const Icon = step.icon;
  const hoverCapable = useHoverCapable();
  
  return (
    <motion.div
      className="relative flex flex-col items-center text-center cursor-pointer"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      onClick={onToggle}
      data-testid={`pipeline-step-${index}`}
    >
      <div className="relative">
        {isActive && !isExpanded && (
          <motion.div
            className="absolute inset-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl z-0"
            style={{ 
              border: `2px solid ${step.color}`,
              boxShadow: `0 0 15px ${step.color}60`
            }}
            initial={{ scale: 1, opacity: 0 }}
            animate={{ 
              scale: [1, 1.15, 1.3],
              opacity: [0.8, 0.4, 0]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <motion.div
          className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center relative z-10"
          style={{ 
            backgroundColor: `${step.color}15`,
            border: `3px solid ${isActive || isExpanded ? step.color : 'transparent'}`,
            boxShadow: `0 0 20px ${step.glowColor}`
          }}
          initial={false}
          animate={{
            backgroundColor: isActive || isExpanded ? `${step.color}35` : `${step.color}15`,
            boxShadow: isActive || isExpanded 
              ? `0 0 40px ${step.glowColor}, 0 0 60px ${step.glowColor}` 
              : `0 0 20px ${step.glowColor}`,
            scale: isActive || isExpanded ? 1.05 : 1
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          whileHover={hoverIf(hoverCapable, { scale: 1.1, boxShadow: `0 0 50px ${step.glowColor}` })}
        >
          <motion.div
            animate={(isActive || isExpanded) ? { 
              rotate: [0, 2, -2, 0],
            } : { rotate: 0 }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Icon 
              className="h-10 w-10 md:h-12 md:w-12" 
              style={{ 
                color: step.color,
                filter: `drop-shadow(0 0 8px ${step.color})`
              }} 
            />
          </motion.div>
          
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{ 
              background: `linear-gradient(135deg, ${step.color}25 0%, transparent 50%, ${step.color}10 100%)`,
            }}
            initial={false}
            animate={{
              opacity: isActive || isExpanded ? 0.6 : 0.3
            }}
            transition={{
              duration: 0.5,
              ease: "easeInOut"
            }}
          />
        </motion.div>
        
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full opacity-20 blur-2xl -z-10"
          style={{ backgroundColor: step.color }}
        />
        
        <motion.div
          className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold z-20"
          style={{ 
            backgroundColor: step.color,
            color: step.color === "#D4FF1F" || step.color === "#22c55e" ? "#000" : "#fff",
            boxShadow: `0 0 15px ${step.glowColor}`
          }}
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.15 + 0.3, type: "spring" }}
        >
          {step.id}
        </motion.div>
      </div>
      
      <h4 
        className="font-display text-base md:text-lg font-bold mt-4 mb-1" 
        style={{ color: step.color }}
      >
        {step.title}
      </h4>
      <p className="text-xs md:text-sm text-muted-foreground font-medium mb-1">
        {step.subtitle}
      </p>
      <p className="text-[10px] md:text-xs text-muted-foreground/70 max-w-[140px] md:max-w-[160px] hidden md:block">
        {step.description}
      </p>
      
      {/* Click hint */}
      <motion.p 
        className="text-[11px] text-muted-foreground mt-2 hidden md:block"
        animate={{ opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        Click to learn more
      </motion.p>
      
      {index < totalSteps - 1 && (
        <motion.div 
          className="md:hidden my-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.15 + 0.3 }}
        >
          <ArrowRight className="h-5 w-5 rotate-90" style={{ color: step.color }} />
        </motion.div>
      )}
    </motion.div>
  );
}

function ExpandedStepDetails({ step, onClose }: { step: typeof pipelineSteps[0]; onClose: () => void }) {
  const Icon = step.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="mt-8 mx-auto max-w-2xl"
    >
      <div 
        className="relative p-6 rounded-2xl"
        style={{
          background: `linear-gradient(135deg, ${step.color}10 0%, transparent 50%, ${step.color}05 100%)`,
          border: `2px solid ${step.color}40`,
          boxShadow: `0 0 40px ${step.glowColor}, inset 0 0 40px ${step.color}10`
        }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
          data-testid="button-close-step-details"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
        
        <div className="flex items-start gap-4">
          <div 
            className="p-4 rounded-xl flex-shrink-0"
            style={{ 
              backgroundColor: `${step.color}20`,
              boxShadow: `0 0 20px ${step.glowColor}`
            }}
          >
            <Icon className="h-8 w-8" style={{ color: step.color }} />
          </div>
          
          <div className="flex-1">
            <h3 
              className="font-display text-xl font-bold mb-1"
              style={{ color: step.color }}
            >
              {step.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
            
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {step.details.map((detail, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-2 text-sm"
                >
                  <CheckCircle2 
                    className="h-4 w-4 flex-shrink-0" 
                    style={{ color: step.color }} 
                  />
                  <span className="text-muted-foreground">{detail}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function TestingPipelineVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const hoverCapable = useHoverCapable();
  const [activeStep, setActiveStep] = useState(0);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  
  useEffect(() => {
    if (!isInView || isPaused || expandedStep !== null) return;
    
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % pipelineSteps.length);
    }, 2000);
    
    return () => clearInterval(timer);
  }, [isInView, isPaused, expandedStep]);

  const handleStepClick = (index: number) => {
    if (expandedStep === index) {
      setExpandedStep(null);
      setIsPaused(false);
    } else {
      setExpandedStep(index);
      setActiveStep(index);
      setIsPaused(true);
    }
  };

  const handleClose = () => {
    setExpandedStep(null);
    setIsPaused(false);
  };

  return (
    <section ref={containerRef} className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-[#21d8ff]/5 to-background" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
            style={{
              background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.1) 0%, rgba(33, 216, 255, 0.05) 100%)',
              borderColor: 'rgba(157, 78, 221, 0.4)',
              boxShadow: '0 0 25px rgba(157, 78, 221, 0.2)'
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="h-5 w-5 text-[#9d4edd]" style={{ filter: 'drop-shadow(0 0 4px rgba(157, 78, 221, 0.6))' }} />
            <span className="text-sm font-bold bg-gradient-to-r from-[#9d4edd] to-[#21d8ff] bg-clip-text text-transparent">
              Quality Assurance Pipeline
            </span>
          </motion.div>
          
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9d4edd] via-[#ec4899] to-[#21d8ff]">
              From Source to Verification
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Every product goes through our rigorous 5-step quality pipeline.
          </p>
          <p className="text-[#21d8ff] font-medium mt-2">
            Click any step to learn more.
          </p>
        </motion.div>
        
        <div className="relative">
          <div className="hidden md:block absolute top-10 left-0 right-0 h-1">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #D4FF1F, #21d8ff, #9d4edd, #ec4899, #22c55e)',
                opacity: 0.3
              }}
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.5, delay: 0.5 }}
            />
          </div>
          
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
            {pipelineSteps.map((step, index) => (
              <div key={step.id} className="flex flex-col md:flex-row items-center flex-1">
                <PipelineStep 
                  step={step} 
                  index={index} 
                  isActive={activeStep === index}
                  isExpanded={expandedStep === index}
                  onToggle={() => handleStepClick(index)}
                  totalSteps={pipelineSteps.length}
                />
                
                {index < pipelineSteps.length - 1 && (
                  <AnimatedConnector 
                    fromColor={step.color} 
                    toColor={pipelineSteps[index + 1].color}
                    isActive={isInView}
                    delay={0.8 + index * 0.2}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Expanded Details Panel */}
        <AnimatePresence>
          {expandedStep !== null && (
            <ExpandedStepDetails 
              step={pipelineSteps[expandedStep]} 
              onClose={handleClose}
            />
          )}
        </AnimatePresence>
        
        <motion.div
          className="mt-12 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.5 }}
        >
          <div 
            className="inline-flex items-center gap-4 px-6 py-3 rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(33, 216, 255, 0.05) 100%)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              boxShadow: '0 0 20px rgba(34, 197, 94, 0.15)'
            }}
          >
            <CheckCircle2 className="h-5 w-5 text-[#22c55e]" style={{ filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.6))' }} />
            <span className="text-sm font-medium text-[#22c55e]">
              100% of products complete this verification process
            </span>
          </div>
        </motion.div>
        
        <div className="flex justify-center mt-6 gap-2">
          {pipelineSteps.map((step, index) => (
            <motion.button
              key={step.id}
              className="w-2 h-2 rounded-full transition-all cursor-pointer"
              style={{ 
                backgroundColor: activeStep === index ? step.color : `${step.color}40`,
                boxShadow: activeStep === index ? `0 0 10px ${step.color}` : 'none'
              }}
              onClick={() => {
                setActiveStep(index);
                setExpandedStep(null);
                setIsPaused(false);
              }}
              whileHover={hoverIf(hoverCapable, { scale: 1.3 })}
              data-testid={`pipeline-step-indicator-${index}`}
            />
          ))}
        </div>
        
        {/* Pause/Play indicator */}
        {isPaused && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs text-muted-foreground/50 mt-4"
          >
            Auto-cycle paused. Click a step indicator to resume.
          </motion.p>
        )}
      </div>
    </section>
  );
}
