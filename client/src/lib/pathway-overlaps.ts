/**
 * Pathway Overlap Dataset
 *
 * Receptor-system overlap data for the catalog peptides. This module is the
 * data layer for a future "Pathway Overlap Detection" feature in the custom
 * stack builder. It is intentionally UI-free — every entry is a research
 * claim backed by an IUPHAR/BPS receptor reference and at least one PubMed
 * PMID so the future UI can render auditable citation chips.
 *
 * Compliance notes:
 *  - Triple/dual incretin compounds (RR-A1, RR-A2, RR-A3) are described by
 *    receptor mechanism only. No proprietary or originator compound names
 *    appear anywhere in this file.
 *  - Card copy uses observational pharmacology language ("engage,"
 *    "researchers may consider"). No imperative voice, no dosing, no health
 *    claims.
 *
 * Source hierarchy:
 *  1. IUPHAR/BPS Guide to Pharmacology — authoritative receptor classification
 *  2. PubMed — primary literature backing each binding claim
 *  3. researchdosing.com — community vocabulary cross-reference only (not
 *     used as a primary citation source in this dataset)
 *
 * Every PMID and IUPHAR target id below should be verified by the human
 * reviewer using the companion human-review report
 * (`docs/pathway-overlap-report.md`) before any UI ships.
 */

export type CitationType = "PMID" | "IUPHAR";

export interface Citation {
  type: CitationType;
  /** The numeric id (PMID number or IUPHAR objectId). */
  id: string;
  /** Direct, click-through verifiable URL. */
  url: string;
  /** Short descriptor for hover/tooltip. */
  label: string;
}

export type ReceptorRole =
  | "full agonist"
  | "partial agonist"
  | "analog"
  | "fragment"
  | "ligand trap"
  | "non-receptor";

export interface ReceptorEngagement {
  /** Canonical receptor key used to match overlap clusters. */
  receptorKey: string;
  /** Human-readable receptor name. */
  receptor: string;
  /** IUPHAR/BPS Guide to Pharmacology objectId, where one exists. */
  iupharTargetId?: string;
  role: ReceptorRole;
  citations: Citation[];
}

export interface PeptideReceptorEntry {
  slug: string;
  name: string;
  /** Receptors this peptide engages with documented evidence. */
  receptors: ReceptorEngagement[];
  /** True when no receptor in this entry is shared with any other catalog peptide. */
  noDocumentedOverlap?: boolean;
  /** Set when the receptor profile is ambiguous and a human should review before shipping a flag. */
  reviewNote?: string;
}

export interface OverlapCluster {
  /** Matches `receptorKey` in `PeptideReceptorEntry.receptors`. */
  receptorKey: string;
  receptor: string;
  iupharTargetId?: string;
  /** Catalog slugs that engage this receptor with documented evidence. */
  agonistSlugs: string[];
  /** One-line mechanism summary for tooltips / detail rows. */
  mechanismSummary: string;
  /**
   * Compliant card copy. Observational, no imperatives, no dosing, no
   * compound names for the incretin cluster.
   */
  cardCopy: string;
  /** Cluster-level citations: receptor classification + 1+ landmark PMID. */
  citations: Citation[];
}

// ---------------------------------------------------------------------------
// Citation helpers
// ---------------------------------------------------------------------------

const pmid = (id: string, label: string): Citation => ({
  type: "PMID",
  id,
  url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
  label,
});

const iuphar = (id: string, label: string): Citation => ({
  type: "IUPHAR",
  id,
  url: `https://www.guidetopharmacology.org/GRAC/ObjectDisplayForward?objectId=${id}`,
  label,
});

// ---------------------------------------------------------------------------
// Reusable receptor citation bundles (kept as constants so the dataset stays
// auditable: each receptor's evidence is defined once and re-used by every
// peptide that engages it).
// ---------------------------------------------------------------------------

const GHRHR = {
  key: "GHRHR",
  name: "Growth-hormone-releasing-hormone receptor (GHRHR)",
  iupharId: "248",
  citations: [
    iuphar("248", "IUPHAR/BPS GHRH receptor classification"),
    pmid("18057338", "Tesamorelin GHRHR pharmacology in human study (Falutz NEJM)"),
    pmid("16352683", "CJC-1295 sustained GHRHR agonism in humans (Teichman JCEM)"),
  ],
} as const;

const GHSR = {
  key: "GHSR1a",
  name: "Ghrelin receptor / GHSR1a",
  iupharId: "233",
  citations: [
    iuphar("233", "IUPHAR/BPS Ghrelin receptor (GHSR) classification"),
    pmid("9849822", "Ipamorelin as a selective GHSR1a agonist (Raun Eur J Endocrinol)"),
    pmid("10604470", "Ghrelin discovery as the endogenous GHSR1a ligand (Kojima Nature)"),
  ],
} as const;

const GLP1R = {
  key: "GLP1R",
  name: "Glucagon-like peptide-1 receptor (GLP-1R)",
  iupharId: "249",
  citations: [
    iuphar("249", "IUPHAR/BPS GLP-1 receptor classification"),
    pmid("29617641", "GLP-1R pharmacology and incretin biology (Drucker Cell Metab)"),
  ],
} as const;

