import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { 
  Shield, 
  FlaskConical, 
  Award,
  Beaker,
  CheckCircle2,
  TrendingUp
} from "lucide-react";

function AnimatedCounter({ target, suffix = "", duration = 2, delay = 0 }: { 
  target: number; 
  suffix?: string; 
  duration?: number;
  delay?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  
  useEffect(() => {
    if (!isInView) return;
    
    const timeout = setTimeout(() => {
      let startTime: number;
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.floor(eased * target * 10) / 10);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(target);
        }
      };
      requestAnimationFrame(animate);
    }, delay * 1000);
    
    return () => clearTimeout(timeout);
  }, [isInView, target, duration, delay]);
  
  return (
    <span ref={containerRef}>
      {displayValue.toFixed(1)}{suffix}
    </span>
  );
}

function PurityMeter({ value, label, color, delay }: { 
  value: number; 
  label: string; 
  color: string;
  delay: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  
  return (
    <motion.div
      ref={containerRef}
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="font-display text-lg font-bold" style={{ color }}>
          <AnimatedCounter target={value} suffix="%" delay={delay + 0.3} duration={1.5} />
        </span>
      </div>
      
      <div 
        className="h-3 rounded-full overflow-hidden"
        style={{ backgroundColor: `${color}15` }}
      >
        <motion.div
          className="h-full rounded-full relative"
          style={{ 
            background: `linear-gradient(90deg, ${color}80, ${color})`,
            boxShadow: `0 0 20px ${color}60`
          }}
          initial={{ width: 0 }}
          animate={isInView ? { width: `${value}%` } : {}}
          transition={{ delay: delay + 0.2, duration: 1.5, ease: "easeOut" }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
            }}
            animate={{
              x: ['-100%', '200%']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              delay: delay + 1.5
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

function CircularProgress({ value, color, icon: Icon, label, size = 120, delay }: {
  value: number;
  color: string;
  icon: any;
  label: string;
  size?: number;
  delay: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  
  return (
    <motion.div
      ref={containerRef}
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ delay, duration: 0.5, type: "spring" }}
    >
      <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Icon 
            className="h-10 w-10 md:h-12 md:w-12 mb-2" 
            style={{ color, filter: `drop-shadow(0 0 8px ${color})` }} 
          />
        </motion.div>
        <span className="font-display text-2xl md:text-3xl font-bold" style={{ color, textShadow: `0 0 20px ${color}60` }}>
          <AnimatedCounter target={value} suffix="%" delay={delay + 0.5} />
        </span>
        
        <motion.div
          className="absolute inset-0 rounded-full -z-10"
          style={{
            background: `radial-gradient(circle, ${color}15 0%, transparent 60%)`,
          }}
          animate={{
            opacity: [0.4, 0.8, 0.4],
            scale: [0.9, 1.1, 0.9]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      <span className="mt-2 text-sm font-medium text-muted-foreground text-center">
        {label}
      </span>
    </motion.div>
  );
}

const trustMetrics = [
  { 
    icon: FlaskConical, 
    value: 98.5, 
    label: "Average Purity", 
    color: "#E7FB10",
    description: "Verified via HPLC testing"
  },
  { 
    icon: Shield, 
    value: 100, 
    label: "Third-Party Tested", 
    color: "#21d8ff",
    description: "Independent lab verification"
  },
  { 
    icon: Award, 
    value: 100, 
    label: "COA Available", 
    color: "#9d4edd",
    description: "Full documentation provided"
  },
  { 
    icon: CheckCircle2, 
    value: 100, 
    label: "QR Verifiable", 
    color: "#22c55e",
    description: "Instant authenticity check"
  },
];

const qualityMetrics = [
  { label: "Peptide Purity", value: 98.5, color: "#E7FB10" },
  { label: "Identity Confirmation", value: 99.2, color: "#21d8ff" },
  { label: "Sterility Testing", value: 99.8, color: "#9d4edd" },
  { label: "Endotoxin Levels", value: 98.9, color: "#22c55e" },
];

export function AnimatedTrustMeters() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-[#E7FB10]/5 to-background" />
        <motion.div 
          className="absolute top-1/3 right-1/4 w-80 h-80 bg-[#E7FB10]/10 rounded-full blur-[120px]"
          animate={{ 
            opacity: [0.15, 0.3, 0.15],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-[#21d8ff]/10 rounded-full blur-[100px]"
          animate={{ 
            opacity: [0.1, 0.25, 0.1],
            scale: [1.1, 1, 1.1]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>
      
      <div className="relative max-w-6xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
            style={{
              background: 'linear-gradient(135deg, rgba(231, 251, 16, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
              borderColor: 'rgba(231, 251, 16, 0.4)',
              boxShadow: '0 0 25px rgba(231, 251, 16, 0.2)'
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 }}
          >
            <TrendingUp className="h-5 w-5 text-[#E7FB10]" style={{ filter: 'drop-shadow(0 0 4px rgba(231, 251, 16, 0.6))' }} />
            <span className="text-sm font-bold bg-gradient-to-r from-[#E7FB10] to-[#22c55e] bg-clip-text text-transparent">
              Trust Metrics
            </span>
          </motion.div>
          
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E7FB10] via-[#21d8ff] to-[#22c55e]">
              Quality You Can Verify
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real numbers, real testing, real transparency. Every metric is backed 
            by independent laboratory verification.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-12">
          {trustMetrics.map((metric, index) => (
            <CircularProgress
              key={metric.label}
              value={metric.value}
              color={metric.color}
              icon={metric.icon}
              label={metric.label}
              delay={0.3 + index * 0.15}
            />
          ))}
        </div>
        
        <motion.div
          className="rounded-2xl p-6 md:p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(231, 251, 16, 0.05) 0%, rgba(33, 216, 255, 0.03) 100%)',
            border: '1px solid rgba(231, 251, 16, 0.2)',
            boxShadow: '0 0 40px rgba(231, 251, 16, 0.1)'
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Beaker className="h-5 w-5 text-[#E7FB10]" style={{ filter: 'drop-shadow(0 0 4px rgba(231, 251, 16, 0.6))' }} />
            <h3 className="font-display text-lg font-bold text-[#E7FB10]">
              Lab Testing Standards
            </h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {qualityMetrics.map((metric, index) => (
              <PurityMeter
                key={metric.label}
                value={metric.value}
                label={metric.label}
                color={metric.color}
                delay={1.2 + index * 0.15}
              />
            ))}
          </div>
        </motion.div>
        
        <motion.div
          className="mt-8 flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 2 }}
        >
          {[
            { text: "HPLC Analysis", color: "#E7FB10" },
            { text: "Mass Spectrometry", color: "#21d8ff" },
            { text: "Amino Acid Sequencing", color: "#9d4edd" },
            { text: "Endotoxin Testing", color: "#22c55e" },
          ].map((item) => (
            <span
              key={item.text}
              className="px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${item.color}15`,
                color: item.color,
                border: `1px solid ${item.color}30`
              }}
            >
              {item.text}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
