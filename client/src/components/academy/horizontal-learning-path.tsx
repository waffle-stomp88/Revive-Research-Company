import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Compass, Building, FlaskConical, Award, CheckCircle2, Play, Sparkles } from "lucide-react";

interface Module {
  id: number;
  title: string;
  description: string;
  icon: any;
  color: string;
  lessons: { id: string; title: string; xp: number }[];
}

interface HorizontalLearningPathProps {
  modules: Module[];
  completedLessons: string[];
  onModuleClick: (moduleId: number) => void;
}

export function HorizontalLearningPath({ modules, completedLessons, onModuleClick }: HorizontalLearningPathProps) {
  const getModuleProgress = (module: Module) => {
    const completed = module.lessons.filter(l => completedLessons.includes(l.id)).length;
    return { completed, total: module.lessons.length };
  };

  const isModuleComplete = (module: Module) => {
    return module.lessons.every(l => completedLessons.includes(l.id));
  };

  const isModuleStarted = (module: Module) => {
    return module.lessons.some(l => completedLessons.includes(l.id));
  };

  const totalCompleted = modules.reduce((acc, m) => acc + getModuleProgress(m).completed, 0);
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const allComplete = totalCompleted === totalLessons;

  return (
    <div className="w-full py-8">
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#21d8ff]/10 border border-[#21d8ff]/30 mb-4"
        >
          <Sparkles className="h-4 w-4 text-[#21d8ff]" />
          <span className="text-sm font-medium text-[#21d8ff]">Guided Onboarding</span>
        </motion.div>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-2 italic">
          Your Learning Path
        </h2>
        <p className="text-white/60 text-sm md:text-base">
          Complete our guided 4-part onboarding course to master the fundamentals
        </p>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 relative z-10">
          {modules.map((module, index) => {
            const { completed, total } = getModuleProgress(module);
            const isComplete = isModuleComplete(module);
            const isStarted = isModuleStarted(module);
            const Icon = module.icon;

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative h-full flex flex-col"
              >
                <button
                  onClick={() => onModuleClick(module.id)}
                  className="w-full h-full text-left group cursor-pointer flex flex-col"
                  data-testid={`button-module-${module.id}`}
                >
                  <div
                    className="relative p-5 rounded-xl transition-all duration-300 overflow-hidden h-full flex flex-col"
                    style={{
                      background: `linear-gradient(135deg, ${module.color}15 0%, transparent 100%)`,
                      border: `1px solid ${isComplete ? module.color : `${module.color}40`}`,
                      boxShadow: isComplete 
                        ? `0 0 30px ${module.color}30, inset 0 0 20px ${module.color}10`
                        : `0 0 15px ${module.color}15`,
                    }}
                  >
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `radial-gradient(circle at center, ${module.color}20 0%, transparent 70%)`,
                      }}
                    />

                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform md:group-hover:scale-110 md:group-active:scale-110"
                          style={{
                            backgroundColor: `${module.color}25`,
                            boxShadow: `0 0 20px ${module.color}30`,
                          }}
                        >
                          <Icon className="w-6 h-6" style={{ color: module.color }} />
                        </div>
                        <Badge
                          className="text-xs font-semibold border-0"
                          style={{
                            backgroundColor: `${module.color}20`,
                            color: module.color,
                          }}
                        >
                          {index + 1}/{modules.length}
                        </Badge>
                      </div>

                      <h3
                        className="font-display text-lg font-bold uppercase tracking-wide mb-1"
                        style={{ color: module.color }}
                      >
                        {module.title}
                      </h3>
                      <p className="text-white/50 text-sm mb-4 flex-grow">{module.description}</p>

                      <div className="flex items-center gap-2 mt-auto">
                        {isComplete ? (
                          <span className="flex items-center gap-1.5 text-sm font-medium" style={{ color: module.color }}>
                            <CheckCircle2 className="w-4 h-4" />
                            Complete
                          </span>
                        ) : isStarted ? (
                          <span className="flex items-center gap-1.5 text-sm font-medium text-white/70">
                            <Play className="w-4 h-4" style={{ color: module.color }} />
                            {completed}/{total} lessons
                          </span>
                        ) : (
                          <span
                            className="flex items-center gap-1.5 text-sm font-medium group-hover:gap-2 transition-all"
                            style={{ color: module.color }}
                          >
                            Start
                            <motion.span
                              animate={{ x: [0, 3, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              →
                            </motion.span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center mt-8"
      >
        <div
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border"
          style={{
            background: allComplete
              ? "linear-gradient(135deg, #22c55e20 0%, #21d8ff10 100%)"
              : "rgba(255,255,255,0.03)",
            borderColor: allComplete ? "#22c55e50" : "rgba(255,255,255,0.1)",
          }}
        >
          <Sparkles className={`w-4 h-4 ${allComplete ? "text-[#22c55e]" : "text-white/40"}`} />
          <span className={`text-sm ${allComplete ? "text-[#22c55e]" : "text-white/50"}`}>
            {allComplete
              ? "All modules completed! You've mastered the fundamentals."
              : `Complete all 4 modules to master the researcher essentials`}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
