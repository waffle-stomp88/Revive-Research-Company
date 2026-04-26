# Pathway Overlap Dataset — Human-Review Report

**Dataset module:** `client/src/lib/pathway-overlaps.ts`
**Catalog snapshot:** 51 entries total = 50 single-compound peptides in the Peptides category + 1 NAD+ Precursor in Research Compounds. Composite blends — `cag-sema-blend`, `glow-peptide-complex`, `klow-peptide-complex` — are intentionally excluded; they are multi-component products that should be handled at the UI layer, not as single-receptor entries.

This report is a one-sitting audit surface. Every receptor binding claim in the dataset is reproduced here with its IUPHAR objectId and at least one PubMed PMID. Click each link before approving.

> **Source hierarchy (non-negotiable):**
> 1. **IUPHAR/BPS Guide to Pharmacology** — authoritative receptor classification (every receptor below carries an `objectId`).
> 2. **PubMed** — primary literature backing each binding claim (1–2 PMIDs per receptor).
> 3. **researchdosing.com** — used only for community vocabulary cross-checking. Never cited as a primary source.

> **Compliance reminders applied throughout:**
> - GLP-1 cluster uses **mechanism language only** — RR-A1/RR-A2/RR-A3 are described as "GLP-1 receptor analog," "dual GLP-1/GIP," "triple GLP-1/GIP/GCG." No originator compound names appear anywhere in `pathway-overlaps.ts` or in this report's card copy section.
> - All card copy is observational ("engage," "researchers may consider"). No imperative voice. No dosing. No health claims.

---

## 1. Catalog inventory — 51 peptides + receptor assignment

Format: **slug** → primary receptor system → IUPHAR objectId.
"No receptor overlap" = engages no receptor system shared with any other catalog peptide (either single-receptor unique, or non-receptor mechanism).

### GHRH receptor cluster (4 peptides)
| Slug | Name | Receptor | IUPHAR |
|---|---|---|---|
| `cjc-1295-no-dac` | CJC-1295 (No DAC) | GHRHR | 248 |
| `cjc-1295-w-dac` | CJC-1295 w/ DAC | GHRHR | 248 |
| `sermorelin` | Sermorelin | GHRHR | 248 |
| `tesamorelin` | Tesamorelin | GHRHR | 248 |

### Ghrelin receptor / GHSR1a cluster (4 peptides)
| Slug | Name | Receptor | IUPHAR |
|---|---|---|---|
| `ipamorelin` | Ipamorelin | GHSR1a | 233 |
| `ghrp-2` | GHRP-2 | GHSR1a | 233 |
| `ghrp-6` | GHRP-6 | GHSR1a | 233 |
| `hexarelin` | Hexarelin | GHSR1a | 233 |

### Incretin receptor cluster (5 peptides)
*Compliance: receptor-only language; no compound names.*

| Slug | Name | GLP1R | GIPR | GCGR |
|---|---|---|---|---|
| `rr-a1` | RR-A1 | ✓ | — | — |
| `rr-a2` | RR-A2 | ✓ | ✓ | — |
| `rr-a3` | RR-A3 | ✓ | ✓ | ✓ |
| `mazdutide` | Mazdutide | ✓ | — | ✓ |
| `survodutide` | Survodutide | ✓ | — | ✓ |

IUPHAR ids: GLP1R=249, GIPR=247, GCGR=250.

### Melanocortin clusters (3 peptides; KPV intentionally excluded — see flagged review)
| Slug | Name | MC1R (281) | MC4R (284) |
|---|---|---|---|
| `melanotan-i` | Melanotan I | ✓ (preferred) | — |
| `melanotan-ii` | Melanotan II | ✓ (pan-MC) | ✓ (pan-MC) |
| `pt-141` | PT-141 | — | ✓ (preferred) |

### IGF-1 receptor cluster (4 peptides)
| Slug | Name | Receptor | IUPHAR |
|---|---|---|---|
| `igf-1-lr3` | IGF-1 LR3 | IGF-1R | 1804 |
| `igf-des` | IGF-DES | IGF-1R | 1804 |
| `mgf` | MGF | IGF-1R (contested) | 1804 |
| `peg-mgf` | PEG-MGF | IGF-1R (contested) | 1804 |

