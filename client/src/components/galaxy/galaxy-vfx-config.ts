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
  nebula: {
    enabled: boolean;
    puffCount: number;
    puffSize: number;
    alpha: number;
    driftSpeed: number;
  };
  twinkle: {
    enabled: boolean;
    amount: number;
    speed: number;
  };
  fog: {
    enabled: boolean;
    near: number;
    far: number;
  };
  parallax: {
    enabled: boolean;
    strength: number;
    lerp: number;
  };
}

export const GALAXY_VFX: Record<GalaxyVfxVariant, GalaxyVfxConfig> = {
  cinematic: {
    bloom: { strength: 0.55, radius: 0.4, threshold: 0.55 },
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
    nebula: {
      enabled: true,
      puffCount: 10,
      puffSize: 14,
      alpha: 0.12,
      driftSpeed: 0.04,
    },
    twinkle: {
      enabled: true,
      amount: 0.55,
      speed: 1.4,
    },
    fog: {
      enabled: true,
      near: 70,
      far: 200,
    },
    parallax: {
      enabled: true,
      strength: 0.7,
      lerp: 2.4,
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
    nebula: {
      enabled: false,
      puffCount: 0,
      puffSize: 0,
      alpha: 0,
      driftSpeed: 0,
    },
    twinkle: {
      enabled: true,
      amount: 0.3,
      speed: 1.0,
    },
    fog: {
      enabled: true,
      near: 44,
      far: 110,
    },
    parallax: {
      enabled: false,
      strength: 0,
      lerp: 0,
    },
  },
};

export function resolveVfxVariant(raw: string | null | undefined): GalaxyVfxVariant {
  if (raw === "minimal") return "minimal";
  return "cinematic";
}
