import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { 
  FlaskConical, 
  Snowflake, 
  CheckCircle2, 
  FileCheck, 
  Package, 
  Truck,
  ChevronRight,
  Play
} from "lucide-react";

const pipelineSteps = [
  {
    id: 1,
    title: "Synthesis",
    icon: FlaskConical,
    color: "#E7FB10",
    shortDesc: "Solid-phase peptide synthesis",
    details: ["High-purity amino acids", "Automated protocols", "Real-time monitoring"],
  },
  {
    id: 2,
    title: "Lyophilization",
    icon: Snowflake,
    color: "#21d8ff",
    shortDesc: "Freeze-drying for stability",
    details: ["-80°C freezing", "Vacuum sublimation", "Stable powder form"],
  },
  {
    id: 3,
    title: "QC Check",
    icon: CheckCircle2,
    color: "#22c55e",
    shortDesc: "Internal quality control",
    details: ["Visual inspection", "Weight verification", "Packaging check"],
  },
  {
    id: 4,
    title: "Lab Testing",
    icon: FileCheck,
    color: "#9d4edd",
    shortDesc: "Third-party verification",
    details: ["HPLC purity (98%+)", "Mass spectrometry", "COA generation"],
  },
  {
    id: 5,
    title: "Packaging",
    icon: Package,
    color: "#f97316",
    shortDesc: "Secure & traceable",
    details: ["QR-coded labels", "Tamper seals", "Cold packs ready"],
  },
  {
    id: 6,
    title: "Shipping",
    icon: Truck,
    color: "#ec4899",
    shortDesc: "Fast delivery",
    details: ["Same-day processing", "Cold chain", "Full tracking"],
  },
];

export function ProcessPipeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <div ref={containerRef} className="relative py-8">
      <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2">
        <div className="relative h-full mx-16">
          <div className="absolute inset-0 bg-border/30 rounded-full" />
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: "linear-gradient(90deg, #E7FB10, #21d8ff, #22c55e, #9d4edd, #f97316, #ec4899)",
            }}
            initial={{ width: "0%" }}
            animate={isInView ? { width: "100%" } : {}}
            transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
          />
          
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/50"
              style={{ left: `${(i + 1) * 5}%` }}
              initial={{ scale: 0, opacity: 0 }}
              animate={isInView ? { 
                scale: [0, 1.5, 1],
                opacity: [0, 1, 0.5]
              } : {}}
              transition={{ 
                delay: 0.5 + (i * 0.08),
                duration: 0.4,
              }}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative z-10">
        {pipelineSteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + index * 0.15, duration: 0.5 }}
              className="relative h-full"
              onMouseEnter={() => setActiveStep(step.id)}
              onMouseLeave={() => setActiveStep(null)}
              data-testid={`pipeline-step-${step.id}`}
            >
              <motion.div
                className="relative bg-card border rounded-xl p-4 cursor-pointer overflow-hidden h-full"
                style={{ 
                  borderColor: isActive ? step.color : 'rgba(255,255,255,0.1)',
                  boxShadow: isActive ? `0 0 30px ${step.color}30` : 'none'
                }}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className="absolute inset-0 opacity-0"
                  style={{ 
                    background: `radial-gradient(circle at center, ${step.color}20 0%, transparent 70%)`
                  }}
                  animate={{ opacity: isActive ? 1 : 0 }}
                />
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <motion.div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${step.color}20` }}
                      animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className="h-6 w-6" style={{ color: step.color }} />
                    </motion.div>
                    <span 
                      className="text-xs font-bold px-2 py-1 rounded-full"
                      style={{ 
                        backgroundColor: `${step.color}20`,
                        color: step.color
                      }}
                    >
                      {step.id}/6
                    </span>
                  </div>
                  
                  <h4 className="font-display font-bold mb-1" style={{ color: step.color }}>
                    {step.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    {step.shortDesc}
                  </p>
                  
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ 
                      height: isActive ? "auto" : 0,
                      opacity: isActive ? 1 : 0
                    }}
                    className="overflow-hidden"
                  >
                    <ul className="space-y-1 pt-2 border-t border-border/30">
                      {step.details.map((detail, i) => (
                        <motion.li
                          key={i}
                          initial={{ x: -10, opacity: 0 }}
                          animate={isActive ? { x: 0, opacity: 1 } : {}}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          <div 
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: step.color }}
                          />
                          {detail}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              </motion.div>
              
              {index < pipelineSteps.length - 1 && (
                <motion.div
                  className="hidden lg:flex absolute top-1/2 -right-2 z-20 w-4 h-4 items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : {}}
                  transition={{ delay: 0.5 + index * 0.15 }}
                >
                  <ChevronRight 
                    className="h-4 w-4" 
                    style={{ color: step.color }}
                  />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <motion.div
        className="flex justify-center mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 1.5 }}
      >
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-muted/30 border border-border/30">
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Play className="h-4 w-4 text-[#22c55e] fill-[#22c55e]" />
          </motion.div>
          <span className="text-sm text-muted-foreground">
            Hover each step to see details
          </span>
        </div>
      </motion.div>
    </div>
  );
}

export function ProcessPipelineVertical() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  return (
    <div ref={containerRef} className="relative">
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border/30">
        <motion.div
          className="absolute top-0 left-0 right-0"
          style={{
            background: "linear-gradient(180deg, #E7FB10, #21d8ff, #22c55e, #9d4edd, #f97316, #ec4899)",
          }}
          initial={{ height: "0%" }}
          animate={isInView ? { height: "100%" } : {}}
          transition={{ duration: 2, ease: "easeOut" }}
        />
      </div>

      <div className="space-y-6">
        {pipelineSteps.map((step, index) => {
          const Icon = step.icon;
          
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="relative flex gap-6 items-start"
            >
              <motion.div
                className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ 
                  backgroundColor: `${step.color}20`,
                  boxShadow: `0 0 20px ${step.color}30`
                }}
                whileHover={{ scale: 1.1 }}
              >
                <Icon className="h-7 w-7" style={{ color: step.color }} />
                <motion.div
                  className="absolute -inset-1 rounded-2xl"
                  style={{ border: `1px solid ${step.color}` }}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                />
              </motion.div>
              
              <div className="flex-1 pt-2">
                <div className="flex items-center gap-2 mb-1">
                  <span 
                    className="text-xs font-bold px-2 py-0.5 rounded"
                    style={{ backgroundColor: `${step.color}20`, color: step.color }}
                  >
                    Step {step.id}
                  </span>
                </div>
                <h4 className="font-display text-lg font-bold mb-1" style={{ color: step.color }}>
                  {step.title}
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {step.shortDesc}
                </p>
                <ul className="flex flex-wrap gap-2">
                  {step.details.map((detail, i) => (
                    <li 
                      key={i}
                      className="text-xs px-2 py-1 rounded-full bg-muted/50 text-muted-foreground"
                    >
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