### GnRH receptor cluster (2 peptides)
| Slug | Name | Receptor | IUPHAR |
|---|---|---|---|
| `gonadorelin` | Gonadorelin | GnRHR | 254 |
| `triptorelin` | Triptorelin | GnRHR | 254 |

### Single-receptor (no overlap with other catalog peptides)
| Slug | Name | Receptor | IUPHAR |
|---|---|---|---|
| `kisspeptin-10` | Kisspeptin-10 | KISS1R / GPR54 | 256 |
| `cagrilintide` | Cagrilintide | Amylin (CTR + RAMP) | 44 (CTR component) |
| `oxytocin` | Oxytocin | OXTR | 369 |
| `vip` | VIP | VPAC1 / VPAC2 | 379 / 380 |
| `thymosin-alpha-1` | Thymosin Alpha-1 | TLR9 (innate immunity) | 1764 |
| `ll-37` | LL-37 | FPR2 / ALX | 224 |
| `ace-031` | ACE-031 | ACVR2B (decoy / ligand trap) | 1791 |
| `slu-pp-332` | SLU-PP-332 | ERRα (nuclear receptor) | 618 |

### No documented receptor overlap (non-receptor mechanisms or characterized targets unique within the catalog)
`bpc-157`, `tb-500`, `ghk-cu`, `mots-c`, `aicar`, `5-amino-1mq`, `ss-31`, `glutathione`, `nad-precursor`, `epithalon`, `pinealon`, `thymalin`, `cerebrolysin`, `semax`, `selank`, `dsip`, `snap-8`, `aod-9604`, `adipotide`, `foxo4-dri`, `kpv`.

### Composite blends excluded from receptor map
`cag-sema-blend`, `glow-peptide-complex`, `klow-peptide-complex` — multi-peptide blends. The future overlap-detection UI should expand each blend into its constituents at runtime when checking for receptor conflicts; do not assign a single receptor here.

---

## 2. Overlap clusters — ship-ready cards

Each block is what the future UI will surface when 2+ selected peptides hit that receptor. All citations live in `PATHWAY_OVERLAPS[].citations` in the dataset module.

### 2.1 GHRH receptor (GHRHR) — IUPHAR 248
- **Agonists:** CJC-1295 (No DAC), CJC-1295 w/ DAC, Sermorelin, Tesamorelin
- **Mechanism:** All four are GHRH analogs that engage the pituitary GHRH receptor to drive endogenous GH release.
- **Citations:**
  - IUPHAR 248 — https://www.guidetopharmacology.org/GRAC/ObjectDisplayForward?objectId=248
  - PMID 18057338 (Tesamorelin GHRHR pharmacology in human study — Falutz NEJM) — https://pubmed.ncbi.nlm.nih.gov/18057338/
  - PMID 16352683 (CJC-1295 sustained GHRHR agonism in humans — Teichman JCEM) — https://pubmed.ncbi.nlm.nih.gov/16352683/
- **Card copy:** *Selected compounds engage the same growth-hormone-releasing-hormone receptor (GHRHR). Researchers may consider that stacking multiple GHRH analogs creates redundant receptor occupancy on the same pituitary pathway rather than complementary signaling, which can confound attribution in observational study design.*

### 2.2 Ghrelin receptor / GHSR1a — IUPHAR 233
- **Agonists:** Ipamorelin, GHRP-2, GHRP-6, Hexarelin
- **Mechanism:** All four are growth hormone secretagogues that activate GHSR1a on somatotrophs to evoke GH release.
- **Citations:**
  - IUPHAR 233 — https://www.guidetopharmacology.org/GRAC/ObjectDisplayForward?objectId=233
  - PMID 9849822 (Ipamorelin as a selective GHSR1a agonist — Raun Eur J Endocrinol) — https://pubmed.ncbi.nlm.nih.gov/9849822/
  - PMID 10604470 (Ghrelin discovery as the endogenous GHSR1a ligand — Kojima Nature) — https://pubmed.ncbi.nlm.nih.gov/10604470/
- **Card copy:** *Selected compounds engage the same ghrelin receptor (GHSR1a). Researchers may consider that combining multiple GHSR1a agonists drives the same pituitary pathway with potential receptor saturation, rather than the complementary GHRH + GHRP pairing that the literature describes as additive.*