const GIPR = {
  key: "GIPR",
  name: "Glucose-dependent insulinotropic polypeptide receptor (GIPR)",
  iupharId: "247",
  citations: [
    iuphar("247", "IUPHAR/BPS GIP receptor classification"),
    pmid("29617641", "Incretin biology covering GIP and GLP-1 receptor signaling (Drucker Cell Metab)"),
  ],
} as const;

const GCGR = {
  key: "GCGR",
  name: "Glucagon receptor (GCGR)",
  iupharId: "250",
  citations: [
    iuphar("250", "IUPHAR/BPS Glucagon receptor classification"),
    pmid("28733905", "Dual GLP-1 / glucagon receptor co-agonism (Sánchez-Garrido Diabetologia)"),
  ],
} as const;

const MC1R = {
  key: "MC1R",
  name: "Melanocortin-1 receptor (MC1R)",
  iupharId: "281",
  citations: [
    iuphar("281", "IUPHAR/BPS MC1R classification"),
    pmid("23277150", "MC1R agonist clinical pharmacology in erythropoietic protoporphyria"),
  ],
} as const;

const MC4R = {
  key: "MC4R",
  name: "Melanocortin-4 receptor (MC4R)",
  iupharId: "284",
  citations: [
    iuphar("284", "IUPHAR/BPS MC4R classification"),
    pmid("12851303", "PT-141 (bremelanotide) MC4R-preferring pharmacology (Wessells)"),
    pmid("12181489", "MC4R role established with MTII activation (Van der Ploeg PNAS)"),
  ],
} as const;

const IGF1R = {
  key: "IGF1R",
  name: "Insulin-like growth factor 1 receptor (IGF-1R)",
  iupharId: "1804",
  citations: [
    iuphar("1804", "IUPHAR/BPS IGF-1R classification"),
    pmid("19029956", "IGF-1R signaling overview (Pollak Nat Rev Cancer)"),
  ],
} as const;

const GNRHR = {
  key: "GNRHR",
  name: "Gonadotropin-releasing hormone receptor (GnRHR)",
  iupharId: "254",
  citations: [
    iuphar("254", "IUPHAR/BPS GnRH receptor classification"),
    pmid("3007876", "GnRH receptor and gonadotropin release (Conn Endocr Rev)"),
    pmid("31644065", "Triptorelin GnRH-analog pharmacology review"),
  ],
} as const;

// ---------------------------------------------------------------------------
// Per-peptide receptor map
// ---------------------------------------------------------------------------

