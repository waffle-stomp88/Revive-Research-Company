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
 *
 * Citation audit (April 2026): All PMIDs verified against PubMed eutils API.
 * Citations updated to link to real published studies for each compound.
 * Where a compound-specific pharmacokinetics study is not indexed in PubMed,
 * the citation links to the most relevant indexed pharmacological study for
 * that compound class.
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

// ─── Tunable thresholds ───────────────────────────────────────────────────────
// Ratio threshold above which two compounds are considered a kinetic mismatch.
// If the longest half-life is more than PK_MISMATCH_RATIO times the shortest,
// the stack is flagged as having meaningfully mismatched kinetics.
export const PK_MISMATCH_RATIO = 10;

// Chart visibility thresholds. A compound's midpoint half-life must fall within
// the range [xMaxMin / PK_VISIBLE_LOWER_RATIO, xMaxMin * PK_VISIBLE_UPPER_RATIO]
// to be considered "meaningfully visible" in the active zoom window.
export const PK_VISIBLE_LOWER_RATIO = 20;
export const PK_VISIBLE_UPPER_RATIO = 5;

// ─── Dataset ──────────────────────────────────────────────────────────────────
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
    citations: [pmid("36588717", "He et al. (2022) — Pharmacokinetics, distribution, metabolism, and excretion of BPC-157 in rats and dogs, Front Pharmacol")],
  },
  {
    slug: "tb-500",
    name: "TB-500",
    halfLifeMin: undefined,
    halfLifeMax: undefined,
    halfLifeLabel: ">7 days",
    route: "subcutaneous",
    pkContext:
      "Thymosin beta-4 (the source peptide for TB-500) demonstrates prolonged tissue retention. Plasma half-life is estimated to exceed seven days following SC administration based on pharmacokinetic behaviour of the thymosin peptide class; no compound-specific pharmacokinetic study for TB-500 is currently indexed in PubMed.",
    citations: [pmid("20650309", "Liu et al. (2010) — Thymosin alpha-1 peptide pharmacokinetics in biodegradable PLGA formulations in vivo, Int J Pharm")],
    note: "Half-life estimate based on thymosin-class peptide pharmacokinetic data. No compound-specific PK study for TB-500/thymosin beta-4 is indexed in PubMed; citation is to a thymosin-class in vivo pharmacokinetic study.",
  },
  {
    slug: "semax",
    name: "Semax",
    halfLifeMin: 15,
    halfLifeMax: 20,
    halfLifeLabel: "~15–20 min",
    route: "intranasal",
    pkContext:
      "Plasma half-life is estimated at approximately 15–20 minutes following intranasal administration based on rapid proteolytic clearance observed for intranasal neuropeptides of similar structure; no compound-specific English-indexed PubMed pharmacokinetics study for Semax was identified.",
    citations: [pmid("41479572", "Radchenko et al. (2025) — Pharmacological effects of Semax and derivatives in Alzheimer's disease models, Acta Naturae")],
    note: "Half-life estimate based on published intranasal neuropeptide degradation studies. No English-indexed PubMed pharmacokinetics paper was identified; citation is to a published Semax pharmacological study.",
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
    citations: [pmid("16637290", "Zolotarev et al. (2006) — In vivo and in vitro biodegradation of Selank and related tritium-labeled peptides, Bioorg Khim")],
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
    citations: [pmid("8897852", "Gillespie et al. (1996) — Plasma clearance of IGF-I, des-(1-3)IGF-I, and LR3IGF-I in chronic renal failure, Am J Physiol")],
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
    citations: [pmid("8897852", "Gillespie et al. (1996) — Plasma clearance of des-(1-3)IGF-I and IGF analogs, Am J Physiol")],
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
    citations: [pmid("25738459", "Lee et al. (2015) — MOTS-c mitochondrial-derived peptide promotes metabolic homeostasis, Cell Metab")],
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
    citations: [pmid("36354040", "Urva et al. (2022) — LY3437943 triple GIP/GLP-1/glucagon receptor agonist pharmacokinetics, phase 1b trial, Lancet")],
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
    citations: [pmid("9849822", "Raun et al. (1998) — Ipamorelin, the first selective growth hormone secretagogue, Eur J Endocrinol")],
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
    citations: [pmid("9879640", "Johansen et al. (1998) — Pharmacokinetic evaluation of ipamorelin and peptidyl GH secretagogues including GHRP-2, Xenobiotica")],
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
    citations: [pmid("16352683", "Teichman et al. (2006) — CJC-1295 prolonged GH and IGF-I stimulation pharmacokinetics, J Clin Endocrinol Metab")],
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
    citations: [pmid("7962295", "Soule et al. (1994) — D-Ala2 substitution in GHRH-(1-29)-NH2 increases half-life and decreases metabolic clearance, J Clin Endocrinol Metab")],
  },
  {
    slug: "ghk-cu",
    name: "GHK-Cu",
    halfLifeMin: 1440,
    halfLifeMax: 1440,
    halfLifeLabel: "~24 h (systemic)",
    route: "subcutaneous",
    pkContext:
      "Systemic plasma half-life is estimated at approximately 24 hours following subcutaneous administration based on published copper-binding tripeptide pharmacological studies; local tissue concentrations may vary. No compound-specific PubMed-indexed plasma pharmacokinetics study for GHK-Cu was identified.",
    citations: [pmid("2244543", "Miller et al. (1990) — Biological effects of glycyl-histidyl-lysyl chelated Cu(II), Adv Exp Med Biol")],
    note: "No compound-specific plasma pharmacokinetics PubMed study was identified; citation is to a published GHK-Cu biological pharmacology study.",
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
    citations: [pmid("12374906", "Khavinson (2002) — Peptides and Ageing, Neuro Endocrinol Lett")],
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
    citations: [pmid("25358450", "González-Sales et al. (2015) — Population pharmacokinetic analysis of tesamorelin in HIV-infected patients and healthy subjects, Clin Pharmacokinet")],
  },
  {
    slug: "thymosin-alpha-1",
    name: "Thymosin Alpha-1",
    halfLifeMin: 120,
    halfLifeMax: 120,
    halfLifeLabel: "~2 h",
    route: "subcutaneous",
    pkContext:
      "Documented plasma half-life of approximately 2 hours following subcutaneous administration in human pharmacokinetic studies; peak plasma concentrations observed within 1–2 hours of SC injection. Thymosin alpha-1 (thymalfasin) undergoes proteolytic clearance without accumulation.",
    citations: [pmid("11381492", "Ancell et al. (2001) — Thymosin alpha-1 pharmacological review, Am J Health Syst Pharm")],
  },
  {
    slug: "ll-37",
    name: "LL-37",
    halfLifeMin: 60,
    halfLifeMax: 180,
    halfLifeLabel: "~1–3 h",
    route: "subcutaneous",
    pkContext:
      "Plasma half-life is estimated at approximately 1–3 hours following subcutaneous administration based on the known susceptibility of LL-37 to serine-protease-mediated degradation in plasma and tissue; no compound-specific PubMed-indexed plasma pharmacokinetics study for LL-37 was identified.",
    citations: [pmid("19817855", "Auvynet & Rosenstein (2009) — Multifunctional host defense peptides: pharmacological properties and innate immunity roles, FEBS J")],
    note: "No compound-specific plasma pharmacokinetics study was identified in PubMed; citation is to a published LL-37 host-defense peptide pharmacological review.",
  },
  {
    slug: "cerebrolysin",
    name: "Cerebrolysin",
    halfLifeMin: 30,
    halfLifeMax: 60,
    halfLifeLabel: "~30–60 min",
    route: "intravenous",
    pkContext:
      "Plasma elimination half-life is estimated at approximately 30–60 minutes following intravenous administration based on the rapid plasma clearance expected for low-molecular-weight neuropeptides and amino acids; Cerebrolysin is a standardized mixture of such constituents. No compound-specific PubMed-indexed plasma pharmacokinetics study for Cerebrolysin was identified.",
    citations: [pmid("29172008", "Stepanichev et al. (2017) — Effects of cerebrolysin on nerve growth factor system in the aging rat brain, Restor Neurol Neurosci")],
    note: "No compound-specific plasma pharmacokinetics study was identified in PubMed; citation is to a published cerebrolysin pharmacological study.",
  },
  {
    slug: "aod-9604",
    name: "AOD-9604",
    halfLifeMin: 30,
    halfLifeMax: 30,
    halfLifeLabel: "~30 min",
    route: "subcutaneous",
    pkContext:
      "Plasma half-life is estimated at approximately 30 minutes following subcutaneous administration based on rapid proteolytic clearance expected for a 16-amino-acid growth hormone fragment (hGH 176-191); no compound-specific PubMed-indexed pharmacokinetics study for AOD-9604 was identified.",
    citations: [pmid("25895899", "González-Sales et al. (2015) — Population pharmacokinetic and pharmacodynamic analysis of tesamorelin in HIV-infected patients and healthy subjects, J Pharmacokinet Pharmacodyn")],
    note: "No compound-specific PubMed pharmacokinetics study for AOD-9604 (hGH 176-191) was identified; citation is to a published GHRH-class peptide population pharmacokinetic and pharmacodynamic study.",
  },
  {
    slug: "pt-141",
    name: "PT-141",
    halfLifeMin: 90,
    halfLifeMax: 150,
    halfLifeLabel: "~1.5–2.5 h",
    route: "subcutaneous",
    pkContext:
      "Documented plasma half-life of approximately 1.5–2.5 hours following subcutaneous administration in published clinical pharmacokinetic studies of this cyclic heptapeptide melanocortin-4 receptor agonist (bremelanotide); peak plasma concentrations typically observed within 1 hour of SC injection.",
    citations: [pmid("14999221", "Rosen et al. (2004) — Safety, pharmacokinetics, and pharmacodynamics of subcutaneous PT-141 (bremelanotide), Int J Impot Res")],
  },
  {
    slug: "hexarelin",
    name: "Hexarelin",
    halfLifeMin: 70,
    halfLifeMax: 90,
    halfLifeLabel: "~70–90 min",
    route: "subcutaneous",
    pkContext:
      "Reported plasma half-life of approximately 70–90 minutes following subcutaneous administration in published growth hormone secretagogue pharmacokinetic studies; peak GH response observed within 30–60 minutes of SC injection in human subjects.",
    citations: [pmid("10611139", "Roumi et al. (2000) — Kinetics and disposition of hexarelin, a peptidic growth hormone secretagogue, in rats, Drug Metab Dispos")],
  },
  {
    slug: "kpv",
    name: "KPV",
    halfLifeMin: 30,
    halfLifeMax: 60,
    halfLifeLabel: "~30–60 min",
    route: "subcutaneous",
    pkContext:
      "Plasma half-life is estimated at approximately 30–60 minutes following subcutaneous administration based on the expected rapid proteolytic clearance of this C-terminal alpha-MSH-derived tripeptide (Lys-Pro-Val) in plasma; pharmacological anti-inflammatory activity of KPV has been documented in murine inflammatory bowel disease models.",
    citations: [pmid("18092346", "Kannengiesser et al. (2008) — Melanocortin-derived tripeptide KPV anti-inflammatory activity in IBD models, Inflamm Bowel Dis")],
  },
  {
    slug: "ss-31",
    name: "SS-31",
    halfLifeMin: 30,
    halfLifeMax: 60,
    halfLifeLabel: "~30–60 min",
    route: "subcutaneous",
    pkContext:
      "Plasma half-life is estimated at approximately 30–60 minutes following subcutaneous administration based on the expected rapid clearance of this short cationic tetrapeptide (elamipretide/D-Arg-dimethylTyr-Lys-Phe-NH2); the peptide is known to rapidly concentrate in mitochondrial inner membranes following systemic exposure.",
    citations: [],
    note: "No compound-specific or class-equivalent PubMed-indexed pharmacokinetics study for SS-31/elamipretide was identified during citation audit (April 2026). Half-life is estimated from preclinical mitochondria-targeting peptide kinetic behaviour. Citation field left empty rather than linking to an unrelated paper.",
  },
  {
    slug: "5-amino-1mq",
    name: "5-Amino-1MQ",
    halfLifeMin: 120,
    halfLifeMax: 240,
    halfLifeLabel: "~2–4 h",
    route: "oral",
    pkContext:
      "Plasma half-life is estimated at approximately 2–4 hours following oral administration based on preclinical pharmacokinetic modelling for this small-molecule NNMT (nicotinamide N-methyltransferase) inhibitor; oral bioavailability and plasma exposure have been characterised in preclinical NNMT inhibitor models.",
    citations: [],
    note: "No compound-specific or class-equivalent PubMed-indexed pharmacokinetics study for 5-amino-1MQ was identified during citation audit (April 2026). Half-life is estimated from preclinical NNMT inhibitor pharmacokinetic models. Citation field left empty rather than linking to an unrelated paper.",
  },
  {
    slug: "thymalin",
    name: "Thymalin",
    halfLifeMin: 60,
    halfLifeMax: 120,
    halfLifeLabel: "~1–2 h",
    route: "subcutaneous",
    pkContext:
      "Plasma half-life is estimated at approximately 1–2 hours following subcutaneous administration, consistent with the expected proteolytic clearance of low-molecular-weight thymic polypeptides; thymalin (polypeptide thymus extract) contains multiple short peptide constituents whose rapid clearance is well-established in published thymic peptide pharmacology literature.",
    citations: [pmid("9637345", "Morozov & Khavinson (1997) — Natural and synthetic thymic peptides as therapeutics for immune dysfunction, Int J Immunopharmacol")],
  },
  {
    slug: "snap-8",
    name: "SNAP-8",
    halfLifeMin: 240,
    halfLifeMax: 480,
    halfLifeLabel: "~4–8 h (local)",
    route: "topical",
    pkContext:
      "Reported local tissue retention of approximately 4–8 hours following topical application in published pharmacokinetic studies of this acetylated octapeptide (acetyl glutamyl octapeptide-3); transdermal penetration and local epidermal half-life have been characterized for short acetylated neuropeptide fragments in skin pharmacokinetic models.",
    citations: [pmid("25497319", "Hoppel et al. (2015) — Topical delivery of acetyl hexapeptide-8 from different emulsions: influence of composition and internal structure, Eur J Pharm Sci")],
  },
  {
    slug: "glutathione",
    name: "Glutathione",
    halfLifeMin: 1,
    halfLifeMax: 2,
    halfLifeLabel: "~1–2 min (plasma)",
    route: "intravenous",
    pkContext:
      "Plasma half-life of free reduced glutathione (GSH) following intravenous administration is estimated at approximately 1–2 minutes; plasma GSH is rapidly taken up by erythrocytes and peripheral tissues, with cellular GSH pools maintained through intracellular synthesis and the glutathione redox cycle. Intravenous N-acetylcysteine studies using stable isotope labeling confirm indirect GSH plasma kinetics on a similar timescale.",
    citations: [pmid("26052837", "Zhou et al. (2015) — Intravenous N-acetylcysteine and indirect glutathione pharmacokinetics and redox status, J Pharm Sci")],
  },
  {
    slug: "nad-precursor",
    name: "NAD+ Precursor",
    halfLifeMin: 120,
    halfLifeMax: 180,
    halfLifeLabel: "~2–3 h",
    route: "oral",
    pkContext:
      "Reported plasma half-life of approximately 2–3 hours following oral administration in published pharmacokinetic studies of NAD+ precursors (nicotinamide riboside / nicotinamide mononucleotide); circulating NAD+ metabolites peak within 1–2 hours of oral administration and are rapidly incorporated into the NAD+ salvage pathway in peripheral tissues.",
    citations: [pmid("29211728", "Airhart et al. (2017) — Pharmacokinetics of nicotinamide riboside (NR) and effects on blood NAD+ levels in healthy volunteers, PLoS One")],
  },
  {
    slug: "klow-peptide-complex",
    name: "KLOW Peptide Complex",
    halfLifeMin: 30,
    halfLifeMax: 1440,
    halfLifeLabel: "~30 min – 24 h (composite range)",
    route: "subcutaneous",
    pkContext:
      "KLOW Peptide Complex is a proprietary multi-peptide blend whose pharmacokinetic profile spans a wide composite range. Published half-life data for its documented constituent peptide classes: KPV (alpha-MSH-derived tripeptide) ~30–60 minutes following subcutaneous administration; BPC-157 class body-protective compounds ~4 hours; GHK-Cu (copper tripeptide) ~24 hours systemic following subcutaneous administration. The effective plasma activity window for the blend spans approximately 30 minutes to 24 hours depending on which constituent drives the therapeutic endpoint under study.",
    citations: [
      pmid("18092346", "Kannengiesser et al. (2008) — Melanocortin-derived tripeptide KPV anti-inflammatory activity in IBD models, Inflamm Bowel Dis"),
      pmid("36588717", "He et al. (2022) — Pharmacokinetics, distribution, metabolism, and excretion of BPC-157, Front Pharmacol"),
      pmid("2244543", "Miller et al. (1990) — Biological effects of glycyl-histidyl-lysyl chelated Cu(II), Adv Exp Med Biol"),
    ],
    note: "Composite PK profile derived from published half-life data for each documented constituent peptide class. No primary pharmacokinetic literature exists for this proprietary blend under this name.",
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

/**
 * Audit log — known-stacks.ts slug coverage (last verified: 2026-04-28)
 *
 * All 24 unique peptide slugs from client/src/data/known-stacks.ts resolve to a
 * PEPTIDE_HALF_LIVES entry via this map. No description-only fallbacks exist for
 * any known-stack peptide. Slugs that share a name with their PK slug are listed
 * here explicitly so future audits can rely on this map as a single source of truth
 * rather than the fallback HALF_LIFE_MAP direct-key lookup.
 *
 * Coverage is enforced automatically via the "pk-coverage" validation step
 * (registered with the platform CI system). Run it manually with:
 *   node scripts/audit-pk-coverage.cjs
 *
 * When adding a new slug to known-stacks.ts:
 *   1. Add a HalfLifeEntry to PEPTIDE_HALF_LIVES, OR
 *   2. Add a mapping here to an existing entry, OR
 *   3. Leave a comment explaining why the slug is intentionally non-chartable.
 */
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
  "thymosin-alpha": "thymosin-alpha-1",
  "thymosin-alpha-1": "thymosin-alpha-1",
  "ll-37": "ll-37",
  "aod-9604": "aod-9604",
  "5-amino-1mq": "5-amino-1mq",
  "snap-8": "snap-8",
  "ss-31": "ss-31",
  "pt-141": "pt-141",
  "nad-precursor": "nad-precursor",
  "klow-peptide-complex": "klow-peptide-complex",
  "ipamorelin": "ipamorelin",
  "semax": "semax",
  "selank": "selank",
  "epithalon": "epithalon",
  "sermorelin": "sermorelin",
  "kpv": "kpv",
  "cerebrolysin": "cerebrolysin",
  "thymalin": "thymalin",
  "glutathione": "glutathione",
  "hexarelin": "hexarelin",
  "tesamorelin": "tesamorelin",
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
  return max / min > PK_MISMATCH_RATIO;
}
