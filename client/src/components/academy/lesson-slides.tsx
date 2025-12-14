import { motion } from "framer-motion";
import {
  Compass,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Scale,
  ShoppingCart,
  FlaskConical,
  Snowflake,
  Thermometer,
  Droplets,
  FileCheck,
  Search,
  Shield,
  ClipboardList,
  Puzzle,
  Wrench,
  Sparkles,
  Award,
  Beaker,
  TestTube,
  Package,
  AlertTriangle,
  CheckCircle2,
  Target,
  TrendingUp,
  Eye,
  Lightbulb,
  Lock,
  Users,
  Globe,
  Clock,
  Zap,
  Activity,
  BarChart3,
  CircleDot,
  ArrowRight,
  ArrowDown,
  Check,
  X,
  Microscope,
  Dna,
  Heart,
  Brain,
  Building2,
  FileText,
  Truck,
  Mail,
  CreditCard,
  Box,
  Timer,
  Syringe,
  Atom,
  Waves,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Slide {
  title: string;
  content: React.ReactNode;
  quiz?: QuizQuestion[];
}

// Quiz slide component for module knowledge checks
export function QuizSlide({ 
  moduleTitle,
  questions,
  onComplete 
}: { 
  moduleTitle: string;
  questions: QuizQuestion[];
  onComplete?: (score: number, total: number) => void;
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [showResults, setShowResults] = useState(false);
  const [answered, setAnswered] = useState(false);

  const handleSelectAnswer = (optionIndex: number) => {
    if (answered) return;
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = optionIndex;
    setSelectedAnswers(newAnswers);
    setAnswered(true);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setAnswered(false);
    } else {
      setShowResults(true);
      const score = selectedAnswers.filter((ans, idx) => ans === questions[idx].correctIndex).length;
      onComplete?.(score, questions.length);
    }
  };

  const question = questions[currentQuestion];
  const selectedAnswer = selectedAnswers[currentQuestion];
  const isCorrect = selectedAnswer === question.correctIndex;
  const score = selectedAnswers.filter((ans, idx) => ans === questions[idx].correctIndex).length;
  const isPerfect = score === questions.length;

  // Dispatch custom event when quiz results are shown with perfect score
  useEffect(() => {
    if (showResults && isPerfect) {
      const event = new CustomEvent('academyPerfectQuiz', { detail: { score, total: questions.length } });
      window.dispatchEvent(event);
    }
  }, [showResults, isPerfect, score, questions.length]);

  if (showResults) {
    return (
      <div className="flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
            isPerfect ? "bg-[#E7FB10]/20 border-2 border-[#E7FB10]/40" : "bg-[#21d8ff]/20 border-2 border-[#21d8ff]/40"
          }`}
        >
          {isPerfect ? (
            <Award className="w-12 h-12 text-[#E7FB10]" />
          ) : (
            <CheckCircle2 className="w-12 h-12 text-[#21d8ff]" />
          )}
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-white mb-2"
        >
          {isPerfect ? "Perfect Score!" : "Quiz Complete!"}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold mb-4"
          style={{ color: isPerfect ? "#E7FB10" : "#21d8ff" }}
        >
          {score} / {questions.length}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-white/60"
        >
          {isPerfect 
            ? "Excellent! You've mastered this module!" 
            : `Good effort! Review the material to improve.`}
        </motion.p>
        {isPerfect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Badge className="mt-4 bg-[#E7FB10]/20 text-[#E7FB10] border-[#E7FB10]/30">
              <Sparkles className="w-3 h-3 mr-1" />
              Perfect Score Achievement!
            </Badge>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Badge className="bg-[#9d4edd]/20 text-[#9d4edd] border-[#9d4edd]/30">
          <GraduationCap className="w-3 h-3 mr-1" />
          {moduleTitle} Quiz
        </Badge>
        <span className="text-sm text-white/50">
          Question {currentQuestion + 1} of {questions.length}
        </span>
      </div>

      <motion.h3
        key={currentQuestion}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-xl font-semibold text-white mb-6"
      >
        {question.question}
      </motion.h3>

      <div className="space-y-3 mb-6">
        {question.options.map((option, idx) => {
          const isSelected = selectedAnswer === idx;
          const isCorrectAnswer = idx === question.correctIndex;
          let bgColor = "bg-white/5 border-white/10 hover:bg-white/10";
          let textColor = "text-white/80";
          
          if (answered) {
            if (isCorrectAnswer) {
              bgColor = "bg-green-500/20 border-green-500/40";
              textColor = "text-green-400";
            } else if (isSelected && !isCorrect) {
              bgColor = "bg-red-500/20 border-red-500/40";
              textColor = "text-red-400";
            }
          } else if (isSelected) {
            bgColor = "bg-[#21d8ff]/20 border-[#21d8ff]/40";
            textColor = "text-[#21d8ff]";
          }

          return (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => handleSelectAnswer(idx)}
              disabled={answered}
              className={`w-full p-4 rounded-xl border text-left transition-all ${bgColor} ${answered ? "cursor-default" : "cursor-pointer"}`}
              data-testid={`quiz-option-${idx}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold ${textColor} bg-white/10`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className={textColor}>{option}</span>
                {answered && isCorrectAnswer && (
                  <Check className="w-5 h-5 ml-auto text-green-400" />
                )}
                {answered && isSelected && !isCorrect && (
                  <X className="w-5 h-5 ml-auto text-red-400" />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end"
        >
          <Button
            onClick={handleNext}
            className="bg-[#E7FB10] text-black hover:bg-[#E7FB10]/90"
            data-testid="button-quiz-next"
          >
            {currentQuestion < questions.length - 1 ? "Next Question" : "See Results"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}

function SlideHero({ 
  icon: Icon, 
  title, 
  subtitle, 
  color 
}: { 
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; 
  title: string; 
  subtitle: string; 
  color: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6"
        style={{ backgroundColor: `${color}20`, border: `2px solid ${color}40` }}
      >
        <Icon className="w-12 h-12" style={{ color }} />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl md:text-3xl font-bold text-white mb-4"
      >
        {title}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-white/70 text-lg max-w-md"
      >
        {subtitle}
      </motion.p>
    </div>
  );
}

function SlideInfoCard({ 
  items, 
  title 
}: { 
  items: { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; title: string; description: string; color: string }[];
  title?: string;
}) {
  return (
    <div className="w-full">
      {title && (
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl font-semibold text-white mb-6 text-center"
        >
          {title}
        </motion.h3>
      )}
      <div className="grid gap-4">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.15 }}
              className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${item.color}20` }}
              >
                <Icon className="w-6 h-6" style={{ color: item.color }} />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                <p className="text-sm text-white/60">{item.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function SlideCallout({ 
  type, 
  title, 
  children 
}: { 
  type: "tip" | "warning" | "info"; 
  title: string; 
  children: React.ReactNode;
}) {
  const styles = {
    tip: { color: "#22c55e", icon: Lightbulb, bg: "#22c55e" },
    warning: { color: "#f97316", icon: AlertTriangle, bg: "#f97316" },
    info: { color: "#21d8ff", icon: BookOpen, bg: "#21d8ff" },
  };
  const { color, icon: Icon, bg } = styles[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-xl border"
      style={{ backgroundColor: `${bg}10`, borderColor: `${bg}30` }}
    >
      <div className="flex items-center gap-3 mb-3">
        <Icon className="w-5 h-5" style={{ color }} />
        <span className="font-semibold text-white">{title}</span>
      </div>
      <p className="text-white/70">{children}</p>
    </motion.div>
  );
}

function SlideVisual({ children, caption }: { children: React.ReactNode; caption?: string }) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 rounded-2xl bg-white/5 border border-white/10"
      >
        {children}
      </motion.div>
      {caption && (
        <p className="mt-4 text-sm text-white/50 text-center">{caption}</p>
      )}
    </div>
  );
}

function SlideText({ title, paragraphs }: { title?: string; paragraphs: string[] }) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      {title && (
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl font-semibold text-white mb-5 text-center"
        >
          {title}
        </motion.h3>
      )}
      <div className="space-y-4">
        {paragraphs.map((p, idx) => (
          <motion.p
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="text-white/70 leading-relaxed"
          >
            {p}
          </motion.p>
        ))}
      </div>
    </div>
  );
}

