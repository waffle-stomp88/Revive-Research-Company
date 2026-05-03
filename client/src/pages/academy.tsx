import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SEOHead } from "@/components/seo-head";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import {
  GraduationCap,
  BookOpen,
  FlaskConical,
  Compass,
  Award,
  Star,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Play,
  CheckCircle2,
  Lock,
  Beaker,
  Thermometer,
  FileCheck,
  Shield,
  AlertTriangle,
  Building,
  Zap,
  Trophy,
  Target,
  Brain,
  Lightbulb,
  X,
  ArrowRight,
  ArrowLeft,
  Settings,
  Gift,
  Rocket,
  TrendingUp,
  Loader2,
} from "lucide-react";
import type { AcademyProgress, EducationArticle } from "@shared/schema";
import { academyPersonas, academyAchievements } from "@shared/schema";
import type { Slide } from "@/components/academy/lesson-slides";
import { HorizontalLearningPath } from "@/components/academy/horizontal-learning-path";
import { EmailCapture } from "@/components/email-capture";

const CURRICULUM = [
  {
    id: 0,
    title: "Orientation",
    description: "Get started with research fundamentals",
    icon: Compass,
    color: "#21d8ff",
    lessons: [
      { id: "welcome", title: "Welcome to Research", articleSlug: "ordering-expectations", xp: 10 },
      { id: "what-is-peptide", title: "What is a Peptide?", articleSlug: null, xp: 10 },
      { id: "research-only", title: "Research Use Only", articleSlug: null, xp: 10 },
      { id: "legal-landscape", title: "Legal Landscape", articleSlug: null, xp: 10 },
      { id: "your-first-order", title: "Your First Order", articleSlug: "ordering-expectations", xp: 15 },
    ],
  },
  {
    id: 1,
    title: "Core Foundations",
    description: "Master essential concepts",
    icon: Building,
    color: "#E7FB10",
    lessons: [
      { id: "purity-basics", title: "Understanding Purity", articleSlug: null, xp: 20 },
      { id: "lyophilization", title: "Lyophilization Process", articleSlug: null, xp: 20 },
      { id: "stability", title: "Peptide Stability", articleSlug: "storage-101", xp: 20 },
      { id: "reconstitution", title: "Complete Reconstitution Guide", articleSlug: "reconstitution-101", xp: 25 },
    ],
  },
  {
    id: 2,
    title: "Research Skills",
    description: "Develop professional expertise",
    icon: FlaskConical,
    color: "#9d4edd",
    lessons: [
      { id: "reading-coas", title: "How to Read COAs", articleSlug: "how-to-read-coas", xp: 25 },
      { id: "literature-review", title: "Literature Review Basics", articleSlug: null, xp: 20 },
      { id: "lab-safety", title: "Lab Safety Essentials", articleSlug: null, xp: 25 },
      { id: "documentation", title: "Proper Documentation", articleSlug: null, xp: 20 },
    ],
  },
  {
    id: 3,
    title: "Lab Confidence",
    description: "Put it all together",
    icon: Award,
    color: "#22c55e",
    lessons: [
      { id: "putting-together", title: "Putting It All Together", articleSlug: null, xp: 30 },
      { id: "troubleshooting", title: "Troubleshooting Common Issues", articleSlug: null, xp: 25 },
      { id: "advanced-tips", title: "Advanced Research Tips", articleSlug: null, xp: 30 },
      { id: "final-review", title: "Final Review & Next Steps", articleSlug: null, xp: 50 },
    ],
  },
];

const PERSONA_QUESTIONS = [
  {
    question: "How would you describe your research background?",
    options: [
      { value: "beginner", label: "I'm new to peptide research" },
      { value: "intermediate", label: "I have some lab experience" },
      { value: "advanced", label: "I'm an experienced researcher" },
    ],
  },
];

// Persona-specific configurations
const PERSONA_CONFIG = {
  beginner: {
    welcomeMessage: "Welcome to your research journey! We'll guide you step by step through the fundamentals.",
    description: "Linear learning path with detailed explanations at every step.",
    unlockMode: "linear" as const, // Must complete lessons in order
    recommendedStart: "welcome",
    color: "#21d8ff",
    icon: Lightbulb,
    features: [
      "Step-by-step guidance through all modules",
      "Extra context and 'Why this matters' explanations",
      "Beginner-friendly terminology throughout",
    ],
  },
  intermediate: {
    welcomeMessage: "Great to have you! Your lab experience will help you move quickly through the basics.",
    description: "Flexible module access - explore topics in any order within modules.",
    unlockMode: "module" as const, // Can do lessons within a module in any order
    recommendedStart: "purity-basics",
    color: "#E7FB10",
    icon: Beaker,
    features: [
      "Skip ahead within unlocked modules",
      "Focus on practical application",
      "Build on your existing knowledge",
    ],
  },
  advanced: {
    welcomeMessage: "Welcome, researcher! Jump directly to the topics most relevant to your work.",
    description: "Full access - start anywhere and focus on what matters to you.",
    unlockMode: "full" as const, // All lessons accessible
    recommendedStart: "reading-coas",
    color: "#9d4edd",
    icon: FlaskConical,
    features: [
      "Access all modules immediately",
      "Quick review mode available",
      "Focus on advanced techniques",
    ],
  },
};

