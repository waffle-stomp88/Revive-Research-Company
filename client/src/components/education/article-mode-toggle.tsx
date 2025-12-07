import { motion } from "framer-motion";
import { BookOpen, Zap, GraduationCap, Sparkles } from "lucide-react";

type ArticleMode = "deep-dive" | "quick-breakdown";

interface ArticleModeToggleProps {
  mode: ArticleMode;
  onModeChange: (mode: ArticleMode) => void;
}

export function ArticleModeToggle({ mode, onModeChange }: ArticleModeToggleProps) {
  return (
    <div className="flex items-center gap-2 p-1 rounded-lg bg-muted/50 border border-border" data-testid="article-mode-toggle">
      <button
        onClick={() => onModeChange("quick-breakdown")}
        aria-pressed={mode === "quick-breakdown"}
        className={`relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
          mode === "quick-breakdown"
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
        data-testid="toggle-quick-breakdown"
      >
        {mode === "quick-breakdown" && (
          <motion.div
            layoutId="activeMode"
            className="absolute inset-0 bg-gradient-to-r from-[#22c55e] to-[#16a34a] rounded-md"
            style={{ boxShadow: "0 0 20px rgba(34, 197, 94, 0.3)" }}
            transition={{ type: "spring", duration: 0.4 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Quick Breakdown
        </span>
      </button>
      
      <button
        onClick={() => onModeChange("deep-dive")}
        aria-pressed={mode === "deep-dive"}
        className={`relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
          mode === "deep-dive"
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
        data-testid="toggle-deep-dive"
      >
        {mode === "deep-dive" && (
          <motion.div
            layoutId="activeMode"
            className="absolute inset-0 bg-gradient-to-r from-[#9d4edd] to-[#7c3aed] rounded-md"
            style={{ boxShadow: "0 0 20px rgba(157, 78, 221, 0.3)" }}
            transition={{ type: "spring", duration: 0.4 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />
          Deep Dive
        </span>
      </button>
    </div>
  );
}

export function BeginnerBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/30">
      <Sparkles className="h-3 w-3 text-[#22c55e]" />
      <span className="text-xs font-medium text-[#22c55e]">Beginner Friendly</span>
    </div>
  );
}

export function ResearchDisclaimer() {
  return (
    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200/90">
      <strong className="text-amber-400">Research Use Only:</strong> All peptides discussed are intended 
      solely for laboratory and research purposes. Not for human consumption.
    </div>
  );
}
