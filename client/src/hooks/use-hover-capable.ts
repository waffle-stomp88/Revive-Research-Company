import { useMemo } from "react";

export function useHoverCapable(): boolean {
  return useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover)").matches,
    []
  );
}