function SlideComparison({ 
  title, 
  left, 
  right 
}: { 
  title?: string;
  left: { label: string; items: string[]; color: string };
  right: { label: string; items: string[]; color: string };
}) {
  return (
    <div className="w-full">
      {title && (
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl font-semibold text-white mb-6 text-center"
        >
          {title}
        </motion.h3>
      )}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-4 rounded-xl border"
          style={{ backgroundColor: `${left.color}10`, borderColor: `${left.color}30` }}
        >
          <h4 className="font-semibold text-white mb-3 text-center" style={{ color: left.color }}>{left.label}</h4>
          <ul className="space-y-2">
            {left.items.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-white/70">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: left.color }} />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-4 rounded-xl border"
          style={{ backgroundColor: `${right.color}10`, borderColor: `${right.color}30` }}
        >
          <h4 className="font-semibold text-white mb-3 text-center" style={{ color: right.color }}>{right.label}</h4>
          <ul className="space-y-2">
            {right.items.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-white/70">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: right.color }} />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}

function SlideQuiz({ 
  question, 
  options, 
  correctIndex 
}: { 
  question: string; 
  options: string[]; 
  correctIndex: number;
}) {
  return (
    <div className="w-full max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mb-6"
      >
        <Badge className="mb-3 bg-[#9d4edd]/20 text-[#9d4edd] border-[#9d4edd]/30">Knowledge Check</Badge>
        <h3 className="text-xl font-semibold text-white">{question}</h3>
      </motion.div>
      <div className="space-y-3">
        {options.map((opt, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + idx * 0.1 }}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              idx === correctIndex 
                ? "bg-[#22c55e]/10 border-[#22c55e]/30" 
                : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                idx === correctIndex ? "bg-[#22c55e]/20 text-[#22c55e]" : "bg-white/10 text-white/50"
              }`}>
                {String.fromCharCode(65 + idx)}
              </div>
              <span className={idx === correctIndex ? "text-white font-medium" : "text-white/70"}>{opt}</span>
              {idx === correctIndex && <CheckCircle2 className="w-5 h-5 text-[#22c55e] ml-auto" />}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PeptideChainVisual() {
  const aminoAcids = [
    { letter: "A", name: "Ala", color: "#E7FB10" },
    { letter: "G", name: "Gly", color: "#21d8ff" },
    { letter: "S", name: "Ser", color: "#22c55e" },
    { letter: "T", name: "Thr", color: "#9d4edd" },
    { letter: "Y", name: "Tyr", color: "#f97316" },
  ];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-1">
        {aminoAcids.map((aa, idx) => (
          <motion.div
            key={idx}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: idx * 0.15, type: "spring" }}
            className="flex items-center"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
              style={{ backgroundColor: `${aa.color}30`, color: aa.color, border: `2px solid ${aa.color}` }}
            >
              {aa.letter}
            </div>
            {idx < aminoAcids.length - 1 && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: idx * 0.15 + 0.1 }}
                className="w-4 h-1 bg-white/30"
              />
            )}
          </motion.div>
        ))}
      </div>
      <p className="text-sm text-white/50">Amino acids linked by peptide bonds</p>
    </div>
  );
}

function MolecularSizeComparisonVisual() {
  const molecules = [
    { name: "Amino Acid", size: 1.5, color: "#E7FB10", label: "~100 Da" },
    { name: "Peptide", size: 3, color: "#21d8ff", label: "500-5000 Da" },
    { name: "Protein", size: 5, color: "#9d4edd", label: ">10,000 Da" },
  ];

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
      <h3 className="text-xl font-semibold text-white">Size Comparison: Amino Acids vs Peptides vs Proteins</h3>
      <div className="flex items-end justify-center gap-16">
        {molecules.map((mol, idx) => (
          <motion.div
            key={idx}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: idx * 0.2, type: "spring" }}
            className="flex flex-col items-center"
          >
            <div
              className="rounded-full flex items-center justify-center mb-4"
              style={{ 
                width: `${mol.size * 32}px`, 
                height: `${mol.size * 32}px`,
                backgroundColor: `${mol.color}30`, 
                border: `3px solid ${mol.color}` 
              }}
            >
              <Atom className="w-1/2 h-1/2" style={{ color: mol.color }} />
            </div>
            <span className="text-lg font-semibold text-white">{mol.name}</span>
            <span className="text-base text-white/60 mt-1">{mol.label}</span>
          </motion.div>
        ))}
      </div>
      <p className="text-white/50 text-center mt-4">Peptides occupy a unique middle ground - larger than amino acids but smaller than proteins</p>
    </div>
  );
}

function PeptideBondFormationVisual() {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
      <h3 className="text-xl font-semibold text-white">How Peptide Bonds Form</h3>
      <div className="flex items-center gap-4 flex-wrap justify-center">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-2 p-5 rounded-xl bg-[#E7FB10]/10 border border-[#E7FB10]/30"
        >
          <span className="text-[#E7FB10] font-mono text-lg">NH₂-CHR-</span>
          <span className="text-[#ef4444] font-mono text-lg font-bold">COOH</span>
        </motion.div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
          className="text-white/50 text-2xl font-bold"
        >
          +
        </motion.div>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-2 p-5 rounded-xl bg-[#21d8ff]/10 border border-[#21d8ff]/30"
        >
          <span className="text-[#22c55e] font-mono text-lg font-bold">H₂N</span>
          <span className="text-[#21d8ff] font-mono text-lg">-CHR-COOH</span>
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-3"
      >
        <ArrowDown className="w-8 h-8 text-white/50" />
        <span className="text-white/50 text-lg">releases H₂O</span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="p-6 rounded-xl bg-[#22c55e]/10 border-2 border-[#22c55e]/40"
      >
        <span className="text-[#E7FB10] font-mono text-xl">NH₂-CHR-</span>
        <span className="text-[#22c55e] font-mono text-xl font-bold">CO-NH</span>
        <span className="text-[#21d8ff] font-mono text-xl">-CHR-COOH</span>
      </motion.div>
      <p className="text-base text-white/60 text-center max-w-lg">The peptide bond (CO-NH) forms through dehydration synthesis, releasing a water molecule</p>
    </div>
  );
}

function BiologicalRolesVisual() {
  const roles = [
    { icon: Heart, label: "Hormones", example: "Insulin, Oxytocin", color: "#ef4444" },
    { icon: Brain, label: "Neurotransmitters", example: "Endorphins", color: "#9d4edd" },
    { icon: Shield, label: "Antimicrobials", example: "Defensins", color: "#22c55e" },
    { icon: Zap, label: "Signaling", example: "Growth factors", color: "#E7FB10" },
  ];

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
      <h3 className="text-xl font-semibold text-white">Biological Roles of Peptides</h3>
      <div className="grid grid-cols-2 gap-6 w-full">
        {roles.map((role, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.15 }}
            className="p-6 rounded-xl border text-center"
            style={{ backgroundColor: `${role.color}10`, borderColor: `${role.color}30` }}
          >
            <role.icon className="w-12 h-12 mx-auto mb-3" style={{ color: role.color }} />
            <p className="font-semibold text-white text-lg">{role.label}</p>
            <p className="text-base text-white/60 mt-2">{role.example}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function RUOComplianceFlowchartVisual() {
  const steps = [
    { icon: ShoppingCart, label: "Acquire RUO Compound", desc: "Purchase from verified supplier", color: "#21d8ff" },
    { icon: FileCheck, label: "Verify COA & Labels", desc: "Check purity and documentation", color: "#E7FB10" },
    { icon: Building2, label: "Use in Lab Setting Only", desc: "Never for human/animal use", color: "#9d4edd" },
    { icon: ClipboardList, label: "Document All Usage", desc: "Maintain detailed records", color: "#22c55e" },
  ];

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
      <h3 className="text-xl font-semibold text-white mb-2">RUO Compliance Workflow</h3>
      {steps.map((step, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.2 }}
          className="flex items-center gap-4 w-full"
        >
          <div className="flex items-center gap-4 flex-1 p-4 rounded-xl border"
            style={{ backgroundColor: `${step.color}10`, borderColor: `${step.color}30` }}
          >
            <div className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${step.color}20` }}
            >
              <step.icon className="w-7 h-7" style={{ color: step.color }} />
            </div>
            <div>
              <span className="text-white text-lg font-medium block">{step.label}</span>
              <span className="text-white/50 text-sm">{step.desc}</span>
            </div>
          </div>
          {idx < steps.length - 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.2 + 0.1 }}
              className="absolute right-1/2 transform translate-x-1/2"
            >
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

function RegulatoryPyramidVisual() {
  const levels = [
    { label: "FDA Approved Drugs", status: "Clinical Use", color: "#22c55e", width: "40%" },
    { label: "Investigational New Drugs", status: "Clinical Trials", color: "#E7FB10", width: "60%" },
    { label: "Research Use Only (RUO)", status: "Laboratory Only", color: "#21d8ff", width: "80%" },
    { label: "Raw Materials", status: "Synthesis", color: "#9d4edd", width: "100%" },
  ];

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
      <h3 className="text-xl font-semibold text-white">Regulatory Classification Pyramid</h3>
      <div className="flex flex-col items-center gap-3 w-full">
        {levels.map((level, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: idx * 0.15 }}
            className="flex flex-col items-center justify-center p-5 rounded-xl border text-center"
            style={{ 
              width: level.width, 
              backgroundColor: `${level.color}10`, 
              borderColor: `${level.color}30` 
            }}
          >
            <span className="text-white text-lg font-semibold">{level.label}</span>
            <span className="text-base text-white/60 mt-1">{level.status}</span>
          </motion.div>
        ))}
      </div>
      <p className="text-white/50 mt-2">Revive Research products are in the RUO category</p>
    </div>
  );
}

function OrderProcessFlowVisual() {
  const steps = [
    { icon: Search, label: "Research", desc: "Select peptide", color: "#9d4edd" },
    { icon: ShoppingCart, label: "Order", desc: "Place order", color: "#E7FB10" },
    { icon: CreditCard, label: "Payment", desc: "Secure checkout", color: "#21d8ff" },
    { icon: Truck, label: "Ship", desc: "Cold chain", color: "#22c55e" },
    { icon: Box, label: "Receive", desc: "Inspect & store", color: "#f97316" },
  ];

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-3xl">
      <h3 className="text-xl font-semibold text-white">Order Process Flow</h3>
      <div className="flex items-center justify-center gap-3 w-full py-4">
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.12 }}
            className="flex items-center"
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: `${step.color}20`, border: `2px solid ${step.color}40` }}
              >
                <step.icon className="w-8 h-8" style={{ color: step.color }} />
              </div>
              <span className="text-base font-semibold text-white">{step.label}</span>
              <span className="text-sm text-white/60">{step.desc}</span>
            </div>
            {idx < steps.length - 1 && (
              <ChevronRight className="w-6 h-6 text-white/40 mx-2" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PurityScaleVisual() {
  const grades = [
    { pct: 95, label: "Standard", color: "#f97316" },
    { pct: 98, label: "Research", color: "#E7FB10" },
    { pct: 99, label: "High", color: "#22c55e" },
  ];

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl px-8">
      <h3 className="text-xl font-semibold text-white">Purity Grade Comparison</h3>
      <div className="relative w-full h-8 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "98%" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #f97316 0%, #E7FB10 50%, #22c55e 100%)" }}
        />
      </div>
      <div className="flex justify-between w-full">
        {grades.map((g, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + idx * 0.2 }}
            className="flex flex-col items-center"
          >
            <span className="text-3xl font-bold" style={{ color: g.color }}>{g.pct}%</span>
            <span className="text-base text-white/60 mt-1">{g.label}</span>
          </motion.div>
        ))}
      </div>
      <p className="text-white/50 text-center mt-4">Higher purity grades are essential for sensitive research applications</p>
    </div>
  );
}

function HPLCChromatogramVisual() {
  return (
    <div className="flex flex-col items-center w-full max-w-3xl px-4">
      <h3 className="text-xl font-semibold text-white mb-6">HPLC Chromatogram Analysis</h3>
      <div className="relative w-full h-64 bg-[#0a0a0f] rounded-xl border border-white/20 p-6">
        <svg viewBox="0 0 400 120" className="w-full h-full">
          <line x1="40" y1="100" x2="380" y2="100" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          <line x1="40" y1="10" x2="40" y2="100" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          <text x="20" y="60" fill="rgba(255,255,255,0.6)" fontSize="12" transform="rotate(-90, 20, 60)">mAU</text>
          <text x="210" y="115" fill="rgba(255,255,255,0.6)" fontSize="12">Time (min)</text>
          {[60, 120, 180, 240, 300, 360].map((x, i) => (
            <g key={i}>
              <line x1={x} y1="100" x2={x} y2="105" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <text x={x} y="115" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle">{i + 1}</text>
            </g>
          ))}
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.5 }}
            d="M 40 98 Q 80 98 100 95 Q 140 90 180 75 Q 200 50 210 15 Q 215 8 220 15 Q 240 50 260 75 Q 300 90 340 95 Q 360 97 380 98"
            fill="none"
            stroke="#22c55e"
            strokeWidth="3"
          />
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
            d="M 40 98 Q 80 98 100 95 Q 120 92 130 80 Q 140 70 150 80 Q 160 88 180 95 Q 200 98 220 98"
            fill="none"
            stroke="#f97316"
            strokeWidth="2.5"
            opacity="0.7"
          />
          <motion.circle
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2, type: "spring" }}
            cx="215" cy="12" r="6" fill="#22c55e"
          />
          <motion.text
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2 }}
            x="230" y="18" fill="#22c55e" fontSize="14" fontWeight="bold"
          >
            98.7%
          </motion.text>
        </svg>
      </div>
      <div className="flex gap-8 mt-6">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-[#22c55e]" />
          <span className="text-base text-white/70">Target Peptide</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-[#f97316]" />
          <span className="text-base text-white/70">Impurities</span>
        </div>
      </div>
      <p className="text-white/50 text-center mt-4">The main peak represents your target compound - taller and sharper peaks indicate higher purity</p>
    </div>
  );
}

function StorageVisual() {
  return (
    <div className="flex gap-6 justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center p-5 rounded-xl bg-[#21d8ff]/10 border border-[#21d8ff]/20"
      >
        <Snowflake className="w-10 h-10 text-[#21d8ff] mb-2" />
        <span className="text-2xl font-bold text-[#21d8ff]">-20°C</span>
        <span className="text-xs text-white/50 mt-1">Lyophilized</span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col items-center p-5 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/20"
      >
        <Thermometer className="w-10 h-10 text-[#22c55e] mb-2" />
        <span className="text-2xl font-bold text-[#22c55e]">2-8°C</span>
        <span className="text-xs text-white/50 mt-1">Reconstituted</span>
      </motion.div>
    </div>
  );
}

