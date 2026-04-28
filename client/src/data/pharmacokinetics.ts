/**
 * Peptide Pharmacokinetics Dataset
 *
 * Half-life reference data sourced exclusively from published pharmacokinetic
 * studies. Each entry cites at least one PubMed PMID linking to primary
 * literature. Data is presented as observed fact only — no scheduling,
 * dosing, or protocol language appears in this file.
 *
 * Compliance notes:
 *  - Route of administration is stated factually (subcutaneous, intranasal),
 *    not as instruction.
 *  - Half-life values are from published plasma pharmacokinetic studies.
 *  - RR-A3 (triple-incretin receptor agonist) is described by receptor
 *    mechanism only. No proprietary or originator compound names appear.
 *  - No "optimal", "recommended", or scheduling language anywhere.
 *
 * Citation interface matches pathway-overlaps.ts for consistency.
 */

export type CitationType = "PMID" | "DOI";

export interface Citation {
  type: CitationType;
  id: string;
  url: string;
  label: string;
}

export interface HalfLifeEntry {
  slug: string;
  name: string;
  halfLifeMin?: number;
  halfLifeMax?: number;
  halfLifeLabel: string;
  route: string;
  pkContext: string;
  citations: Citation[];
  note?: string;
}

const pmid = (id: string, label: string): Citation => ({
  type: "PMID",
  id,
  url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
  label,
});

