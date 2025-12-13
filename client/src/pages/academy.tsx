import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SEOHead } from "@/components/seo-head";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Link } from "wouter";
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
} from "lucide-react";
import type { AcademyProgress, EducationArticle } from "@shared/schema";
import { academyPersonas, academyAchievements } from "@shared/schema";

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
      { id: "purity-basics", title: "Understanding Purity", articleSlug: "understanding-peptide-purity", xp: 20 },
      { id: "lyophilization", title: "Lyophilization Process", articleSlug: null, xp: 20 },
      { id: "stability", title: "Peptide Stability", articleSlug: "storage-101", xp: 20 },
      { id: "reconstitution", title: "Complete Reconstitution Guide", articleSlug: "complete-guide-to-peptide-reconstitution", xp: 25 },
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
      { id: "certification", title: "Certification Quiz", articleSlug: null, xp: 50 },
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

export default function Academy() {
  const { user, isLoading: authLoading } = useAuth();
  const [showPersonaQuiz, setShowPersonaQuiz] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
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

  useEffect(() => {
    if (!localProgress.persona && !authLoading) {
      setShowPersonaQuiz(true);
    }
  }, [localProgress.persona, authLoading]);

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

  const isLessonUnlocked = (moduleId: number, lessonIndex: number) => {
    if (moduleId === 0 && lessonIndex === 0) return true;

    const allPreviousModuleLessons = CURRICULUM.slice(0, moduleId).flatMap(m => m.lessons.map(l => l.id));
    if (!allPreviousModuleLessons.every(id => localProgress.completedLessons.includes(id))) {
      return false;
    }

    const currentModuleLessons = CURRICULUM[moduleId].lessons.slice(0, lessonIndex).map(l => l.id);
    return currentModuleLessons.every(id => localProgress.completedLessons.includes(id));
  };

  return (
    <>
      <SEOHead
        title="Peptide Academy | Revive Research"
        description="Learn peptide research fundamentals through our guided learning experience. Track your progress, earn achievements, and become a confident researcher."
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
                <GraduationCap className="w-3 h-3 mr-1" />
                Peptide Academy
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                Master Research{" "}
                <span className="bg-gradient-to-r from-[#E7FB10] to-[#21d8ff] bg-clip-text text-transparent">
                  Fundamentals
                </span>
              </h1>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                Your guided path from beginner to confident researcher. Track progress, earn achievements, and build real expertise.
              </p>
            </motion.div>

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
                      <Badge variant="outline" className="mt-2 border-[#21d8ff]/30 text-[#21d8ff]">
                        {academyPersonas[localProgress.persona as keyof typeof academyPersonas]}
                      </Badge>
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
                  const isModuleUnlocked = moduleIndex === 0 || 
                    CURRICULUM.slice(0, moduleIndex).every(m => 
                      m.lessons.every(l => localProgress.completedLessons.includes(l.id))
                    );
                  const Icon = module.icon;

                  return (
                    <motion.div
                      key={module.id}
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
                                      ? "bg-green-500/10 border border-green-500/20"
                                      : isUnlocked
                                        ? "bg-white/5 border border-white/10 hover:border-white/20 cursor-pointer hover-elevate"
                                        : "bg-white/[0.02] border border-white/5 opacity-50"
                                  }`}
                                  onClick={() => {
                                    if (isUnlocked && !isCompleted) {
                                      if (lesson.articleSlug && article) {
                                        completeLesson(lesson.id, lesson.xp);
                                        window.location.href = `/education/${lesson.articleSlug}`;
                                      } else {
                                        completeLesson(lesson.id, lesson.xp);
                                      }
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
                      onClick={() => window.location.href = "/api/login"}
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
          <DialogContent className="bg-[#1a1a1f] border-white/10 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-[#E7FB10]" />
                Personalize Your Journey
              </DialogTitle>
              <DialogDescription className="text-white/60">
                Tell us about your background so we can customize your learning path.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {PERSONA_QUESTIONS[0].options.map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  className="w-full justify-start h-auto p-4 border-white/10 hover:border-[#E7FB10]/50 hover:bg-[#E7FB10]/10 text-left"
                  onClick={() => selectPersona(option.value)}
                  data-testid={`button-persona-${option.value}`}
                >
                  <div className="flex items-center gap-3">
                    {option.value === "beginner" && <Lightbulb className="w-5 h-5 text-[#21d8ff]" />}
                    {option.value === "intermediate" && <Beaker className="w-5 h-5 text-[#E7FB10]" />}
                    {option.value === "advanced" && <FlaskConical className="w-5 h-5 text-[#9d4edd]" />}
                    <span className="text-white">{option.label}</span>
                  </div>
                </Button>
              ))}
            </div>

            <Button
              variant="ghost"
              className="mt-4 text-white/40 hover:text-white/60"
              onClick={() => setShowPersonaQuiz(false)}
              data-testid="button-skip-persona"
            >
              Skip for now
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