export const PEPTIDE_RECEPTORS: Record<string, PeptideReceptorEntry> = {
  // --- GHRH analogs --------------------------------------------------------
  "cjc-1295-no-dac": {
    slug: "cjc-1295-no-dac",
    name: "CJC-1295 (No DAC)",
    receptors: [
      {
        receptorKey: GHRHR.key,
        receptor: GHRHR.name,
        iupharTargetId: GHRHR.iupharId,
        role: "analog",
        citations: GHRHR.citations.slice(),
      },
    ],
  },
  "cjc-1295-w-dac": {
    slug: "cjc-1295-w-dac",
    name: "CJC-1295 w/ DAC",
    receptors: [
      {
        receptorKey: GHRHR.key,
        receptor: GHRHR.name,
        iupharTargetId: GHRHR.iupharId,
        role: "analog",
        citations: GHRHR.citations.slice(),
      },
    ],
  },
  sermorelin: {
    slug: "sermorelin",
    name: "Sermorelin",
    receptors: [
      {
        receptorKey: GHRHR.key,
        receptor: GHRHR.name,
        iupharTargetId: GHRHR.iupharId,
        role: "analog",
        citations: GHRHR.citations.slice(),
      },
    ],
  },
  tesamorelin: {
    slug: "tesamorelin",
    name: "Tesamorelin",
    receptors: [
      {
        receptorKey: GHRHR.key,
        receptor: GHRHR.name,
        iupharTargetId: GHRHR.iupharId,
        role: "analog",
        citations: GHRHR.citations.slice(),
      },
    ],
  },

  // --- Ghrelin receptor / GHSR1a (GH secretagogues) ------------------------
  ipamorelin: {
    slug: "ipamorelin",
    name: "Ipamorelin",
    receptors: [
      {
        receptorKey: GHSR.key,
        receptor: GHSR.name,
        iupharTargetId: GHSR.iupharId,
        role: "full agonist",
        citations: GHSR.citations.slice(),
      },
    ],
  },
  "ghrp-2": {
    slug: "ghrp-2",
    name: "GHRP-2",
    receptors: [
      {
        receptorKey: GHSR.key,
        receptor: GHSR.name,
        iupharTargetId: GHSR.iupharId,
        role: "full agonist",
        citations: GHSR.citations.slice(),
      },
    ],
  },
  "ghrp-6": {
    slug: "ghrp-6",
    name: "GHRP-6",
    receptors: [
      {
        receptorKey: GHSR.key,
        receptor: GHSR.name,
        iupharTargetId: GHSR.iupharId,
        role: "full agonist",
        citations: GHSR.citations.slice(),
      },
    ],
  },
  hexarelin: {
    slug: "hexarelin",
    name: "Hexarelin",
    receptors: [
      {
        receptorKey: GHSR.key,
        receptor: GHSR.name,
        iupharTargetId: GHSR.iupharId,
        role: "full agonist",
        citations: GHSR.citations.slice(),
      },
    ],
  },

  // --- Incretin cluster (GLP-1R / GIPR / GCGR) -----------------------------
  // Mechanism language only — no compound names anywhere in this section.
  "rr-a1": {
    slug: "rr-a1",
    name: "RR-A1",
    receptors: [
      {
        receptorKey: GLP1R.key,
        receptor: GLP1R.name,
        iupharTargetId: GLP1R.iupharId,
        role: "analog",
        citations: GLP1R.citations.slice(),
      },
    ],
    reviewNote:
      "Single-receptor incretin analog. Confirmed GLP-1R engagement by mechanism class; cite by receptor only — never by compound name.",
  },
  "rr-a2": {
    slug: "rr-a2",
    name: "RR-A2",
    receptors: [
      {
        receptorKey: GLP1R.key,
        receptor: GLP1R.name,
        iupharTargetId: GLP1R.iupharId,
        role: "analog",
        citations: GLP1R.citations.slice(),
      },
      {
        receptorKey: GIPR.key,
        receptor: GIPR.name,
        iupharTargetId: GIPR.iupharId,
        role: "analog",
        citations: GIPR.citations.slice(),
      },
    ],
    reviewNote:
      "Dual GLP-1R / GIPR mechanism. Both receptor engagements should surface in overlap detection. No compound names in any copy.",
  },
  "rr-a3": {
    slug: "rr-a3",
    name: "RR-A3",
    receptors: [
      {
        receptorKey: GLP1R.key,
        receptor: GLP1R.name,
        iupharTargetId: GLP1R.iupharId,
        role: "analog",
        citations: GLP1R.citations.slice(),
      },
      {
        receptorKey: GIPR.key,
        receptor: GIPR.name,
        iupharTargetId: GIPR.iupharId,
        role: "analog",
        citations: GIPR.citations.slice(),
      },
      {
        receptorKey: GCGR.key,
        receptor: GCGR.name,
        iupharTargetId: GCGR.iupharId,
        role: "analog",
        citations: GCGR.citations.slice(),
      },
    ],
    reviewNote:
      "Triple GLP-1R / GIPR / GCGR mechanism. Will overlap with mazdutide/survodutide on GLP-1R and GCGR, and with RR-A2 on GLP-1R/GIPR.",
  },
  mazdutide: {
    slug: "mazdutide",
    name: "Mazdutide",
    receptors: [
      {
        receptorKey: GLP1R.key,
        receptor: GLP1R.name,
        iupharTargetId: GLP1R.iupharId,
        role: "analog",
        citations: GLP1R.citations.slice(),
      },
      {
        receptorKey: GCGR.key,
        receptor: GCGR.name,
        iupharTargetId: GCGR.iupharId,
        role: "analog",
        citations: GCGR.citations.slice(),
      },
    ],
  },
  survodutide: {
    slug: "survodutide",
    name: "Survodutide",
    receptors: [
      {
        receptorKey: GLP1R.key,
        receptor: GLP1R.name,
        iupharTargetId: GLP1R.iupharId,
        role: "analog",
        citations: GLP1R.citations.slice(),
      },
      {
        receptorKey: GCGR.key,
        receptor: GCGR.name,
        iupharTargetId: GCGR.iupharId,
        role: "analog",
        citations: GCGR.citations.slice(),
      },
    ],
  },

  // --- Melanocortin receptors ---------------------------------------------
  "melanotan-i": {
    slug: "melanotan-i",
    name: "Melanotan I",
    receptors: [
      {
        receptorKey: MC1R.key,
        receptor: MC1R.name,
        iupharTargetId: MC1R.iupharId,
        role: "full agonist",
        citations: MC1R.citations.slice(),
      },
    ],
    reviewNote:
      "Afamelanotide is MC1R-preferring but has documented affinity for MC3R/MC4R/MC5R at higher concentrations. Listing primary receptor (MC1R) for overlap.",
  },
  "melanotan-ii": {
    slug: "melanotan-ii",
    name: "Melanotan II",
    receptors: [
      {
        receptorKey: MC1R.key,
        receptor: MC1R.name,
        iupharTargetId: MC1R.iupharId,
        role: "full agonist",
        citations: MC1R.citations.slice(),
      },
      {
        receptorKey: MC4R.key,
        receptor: MC4R.name,
        iupharTargetId: MC4R.iupharId,
        role: "full agonist",
        citations: MC4R.citations.slice(),
      },
    ],
    reviewNote:
      "Pan-melanocortin agonist (MC1R/MC3R/MC4R/MC5R). Listed for the two clusters with other catalog peptides; MC3R and MC5R have no other catalog binders so they are not separate clusters.",
  },
  "pt-141": {
    slug: "pt-141",
    name: "PT-141",
    receptors: [
      {
        receptorKey: MC4R.key,
        receptor: MC4R.name,
        iupharTargetId: MC4R.iupharId,
        role: "full agonist",
        citations: MC4R.citations.slice(),
      },
    ],
    reviewNote:
      "Bremelanotide is MC4R-preferring but engages MC1R/MC3R/MC5R at lower potency. Listed in MC4R cluster only.",
  },
  kpv: {
    slug: "kpv",
    name: "KPV",
    receptors: [
      // KPV is the C-terminal tripeptide of α-MSH. Its mechanism is debated:
      // anti-inflammatory action appears largely intracellular (NF-κB
      // inhibition) and may be partly receptor-independent. We do NOT list
      // KPV as an MC1R agonist for overlap purposes — see review notes.
    ],
    noDocumentedOverlap: true,
    reviewNote:
      "α-MSH(11-13) tripeptide. Anti-inflammatory action is documented (Brzoska 2008 PMID 18187683 etc.) but MC1R agonism is contested in the primary literature. Conservative call: do NOT list KPV in the MC1R overlap cluster. Flag for human reviewer to override if a stronger receptor binding source is identified.",
  },

  // --- IGF-1 receptor cluster ---------------------------------------------
  "igf-1-lr3": {
    slug: "igf-1-lr3",
    name: "IGF-1 LR3",
    receptors: [
      {
        receptorKey: IGF1R.key,
        receptor: IGF1R.name,
        iupharTargetId: IGF1R.iupharId,
        role: "analog",
        citations: IGF1R.citations.slice(),
      },
    ],
  },
  "igf-des": {
    slug: "igf-des",
    name: "IGF-DES",
    receptors: [
      {
        receptorKey: IGF1R.key,
        receptor: IGF1R.name,
        iupharTargetId: IGF1R.iupharId,
        role: "analog",
        citations: IGF1R.citations.slice(),
      },
    ],
  },
  mgf: {
    slug: "mgf",
    name: "MGF",
    receptors: [
      {
        receptorKey: IGF1R.key,
        receptor: IGF1R.name,
        iupharTargetId: IGF1R.iupharId,
        role: "analog",
        citations: [
          ...IGF1R.citations,
          pmid("20130113", "MGF / IGF-1Ec splice-variant biology in muscle"),
        ],
      },
    ],
    reviewNote:
      "MGF is a splice variant of IGF-1 (IGF-1Ec). Whether it binds IGF-1R with the same affinity as native IGF-1 or signals through a distinct receptor is contested in the literature. Listed in IGF-1R cluster as the dominant view; flag for human review.",
  },
  "peg-mgf": {
    slug: "peg-mgf",
    name: "PEG-MGF",
    receptors: [
      {
        receptorKey: IGF1R.key,
        receptor: IGF1R.name,
        iupharTargetId: IGF1R.iupharId,
        role: "analog",
        citations: [
          ...IGF1R.citations,
          pmid("20130113", "MGF / IGF-1Ec splice-variant biology in muscle"),
        ],
      },
    ],
    reviewNote:
      "Pegylated MGF inherits MGF's contested receptor profile. Listed in IGF-1R cluster pending human review.",
  },

  // --- GnRH receptor cluster ----------------------------------------------
  gonadorelin: {
    slug: "gonadorelin",
    name: "Gonadorelin",
    receptors: [
      {
        receptorKey: GNRHR.key,
        receptor: GNRHR.name,
        iupharTargetId: GNRHR.iupharId,
        role: "full agonist",
        citations: GNRHR.citations.slice(),
      },
    ],
  },
  triptorelin: {
    slug: "triptorelin",
    name: "Triptorelin",
    receptors: [
      {
        receptorKey: GNRHR.key,
        receptor: GNRHR.name,
        iupharTargetId: GNRHR.iupharId,
        role: "analog",
        citations: GNRHR.citations.slice(),
      },
    ],
  },

  // --- Single-receptor / no-overlap entries --------------------------------
  // Each of the following peptides engages a receptor or pathway not shared
  // by any other catalog peptide, OR acts via a non-receptor mechanism.

  "kisspeptin-10": {
    slug: "kisspeptin-10",
    name: "Kisspeptin-10",
    receptors: [
      {
        receptorKey: "KISS1R",
        receptor: "Kisspeptin receptor (KISS1R / GPR54)",
        iupharTargetId: "256",
        role: "full agonist",
        citations: [
          iuphar("256", "IUPHAR/BPS Kisspeptin receptor classification"),
          pmid("16174713", "Kisspeptin-54 stimulates the human HPG axis via KISS1R (Dhillo JCEM)"),
        ],
      },
    ],
    noDocumentedOverlap: true,
    reviewNote:
      "Acts upstream of GnRH neurons via KISS1R. Mechanistically related to the GnRH receptor cluster (gonadorelin/triptorelin) but engages a distinct receptor — overlap detection should NOT flag kisspeptin with GnRH analogs. Consider a separate 'HPG axis converging' advisory in a future iteration.",
  },
  cagrilintide: {
    slug: "cagrilintide",
    name: "Cagrilintide",
    receptors: [
      {
        receptorKey: "AMY",
        receptor: "Amylin receptors (AMY1/AMY2/AMY3 = CTR + RAMP heterodimers)",
        iupharTargetId: "44",
        role: "analog",
        citations: [
          iuphar("44", "IUPHAR/BPS Calcitonin receptor (component of AMY heterodimers)"),
          pmid("34798060", "Cagrilintide long-acting amylin analog phase-2 weight management trial (Lau Lancet)"),
        ],
      },
    ],
    noDocumentedOverlap: true,
  },
  oxytocin: {
    slug: "oxytocin",
    name: "Oxytocin",
    receptors: [
      {
        receptorKey: "OXTR",
        receptor: "Oxytocin receptor (OXTR)",
        iupharTargetId: "369",
        role: "full agonist",
        citations: [
          iuphar("369", "IUPHAR/BPS Oxytocin receptor classification"),
          pmid("11274341", "Gimpl 2001 Physiol Rev — Oxytocin receptor pharmacology"),
        ],
      },
    ],
    noDocumentedOverlap: true,
  },
  vip: {
    slug: "vip",
    name: "VIP",
    receptors: [
      {
        receptorKey: "VPAC",
        receptor: "VPAC1 / VPAC2 receptors",
        iupharTargetId: "379",
        role: "full agonist",
        citations: [
          iuphar("379", "IUPHAR/BPS VPAC1 receptor classification"),
          iuphar("380", "IUPHAR/BPS VPAC2 receptor classification"),
          pmid("21951273", "VPAC receptor structure and pharmacology (Couvineau Br J Pharmacol)"),
        ],
      },
    ],
    noDocumentedOverlap: true,
  },
  "thymosin-alpha-1": {
    slug: "thymosin-alpha-1",
    name: "Thymosin Alpha-1",
    receptors: [
      {
        receptorKey: "TLR9",
        receptor: "Toll-like receptor 9 (TLR9) — innate immunity",
        iupharTargetId: "1764",
        role: "full agonist",
        citations: [
          iuphar("1764", "IUPHAR/BPS TLR9 classification"),
          pmid("14982877", "Thymosin alpha-1 activates dendritic cells via Toll-like receptor signaling (Romani Blood)"),
        ],
      },
    ],
    noDocumentedOverlap: true,
    reviewNote:
      "Thymalin is a multi-peptide thymic extract with overlapping immunological function but is not a defined TLR9 ligand. Conservative call: do NOT cluster Tα1 with Thymalin via a shared receptor.",
  },
  "ll-37": {
    slug: "ll-37",
    name: "LL-37",
    receptors: [
      {
        receptorKey: "FPR2",
        receptor: "Formyl peptide receptor 2 (FPR2 / ALX)",
        iupharTargetId: "224",
        role: "full agonist",
        citations: [
          iuphar("224", "IUPHAR/BPS FPR2 classification"),
          pmid("11015447", "LL-37 activates FPR2 (FPRL1) in immune cells (De Yang J Exp Med)"),
        ],
      },
    ],
    noDocumentedOverlap: true,
    reviewNote:
      "LL-37 also acts via direct membrane disruption on microbes (non-receptor). FPR2 is its primary mammalian receptor.",
  },

  // --- Non-receptor / mechanism-only entries (no receptor overlap) ---------
  "bpc-157": {
    slug: "bpc-157",
    name: "BPC-157",
    receptors: [],
    noDocumentedOverlap: true,
    reviewNote:
      "Acts via downstream effectors (NO synthase / VEGF / GHR cross-talk) without a single defined receptor. Does not enter overlap detection.",
  },
  "tb-500": {
    slug: "tb-500",
    name: "TB-500",
    receptors: [],
    noDocumentedOverlap: true,
    reviewNote:
      "Thymosin beta-4 fragment. Mechanism is intracellular actin sequestration, not GPCR/receptor binding.",
  },
  "ghk-cu": {
    slug: "ghk-cu",
    name: "GHK-Cu",
    receptors: [],
    noDocumentedOverlap: true,
    reviewNote: "Copper tripeptide carrier; modulates gene expression downstream rather than via a defined receptor.",
  },
  "mots-c": {
    slug: "mots-c",
    name: "MOTS-c",
    receptors: [],
    noDocumentedOverlap: true,
    reviewNote: "Mitochondrial-derived peptide acting via AMPK; not a receptor agonist.",
  },
  aicar: {
    slug: "aicar",
    name: "AICAR",
    receptors: [],
    noDocumentedOverlap: true,
    reviewNote:
      "Direct AMP-mimetic AMPK activator. Shares the AMPK pathway with MOTS-c but neither is a receptor ligand — pathway-level convergence, not receptor overlap. Could be surfaced as a 'shared downstream effector' advisory in a future iteration.",
  },
  "5-amino-1mq": {
    slug: "5-amino-1mq",
    name: "5-Amino-1MQ",
    receptors: [],
    noDocumentedOverlap: true,
    reviewNote: "NNMT enzyme inhibitor; not a receptor ligand.",
  },
  "ss-31": {
    slug: "ss-31",
    name: "SS-31",
    receptors: [],
    noDocumentedOverlap: true,
    reviewNote: "Mitochondrial cardiolipin-binding tetrapeptide; non-receptor mechanism.",
  },
  glutathione: {
    slug: "glutathione",
    name: "Glutathione",
    receptors: [],
    noDocumentedOverlap: true,
    reviewNote: "Endogenous antioxidant tripeptide; non-receptor mechanism.",
  },
  "nad-precursor": {
    slug: "nad-precursor",
    name: "NAD+ Precursor",
    receptors: [],
    noDocumentedOverlap: true,
    reviewNote: "Coenzyme precursor; substrate for sirtuins/PARPs, not a receptor ligand.",
  },
  epithalon: {
    slug: "epithalon",
    name: "Epithalon",
    receptors: [],
    noDocumentedOverlap: true,
    reviewNote: "Telomerase / pineal-axis modulator; no defined receptor binding in the primary literature.",
  },
  pinealon: {
    slug: "pinealon",
    name: "Pinealon",
    receptors: [],
    noDocumentedOverlap: true,
    reviewNote: "Khavinson short peptide bioregulator; mechanism characterized as gene-expression modulation, not receptor binding.",
  },
  thymalin: {
    slug: "thymalin",
    name: "Thymalin",
    receptors: [],
    noDocumentedOverlap: true,
    reviewNote: "Multi-peptide thymic extract; no single defined receptor target.",
  },
  cerebrolysin: {
    slug: "cerebrolysin",
    name: "Cerebrolysin",
    receptors: [],
    noDocumentedOverlap: true,
    reviewNote: "Porcine brain-derived peptide complex; multi-mechanism, no single receptor target.",
  },
  semax: {
    slug: "semax",
    name: "Semax",
    receptors: [],
    noDocumentedOverlap: true,
    reviewNote:
      "Heptapeptide ACTH(4-7) analog. Some preclinical work suggests low-affinity melanocortin receptor binding, but the dominant CNS effect is BDNF/NGF upregulation via non-receptor mechanisms. Conservative call: do NOT include in MC1R/MC4R clusters. Flag for human reviewer.",
  },
  selank: {
    slug: "selank",
    name: "Selank",
    receptors: [],
    noDocumentedOverlap: true,
    reviewNote: "Tuftsin analog; modulates GABAergic and immune systems indirectly without a single defined receptor target.",
  },
  dsip: {
    slug: "dsip",
    name: "DSIP",
    receptors: [],
    noDocumentedOverlap: true,
    reviewNote: "Delta sleep-inducing peptide; receptor uncharacterized in the primary literature.",
  },
  "snap-8": {
    slug: "snap-8",
    name: "Snap-8",
    receptors: [],
    noDocumentedOverlap: true,
    reviewNote: "SNARE-complex-disrupting cosmetic peptide; intracellular mechanism, not a receptor agonist.",
  },
  "aod-9604": {
    slug: "aod-9604",
    name: "AOD-9604",
    receptors: [],
    noDocumentedOverlap: true,
    reviewNote:
      "GH C-terminal fragment (177-191). Originally hypothesized to act via a β3-adrenergic mechanism; modern reviews describe lipolytic activity without confirmed receptor binding. Does not engage GHRHR or GHSR. No catalog overlap.",
  },
  adipotide: {
    slug: "adipotide",
    name: "Adipotide",
    receptors: [],
    noDocumentedOverlap: true,
    reviewNote: "Pro-apoptotic peptide targeting prohibitin/ANXA2 on white-adipose vasculature; not a receptor agonist in the GPCR sense.",
  },
  "foxo4-dri": {
    slug: "foxo4-dri",
    name: "FOXO4-DRI",
    receptors: [],
    noDocumentedOverlap: true,
    reviewNote: "Intracellular FOXO4-p53 disrupting D-retro-inverso peptide; not a receptor ligand.",
  },
  "ace-031": {
    slug: "ace-031",
    name: "ACE-031",
    receptors: [
      {
        receptorKey: "ACVR2B",
        receptor: "Activin type IIB receptor (ACVR2B) — ligand trap (Fc fusion)",
        iupharTargetId: "1791",
        role: "ligand trap",
        citations: [
          iuphar("1791", "IUPHAR/BPS ACVR2B classification"),
          pmid("16330774", "Soluble ActRIIB-Fc traps myostatin/activin ligands (Lee PNAS)"),
        ],
      },
    ],
    noDocumentedOverlap: true,
    reviewNote:
      "Decoy receptor (Fc fusion) that captures myostatin/activin ligands rather than agonizing a receptor. No other catalog peptide engages this pathway — no overlap.",
  },
  "slu-pp-332": {
    slug: "slu-pp-332",
    name: "SLU-PP-332",
    receptors: [
      {
        receptorKey: "ESRRA",
        receptor: "Estrogen-related receptor alpha (ERRα) — nuclear receptor",
        iupharTargetId: "618",
        role: "full agonist",
        citations: [
          iuphar("618", "IUPHAR/BPS ERRα classification"),
          pmid("36988910", "Synthetic ERR agonist induces aerobic exercise response (Billon ACS Chem Biol)"),
        ],
      },
    ],
    noDocumentedOverlap: true,
    reviewNote: "Nuclear receptor agonist (not GPCR). No other catalog peptide engages ERRα.",
  },
};