function LyophilizationVisual() {
  const stages = [
    { icon: Droplets, label: "Solution", color: "#21d8ff" },
    { icon: Snowflake, label: "Frozen", color: "#60a5fa" },
    { icon: TrendingUp, label: "Vacuum", color: "#E7FB10" },
    { icon: Sparkles, label: "Powder", color: "#22c55e" },
  ];

  return (
    <div className="flex items-center justify-center gap-2">
      {stages.map((stage, idx) => (
        <motion.div
          key={idx}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: idx * 0.2, type: "spring" }}
          className="flex items-center"
        >
          <div
            className="w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1"
            style={{ backgroundColor: `${stage.color}20`, border: `1px solid ${stage.color}40` }}
          >
            <stage.icon className="w-6 h-6" style={{ color: stage.color }} />
            <span className="text-[9px] text-white/50">{stage.label}</span>
          </div>
          {idx < stages.length - 1 && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: idx * 0.2 + 0.15 }}
              className="w-4 h-0.5 bg-white/20"
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}

function LyophilizationDetailedVisual() {
  const stages = [
    { 
      icon: Droplets, 
      label: "Pre-Freezing", 
      temp: "-40°C",
      desc: "Peptide solution frozen solid",
      color: "#21d8ff" 
    },
    { 
      icon: Snowflake, 
      label: "Primary Drying", 
      temp: "-20°C",
      desc: "Sublimation of ice crystals",
      color: "#60a5fa" 
    },
    { 
      icon: Waves, 
      label: "Secondary Drying", 
      temp: "+20°C",
      desc: "Removal of bound water",
      color: "#E7FB10" 
    },
    { 
      icon: Sparkles, 
      label: "Final Product", 
      temp: "Room temp",
      desc: "Stable lyophilized cake",
      color: "#22c55e" 
    },
  ];

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
      <h3 className="text-xl font-semibold text-white">Lyophilization Process Stages</h3>
      <div className="flex flex-col gap-4 w-full">
        {stages.map((stage, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.15 }}
            className="flex items-center gap-5"
          >
            <div className="flex items-center justify-center w-10">
              <span className="text-white/40 text-lg font-mono">{idx + 1}</span>
            </div>
            <div
              className="flex-1 flex items-center gap-5 p-5 rounded-xl border"
              style={{ backgroundColor: `${stage.color}10`, borderColor: `${stage.color}30` }}
            >
              <stage.icon className="w-10 h-10 flex-shrink-0" style={{ color: stage.color }} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-white text-lg font-semibold">{stage.label}</span>
                  <span className="text-base font-mono" style={{ color: stage.color }}>{stage.temp}</span>
                </div>
                <p className="text-base text-white/60 mt-1">{stage.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function DegradationFactorsVisual() {
  const factors = [
    { icon: Thermometer, label: "Heat", impact: "Denaturation", color: "#ef4444" },
    { icon: Eye, label: "Light (UV)", impact: "Oxidation", color: "#f97316" },
    { icon: Droplets, label: "Moisture", impact: "Hydrolysis", color: "#21d8ff" },
    { icon: Activity, label: "pH Changes", impact: "Cleavage", color: "#9d4edd" },
  ];

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-3xl">
      <h3 className="text-xl font-semibold text-white">Environmental Degradation Factors</h3>
      <div className="grid grid-cols-2 gap-6 w-full">
        {factors.map((factor, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center gap-5 p-6 rounded-xl border"
            style={{ backgroundColor: `${factor.color}10`, borderColor: `${factor.color}30` }}
          >
            <div className="w-16 h-16 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${factor.color}20` }}
            >
              <factor.icon className="w-8 h-8" style={{ color: factor.color }} />
            </div>
            <div>
              <p className="text-white text-xl font-semibold">{factor.label}</p>
              <p className="text-base text-white/60 mt-1">{factor.impact}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <p className="text-white/50 text-center mt-2">Protect your peptides from these common environmental stressors</p>
    </div>
  );
}

function ReconstitutionStepsVisual() {
  const steps = [
    { num: 1, text: "Allow vial to reach room temp", icon: Timer, color: "#9d4edd" },
    { num: 2, text: "Add solvent down vial wall", icon: Syringe, color: "#21d8ff" },
    { num: 3, text: "Let peptide dissolve (2-5 min)", icon: Clock, color: "#E7FB10" },
    { num: 4, text: "Swirl gently - never shake", icon: Waves, color: "#22c55e" },
  ];

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
      <h3 className="text-xl font-semibold text-white">Reconstitution Steps</h3>
      <div className="flex flex-col gap-4 w-full">
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.15 }}
            className="flex items-center gap-5 p-5 rounded-xl border"
            style={{ backgroundColor: `${step.color}10`, borderColor: `${step.color}30` }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl"
              style={{ backgroundColor: `${step.color}20`, color: step.color }}
            >
              {step.num}
            </div>
            <div className="flex-1 flex items-center gap-4">
              <step.icon className="w-7 h-7" style={{ color: step.color }} />
              <span className="text-white text-lg">{step.text}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function COAAnatomyVisual() {
  const sections = [
    { label: "Product ID", desc: "Name, catalog #, batch", color: "#E7FB10", y: 10 },
    { label: "Specifications", desc: "Expected values", color: "#21d8ff", y: 35 },
    { label: "Test Results", desc: "Actual measurements", color: "#22c55e", y: 60 },
    { label: "QC Approval", desc: "Signatures, dates", color: "#9d4edd", y: 85 },
  ];

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
      <h3 className="text-xl font-semibold text-white">Certificate of Analysis Anatomy</h3>
      <div className="flex gap-8 items-start w-full">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-56 h-72 rounded-xl bg-white/5 border border-white/20 relative overflow-hidden"
        >
          <div className="absolute top-3 left-3 right-3 h-3 bg-[#E7FB10]/30 rounded" />
          <div className="absolute top-8 left-3 right-3 space-y-1.5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-1.5 bg-white/10 rounded" />
            ))}
          </div>
          <div className="absolute top-20 left-3 right-3 h-20 bg-[#21d8ff]/10 rounded border border-[#21d8ff]/20" />
          <div className="absolute top-44 left-3 right-3 h-12 bg-[#22c55e]/10 rounded border border-[#22c55e]/20" />
          <div className="absolute bottom-3 left-3 right-3 h-6 bg-[#9d4edd]/20 rounded" />
        </motion.div>
        <div className="flex-1 space-y-4">
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.15 }}
              className="flex items-center gap-4 p-3 rounded-lg"
              style={{ backgroundColor: `${section.color}10` }}
            >
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: section.color }} />
              <div>
                <span className="text-white text-lg font-medium">{section.label}</span>
                <span className="text-white/60 text-base ml-3">{section.desc}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MassSpecVisual() {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
      <h3 className="text-xl font-semibold text-white">Mass Spectrometry Analysis</h3>
      <div className="relative h-48 bg-[#0a0a0f] rounded-xl border border-white/10 p-6 w-full">
        <svg viewBox="0 0 300 100" className="w-full h-full">
          <line x1="30" y1="85" x2="290" y2="85" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="30" y1="10" x2="30" y2="85" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <text x="8" y="50" fill="rgba(255,255,255,0.5)" fontSize="9" transform="rotate(-90, 8, 50)">Intensity</text>
          <text x="160" y="98" fill="rgba(255,255,255,0.5)" fontSize="9">m/z</text>
          
          <motion.rect
            initial={{ height: 0 }}
            animate={{ height: 60 }}
            transition={{ delay: 0.3 }}
            x="140" y="25" width="12" fill="#22c55e"
          />
          <motion.rect
            initial={{ height: 0 }}
            animate={{ height: 20 }}
            transition={{ delay: 0.5 }}
            x="100" y="65" width="8" fill="#E7FB10" opacity="0.7"
          />
          <motion.rect
            initial={{ height: 0 }}
            animate={{ height: 16 }}
            transition={{ delay: 0.6 }}
            x="180" y="69" width="8" fill="#E7FB10" opacity="0.7"
          />
          <motion.rect
            initial={{ height: 0 }}
            animate={{ height: 10 }}
            transition={{ delay: 0.7 }}
            x="220" y="75" width="6" fill="#f97316" opacity="0.5"
          />
          
          <motion.text
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            x="146" y="18" fill="#22c55e" fontSize="10" textAnchor="middle"
          >
            [M+H]⁺
          </motion.text>
        </svg>
      </div>
      <div className="flex justify-center gap-8 mt-2">
        <span className="text-base text-white/70">
          <span className="text-[#22c55e]">●</span> Target mass
        </span>
        <span className="text-base text-white/70">
          <span className="text-[#E7FB10]">●</span> Adducts
        </span>
        <span className="text-base text-white/70">
          <span className="text-[#f97316]">●</span> Fragments
        </span>
      </div>
    </div>
  );
}

