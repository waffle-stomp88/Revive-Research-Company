import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Lightbulb,
  AlertTriangle,
  Info,
  Play,
  BookOpen,
  Target,
  Zap,
  Award,
  FlaskConical,
  Thermometer,
  Shield,
  FileCheck,
} from "lucide-react";
import { useHoverCapable, hoverIf } from "@/hooks/use-hover-capable";

export interface HeroVisualProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  illustration?: React.ReactNode;
  stats?: { label: string; value: string }[];
}

export function HeroVisual({ title, subtitle, icon, color, illustration, stats }: HeroVisualProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="relative mb-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl p-8 md:p-12"
        style={{
          background: `linear-gradient(135deg, ${color}15 0%, transparent 50%, ${color}08 100%)`,
          border: `1px solid ${color}30`,
        }}
      >
        <motion.div
          className="absolute top-0 right-0 w-64 h-64 opacity-20"
          style={{
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
              style={{ backgroundColor: `${color}20` }}
            >
              {icon}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-white mb-4"
            >
              {title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.4 }}
              className="text-lg text-white/70 max-w-xl"
            >
              {subtitle}
            </motion.p>

            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4 mt-6"
              >
                {stats.map((stat, i) => (
                  <div
                    key={i}
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="text-2xl font-bold" style={{ color }}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-white/50">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {illustration && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="lg:w-80"
            >
              {illustration}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export interface StepData {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  details?: string[];
  tip?: string;
  warning?: string;
}

export interface ProcessStoryboardProps {
  title: string;
  subtitle?: string;
  steps: StepData[];
  layout?: "horizontal" | "vertical";
}

export function ProcessStoryboard({ title, subtitle, steps, layout = "vertical" }: ProcessStoryboardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const hoverCapable = useHoverCapable();

  if (layout === "horizontal") {
    return (
      <div ref={ref} className="mb-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="mb-6"
        >
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          {subtitle && <p className="text-white/60 text-sm">{subtitle}</p>}
        </motion.div>

        <div className="relative">
          <div className="hidden md:block absolute top-8 left-0 right-0 h-0.5 bg-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-[#D4FF1F] via-[#21d8ff] to-[#22c55e]"
              initial={{ width: "0%" }}
              animate={isInView ? { width: "100%" } : {}}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 relative">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: idx * 0.15 }}
                  onMouseEnter={() => setActiveStep(step.id)}
                  onMouseLeave={() => setActiveStep(null)}
                  className="relative"
                >
                  <motion.div
                    className="p-4 rounded-xl border transition-all cursor-pointer"
                    style={{
                      borderColor: isActive ? step.color : "rgba(255,255,255,0.1)",
                      backgroundColor: isActive ? `${step.color}10` : "rgba(255,255,255,0.02)",
                    }}
                    whileHover={hoverIf(hoverCapable, { y: -4 })}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${step.color}20` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: step.color }} />
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-xs"
                        style={{ backgroundColor: `${step.color}20`, color: step.color }}
                      >
                        Step {step.id}
                      </Badge>
                    </div>

                    <h4 className="font-semibold text-white mb-2">{step.title}</h4>
                    <p className="text-sm text-white/60">{step.description}</p>

                    {step.details && isActive && (
                      <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-3 pt-3 border-t border-white/10 space-y-1"
                      >
                        {step.details.map((detail, i) => (
                          <motion.li
                            key={i}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-2 text-xs text-white/50"
                          >
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: step.color }}
                            />
                            {detail}
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="mb-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        className="mb-6"
      >
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        {subtitle && <p className="text-white/60 text-sm">{subtitle}</p>}
      </motion.div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/10">
          <motion.div
            className="w-full bg-gradient-to-b from-[#D4FF1F] via-[#21d8ff] to-[#22c55e]"
            initial={{ height: "0%" }}
            animate={isInView ? { height: "100%" } : {}}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </div>

        <div className="space-y-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: idx * 0.15 }}
                className="relative flex gap-6"
              >
                <motion.div
                  className="relative z-10 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: `${step.color}20`,
                    boxShadow: `0 0 20px ${step.color}20`,
                  }}
                  whileHover={hoverIf(hoverCapable, { scale: 1.1 })}
                >
                  <Icon className="w-6 h-6" style={{ color: step.color }} />
                </motion.div>

                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      style={{ backgroundColor: `${step.color}20`, color: step.color }}
                    >
                      Step {step.id}
                    </Badge>
                  </div>

                  <h4 className="text-lg font-semibold text-white mb-2">{step.title}</h4>
                  <p className="text-white/70 mb-3">{step.description}</p>

                  {step.details && (
                    <ul className="flex flex-wrap gap-2 mb-3">
                      {step.details.map((detail, i) => (
                        <li
                          key={i}
                          className="text-xs px-3 py-1 rounded-full bg-white/5 text-white/60"
                        >
                          {detail}
                        </li>
                      ))}
                    </ul>
                  )}

                  {step.tip && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-[#D4FF1F]/10 border border-[#D4FF1F]/20">
                      <Lightbulb className="w-4 h-4 text-[#D4FF1F] flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-white/70">{step.tip}</p>
                    </div>
                  )}

                  {step.warning && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-white/70">{step.warning}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export interface KeyPoint {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  description: string;
  color: string;
}

export interface ConceptInfographicProps {
  title: string;
  subtitle?: string;
  visual?: React.ReactNode;
  keyPoints?: KeyPoint[];
  layout?: "side-by-side" | "stacked";
}

export function ConceptInfographic({ title, subtitle, visual, keyPoints, layout = "side-by-side" }: ConceptInfographicProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="mb-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        className="mb-6"
      >
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        {subtitle && <p className="text-white/60 text-sm">{subtitle}</p>}
      </motion.div>

      <div className={`${layout === "side-by-side" ? "grid lg:grid-cols-2 gap-6" : "space-y-6"}`}>
        {visual && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-6 overflow-hidden"
          >
            {visual}
          </motion.div>
        )}

        {keyPoints && (
          <div className="space-y-3">
            {keyPoints.map((point, idx) => {
              const Icon = point.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="flex gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.02]"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${point.color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: point.color }} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">{point.title}</h4>
                    <p className="text-sm text-white/60">{point.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export interface HandsOnItem {
  title: string;
  items: string[];
  icon?: React.ComponentType<{ className?: string }>;
  type?: "checklist" | "supplies" | "safety";
}

export interface HandsOnLabProps {
  title: string;
  sections: HandsOnItem[];
}

export function HandsOnLab({ title, sections }: HandsOnLabProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [expandedSection, setExpandedSection] = useState<number | null>(0);

  const getTypeStyles = (type?: string) => {
    switch (type) {
      case "safety":
        return { bg: "bg-red-500/10", border: "border-red-500/20", icon: Shield, color: "#ef4444" };
      case "supplies":
        return { bg: "bg-[#21d8ff]/10", border: "border-[#21d8ff]/20", icon: FlaskConical, color: "#21d8ff" };
      default:
        return { bg: "bg-[#D4FF1F]/10", border: "border-[#D4FF1F]/20", icon: CheckCircle2, color: "#D4FF1F" };
    }
  };

  return (
    <div ref={ref} className="mb-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-2">
          <FlaskConical className="w-5 h-5 text-[#21d8ff]" />
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
      </motion.div>

      <div className="space-y-3">
        {sections.map((section, idx) => {
          const styles = getTypeStyles(section.type);
          const Icon = section.icon || styles.icon;
          const isExpanded = expandedSection === idx;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: idx * 0.1 }}
              className={`rounded-xl border ${styles.border} ${styles.bg} overflow-hidden`}
            >
              <button
                onClick={() => setExpandedSection(isExpanded ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${styles.color}20` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: styles.color }} />
                  </div>
                  <span className="font-semibold text-white">{section.title}</span>
                  <Badge variant="secondary" className="text-xs">
                    {section.items.length} items
                  </Badge>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-white/50 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                />
              </button>

              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="px-4 pb-4"
                >
                  <ul className="space-y-2">
                    {section.items.map((item, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 text-white/70"
                      >
                        <div
                          className="w-5 h-5 rounded-full border flex items-center justify-center"
                          style={{ borderColor: styles.color }}
                        >
                          <CheckCircle2 className="w-3 h-3" style={{ color: styles.color }} />
                        </div>
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface KnowledgeCheckProps {
  title?: string;
  questions: QuizQuestion[];
  onComplete?: (score: number, total: number) => void;
}

export function KnowledgeCheck({ title = "Knowledge Check", questions, onComplete }: KnowledgeCheckProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const hoverCapable = useHoverCapable();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const question = questions[currentQuestion];

  const handleAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);
    if (index === question.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((q) => q + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setCompleted(true);
      onComplete?.(score + (selectedAnswer === question.correctIndex ? 1 : 0), questions.length);
    }
  };

  if (completed) {
    const finalScore = score;
    const percentage = Math.round((finalScore / questions.length) * 100);

    return (
      <div ref={ref} className="mb-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 rounded-xl border border-[#22c55e]/30 bg-[#22c55e]/10"
        >
          <Award className="w-16 h-16 text-[#22c55e] mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h3>
          <p className="text-white/70 mb-4">
            You scored {finalScore} out of {questions.length} ({percentage}%)
          </p>
          <Badge
            className={`text-lg py-2 px-4 ${
              percentage >= 80
                ? "bg-[#22c55e]/20 text-[#22c55e]"
                : percentage >= 60
                ? "bg-[#D4FF1F]/20 text-[#D4FF1F]"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {percentage >= 80 ? "Excellent!" : percentage >= 60 ? "Good Job!" : "Keep Learning!"}
          </Badge>
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={ref} className="mb-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#9d4edd]" />
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
          <Badge variant="secondary">
            {currentQuestion + 1} / {questions.length}
          </Badge>
        </div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#9d4edd]"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </motion.div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <h4 className="text-lg font-semibold text-white mb-6">{question.question}</h4>

        <div className="space-y-3 mb-6">
          {question.options.map((option, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrect = idx === question.correctIndex;
            const showCorrect = showResult && isCorrect;
            const showWrong = showResult && isSelected && !isCorrect;

            return (
              <motion.button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={showResult}
                whileHover={hoverIf(!showResult && hoverCapable, { scale: 1.02 })}
                whileTap={!showResult ? { scale: 0.98 } : {}}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  showCorrect
                    ? "border-[#22c55e] bg-[#22c55e]/10"
                    : showWrong
                    ? "border-red-500 bg-red-500/10"
                    : isSelected
                    ? "border-[#21d8ff] bg-[#21d8ff]/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      showCorrect
                        ? "bg-[#22c55e]/20 text-[#22c55e]"
                        : showWrong
                        ? "bg-red-500/20 text-red-400"
                        : "bg-white/10 text-white/60"
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-white/80">{option}</span>
                  {showCorrect && <CheckCircle2 className="w-5 h-5 text-[#22c55e] ml-auto" />}
                </div>
              </motion.button>
            );
          })}
        </div>

        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-[#21d8ff]/10 border border-[#21d8ff]/20"
          >
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-[#21d8ff] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-white/70">{question.explanation}</p>
            </div>
          </motion.div>
        )}

        {showResult && (
          <Button onClick={handleNext} className="w-full bg-[#D4FF1F] text-black hover:bg-[#D4FF1F]/90">
            {currentQuestion < questions.length - 1 ? "Next Question" : "See Results"}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}

export interface CalloutProps {
  type: "tip" | "warning" | "info" | "success";
  title?: string;
  children: React.ReactNode;
}

export function Callout({ type, title, children }: CalloutProps) {
  const styles = {
    tip: { bg: "bg-[#D4FF1F]/10", border: "border-[#D4FF1F]/20", icon: Lightbulb, color: "#D4FF1F" },
    warning: { bg: "bg-red-500/10", border: "border-red-500/20", icon: AlertTriangle, color: "#ef4444" },
    info: { bg: "bg-[#21d8ff]/10", border: "border-[#21d8ff]/20", icon: Info, color: "#21d8ff" },
    success: { bg: "bg-[#22c55e]/10", border: "border-[#22c55e]/20", icon: CheckCircle2, color: "#22c55e" },
  }[type];

  const Icon = styles.icon;

  return (
    <div className={`mb-6 p-4 rounded-xl ${styles.bg} border ${styles.border}`}>
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: styles.color }} />
        <div>
          {title && <h4 className="font-semibold text-white mb-1">{title}</h4>}
          <div className="text-sm text-white/70">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function LessonDivider() {
  return (
    <div className="my-10 flex items-center gap-4">
      <div className="flex-1 h-px bg-white/10" />
      <div className="w-2 h-2 rounded-full bg-[#21d8ff]/50" />
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}