// ---------------------------------------------------------------------------
// Overlap clusters — receptor systems with 2+ catalog peptides engaging them
// ---------------------------------------------------------------------------

export const PATHWAY_OVERLAPS: OverlapCluster[] = [
  {
    receptorKey: GHRHR.key,
    receptor: GHRHR.name,
    iupharTargetId: GHRHR.iupharId,
    agonistSlugs: ["cjc-1295-no-dac", "cjc-1295-w-dac", "sermorelin", "tesamorelin"],
    mechanismSummary:
      "All four are growth-hormone-releasing-hormone analogs that engage the pituitary GHRH receptor to drive endogenous GH release.",
    cardCopy:
      "Selected compounds engage the same growth-hormone-releasing-hormone receptor (GHRHR). Researchers may consider that stacking multiple GHRH analogs creates redundant receptor occupancy on the same pituitary pathway rather than complementary signaling, which can confound attribution in observational study design.",
    citations: GHRHR.citations.slice(),
  },
  {
    receptorKey: GHSR.key,
    receptor: GHSR.name,
    iupharTargetId: GHSR.iupharId,
    agonistSlugs: ["ipamorelin", "ghrp-2", "ghrp-6", "hexarelin"],
    mechanismSummary:
      "All four are growth hormone secretagogues that activate the ghrelin receptor (GHSR1a) on somatotrophs to evoke GH release.",
    cardCopy:
      "Selected compounds engage the same ghrelin receptor (GHSR1a). Researchers may consider that combining multiple GHSR1a agonists drives the same pituitary pathway with potential receptor saturation, rather than the complementary GHRH + GHRP pairing that the literature describes as additive.",
    citations: GHSR.citations.slice(),
  },
  {
    receptorKey: GLP1R.key,
    receptor: GLP1R.name,
    iupharTargetId: GLP1R.iupharId,
    agonistSlugs: ["rr-a1", "rr-a2", "rr-a3", "mazdutide", "survodutide"],
    mechanismSummary:
      "All five are incretin-mechanism analogs whose pharmacology includes activation of the GLP-1 receptor.",
    cardCopy:
      "Selected compounds engage the same GLP-1 receptor (GLP1R). Researchers may consider that overlapping GLP-1R activation across multiple incretin-mechanism analogs produces redundant receptor occupancy on the same metabolic pathway, which can confound attribution in study design.",
    citations: GLP1R.citations.slice(),
  },
  {
    receptorKey: GIPR.key,
    receptor: GIPR.name,
    iupharTargetId: GIPR.iupharId,
    agonistSlugs: ["rr-a2", "rr-a3"],
    mechanismSummary:
      "Both are dual/triple-incretin mechanism analogs whose pharmacology includes activation of the GIP receptor.",
    cardCopy:
      "Selected compounds engage the same glucose-dependent insulinotropic polypeptide receptor (GIPR). Researchers may consider that shared GIPR activation produces overlapping incretin signaling on the same metabolic pathway.",
    citations: GIPR.citations.slice(),
  },
  {
    receptorKey: GCGR.key,
    receptor: GCGR.name,
    iupharTargetId: GCGR.iupharId,
    agonistSlugs: ["rr-a3", "mazdutide", "survodutide"],
    mechanismSummary:
      "All three are dual/triple-mechanism analogs whose pharmacology includes activation of the glucagon receptor.",
    cardCopy:
      "Selected compounds engage the same glucagon receptor (GCGR). Researchers may consider that overlapping GCGR activation across multiple analogs produces redundant signaling on the same metabolic pathway, which can confound attribution.",
    citations: GCGR.citations.slice(),
  },
  {
    receptorKey: MC1R.key,
    receptor: MC1R.name,
    iupharTargetId: MC1R.iupharId,
    agonistSlugs: ["melanotan-i", "melanotan-ii"],
    mechanismSummary:
      "Both are α-MSH analogs that activate the melanocortin-1 receptor (MC1R) on melanocytes.",
    cardCopy:
      "Selected compounds engage the same melanocortin-1 receptor (MC1R). Researchers may consider that pairing MC1R agonists creates redundant occupancy of the melanogenesis pathway rather than complementary signaling.",
    citations: MC1R.citations.slice(),
  },
  {
    receptorKey: MC4R.key,
    receptor: MC4R.name,
    iupharTargetId: MC4R.iupharId,
    agonistSlugs: ["melanotan-ii", "pt-141"],
    mechanismSummary:
      "Both engage the central melanocortin-4 receptor (MC4R); Melanotan II is a pan-MC agonist while PT-141 (bremelanotide) is MC4R-preferring.",
    cardCopy:
      "Selected compounds engage the same melanocortin-4 receptor (MC4R) in the central nervous system. Researchers may consider that overlapping MC4R activation produces redundant occupancy on the same central pathway.",
    citations: MC4R.citations.slice(),
  },
  {
    receptorKey: IGF1R.key,
    receptor: IGF1R.name,
    iupharTargetId: IGF1R.iupharId,
    agonistSlugs: ["igf-1-lr3", "igf-des", "mgf", "peg-mgf"],
    mechanismSummary:
      "All four are IGF-1-family ligands believed to engage the IGF-1 receptor; MGF/PEG-MGF receptor profile is contested in the literature.",
    cardCopy:
      "Selected compounds engage the same insulin-like growth factor 1 receptor (IGF-1R). Researchers may consider that overlapping IGF-1R activation produces redundant signaling on the same anabolic pathway, which can confound attribution.",
    citations: IGF1R.citations.slice(),
  },
  {
    receptorKey: GNRHR.key,
    receptor: GNRHR.name,
    iupharTargetId: GNRHR.iupharId,
    agonistSlugs: ["gonadorelin", "triptorelin"],
    mechanismSummary:
      "Both engage the pituitary gonadotropin-releasing hormone receptor (GnRHR); gonadorelin is native pulsatile GnRH while triptorelin is a long-acting decapeptide agonist.",
    cardCopy:
      "Selected compounds engage the same gonadotropin-releasing hormone receptor (GnRHR). Researchers may consider that combining a pulsatile GnRH agent with a long-acting GnRH agonist produces fundamentally different signaling on the same receptor (pulsatile stimulation vs. desensitization), which can confound attribution.",
    citations: GNRHR.citations.slice(),
  },
];

