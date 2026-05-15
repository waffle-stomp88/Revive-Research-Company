import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const SESSION_KEY = "galaxy-onboarded";

function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

interface GalaxyMobileOnboardingProps {
  onDismiss: () => void;
}

export function GalaxyMobileOnboarding({ onDismiss }: GalaxyMobileOnboardingProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isTouchDevice()) return;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      // sessionStorage unavailable — skip
      return;
    }
    setVisible(true);
  }, []);

  function handleEnter() {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // ignore
    }
    setVisible(false);
    // Give the exit animation a moment before telling the parent
    setTimeout(onDismiss, 400);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="galaxy-mobile-onboarding"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm px-6"
          data-testid="galaxy-mobile-onboarding"
        >
          {/* Ambient glow rings */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none overflow-hidden"
          >
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
              style={{
                width: "60vmax",
                height: "60vmax",
                background: "radial-gradient(circle, #E7FB10 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10"
              style={{
                width: "90vmax",
                height: "90vmax",
                background: "radial-gradient(circle, #21d8ff 0%, transparent 60%)",
              }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="relative flex flex-col items-center text-center max-w-xs"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E7FB10]/10 border border-[#E7FB10]/30 mb-6">
              <Sparkles className="h-3 w-3 text-[#E7FB10]" />
              <span className="text-[10px] uppercase tracking-wider font-mono font-semibold text-[#E7FB10]">
                Synergy Galaxy
              </span>
            </div>

            {/* Title */}
            <h1
              className="text-4xl font-bold text-white mb-2 leading-tight tracking-tight"
              style={{ fontFamily: "monospace" }}
            >
              The Peptide<br />Universe
            </h1>

            {/* Subtitle */}
            <p className="text-sm text-white/50 font-mono mb-8 leading-relaxed">
              Each star is a peptide.
              <br />
              Lines connect researched synergy pairs.
            </p>

            {/* Hint lines */}
            <div className="flex flex-col gap-2 mb-10 text-sm font-mono text-white/70">
              <span className="flex items-center gap-2">
                <span className="text-[#E7FB10] text-xs">▸</span>
                Tap a star to explore
              </span>
              <span className="flex items-center gap-2">
                <span className="text-[#21d8ff] text-xs">▸</span>
                Pinch to zoom
              </span>
              <span className="flex items-center gap-2">
                <span className="text-white/40 text-xs">▸</span>
                Drag to orbit
              </span>
            </div>

            {/* CTA */}
            <Button
              size="lg"
              onClick={handleEnter}
              className="bg-[#E7FB10] text-black hover:bg-[#E7FB10]/90 font-mono font-semibold px-8 min-h-[52px] w-full"
              data-testid="galaxy-onboarding-enter"
            >
              Enter Galaxy
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { isTouchDevice };