### 2.3 GLP-1 receptor (GLP1R) — IUPHAR 249
- **Agonists:** RR-A1, RR-A2, RR-A3, Mazdutide, Survodutide
- **Mechanism:** All five are incretin-mechanism analogs whose pharmacology includes activation of GLP-1R.
- **Citations:**
  - IUPHAR 249 — https://www.guidetopharmacology.org/GRAC/ObjectDisplayForward?objectId=249
  - PMID 29617641 (GLP-1R pharmacology and incretin biology — Drucker Cell Metab) — https://pubmed.ncbi.nlm.nih.gov/29617641/
- **Card copy:** *Selected compounds engage the same GLP-1 receptor (GLP1R). Researchers may consider that overlapping GLP-1R activation across multiple incretin-mechanism analogs produces redundant receptor occupancy on the same metabolic pathway, which can confound attribution in study design.*

### 2.4 GIP receptor (GIPR) — IUPHAR 247
- **Agonists:** RR-A2, RR-A3
- **Mechanism:** Both are dual/triple-incretin mechanism analogs whose pharmacology includes activation of GIPR.
- **Citations:**
  - IUPHAR 247 — https://www.guidetopharmacology.org/GRAC/ObjectDisplayForward?objectId=247
  - PMID 29617641 (Incretin biology covering GIP and GLP-1 receptor signaling — Drucker Cell Metab) — https://pubmed.ncbi.nlm.nih.gov/29617641/
- **Card copy:** *Selected compounds engage the same glucose-dependent insulinotropic polypeptide receptor (GIPR). Researchers may consider that shared GIPR activation produces overlapping incretin signaling on the same metabolic pathway.*

### 2.5 Glucagon receptor (GCGR) — IUPHAR 250
- **Agonists:** RR-A3, Mazdutide, Survodutide
- **Mechanism:** All three are dual/triple-mechanism analogs whose pharmacology includes activation of GCGR.
- **Citations:**
  - IUPHAR 250 — https://www.guidetopharmacology.org/GRAC/ObjectDisplayForward?objectId=250
  - PMID 28733905 (Dual GLP-1 / glucagon receptor co-agonism — Sánchez-Garrido Diabetologia) — https://pubmed.ncbi.nlm.nih.gov/28733905/
- **Card copy:** *Selected compounds engage the same glucagon receptor (GCGR). Researchers may consider that overlapping GCGR activation across multiple analogs produces redundant signaling on the same metabolic pathway, which can confound attribution.*

### 2.6 Melanocortin-1 receptor (MC1R) — IUPHAR 281
- **Agonists:** Melanotan I, Melanotan II
- **Mechanism:** Both are α-MSH analogs that activate MC1R on melanocytes.
- **Citations:**
  - IUPHAR 281 — https://www.guidetopharmacology.org/GRAC/ObjectDisplayForward?objectId=281
  - PMID 23277150 (MC1R agonist clinical pharmacology in erythropoietic protoporphyria) — https://pubmed.ncbi.nlm.nih.gov/23277150/
- **Card copy:** *Selected compounds engage the same melanocortin-1 receptor (MC1R). Researchers may consider that pairing MC1R agonists creates redundant occupancy of the melanogenesis pathway rather than complementary signaling.*

### 2.7 Melanocortin-4 receptor (MC4R) — IUPHAR 284
- **Agonists:** Melanotan II, PT-141
- **Mechanism:** Both engage MC4R in the central nervous system; Melanotan II is pan-MC, PT-141 (bremelanotide) is MC4R-preferring.
- **Citations:**
  - IUPHAR 284 — https://www.guidetopharmacology.org/GRAC/ObjectDisplayForward?objectId=284
  - PMID 12851303 (PT-141 / bremelanotide MC4R-preferring pharmacology — Wessells) — https://pubmed.ncbi.nlm.nih.gov/12851303/
  - PMID 12181489 (MC4R role established with MTII activation — Van der Ploeg PNAS) — https://pubmed.ncbi.nlm.nih.gov/12181489/
- **Card copy:** *Selected compounds engage the same melanocortin-4 receptor (MC4R) in the central nervous system. Researchers may consider that overlapping MC4R activation produces redundant occupancy on the same central pathway.*

