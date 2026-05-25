import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GalaxyNode } from "@/lib/galaxy-layout";

interface WarpBannerProps {
  warpingToNode: GalaxyNode | null;
  warpNonce: number;
}

/**
 * Full-screen center flash banner displayed when warping to a peptide star.
 * Shows "▸ WARPING TO {NAME}" in yellow monospace, holds 0.6s, fades out.
 */
export function WarpBanner({ warpingToNode, warpNonce }: WarpBannerProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Depend on warpNonce so repeated warps to the same node still retrigger
  useEffect(() => {
    if (!warpingToNode) return;
    setVisible(false);
    // Brief microtask gap so AnimatePresence can exit before re-entering
    const raf = requestAnimationFrame(() => {
      setVisible(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setVisible(false), 1200);
    });
    return () => {
      cancelAnimationFrame(raf);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warpNonce]);

  return (
    <AnimatePresence>
      {visible && warpingToNode && (
        <motion.div
          key={warpingToNode.id + "-warp-banner"}
          initial={{ opacity: 0, scale: 0.9, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.05, y: -4 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 50,
            pointerEvents: "none",
            fontFamily: "monospace",
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "#D4FF1F",
            background: "rgba(0,0,0,0.6)",
            border: "0.5px solid #D4FF1F",
            padding: "8px 18px",
            borderRadius: "2px",
            whiteSpace: "nowrap",
            textShadow: "0 0 12px #D4FF1F",
          }}
          data-testid="galaxy-warp-banner"
        >
          ▸ WARPING TO {warpingToNode.name.toUpperCase()}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