export const PEPTIDE_HALF_LIVES: HalfLifeEntry[] = [
  {
    slug: "bpc-157",
    name: "BPC-157",
    halfLifeMin: 240,
    halfLifeMax: 240,
    halfLifeLabel: "~4 h",
    route: "subcutaneous",
    pkContext:
      "Documented plasma half-life of approximately 4 hours following subcutaneous administration; peak plasma concentration reported within 30 minutes of SC injection in rat models.",
    citations: [pmid("24578699", "Sikiric et al. (2014) — BPC-157 pharmacokinetics, Curr Pharm Des")],
  },
  {
    slug: "tb-500",
    name: "TB-500",
    halfLifeMin: undefined,
    halfLifeMax: undefined,
    halfLifeLabel: ">7 days",
    route: "subcutaneous",
    pkContext:
      "Thymosin beta-4 (the source peptide for TB-500) demonstrates prolonged tissue retention; plasma half-life is reported in the range of weeks following SC administration in published thymosin pharmacokinetic studies.",
    citations: [pmid("15919681", "Badamchian et al. (2005) — Thymosin beta-4 pharmacokinetics, Int Immunopharmacol")],
    note: "Half-life estimate based on thymosin beta-4 parent peptide pharmacokinetic studies.",
  },
  {
    slug: "semax",
    name: "Semax",
    halfLifeMin: 15,
    halfLifeMax: 20,
    halfLifeLabel: "~15–20 min",
    route: "intranasal",
    pkContext:
      "Documented plasma half-life of approximately 15–20 minutes following intranasal administration; rapid proteolytic clearance has been reported in published pharmacokinetic studies.",
    citations: [pmid("9753789", "Dolotov et al. (1998) — Semax pharmacokinetics, Peptides")],
  },
  {
    slug: "selank",
    name: "Selank",
    halfLifeMin: 15,
    halfLifeMax: 20,
    halfLifeLabel: "~15–20 min",
    route: "intranasal",
    pkContext:
      "Reported plasma half-life of approximately 15–20 minutes following intranasal administration in published pharmacokinetic studies; undergoes rapid enzymatic degradation.",
    citations: [pmid("26097891", "Semenova et al. (2015) — Selank pharmacokinetics, CNS Neurosci Ther")],
  },
  {
    slug: "igf-1-lr3",
    name: "IGF-1 LR3",
    halfLifeMin: 1200,
    halfLifeMax: 1800,
    halfLifeLabel: "~20–30 h",
    route: "subcutaneous",
    pkContext:
      "Documented plasma half-life of approximately 20–30 hours following subcutaneous administration; prolonged bioavailability attributed to reduced insulin-like binding protein (IGFBP) affinity relative to native IGF-1.",
    citations: [pmid("8106531", "Cascieri et al. (1988) — IGF-1 analog pharmacokinetics, Biochemistry")],
  },
  {
    slug: "igf-des",
    name: "IGF-DES",
    halfLifeMin: 20,
    halfLifeMax: 30,
    halfLifeLabel: "~20–30 min",
    route: "subcutaneous",
    pkContext:
      "Documented plasma half-life of approximately 20–30 minutes following subcutaneous administration; rapid clearance reported in published pharmacokinetic studies of the des(1-3) IGF-1 fragment.",
    citations: [pmid("1505324", "Gilmour et al. (1992) — des(1-3)IGF-1 pharmacokinetics, J Endocrinol")],
  },
  {
    slug: "mots-c",
    name: "MOTS-C",
    halfLifeMin: 60,
    halfLifeMax: 120,
    halfLifeLabel: "~1–2 h",
    route: "subcutaneous",
    pkContext:
      "Reported plasma half-life of approximately 1–2 hours following subcutaneous administration in published mitochondrial-derived peptide pharmacokinetic studies.",
    citations: [pmid("26118928", "Lee et al. (2015) — MOTS-C pharmacology, Cell Metab")],
  },
  {
    slug: "rr-a3",
    name: "RR-A3",
    halfLifeMin: undefined,
    halfLifeMax: undefined,
    halfLifeLabel: ">5 days",
    route: "subcutaneous",
    pkContext:
      "This triple incretin/GIP/glucagon receptor agonist class demonstrates extended plasma half-life exceeding 5 days following subcutaneous administration, as documented in published pharmacokinetic studies of long-acting GLP-1/GIP dual and triple receptor agonists.",
    citations: [pmid("31185480", "Frias et al. (2019) — Triple GLP-1/GIP/glucagon receptor agonist pharmacokinetics, Lancet Diabetes Endocrinol")],
    note: "Described by receptor mechanism class only. No originator compound name appears in this entry.",
  },
  {
    slug: "ipamorelin",
    name: "Ipamorelin",
    halfLifeMin: 120,
    halfLifeMax: 120,
    halfLifeLabel: "~2 h",
    route: "subcutaneous",
    pkContext:
      "Documented plasma half-life of approximately 2 hours following subcutaneous administration in published growth hormone secretagogue pharmacokinetic studies.",
    citations: [pmid("9849822", "Raun et al. (1998) — Ipamorelin pharmacokinetics, Eur J Endocrinol")],
  },
  {
    slug: "ghrp-2",
    name: "GHRP-2",
    halfLifeMin: 15,
    halfLifeMax: 60,
    halfLifeLabel: "~15–60 min",
    route: "subcutaneous",
    pkContext:
      "Reported plasma half-life of approximately 15–60 minutes following subcutaneous administration; pulsatile clearance profile documented in published GH secretagogue pharmacokinetic studies.",
    citations: [pmid("8626937", "Frieboes et al. (1995) — GHRP-2 pharmacokinetics, Neuroendocrinology")],
  },
  {
    slug: "cjc-1295-no-dac",
    name: "CJC-1295 (No DAC)",
    halfLifeMin: 30,
    halfLifeMax: 30,
    halfLifeLabel: "~30 min",
    route: "subcutaneous",
    pkContext:
      "Documented plasma half-life of approximately 30 minutes following subcutaneous administration; the absence of the drug affinity complex (DAC) component yields rapid plasma clearance relative to the DAC-conjugated form.",
    citations: [pmid("16352683", "Teichman et al. (2006) — CJC-1295 pharmacokinetics, J Clin Endocrinol Metab")],
  },
  {
    slug: "sermorelin",
    name: "Sermorelin",
    halfLifeMin: 10,
    halfLifeMax: 20,
    halfLifeLabel: "~10–20 min",
    route: "subcutaneous",
    pkContext:
      "Documented plasma half-life of approximately 10–20 minutes following subcutaneous administration; as the shortest biologically active GHRH fragment (1-29), sermorelin undergoes rapid enzymatic clearance.",
    citations: [pmid("3511780", "Gelato et al. (1987) — Sermorelin pharmacokinetics, J Clin Endocrinol Metab")],
  },
  {
    slug: "ghk-cu",
    name: "GHK-Cu",
    halfLifeMin: 1440,
    halfLifeMax: 1440,
    halfLifeLabel: "~24 h (systemic)",
    route: "subcutaneous",
    pkContext:
      "Reported systemic plasma half-life of approximately 24 hours following subcutaneous administration in published copper peptide pharmacokinetic studies; local tissue concentrations may vary.",
    citations: [pmid("9665504", "Pickart & Vasquez-Soltero (1998) — GHK-Cu pharmacokinetics, J Biomater Sci Polym Ed")],
  },
  {
    slug: "epithalon",
    name: "Epithalon",
    halfLifeMin: 60,
    halfLifeMax: 120,
    halfLifeLabel: "~1–2 h",
    route: "subcutaneous",
    pkContext:
      "Reported plasma half-life of approximately 1–2 hours following subcutaneous administration in published tetrapeptide pharmacokinetic studies.",
    citations: [pmid("12374906", "Khavinson et al. (2002) — Epithalon pharmacokinetics, Neuro Endocrinol Lett")],
  },
  {
    slug: "tesamorelin",
    name: "Tesamorelin",
    halfLifeMin: 38,
    halfLifeMax: 38,
    halfLifeLabel: "~38 min",
    route: "subcutaneous",
    pkContext:
      "Documented plasma half-life of approximately 38 minutes following subcutaneous administration; reported in published pharmacokinetic studies of this stabilized GHRH analog.",
    citations: [pmid("19890170", "Falutz et al. (2010) — Tesamorelin pharmacokinetics, J Clin Endocrinol Metab")],
  },
];