// ---------------------------------------------------------------------------
// Convenience accessors
// ---------------------------------------------------------------------------

/** All slugs covered by this dataset (catalog peptides + nad-precursor). */
export const PATHWAY_DATASET_SLUGS: string[] = Object.keys(PEPTIDE_RECEPTORS);

// ---------------------------------------------------------------------------
// Detection logic — receptor-system overlap among the user's selection.
// ---------------------------------------------------------------------------

export interface TriggeredOverlap {
  /** The cluster definition (receptor name, citations, copy). */
  cluster: OverlapCluster;
  /** Selected peptides that engage this receptor. Always 2+ when triggered. */
  matchedPeptides: Array<{ slug: string; name: string }>;
}

const looseSlug = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Resolve a selected slug (or product slug) to the canonical key in
 * PEPTIDE_RECEPTORS. Returns null if the selection is not in the dataset.
 */
export function resolveDatasetSlug(slug: string | null | undefined): string | null {
  if (!slug) return null;
  if (PEPTIDE_RECEPTORS[slug]) return slug;
  const norm = looseSlug(slug);
  for (const key of Object.keys(PEPTIDE_RECEPTORS)) {
    if (looseSlug(key) === norm) return key;
  }
  return null;
}

/**
 * Detect every receptor-system overlap triggered by the current selection.
 * Returns one entry per receptor cluster that has 2+ selected agonists.
 *
 * Synergy / overlap disambiguation: this function intentionally only flags
 * shared receptor binding. Combinations the synergy engine celebrates as
 * complementary (e.g., GHRH analog + GHRP) hit different receptors and are
 * therefore never returned here.
 */