### 2.8 IGF-1 receptor (IGF-1R) — IUPHAR 1804
- **Agonists:** IGF-1 LR3, IGF-DES, MGF, PEG-MGF
- **Mechanism:** All four are IGF-1-family ligands believed to engage IGF-1R; MGF/PEG-MGF receptor profile is contested in the literature (see flagged review §4).
- **Citations:**
  - IUPHAR 1804 — https://www.guidetopharmacology.org/GRAC/ObjectDisplayForward?objectId=1804
  - PMID 19029956 (IGF-1R signaling overview — Pollak Nat Rev Cancer) — https://pubmed.ncbi.nlm.nih.gov/19029956/
  - PMID 20130113 (MGF / IGF-1Ec splice-variant biology in muscle) — https://pubmed.ncbi.nlm.nih.gov/20130113/
- **Card copy:** *Selected compounds engage the same insulin-like growth factor 1 receptor (IGF-1R). Researchers may consider that overlapping IGF-1R activation produces redundant signaling on the same anabolic pathway, which can confound attribution.*

### 2.9 GnRH receptor (GnRHR) — IUPHAR 254
- **Agonists:** Gonadorelin, Triptorelin
- **Mechanism:** Both engage the pituitary GnRH receptor; gonadorelin is native pulsatile GnRH while triptorelin is a long-acting decapeptide agonist.
- **Citations:**
  - IUPHAR 254 — https://www.guidetopharmacology.org/GRAC/ObjectDisplayForward?objectId=254
  - PMID 3007876 (GnRH receptor and gonadotropin release — Conn Endocr Rev) — https://pubmed.ncbi.nlm.nih.gov/3007876/
  - PMID 31644065 (Triptorelin GnRH-analog pharmacology review) — https://pubmed.ncbi.nlm.nih.gov/31644065/
- **Card copy:** *Selected compounds engage the same gonadotropin-releasing hormone receptor (GnRHR). Researchers may consider that combining a pulsatile GnRH agent with a long-acting GnRH agonist produces fundamentally different signaling on the same receptor (pulsatile stimulation vs. desensitization), which can confound attribution.*

---

## 3. Synergy ≠ overlap — explicit disambiguation

The detection engine must NOT flag the following well-established synergistic pairings, even though they sit on the same physiological axis. These are different receptors on a complementary axis — that is exactly what the existing synergy engine celebrates and is **out of scope** for overlap detection.

| Pairing | Why it is synergy, not overlap |
|---|---|
| GHRH analog (e.g., CJC-1295, Sermorelin, Tesamorelin) + GHRP (e.g., Ipamorelin, GHRP-2/6, Hexarelin) | GHRHR (IUPHAR 248) and GHSR1a (IUPHAR 233) are **distinct receptors** on the same pituitary axis. Co-activation is additive — the literature establishes this as the gold-standard GH amplification pairing. |
| Incretin agonist (e.g., RR-A1/2/3, Mazdutide, Survodutide) + Cagrilintide | GLP-1R (IUPHAR 249) and the amylin (CTR+RAMP) receptor are different receptors. The combination is one of the most-studied complementary metabolic pairings. |
| IGF-1 ligand (IGF-1 LR3 / IGF-DES / MGF) + GH secretagogue (CJC-1295 / Ipamorelin) | IGF-1R is downstream; GHSR/GHRHR sit upstream at the pituitary. Different receptors, different axis level. |
| Kisspeptin-10 + Gonadorelin | KISS1R (IUPHAR 256) is **upstream** of the GnRHR (IUPHAR 254). Different receptors. Convergent on the HPG axis but receptor-distinct. A future iteration may surface a softer "axis convergence" advisory; the v1 detection engine should NOT flag this. |
| MOTS-c + AICAR | Both converge on AMPK as a downstream effector, but neither is a receptor agonist. Pathway convergence ≠ receptor overlap. Do not flag in v1. |
| BPC-157 + GHK-Cu / TB-500 | All three act via downstream effectors without a defined shared receptor. No flag. |

---

## 4. Flagged for human review

These entries warrant human eyes before the detection feature ships. The dataset reflects the conservative call described below; this section explains where the science is ambiguous so the reviewer can override.

### 4.1 KPV (excluded from MC1R cluster — needs reviewer approval)
KPV is the C-terminal tripeptide of α-MSH. Anti-inflammatory action via NF-κB inhibition is well documented in the primary literature, but **MC1R agonism by KPV is contested** — several reviews describe KPV's anti-inflammatory effect as substantially receptor-independent. Conservative call in `pathway-overlaps.ts`: KPV is NOT in the MC1R cluster (no `MC1R` receptor entry in `PEPTIDE_RECEPTORS["kpv"]`). Reviewer can override and add `"kpv"` to `MC1R.agonistSlugs` plus an `MC1R` engagement entry on the KPV record if a stronger source is identified.

