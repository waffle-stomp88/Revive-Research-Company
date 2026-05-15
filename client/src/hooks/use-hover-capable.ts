import { useMemo } from "react";
import type { TargetAndTransition } from "framer-motion";

export function useHoverCapable(): boolean {
  return useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover)").matches,
    []
  );
}

export function hoverIf(
  capable: boolean,
  props: TargetAndTransition
): TargetAndTransition {
  return capable ? props : {};
}
