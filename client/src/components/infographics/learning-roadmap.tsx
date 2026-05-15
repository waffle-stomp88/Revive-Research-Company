import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { 
  BookOpen,
  FileCheck,
  Hash,
  Thermometer,
  Package,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  Play
} from "lucide-react";
import { useHoverCapable } from "@/hooks/use-hover-capable";

const courseModules = [
  {
    step: 1,
    title: "Research Use Only",
    slug: "what-research-use-only-means",
    description: "Understanding the legal framework",
    icon: BookOpen,
    color: "#E7FB10",
    duration: "5 min",
    topics: ["Legal requirements", "Researcher responsibilities", "Compliance basics"],
  },
  {
    step: 2,
    title: "Reading COAs",
    slug: "how-to-read-coas",
    description: "Interpreting lab certificates",
    icon: FileCheck,
    color: "#21d8ff",
    duration: "8 min",
    topics: ["HPLC results", "Mass spec data", "Purity analysis"],
  },
  {
    step: 3,
    title: "Batch Numbers",
    slug: "understanding-batches",
    description: "Traceability and quality control",
    icon: Hash,
    color: "#9d4edd",
    duration: "4 min",
    topics: ["Batch tracking", "QR verification", "COA matching"],
  },
  {
    step: 4,
    title: "Storage 101",
    slug: "storage-101",
    description: "Proper handling fundamentals",
    icon: Thermometer,
    color: "#f97316",
    duration: "6 min",
    topics: ["Temperature control", "Reconstitution", "Long-term storage"],
  },
  {
    step: 5,
    title: "Ordering Expectations",
    slug: "ordering-expectations",
    description: "Checkout to delivery",
    icon: Package,
    color: "#ec4899",
    duration: "4 min",
    topics: ["Order process", "Shipping info", "What to expect"],
  },
];

interface LearningRoadmapProps {
  onModuleClick?: (slug: string) => void;
  completedModules?: number[];
}

