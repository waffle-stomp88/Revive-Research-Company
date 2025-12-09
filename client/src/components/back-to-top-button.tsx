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
      className="fixed top-40 right-8 z-50 px-4 py-2 rounded-md bg-[#E7FB10] text-black font-display font-semibold text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(231,251,16,0.4)] hover:shadow-[0_0_40px_rgba(231,251,16,0.6)] transition-all duration-300 hover-elevate"
      aria-label="Back to top"
      data-testid="button-back-to-top"
    >
      Back to Top
      <ArrowUp className="h-4 w-4" />
    </motion.button>
  );
}
