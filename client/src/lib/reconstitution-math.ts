export type DoseUnit = "mcg" | "mg";

export type SyringeKind = {
  value: string;
  label: string;
  units: number;
  mlPerUnit: number;
};

export const SYRINGES: SyringeKind[] = [
  { value: "0.3", label: "0.3 mL", units: 30, mlPerUnit: 0.01 },
  { value: "0.5", label: "0.5 mL", units: 50, mlPerUnit: 0.01 },
  { value: "1", label: "1.0 mL", units: 100, mlPerUnit: 0.01 },
];

export const COMMON_VIALS_MG = [5, 10, 12, 15, 20, 30, 40, 50, 80];
export const COMMON_BAC_WATER_ML = [1, 2, 3, 5];

export type Frequency =
  | "once_daily"
  | "twice_daily"
  | "every_other_day"
  | "weekly_2x"
  | "weekly_1x";

export const FREQUENCY_LABELS: Record<Frequency, { label: string; perWeek: number }> = {
  once_daily: { label: "Once daily", perWeek: 7 },
  twice_daily: { label: "Twice daily", perWeek: 14 },
  every_other_day: { label: "Every other day", perWeek: 3.5 },
  weekly_2x: { label: "2x per week", perWeek: 2 },
  weekly_1x: { label: "Once per week", perWeek: 1 },
};

export interface ReconInputs {
  doseValue: number;
  doseUnit: DoseUnit;
  vialMg: number;
  bacWaterMl: number;
  syringeMl: number;
  frequency?: Frequency;
}

export interface ReconResult {
  doseInMg: number;
  concentrationMgPerMl: number;
  concentrationMcgPerMl: number;
  volumeToDrawMl: number;
  unitsToDraw: number;
  syringeUnits: number;
  fillPercentage: number;
  totalDoses: number;
  daysOfSupply: number | null;
  warnings: string[];
}

export function computeReconstitution(input: ReconInputs): ReconResult | null {
  const { doseValue, doseUnit, vialMg, bacWaterMl, syringeMl, frequency } = input;
  if (!doseValue || !vialMg || !bacWaterMl || !syringeMl) return null;

  const doseInMg = doseUnit === "mcg" ? doseValue / 1000 : doseValue;
  const concentrationMgPerMl = vialMg / bacWaterMl;
  const volumeToDrawMl = doseInMg / concentrationMgPerMl;
  const syringe = SYRINGES.find((s) => s.value === String(syringeMl));
  const syringeUnits = syringe?.units ?? 100;
  const unitsToDraw = Math.round(volumeToDrawMl * 100 * 10) / 10;
  const totalDoses = doseInMg > 0 ? Math.floor(vialMg / doseInMg) : 0;
  const fillPercentage = Math.min((volumeToDrawMl / syringeMl) * 100, 100);

  let daysOfSupply: number | null = null;
  if (frequency && totalDoses > 0) {
    const perWeek = FREQUENCY_LABELS[frequency].perWeek;
    const perDay = perWeek / 7;
    daysOfSupply = perDay > 0 ? Math.round(totalDoses / perDay) : null;
  }

  const warnings: string[] = [];
  if (unitsToDraw < 5) {
    warnings.push("Dose is very small (< 5 units) — small measurement errors will be amplified. Consider using more BAC water.");
  }
  if (unitsToDraw > syringeUnits) {
    warnings.push("Volume exceeds your selected syringe capacity. Use a larger syringe or increase BAC water.");
  }
  if (concentrationMgPerMl > 10) {
    warnings.push("Very concentrated solution. Doses will be tiny — consider more BAC water for accuracy.");
  }

  return {
    doseInMg,
    concentrationMgPerMl,
    concentrationMcgPerMl: concentrationMgPerMl * 1000,
    volumeToDrawMl,
    unitsToDraw,
    syringeUnits,
    fillPercentage,
    totalDoses,
    daysOfSupply,
    warnings,
  };
}

const STORAGE_DAYS_AT_4C = 30;
export function estimatedExpiryDays(): number {
  return STORAGE_DAYS_AT_4C;
}

const MAX_ENCODED_LENGTH = 2048;
const ALLOWED_DOSE_UNITS: readonly string[] = ["mcg", "mg"];
const ALLOWED_FREQUENCIES: readonly string[] = Object.keys(FREQUENCY_LABELS);

export function encodeWizardState(state: Record<string, unknown>): string {
  try {
    return btoa(encodeURIComponent(JSON.stringify(state)));
  } catch {
    return "";
  }
}

function clamp(n: unknown, min: number, max: number, fallback: number): number {
  const num = typeof n === "number" && Number.isFinite(n) ? n : Number(n);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, num));
}

function safeStr(s: unknown, max: number): string {
  if (typeof s !== "string") return "";
  return s.slice(0, max);
}

export function decodeWizardState<T = Record<string, unknown>>(encoded: string): T | null {
  if (typeof encoded !== "string" || encoded.length === 0 || encoded.length > MAX_ENCODED_LENGTH) {
    return null;
  }
  try {
    const json = decodeURIComponent(atob(encoded));
    if (json.length > MAX_ENCODED_LENGTH * 2) return null;
    const raw = JSON.parse(json);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    const r = raw as Record<string, unknown>;
    const sanitized = {
      peptideName: safeStr(r.peptideName, 120),
      peptideSlug: safeStr(r.peptideSlug, 120),
      vialMg: clamp(r.vialMg, 0, 1000, 10),
      bacWaterMl: clamp(r.bacWaterMl, 0, 100, 2),
      doseValue: clamp(r.doseValue, 0, 100000, 0),
      doseUnit: ALLOWED_DOSE_UNITS.includes(String(r.doseUnit)) ? r.doseUnit : "mcg",
      syringeMl: clamp(r.syringeMl, 0.1, 5, 1),
      frequency: ALLOWED_FREQUENCIES.includes(String(r.frequency)) ? r.frequency : "once_daily",
    };
    return sanitized as T;
  } catch {
    return null;
  }
}
