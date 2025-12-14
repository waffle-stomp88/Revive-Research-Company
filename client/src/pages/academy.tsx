import { useState, useEffect } from "react";
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

const LESSON_CONTENT: Record<string, { title: string; sections: { heading: string; content: string; keyPoints?: string[] }[] }> = {
  "welcome": {
    title: "Welcome to Research",
    sections: [
      {
        heading: "Your Journey Begins",
        content: "Welcome to the Peptide Academy! This course will guide you through everything you need to know about peptide research. Whether you're completely new or have some experience, we'll help you become a confident researcher.",
        keyPoints: [
          "Learn at your own pace",
          "Earn XP and achievements as you progress",
          "Build real knowledge and skills"
        ]
      },
      {
        heading: "What You'll Learn",
        content: "Throughout this academy, you'll master the fundamentals of peptide research, including proper handling, storage, quality verification through COAs, and professional lab practices.",
        keyPoints: [
          "Understanding peptide basics",
          "Proper storage and handling",
          "Reading and verifying COAs",
          "Professional research practices"
        ]
      }
    ]
  },
  "what-is-peptide": {
    title: "What is a Peptide?",
    sections: [
      {
        heading: "The Building Blocks",
        content: "Peptides are short chains of amino acids linked by peptide bonds. They're smaller than proteins (typically 2-50 amino acids) and serve as signaling molecules in the body, influencing various biological processes.",
        keyPoints: [
          "2-50 amino acids linked together",
          "Smaller than proteins",
          "Act as signaling molecules"
        ]
      },
      {
        heading: "Why Peptides Matter in Research",
        content: "Peptides are crucial research tools because of their specificity and biological activity. Researchers study peptides to understand cellular communication, develop new therapeutic approaches, and explore various biological mechanisms.",
        keyPoints: [
          "High specificity to targets",
          "Diverse biological functions",
          "Important for understanding cellular processes"
        ]
      },
      {
        heading: "Common Peptide Categories",
        content: "Research peptides fall into several categories based on their biological targets and mechanisms. Some influence growth hormone pathways, others affect metabolic processes, and some target specific cellular receptors.",
      }
    ]
  },
  "research-only": {
    title: "Research Use Only",
    sections: [
      {
        heading: "Understanding RUO Classification",
        content: "All peptides sold by Revive Research are strictly for Research Use Only (RUO). This means they are intended exclusively for in-vitro laboratory research and are not approved for human or animal use.",
        keyPoints: [
          "For laboratory research only",
          "Not for human consumption",
          "Not for veterinary use"
        ]
      },
      {
        heading: "Your Responsibilities as a Researcher",
        content: "As a researcher purchasing RUO compounds, you acknowledge that these materials will be used solely for legitimate research purposes. This includes proper documentation, safe handling practices, and compliance with all applicable regulations.",
        keyPoints: [
          "Maintain proper documentation",
          "Follow safe handling procedures",
          "Comply with local regulations"
        ]
      },
      {
        heading: "Why This Matters",
        content: "The RUO classification exists to ensure peptides reach qualified researchers while maintaining regulatory compliance. This framework protects both the research community and ensures the continued availability of research compounds."
      }
    ]
  },
  "legal-landscape": {
    title: "Legal Landscape",
    sections: [
      {
        heading: "Regulatory Framework",
        content: "Research peptides operate within a specific regulatory framework. In the United States, peptides for research are not FDA-approved drugs and must be clearly labeled and sold as research chemicals only.",
        keyPoints: [
          "Not FDA-approved drugs",
          "Sold as research chemicals",
          "Must be properly labeled"
        ]
      },
      {
        heading: "Compliance Requirements",
        content: "Legitimate peptide suppliers maintain strict compliance standards including proper labeling, documentation, and quality testing. As a researcher, ensuring you purchase from compliant suppliers protects your research integrity.",
        keyPoints: [
          "Purchase from verified suppliers",
          "Verify COA documentation",
          "Maintain purchase records"
        ]
      },
      {
        heading: "International Considerations",
        content: "Regulations vary by country. Researchers should familiarize themselves with local laws regarding research chemicals before ordering. Some jurisdictions may have specific import requirements or restrictions."
      }
    ]
  },
  "your-first-order": {
    title: "Your First Order",
    sections: [
      {
        heading: "What to Expect",
        content: "When you place your first order with Revive Research, here's what happens: Your order is processed, quality-checked, and carefully packaged for safe delivery. We include relevant documentation with every shipment.",
        keyPoints: [
          "Fast processing and shipping",
          "Careful packaging for stability",
          "Documentation included"
        ]
      },
      {
        heading: "Receiving Your Order",
        content: "Upon receipt, inspect your package for any damage. Check that all items are present and match your order. Store products according to their specific requirements immediately upon arrival.",
        keyPoints: [
          "Inspect packaging on arrival",
          "Verify order contents",
          "Store properly right away"
        ]
      },
      {
        heading: "Getting Started",
        content: "Before using any research compounds, review the COA, ensure proper storage conditions are met, and have all necessary equipment ready. Proper preparation leads to better research outcomes."
      }
    ]
  },
  "purity-basics": {
    title: "Understanding Purity",
    sections: [
      {
        heading: "What is Peptide Purity?",
        content: "Purity measures the percentage of the target peptide in a sample versus impurities. High-performance liquid chromatography (HPLC) is the gold standard for measuring purity. Research-grade peptides typically have 98%+ purity.",
        keyPoints: [
          "HPLC testing is the standard",
          "98%+ is research-grade purity",
          "Higher purity = more reliable results"
        ]
      },
      {
        heading: "Why Purity Matters",
        content: "Impurities can interfere with research results, cause unexpected reactions, or make it difficult to replicate experiments. Using high-purity peptides ensures your research data is accurate and reproducible.",
        keyPoints: [
          "Affects research accuracy",
          "Impacts reproducibility",
          "Determines compound reliability"
        ]
      },
      {
        heading: "Reading Purity on COAs",
        content: "Every COA from Revive Research includes HPLC purity data. Look for the main peak percentage and check for significant impurity peaks. A clean chromatogram with one dominant peak indicates high purity."
      }
    ]
  },
  "lyophilization": {
    title: "Lyophilization Process",
    sections: [
      {
        heading: "What is Lyophilization?",
        content: "Lyophilization, or freeze-drying, is the process used to convert peptide solutions into stable powder form. The peptide solution is frozen, then the ice is removed through sublimation under vacuum.",
        keyPoints: [
          "Freeze-drying process",
          "Removes water without heat",
          "Creates stable powder form"
        ]
      },
      {
        heading: "Why Lyophilized Peptides?",
        content: "Lyophilization dramatically extends shelf life by removing water that could degrade the peptide. Properly lyophilized peptides remain stable for extended periods when stored correctly.",
        keyPoints: [
          "Extended shelf life",
          "Greater stability",
          "Easier to store and transport"
        ]
      },
      {
        heading: "Working with Lyophilized Peptides",
        content: "Lyophilized peptides appear as a white or off-white powder. They must be reconstituted before use. Always use sterile bacteriostatic water or other appropriate solvents for reconstitution."
      }
    ]
  },
  "stability": {
    title: "Peptide Stability",
    sections: [
      {
        heading: "Factors Affecting Stability",
        content: "Peptide stability depends on temperature, light exposure, humidity, and the specific peptide sequence. Understanding these factors helps you maintain compound integrity throughout your research.",
        keyPoints: [
          "Temperature is critical",
          "Light can degrade peptides",
          "Humidity affects stability"
        ]
      },
      {
        heading: "Storage Best Practices",
        content: "Lyophilized peptides should be stored at -20°C or colder. Reconstituted peptides have shorter stability windows and should be stored at 2-8°C. Aliquoting prevents repeated freeze-thaw cycles.",
        keyPoints: [
          "Lyophilized: -20°C or colder",
          "Reconstituted: 2-8°C",
          "Aliquot to prevent degradation"
        ]
      },
      {
        heading: "Signs of Degradation",
        content: "Degraded peptides may show color changes, clumping, or reduced activity. If you notice any unusual appearance or inconsistent research results, the compound may have degraded."
      }
    ]
  },
  "reconstitution": {
    title: "Complete Reconstitution Guide",
    sections: [
      {
        heading: "Before You Begin",
        content: "Gather all necessary supplies: sterile bacteriostatic water, alcohol swabs, syringes, and sterile vials. Work in a clean environment and sanitize your workspace.",
        keyPoints: [
          "Use bacteriostatic water",
          "Sterilize everything",
          "Work in clean conditions"
        ]
      },
      {
        heading: "The Reconstitution Process",
        content: "Slowly add diluent to the vial, directing the stream against the vial wall to prevent foaming. Never shake vigorously—gently swirl or roll the vial until the powder dissolves completely.",
        keyPoints: [
          "Add diluent slowly",
          "Direct against vial wall",
          "Swirl gently, never shake"
        ]
      },
      {
        heading: "Calculating Concentrations",
        content: "Determine your desired concentration before reconstituting. For example, adding 2mL of diluent to a 10mg vial creates a 5mg/mL solution. Document your calculations and final concentration."
      },
      {
        heading: "Post-Reconstitution Care",
        content: "Store reconstituted peptides at 2-8°C and use within the recommended timeframe. Label vials with reconstitution date and concentration. Most peptides are stable for 2-4 weeks after reconstitution."
      }
    ]
  },
  "reading-coas": {
    title: "How to Read COAs",
    sections: [
      {
        heading: "What is a COA?",
        content: "A Certificate of Analysis (COA) is a document from an independent laboratory confirming the identity, purity, and quality of a peptide batch. It's your guarantee of compound authenticity.",
        keyPoints: [
          "Third-party verification",
          "Confirms identity and purity",
          "Essential quality document"
        ]
      },
      {
        heading: "Key COA Components",
        content: "Look for: batch number, testing date, molecular weight confirmation, HPLC purity percentage, and mass spectrometry data. Each element verifies a different aspect of quality.",
        keyPoints: [
          "Batch number for traceability",
          "HPLC for purity",
          "Mass spec for identity"
        ]
      },
      {
        heading: "Interpreting HPLC Data",
        content: "The HPLC chromatogram shows peaks representing different compounds. The main peak should represent your target peptide at 98%+ purity. Small secondary peaks indicate minor impurities."
      },
      {
        heading: "Red Flags to Watch",
        content: "Be wary of missing test dates, unusually round numbers, missing chromatograms, or COAs without independent lab verification. Legitimate suppliers provide complete, verifiable documentation."
      }
    ]
  },
  "literature-review": {
    title: "Literature Review Basics",
    sections: [
      {
        heading: "Starting Your Research",
        content: "Before any experiment, review existing literature on your peptide of interest. Use databases like PubMed, Google Scholar, and scientific journals to find relevant studies.",
        keyPoints: [
          "Search PubMed and Google Scholar",
          "Review recent publications",
          "Understand existing findings"
        ]
      },
      {
        heading: "Evaluating Sources",
        content: "Not all sources are equal. Prioritize peer-reviewed journal articles over blog posts or promotional content. Check publication dates to ensure relevance.",
        keyPoints: [
          "Prioritize peer-reviewed sources",
          "Check publication dates",
          "Verify author credentials"
        ]
      },
      {
        heading: "Organizing Your Findings",
        content: "Keep detailed notes on relevant studies, including methodologies, dosing protocols, and key findings. This documentation supports your research design and helps interpret results."
      }
    ]
  },
  "lab-safety": {
    title: "Lab Safety Essentials",
    sections: [
      {
        heading: "Personal Protective Equipment",
        content: "Always wear appropriate PPE when handling research compounds. This typically includes lab coat, nitrile gloves, and safety glasses. Change gloves between handling different compounds.",
        keyPoints: [
          "Lab coat required",
          "Nitrile gloves (change frequently)",
          "Safety glasses recommended"
        ]
      },
      {
        heading: "Handling Procedures",
        content: "Work in well-ventilated areas. Avoid creating aerosols when working with powdered compounds. Clean up spills immediately using appropriate methods.",
        keyPoints: [
          "Good ventilation essential",
          "Avoid aerosol creation",
          "Clean spills immediately"
        ]
      },
      {
        heading: "Waste Disposal",
        content: "Dispose of research materials according to local regulations. Never pour compounds down drains. Use appropriate sharps containers for needles and broken glass."
      }
    ]
  },
  "documentation": {
    title: "Proper Documentation",
    sections: [
      {
        heading: "Lab Notebook Practices",
        content: "Maintain a detailed lab notebook with dates, procedures, observations, and results. Write in permanent ink, never erase—cross out errors with a single line. This creates a legal record of your work.",
        keyPoints: [
          "Date every entry",
          "Use permanent ink",
          "Never erase—strike through errors"
        ]
      },
      {
        heading: "Recording Experiments",
        content: "Document: hypothesis, materials used (including batch numbers), exact procedures, environmental conditions, observations, and results. Include both successful and failed experiments.",
        keyPoints: [
          "Record batch numbers",
          "Note environmental conditions",
          "Document failures too"
        ]
      },
      {
        heading: "Data Organization",
        content: "Organize data systematically for easy retrieval. Use consistent naming conventions for files and samples. Back up digital data regularly and keep physical notebooks in a secure location."
      }
    ]
  },
  "putting-together": {
    title: "Putting It All Together",
    sections: [
      {
        heading: "Planning Your Research",
        content: "Before starting any research project, create a detailed plan. Review literature, gather materials, verify compound quality, prepare your workspace, and ensure all safety protocols are in place.",
        keyPoints: [
          "Complete literature review first",
          "Verify all compound COAs",
          "Prepare workspace and equipment"
        ]
      },
      {
        heading: "Execution Best Practices",
        content: "Follow your documented procedures precisely. Take detailed notes throughout. If something unexpected occurs, document it thoroughly—these observations often lead to important insights.",
        keyPoints: [
          "Follow protocols exactly",
          "Document everything",
          "Note unexpected observations"
        ]
      },
      {
        heading: "Quality Control",
        content: "Build quality checks into your process. Verify compound appearance and stability. Run controls alongside experiments. Question results that seem too good—or too bad—to be true."
      }
    ]
  },
  "troubleshooting": {
    title: "Troubleshooting Common Issues",
    sections: [
      {
        heading: "Reconstitution Problems",
        content: "If powder won't dissolve: try gentle warming to room temperature, use fresh diluent, or allow more time. Never heat peptides directly or shake vigorously.",
        keyPoints: [
          "Allow time for full dissolution",
          "Use fresh, proper diluent",
          "Never heat or shake vigorously"
        ]
      },
      {
        heading: "Storage Issues",
        content: "If you suspect storage problems: check for color changes or unusual appearance. Temperature excursions can cause degradation. When in doubt, contact the supplier about replacement.",
        keyPoints: [
          "Check for visual changes",
          "Monitor storage temperatures",
          "Contact supplier if concerned"
        ]
      },
      {
        heading: "Inconsistent Results",
        content: "Variability often comes from: different batches (always note batch numbers), technique variations, or degraded compounds. Standardize procedures and use controls to identify the source."
      }
    ]
  },
  "advanced-tips": {
    title: "Advanced Research Tips",
    sections: [
      {
        heading: "Optimizing Stability",
        content: "Advanced researchers aliquot compounds into single-use portions immediately after reconstitution. This prevents repeated freeze-thaw cycles and maintains optimal compound integrity.",
        keyPoints: [
          "Aliquot immediately after reconstitution",
          "Use single-use portions",
          "Minimize freeze-thaw cycles"
        ]
      },
      {
        heading: "Advanced Storage Techniques",
        content: "For long-term storage, consider adding lyoprotectants when reconstituting. Argon or nitrogen blankets can prevent oxidation. Ultra-low freezers (-80°C) extend stability further.",
        keyPoints: [
          "Consider lyoprotectants",
          "Inert gas for oxidation prevention",
          "Ultra-low temperatures for long-term"
        ]
      },
      {
        heading: "Building Research Networks",
        content: "Connect with other researchers in your field. Attend conferences, participate in online forums, and collaborate when possible. Shared knowledge accelerates everyone's progress."
      }
    ]
  },
  "certification": {
    title: "Certification Quiz",
    sections: [
      {
        heading: "Congratulations!",
        content: "You've reached the final lesson of the Peptide Academy! You've learned about peptide fundamentals, proper handling and storage, quality verification, and professional research practices.",
        keyPoints: [
          "Completed all academy modules",
          "Mastered research fundamentals",
          "Ready for professional research"
        ]
      },
      {
        heading: "Key Takeaways",
        content: "Remember: always verify compound quality through COAs, maintain proper storage conditions, document everything, and follow safety protocols. These practices ensure reliable, reproducible research.",
        keyPoints: [
          "Verify COAs for every batch",
          "Proper storage is essential",
          "Documentation enables reproducibility"
        ]
      },
      {
        heading: "Your Certification",
        content: "By completing this academy, you've demonstrated commitment to quality research practices. You're now equipped with the knowledge to conduct professional peptide research. Keep learning and exploring!",
        keyPoints: [
          "Academy completion achieved",
          "Ready for real research",
          "Continue learning and growing"
        ]
      }
    ]
  }
};

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
  onNavigate,
  completedLessons,
  totalXp,
  article,
}: {
  lessonId: string;
  onClose: () => void;
  onComplete: (lessonId: string, xp: number) => void;
  onNavigate: (lessonId: string) => void;
  completedLessons: string[];
  totalXp: number;
  article?: EducationArticle | null;
}) {
  const lessonContent = LESSON_CONTENT[lessonId];
  const lessonInfo = findLessonById(lessonId);
  const isCompleted = completedLessons.includes(lessonId);
  const { prev, next } = getAdjacentLessons(lessonId, completedLessons);

  if (!lessonInfo) return null;

  const { lesson, module } = lessonInfo;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#1a1a1f]/95 backdrop-blur-sm"
    >
      <div className="h-full flex flex-col lg:flex-row">
        <div className="lg:w-80 border-b lg:border-b-0 lg:border-r border-white/10 bg-[#1a1a1f] p-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white/60 hover:text-white"
              data-testid="button-close-lesson"
            >
              <X className="w-5 h-5" />
            </Button>
            <Badge className="bg-[#E7FB10]/20 text-[#E7FB10] border-[#E7FB10]/30">
              <Zap className="w-3 h-3 mr-1" />
              {totalXp} XP
            </Badge>
          </div>

          <div className="mb-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: `${module.color}20` }}
            >
              <module.icon className="w-6 h-6" style={{ color: module.color }} />
            </div>
            <p className="text-sm text-white/60 mb-1">{module.title}</p>
            <h2 className="text-xl font-bold text-white">{lesson.title}</h2>
            {isCompleted && (
              <Badge className="mt-2 bg-green-500/20 text-green-400 border-0">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>

          <div className="hidden lg:block space-y-2">
            <p className="text-xs text-white/40 uppercase tracking-wide mb-3">Module Lessons</p>
            {module.lessons.map((l, idx) => {
              const isCurrentLesson = l.id === lessonId;
              const isLessonCompleted = completedLessons.includes(l.id);
              return (
                <div
                  key={l.id}
                  className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                    isCurrentLesson
                      ? "bg-white/10 text-white"
                      : isLessonCompleted
                      ? "text-green-400/60"
                      : "text-white/40"
                  }`}
                >
                  {isLessonCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : isCurrentLesson ? (
                    <Play className="w-4 h-4 text-[#E7FB10]" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-white/20" />
                  )}
                  <span className="truncate">{l.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-6 lg:p-10">
            <div className="max-w-3xl mx-auto">
              {article?.content ? (
                <div className="prose prose-invert prose-lg max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: article.content }} />
                </div>
              ) : lessonContent ? (
                <div className="space-y-8">
                  {lessonContent.sections.map((section, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="space-y-4"
                    >
                      <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#E7FB10]/20 flex items-center justify-center">
                          <span className="text-sm font-bold text-[#E7FB10]">{idx + 1}</span>
                        </div>
                        {section.heading}
                      </h3>
                      <p className="text-white/70 leading-relaxed text-lg">{section.content}</p>
                      {section.keyPoints && (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-4">
                          <p className="text-sm text-white/40 uppercase tracking-wide mb-3">Key Points</p>
                          <ul className="space-y-2">
                            {section.keyPoints.map((point, pidx) => (
                              <li key={pidx} className="flex items-start gap-2 text-white/80">
                                <CheckCircle2 className="w-4 h-4 text-[#21d8ff] mt-1 flex-shrink-0" />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <BookOpen className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60">Lesson content is coming soon.</p>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t border-white/10 p-4 bg-[#1a1a1f]">
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
              <div>
                {prev && (
                  <Button
                    variant="ghost"
                    className="text-white/60 hover:text-white"
                    onClick={() => onNavigate(prev.id)}
                    data-testid="button-prev-lesson"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {!isCompleted && (
                  <Button
                    className="bg-[#E7FB10] text-black hover:bg-[#E7FB10]/90"
                    onClick={() => onComplete(lessonId, lesson.xp)}
                    data-testid="button-complete-lesson"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete Lesson (+{lesson.xp} XP)
                  </Button>
                )}

                {next && (
                  <Button
                    variant={isCompleted ? "default" : "outline"}
                    className={isCompleted ? "bg-[#21d8ff] text-black hover:bg-[#21d8ff]/90" : "border-white/20"}
                    onClick={() => onNavigate(next.id)}
                    data-testid="button-next-lesson"
                  >
                    Next Lesson
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}

                {!next && isCompleted && (
                  <Button
                    className="bg-green-500 text-white hover:bg-green-500/90"
                    onClick={onClose}
                    data-testid="button-finish-module"
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Back to Curriculum
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
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
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
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
                                    if (isUnlocked) {
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

        <AnimatePresence>
          {selectedLesson && (
            <EmbeddedLessonViewer
              lessonId={selectedLesson}
              onClose={() => setSelectedLesson(null)}
              onComplete={completeLesson}
              onNavigate={(lessonId) => setSelectedLesson(lessonId)}
              completedLessons={localProgress.completedLessons}
              totalXp={localProgress.totalXp}
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