export function LearningRoadmap({ onModuleClick, completedModules = [] }: LearningRoadmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const hoverCapable = useHoverCapable();
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  return (
    <div ref={containerRef} className="relative">
      <div className="absolute top-12 left-8 right-8 h-1 hidden md:block overflow-visible rounded-full">
        <div className="absolute inset-0 bg-border/20" />
        <motion.div
          className="absolute inset-y-0 left-0"
          style={{
            background: "linear-gradient(90deg, #E7FB10, #21d8ff, #9d4edd, #f97316, #ec4899)",
          }}
          initial={{ width: "0%" }}
          animate={isInView ? { width: "100%" } : {}}
          transition={{ duration: 2, ease: "easeOut", delay: 0.3 }}
        />
      </div>

      {/* Vertical connector lines - positioned absolutely to connect timeline to cards */}
      {courseModules.map((module, index) => {
        const ratio = index / (courseModules.length - 1);
        return (
          <motion.div
            key={`connector-${index}`}
            className="hidden md:block absolute pointer-events-none"
            style={{
              left: `calc(2rem + (100% - 4rem) * ${ratio} - 1px)`,
              top: '52px',
              width: '2px',
              height: '90px',
              background: module.color,
            }}
            initial={{ height: 0 }}
            animate={isInView ? { height: '90px' } : {}}
            transition={{ delay: 2.5 + index * 0.2, duration: 0.8, ease: "easeOut" }}
          />
        );
      })}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-3 pt-6 md:pt-20">
        {courseModules.map((module, index) => {
          const Icon = module.icon;
          const isCompleted = completedModules.includes(module.step);
          const isHovered = hoveredStep === module.step;
          const isLocked = index > 0 && !completedModules.includes(index);
          
          return (
            <motion.div
              key={module.step}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
              className="relative"
              onMouseEnter={() => setHoveredStep(module.step)}
              onMouseLeave={() => setHoveredStep(null)}
              data-testid={`course-module-${module.step}`}
            >
              <motion.div
                className="relative bg-card border rounded-xl p-4 cursor-pointer h-full overflow-hidden"
                style={{ 
                  borderColor: isHovered ? module.color : `${module.color}40`,
                  boxShadow: isHovered 
                    ? `0 0 25px ${module.color}40, 0 0 50px ${module.color}20` 
                    : `0 0 15px ${module.color}20`,
                }}
                whileHover={hoverCapable ? { y: -5 } : {}}
                onClick={() => onModuleClick?.(module.slug)}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{ 
                    background: `radial-gradient(circle at top center, ${module.color}25 0%, transparent 70%)`
                  }}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: isHovered ? 1 : 0.5 }}
                />

                <div className="relative flex flex-col h-full">
                  <div className="flex items-center justify-between mb-3">
                    <motion.div
                      className="relative w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ 
                        backgroundColor: `${module.color}35`,
                        boxShadow: `0 0 12px ${module.color}50`
                      }}
                      animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
                    >
                      <Icon className="h-5 w-5" style={{ color: module.color }} />
                      {isCompleted && (
                        <motion.div
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        </motion.div>
                      )}
                    </motion.div>
                    
                    <div className="flex items-center gap-1">
                      <span 
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ 
                          backgroundColor: `${module.color}30`,
                          color: module.color,
                          border: `1px solid ${module.color}50`
                        }}
                      >
                        {module.step}/5
                      </span>
                    </div>
                  </div>

                  <h4 
                    className="font-display text-sm font-bold mb-1 line-clamp-1"
                    style={{ color: module.color }}
                  >
                    {module.title}
                  </h4>
                  
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-1">
                    {module.description}
                  </p>

                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ 
                      height: isHovered ? "auto" : 0,
                      opacity: isHovered ? 1 : 0
                    }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 border-t border-border/30">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-2">
                        <Play className="h-3 w-3" style={{ color: module.color }} />
                        <span>{module.duration} read</span>
                      </div>
                      <ul className="space-y-1">
                        {module.topics.map((topic, i) => (
                          <motion.li
                            key={i}
                            initial={{ x: -10, opacity: 0 }}
                            animate={isHovered ? { x: 0, opacity: 1 } : {}}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center gap-1.5 text-[10px] text-muted-foreground"
                          >
                            <div 
                              className="w-1 h-1 rounded-full"
                              style={{ backgroundColor: module.color }}
                            />
                            {topic}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-center gap-1 mt-auto"
                    style={{ color: module.color }}
                    animate={{ x: isHovered ? 5 : 0 }}
                  >
                    <span className="text-xs font-medium">
                      {isCompleted ? "Review" : "Start"}
                    </span>
                    <ArrowRight className="h-3 w-3" />
                  </motion.div>
                </div>
              </motion.div>

              {index < courseModules.length - 1 && (
                <motion.div
                  className="hidden md:block absolute top-1/2 -right-3 z-10"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <motion.div
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.2 }}
                  >
                    <ArrowRight className="h-4 w-4 text-muted-foreground/30" />
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <motion.div
        className="flex justify-center mt-8"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 1.5 }}
      >
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-[#ec4899]/10 via-[#9d4edd]/10 to-[#21d8ff]/10 border border-[#ec4899]/20">
          <Sparkles className="h-4 w-4 text-[#ec4899]" />
          <span className="text-sm text-muted-foreground">
            Complete all 5 modules to master the researcher essentials
          </span>
        </div>
      </motion.div>
    </div>
  );
}

export function LearningProgress({ completedCount = 0, totalCount = 5 }: { completedCount?: number; totalCount?: number }) {
  const percentage = (completedCount / totalCount) * 100;
  
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, #E7FB10, #21d8ff, #9d4edd, #f97316, #ec4899)",
          }}
          initial={{ width: "0%" }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <span className="text-sm font-medium text-muted-foreground">
        {completedCount}/{totalCount}
      </span>
    </div>
  );
}
