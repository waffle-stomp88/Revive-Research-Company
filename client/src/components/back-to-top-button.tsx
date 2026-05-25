import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUp } from "lucide-react";

export function BackToTopButton() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [0, 1]);
  const pointerEvents = useTransform(scrollY, [0, 300], ["none", "auto"] as any);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.button
      onClick={scrollToTop}
      style={{ opacity, pointerEvents }}
      className="fixed bottom-40 right-4 md:bottom-auto md:top-40 md:right-6 z-[35] px-2 md:px-4 py-2 rounded-md bg-[#D4FF1F] text-black font-display font-semibold text-xs md:text-sm flex items-center gap-1.5 md:gap-2 shadow-[0_0_20px_rgba(212, 255, 31,0.4)] md:hover:shadow-[0_0_40px_rgba(212, 255, 31,0.6)] transition-all duration-300 hover-elevate"
      aria-label="Back to top"
      data-testid="button-back-to-top"
    >
      <span className="hidden md:inline">Back to Top</span>
      <ArrowUp className="h-4 w-4" />
    </motion.button>
  );
}