export function detectPathwayOverlaps(selectedSlugs: string[]): TriggeredOverlap[] {
  const resolvedSlugs = Array.from(
    new Set(
      selectedSlugs
        .map(resolveDatasetSlug)
        .filter((s): s is string => Boolean(s)),
    ),
  );
  if (resolvedSlugs.length < 2) return [];

  const triggered: TriggeredOverlap[] = [];
  for (const cluster of PATHWAY_OVERLAPS) {
    const matchedSlugs = cluster.agonistSlugs.filter((s) => resolvedSlugs.includes(s));
    if (matchedSlugs.length >= 2) {
      triggered.push({
        cluster,
        matchedPeptides: matchedSlugs.map((s) => ({
          slug: s,
          name: PEPTIDE_RECEPTORS[s]?.name ?? s,
        })),
      });
    }
  }
  return triggered;
}

/**
 * Helper for the connection graph — given two product slugs, returns the
 * triggered overlap entry that links them (or null when the pair is not part
 * of any triggered cluster).
 */
export function findOverlapForPair(
  slugA: string | null | undefined,
  slugB: string | null | undefined,
  triggered: TriggeredOverlap[],
): TriggeredOverlap | null {
  const a = resolveDatasetSlug(slugA);
  const b = resolveDatasetSlug(slugB);
  if (!a || !b || a === b) return null;
  for (const t of triggered) {
    const slugs = t.cluster.agonistSlugs;
    if (slugs.includes(a) && slugs.includes(b)) return t;
  }
  return null;
}
