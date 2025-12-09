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
      className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-[#E7FB10] text-black shadow-[0_0_30px_rgba(231,251,16,0.4)] hover:shadow-[0_0_50px_rgba(231,251,16,0.6)] transition-all duration-300 hover-elevate"
      aria-label="Back to top"
      data-testid="button-back-to-top"
    >
      <ArrowUp className="h-5 w-5" />
    </motion.button>
  );
}
