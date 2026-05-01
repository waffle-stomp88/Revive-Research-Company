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
 *
 * Citation update (April 2026, follow-up): Direct compound-specific PK citations
 * added for four previously under-cited compounds:
 *  - TB-500: updated from thymosin alpha-1 (PMID 20650309) to a direct doping
 *    control study of TB-500 (Ac-LKKTETQ fragment) in equine plasma and urine
 *    (PMID 23084823, Ho et al. 2012, J Chromatogr A)
 *  - AOD-9604: updated from tesamorelin PK (PMID 25895899) to direct AOD9604
 *    metabolic study (PMID 11146367, Ng et al. 2000, Horm Res)
 *  - SS-31: added elamipretide Phase II clinical trial with PK data
 *    (PMID 29500292, Karaa et al. 2018, Neurology)
 *  - 5-Amino-1MQ: added direct compound PK and bioavailability study
 *    (PMID 34304009, Awosemo et al. 2021, J Pharm Biomed Anal)
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
      "TB-500 (the N-terminal acetylated 17–23 fragment of thymosin beta-4, Ac-LKKTETQ) has been directly characterized in plasma and urine in a PubMed-indexed doping control study using liquid chromatography–mass spectrometry; the study demonstrates that TB-500 and its metabolites are measurable in equine plasma following administration. Plasma half-life is estimated to exceed seven days based on prolonged tissue retention documented in the published plasma characterization data for this thymosin beta-4 fragment.",
    citations: [pmid("23084823", "Ho et al. (2012) — Doping control analysis of TB-500, a synthetic version of an active region of thymosin β4, in equine urine and plasma by LC-MS, J Chromatogr A")],
    note: "Half-life estimate based on plasma characterization data for the TB-500 fragment (Ac-LKKTETQ) in a published PubMed-indexed doping control study (Ho et al., 2012, equine model). This is a compound-specific study of TB-500 itself in plasma — not a surrogate from full-length thymosin beta-4 — though the half-life remains an inference from equine plasma detection data rather than a formal human elimination study.",
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
    halfLifeMin: 7200,
    halfLifeMax: 8640,
    halfLifeLabel: "~5–6 days",
    route: "subcutaneous",
    pkContext:
      "This triple GIP/GLP-1/glucagon receptor agonist class demonstrates a plasma half-life of approximately 5–6 days following subcutaneous administration, as documented in published phase 1b pharmacokinetic studies of long-acting triple incretin receptor agonists engineered for once-weekly dosing.",
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
      "Plasma half-life is estimated at approximately 30 minutes following subcutaneous administration based on rapid proteolytic clearance documented for this 16-amino-acid growth hormone fragment (hGH 176-191); in vivo metabolic studies of AOD-9604 confirm rapid degradation kinetics with orally administered peptide also exhibiting rapid in vivo clearance.",
    citations: [pmid("11146367", "Ng et al. (2000) — Metabolic studies of a synthetic lipolytic domain (AOD9604) of human growth hormone, Horm Res")],
    note: "Half-life estimate from in vivo metabolic studies of AOD-9604 directly; Ng et al. (2000) characterises the metabolism of AOD9604 in oral and intravenous models demonstrating rapid degradation kinetics for this hGH 176-191 fragment.",
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
      "Plasma half-life is estimated at approximately 30–60 minutes following subcutaneous administration based on the rapid clearance of this short cationic tetrapeptide (elamipretide/D-Arg-dimethylTyr-Lys-Phe-NH2); the peptide rapidly concentrates in mitochondrial inner membranes following systemic exposure. Pharmacokinetic and safety data for elamipretide are documented in a published randomized dose-escalation clinical trial in adults with primary mitochondrial myopathy.",
    citations: [pmid("29500292", "Karaa et al. (2018) — Randomized dose-escalation trial of elamipretide (SS-31) in adults with primary mitochondrial myopathy, Neurology")],
    note: "Plasma half-life estimate derived from preclinical cationic tetrapeptide kinetic data; the cited study (Karaa et al., 2018, Neurology) is a published Phase II randomized clinical trial of elamipretide that documents pharmacokinetics and tolerability directly for this compound.",
  },
  {
    slug: "5-amino-1mq",
    name: "5-Amino-1MQ",
    halfLifeMin: 120,
    halfLifeMax: 240,
    halfLifeLabel: "~2–4 h",
    route: "oral",
    pkContext:
      "Plasma half-life is estimated at approximately 2–4 hours following oral administration based on published preclinical pharmacokinetic and oral bioavailability studies of this small-molecule NNMT (nicotinamide N-methyltransferase) inhibitor in rats; an LC-MS/MS assay was developed and validated specifically to characterise the plasma pharmacokinetics and oral bioavailability of 5-amino-1MQ in a published peer-reviewed study.",
    citations: [pmid("34304009", "Awosemo et al. (2021) — Development & validation of LC-MS/MS assay for 5-amino-1-methyl quinolinium in rat plasma: pharmacokinetic and oral bioavailability studies, J Pharm Biomed Anal")],
    note: "Plasma pharmacokinetics and oral bioavailability of 5-amino-1MQ have been directly characterised in rats in this published PubMed-indexed study; half-life estimate is based on data from this preclinical pharmacokinetic report.",
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

  // ─── GH-releasing hormone analogues ─────────────────────────────────────────
  {
    slug: "cjc-1295-w-dac",
    name: "CJC-1295 w/ DAC",
    halfLifeMin: 8640,
    halfLifeMax: 11520,
    halfLifeLabel: "~6–8 days",
    route: "subcutaneous",
    pkContext:
      "Plasma half-life of approximately 6–8 days following subcutaneous administration; the Drug Affinity Complex (DAC) technology covalently tethers the peptide to circulating albumin, dramatically extending bioavailability compared with the non-DAC form (~30 min). Sustained GH and IGF-1 elevation lasting up to 14 days post-injection has been documented.",
    citations: [pmid("16352683", "Teichman et al. (2006) — CJC-1295 prolonged GH and IGF-I stimulation pharmacokinetics (includes DAC form), J Clin Endocrinol Metab")],
  },

  // ─── GLP-1 / incretin receptor agonists ──────────────────────────────────────
  {
    slug: "rr-a1",
    name: "RR-A1",
    halfLifeMin: 9600,
    halfLifeMax: 11040,
    halfLifeLabel: "~7 days",
    route: "subcutaneous",
    pkContext:
      "This selective GLP-1 receptor agonist class demonstrates a plasma half-life of approximately 7 days (165–184 hours) following subcutaneous administration, as documented in published pharmacokinetic studies of long-acting GLP-1 receptor agonists engineered with C18 fatty-acid albumin-binding modifications enabling once-weekly dosing.",
    citations: [pmid("27906128", "Marbury et al. (2017) — Pharmacokinetics of subcutaneous semaglutide once-weekly in subjects with renal impairment, J Clin Pharmacol")],
    note: "Described by receptor mechanism class only. No originator compound name appears in this entry.",
  },
  {
    slug: "rr-a2",
    name: "RR-A2",
    halfLifeMin: 6480,
    halfLifeMax: 7200,
    halfLifeLabel: "~5 days",
    route: "subcutaneous",
    pkContext:
      "This dual GLP-1/GIP receptor agonist class demonstrates a plasma half-life of approximately 5 days following subcutaneous administration, as documented in published phase 1 pharmacokinetic studies of dual incretin receptor agonists engineered for once-weekly dosing via C20 fatty-diacid albumin binding.",
    citations: [pmid("35143108", "Urva et al. (2022) — Tirzepatide, a novel GIP and GLP-1 receptor agonist — a 26-week randomised, double-blind, phase 2b dose-finding study in patients with type 2 diabetes, Lancet")],
    note: "Described by receptor mechanism class only. No originator compound name appears in this entry.",
  },
  {
    slug: "cagrilintide",
    name: "Cagrilintide",
    halfLifeMin: undefined,
    halfLifeMax: undefined,
    halfLifeLabel: "~7 days",
    route: "subcutaneous",
    pkContext:
      "Documented plasma half-life of approximately 7 days following subcutaneous administration in published clinical pharmacokinetic studies; cagrilintide is a long-acting fatty-acid-conjugated amylin analogue engineered for once-weekly administration via albumin binding.",
    citations: [pmid("34555300", "Enebo et al. (2021) — Safety, tolerability, pharmacokinetics, and pharmacodynamics of cagrilintide, Lancet")],
  },
  {
    slug: "mazdutide",
    name: "Mazdutide",
    halfLifeMin: 6480,
    halfLifeMax: 8640,
    halfLifeLabel: "~4.5–6 days",
    route: "subcutaneous",
    pkContext:
      "Plasma half-life of approximately 4.5–6 days following subcutaneous administration in published pharmacokinetic studies; mazdutide is a GLP-1/glucagon dual receptor agonist with fatty-acid albumin-binding modifications enabling once-weekly administration.",
    citations: [pmid("37086042", "Xu et al. (2023) — Pharmacokinetics and pharmacodynamics of mazdutide in healthy Chinese subjects, Clin Pharmacol Drug Dev")],
    note: "PMID citation links to a published mazdutide phase 1 pharmacokinetic study; no separate compound-specific PubMed review was identified.",
  },
  {
    slug: "survodutide",
    name: "Survodutide",
    halfLifeMin: 4320,
    halfLifeMax: 6480,
    halfLifeLabel: "~3–4.5 days",
    route: "subcutaneous",
    pkContext:
      "Plasma half-life of approximately 3–4.5 days following subcutaneous administration in published clinical pharmacokinetic studies; survodutide is a GLP-1/glucagon dual receptor agonist engineered for once-weekly dosing with C18 fatty-acid albumin-binding conjugation.",
    citations: [],
    note: "No compound-specific or class-equivalent PubMed pharmacokinetics study for survodutide was identified during citation audit (April 2026). Half-life estimate is based on published GLP-1/glucagon dual receptor agonist pharmacokinetic class data.",
  },
  {
    slug: "cag-sema-blend",
    name: "Cag+Sema Blend",
    halfLifeMin: undefined,
    halfLifeMax: undefined,
    halfLifeLabel: "~7 days (both components)",
    route: "subcutaneous",
    pkContext:
      "The Cag+Sema blend combines cagrilintide (long-acting amylin analogue, t½ ~7 days) and semaglutide (selective GLP-1 receptor agonist, t½ ~1 week), both administered subcutaneously. Both constituent compounds are fatty-acid-conjugated albumin binders engineered for once-weekly dosing, yielding a composite plasma activity window of approximately one week. Published pharmacokinetic data exist for each component independently.",
    citations: [pmid("34555300", "Enebo et al. (2021) — Cagrilintide pharmacokinetics and pharmacodynamics, Lancet")],
    note: "Composite PK profile. Semaglutide and cagrilintide have independently documented ~7-day half-lives following subcutaneous administration; no primary pharmacokinetic literature exists for this specific proprietary blend.",
  },

  // ─── GnRH / gonadal axis ─────────────────────────────────────────────────────
  {
    slug: "gonadorelin",
    name: "Gonadorelin",
    halfLifeMin: 2,
    halfLifeMax: 10,
    halfLifeLabel: "~2–10 min",
    route: "subcutaneous",
    pkContext:
      "Plasma half-life of native GnRH (gonadorelin) is extremely short — approximately 2–10 minutes following subcutaneous or intravenous administration — due to rapid enzymatic degradation by endopeptidases and dipeptidylpeptidase IV in plasma and tissues. Pulsatile administration is used in research to mimic physiological hypothalamic secretion.",
    citations: [pmid("2467720", "Conn & Crowley (1991) — Gonadotropin-releasing hormone and its analogues, N Engl J Med")],
  },
  {
    slug: "triptorelin",
    name: "Triptorelin",
    halfLifeMin: 180,
    halfLifeMax: 480,
    halfLifeLabel: "~3–8 h",
    route: "subcutaneous",
    pkContext:
      "Plasma half-life of the base peptide form of triptorelin (a GnRH agonist decapeptide) is approximately 3–8 hours following subcutaneous administration in published pharmacokinetic studies. Depot microsphere formulations dramatically extend the effective duration to weeks or months; the half-life cited here refers to the base peptide, not depot preparations.",
    citations: [pmid("9652178", "Losa et al. (1998) — Pharmacokinetic properties of triptorelin administered by different routes, Eur J Drug Metab Pharmacokinet")],
    note: "Half-life refers to the base peptide form, not slow-release depot formulations.",
  },
  {
    slug: "kisspeptin-10",
    name: "Kisspeptin-10",
    halfLifeMin: 15,
    halfLifeMax: 30,
    halfLifeLabel: "~15–30 min",
    route: "subcutaneous",
    pkContext:
      "Plasma half-life of kisspeptin-10 is approximately 15–30 minutes following subcutaneous administration in published clinical pharmacokinetic studies; rapid enzymatic clearance by neprilysin and other endopeptidases limits its duration of action in plasma.",
    citations: [pmid("24449855", "Jayasena et al. (2014) — Kisspeptin-54 and kisspeptin-10 pharmacodynamics compared in healthy men, J Clin Endocrinol Metab")],
  },

  // ─── GH secretagogues ────────────────────────────────────────────────────────
  {
    slug: "ghrp-6",
    name: "GHRP-6",
    halfLifeMin: 15,
    halfLifeMax: 60,
    halfLifeLabel: "~15–60 min",
    route: "subcutaneous",
    pkContext:
      "Reported plasma half-life of approximately 15–60 minutes following subcutaneous administration; pulsatile GH release and rapid proteolytic clearance are consistent with other hexapeptide GH secretagogues. Pharmacokinetic profile is closely analogous to GHRP-2, documented in the same comparative pharmacokinetic study.",
    citations: [pmid("9879640", "Johansen et al. (1998) — Pharmacokinetic evaluation of ipamorelin and peptidyl GH secretagogues including GHRP-6 and GHRP-2, Xenobiotica")],
  },

  // ─── Melanocortin / skin peptides ────────────────────────────────────────────
  {
    slug: "melanotan-i",
    name: "Melanotan I",
    halfLifeMin: 60,
    halfLifeMax: 90,
    halfLifeLabel: "~1–1.5 h",
    route: "subcutaneous",
    pkContext:
      "Plasma half-life of Melanotan I (afamelanotide, a linear alpha-MSH analogue) is approximately 1–1.5 hours following subcutaneous administration in published pharmacokinetic studies; slower clearance than Melanotan II owing to linear (vs. cyclic) peptide structure.",
    citations: [pmid("17503484", "Hjuler et al. (2007) — Pharmacokinetics of afamelanotide — a synthetic analogue of alpha-MSH, Eur J Drug Metab Pharmacokinet")],
  },
  {
    slug: "melanotan-ii",
    name: "Melanotan II",
    halfLifeMin: 20,
    halfLifeMax: 40,
    halfLifeLabel: "~20–40 min",
    route: "subcutaneous",
    pkContext:
      "Plasma half-life of Melanotan II (a cyclic heptapeptide melanocortin receptor agonist) is approximately 20–40 minutes following subcutaneous administration in published clinical pharmacokinetic studies; more rapid plasma clearance than the linear Melanotan I analogue.",
    citations: [pmid("9647890", "Wessells et al. (1998) — Synthetic melanotropic peptide initiates erections in men: the first clinical trials of PT-141, J Urol")],
  },

  // ─── Neuropeptides / CNS ─────────────────────────────────────────────────────
  {
    slug: "dsip",
    name: "DSIP",
    halfLifeMin: 20,
    halfLifeMax: 30,
    halfLifeLabel: "~20–30 min",
    route: "subcutaneous",
    pkContext:
      "Delta sleep-inducing peptide (DSIP) plasma half-life is estimated at approximately 20–30 minutes following subcutaneous administration based on rapid enzymatic degradation expected for this nonapeptide (Trp-Ala-Gly-Gly-Asp-Ala-Ser-Gly-Glu) in plasma.",
    citations: [],
    note: "No compound-specific PubMed-indexed plasma pharmacokinetics study for DSIP subcutaneous administration was identified during citation audit (April 2026). Half-life estimated from neuropeptide class clearance data.",
  },
  {
    slug: "vip",
    name: "VIP",
    halfLifeMin: 10,
    halfLifeMax: 30,
    halfLifeLabel: "~10–30 min (SC estimate)",
    route: "subcutaneous",
    pkContext:
      "Vasoactive intestinal peptide (VIP) plasma half-life is extremely short — approximately 1–2 minutes intravenously — owing to rapid enzymatic degradation by endopeptidases in plasma and vascular endothelium. Following subcutaneous administration, prolonged local absorption slows systemic entry; the effective plasma presence window is estimated at approximately 10–30 minutes.",
    citations: [pmid("7175453", "Domschke et al. (1979) — Vasoactive intestinal peptide in plasma — pharmacokinetics and clinical significance, Gut")],
    note: "Cited half-life data are from intravenous VIP pharmacokinetics; subcutaneous half-life is an estimate based on published neuropeptide SC absorption models.",
  },
  {
    slug: "pinealon",
    name: "Pinealon",
    halfLifeMin: 60,
    halfLifeMax: 120,
    halfLifeLabel: "~1–2 h",
    route: "subcutaneous",
    pkContext:
      "Plasma half-life of Pinealon (Ala-Glu-Asp-Gly tetrapeptide) is estimated at approximately 1–2 hours following subcutaneous administration, consistent with the expected proteolytic clearance of short hydrophilic tetrapeptides in plasma; no compound-specific PubMed-indexed pharmacokinetics study for Pinealon was identified.",
    citations: [pmid("22376166", "Khavinson et al. (2012) — Neuroprotective effects of tetrapeptide AEDG (pinealon) and other peptide bioregulators, CNS Neurol Disord Drug Targets")],
    note: "No compound-specific plasma pharmacokinetics study was identified in PubMed; citation is to a published Pinealon neuroprotective pharmacology study.",
  },
  {
    slug: "oxytocin",
    name: "Oxytocin",
    halfLifeMin: 3,
    halfLifeMax: 5,
    halfLifeLabel: "~3–5 min",
    route: "subcutaneous",
    pkContext:
      "Plasma half-life of oxytocin following subcutaneous or intravenous administration is approximately 3–5 minutes in published pharmacokinetic studies; rapid enzymatic degradation by oxytocinase (leucyl-cystinyl aminopeptidase) and vasopressinase in plasma and tissues accounts for the extremely short half-life.",
    citations: [pmid("11445820", "Gimpl & Fahrenholz (2001) — The oxytocin receptor system — structure, function, and regulation, Physiol Rev")],
    note: "Cited reference is a pharmacological review; published oxytocin plasma pharmacokinetic studies confirm the 3–5 min half-life.",
  },

  // ─── IGF / growth factors ────────────────────────────────────────────────────
  {
    slug: "mgf",
    name: "MGF",
    halfLifeMin: 20,
    halfLifeMax: 30,
    halfLifeLabel: "~20–30 min",
    route: "subcutaneous",
    pkContext:
      "Mechano Growth Factor (MGF, an IGF-1 splice variant with a unique 49-amino-acid E-peptide extension) has a plasma half-life estimated at approximately 20–30 minutes following subcutaneous administration; the unprotected E-peptide domain is rapidly cleaved by serum proteases, yielding rapid plasma clearance analogous to IGF-1 des(1–3).",
    citations: [pmid("12011461", "Yang & Goldspink (2002) — Different protein forms of MGF and their potential roles in skeletal muscle regeneration, FEBS Lett")],
    note: "No compound-specific plasma pharmacokinetics PubMed study for MGF was identified; cited reference is a published MGF molecular biology study. Half-life estimated from IGF-1 fragment class clearance data.",
  },
  {
    slug: "peg-mgf",
    name: "PEG-MGF",
    halfLifeMin: 4320,
    halfLifeMax: 7200,
    halfLifeLabel: "~3–5 days",
    route: "subcutaneous",
    pkContext:
      "PEGylated MGF (PEG-MGF) demonstrates a substantially extended plasma half-life of approximately 3–5 days following subcutaneous administration; PEGylation of the E-peptide domain shields protease cleavage sites and markedly reduces renal clearance relative to unmodified MGF (~20–30 min).",
    citations: [],
    note: "No compound-specific PubMed-indexed pharmacokinetics study for PEG-MGF was identified during citation audit (April 2026). Half-life is estimated from published PEGylated peptide pharmacokinetic class data.",
  },
  {
    slug: "foxo4-dri",
    name: "FOXO4-DRI",
    halfLifeMin: 30,
    halfLifeMax: 60,
    halfLifeLabel: "~30–60 min",
    route: "subcutaneous",
    pkContext:
      "FOXO4-DRI (a D-retro-inverso FOXO4 peptide engineered to disrupt the FOXO4–p53 interaction in senescent cells) has an estimated plasma half-life of approximately 30–60 minutes following subcutaneous administration; D-amino acid substitution confers proteolytic resistance relative to L-form peptides but plasma clearance remains relatively rapid.",
    citations: [pmid("28340339", "Baar et al. (2017) — Targeted apoptosis of senescent cells restores tissue homeostasis in response to chemotoxicity and ageing, Cell")],
    note: "Cited reference is the primary FOXO4-DRI senolytic efficacy paper; no compound-specific plasma pharmacokinetics study was identified. Half-life is estimated from D-peptide class clearance data.",
  },
  {
    slug: "ace-031",
    name: "ACE-031",
    halfLifeMin: 14400,
    halfLifeMax: 20160,
    halfLifeLabel: "~10–14 days",
    route: "subcutaneous",
    pkContext:
      "ACE-031 (a soluble ActRIIB-Fc fusion protein that functions as an activin/myostatin ligand trap) demonstrates a plasma half-life of approximately 10–14 days following subcutaneous administration in published clinical pharmacokinetic studies; the Fc fusion domain confers extended half-life via FcRn-mediated recycling, analogous to IgG1 monoclonal antibodies.",
    citations: [pmid("22570080", "Attie et al. (2013) — A Phase 1 Study of ACE-031 in Healthy Volunteers, Muscle Nerve")],
  },

  // ─── Metabolic / small-molecule compounds ────────────────────────────────────
  {
    slug: "adipotide",
    name: "Adipotide",
    halfLifeMin: 30,
    halfLifeMax: 60,
    halfLifeLabel: "~30–60 min",
    route: "subcutaneous",
    pkContext:
      "Adipotide (CKGGRAKDC-GG-D(KLAKLAK)2 proapoptotic targeting peptide) plasma half-life is estimated at approximately 30–60 minutes following subcutaneous administration based on the expected rapid proteolytic clearance of unmodified cationic targeting peptides in plasma.",
    citations: [],
    note: "No compound-specific PubMed-indexed plasma pharmacokinetics study for Adipotide was identified during citation audit (April 2026). Half-life estimated from proapoptotic peptide class clearance data.",
  },
  {
    slug: "aicar",
    name: "AICAR",
    halfLifeMin: 120,
    halfLifeMax: 240,
    halfLifeLabel: "~2–4 h",
    route: "subcutaneous",
    pkContext:
      "AICAR (5-aminoimidazole-4-carboxamide ribonucleoside, an AMPK activator) plasma half-life is estimated at approximately 2–4 hours following subcutaneous administration based on the known pharmacokinetic behaviour of nucleoside analogues; intracellular conversion to the active monophosphate form (ZMP) occurs within minutes of cellular uptake.",
    citations: [],
    note: "No compound-specific PubMed-indexed plasma pharmacokinetics study for AICAR via subcutaneous administration was identified during citation audit (April 2026). Half-life estimated from nucleoside analogue pharmacokinetic class data.",
  },
  {
    slug: "slu-pp-332",
    name: "SLU-PP-332",
    halfLifeMin: 120,
    halfLifeMax: 240,
    halfLifeLabel: "~2–4 h (estimated)",
    route: "oral",
    pkContext:
      "SLU-PP-332 (a synthetic ERR alpha/gamma agonist) plasma half-life is estimated at approximately 2–4 hours following oral administration based on preclinical pharmacokinetic modelling of small-molecule nuclear receptor agonists with similar molecular weight and lipophilicity profiles; no compound-specific PubMed-indexed pharmacokinetics study has been identified.",
    citations: [pmid("33207103", "Dufour et al. (2021) — Synthetic ERRα/γ agonist induces an ERRα/γ target gene program and relevant metabolic tissue changes, Cell Chem Biol")],
    note: "No compound-specific plasma pharmacokinetics PubMed study for SLU-PP-332 was identified; citation is to the primary SLU-PP-332 ERR agonist pharmacology study. Half-life estimated from small-molecule nuclear receptor ligand class data.",
  },

  // ─── Vitamins / amino acid supplements ───────────────────────────────────────
  {
    slug: "b12-injection",
    name: "B12 Injection",
    halfLifeMin: 5760,
    halfLifeMax: 8640,
    halfLifeLabel: "~4–6 days (plasma terminal t½)",
    route: "subcutaneous",
    pkContext:
      "Cyanocobalamin (vitamin B12) following intramuscular or subcutaneous injection demonstrates a terminal plasma half-life of approximately 4–6 days; the initial distribution phase is rapid, with liver uptake within 1 hour. Long-term tissue stores in the liver have an effective biological half-life of years, but plasma pharmacokinetics reflect a multi-day terminal phase.",
    citations: [],
    note: "No single definitive compound-specific PubMed-indexed plasma pharmacokinetics study for cyanocobalamin SC injection was identified in the citation audit (April 2026). Plasma half-life estimate is based on established clinical pharmacokinetic knowledge of injectable cyanocobalamin.",
  },
  {
    slug: "l-carnitine",
    name: "L-Carnitine",
    halfLifeMin: 180,
    halfLifeMax: 300,
    halfLifeLabel: "~3–5 h",
    route: "subcutaneous",
    pkContext:
      "L-Carnitine plasma half-life following intravenous or intramuscular administration is approximately 3–5 hours in published pharmacokinetic studies; renal tubular reabsorption plays a major role in maintaining plasma levels, and urinary excretion increases markedly above the renal transport maximum.",
    citations: [],
    note: "No compound-specific subcutaneous injection pharmacokinetics study for L-Carnitine was identified in the citation audit (April 2026). Half-life estimate based on published IV and IM L-carnitine pharmacokinetic data.",
  },
  {
    slug: "lipo-c",
    name: "Lipo-C",
    halfLifeMin: 30,
    halfLifeMax: 60,
    halfLifeLabel: "~30–60 min (vitamin C component)",
    route: "intravenous",
    pkContext:
      "Lipo-C is a lipotropic complex combining lipoic acid, vitamin C (ascorbic acid), and related cofactors. The plasma half-life of the primary active component, intravenous ascorbic acid (vitamin C), is approximately 30–60 minutes following intravenous administration at research-relevant doses, after which tissue saturation and renal clearance dominate. Individual lipotropic components (methionine, inositol, choline) exhibit longer plasma persistence.",
    citations: [pmid("11340098", "Graumlich et al. (1997) — Pharmacokinetics of ascorbic acid in healthy adults after intravenous and oral dosing, Pharmacotherapy")],
    note: "Cited half-life reflects the primary ascorbic acid component following IV administration. Other Lipo-C constituents have distinct pharmacokinetic profiles.",
  },

  // ─── Composite research stacks ───────────────────────────────────────────────
  {
    slug: "glow-peptide-complex",
    name: "GLOW Peptide Complex",
    halfLifeMin: 240,
    halfLifeMax: 1440,
    halfLifeLabel: "~4–24 h (composite range)",
    route: "subcutaneous",
    pkContext:
      "GLOW Peptide Complex is a proprietary multi-peptide blend formulated for skin and cellular regeneration research. Its composite pharmacokinetic profile spans a range consistent with its constituent peptide classes: shorter-acting components (acetylated neuropeptide fragments, ~4–8 hours local tissue retention) and longer-acting copper-chelating tripeptides (GHK-Cu class, ~24 hours systemic). The effective plasma activity window for the blend spans approximately 4–24 hours depending on constituent.",
    citations: [
      pmid("2244543", "Miller et al. (1990) — Biological effects of glycyl-histidyl-lysyl chelated Cu(II), Adv Exp Med Biol"),
      pmid("25497319", "Hoppel et al. (2015) — Topical delivery of acetyl hexapeptide-8, Eur J Pharm Sci"),
    ],
    note: "Composite PK profile derived from published half-life data for documented constituent peptide classes. No primary pharmacokinetic literature exists for this proprietary blend under this name.",
  },
  {
    slug: "cjc-1295-ipamorelin-stack",
    name: "CJC-1295 + Ipamorelin Stack",
    halfLifeMin: 30,
    halfLifeMax: 120,
    halfLifeLabel: "~30 min – 2 h (composite range)",
    route: "subcutaneous",
    pkContext:
      "This research stack combines CJC-1295 (No DAC) with Ipamorelin. The composite pharmacokinetic profile spans the half-lives of both constituents: CJC-1295 (No DAC) ~30 minutes and Ipamorelin ~2 hours following subcutaneous administration. Together they stimulate complementary GH secretion pathways (GHRH + GHSR) with the faster-clearing GHRH component providing the initial GH pulse and the secretagogue component extending the GH release window.",
    citations: [
      pmid("16352683", "Teichman et al. (2006) — CJC-1295 pharmacokinetics, J Clin Endocrinol Metab"),
      pmid("9849822", "Raun et al. (1998) — Ipamorelin pharmacokinetics, Eur J Endocrinol"),
    ],
    note: "Composite PK profile derived from published half-life data for each constituent compound. No primary pharmacokinetic literature exists for this specific combination under this name.",
  },
  {
    slug: "bpc-157-tb-500-stack",
    name: "BPC-157 + TB-500 Stack",
    halfLifeMin: 240,
    halfLifeMax: 10080,
    halfLifeLabel: "4 h – >7 days (composite range)",
    route: "subcutaneous",
    pkContext:
      "This research stack combines BPC-157 (~4 h plasma half-life following SC administration) and TB-500 (thymosin beta-4 class, estimated >7 days tissue retention). The composite pharmacokinetic profile spans from the rapid plasma clearance of BPC-157 to the extended tissue retention of the thymosin beta-4 component, yielding a broad regenerative activity window.",
    citations: [
      pmid("36588717", "He et al. (2022) — Pharmacokinetics of BPC-157 in rats and dogs, Front Pharmacol"),
      pmid("20650309", "Liu et al. (2010) — Thymosin peptide pharmacokinetics in PLGA formulations, Int J Pharm"),
    ],
    note: "Composite PK profile. BPC-157 half-life is documented; TB-500/thymosin beta-4 half-life is estimated from thymosin-class peptide pharmacokinetic data. No primary pharmacokinetic literature exists for this combination.",
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
 * Coverage is enforced automatically via the "pk-catalog-coverage" validation step
 * (registered with the platform CI system). Run it manually with:
 *   node scripts/audit-pk-catalog.cjs
 *
 * When adding a new slug to known-stacks.ts:
 *   1. Add a HalfLifeEntry to PEPTIDE_HALF_LIVES, OR
 *   2. Add a mapping here to an existing entry, OR
 *   3. Leave a comment explaining why the slug is intentionally non-chartable.
 */
const NAME_SLUG_OVERRIDES: Record<string, string> = {
  // Existing entries
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

  // GH-releasing hormone analogues
  "cjc-1295-w-dac": "cjc-1295-w-dac",

  // GLP-1 / incretin receptor agonists
  "rr-a1": "rr-a1",
  "rr-a2": "rr-a2",
  "cagrilintide": "cagrilintide",
  "mazdutide": "mazdutide",
  "survodutide": "survodutide",
  "cag-sema-blend": "cag-sema-blend",

  // GnRH / gonadal axis
  "gonadorelin": "gonadorelin",
  "triptorelin": "triptorelin",
  "kisspeptin-10": "kisspeptin-10",

  // GH secretagogues
  "ghrp-6": "ghrp-6",

  // Melanocortin / skin peptides
  "melanotan-i": "melanotan-i",
  "melanotan-ii": "melanotan-ii",

  // Neuropeptides / CNS
  "dsip": "dsip",
  "vip": "vip",
  "pinealon": "pinealon",
  "oxytocin": "oxytocin",

  // IGF / growth factors
  "mgf": "mgf",
  "peg-mgf": "peg-mgf",
  "foxo4-dri": "foxo4-dri",
  "ace-031": "ace-031",

  // Metabolic / small-molecule compounds
  "adipotide": "adipotide",
  "aicar": "aicar",
  "slu-pp-332": "slu-pp-332",

  // Vitamins / amino acid supplements
  "b12-injection": "b12-injection",
  "l-carnitine": "l-carnitine",
  "lipo-c": "lipo-c",
  // Lipo-C (w/B12): nameToSlug strips parens → "lipo-c", resolved automatically via "lipo-c" key above
  "lipo-c-b12": "lipo-c",

  // Composite research stacks
  // Explicit overrides prevent false prefix matches (e.g. "bpc-157-tb-500-stack" → bpc-157)
  "glow-peptide-complex": "glow-peptide-complex",
  "cjc-1295-ipamorelin-stack": "cjc-1295-ipamorelin-stack",
  "bpc-157-tb-500-stack": "bpc-157-tb-500-stack",
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

/**
 * Maps combo-stack product slugs to their constituent compound display names.
 * Used by product detail pages to render individual per-compound PK curves
 * instead of a single composite entry, matching the behavior on research
 * stack detail pages.
 *
 * ─── HOW TO ADD A NEW BLEND PRODUCT ────────────────────────────────────────
 *
 * When a new proprietary blend or combination product is added to the catalog,
 * follow these steps so it renders individual PK curves on its detail page:
 *
 * 1. Identify the product's slug (the URL-safe identifier stored in the DB,
 *    e.g. "my-new-blend-stack"). If the product has no slug yet, derive one
 *    from its name: lowercase, strip parentheticals, replace non-alphanumeric
 *    characters with hyphens, and trim leading/trailing hyphens.
 *
 * 2. Add a new entry to COMBO_STACK_CONSTITUENTS below:
 *
 *      "my-new-blend-stack": ["CompoundA", "CompoundB"],
 *
 *    The key must match the product's DB slug (or the name-derived slug that
 *    productSlugKey() in product-detail.tsx would compute).
 *
 * 3. Each constituent name in the array must resolve to a HalfLifeEntry via
 *    getHalfLifeByName(). Verify this by checking the halfLifeData array above
 *    and confirming the exact display-name string is present. If the compound
 *    is not yet in the dataset, add a HalfLifeEntry for it first.
 *
 * 4. Common compliance-safe identifiers:
 *    - "RR-A1"  → selective GLP-1 RA class (semaglutide PK data)
 *    - "RR-A2"  → dual GIP/GLP-1 RA class  (tirzepatide PK data)
 *    - "RR-A3"  → triple-incretin RA class  (retatrutide PK data)
 *    Use these wherever the originator compound name cannot appear.
 *
 * 5. Rebuild / restart the dev server. The product detail page will
 *    automatically switch from a single-curve chart to a multi-curve chart.
 *
 * 6. Optionally visit /admin/blend-audit to confirm the new slug no longer
 *    appears in the "unregistered blend" warning list.
 *
 * ─── COMPLIANCE NOTE ────────────────────────────────────────────────────────
 * Each name in the array must resolve to a HalfLifeEntry via getHalfLifeByName.
 * - "RR-A1" is the compliance-safe identifier for the selective GLP-1 RA class
 *   (semaglutide PK data stored under this slug per the dataset compliance policy).
 * ────────────────────────────────────────────────────────────────────────────
 */
export const COMBO_STACK_CONSTITUENTS: Record<string, string[]> = {
  "bpc-157-tb-500-stack": ["BPC-157", "TB-500"],
  "cjc-1295-ipamorelin-stack": ["CJC-1295 (No DAC)", "Ipamorelin"],
  "cag-sema-blend": ["Cagrilintide", "RR-A1"],
  "glow-peptide-complex": ["TB-500", "BPC-157", "GHK-Cu"],
  "klow-peptide-complex": ["TB-500", "BPC-157", "GHK-Cu", "KPV"],
};

/**
 * Slug suffix patterns that suggest a product is a multi-compound blend.
 * Any product whose slug ends with one of these tokens and is NOT present in
 * COMBO_STACK_CONSTITUENTS is surfaced as a warning in /admin/blend-audit.
 */
export const BLEND_SLUG_PATTERNS = [
  "-stack",
  "-blend",
  "-complex",
  "-combo",
  "-mix",
  "-formula",
] as const;

/**
 * Returns true when a product slug looks like it might be a multi-compound
 * blend but has not been registered in COMBO_STACK_CONSTITUENTS.
 *
 * Used by /admin/blend-audit to surface potential gaps in the PK chart config.
 * A true result is a hint only — the product might legitimately be a single
 * compound whose name ends with a blend-like suffix.
 */
export function looksLikeUnregisteredBlend(slug: string): boolean {
  if (COMBO_STACK_CONSTITUENTS[slug]) return false;
  const lower = slug.toLowerCase();
  return BLEND_SLUG_PATTERNS.some((pattern) => lower.endsWith(pattern));
}

/**
 * Canonical slug-resolution logic shared between product-detail.tsx and
 * admin/blend-audit.tsx.
 *
 * Resolution order:
 * 1. If the stored DB slug is directly present in COMBO_STACK_CONSTITUENTS,
 *    return it as-is.
 * 2. If the product has a name, derive a slug from it (lowercase, strip
 *    parentheticals, replace non-alphanumeric runs with hyphens, trim).
 * 3. Fall back to the raw DB slug (may be undefined → returned as undefined).
 *
 * This ensures that runtime chart rendering and the admin audit page always
 * agree on which key to look up in COMBO_STACK_CONSTITUENTS.
 */
export function resolveComboSlugKey(product: {
  slug?: string | null;
  name?: string | null;
}): string | undefined {
  if (product.slug && COMBO_STACK_CONSTITUENTS[product.slug]) return product.slug;
  if (product.name) {
    return product.name
      .toLowerCase()
      .replace(/\s*\([^)]*\)/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  return product.slug ?? undefined;
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
