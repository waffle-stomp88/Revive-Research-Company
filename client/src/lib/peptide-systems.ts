import { BODY_SYSTEMS } from "@/data/body-systems";

const DEFAULT_SYSTEM_ID = "longevity";

export const SYSTEM_ALIAS_MAP: Record<string, string> = {
  healing: "healing",
  gut: "healing",
  joints: "healing",
  recovery: "healing",
  metabolic: "metabolic",
  weight: "metabolic",
  energy: "metabolic",
  growth: "growth",
  muscle: "growth",
  cognitive: "cognitive",
  focus: "cognitive",
  neuroprotection: "cognitive",
  mood: "cognitive",
  sleep: "cognitive",
  skin: "skin",
  hair: "skin",
  cosmetic: "skin",
  longevity: "longevity",
  immune: "longevity",
  heart: "healing",
  vascular: "healing",
  hormonal: "hormonal",
  reproductive: "hormonal",
  fertility: "hormonal",
  libido: "hormonal",
};

export function resolvePrimarySystem(systems: string[]): string {
  for (const raw of systems) {
    const key = raw.toLowerCase().trim();
    if (SYSTEM_ALIAS_MAP[key]) return SYSTEM_ALIAS_MAP[key];
    const direct = BODY_SYSTEMS.find((b) => b.id === key);
    if (direct) return direct.id;
  }
  return DEFAULT_SYSTEM_ID;
}