### 4.2 MGF / PEG-MGF (included in IGF-1R cluster — needs reviewer approval)
MGF (mechano growth factor) is the IGF-1Ec splice variant. The dominant literature view is that MGF signals through IGF-1R at lower affinity than mature IGF-1, but a separate "MGF receptor" has been proposed (e.g., Yang & Goldspink 2002). Conservative call: MGF and PEG-MGF are listed in the IGF-1R cluster. Reviewer can split these out into their own pathway entry if preferred.

### 4.3 Melanotan II — pan-MC profile
Melanotan II engages MC1R, MC3R, MC4R, and MC5R. It appears in **two** clusters (MC1R with Melanotan I, MC4R with PT-141). MC3R and MC5R are not separate clusters because no other catalog peptide engages them. The future UI should be aware that MTII can trigger both MC1R and MC4R overlap cards simultaneously when paired appropriately.

### 4.4 PT-141 (bremelanotide) — MC4R-preferring with weaker MC1R/MC3R/MC5R activity
Listed in MC4R cluster only. Reviewer can choose to extend to MC1R cluster if researcher behavior frequently pairs PT-141 with Melanotan-I; the conservative call is to keep it in MC4R only.

### 4.5 Semax — possible weak melanocortin engagement
Semax is an ACTH(4-7) Pro-Gly-Pro analog. Some preclinical work suggests low-affinity melanocortin receptor binding, but the dominant mechanism in the CNS literature is BDNF/NGF upregulation via non-receptor pathways. Conservative call: Semax is NOT in the MC1R/MC4R clusters. Reviewer override only if a strong primary source is identified.

### 4.6 Thymosin Alpha-1 vs. Thymalin — different molecules, different evidence
Tα1 has documented TLR9 / dendritic-cell-activation agonism in the primary literature (PMID 14982877 — Romani Blood). Thymalin is a multi-peptide thymic extract without a single defined receptor target. Conservative call: do NOT cluster these two via a shared receptor, even though the synergy engine pairs them in immune-protocol stacks. Their pairing is mechanistic synergy, not receptor overlap.

### 4.7 LL-37 — receptor + non-receptor mechanism
LL-37's primary mammalian receptor is FPR2/ALX (IUPHAR 224). Its antimicrobial action is largely receptor-independent (membrane disruption). Listed in single-receptor table — no other catalog peptide engages FPR2.

### 4.8 AOD-9604 — historic β3-adrenergic claim is no longer well supported
The original literature proposed β3-adrenergic receptor mediation; modern reviews describe AOD-9604's lipolytic activity without confirmed receptor binding. Conservative call: not assigned to any receptor cluster. Reviewer can revisit if a defensible β3 source is identified.

### 4.9 Composite blends — not assigned single receptors
`cag-sema-blend`, `glow-peptide-complex`, `klow-peptide-complex` are blends of multiple peptides. The dataset deliberately does not assign them a single receptor. The future overlap-detection UI should expand each blend into its constituent peptides at runtime when checking for shared-receptor conflicts.

### 4.10 IUPHAR objectId verification
Every IUPHAR objectId in the dataset should be clicked through and verified. The receptor names are canonical, but the integer ids occasionally shift between Guide-to-Pharmacology revisions. If an id 404s, the receptor can still be found by name search at https://www.guidetopharmacology.org/.

---

## 5. Coverage summary

- **Total catalog peptides covered:** 51 (50 single-compound peptides in the Peptides category + NAD+ Precursor in Research Compounds).
- **Composite blends excluded:** 3 (`cag-sema-blend`, `glow-peptide-complex`, `klow-peptide-complex`) — handle at UI layer by expanding into constituents.
- **Overlap clusters:** 9 (GHRHR, GHSR1a, GLP1R, GIPR, GCGR, MC1R, MC4R, IGF-1R, GnRHR).
- **Single-receptor (no overlap):** 8 peptides.
- **Non-receptor mechanism / no receptor cluster:** 21 peptides.
- **Total receptor-engagement claims:** every claim cites at least one IUPHAR objectId AND at least one PubMed PMID.
- **Compliance:** zero compound-name references in the GLP-1 cluster (RR-A1/A2/A3 described by mechanism only).
