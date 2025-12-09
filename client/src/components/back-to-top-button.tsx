import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUp } from "lucide-react";

export function BackToTopButton() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [0, 1]);
  const pointerEvents = useTransform(scrollY, [0, 300], ["none", "auto"] as any);
  const scale = useTransform(scrollY, [0, 300], [0.8, 1]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.div
      style={{ opacity, pointerEvents, scale }}
      className="fixed top-24 left-1/2 -translate-x-1/2 z-50"
    >
      <motion.button
        onClick={scrollToTop}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#E7FB10] to-[#E7FB10]/90 text-black shadow-[0_0_40px_rgba(231,251,16,0.5)] hover:shadow-[0_0_60px_rgba(231,251,16,0.8)] transition-all duration-300"
        aria-label="Back to top"
        data-testid="button-back-to-top"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#21d8ff]/30 to-transparent pointer-events-none" />
        <ArrowUp className="h-6 w-6 relative z-10" />
      </motion.button>
    </motion.div>
  );
}