function SafetyEquipmentVisual() {
  const items = [
    { icon: Eye, label: "Safety Goggles", color: "#21d8ff" },
    { icon: Shield, label: "Lab Gloves", color: "#22c55e" },
    { icon: ShieldCheck, label: "Lab Coat", color: "#E7FB10" },
  ];

  return (
    <div className="flex items-center justify-center gap-4">
      {items.map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.15 }}
          className="flex flex-col items-center gap-2"
        >
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${item.color}20`, border: `1px solid ${item.color}40` }}
          >
            <item.icon className="w-7 h-7" style={{ color: item.color }} />
          </div>
          <span className="text-xs text-white/50">{item.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

function LabSetupVisual() {
  const zones = [
    { label: "Clean Zone", desc: "Peptide handling", color: "#22c55e", icon: Sparkles },
    { label: "Prep Zone", desc: "Reconstitution", color: "#21d8ff", icon: FlaskConical },
    { label: "Storage Zone", desc: "Refrigeration", color: "#E7FB10", icon: Snowflake },
    { label: "Waste Zone", desc: "Disposal", color: "#ef4444", icon: AlertTriangle },
  ];

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
      <h3 className="text-xl font-semibold text-white">Laboratory Zone Setup</h3>
      <div className="grid grid-cols-2 gap-6 w-full">
        {zones.map((zone, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 rounded-xl border"
            style={{ backgroundColor: `${zone.color}10`, borderColor: `${zone.color}30` }}
          >
            <div className="flex items-center gap-4 mb-2">
              <zone.icon className="w-8 h-8" style={{ color: zone.color }} />
              <span className="text-white text-xl font-semibold">{zone.label}</span>
            </div>
            <p className="text-base text-white/60">{zone.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function DocumentationTemplateVisual() {
  const fields = [
    { label: "Date", value: "2024-01-15", color: "#21d8ff" },
    { label: "Product", value: "BPC-157 5mg", color: "#E7FB10" },
    { label: "Batch #", value: "RR-2024-0115", color: "#9d4edd" },
    { label: "Storage Temp", value: "-20°C ✓", color: "#22c55e" },
    { label: "COA Verified", value: "Yes ✓", color: "#22c55e" },
  ];

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-xl">
      <h3 className="text-xl font-semibold text-white">Research Log Entry Template</h3>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full p-6 rounded-xl bg-white/5 border border-white/10"
      >
        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/10">
          <ClipboardList className="w-7 h-7 text-[#E7FB10]" />
          <span className="text-white text-lg font-semibold">Research Log Entry</span>
        </div>
        <div className="space-y-4">
          {fields.map((field, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="flex justify-between items-center p-3 rounded-lg"
              style={{ backgroundColor: `${field.color}10` }}
            >
              <span className="text-white/70 text-base">{field.label}:</span>
              <span className="text-lg font-mono" style={{ color: field.color }}>{field.value}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function ResearchWorkflowVisual() {
  const steps = [
    { icon: Search, label: "Plan", color: "#9d4edd" },
    { icon: ShoppingCart, label: "Acquire", color: "#E7FB10" },
    { icon: Thermometer, label: "Store", color: "#21d8ff" },
    { icon: Droplets, label: "Prepare", color: "#22c55e" },
    { icon: Microscope, label: "Research", color: "#f97316" },
    { icon: ClipboardList, label: "Document", color: "#ef4444" },
  ];

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-3xl">
      <h3 className="text-xl font-semibold text-white">Complete Research Workflow</h3>
      <div className="flex flex-wrap justify-center gap-4">
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center"
          >
            <div className="flex flex-col items-center">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${step.color}20`, border: `2px solid ${step.color}40` }}
              >
                <step.icon className="w-8 h-8" style={{ color: step.color }} />
              </div>
              <span className="text-base text-white/70 mt-2">{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <ArrowRight className="w-6 h-6 text-white/30 mx-2" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function TroubleshootingFlowVisual() {
  const issues = [
    { 
      problem: "Won't dissolve", 
      solutions: ["Warm to room temp", "Try different pH", "Use sonication"],
      color: "#21d8ff" 
    },
    { 
      problem: "Cloudy solution", 
      solutions: ["Check concentration", "Adjust pH", "Filter"],
      color: "#E7FB10" 
    },
    { 
      problem: "No activity", 
      solutions: ["Verify storage", "Check COA", "Fresh reconstitution"],
      color: "#f97316" 
    },
  ];

  return (
    <div className="flex flex-col gap-4 w-full max-w-lg">
      {issues.map((issue, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.2 }}
          className="p-3 rounded-xl border"
          style={{ backgroundColor: `${issue.color}10`, borderColor: `${issue.color}30` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4" style={{ color: issue.color }} />
            <span className="text-white font-medium text-sm">{issue.problem}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {issue.solutions.map((sol, sidx) => (
              <span
                key={sidx}
                className="text-xs px-2 py-1 rounded-md bg-white/5 text-white/60"
              >
                → {sol}
              </span>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function CompletionBadgeVisual() {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="relative"
      >
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#22c55e] to-[#E7FB10] p-1">
          <div className="w-full h-full rounded-full bg-[#1a1a1f] flex items-center justify-center">
            <Award className="w-16 h-16 text-[#E7FB10]" />
          </div>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#22c55e] text-white text-xs font-bold"
        >
          COMPLETE
        </motion.div>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-6 text-white font-semibold text-lg"
      >
        Peptide Research Professional
      </motion.p>
    </div>
  );
}

export const LESSON_SLIDES: Record<string, Slide[]> = {
  "welcome": [
    {
      title: "Welcome",
      content: (
        <SlideHero
          icon={Compass}
          title="Welcome to Peptide Academy"
          subtitle="Your journey to becoming a knowledgeable peptide researcher starts here."
          color="#21d8ff"
        />
      ),
    },
    {
      title: "Why This Matters",
      content: (
        <SlideText
          title="The Importance of Education"
          paragraphs={[
            "Peptide research requires precision, knowledge, and responsibility. Unlike many fields, there's no room for guesswork when working with research compounds.",
            "This academy will transform you from a beginner to a confident researcher who understands not just the 'what' but the 'why' behind every protocol.",
            "Each module builds upon the last, creating a solid foundation that will serve you throughout your research career."
          ]}
        />
      ),
    },
    {
      title: "Your Journey",
      content: (
        <SlideInfoCard
          title="Four Modules to Mastery"
          items={[
            { icon: Compass, title: "Orientation", description: "Understand peptides, compliance, and legal frameworks", color: "#21d8ff" },
            { icon: BookOpen, title: "Core Foundations", description: "Master purity, storage, stability, and reconstitution", color: "#E7FB10" },
            { icon: FlaskConical, title: "Research Skills", description: "Learn COA interpretation, safety, and documentation", color: "#9d4edd" },
            { icon: Award, title: "Lab Confidence", description: "Apply everything in real research workflows", color: "#22c55e" },
          ]}
        />
      ),
    },
    {
      title: "How Learning Works",
      content: (
        <SlideInfoCard
          title="Earn XP & Achievements"
          items={[
            { icon: Zap, title: "+25 XP per Lesson", description: "Complete lessons to accumulate experience points", color: "#E7FB10" },
            { icon: Award, title: "Achievement Badges", description: "Unlock special badges for milestones reached", color: "#22c55e" },
            { icon: TrendingUp, title: "Track Progress", description: "Visual progress rings show your advancement", color: "#21d8ff" },
          ]}
        />
      ),
    },
    {
      title: "Commitment",
      content: (
        <SlideCallout type="info" title="Your Commitment">
          By proceeding, you commit to learning these materials thoroughly. Peptide research demands responsibility — the knowledge you gain here protects both you and your research integrity.
        </SlideCallout>
      ),
    },
    {
      title: "Let's Begin",
      content: (
        <SlideCallout type="tip" title="Pro Tip">
          Complete lessons in order for the best learning experience. Each lesson builds upon previous concepts. Take notes — you'll reference this knowledge throughout your research career.
        </SlideCallout>
      ),
    },
  ],

  "what-is-peptide": [
    {
      title: "Introduction",
      content: (
        <SlideHero
          icon={Beaker}
          title="What is a Peptide?"
          subtitle="Discover the molecular building blocks that drive biological processes."
          color="#E7FB10"
        />
      ),
    },
    {
      title: "Definition",
      content: (
        <SlideText
          title="The Scientific Definition"
          paragraphs={[
            "A peptide is a short chain of amino acids linked by covalent chemical bonds called peptide bonds. They typically contain between 2-50 amino acid residues.",
            "Unlike proteins (which are longer polypeptide chains), peptides are small enough to be synthesized in laboratories with high precision and purity.",
            "In the body, peptides serve as signaling molecules, hormones, neurotransmitters, and antimicrobial agents — making them valuable tools for research."
          ]}
        />
      ),
    },
    {
      title: "Size Matters",
      content: (
        <SlideVisual caption="Peptides occupy the space between simple amino acids and complex proteins">
          <MolecularSizeComparisonVisual />
        </SlideVisual>
      ),
    },
    {
      title: "Peptide Structure",
      content: (
        <SlideVisual caption="Amino acids linked together form a peptide chain">
          <PeptideChainVisual />
        </SlideVisual>
      ),
    },
    {
      title: "Bond Formation",
      content: (
        <SlideVisual caption="Peptide bonds form through dehydration synthesis">
          <PeptideBondFormationVisual />
        </SlideVisual>
      ),
    },
    {
      title: "Biological Roles",
      content: (
        <SlideVisual caption="Peptides serve diverse functions in biological systems">
          <BiologicalRolesVisual />
        </SlideVisual>
      ),
    },
    {
      title: "Key Characteristics",
      content: (
        <SlideInfoCard
          title="What Makes Peptides Special"
          items={[
            { icon: Target, title: "High Specificity", description: "Each peptide targets specific receptors with precision", color: "#E7FB10" },
            { icon: Zap, title: "Rapid Action", description: "Small size allows quick cellular uptake and signaling", color: "#21d8ff" },
            { icon: FlaskConical, title: "Synthesizable", description: "Can be manufactured with precise amino acid sequences", color: "#22c55e" },
          ]}
        />
      ),
    },
    {
      title: "Key Takeaway",
      content: (
        <SlideCallout type="info" title="Remember">
          Peptides are powerful research tools that bridge simple chemistry and complex biology. Their precise structure determines their specific function — which is why purity and handling are so critical.
        </SlideCallout>
      ),
    },
  ],

  "research-only": [
    {
      title: "Introduction",
      content: (
        <SlideHero
          icon={ShieldCheck}
          title="Research Use Only"
          subtitle="Understanding RUO classification is essential for every responsible researcher."
          color="#22c55e"
        />
      ),
    },
    {
      title: "Critical Understanding",
      content: (
        <SlideCallout type="warning" title="Critical Warning">
          All peptides from Revive Research are classified as Research Use Only (RUO). They are NOT approved for human or animal use, consumption, or therapeutic application.
        </SlideCallout>
      ),
    },
    {
      title: "What RUO Means",
      content: (
        <SlideText
          title="The RUO Classification"
          paragraphs={[
            "Research Use Only (RUO) is a regulatory classification indicating that a product is intended solely for laboratory research and development purposes.",
            "RUO products have not undergone the rigorous testing required for FDA approval. They are not evaluated for safety or efficacy in humans or animals.",
            "This classification allows researchers access to advanced compounds for scientific investigation while maintaining clear legal boundaries."
          ]}
        />
      ),
    },
    {
      title: "Compliance Flow",
      content: (
        <SlideVisual caption="The proper workflow for RUO compound handling">
          <RUOComplianceFlowchartVisual />
        </SlideVisual>
      ),
    },
    {
      title: "Proper Uses",
      content: (
        <SlideComparison
          title="Appropriate vs. Prohibited Uses"
          left={{
            label: "Acceptable Uses",
            items: ["In-vitro cell studies", "Analytical method development", "Academic research", "Quality control testing"],
            color: "#22c55e"
          }}
          right={{
            label: "Prohibited Uses",
            items: ["Human consumption", "Animal administration", "Therapeutic use", "Diagnostic testing"],
            color: "#ef4444"
          }}
        />
      ),
    },
    {
      title: "Labeling Requirements",
      content: (
        <SlideInfoCard
          title="RUO Product Labels Must Include"
          items={[
            { icon: FileText, title: "Clear RUO Statement", description: "\"For Research Use Only. Not for use in diagnostic procedures.\"", color: "#E7FB10" },
            { icon: AlertTriangle, title: "Not for Human Use", description: "Explicit statement prohibiting human/animal consumption", color: "#ef4444" },
            { icon: Package, title: "Product Identification", description: "Batch number, lot number, and manufacturing date", color: "#21d8ff" },
          ]}
        />
      ),
    },
    {
      title: "Your Responsibility",
      content: (
        <SlideInfoCard
          items={[
            { icon: ClipboardList, title: "Document Everything", description: "Maintain records of all RUO compound usage", color: "#21d8ff" },
            { icon: Building2, title: "Laboratory Setting Only", description: "Use only in appropriate research environments", color: "#9d4edd" },
            { icon: Users, title: "Inform Collaborators", description: "Ensure all team members understand RUO restrictions", color: "#22c55e" },
          ]}
        />
      ),
    },
    {
      title: "Commitment",
      content: (
        <SlideCallout type="info" title="Researcher Commitment">
          By purchasing and using RUO compounds, you accept full responsibility for ensuring compliant use. Violations can result in legal consequences and damage to research integrity.
        </SlideCallout>
      ),
    },
  ],

  "legal-landscape": [
    {
      title: "Introduction",
      content: (
        <SlideHero
          icon={Scale}
          title="Legal Landscape"
          subtitle="Navigate the regulatory framework that governs peptide research."
          color="#9d4edd"
        />
      ),
    },
    {
      title: "Regulatory Context",
      content: (
        <SlideText
          title="Understanding the Framework"
          paragraphs={[
            "The research peptide industry operates within a specific regulatory space that differs significantly from pharmaceutical regulation.",
            "Unlike FDA-approved drugs that undergo years of clinical trials, RUO compounds are sold specifically for research purposes and are not subject to the same approval processes.",
            "Understanding these distinctions helps you operate legally and ethically as a researcher."
          ]}
        />
      ),
    },
    {
      title: "Regulatory Hierarchy",
      content: (
        <SlideVisual caption="Where RUO compounds fit in the regulatory pyramid">
          <RegulatoryPyramidVisual />
        </SlideVisual>
      ),
    },
    {
      title: "FDA Status",
      content: (
        <SlideInfoCard
          title="FDA & Research Peptides"
          items={[
            { icon: X, title: "Not FDA Approved", description: "Research peptides have not been evaluated for safety or efficacy", color: "#ef4444" },
            { icon: FileCheck, title: "RUO Classification", description: "Legal for sale and use strictly in research settings", color: "#E7FB10" },
            { icon: ShieldCheck, title: "Supplier Compliance", description: "Quality vendors follow GMP-like manufacturing standards", color: "#22c55e" },
          ]}
        />
      ),
    },
    {
      title: "Your Legal Obligations",
      content: (
        <SlideInfoCard
          items={[
            { icon: ClipboardList, title: "Maintain Records", description: "Document purchase, storage, and usage of all compounds", color: "#21d8ff" },
            { icon: Building2, title: "Appropriate Setting", description: "Use only in legitimate research environments", color: "#9d4edd" },
            { icon: Lock, title: "Secure Storage", description: "Prevent unauthorized access to research compounds", color: "#E7FB10" },
            { icon: FileText, title: "Proper Disposal", description: "Follow local regulations for chemical waste disposal", color: "#22c55e" },
          ]}
        />
      ),
    },
    {
      title: "Varying Regulations",
      content: (
        <SlideCallout type="warning" title="Know Your Jurisdiction">
          Regulations vary by country, state, and even institution. Some peptides may be controlled substances in certain jurisdictions. Always verify local regulations before purchasing or using any research compound.
        </SlideCallout>
      ),
    },
    {
      title: "Stay Compliant",
      content: (
        <SlideCallout type="tip" title="Best Practices">
          Keep all COAs on file. Maintain a log of compound usage. Work only in appropriate research settings. When in doubt, consult with your institution's compliance office or legal counsel.
        </SlideCallout>
      ),
    },
  ],

  "your-first-order": [
    {
      title: "Introduction",
      content: (
        <SlideHero
          icon={ShoppingCart}
          title="Your First Order"
          subtitle="Everything you need to know about ordering, receiving, and storing research peptides."
          color="#21d8ff"
        />
      ),
    },
    {
      title: "Order Process",
      content: (
        <SlideVisual caption="The complete order-to-research workflow">
          <OrderProcessFlowVisual />
        </SlideVisual>
      ),
    },
    {
      title: "Selecting Products",
      content: (
        <SlideInfoCard
          title="Before You Order"
          items={[
            { icon: Search, title: "Research First", description: "Review literature to select appropriate peptides for your study", color: "#9d4edd" },
            { icon: FileCheck, title: "Check Specifications", description: "Verify purity levels meet your research requirements", color: "#E7FB10" },
            { icon: Package, title: "Quantity Planning", description: "Order appropriate amounts to minimize waste and maximize stability", color: "#21d8ff" },
          ]}
        />
      ),
    },
    {
      title: "Shipping Considerations",
      content: (
        <SlideInfoCard
          title="Temperature-Controlled Delivery"
          items={[
            { icon: Snowflake, title: "Cold Chain Shipping", description: "Peptides ship with ice packs to maintain stability", color: "#21d8ff" },
            { icon: Timer, title: "Expedited Options", description: "Same-day or 24-hour shipping prevents degradation", color: "#E7FB10" },
            { icon: Package, title: "Insulated Packaging", description: "Specialized containers maintain temperature during transit", color: "#22c55e" },
          ]}
        />
      ),
    },
    {
      title: "Upon Arrival",
      content: (
        <SlideInfoCard
          title="Receiving Your Order"
          items={[
            { icon: Eye, title: "Inspect Packaging", description: "Check for damage, temperature indicator status", color: "#21d8ff" },
            { icon: FileCheck, title: "Verify Contents", description: "Match order confirmation against received items", color: "#E7FB10" },
            { icon: Thermometer, title: "Store Immediately", description: "Transfer to appropriate temperature storage within 30 minutes", color: "#22c55e" },
            { icon: ClipboardList, title: "Log Receipt", description: "Record batch numbers, receipt date, and condition", color: "#9d4edd" },
          ]}
        />
      ),
    },
    {
      title: "Document Everything",
      content: (
        <SlideVisual caption="Sample documentation for incoming orders">
          <DocumentationTemplateVisual />
        </SlideVisual>
      ),
    },
    {
      title: "Pro Tips",
      content: (
        <SlideCallout type="tip" title="First Order Best Practices">
          Plan your order to arrive when you can receive it personally. Have storage prepared in advance. Immediately verify COA information matches your order. Take photos of packaging condition upon arrival for your records.
        </SlideCallout>
      ),
    },
    {
      title: "Orientation Quiz",
      content: (
        <QuizSlide
          moduleTitle="Orientation"
          questions={[
            {
              question: "What does 'RUO' stand for?",
              options: ["Ready for Use Only", "Research Use Only", "Registered User Option", "Retail Unit Order"],
              correctIndex: 1,
            },
            {
              question: "What should you do immediately after receiving peptides?",
              options: ["Leave at room temperature", "Store in appropriate temperature", "Open all vials to inspect", "Mix with solvent right away"],
              correctIndex: 1,
            },
            {
              question: "Why is proper documentation important?",
              options: ["It's optional for researchers", "To impress colleagues", "For compliance and reproducibility", "Only for large orders"],
              correctIndex: 2,
            },
          ]}
        />
      ),
    },
  ],

  "purity-basics": [
    {
      title: "Introduction",
      content: (
        <SlideHero
          icon={FlaskConical}
          title="Purity Basics"
          subtitle="Why purity is the single most important factor in peptide research."
          color="#E7FB10"
        />
      ),
    },
    {
      title: "Why Purity Matters",
      content: (
        <SlideText
          title="The Foundation of Valid Research"
          paragraphs={[
            "Purity determines the reliability of your research results. Even small amounts of impurities can confound experimental data or produce unexpected biological effects.",
            "Higher purity means more of your sample is the target peptide, giving you better dose-response accuracy and reproducible results.",
            "Impurities can include synthesis byproducts, incomplete sequences, oxidized forms, or residual solvents — all of which can affect your research."
          ]}
        />
      ),
    },
    {
      title: "Purity Grades",
      content: (
        <SlideVisual caption="Different purity grades serve different research needs">
          <PurityScaleVisual />
        </SlideVisual>
      ),
    },
    {
      title: "HPLC Analysis",
      content: (
        <SlideVisual caption="How HPLC chromatography reveals purity">
          <HPLCChromatogramVisual />
        </SlideVisual>
      ),
    },
    {
      title: "Testing Methods",
      content: (
        <SlideInfoCard
          title="How Purity is Measured"
          items={[
            { icon: BarChart3, title: "HPLC", description: "High-Performance Liquid Chromatography separates and quantifies peptide content", color: "#22c55e" },
            { icon: Activity, title: "Mass Spectrometry", description: "Confirms molecular weight matches target peptide", color: "#21d8ff" },
            { icon: Microscope, title: "Amino Acid Analysis", description: "Verifies correct amino acid composition", color: "#9d4edd" },
          ]}
        />
      ),
    },
    {
      title: "Choosing Purity Level",
      content: (
        <SlideComparison
          title="Matching Purity to Research Needs"
          left={{
            label: "≥95% Purity",
            items: ["Preliminary studies", "Method development", "Training purposes", "Cost-sensitive projects"],
            color: "#f97316"
          }}
          right={{
            label: "≥98% Purity",
            items: ["Publication-quality research", "Quantitative studies", "Sensitive assays", "Reproducibility-critical work"],
            color: "#22c55e"
          }}
        />
      ),
    },
    {
      title: "Reading Purity Data",
      content: (
        <SlideInfoCard
          items={[
            { icon: Target, title: "Main Peak Area", description: "The percentage under the main HPLC peak represents purity", color: "#22c55e" },
            { icon: Eye, title: "Impurity Peaks", description: "Minor peaks indicate synthesis byproducts or degradation", color: "#f97316" },
            { icon: FileCheck, title: "COA Verification", description: "Always verify stated purity against COA chromatogram", color: "#E7FB10" },
          ]}
        />
      ),
    },
    {
      title: "Key Takeaway",
      content: (
        <SlideCallout type="info" title="The Bottom Line">
          For most research applications, 98%+ purity is recommended. Higher purity costs more but reduces experimental variables. Always match purity level to your specific research requirements.
        </SlideCallout>
      ),
    },
  ],

  "lyophilization": [
    {
      title: "Introduction",
      content: (
        <SlideHero
          icon={Snowflake}
          title="Lyophilization"
          subtitle="The freeze-drying process that makes peptide storage and shipping possible."
          color="#21d8ff"
        />
      ),
    },
    {
      title: "What is Lyophilization?",
      content: (
        <SlideText
          title="Freeze-Drying Explained"
          paragraphs={[
            "Lyophilization (freeze-drying) is a dehydration process that removes water from peptides by freezing them and then reducing pressure to allow ice to sublimate directly to vapor.",
            "This process preserves the peptide's molecular structure far better than conventional drying methods, which can cause denaturation through heat exposure.",
            "The resulting lyophilized powder is stable, easy to store, and can be reconstituted when needed for research."
          ]}
        />
      ),
    },
    {
      title: "The Process Overview",
      content: (
        <SlideVisual caption="From solution to stable powder">
          <LyophilizationVisual />
        </SlideVisual>
      ),
    },
    {
      title: "Detailed Stages",
      content: (
        <SlideVisual caption="Each stage serves a specific purpose in preservation">
          <LyophilizationDetailedVisual />
        </SlideVisual>
      ),
    },
    {
      title: "Why It Works",
      content: (
        <SlideInfoCard
          title="The Science Behind Stability"
          items={[
            { icon: Droplets, title: "Water Removal", description: "Without water, hydrolysis reactions cannot occur", color: "#21d8ff" },
            { icon: Snowflake, title: "Low Temperature", description: "Cold processing prevents heat-induced denaturation", color: "#60a5fa" },
            { icon: Lock, title: "Molecular Lock", description: "Dried peptides maintain their 3D structure until reconstitution", color: "#22c55e" },
          ]}
        />
      ),
    },
    {
      title: "Stability Benefits",
      content: (
        <SlideComparison
          title="Lyophilized vs. Solution Form"
          left={{
            label: "Lyophilized (Dry)",
            items: ["Years of stability at -20°C", "Easy shipping", "Minimal degradation", "Multiple reconstitutions possible"],
            color: "#22c55e"
          }}
          right={{
            label: "Solution (Wet)",
            items: ["Days to weeks stability", "Requires cold chain", "Ongoing hydrolysis", "Single use recommended"],
            color: "#f97316"
          }}
        />
      ),
    },
    {
      title: "Handling Lyophilized Peptides",
      content: (
        <SlideInfoCard
          items={[
            { icon: Timer, title: "Equilibrate First", description: "Let vial reach room temp before opening to prevent condensation", color: "#E7FB10" },
            { icon: Lock, title: "Minimize Exposure", description: "Open vials in a dry environment, reseal quickly", color: "#9d4edd" },
            { icon: Thermometer, title: "Return to Cold", description: "If not reconstituting immediately, return to -20°C storage", color: "#21d8ff" },
          ]}
        />
      ),
    },
    {
      title: "Key Insight",
      content: (
        <SlideCallout type="tip" title="Pro Tip">
          The white or fluffy appearance of lyophilized peptides is normal — it indicates a good freeze-dry process. Transparent or collapsed cakes may indicate processing issues. Always verify with the COA.
        </SlideCallout>
      ),
    },
  ],

  "stability": [
    {
      title: "Introduction",
      content: (
        <SlideHero
          icon={Thermometer}
          title="Peptide Stability"
          subtitle="Proper storage is the difference between reliable research and wasted resources."
          color="#22c55e"
        />
      ),
    },
    {
      title: "Why Stability Matters",
      content: (
        <SlideText
          title="Protecting Your Investment"
          paragraphs={[
            "Peptides are fragile molecules. Once degraded, they cannot be restored — the sample is lost along with the research potential it represented.",
            "Stability degradation can be invisible. A peptide may appear unchanged while its biological activity has diminished significantly.",
            "Proper storage practices protect both your research budget and the integrity of your experimental results."
          ]}
        />
      ),
    },
    {
      title: "Storage Requirements",
      content: (
        <SlideVisual caption="Optimal storage temperatures for different forms">
          <StorageVisual />
        </SlideVisual>
      ),
    },
    {
      title: "Degradation Factors",
      content: (
        <SlideVisual caption="Environmental factors that damage peptides">
          <DegradationFactorsVisual />
        </SlideVisual>
      ),
    },
    {
      title: "Temperature Impact",
      content: (
        <SlideInfoCard
          title="Temperature & Stability"
          items={[
            { icon: Snowflake, title: "-20°C (Freezer)", description: "Ideal for long-term lyophilized storage — years of stability", color: "#21d8ff" },
            { icon: Thermometer, title: "2-8°C (Refrigerator)", description: "Acceptable for reconstituted peptides — weeks of stability", color: "#22c55e" },
            { icon: AlertTriangle, title: "Room Temperature", description: "Avoid extended exposure — degradation accelerates rapidly", color: "#f97316" },
          ]}
        />
      ),
    },
    {
      title: "Light Protection",
      content: (
        <SlideInfoCard
          items={[
            { icon: Eye, title: "UV Damage", description: "Ultraviolet light causes oxidation and cross-linking reactions", color: "#ef4444" },
            { icon: Shield, title: "Amber Vials", description: "Tinted containers block harmful wavelengths", color: "#E7FB10" },
            { icon: Lock, title: "Dark Storage", description: "Keep peptides in dark refrigerators or wrapped in foil", color: "#9d4edd" },
          ]}
        />
      ),
    },
    {
      title: "Freeze-Thaw Cycles",
      content: (
        <SlideCallout type="warning" title="Avoid Freeze-Thaw Damage">
          Each freeze-thaw cycle causes ice crystal formation that can physically damage peptide structure. Solution: Aliquot reconstituted peptides into single-use portions before freezing. Use once, then discard.
        </SlideCallout>
      ),
    },
    {
      title: "Best Practices",
      content: (
        <SlideCallout type="tip" title="Storage Checklist">
          Store lyophilized at -20°C in original sealed vial. After reconstitution, aliquot immediately. Label with date and concentration. Keep refrigerated at 2-8°C. Use within 2-4 weeks of reconstitution.
        </SlideCallout>
      ),
    },
  ],

  "reconstitution": [
    {
      title: "Introduction",
      content: (
        <SlideHero
          icon={Droplets}
          title="Reconstitution"
          subtitle="The critical technique for preparing lyophilized peptides for research use."
          color="#21d8ff"
        />
      ),
    },
    {
      title: "Why Technique Matters",
      content: (
        <SlideText
          title="Proper Reconstitution = Reliable Results"
          paragraphs={[
            "Reconstitution is more than just adding water. The technique you use directly affects peptide integrity and your research outcomes.",
            "Aggressive handling can denature peptides, introducing bubbles can cause oxidation, and wrong solvents can cause aggregation.",
            "Master this skill once, and you'll protect every peptide sample you ever work with."
          ]}
        />
      ),
    },
    {
      title: "Step-by-Step Process",
      content: (
        <SlideVisual caption="Follow these steps for optimal reconstitution">
          <ReconstitutionStepsVisual />
        </SlideVisual>
      ),
    },
    {
      title: "Choosing Your Solvent",
      content: (
        <SlideInfoCard
          title="Reconstitution Solvents"
          items={[
            { icon: Droplets, title: "Bacteriostatic Water", description: "Most common — contains 0.9% benzyl alcohol as preservative", color: "#21d8ff" },
            { icon: FlaskConical, title: "Sterile Water", description: "For immediate use when preservative-free is needed", color: "#22c55e" },
            { icon: Activity, title: "Sterile Saline (0.9%)", description: "Physiological pH, good for sensitive peptides", color: "#E7FB10" },
          ]}
        />
      ),
    },
    {
      title: "Calculating Concentration",
      content: (
        <SlideText
          title="Getting the Math Right"
          paragraphs={[
            "To create a 5mg/mL solution: Add 1mL of solvent to a 5mg vial. For 2.5mg/mL: Add 2mL of solvent to a 5mg vial.",
            "Always calculate your desired concentration based on your research protocol requirements. More dilute solutions are often easier to measure accurately.",
            "Document your reconstitution calculations in your research log for reproducibility."
          ]}
        />
      ),
    },
    {
      title: "Critical Warnings",
      content: (
        <SlideComparison
          title="Do vs. Don't"
          left={{
            label: "Correct Technique",
            items: ["Add solvent slowly down vial wall", "Let dissolve naturally (2-5 min)", "Swirl gently if needed", "Refrigerate immediately"],
            color: "#22c55e"
          }}
          right={{
            label: "Avoid These Mistakes",
            items: ["Spraying solvent directly on powder", "Shaking or vortexing", "Forcing dissolution", "Leaving at room temperature"],
            color: "#ef4444"
          }}
        />
      ),
    },
    {
      title: "After Reconstitution",
      content: (
        <SlideInfoCard
          items={[
            { icon: Timer, title: "Aliquot Immediately", description: "Divide into single-use portions to prevent freeze-thaw damage", color: "#E7FB10" },
            { icon: FileText, title: "Label Everything", description: "Date, peptide name, concentration, expiration", color: "#21d8ff" },
            { icon: Thermometer, title: "Refrigerate at 2-8°C", description: "Use within 2-4 weeks for optimal activity", color: "#22c55e" },
          ]}
        />
      ),
    },
    {
      title: "Key Takeaway",
      content: (
        <SlideCallout type="warning" title="Never Shake">
          Shaking creates bubbles that expose peptides to air-water interfaces, causing oxidation and aggregation. Always swirl gently. If peptide doesn't dissolve, try warming slightly — never shake.
        </SlideCallout>
      ),
    },
    {
      title: "Core Foundations Quiz",
      content: (
        <QuizSlide
          moduleTitle="Core Foundations"
          questions={[
            {
              question: "What is the minimum purity level typically recommended for research?",
              options: ["75%", "85%", "95%", "99.9%"],
              correctIndex: 2,
            },
            {
              question: "What is the correct way to dissolve a lyophilized peptide?",
              options: ["Shake vigorously", "Add solvent slowly down the vial wall", "Heat to boiling", "Use a vortex mixer"],
              correctIndex: 1,
            },
            {
              question: "At what temperature should reconstituted peptides typically be stored?",
              options: ["Room temperature", "2-8°C (refrigerated)", "37°C", "-80°C"],
              correctIndex: 1,
            },
          ]}
        />
      ),
    },
  ],

  "reading-coas": [
    {
      title: "Introduction",
      content: (
        <SlideHero
          icon={FileCheck}
          title="Reading COAs"
          subtitle="Certificates of Analysis are your proof of peptide quality — learn to interpret them."
          color="#E7FB10"
        />
      ),
    },
    {
      title: "Why COAs Matter",
      content: (
        <SlideText
          title="Your Quality Assurance Document"
          paragraphs={[
            "A Certificate of Analysis (COA) is an official document from the manufacturer that verifies the quality and identity of your peptide.",
            "COAs provide objective data — you're not taking anyone's word for quality, you're seeing actual test results from validated analytical methods.",
            "Every serious researcher should review the COA before using any peptide. It's your first line of quality control."
          ]}
        />
      ),
    },
    {
      title: "COA Anatomy",
      content: (
        <SlideVisual caption="Understanding the key sections of a COA">
          <COAAnatomyVisual />
        </SlideVisual>
      ),
    },
    {
      title: "HPLC Results",
      content: (
        <SlideVisual caption="HPLC chromatogram shows purity profile">
          <HPLCChromatogramVisual />
        </SlideVisual>
      ),
    },
    {
      title: "Mass Spec Results",
      content: (
        <SlideVisual caption="Mass spectrometry confirms molecular identity">
          <MassSpecVisual />
        </SlideVisual>
      ),
    },
    {
      title: "Key Metrics to Check",
      content: (
        <SlideInfoCard
          title="Essential COA Data Points"
          items={[
            { icon: Target, title: "Purity (HPLC)", description: "Should be ≥98% for research-grade; main peak clearly dominant", color: "#22c55e" },
            { icon: Activity, title: "Molecular Weight", description: "Must match expected mass ± 0.1%; confirms correct peptide", color: "#21d8ff" },
            { icon: FileCheck, title: "Batch/Lot Number", description: "Links to manufacturing records; essential for traceability", color: "#E7FB10" },
            { icon: Eye, title: "Appearance", description: "Should describe white/off-white powder; discoloration may indicate issues", color: "#9d4edd" },
          ]}
        />
      ),
    },
    {
      title: "Red Flags",
      content: (
        <SlideCallout type="warning" title="Warning Signs on COAs">
          Watch for: Purity below stated specification. Missing batch numbers. No chromatogram images. Dates that don't match order. Tests conducted by non-accredited labs. Any of these warrant contacting the supplier.
        </SlideCallout>
      ),
    },
    {
      title: "Best Practices",
      content: (
        <SlideCallout type="tip" title="COA Management">
          Download and save every COA with your research records. Verify batch number on vial matches COA. Request COAs before purchase when possible. Create a COA archive organized by compound and date.
        </SlideCallout>
      ),
    },
  ],

  "literature-review": [
    {
      title: "Introduction",
      content: (
        <SlideHero
          icon={Search}
          title="Literature Review"
          subtitle="Find and evaluate peptide research to inform your own investigations."
          color="#9d4edd"
        />
      ),
    },
    {
      title: "Why Research Literature?",
      content: (
        <SlideText
          title="Standing on the Shoulders of Giants"
          paragraphs={[
            "Every peptide you work with has a research history. Published studies reveal mechanisms, effective protocols, and potential pitfalls.",
            "Good literature review prevents reinventing the wheel. Others have optimized conditions, identified storage requirements, and documented expected results.",
            "Understanding the science behind your compounds transforms you from a technician following protocols into a true researcher."
          ]}
        />
      ),
    },
    {
      title: "Where to Search",
      content: (
        <SlideInfoCard
          title="Primary Research Databases"
          items={[
            { icon: Globe, title: "PubMed (NCBI)", description: "The gold standard for biomedical literature — over 35 million citations", color: "#21d8ff" },
            { icon: BookOpen, title: "Google Scholar", description: "Broader scope including preprints and conference papers", color: "#E7FB10" },
            { icon: Microscope, title: "PubChem", description: "Compound-specific data, bioassay results, and structural information", color: "#9d4edd" },
          ]}
        />
      ),
    },
    {
      title: "Search Strategies",
      content: (
        <SlideInfoCard
          title="Effective Search Techniques"
          items={[
            { icon: Target, title: "Use Peptide Names", description: "Search by both common name and sequence (e.g., BPC-157, Pentadecarginine)", color: "#22c55e" },
            { icon: FileCheck, title: "Add \"In Vitro\"", description: "Filter for relevant research context matching RUO use", color: "#21d8ff" },
            { icon: Users, title: "Check Citations", description: "Key papers reference other important work — follow the trail", color: "#E7FB10" },
          ]}
        />
      ),
    },
    {
      title: "Evaluating Quality",
      content: (
        <SlideComparison
          title="Quality Indicators in Research"
          left={{
            label: "Strong Evidence",
            items: ["Peer-reviewed journals", "Multiple independent studies", "Clear methodology", "Statistical analysis", "Reproducible results"],
            color: "#22c55e"
          }}
          right={{
            label: "Weak Evidence",
            items: ["Preprints only", "Single study", "Vague methods", "No statistics", "Unreplicated claims"],
            color: "#f97316"
          }}
        />
      ),
    },
    {
      title: "Documentation",
      content: (
        <SlideInfoCard
          items={[
            { icon: ClipboardList, title: "Create a Reference Library", description: "Save PDFs organized by peptide and topic", color: "#21d8ff" },
            { icon: FileText, title: "Annotate Key Findings", description: "Note concentrations, conditions, and outcomes for each study", color: "#E7FB10" },
            { icon: Target, title: "Track Relevance", description: "Mark which papers directly inform your research protocols", color: "#22c55e" },
          ]}
        />
      ),
    },
    {
      title: "Critical Reading",
      content: (
        <SlideCallout type="info" title="Read Critically">
          Not all published research is equal. Check sample sizes, look for conflicts of interest, verify methods are appropriate, and see if results have been replicated by others. One flashy paper doesn't constitute scientific consensus.
        </SlideCallout>
      ),
    },
  ],

  "lab-safety": [
    {
      title: "Introduction",
      content: (
        <SlideHero
          icon={Shield}
          title="Lab Safety"
          subtitle="Protecting yourself and your research through proper safety practices."
          color="#22c55e"
        />
      ),
    },
    {
      title: "Safety First",
      content: (
        <SlideText
          title="Non-Negotiable Practices"
          paragraphs={[
            "Laboratory safety isn't optional — it protects you from exposure to research compounds and protects your research from contamination.",
            "RUO peptides are not approved for human exposure. Treat them as potentially hazardous until proven otherwise.",
            "Good safety habits become second nature with practice. Start right, and safe practices will follow you throughout your research career."
          ]}
        />
      ),
    },
    {
      title: "Personal Protective Equipment",
      content: (
        <SlideVisual caption="Essential PPE for peptide handling">
          <SafetyEquipmentVisual />
        </SlideVisual>
      ),
    },
    {
      title: "Lab Organization",
      content: (
        <SlideVisual caption="Organize your workspace into functional zones">
          <LabSetupVisual />
        </SlideVisual>
      ),
    },
    {
      title: "PPE Requirements",
      content: (
        <SlideInfoCard
          title="Minimum Protection Standards"
          items={[
            { icon: Eye, title: "Safety Glasses/Goggles", description: "Protect eyes from splashes and powder aerosolization", color: "#21d8ff" },
            { icon: Shield, title: "Nitrile Gloves", description: "Prevent skin contact; change frequently, especially between compounds", color: "#22c55e" },
            { icon: ShieldCheck, title: "Lab Coat", description: "Protects clothing and skin; removes easily if contaminated", color: "#E7FB10" },
          ]}
        />
      ),
    },
    {
      title: "Handling Practices",
      content: (
        <SlideInfoCard
          items={[
            { icon: AlertTriangle, title: "No Food or Drink", description: "Never in the research area — contamination risk is real", color: "#ef4444" },
            { icon: Droplets, title: "Work Over Trays", description: "Contain spills; use disposable bench covers", color: "#21d8ff" },
            { icon: Lock, title: "Secure Storage", description: "Prevent unauthorized access to research compounds", color: "#9d4edd" },
            { icon: ClipboardList, title: "Document Incidents", description: "Record any spills, exposure, or safety concerns", color: "#E7FB10" },
          ]}
        />
      ),
    },
    {
      title: "Emergency Procedures",
      content: (
        <SlideCallout type="warning" title="In Case of Exposure">
          Skin contact: Wash immediately with soap and water for 15 minutes. Eye contact: Flush with eyewash station for 15 minutes. Ingestion: Do not induce vomiting; seek medical attention. Document all incidents and notify your supervisor.
        </SlideCallout>
      ),
    },
    {
      title: "Safety Culture",
      content: (
        <SlideCallout type="tip" title="Safety is Everyone's Job">
          Good safety isn't about following rules — it's about developing habits that protect you automatically. When safety becomes instinct, you're free to focus on what matters: excellent research.
        </SlideCallout>
      ),
    },
  ],

  "documentation": [
    {
      title: "Introduction",
      content: (
        <SlideHero
          icon={ClipboardList}
          title="Documentation"
          subtitle="The backbone of reproducible research and regulatory compliance."
          color="#E7FB10"
        />
      ),
    },
    {
      title: "Why Document?",
      content: (
        <SlideText
          title="Your Research Insurance Policy"
          paragraphs={[
            "Documentation isn't bureaucracy — it's insurance. Complete records protect you legally, ensure reproducibility, and preserve institutional knowledge.",
            "If you can't document it, you can't reproduce it. And research that can't be reproduced isn't science.",
            "Good documentation habits save time in the long run. You'll thank yourself when you need to reference work from months ago."
          ]}
        />
      ),
    },
    {
      title: "Sample Log Entry",
      content: (
        <SlideVisual caption="Every entry should include these key data points">
          <DocumentationTemplateVisual />
        </SlideVisual>
      ),
    },
    {
      title: "What to Record",
      content: (
        <SlideInfoCard
          title="Essential Documentation Elements"
          items={[
            { icon: Package, title: "Product Information", description: "Name, batch number, vendor, purity, purchase date", color: "#21d8ff" },
            { icon: Thermometer, title: "Storage Records", description: "Location, temperature logs, date of storage", color: "#22c55e" },
            { icon: Droplets, title: "Reconstitution Details", description: "Date, solvent used, final concentration, aliquot information", color: "#E7FB10" },
            { icon: FlaskConical, title: "Usage Records", description: "Date, amount used, purpose, researcher name", color: "#9d4edd" },
          ]}
        />
      ),
    },
    {
      title: "Documentation Methods",
      content: (
        <SlideComparison
          title="Paper vs. Digital Records"
          left={{
            label: "Paper Lab Notebook",
            items: ["Permanent ink required", "Date and sign each page", "No erasures (line through)", "Witnessed for legal validity"],
            color: "#E7FB10"
          }}
          right={{
            label: "Electronic Lab Notebook",
            items: ["Automatic timestamps", "Searchable records", "Audit trails built-in", "Cloud backup protection"],
            color: "#21d8ff"
          }}
        />
      ),
    },
    {
      title: "COA Management",
      content: (
        <SlideInfoCard
          items={[
            { icon: FileCheck, title: "Save Every COA", description: "Create a folder for each compound with all associated documents", color: "#22c55e" },
            { icon: Target, title: "Cross-Reference", description: "Link COA batch numbers to your usage records", color: "#21d8ff" },
            { icon: Timer, title: "Retention Period", description: "Keep records for at least 5 years after last use", color: "#E7FB10" },
          ]}
        />
      ),
    },
    {
      title: "Compliance Value",
      content: (
        <SlideCallout type="info" title="Regulatory Compliance">
          Complete documentation demonstrates responsible research practices. Should you ever need to prove your research was conducted properly, your records are your evidence. Good documentation = peace of mind.
        </SlideCallout>
      ),
    },
    {
      title: "Best Practice",
      content: (
        <SlideCallout type="tip" title="Document in Real Time">
          Record as you work, not from memory later. Train yourself to log every action immediately. Set up templates to make documentation fast and consistent. Your future self will thank you.
        </SlideCallout>
      ),
    },
    {
      title: "Research Skills Quiz",
      content: (
        <QuizSlide
          moduleTitle="Research Skills"
          questions={[
            {
              question: "What does a COA (Certificate of Analysis) verify?",
              options: ["Shipping speed", "Product quality and identity", "Payment confirmation", "Customer reviews"],
              correctIndex: 1,
            },
            {
              question: "What analytical method is commonly used to determine peptide purity?",
              options: ["Visual inspection", "Weight measurement", "HPLC chromatography", "Color testing"],
              correctIndex: 2,
            },
            {
              question: "How long should research records typically be retained?",
              options: ["1 week", "1 month", "1 year", "At least 5 years"],
              correctIndex: 3,
            },
          ]}
        />
      ),
    },
  ],

  "putting-together": [
    {
      title: "Introduction",
      content: (
        <SlideHero
          icon={Puzzle}
          title="Putting It All Together"
          subtitle="Apply your knowledge in a complete, professional research workflow."
          color="#22c55e"
        />
      ),
    },
    {
      title: "The Complete Picture",
      content: (
        <SlideText
          title="Integration is Key"
          paragraphs={[
            "You've learned individual skills — now it's time to see how they connect into a seamless research workflow.",
            "Professional researchers don't think of these as separate steps. They flow naturally from one to the next, with documentation running throughout.",
            "Master this workflow, and you'll approach every research project with confidence and consistency."
          ]}
        />
      ),
    },
    {
      title: "Research Workflow",
      content: (
        <SlideVisual caption="The complete peptide research cycle">
          <ResearchWorkflowVisual />
        </SlideVisual>
      ),
    },
    {
      title: "Phase 1: Planning",
      content: (
        <SlideInfoCard
          title="Before You Order"
          items={[
            { icon: Search, title: "Literature Review", description: "Research your peptide's properties, protocols, and published findings", color: "#9d4edd" },
            { icon: Target, title: "Define Objectives", description: "Know exactly what you're investigating and why", color: "#E7FB10" },
            { icon: ClipboardList, title: "Prepare Materials", description: "Ensure storage, solvents, and equipment are ready", color: "#21d8ff" },
          ]}
        />
      ),
    },
    {
      title: "Phase 2: Acquisition",
      content: (
        <SlideInfoCard
          title="Ordering & Receiving"
          items={[
            { icon: ShoppingCart, title: "Order with Purpose", description: "Select purity level appropriate for your research needs", color: "#E7FB10" },
            { icon: FileCheck, title: "Verify COA", description: "Review documentation before product arrives", color: "#22c55e" },
            { icon: Box, title: "Inspect on Arrival", description: "Check packaging, verify contents, store immediately", color: "#21d8ff" },
          ]}
        />
      ),
    },
    {
      title: "Phase 3: Preparation",
      content: (
        <SlideInfoCard
          title="Storage & Reconstitution"
          items={[
            { icon: Thermometer, title: "Proper Storage", description: "Lyophilized at -20°C, protected from light", color: "#21d8ff" },
            { icon: Droplets, title: "Careful Reconstitution", description: "Gentle technique, correct solvent, accurate concentration", color: "#22c55e" },
            { icon: Package, title: "Aliquot & Label", description: "Divide into single-use portions, label completely", color: "#E7FB10" },
          ]}
        />
      ),
    },
    {
      title: "Phase 4: Research",
      content: (
        <SlideInfoCard
          title="Active Research Phase"
          items={[
            { icon: Shield, title: "Safety First", description: "Full PPE, clean workspace, proper handling", color: "#22c55e" },
            { icon: Microscope, title: "Execute Protocol", description: "Follow your planned methodology precisely", color: "#9d4edd" },
            { icon: ClipboardList, title: "Document Everything", description: "Record all observations, conditions, and results", color: "#E7FB10" },
          ]}
        />
      ),
    },
    {
      title: "Continuous Improvement",
      content: (
        <SlideCallout type="tip" title="The Learning Cycle">
          After each research project, review what worked and what didn't. Update your protocols. Share knowledge with colleagues. Great researchers are always improving their practices.
        </SlideCallout>
      ),
    },
    {
      title: "You're Ready",
      content: (
        <SlideCallout type="info" title="Congratulations">
          You now have a complete framework for conducting peptide research. These principles apply whether you're working with your first peptide or your hundredth. The workflow remains the same — only your expertise grows.
        </SlideCallout>
      ),
    },
  ],

  "troubleshooting": [
    {
      title: "Introduction",
      content: (
        <SlideHero
          icon={Wrench}
          title="Troubleshooting"
          subtitle="When things don't go as planned, systematic problem-solving gets you back on track."
          color="#f97316"
        />
      ),
    },
    {
      title: "Problem-Solving Mindset",
      content: (
        <SlideText
          title="Stay Calm and Systematic"
          paragraphs={[
            "Problems in the lab are opportunities to learn. Every issue you solve deepens your understanding of peptide behavior.",
            "Most problems have straightforward solutions — the key is identifying the root cause rather than guessing at fixes.",
            "Documentation becomes crucial here: your records often reveal when and why issues began."
          ]}
        />
      ),
    },
    {
      title: "Common Issues",
      content: (
        <SlideVisual caption="Quick reference for common problems and solutions">
          <TroubleshootingFlowVisual />
        </SlideVisual>
      ),
    },
    {
      title: "Dissolution Problems",
      content: (
        <SlideInfoCard
          title="Peptide Won't Dissolve"
          items={[
            { icon: Timer, title: "Give It Time", description: "Some peptides need 5-10 minutes to fully dissolve — be patient", color: "#21d8ff" },
            { icon: Thermometer, title: "Warm Slightly", description: "Room temperature helps; never use hot water", color: "#E7FB10" },
            { icon: Activity, title: "Try Different Solvent", description: "Acidic (0.1% acetic acid) or basic solutions may work better", color: "#22c55e" },
            { icon: Droplets, title: "Increase Volume", description: "Peptide may be near solubility limit — use more solvent", color: "#9d4edd" },
          ]}
        />
      ),
    },
    {
      title: "Cloudy Solutions",
      content: (
        <SlideInfoCard
          title="Precipitation Issues"
          items={[
            { icon: Eye, title: "Check Concentration", description: "You may have exceeded the peptide's solubility limit", color: "#21d8ff" },
            { icon: Activity, title: "Verify pH", description: "Extreme pH can cause aggregation — aim for neutral", color: "#E7FB10" },
            { icon: Snowflake, title: "Avoid Cold", description: "Some peptides precipitate when refrigerated; let warm before use", color: "#f97316" },
          ]}
        />
      ),
    },
    {
      title: "Unexpected Results",
      content: (
        <SlideInfoCard
          title="Research Not Working as Expected"
          items={[
            { icon: FileCheck, title: "Verify COA", description: "Confirm peptide identity and purity match your requirements", color: "#E7FB10" },
            { icon: Thermometer, title: "Check Storage History", description: "Was temperature maintained? How long since reconstitution?", color: "#21d8ff" },
            { icon: Target, title: "Review Protocol", description: "Compare your method to published literature — any deviations?", color: "#22c55e" },
            { icon: FlaskConical, title: "Fresh Sample", description: "If in doubt, reconstitute a fresh aliquot and test again", color: "#9d4edd" },
          ]}
        />
      ),
    },
    {
      title: "Prevention",
      content: (
        <SlideCallout type="tip" title="Prevent Problems Before They Start">
          Most issues trace back to storage or handling errors. Strict temperature control, gentle reconstitution, and proper aliquoting prevent the majority of problems. Prevention beats troubleshooting every time.
        </SlideCallout>
      ),
    },
    {
      title: "When to Seek Help",
      content: (
        <SlideCallout type="info" title="Contact Support">
          If problems persist after systematic troubleshooting, contact your supplier's technical support. Provide batch number, storage conditions, reconstitution details, and specific observations. Good vendors stand behind their products.
        </SlideCallout>
      ),
    },
  ],

  "advanced-tips": [
    {
      title: "Introduction",
      content: (
        <SlideHero
          icon={Sparkles}
          title="Advanced Tips"
          subtitle="Expert techniques that separate novice researchers from professionals."
          color="#9d4edd"
        />
      ),
    },
    {
      title: "Beyond Basics",
      content: (
        <SlideText
          title="Elevating Your Practice"
          paragraphs={[
            "You've mastered the fundamentals. Now it's time to learn the techniques that experienced researchers use to optimize their work.",
            "These aren't shortcuts — they're refinements that come from years of practical experience in the lab.",
            "Implementing even a few of these practices will improve your research quality and efficiency significantly."
          ]}
        />
      ),
    },
    {
      title: "Advanced Aliquoting",
      content: (
        <SlideInfoCard
          title="Single-Use Aliquot Strategy"
          items={[
            { icon: Package, title: "Calculate Precisely", description: "Determine exact amounts needed per experiment before aliquoting", color: "#21d8ff" },
            { icon: Timer, title: "Work Quickly", description: "Minimize time peptide spends at room temperature during division", color: "#E7FB10" },
            { icon: Snowflake, title: "Flash Freeze", description: "Snap-freeze aliquots in liquid nitrogen if available", color: "#22c55e" },
            { icon: ClipboardList, title: "Label Everything", description: "Date, concentration, volume, and aliquot number on each", color: "#9d4edd" },
          ]}
        />
      ),
    },
    {
      title: "Inert Atmosphere",
      content: (
        <SlideInfoCard
          title="Nitrogen/Argon Overlay"
          items={[
            { icon: Shield, title: "Displace Oxygen", description: "Purge vials with inert gas before sealing to prevent oxidation", color: "#21d8ff" },
            { icon: FlaskConical, title: "Use After Opening", description: "Re-purge stock vials after each access", color: "#22c55e" },
            { icon: Target, title: "Best for Sensitive Peptides", description: "Especially important for methionine/cysteine-containing sequences", color: "#E7FB10" },
          ]}
        />
      ),
    },
    {
      title: "Batch Validation",
      content: (
        <SlideInfoCard
          title="Verify Before Full Use"
          items={[
            { icon: Eye, title: "Visual Inspection", description: "Check appearance matches expected lyophilized cake", color: "#21d8ff" },
            { icon: Droplets, title: "Dissolution Test", description: "Small aliquot should dissolve properly before committing full batch", color: "#E7FB10" },
            { icon: Activity, title: "Activity Check", description: "Run a positive control experiment with known conditions", color: "#22c55e" },
          ]}
        />
      ),
    },
    {
      title: "Storage Optimization",
      content: (
        <SlideComparison
          title="Standard vs. Optimized Storage"
          left={{
            label: "Standard Practice",
            items: ["-20°C storage", "Original vials", "Ambient atmosphere", "Standard labeling"],
            color: "#E7FB10"
          }}
          right={{
            label: "Optimized Practice",
            items: ["-80°C for long-term", "Amber vials", "Nitrogen overlay", "Detailed tracking system"],
            color: "#22c55e"
          }}
        />
      ),
    },
    {
      title: "Carrier Proteins",
      content: (
        <SlideCallout type="tip" title="Prevent Sticking Losses">
          Very dilute peptide solutions can lose significant material to plastic surfaces. Adding 0.1% BSA (bovine serum albumin) as a carrier protein prevents this. Essential for nanomolar concentrations.
        </SlideCallout>
      ),
    },
    {
      title: "Continuous Learning",
      content: (
        <SlideCallout type="info" title="Keep Improving">
          The best researchers are always learning. Follow new literature on your peptides. Connect with other researchers. Document what works. Your experience becomes institutional knowledge that benefits everyone.
        </SlideCallout>
      ),
    },
  ],

  "final-review": [
    {
      title: "Orientation Complete!",
      content: (
        <SlideHero
          icon={Award}
          title="Orientation Complete!"
          subtitle="You've completed the Peptide Academy orientation and built a foundation for informed research."
          color="#22c55e"
        />
      ),
    },
    {
      title: "Your Progress",
      content: (
        <SlideVisual caption="You've completed your orientation">
          <CompletionBadgeVisual />
        </SlideVisual>
      ),
    },
    {
      title: "What You've Learned",
      content: (
        <SlideInfoCard
          title="Your Foundation"
          items={[
            { icon: Compass, title: "Peptide Fundamentals", description: "Structure, function, and research classification", color: "#21d8ff" },
            { icon: Scale, title: "Legal Framework", description: "RUO regulations and researcher responsibilities", color: "#9d4edd" },
            { icon: FlaskConical, title: "Core Techniques", description: "Purity, storage, lyophilization, and reconstitution", color: "#E7FB10" },
            { icon: FileCheck, title: "Quality Assessment", description: "COA interpretation and documentation practices", color: "#22c55e" },
          ]}
        />
      ),
    },
    {
      title: "Key Takeaways",
      content: (
        <SlideInfoCard
          items={[
            { icon: Shield, title: "Safety Awareness", description: "Lab safety, PPE requirements, and emergency procedures", color: "#22c55e" },
            { icon: Microscope, title: "Research Workflow", description: "Complete process from planning through documentation", color: "#9d4edd" },
            { icon: Wrench, title: "Troubleshooting", description: "Systematic problem-solving for common issues", color: "#f97316" },
            { icon: Sparkles, title: "Best Practices", description: "Practical techniques for research success", color: "#E7FB10" },
          ]}
        />
      ),
    },
    {
      title: "Important Reminder",
      content: (
        <SlideText
          title="Research Responsibility"
          paragraphs={[
            "This orientation has prepared you with foundational knowledge, but research is an ongoing learning process.",
            "Always use RUO compounds only for legitimate research purposes, maintain proper documentation, and follow all applicable regulations.",
            "Continue to build your knowledge through experience, peer learning, and staying current with best practices."
          ]}
        />
      ),
    },
    {
      title: "Where to Go Next",
      content: (
        <SlideInfoCard
          title="Continue Your Learning"
          items={[
            { icon: BookOpen, title: "Education Center", description: "Browse our reference library for in-depth articles on specific topics", color: "#21d8ff" },
            { icon: Search, title: "Peptide Profiles", description: "Explore detailed guides for specific research compounds", color: "#E7FB10" },
            { icon: Users, title: "Support Resources", description: "Our team is here to help with questions along the way", color: "#9d4edd" },
          ]}
        />
      ),
    },
    {
      title: "Ready to Begin",
      content: (
        <SlideCallout type="tip" title="You're Oriented!">
          You now have the foundational knowledge to approach peptide research with confidence. The Education Center is always available for quick reference when you need it. Welcome to the Revive Research community.
        </SlideCallout>
      ),
    },
    {
      title: "Final Assessment",
      content: (
        <QuizSlide
          moduleTitle="Lab Confidence"
          questions={[
            {
              question: "What is the first thing you should do when a peptide doesn't dissolve?",
              options: ["Throw it away", "Shake vigorously", "Check storage history and try gentle warming", "Add more solvent immediately"],
              correctIndex: 2,
            },
            {
              question: "Which of these is a sign of peptide degradation?",
              options: ["White fluffy powder", "Clear solution after reconstitution", "Yellow discoloration or clumping", "No change in appearance"],
              correctIndex: 2,
            },
            {
              question: "What makes a complete research workflow?",
              options: ["Just ordering peptides", "Planning, documentation, proper handling, and safety throughout", "Only doing experiments", "Skipping quality checks"],
              correctIndex: 1,
            },
            {
              question: "Where should you go for quick reference after completing the Academy?",
              options: ["Random internet searches", "The Education Center reference library", "Social media", "Guessing"],
              correctIndex: 1,
            },
          ]}
        />
      ),
    },
  ],
};

export function getLessonSlides(lessonId: string): Slide[] | null {
  return LESSON_SLIDES[lessonId] || null;
}
