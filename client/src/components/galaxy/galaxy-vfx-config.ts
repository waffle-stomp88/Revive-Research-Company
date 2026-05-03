export type GalaxyVfxVariant = "cinematic" | "minimal";

export interface GalaxyVfxConfig {
  bloom: {
    strength: number;
    radius: number;
    threshold: number;
  };
  halo: {
    baseScale: number;
    hoverScale: number;
    selectedScale: number;
    baseAlpha: number;
    hoverAlpha: number;
    pulseAmount: number;
  };
  edges: {
    pulseStrength: number;
    pulseSpeed: number;
    baseGlow: number;
  };
}

export const GALAXY_VFX: Record<GalaxyVfxVariant, GalaxyVfxConfig> = {
  cinematic: {
    bloom: { strength: 1.05, radius: 0.85, threshold: 0.0 },
    halo: {
      baseScale: 2.6,
      hoverScale: 5.2,
      selectedScale: 4.4,
      baseAlpha: 0.55,
      hoverAlpha: 1.0,
      pulseAmount: 0.18,
    },
    edges: {
      pulseStrength: 1.2,
      pulseSpeed: 0.55,
      baseGlow: 0.55,
    },
  },
  minimal: {
    bloom: { strength: 0.45, radius: 0.6, threshold: 0.15 },
    halo: {
      baseScale: 2.0,
      hoverScale: 3.6,
      selectedScale: 3.1,
      baseAlpha: 0.32,
      hoverAlpha: 0.7,
      pulseAmount: 0.1,
    },
    edges: {
      pulseStrength: 0.55,
      pulseSpeed: 0.4,
      baseGlow: 0.35,
    },
  },
};

export function resolveVfxVariant(raw: string | null | undefined): GalaxyVfxVariant {
  if (raw === "minimal") return "minimal";
  return "cinematic";
}