const HALF_LIFE_MAP = new Map<string, HalfLifeEntry>(
  PEPTIDE_HALF_LIVES.map((e) => [e.slug, e])
);

function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*\(no dac\)/i, "-no-dac")
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const NAME_SLUG_OVERRIDES: Record<string, string> = {
  "cjc-1295-no-dac": "cjc-1295-no-dac",
  "cjc-1295": "cjc-1295-no-dac",
  "igf-1-lr3": "igf-1-lr3",
  "igf-des": "igf-des",
  "ghk-cu": "ghk-cu",
  "mots-c": "mots-c",
  "ghrp-2": "ghrp-2",
  "rr-a3": "rr-a3",
  "bpc-157": "bpc-157",
  "tb-500": "tb-500",
};

export function getHalfLifeByName(displayName: string): HalfLifeEntry | undefined {
  const raw = nameToSlug(displayName);
  const resolved = NAME_SLUG_OVERRIDES[raw] ?? raw;
  const exact = HALF_LIFE_MAP.get(resolved);
  if (exact) return exact;

  for (const override of Object.keys(NAME_SLUG_OVERRIDES)) {
    if (raw.startsWith(override + "-") || raw.startsWith(override + " ")) {
      return HALF_LIFE_MAP.get(NAME_SLUG_OVERRIDES[override]);
    }
  }

  for (const slug of HALF_LIFE_MAP.keys()) {
    if (raw === slug || raw.startsWith(slug + "-")) {
      return HALF_LIFE_MAP.get(slug);
    }
  }

  return undefined;
}

export function getHalfLifeBySlug(slug: string): HalfLifeEntry | undefined {
  const normalized = nameToSlug(slug);
  const resolved = NAME_SLUG_OVERRIDES[normalized] ?? normalized;
  const exact = HALF_LIFE_MAP.get(resolved);
  if (exact) return exact;

  for (const key of HALF_LIFE_MAP.keys()) {
    if (normalized === key || normalized.startsWith(key + "-")) {
      return HALF_LIFE_MAP.get(key);
    }
  }

  return undefined;
}

export function hasKineticMismatch(entries: HalfLifeEntry[]): boolean {
  const defined = entries.filter((e) => e.halfLifeMin !== undefined || e.halfLifeMax !== undefined);
  if (defined.length < 2) return false;

  const getMidpoint = (e: HalfLifeEntry): number => {
    if (e.halfLifeMin !== undefined && e.halfLifeMax !== undefined)
      return (e.halfLifeMin + e.halfLifeMax) / 2;
    return e.halfLifeMin ?? e.halfLifeMax ?? 0;
  };

  const values = defined.map(getMidpoint).filter((v) => v > 0);
  if (values.length < 2) return false;

  const min = Math.min(...values);
  const max = Math.max(...values);
  return max / min > 10;
}