// Reward milestones
const REWARD_MILESTONES = [
  { 
    xpRequired: 100, 
    reward: "Early Learner Badge", 
    description: "Complete your first module",
    type: "badge" as const,
    icon: Sparkles,
  },
  { 
    xpRequired: 250, 
    reward: "Research Ready Badge", 
    description: "Master the fundamentals",
    type: "badge" as const,
    icon: Award,
  },
  { 
    xpRequired: 400, 
    reward: "5% Discount Code", 
    description: "Unlock your first reward",
    type: "discount" as const,
    icon: Gift,
  },
  { 
    xpRequired: 600, 
    reward: "Certified Researcher", 
    description: "Complete the full academy",
    type: "certificate" as const,
    icon: GraduationCap,
  },
];

function ProgressRing({ progress, size = 60, strokeWidth = 6, color = "#E7FB10" }: { progress: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold text-white">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}

function AchievementBadge({ achievement, unlocked }: { achievement: typeof academyAchievements[keyof typeof academyAchievements]; unlocked: boolean }) {
  const iconMap: Record<string, any> = {
    Sparkles, Compass, Building, FlaskConical, Award, Star, GraduationCap, Trophy
  };
  const Icon = iconMap[achievement.icon] || Star;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
        unlocked 
          ? "bg-gradient-to-br from-[#E7FB10]/20 to-[#21d8ff]/10 border border-[#E7FB10]/30" 
          : "bg-white/5 border border-white/10 opacity-50"
      }`}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
        unlocked ? "bg-[#E7FB10]/20" : "bg-white/10"
      }`}>
        <Icon className={`w-6 h-6 ${unlocked ? "text-[#E7FB10]" : "text-white/40"}`} />
      </div>
      <span className="text-xs font-medium text-center text-white/80">{achievement.name}</span>
      {unlocked && (
        <Badge variant="secondary" className="text-[10px] bg-[#E7FB10]/20 text-[#E7FB10] border-0">
          +{achievement.xp} XP
        </Badge>
      )}
      {!unlocked && <Lock className="absolute top-2 right-2 w-3 h-3 text-white/30" />}
    </motion.div>
  );
}

function EmbeddedLessonViewer({
  lessonId,
  onClose,
  onComplete,
  completedLessons,
  totalXp,
  persona,
}: {
  lessonId: string;
  onClose: () => void;
  onComplete: (lessonId: string, xp: number) => void;
  onNavigate: (lessonId: string) => void;
  completedLessons: string[];
  totalXp: number;
  article?: EducationArticle | null;
  persona?: string | null;
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<Slide[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("@/components/academy/lesson-slides").then((mod) => {
      if (!cancelled) setSlides(mod.getLessonSlides(lessonId));
    });
    return () => { cancelled = true; };
  }, [lessonId]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;
    const scrollY = window.scrollY;

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      window.scrollTo(0, scrollY);
    };
  }, []);

  const lessonInfo = findLessonById(lessonId);
  const isCompleted = completedLessons.includes(lessonId);
  
  // Get persona-specific learning mode
  const personaConfig = persona ? PERSONA_CONFIG[persona as keyof typeof PERSONA_CONFIG] : null;
  const learningMode = personaConfig?.unlockMode === "full" ? "Quick Review" : 
                       personaConfig?.unlockMode === "module" ? "Standard" : "Guided";

  if (!lessonInfo) return null;

  if (!slides) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
        onClick={onClose}
        data-testid="lesson-loading"
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        <div className="relative flex flex-col items-center gap-3 text-white/80">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm">Loading lesson...</span>
        </div>
      </motion.div>
    );
  }

  const { lesson, module } = lessonInfo;
  const totalSlides = slides.length;
  const isLastSlide = currentSlide === totalSlides - 1;
  const isFirstSlide = currentSlide === 0;

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleComplete = () => {
    onComplete(lessonId, lesson.xp);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-[#1a1a1f] rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        style={{ maxHeight: "90vh" }}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${module.color}20` }}
            >
              <module.icon className="w-5 h-5" style={{ color: module.color }} />
            </div>
            <div>
              <p className="text-xs text-white/50">{module.title}</p>
              <h3 className="font-semibold text-white">{lesson.title}</h3>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {personaConfig && (
              <Badge 
                variant="secondary" 
                className="text-xs hidden sm:flex"
                style={{ 
                  backgroundColor: `${personaConfig.color}15`,
                  color: personaConfig.color,
                }}
              >
                {(() => {
                  const Icon = personaConfig.icon;
                  return <Icon className="w-3 h-3 mr-1" />;
                })()}
                {learningMode} Mode
              </Badge>
            )}
            <Badge className="bg-[#E7FB10]/20 text-[#E7FB10] border-[#E7FB10]/30">
              <Zap className="w-3 h-3 mr-1" />
              {totalXp} XP
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white/60 hover:text-white"
              data-testid="button-close-lesson"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="px-4 py-2 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex gap-1">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentSlide 
                      ? "flex-[2] bg-[#E7FB10]" 
                      : idx < currentSlide 
                        ? "flex-1 bg-[#22c55e]" 
                        : "flex-1 bg-white/20"
                  }`}
                  data-testid={`button-slide-${idx}`}
                />
              ))}
            </div>
            <span className="text-xs text-white/40 ml-2">
              {currentSlide + 1} / {totalSlides}
            </span>
          </div>
        </div>

        <div className="p-6 md:p-10 min-h-[450px] flex items-center justify-center overflow-y-auto" style={{ maxHeight: "calc(90vh - 180px)" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              {slides[currentSlide].content}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-white/10 bg-white/[0.02]">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={isFirstSlide}
            className={`text-white/60 hover:text-white ${isFirstSlide ? "invisible" : ""}`}
            data-testid="button-prev-slide"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            {lesson.articleSlug && (
              <Link href={`/education/${lesson.articleSlug}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#21d8ff]/70 hover:text-[#21d8ff] text-xs"
                  data-testid="button-read-full-article"
                >
                  <BookOpen className="w-3 h-3 mr-1" />
                  Read Full Article
                </Button>
              </Link>
            )}
            {isLastSlide ? (
              isCompleted ? (
                <Button
                  className="bg-green-500 text-white hover:bg-green-500/90"
                  onClick={onClose}
                  data-testid="button-finish-lesson"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Done
                </Button>
              ) : (
                <Button
                  className="bg-[#E7FB10] text-black hover:bg-[#E7FB10]/90"
                  onClick={handleComplete}
                  data-testid="button-complete-lesson"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Complete (+{lesson.xp} XP)
                </Button>
              )
            ) : (
              <Button
                className="bg-[#21d8ff] text-black hover:bg-[#21d8ff]/90"
                onClick={handleNext}
                data-testid="button-next-slide"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {isLastSlide && isCompleted && (
          <div className="px-4 pb-4">
            <EmailCapture
              heading="Get notified about new lessons"
              description="We'll let you know when new Academy modules drop. No spam."
              source="academy_completion"
              variant="academy"
            />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function findLessonById(lessonId: string) {
  for (const module of CURRICULUM) {
    const lesson = module.lessons.find((l) => l.id === lessonId);
    if (lesson) {
      return { lesson, module };
    }
  }
  return null;
}

function getAllLessonsFlat() {
  return CURRICULUM.flatMap((module) =>
    module.lessons.map((lesson) => ({
      ...lesson,
      moduleId: module.id,
      moduleTitle: module.title,
      moduleColor: module.color,
      moduleIcon: module.icon,
    }))
  );
}

function getAdjacentLessons(currentLessonId: string, completedLessons: string[]) {
  const allLessons = getAllLessonsFlat();
  const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);

  if (currentIndex === -1) return { prev: null, next: null };

  const prev = currentIndex > 0 ? allLessons[currentIndex - 1] : null;

  let next = null;
  if (currentIndex < allLessons.length - 1) {
    const nextLesson = allLessons[currentIndex + 1];
    const currentIsCompleted = completedLessons.includes(currentLessonId);
    if (currentIsCompleted) {
      next = nextLesson;
    }
  }

  return { prev, next };
}

export default function Academy() {
  const { user, isLoading: authLoading, login, logout } = useAuth();
  const [, navigate] = useLocation();
  const [showPersonaQuiz, setShowPersonaQuiz] = useState(false);
  const [pendingPersona, setPendingPersona] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const perfectQuizAchievedRef = useRef(false);
  const [localProgress, setLocalProgress] = useState<{
    completedLessons: string[];
    currentModule: number;
    currentLesson: number;
    achievements: string[];
    totalXp: number;
    persona: string | null;
  }>(() => {
    const saved = localStorage.getItem("academyProgress");
    return saved ? JSON.parse(saved) : {
      completedLessons: [],
      currentModule: 0,
      currentLesson: 0,
      achievements: [],
      totalXp: 0,
      persona: null,
    };
  });

  const { data: serverProgress, isLoading: progressLoading } = useQuery<AcademyProgress>({
    queryKey: ["/api/academy/progress"],
    enabled: !!user,
  });

  const { data: articles } = useQuery<EducationArticle[]>({
    queryKey: ["/api/education"],
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (data: Partial<AcademyProgress>) => {
      return apiRequest("PATCH", "/api/academy/progress", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/academy/progress"] });
    },
  });

  useEffect(() => {
    localStorage.setItem("academyProgress", JSON.stringify(localProgress));
  }, [localProgress]);

  useEffect(() => {
    if (serverProgress && user) {
      setLocalProgress({
        completedLessons: serverProgress.completedLessons || [],
        currentModule: serverProgress.currentModule || 0,
        currentLesson: serverProgress.currentLesson || 0,
        achievements: serverProgress.achievements || [],
        totalXp: serverProgress.totalXp || 0,
        persona: serverProgress.persona,
      });
    }
  }, [serverProgress, user]);

  // Retroactively calculate missing achievements for existing progress
  useEffect(() => {
    if (localProgress.completedLessons.length === 0) return;

    const completedLessons = localProgress.completedLessons;
    const currentAchievements = localProgress.achievements;
    const newAchievements = [...currentAchievements];
    let bonusXp = 0;
    let hasChanges = false;

    // First lesson achievement
    if (completedLessons.length >= 1 && !currentAchievements.includes("FIRST_LESSON")) {
      newAchievements.push("FIRST_LESSON");
      bonusXp += academyAchievements.FIRST_LESSON.xp;
      hasChanges = true;
    }

    // Module 0 - Orientation
    const module0Lessons = CURRICULUM[0].lessons.map(l => l.id);
    if (module0Lessons.every(id => completedLessons.includes(id)) && !currentAchievements.includes("ORIENTATION_COMPLETE")) {
      newAchievements.push("ORIENTATION_COMPLETE");
      bonusXp += academyAchievements.ORIENTATION_COMPLETE.xp;
      hasChanges = true;
    }

    // Module 1 - Core Foundations
    const module1Lessons = CURRICULUM[1].lessons.map(l => l.id);
    if (module1Lessons.every(id => completedLessons.includes(id)) && !currentAchievements.includes("FOUNDATIONS_COMPLETE")) {
      newAchievements.push("FOUNDATIONS_COMPLETE");
      bonusXp += academyAchievements.FOUNDATIONS_COMPLETE.xp;
      hasChanges = true;
    }

    // Module 2 - Research Skills
    const module2Lessons = CURRICULUM[2].lessons.map(l => l.id);
    if (module2Lessons.every(id => completedLessons.includes(id)) && !currentAchievements.includes("SKILLS_COMPLETE")) {
      newAchievements.push("SKILLS_COMPLETE");
      bonusXp += academyAchievements.SKILLS_COMPLETE.xp;
      hasChanges = true;
    }

    // Module 3 - Lab Confidence (all modules complete)
    const module3Lessons = CURRICULUM[3].lessons.map(l => l.id);
    const allLessons = CURRICULUM.flatMap(m => m.lessons.map(l => l.id));
    if (module3Lessons.every(id => completedLessons.includes(id)) && 
        allLessons.every(id => completedLessons.includes(id)) && 
        !currentAchievements.includes("LAB_READY")) {
      newAchievements.push("LAB_READY");
      bonusXp += academyAchievements.LAB_READY.xp;
      hasChanges = true;
    }

    // Scholar achievement (500+ XP)
    const newTotalXp = localProgress.totalXp + bonusXp;
    if (newTotalXp >= 500 && !currentAchievements.includes("SCHOLAR")) {
      newAchievements.push("SCHOLAR");
      hasChanges = true;
    }

    if (hasChanges) {
      const updatedProgress = {
        ...localProgress,
        achievements: newAchievements,
        totalXp: newTotalXp,
      };
      setLocalProgress(updatedProgress);

      if (user) {
        updateProgressMutation.mutate({
          achievements: newAchievements,
          totalXp: newTotalXp,
        });
      }
    }
  }, [localProgress.completedLessons.length]); // Only run when completed lessons count changes

  // Track persona state for the quiz effect
  const currentPersona = localProgress.persona;
  
  useEffect(() => {
    // Show persona quiz if user hasn't selected one yet and auth check is complete
    // Use a small timeout to ensure component is fully mounted after age gate
    if (!authLoading && !currentPersona) {
      const timer = setTimeout(() => {
        setShowPersonaQuiz(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentPersona, authLoading]);

  // Listen for perfect quiz events from QuizSlide component
  useEffect(() => {
    const handlePerfectQuiz = () => {
      perfectQuizAchievedRef.current = true;
    };
    window.addEventListener('academyPerfectQuiz', handlePerfectQuiz);
    return () => window.removeEventListener('academyPerfectQuiz', handlePerfectQuiz);
  }, []);

  // Reset perfect quiz flag when selecting a new lesson
  useEffect(() => {
    perfectQuizAchievedRef.current = false;
  }, [selectedLesson]);

  const completeLesson = (lessonId: string, xp: number) => {
    if (localProgress.completedLessons.includes(lessonId)) return;

    const newCompleted = [...localProgress.completedLessons, lessonId];
    const newAchievements = [...localProgress.achievements];
    let bonusXp = 0;

    if (newCompleted.length === 1 && !newAchievements.includes("FIRST_LESSON")) {
      newAchievements.push("FIRST_LESSON");
      bonusXp += academyAchievements.FIRST_LESSON.xp;
    }

    const module0Lessons = CURRICULUM[0].lessons.map(l => l.id);
    if (module0Lessons.every(id => newCompleted.includes(id)) && !newAchievements.includes("ORIENTATION_COMPLETE")) {
      newAchievements.push("ORIENTATION_COMPLETE");
      bonusXp += academyAchievements.ORIENTATION_COMPLETE.xp;
    }

    const module1Lessons = CURRICULUM[1].lessons.map(l => l.id);
    if (module1Lessons.every(id => newCompleted.includes(id)) && !newAchievements.includes("FOUNDATIONS_COMPLETE")) {
      newAchievements.push("FOUNDATIONS_COMPLETE");
      bonusXp += academyAchievements.FOUNDATIONS_COMPLETE.xp;
    }

    // Check for Research Skills module completion (module 2)
    const module2Lessons = CURRICULUM[2].lessons.map(l => l.id);
    if (module2Lessons.every(id => newCompleted.includes(id)) && !newAchievements.includes("SKILLS_COMPLETE")) {
      newAchievements.push("SKILLS_COMPLETE");
      bonusXp += academyAchievements.SKILLS_COMPLETE.xp;
    }

    // Check for Lab Confidence module completion (module 3) - all modules complete = LAB_READY
    const module3Lessons = CURRICULUM[3].lessons.map(l => l.id);
    const allLessons = CURRICULUM.flatMap(m => m.lessons.map(l => l.id));
    if (module3Lessons.every(id => newCompleted.includes(id)) && 
        allLessons.every(id => newCompleted.includes(id)) && 
        !newAchievements.includes("LAB_READY")) {
      newAchievements.push("LAB_READY");
      bonusXp += academyAchievements.LAB_READY.xp;
    }

    // Check for perfect quiz achievement
    if (perfectQuizAchievedRef.current && !newAchievements.includes("PERFECT_QUIZ")) {
      newAchievements.push("PERFECT_QUIZ");
      bonusXp += academyAchievements.PERFECT_QUIZ.xp;
      perfectQuizAchievedRef.current = false; // Reset after consuming
    }

    const newTotalXp = localProgress.totalXp + xp + bonusXp;
    if (newTotalXp >= 500 && !newAchievements.includes("SCHOLAR")) {
      newAchievements.push("SCHOLAR");
    }

    const newProgress = {
      ...localProgress,
      completedLessons: newCompleted,
      achievements: newAchievements,
      totalXp: newTotalXp,
    };

    setLocalProgress(newProgress);

    if (user) {
      updateProgressMutation.mutate({
        completedLessons: newCompleted,
        achievements: newAchievements,
        totalXp: newTotalXp,
      });
    }
  };

  const selectPersona = (persona: string) => {
    const newProgress = { ...localProgress, persona };
    setLocalProgress(newProgress);
    setShowPersonaQuiz(false);

    if (user) {
      updateProgressMutation.mutate({ persona });
    }
  };

  const getTotalLessons = () => CURRICULUM.reduce((acc, module) => acc + module.lessons.length, 0);
  const getCompletedCount = () => localProgress.completedLessons.length;
  const getOverallProgress = () => (getCompletedCount() / getTotalLessons()) * 100;

  const getModuleProgress = (moduleId: number) => {
    const module = CURRICULUM[moduleId];
    const completed = module.lessons.filter(l => localProgress.completedLessons.includes(l.id)).length;
    return (completed / module.lessons.length) * 100;
  };

  const getPersonaConfig = () => {
    const persona = localProgress.persona as keyof typeof PERSONA_CONFIG;
    return persona ? PERSONA_CONFIG[persona] : null;
  };

  const isLessonUnlocked = (moduleId: number, lessonIndex: number) => {
    const personaConfig = getPersonaConfig();
    const unlockMode = personaConfig?.unlockMode || "linear";

    // Advanced users have full access to all lessons
    if (unlockMode === "full") return true;

    // First lesson is always unlocked
    if (moduleId === 0 && lessonIndex === 0) return true;

    // Check if previous modules are complete (required for all modes except "full")
    const allPreviousModuleLessons = CURRICULUM.slice(0, moduleId).flatMap(m => m.lessons.map(l => l.id));
    if (!allPreviousModuleLessons.every(id => localProgress.completedLessons.includes(id))) {
      return false;
    }

    // Module mode: Any lesson within an unlocked module is accessible
    if (unlockMode === "module") {
      return true; // Module is unlocked, so all lessons within it are accessible
    }

    // Linear mode: Must complete lessons in order
    const currentModuleLessons = CURRICULUM[moduleId].lessons.slice(0, lessonIndex).map(l => l.id);
    return currentModuleLessons.every(id => localProgress.completedLessons.includes(id));
  };

  const getRecommendedLesson = () => {
    const personaConfig = getPersonaConfig();
    
    // If persona has a recommended start and user hasn't started yet, use persona-specific recommendation
    if (personaConfig && localProgress.completedLessons.length === 0) {
      const recommended = findLessonById(personaConfig.recommendedStart);
      if (recommended && recommended.module && recommended.module.lessons) {
        const lessonIndex = recommended.module.lessons.findIndex(l => l.id === recommended.lesson.id);
        if (lessonIndex !== -1 && isLessonUnlocked(recommended.module.id, lessonIndex)) {
          return recommended;
        }
      }
    }
    
    // Find first incomplete unlocked lesson
    for (const module of CURRICULUM) {
      for (const lesson of module.lessons) {
        if (!localProgress.completedLessons.includes(lesson.id) && isLessonUnlocked(module.id, module.lessons.indexOf(lesson))) {
          return { lesson, module };
        }
      }
    }
    
    return null;
  };

  return (
    <>
      <SEOHead
        title="Peptide Academy | Revive Research"
        description="Get oriented to peptide research through our guided learning path. Build research literacy, understand best practices, and set proper expectations."
      />

      <div className="min-h-screen bg-[#1a1a1f]">
        <section className="relative overflow-hidden py-20 px-6">
          <div className="absolute inset-0 bg-gradient-to-br from-[#E7FB10]/10 via-transparent to-[#21d8ff]/10" />
          <div className="absolute inset-0">
            <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#E7FB10]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-[#21d8ff]/20 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <Badge className="mb-4 bg-[#E7FB10]/20 text-[#E7FB10] border-[#E7FB10]/30" data-testid="badge-academy">
                <Compass className="w-3 h-3 mr-1" />
                Guided Orientation
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                Peptide Research{" "}
                <span className="bg-gradient-to-r from-[#E7FB10] to-[#21d8ff] bg-clip-text text-transparent">
                  Academy
                </span>
              </h1>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                A structured introduction to peptide research. Learn the fundamentals, understand best practices, and set proper expectations before you begin.
              </p>
              <div 
                className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border mt-4"
                style={{
                  background: "rgba(33, 216, 255, 0.05)",
                  borderColor: "#21d8ff",
                }}
              >
                <BookOpen className="w-4 h-4 text-[#21d8ff] flex-shrink-0" />
                <span className="text-sm text-[#21d8ff]">Need quick reference?</span>
                <Link href="/guides/peptide-education-center" className="text-sm font-semibold px-3 py-1 rounded-full bg-[#21d8ff] text-black md:hover:bg-[#E7FB10] md:hover:scale-105 md:active:scale-105 md:hover:shadow-lg transition-all duration-200 cursor-pointer">
                  Education Center
                </Link>
              </div>
            </motion.div>

            {/* Learning Path - Hidden on mobile */}
            <div className="hidden md:block py-8 px-6">
              <HorizontalLearningPath
                modules={CURRICULUM}
                completedLessons={localProgress.completedLessons}
                onModuleClick={(moduleId) => {
                  const element = document.getElementById(`module-section-${moduleId}`);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              />
            </div>

            {/* Personalized Welcome Message */}
            {localProgress.persona && getPersonaConfig() && (
              <motion.div
                data-testid="personalized-dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="backdrop-blur-xl border rounded-2xl p-6"
                style={{ 
                  backgroundColor: `${getPersonaConfig()!.color}10`,
                  borderColor: `${getPersonaConfig()!.color}30`,
                }}
              >
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${getPersonaConfig()!.color}20` }}
                    >
                      {(() => {
                        const Icon = getPersonaConfig()!.icon;
                        return <Icon className="w-6 h-6" style={{ color: getPersonaConfig()!.color }} />;
                      })()}
                    </div>
                    <div>
                      <p className="text-white font-medium mb-1">{getPersonaConfig()!.welcomeMessage}</p>
                      <p className="text-sm text-white/60">{getPersonaConfig()!.description}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10 flex-shrink-0"
                    onClick={() => setShowPersonaQuiz(true)}
                    data-testid="button-change-persona"
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Change Experience Level
                  </Button>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8"
            >
              <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                <div className="flex items-center gap-6">
                  <ProgressRing progress={getOverallProgress()} size={80} strokeWidth={8} />
                  <div>
                    <h3 className="text-xl font-semibold text-white">Your Progress</h3>
                    <p className="text-white/60">
                      {getCompletedCount()} of {getTotalLessons()} lessons completed
                    </p>
                    {localProgress.persona && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge 
                          variant="outline" 
                          className="border-opacity-30"
                          style={{ 
                            borderColor: getPersonaConfig()?.color || "#21d8ff",
                            color: getPersonaConfig()?.color || "#21d8ff",
                          }}
                        >
                          {academyPersonas[localProgress.persona as keyof typeof academyPersonas]}
                        </Badge>
                        {getPersonaConfig()?.unlockMode === "full" && (
                          <Badge className="bg-[#9d4edd]/20 text-[#9d4edd] border-[#9d4edd]/30">
                            <Rocket className="w-3 h-3 mr-1" />
                            Full Access
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center px-4 py-2 bg-white/5 rounded-xl">
                    <div className="text-2xl font-bold text-[#E7FB10]">{localProgress.totalXp}</div>
                    <div className="text-xs text-white/60">Total XP</div>
                  </div>
                  <div className="text-center px-4 py-2 bg-white/5 rounded-xl">
                    <div className="text-2xl font-bold text-[#21d8ff]">{localProgress.achievements.length}</div>
                    <div className="text-xs text-white/60">Achievements</div>
                  </div>
                </div>
              </div>

              {/* Recommended Next Lesson */}
              {getRecommendedLesson() && getCompletedCount() < getTotalLessons() && (
                <div data-testid="recommended-section" className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-[#E7FB10]" />
                      <div>
                        <p className="text-sm text-white/60">Recommended Next</p>
                        <p className="text-white font-medium">{getRecommendedLesson()!.lesson.title}</p>
                      </div>
                    </div>
                    <Button
                      className="bg-[#E7FB10] text-black hover:bg-[#E7FB10]/90"
                      onClick={() => setSelectedLesson(getRecommendedLesson()!.lesson.id)}
                      data-testid="button-start-recommended"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Curriculum</h2>

                {CURRICULUM.map((module, moduleIndex) => {
                  const moduleProgress = getModuleProgress(module.id);
                  const personaConfig = getPersonaConfig();
                  const unlockMode = personaConfig?.unlockMode || "linear";
                  
                  // Advanced users have all modules unlocked
                  const isModuleUnlocked = unlockMode === "full" || moduleIndex === 0 || 
                    CURRICULUM.slice(0, moduleIndex).every(m => 
                      m.lessons.every(l => localProgress.completedLessons.includes(l.id))
                    );
                  const Icon = module.icon;

                  return (
                    <motion.div
                      key={module.id}
                      id={`module-section-${module.id}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: moduleIndex * 0.1 }}
                    >
                      <Card 
                        className={`bg-white/5 border-white/10 overflow-hidden ${
                          !isModuleUnlocked ? "opacity-60" : ""
                        }`}
                        data-testid={`card-module-${module.id}`}
                      >
                        <div className="p-6">
                          <div className="flex items-center gap-4 mb-4">
                            <div 
                              className="w-12 h-12 rounded-xl flex items-center justify-center"
                              style={{ backgroundColor: `${module.color}20` }}
                            >
                              <Icon className="w-6 h-6" style={{ color: module.color }} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold text-white">{module.title}</h3>
                                {!isModuleUnlocked && <Lock className="w-4 h-4 text-white/40" />}
                              </div>
                              <p className="text-sm text-white/60">{module.description}</p>
                            </div>
                            <ProgressRing progress={moduleProgress} size={50} color={module.color} />
                          </div>

                          <div className="space-y-2">
                            {module.lessons.map((lesson, lessonIndex) => {
                              const isCompleted = localProgress.completedLessons.includes(lesson.id);
                              const isUnlocked = isModuleUnlocked && isLessonUnlocked(module.id, lessonIndex);
                              const article = articles?.find(a => a.slug === lesson.articleSlug);

                              return (
                                <motion.div
                                  key={lesson.id}
                                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                                    isCompleted 
                                      ? "bg-green-500/10 border border-green-500/20 cursor-pointer hover:border-green-500/40 hover-elevate"
                                      : isUnlocked
                                        ? "bg-white/5 border border-white/10 hover:border-white/20 cursor-pointer hover-elevate"
                                        : "bg-white/[0.02] border border-white/5 opacity-50"
                                  }`}
                                  onClick={() => {
                                    if (isUnlocked || isCompleted) {
                                      setSelectedLesson(lesson.id);
                                    }
                                  }}
                                  data-testid={`lesson-${lesson.id}`}
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                  ) : isUnlocked ? (
                                    <Play className="w-5 h-5 text-[#E7FB10] flex-shrink-0" />
                                  ) : (
                                    <Lock className="w-5 h-5 text-white/20 flex-shrink-0" />
                                  )}
                                  <span className={`flex-1 ${isCompleted ? "text-green-400" : "text-white/80"}`}>
                                    {lesson.title}
                                  </span>
                                  <Badge 
                                    variant="secondary" 
                                    className={`text-xs ${
                                      isCompleted 
                                        ? "bg-green-500/20 text-green-400" 
                                        : "bg-white/10 text-white/60"
                                    }`}
                                  >
                                    +{lesson.xp} XP
                                  </Badge>
                                  {lesson.articleSlug && article && (
                                    <ChevronRight className="w-4 h-4 text-white/40" />
                                  )}
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Achievements</h2>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(academyAchievements).map((achievement) => (
                    <AchievementBadge
                      key={achievement.id}
                      achievement={achievement}
                      unlocked={localProgress.achievements.includes(achievement.id.toUpperCase())}
                    />
                  ))}
                </div>

                {/* Reward Milestones */}
                <Card className="bg-gradient-to-br from-[#E7FB10]/5 to-[#9d4edd]/5 border-[#E7FB10]/20 p-6 mt-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-[#E7FB10]" />
                    Reward Milestones
                  </h3>
                  <div className="space-y-3">
                    {REWARD_MILESTONES.map((milestone, index) => {
                      const isUnlocked = localProgress.totalXp >= milestone.xpRequired;
                      const progress = Math.min((localProgress.totalXp / milestone.xpRequired) * 100, 100);
                      const Icon = milestone.icon;
                      
                      return (
                        <div 
                          key={index}
                          data-testid={`milestone-${milestone.xpRequired}`}
                          className={`p-3 rounded-lg border transition-all ${
                            isUnlocked 
                              ? "bg-[#E7FB10]/10 border-[#E7FB10]/30" 
                              : "bg-white/5 border-white/10"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isUnlocked ? "bg-[#E7FB10]/20" : "bg-white/10"
                            }`}>
                              {isUnlocked ? (
                                <CheckCircle2 className="w-4 h-4 text-[#E7FB10]" />
                              ) : (
                                <Icon className="w-4 h-4 text-white/40" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className={`text-sm font-medium truncate ${isUnlocked ? "text-[#E7FB10]" : "text-white/80"}`}>
                                  {milestone.reward}
                                </span>
                                <Badge 
                                  variant="secondary" 
                                  className={`text-[10px] flex-shrink-0 ${
                                    isUnlocked 
                                      ? "bg-[#E7FB10]/20 text-[#E7FB10]" 
                                      : "bg-white/10 text-white/50"
                                  }`}
                                >
                                  {milestone.xpRequired} XP
                                </Badge>
                              </div>
                              {!isUnlocked && (
                                <div className="mt-1">
                                  <Progress value={progress} className="h-1" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                <Card className="bg-white/5 border-white/10 p-6 mt-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-[#21d8ff]" />
                    Quick Stats
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/60">Overall Progress</span>
                        <span className="text-white">{Math.round(getOverallProgress())}%</span>
                      </div>
                      <Progress value={getOverallProgress()} className="h-2" />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Lessons Completed</span>
                      <span className="text-white">{getCompletedCount()}/{getTotalLessons()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Achievements Earned</span>
                      <span className="text-white">{localProgress.achievements.length}/{Object.keys(academyAchievements).length}</span>
                    </div>
                  </div>
                </Card>

                {!user && (
                  <Card className="bg-gradient-to-br from-[#E7FB10]/10 to-[#21d8ff]/10 border-[#E7FB10]/20 p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Save Your Progress</h3>
                    <p className="text-sm text-white/60 mb-4">
                      Log in to sync your progress across devices and never lose your achievements.
                    </p>
                    <Button
                      className="w-full bg-[#E7FB10] text-black hover:bg-[#E7FB10]/90"
                      onClick={() => login()}
                      data-testid="button-login-save"
                    >
                      Log In to Save
                    </Button>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>

        <Dialog open={showPersonaQuiz} onOpenChange={setShowPersonaQuiz}>
          <DialogContent data-testid="persona-quiz-dialog" className="bg-[#1a1a1f] border-white/10 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-[#E7FB10]" />
                Personalize Your Journey
              </DialogTitle>
              <DialogDescription className="text-white/60">
                Tell us about your background so we can customize your learning path.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 mt-4">
              {PERSONA_QUESTIONS[0].options.map((option) => {
                const config = PERSONA_CONFIG[option.value as keyof typeof PERSONA_CONFIG];
                const isSelected = pendingPersona === option.value;
                const isCurrentPersona = localProgress.persona === option.value;
                const Icon = config.icon;
                
                return (
                  <button
                    key={option.value}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected 
                        ? "ring-2 ring-offset-2 ring-offset-[#1a1a1f]" 
                        : "border-white/10 hover:border-white/20"
                    }`}
                    style={{ 
                      borderColor: isSelected ? config.color : undefined,
                      backgroundColor: isSelected ? `${config.color}15` : "rgba(255,255,255,0.03)",
                      // @ts-ignore - ring color for Tailwind
                      "--tw-ring-color": isSelected ? config.color : undefined,
                    } as React.CSSProperties}
                    onClick={() => setPendingPersona(option.value)}
                    data-testid={`button-persona-${option.value}`}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${config.color}20` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: config.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium">{option.label}</span>
                          {isCurrentPersona && !isSelected && (
                            <Badge className="text-[10px] bg-white/10 text-white/60 border-0">
                              Current
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-white/50 mb-2">{config.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {config.features.slice(0, 2).map((feature, idx) => (
                            <Badge 
                              key={idx} 
                              variant="secondary" 
                              className="text-[10px] bg-white/5 text-white/40 border-0"
                            >
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: config.color }} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-2 mt-6">
              <Button
                className="w-full bg-[#E7FB10] text-black hover:bg-[#E7FB10]/90 font-medium"
                disabled={!pendingPersona}
                onClick={() => {
                  if (pendingPersona) {
                    selectPersona(pendingPersona);
                    setPendingPersona(null);
                  }
                }}
                data-testid="button-submit-persona"
              >
                {pendingPersona ? `Continue as ${pendingPersona.charAt(0).toUpperCase() + pendingPersona.slice(1)}` : "Select a learning path"}
              </Button>
              <Button
                variant="ghost"
                className="text-white/40 hover:text-white/60"
                onClick={() => {
                  setShowPersonaQuiz(false);
                  setPendingPersona(null);
                }}
                data-testid="button-skip-persona"
              >
                {localProgress.persona ? "Keep current selection" : "Skip for now"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <AnimatePresence>
          {selectedLesson && (
            <EmbeddedLessonViewer
              lessonId={selectedLesson}
              onClose={() => setSelectedLesson(null)}
              onComplete={completeLesson}
              onNavigate={(lessonId) => setSelectedLesson(lessonId)}
              completedLessons={localProgress.completedLessons}
              totalXp={localProgress.totalXp}
              persona={localProgress.persona}
              article={articles?.find((a) => {
                const lessonInfo = findLessonById(selectedLesson);
                return lessonInfo && a.slug === lessonInfo.lesson.articleSlug;
              })}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
