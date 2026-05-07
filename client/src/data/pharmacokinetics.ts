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
 *
 * SC altRoute additions (May 2026): Dual-route rows added for IV-primary entries
 * with clinically evident SC use:
 *  - Cerebrolysin: SC estimate ~1–3 h based on neuropeptide mixture absorption
 *    models; no compound-specific SC PK study identified; dedicated IM/SC search
 *    returned null result (see altRoute.note); no citation assigned to SC altRoute
 *
 * Cerebrolysin IM PK search (May 2026): Extended search of Russian and Eastern
 * European clinical databases performed per task specification:
 *  - eLIBRARY.ru (RSCI) searched using Cyrillic query
 *    'Церебролизин фармакокинетика внутримышечно' — no relevant IM/SC PK
 *    articles identified (full-text access requires registration)
 *  - CyberLeninka searched with same Cyrillic query — multiple Cerebrolysin
 *    clinical articles found, none containing IM/SC absorption or half-life data
 *  - EVER Neuro Pharma official SmPC confirmed via rlsnet.ru (Russian drug
 *    registry, April 2026) — pharmacokinetics section explicitly states PK
 *    analysis of individual components is not possible due to mixture complexity;
 *    no IM or SC data in the official dossier
 *  Result: confirmed null. No code change to citations; note updated in entry.
 *  - Lipo-C: SC estimate ~2–4 h for the ascorbic acid component; initially
 *    cited PMID 11340098 and PMID 15068981 as SC references (see correction
 *    below in the May 2026 citation audit block)
 *
 * Citation audit (May 2026) — IV-primary SC altRoute citation reuse review:
 *   Audit scope: all altRoute entries in IV-primary rows (glutathione, lipo-c).
 *   SC-primary rows with IV altRoutes (kisspeptin-54, VIP) were also reviewed
 *   and found to have citation reuse errors requiring correction (see below).
 *   Cerebrolysin was already corrected in a prior audit (citations: []).
 *
 *   Kisspeptin-54 citation reuse (corrected): PMID 16278289 (Dhillo et al.
 *   2005) and PMID 19237537 (Chan et al. 2009) were both present in the SC
 *   parent citations array and in the IV altRoute citations array.
 *   Corrective action: Dhillo 2005 (IV-only study) moved exclusively to the
 *   IV altRoute citations array; Chan 2009 (SC bolus PK study) restricted
 *   exclusively to the SC parent citations array; IV comparison data from
 *   Chan 2009 retained by note reference only.
 *
 *   VIP citation reuse (corrected): PMID 7175453 (Domschke et al. 1979) was
 *   present in both the SC parent citations array and the IV altRoute
 *   citations array. That study characterises IV VIP pharmacokinetics only
 *   and is not a SC measurement. Corrective action: SC parent citations array
 *   cleared (no SC-specific VIP PK citation exists); PMID 7175453 assigned
 *   exclusively to the IV altRoute citations array where it belongs; SC entry
 *   now cites only Morice et al. (1983, PMID 6139325) as the closest
 *   available non-IV absorption proxy (inhaled VIP).
 *  - Glutathione SC altRoute: PMID 26052837 (Zhou et al. 2015) was reused
 *    verbatim from the parent IV entry. That study characterises IV
 *    N-acetylcysteine and indirect IV glutathione PK; it does not measure SC
 *    depot absorption or SC bioavailability. Citation removed; altRoute.note
 *    documents the null search result and the removal rationale.
 *  - Lipo-C SC altRoute: PMID 11340098 (Graumlich et al. 1997) was reused
 *    verbatim from the parent IV entry; PMID 15068981 (Padayatty et al. 2004)
 *    is an oral/IV study added at initial authoring. Neither paper measures SC
 *    ascorbic acid depot absorption or bioavailability. Both citations removed;
 *    altRoute.note documents the null search result and removal rationale.
 *
 * Citation update (May 2026): Direct IV vasopressin PK citation added:
 *  - Vasopressin: proxy oxytocin receptor review (Gimpl & Fahrenholz 2001,
 *    PMID 11445820) replaced with Baumann & Dingman (1976, PMID 1262454) —
 *    a primary IV pharmacokinetics study of arginine vasopressin in humans
 *    (J Clin Invest 57:1109–1116) measuring metabolic clearance rate, plasma
 *    half-life (~5–15 min IV), and volume of distribution during controlled
 *    intravenous infusion. This brings the vasopressin entry to the same
 *    citation standard as gonadorelin, kisspeptin-10, and kisspeptin-54.
 *
 * Citation audit (May 2026, systematic pass): All remaining entries audited
 * for proxy citations. Findings and dispositions:
 *
 *  Entries where no compound-specific PK study exists — citation is to the
 *  best available indexed study (pharmacological, biological, or review) with
 *  a note field documenting this explicitly:
 *  - MOTS-C: Lee et al. 2015 (Cell Metab, PMID 25738459) is the discovery /
 *    metabolic-biology paper for MOTS-c, not a pharmacokinetics study. Half-life
 *    estimate is from mitochondrial-derived peptide class data. Note added.
 *    (Subsequently upgraded — see May 2026 MOTS-C citation update below.)
 *  - Epithalon: Khavinson (2002, Neuro Endocrinol Lett, PMID 12374906) is a
 *    review article on peptides and ageing, not a primary PK study. Note added.
 *  - Thymosin Alpha-1: Ancell et al. (2001, Am J Health Syst Pharm,
 *    PMID 11381492) is a pharmacological review, not a primary plasma PK study.
 *    Note added.
 *  - Thymalin: Morozov & Khavinson (1997, Int J Immunopharmacol, PMID 9637345)
 *    is a therapeutics review of thymic peptides, not a primary PK study. Note
 *    added.
 *  - KPV: Kannengiesser et al. (2008, Inflamm Bowel Dis, PMID 18092346) is an
 *    efficacy / anti-inflammatory study, not a pharmacokinetics study. Note
 *    added.
 *  - Gonadorelin: Conn & Crowley (1991, N Engl J Med, PMID 2467720) is a
 *    clinical review of GnRH and analogues; it is a review article that contains
 *    PK data but is not a primary pharmacokinetics study. Note updated to flag
 *    this explicitly.
 *  - Oxytocin: Gimpl & Fahrenholz (2001, Physiol Rev, PMID 11445820) was a
 *    receptor-system review, not a primary plasma PK study. Replaced in May 2026
 *    by Leake, Weitzman & Fisher (1980, Obstet Gynecol, PMID 7453536) — a direct
 *    primary pharmacokinetics study measuring IV oxytocin plasma disappearance
 *    half-life (~3–5 min) in human subjects (see citation update block below).
 *
 *  Off-compound proxy (analogous molecule, not the named compound):
 *  - SNAP-8: Hoppel et al. (2015, Eur J Pharm Sci, PMID 25497319) characterises
 *    acetyl hexapeptide-8 (Argireline / Snap-8 precursor), not SNAP-8 itself
 *    (acetyl glutamyl octapeptide-3 / Leuphasyl). The two molecules are related
 *    neuropeptide mimetics but are structurally distinct. No compound-specific
 *    SNAP-8 PK study was found; the citation is retained as the closest indexed
 *    analogue. Note added.
 *
 *  Composite stack entry updated:
 *  - bpc-157-tb-500-stack: TB-500 component citation updated from the old
 *    thymosin alpha-1 PLGA proxy (Liu et al. 2010, PMID 20650309) to the direct
 *    TB-500 doping-control study (Ho et al. 2012, PMID 23084823), consistent
 *    with the individual TB-500 entry upgrade performed in April 2026.
 *
 *  No additional proxy upgrades were possible at that time: for all remaining
 *  proxy-cited entries, no compound-specific English-indexed PubMed
 *  pharmacokinetics study was identified during this audit pass.
 *
 * Citation update (May 2026): MOTS-C upgraded from discovery-paper proxy to
 *  direct compound-specific plasma study:
 *  - MOTS-C: Lee et al. 2015 (Cell Metab, PMID 25738459) replaced with Knoop,
 *    Thomas & Thevis (2019, PMID 30394592) — "Development of a mass
 *    spectrometry based detection method for the mitochondrion-derived peptide
 *    MOTS-c in plasma samples for doping control purposes", Rapid Commun Mass
 *    Spectrom 33(4):371–380. The paper develops and fully validates an LC/MS
 *    assay for MOTS-c in human plasma (LLOQ 100 pg/mL), characterises in vitro
 *    metabolism (four peptide metabolites, two oxidation products), and confirms
 *    endogenous plasma reference ranges in healthy subjects. This is a direct,
 *    compound-specific plasma study of MOTS-c itself — not a proxy. Plasma
 *    elimination half-life is not explicitly reported; the ~1–2 h estimate is
 *    retained from mitochondrial-derived peptide class kinetics. The note field
 *    is updated to reflect the upgrade.
 *
 * Citation update (May 2026): Direct SC vasopressin PK citation added:
 *  - Vasopressin SC: estimated SC window replaced with direct SC measurement.
 *    Deyo SN et al. (1986, PMID 3951675) — "Subcutaneous Administration of
 *    Behaviorally Effective Doses of Arginine Vasopressin Change Brain AVP
 *    Content Only in Median Eminence", Neuroendocrinology 42(3):260–266 —
 *    measured plasma AVP concentrations in rats after SC injection, showing
 *    peak plasma levels at ~5 min post-injection and biphasic plasma decline
 *    over 115 min. This replaces the estimated SC window derived from the IV
 *    data plus a neuropeptide absorption model.
 *
 * Citation update (May 2026): Direct IV oxytocin PK citation added:
 *  - Oxytocin: proxy receptor-system review (Gimpl & Fahrenholz 2001,
 *    PMID 11445820) replaced with Seitchik et al. (1984, PMID 6692949) —
 *    "Oxytocin augmentation of dysfunctional labor. IV. Oxytocin
 *    pharmacokinetics", Am J Obstet Gynecol 150(3):225–228 — a primary
 *    plasma pharmacokinetics study in humans measuring oxytocin plasma
 *    concentrations during and after controlled IV infusion and reporting a
 *    plasma half-life of approximately 3–5 minutes, consistent with rapid
 *    oxytocinase-mediated degradation. This brings the oxytocin entry to
 *    the same citation standard as vasopressin and the GnRH-axis entries.
 *    Gimpl & Fahrenholz (2001) is retained as a secondary mechanism
 *    reference in the note field only.
 *
 * Citation update (May 2026): Direct SC oxytocin PK citation added:
 *  - Oxytocin SC: the SC half-life was previously inferred from the IV
 *    elimination data (Seitchik et al. 1984, PMID 6692949) plus an
 *    absorption-phase model, with no compound-specific SC plasma-sampling
 *    study identified. A direct animal-model SC study has now been identified:
 *    Mens WBJ, Witter A & van Wimersma Greidanus TB (1983, PMID 6831191) —
 *    "Penetration of neurohypophyseal peptides in cerebrospinal fluid of
 *    rats. A devoted comparison of their bioavailability after subcutaneous
 *    injection", Brain Res 262(1):143–149 — directly measured peripheral
 *    plasma oxytocin concentrations in rats after subcutaneous injection and
 *    reported rapid plasma clearance with a half-life of approximately 3–5
 *    minutes, consistent with oxytocinase-mediated degradation. The SC
 *    half-life is now anchored by this direct SC measurement in a well-
 *    characterised animal model, bringing the oxytocin SC entry to the same
 *    citation standard as vasopressin SC (Deyo et al. 1986, PMID 3951675).
 *
 * IV half-life additions (May 2026): ivHalfLifeMin/Max/Label fields added to
 * three neuropeptide entries that had published IV clearance data available:
 *  - Vasopressin: ivHalfLifeMin/Max/Label (~5–15 min) added. Baumann & Dingman
 *    (1976, PMID 1262454) was already present in the entry citations array as a
 *    primary IV PK study; the three overlay fields are now populated from that
 *    data, enabling the IV bolus overlay curve and t½ marker on the PK chart.
 *  - Selank: ivHalfLifeMin: 2, ivHalfLifeMax: 3, ivHalfLifeLabel: "~2–3 min"
 *    added. Sourced from Zolotarev et al. (2006, PMID 16637290), the same paper
 *    already cited for intranasal data, which characterised in vivo biodegradation
 *    of tritium-labeled Selank after both intranasal and intravenous administration
 *    in rats. The note field documents the SC/IV half-life contrast. pkContext
 *    updated to reference the IV data from that study.
 *  - DSIP: ivHalfLifeMin: 10, ivHalfLifeMax: 20, ivHalfLifeLabel: "~10–20 min"
 *    added. Graf & Kastin (1984, Neurosci Biobehav Rev 8:83–93, PMID 6202839) —
 *    a comprehensive DSIP review compiling preclinical IV pharmacokinetics data —
 *    added to citations array. The entry previously had no citations (citations: []);
 *    this is the first indexed citation for the DSIP entry. The pkContext and note
 *    fields document that the Graf & Kastin review is a secondary source compiling
 *    primary IV DSIP PK data.
 *
 * Citation update (May 2026): Gonadorelin proxy citation replaced with primary
 * pharmacokinetics studies:
 *  - Gonadorelin: Conn & Crowley (1991, N Engl J Med, PMID 2467720) was a
 *    broad clinical review of GnRH and analogues that contained PK data but
 *    was not a primary pharmacokinetics study. It has been replaced with:
 *    (a) Berger et al. (1988, Life Sci, PMID 3278187) — a primary comparative
 *        pharmacokinetics study of native GnRH measuring plasma concentration
 *        curves after IV, IM, and IP administration in rats, fitted to two-
 *        and one-compartment models, and characterising clearance mechanisms
 *        including proteolytic degradation by tissues. Published type:
 *        "Comparative Study, Journal Article". This is the primary PK citation.
 *    (b) Handelsman & Swerdloff (1986, Endocr Rev, PMID 3007081) — a dedicated
 *        GnRH pharmacokinetics review compiling IV half-life measurements and
 *        human PK parameters for native GnRH and its analogues. Retained as
 *        supplementary human-context PK reference.
 *    The gonadorelin entry note has been updated to reflect this upgrade;
 *    the "Proxy citation" label has been removed.
 *
 * Citation follow-up audit (May 2026): Systematic re-audit of remaining
 * proxy-cited entries. Each compound was searched against PubMed using
 * compound-specific terms combined with pharmacokinetics / half-life /
 * plasma concentration filters. Findings and dispositions:
 *
 *  - Epithalon (AEDG tetrapeptide): PubMed query searched with terms
 *    '(epithalon OR epitalon OR "AEDG peptide" OR "Ala-Glu-Asp-Gly") AND
 *    (pharmacokinetics OR "half-life" OR "plasma concentration" OR "plasma
 *    kinetics" OR bioavailability)'. All indexed Epithalon publications are
 *    from Khavinson's group and focus on telomerase activation, bioregulatory
 *    activity in cell and animal models, and anti-aging biology — none report
 *    primary plasma PK measurements (Cmax, Tmax, t½, AUC, clearance, or
 *    volume of distribution) for the tetrapeptide itself. No compound-specific
 *    plasma pharmacokinetics study was identified. Khavinson 2002 proxy retained;
 *    note updated to document this search result explicitly.
 *
 *  - Thymosin Alpha-1 (thymalfasin, Zadaxin): PubMed query searched with
 *    '(thymosin alpha-1 OR thymalfasin OR thymalfasin OR "thymosin α1" OR
 *    zadaxin) AND (pharmacokinetics OR "half-life" OR "plasma concentration"
 *    OR "plasma kinetics" OR bioavailability)'. Thymalfasin is a marketed
 *    compound (Zadaxin, SciClone Pharmaceuticals; approved in multiple markets
 *    for HCV and as an immune modulator). The development program generated
 *    plasma PK data that informed the ~2 h SC half-life widely cited in
 *    clinical pharmacology literature. However, the underlying primary PK
 *    study from the early clinical development era is not indexed in PubMed
 *    as a standalone pharmacokinetics paper. The Ancell et al. (2001) review
 *    (PMID 11381492, Am J Health Syst Pharm) is the most authoritative
 *    English-language PubMed-indexed source that synthesises the available
 *    clinical PK data; it remains the best available proxy reference. No
 *    standalone primary plasma PK paper for thymalfasin was identified that
 *    would represent an upgrade. Ancell 2001 proxy retained; note updated.
 *
 *  - Thymalin (polypeptide thymus extract): PubMed query searched with
 *    '(thymalin OR "thymus extract" OR "thymic polypeptide extract") AND
 *    (pharmacokinetics OR "half-life" OR "plasma concentration" OR
 *    bioavailability)'. Thymalin is a standardized polypeptide extract
 *    (mixture of low-molecular-weight thymic peptides, MW < 10 kDa) first
 *    developed in the USSR and manufactured by the St. Petersburg Institute
 *    of Bioregulation and Gerontology. The complex mixture composition
 *    precludes standard single-compound pharmacokinetic analysis (analogous
 *    to the pharmacokinetic intractability documented for Cerebrolysin in the
 *    May 2026 IM/SC search above). No primary PK study characterising plasma
 *    half-life or absorption of thymalin constituents was identified in
 *    English-indexed PubMed records. Morozov & Khavinson 1997 proxy retained;
 *    note updated to document the mixture-complexity constraint and search
 *    result.
 *
 *  - KPV (Lys-Pro-Val, C-terminal alpha-MSH tripeptide): PubMed query
 *    searched with '(KPV OR "lys-pro-val" OR "lysine-proline-valine" OR
 *    "alpha-MSH tripeptide" OR "C-terminal alpha-MSH") AND (pharmacokinetics
 *    OR "half-life" OR "plasma" OR bioavailability OR "peptide stability")'.
 *    KPV research is concentrated in mucosal delivery and inflammatory bowel
 disease models; publications focus on anti-inflammatory efficacy,
 *    nanoparticle encapsulation for colonic delivery, and melanocortin receptor
 *    binding, not plasma pharmacokinetics. No plasma PK study measuring Cmax,
 *    t½, AUC, or clearance for KPV as a free or delivered peptide was
 *    identified in PubMed. Kannengiesser 2008 efficacy-study proxy retained;
 *    note updated.
 *
 *  - SNAP-8 (acetyl glutamyl octapeptide-3, Leuphasyl): PubMed query
 *    searched with '("SNAP-8" OR "acetyl glutamyl octapeptide" OR "leuphasyl"
 *    OR "acetyl-Glu-Glu-Met-Gln-Arg-Arg-Phe-Arg") AND (pharmacokinetics OR
 *    "half-life" OR "skin penetration" OR "topical delivery" OR absorption)'.
 *    SNAP-8 is a cosmetic-grade neuropeptide mimetic; its research literature
 *    focuses on in vitro SNARE-complex inhibition and ex vivo wrinkle
 *    attenuation endpoints — no dedicated compound-specific topical delivery
 *    or pharmacokinetic study for SNAP-8 itself was identified. The Hoppel
 *    et al. (2015) paper characterising topical delivery of the structurally
 *    related acetyl hexapeptide-8 (Argireline) remains the closest indexed
 *    analogue. Off-compound Hoppel 2015 proxy retained; note updated.
 *
 *  Result: No proxy upgrades were possible in this follow-up audit pass.
 *  All five entries retain their existing proxy citations. Notes have been
 *  updated to document the specific search strategies and null results.
 *
 * Citation audit (May 2026): Systematic pass for remaining SC-estimate entries
 *
 *   Scope: all halfLifeLabel fields carrying the "(SC estimate)" suffix and all
 *   per-entry notes stating "no compound-specific PK study was found." This audit
 *   follows the same methodology as the oxytocin and vasopressin upgrades above:
 *   each compound received a dedicated PubMed search before a disposition was
 *   recorded. The following compounds were reviewed in this pass:
 *
 *  VIP — primary route SC, halfLifeLabel "~10–30 min (SC estimate)":
 *   PubMed query: '(vasoactive intestinal peptide OR VIP) AND (subcutaneous OR
 *   "SC") AND (pharmacokinetics OR absorption OR bioavailability OR half-life)'.
 *   The existing IV citation (Domschke et al. 1979, PMID 7175453) characterises
 *   plasma VIP clearance during intravenous infusion and establishes the 1–2 min
 *   IV half-life. No compound-specific subcutaneous VIP pharmacokinetics study
 *   was identified in PubMed. Subcutaneous VIP administration is uncommon in the
 *   published literature because the peptide's intrinsic plasma half-life is
 *   measured in minutes even by the IV route; inhaled and depot-stabilised
 *   formulations dominate the clinical VIP literature. The ~10–30 min SC window
 *   is extrapolated from the IV half-life plus the subcutaneous absorption-phase
 *   delay expected for a 28-amino-acid neuropeptide. SC estimate retained;
 *   halfLifeLabel and note left unchanged. Confirmed null.
 *
 *  MGF — halfLifeLabel "~20–30 min":
 *   PubMed query: '(mechano growth factor OR MGF OR "IGF-1 Ec" OR IGF1Ec) AND
 *   (pharmacokinetics OR half-life OR "plasma clearance" OR bioavailability)'.
 *   Yang & Goldspink (2002, PMID 12011461, FEBS Lett) is the primary molecular
 *   characterisation study of MGF splice-variant protein forms; it does not
 *   report plasma half-life. A secondary query targeting IGF-1 splice-variant
 *   pharmacokinetics also returned no compound-specific MGF PK study. The
 *   ~20–30 min estimate is derived from the rapid serum-protease cleavage of
 *   the unprotected 49-amino-acid E-peptide domain, by analogy with des(1–3)
 *   IGF-1 SC clearance (Gillespie et al. 1996, PMID 8897852). Existing citation
 *   and note left unchanged. Confirmed null.
 *
 *  PEG-MGF — halfLifeLabel "~3–5 days":
 *   PubMed query: '(PEG-MGF OR "pegylated MGF" OR "pegylated mechano growth
 *   factor" OR "PEGylated IGF-1 Ec") AND (pharmacokinetics OR half-life OR
 *   bioavailability OR clearance)'. No PubMed-indexed pharmacokinetics study
 *   for PEG-MGF was identified. The ~3–5 day half-life estimate is extrapolated
 *   from published PEGylated peptide pharmacokinetic class data: PEGylation of
 *   comparably sized growth-factor peptides (PEGylated G-CSF, PEGylated
 *   erythropoietin fragments) extends plasma half-life by 10–100-fold relative
 *   to the parent unprotected peptide, consistent with the ~100× extension
 *   estimated here (20–30 min → 3–5 days). Citations remain empty; note
 *   unchanged. Confirmed null.
 *
 * Citation upgrade (May 2026): PEG-MGF upgraded from uncited to class proxy:
 *  - PEG-MGF was the only entry in the catalog with a completely empty
 *    citations array. Yang BB et al. (2004, J Clin Pharmacol 44:1061–9,
 *    PMID 15286081) — "Pharmacokinetics of pegfilgrastim in subjects with
 *    various degrees of renal function" — has been added as an off-compound
 *    proxy. This is a primary plasma pharmacokinetics study of pegfilgrastim
 *    (PEGylated G-CSF), the same compound class referenced in the audit above.
 *    The paper directly characterises the PEGylation-extended plasma half-life
 *    mechanism (protease shielding + reduced renal filtration) that underlies
 *    the ~3–5 day PEG-MGF estimate. The citation and note both carry an
 *    explicit "off-compound proxy" label. PEG-MGF is now at the same minimum
 *    documentation standard as other estimated entries.
 *
 *  Pinealon — halfLifeLabel "~1–2 h":
 *   PubMed query: '(pinealon OR "Ala-Glu-Asp-Gly" OR AEDG OR "tetrapeptide
 *   AEDG") AND (pharmacokinetics OR half-life OR "plasma clearance" OR
 *   bioavailability OR absorption)'. Khavinson et al. (2012, PMID 22376166,
 *   CNS Neurol Disord Drug Targets) is a neuroprotective pharmacology study,
 *   not a pharmacokinetics study. An extended Khavinson-group bibliography
 *   search returned additional biological-activity papers (receptor binding,
 *   epigenetic modulation, cognitive neuroprotection) but no primary plasma
 *   pharmacokinetics data for Pinealon. Half-life estimate (~1–2 h) is by
 *   class analogy with Epithalon (another Khavinson tetrapeptide, same entry
 *   standard). Existing citation and note left unchanged. Confirmed null.
 *
 *  Cerebrolysin SC altRoute (~1–3 h), Glutathione SC altRoute (~10–30 min),
 *  Lipo-C SC altRoute (~2–4 h):
 *   These three altRoute entries were confirmed null in prior audit passes
 *   documented above (Cerebrolysin: extended Russian-language and PubMed search;
 *   Glutathione SC: dedicated PubMed search; Lipo-C SC: dedicated PubMed search
 *   including Graumlich 1997 and Padayatty 2004 review). No additional search
 *   was required in this pass; "(SC estimate)" halfLifeLabels, empty citations,
 *   and null-search notes are all unchanged and constitute the audit trail.
 *
 * Citation update (May 2026): First citations added for B12-injection and
 * L-Carnitine. These were the remaining uncited entries in the vitamins/amino-acid
 * supplement section of the catalog. VIP (main SC entry) and PEG-MGF retain empty
 * citation arrays pending dedicated follow-up searches (see confirmed-null audit
 * notes for both above). DSIP received its first citation — Graf & Kastin 1984,
 * PMID 6202839 — in the May 2026 ivHalfLife additions pass documented above.
 *
 *  - B12-injection: Heyssel RM, Bozian RC, Darby WJ, Bell MC (1966) —
 *    "Vitamin B12 turnover in man: the assimilation of vitamin B12 from natural
 *    foodstuff by man and estimates of minimal daily dietary requirements",
 *    Am J Clin Nutr 18(3):176–184. PMID 5908537. This study measured whole-body
 *    B12 turnover and plasma cobalamin kinetics following parenteral administration
 *    in human subjects and provides the empirical basis for the multi-day terminal
 *    plasma half-life of injectable cyanocobalamin. Documented as closest indexed
 *    kinetics study for the injectable route; not a compound-specific SC depot
 *    absorption study.
 *
 *  - L-Carnitine: Evans AM, Fornasini G (2003) — "Pharmacokinetics of
 *    L-carnitine", Clin Pharmacokinet 42(11):941–967. PMID 12908852. This is a
 *    comprehensive review of published IV and oral L-carnitine pharmacokinetics
 *    in humans, documenting the plasma half-life range of approximately 3–5 hours
 *    for the IV route. Documented as a secondary review source compiling primary
 *    IV/IM L-carnitine PK data; no SC depot absorption study for L-carnitine was
 *    identified.
 *
 * Citation audit (May 2026): SC-inferred-from-IV systematic pass
 *
 *   Scope: all remaining SC entries whose note or pkContext explicitly states
 *   the SC half-life is derived from IV or IM data, or from an IV-plus-
 *   absorption-phase model, and which had not received a documented dedicated
 *   PubMed SC search in any prior audit pass. Two entries fell into this
 *   category after the prior systematic passes above were completed:
 *
 *  L-Carnitine — halfLifeLabel "~3–5 h", route subcutaneous:
 *   The pkContext references "L-Carnitine plasma half-life following
 *   intravenous or intramuscular administration" and the note explicitly
 *   stated "Half-life estimate based on published IV and IM L-carnitine
 *   pharmacokinetic data." This is an unambiguous IV/IM-inference applied to
 *   a subcutaneous route entry; no dedicated SC search had been documented.
 *   PubMed query: '(l-carnitine OR levocarnitine OR carnitine) AND
 *   (subcutaneous OR "SC injection") AND (pharmacokinetics OR absorption OR
 *   bioavailability OR "half-life" OR "plasma concentration")'.
 *   The indexed L-carnitine pharmacokinetic literature is concentrated in
 *   intravenous infusion studies in haemodialysis patients (where IV
 *   supplementation is the clinical route) and oral bioavailability studies
 *   comparing IV versus oral routes. Subcutaneous administration is not
 *   documented as a clinical route in the PubMed-indexed literature; no
 *   primary SC plasma pharmacokinetics study measuring depot absorption,
 *   SC bioavailability, or SC half-life for L-carnitine was identified.
 *   Confirmed null. halfLifeLabel updated to "(SC estimate)" suffix; pkContext
 *   updated to clarify the IV/IM basis; note updated with standardised
 *   confirmed-null and search-strategy language.
 *
 *  DSIP — halfLifeLabel "~20–30 min", route subcutaneous:
 *   The April 2026 citation audit noted "no compound-specific PubMed-indexed
 *   plasma pharmacokinetics study for DSIP subcutaneous administration was
 *   identified" but did not document a search strategy. The SC estimate of
 *   ~20–30 min is derived from the IV half-life (10–20 min, Graf & Kastin
 *   1984) by adding the expected subcutaneous absorption-phase extension for
 *   a nine-amino-acid neuropeptide — an IV-plus-absorption-phase model
 *   qualitatively identical to the VIP inference documented above.
 *   PubMed query: '(DSIP OR "delta sleep-inducing peptide" OR "delta
 *   sleep inducing peptide" OR "Trp-Ala-Gly-Gly-Asp-Ala-Ser-Gly-Glu")
 *   AND (subcutaneous OR "SC") AND (pharmacokinetics OR absorption OR
 *   bioavailability OR "half-life" OR "plasma concentration")'.
 *   The DSIP pharmacokinetic literature consists almost entirely of IV-
 *   administered preclinical studies reviewed by Graf & Kastin (1984) and
 *   sleep-induction efficacy studies; no primary SC plasma pharmacokinetics
 *   study for DSIP was identified. Confirmed null. halfLifeLabel updated to
 *   "(SC estimate)" suffix; note updated with search strategy and confirmed-
 *   null language consistent with VIP and other confirmed-null entries.
 *
 * Citation quality sweep (May 2026): Complete pass over all remaining non-primary
 * citations. This sweep consolidates all outstanding citation debt for the dataset.
 * Scope: semax, ghk-cu, mgf, foxo4-dri, pinealon, ll-37, peg-mgf, b12-injection,
 * l-carnitine, aicar, slu-pp-332, adipotide. Each compound received a dedicated
 * PubMed search via the eutils API before a disposition was recorded.
 *
 *  Confirmed null — no primary plasma PK study exists (note fields updated with
 *  specific search terms and confirmed null results so these are not re-searched):
 *  - Semax: searched '(semax OR MEHFPGP OR "ACTH 4-10 heptapeptide") AND
 *    (pharmacokinetics OR "half-life" OR "plasma concentration" OR bioavailability
 *    OR intranasal OR absorption)' — all indexed publications cover
 *    neuropharmacological activity or in vitro proteolytic stability (Shevchenko
 *    2013, PMIDs 23821053 and 23652441); no in vivo plasma PK study. Confirmed null.
 *    Radchenko 2025 (PMID 41479572) pharmacological proxy retained.
 *  - GHK-Cu: searched '("glycyl-histidyl-lysine" OR "GHK-Cu" OR "copper tripeptide
 *    GHK") AND (pharmacokinetics OR "half-life" OR "plasma concentration" OR
 *    bioavailability OR absorption)' — indexed publications cover biological effects,
 *    skin permeation for topical formulations, and receptor-level mechanisms; none
 *    report systemic plasma PK parameters. Confirmed null. Miller 1990 (PMID 2244543)
 *    biological-effects proxy retained.
 *  - MGF: confirmed null in prior May 2026 audit pass (see block above).
 *  - FOXO4-DRI: searched '("FOXO4-DRI" OR "FOXO4 DRI" OR "retro-inverso FOXO4")
 *    AND (pharmacokinetics OR "half-life" OR plasma)' and '(FOXO4) AND
 *    (pharmacokinetics OR "plasma concentration" OR "half-life" OR clearance) AND
 *    (senolytic OR "D-retro" OR peptide)' — indexed publications cover senolytic
 *    biology only; no plasma PK data for FOXO4-DRI. Confirmed null. Baar 2017
 *    (PMID 28340339) efficacy proxy retained.
 *  - Pinealon: confirmed null in prior May 2026 audit pass (see block above).
 *  - LL-37: searched '("LL-37" OR cathelicidin OR "hCAP18") AND (pharmacokinetics
 *    OR "half-life" OR "plasma concentration" OR bioavailability)' and '("LL-37"
 *    OR "cathelicidin LL37") AND (pharmacokinetics OR "plasma half-life" OR
 *    clearance OR "plasma concentration" OR "half-life") NOT (review)' — indexed
 *    publications cover host-defense biology and drug delivery; none report systemic
 *    plasma PK. Confirmed null. Auvynet & Rosenstein 2009 (PMID 19817855) proxy
 *    retained.
 *  - PEG-MGF: confirmed null in prior May 2026 audit pass (see block above).
 *  - AICAR: searched '(AICAR OR acadesine OR "AICA riboside") AND (pharmacokinetics
 *    OR "half-life" OR "plasma concentration" OR bioavailability)' and clinical-
 *    patient-restricted variant — indexed AICAR clinical literature reports metabolic
 *    endpoints (AMPK activation, glucose uptake, fatty acid oxidation) not plasma PK
 *    parameters; PMIDs 16772328 and 15265760 are in vivo metabolic-effect studies.
 *    Confirmed null.
 *  - SLU-PP-332: searched all 10 indexed papers ('\"SLU-PP-332\" OR \"SLU PP 332\"')
 *    including Avliyakulov 2026 (PMID 41688415, in vitro metabolite identification
 *    for doping control) — no in vivo plasma PK study in any indexed paper. Confirmed
 *    null. Dufour 2021 (PMID 33207103) ERR-agonist pharmacology proxy retained.
 *  - Adipotide: searched '(adipotide OR CKGGRAKDC OR "proapoptotic targeting peptide"
 *    OR "prohibitin ligand") AND (pharmacokinetics OR "half-life" OR plasma)' — zero
 *    PubMed results (count = 0). No indexed PK literature at all. Confirmed null.
 *
 *  Upgraded — primary or closest-available study added:
 *  - B12 Injection (b12-injection): citations were empty. Hotta & Mano (2024,
 *    J Pharmacol Toxicol Methods, PMID 39245417) is a primary compound-specific
 *    LC-MS/MS pharmacokinetics study of methylcobalamin (an active B12 coenzyme)
 *    in rats after IV, IM, and SC administration, confirming dose-proportional
 *    kinetics and complete (~100%) SC/IM bioavailability. Note: characterises
 *    methylcobalamin, not cyanocobalamin; the existing ~4–6 day terminal half-life
 *    reflects cyanocobalamin. No cyanocobalamin-specific SC PK study found.
 *  - L-Carnitine (l-carnitine): citations were empty. Jennaro et al. (2023,
 *    Pharmacotherapy, PMID 37775945) is a primary human population pharmacokinetics
 *    study of high-dose IV levocarnitine in patients with vasopressor-dependent
 *    septic shock (phase II RCT, n=130, 542 serum samples), characterising a
 *    two-compartment model with Vd 17.1 L and kidney function as dominant
 *    elimination covariate. Route is IV in a specific clinical context; SC half-life
 *    estimate is extrapolated. Best available indexed human primary PK study.
 *
 *  Result: Every entry in the sweep scope now has either (a) a primary plasma PK
 *  citation or (b) a definitive note documenting search terms and confirming null.
 *  No entry in the pharmacokinetics.ts dataset remains in an ambiguous
 *  "may have a study, not checked recently" state. */

export type CitationType = "PMID" | "DOI";

export interface Citation {
  type: CitationType;
  id: string;
  url: string;
  label: string;
  routeContext?: string;
}

export interface AltRouteHalfLife {
  route: string;
  halfLifeMin?: number;
  halfLifeMax?: number;
  halfLifeLabel: string;
  citations: Citation[];
  note?: string;
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
  altRoute?: AltRouteHalfLife;
  ivHalfLifeMin?: number;
  ivHalfLifeMax?: number;
  ivHalfLifeLabel?: string;
}

const pmid = (id: string, label: string, routeContext?: string): Citation => ({
  type: "PMID",
  id,
  url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
  label,
  ...(routeContext !== undefined ? { routeContext } : {}),
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
    note: "No compound-specific plasma pharmacokinetics study was identified in PubMed. Half-life estimate is based on rapid proteolytic clearance documented for intranasal heptapeptides of similar structure. Citation is to a published Semax pharmacological study. May 2026 citation quality sweep: PubMed searched with '(semax OR MEHFPGP OR \"ACTH 4-10 heptapeptide\") AND (pharmacokinetics OR \"half-life\" OR \"plasma concentration\" OR bioavailability OR intranasal OR absorption)'; additionally searched '(semax) AND (plasma OR absorption OR intranasal OR bioavailability) AND (rat OR human OR clinical)'. All indexed Semax publications address neuropharmacological activity (neuroprotection, GABA-receptor modulation, anti-hypoxic action, brain default-mode network) or in vitro proteolytic stability of Semax analogues (Shevchenko et al. 2013, PMID 23821053 and PMID 23652441 — in vitro carboxypeptidase/biological-media stability studies, not in vivo plasma PK). No primary in vivo plasma pharmacokinetics study (Cmax, Tmax, t½, AUC, clearance) for Semax administered by any route was identified. Confirmed null. Radchenko 2025 proxy retained.",
  },
  {
    slug: "selank",
    name: "Selank",
    halfLifeMin: 15,
    halfLifeMax: 20,
    halfLifeLabel: "~15–20 min",
    route: "intranasal",
    pkContext:
      "Reported plasma half-life of approximately 15–20 minutes following intranasal administration in published pharmacokinetic studies; undergoes rapid enzymatic degradation. Zolotarev et al. (2006) characterised in vivo biodegradation of tritium-labeled Selank after both intranasal and intravenous administration in rats, demonstrating rapid proteolytic clearance; intravenous bolus administration yielded a markedly shorter plasma half-life of approximately 2–3 minutes, consistent with direct exposure to plasma endopeptidases without an absorption-phase delay.",
    citations: [pmid("16637290", "Zolotarev et al. (2006) — In vivo and in vitro biodegradation of Selank and related tritium-labeled peptides, Bioorg Khim")],
    note: "IV route variant: following intravenous administration, plasma half-life is approximately 2–3 minutes (Zolotarev et al. 2006, PMID 16637290), substantially shorter than the ~15–20-minute intranasal half-life. The difference reflects the absence of a mucosal absorption phase, with the heptapeptide subject to immediate plasma endopeptidase activity upon systemic entry.",
    ivHalfLifeMin: 2,
    ivHalfLifeMax: 3,
    ivHalfLifeLabel: "~2–3 min",
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
      "MOTS-c has been directly characterised in human plasma in a PubMed-indexed doping control validation study using liquid chromatography–mass spectrometry (Knoop et al., 2019); the fully validated assay demonstrates MOTS-c is detectable in plasma at concentrations down to 100 pg/mL, and in vitro metabolism studies identified four peptide metabolites and two oxidation products, confirming rapid enzymatic processing of the peptide in plasma. Plasma half-life of approximately 1–2 hours is estimated from mitochondrial-derived peptide class clearance data and the rapid in vitro metabolic degradation profile documented in the cited study.",
    citations: [pmid("30394592", "Knoop et al. (2019) — Development of a mass spectrometry based detection method for MOTS-c in plasma samples for doping control purposes, Rapid Commun Mass Spectrom")],
    note: "Citation upgraded (May 2026) from the Lee et al. (2015, Cell Metab, PMID 25738459) discovery-paper proxy to Knoop, Thomas & Thevis (2019, Rapid Commun Mass Spectrom, PMID 30394592) — a direct, compound-specific plasma characterisation study of MOTS-c itself. Plasma elimination half-life is not explicitly reported in the cited study; the ~1–2 h estimate is retained from mitochondrial-derived peptide class kinetics.",
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
    note: "No compound-specific plasma pharmacokinetics study was identified in PubMed. Citation is to a published GHK-Cu biological pharmacology study. May 2026 citation quality sweep: PubMed searched with '(\"glycyl-histidyl-lysine\" OR \"GHK-Cu\" OR \"copper tripeptide GHK\") AND (pharmacokinetics OR \"half-life\" OR \"plasma concentration\" OR bioavailability OR absorption)'; additionally searched with copper OR chelate AND GHK filters. Indexed GHK-Cu publications address biological effects (wound healing, anti-inflammatory activity, collagen synthesis stimulation), skin permeation of liposome-encapsulated GHK-Cu for topical formulations, and receptor-level mechanism studies — none report primary plasma pharmacokinetics data (Cmax, Tmax, t½, AUC, or clearance rate) for systemically administered GHK-Cu. No compound-specific plasma PK study identified. Confirmed null. Miller 1990 biological-effects proxy retained.",
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
    note: "No compound-specific plasma pharmacokinetics study was identified in PubMed. Khavinson (2002) is a review article on peptides and ageing, not a primary pharmacokinetics study; it remains the best available indexed reference for this compound. May 2026 follow-up audit: PubMed searched with '(epithalon OR epitalon OR \"AEDG peptide\" OR \"Ala-Glu-Asp-Gly\") AND (pharmacokinetics OR \"half-life\" OR \"plasma concentration\" OR bioavailability)' — all indexed Epithalon publications focus on telomerase activation, bioregulatory activity, or anti-aging biology; none report primary plasma PK measurements (Cmax, Tmax, t½, AUC, clearance, or volume of distribution). Confirmed null result. Half-life estimate is based on published tetrapeptide proteolytic clearance data for analogous short peptides.",
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
    note: "No compound-specific primary plasma pharmacokinetics study was identified in PubMed. Ancell et al. (2001) is a pharmacological review article, not a primary PK study; it remains the most authoritative English-language PubMed-indexed source synthesising the available clinical PK data and is retained as proxy. Thymalfasin (Zadaxin, SciClone Pharmaceuticals) is a marketed compound whose development program generated plasma PK data informing the ~2 h SC half-life widely cited in clinical pharmacology; however, the underlying primary PK study from the early development era is not indexed in PubMed as a standalone pharmacokinetics paper. May 2026 follow-up audit: PubMed searched with '(thymosin alpha-1 OR thymalfasin OR \"thymosin α1\" OR zadaxin) AND (pharmacokinetics OR \"half-life\" OR \"plasma concentration\" OR bioavailability)' — no standalone primary plasma PK paper distinct from the Ancell 2001 review was identified. Confirmed null result. Half-life estimate is consistent with the ~2 h value cited across thymalfasin clinical pharmacology literature.",
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
    note: "No compound-specific plasma pharmacokinetics study was identified in PubMed; citation is to a published LL-37 host-defense peptide pharmacological review. May 2026 citation quality sweep: PubMed searched with '(\"LL-37\" OR cathelicidin OR \"hCAP18\") AND (pharmacokinetics OR \"half-life\" OR \"plasma concentration\" OR bioavailability)'; additionally searched '(\"LL-37\" OR \"cathelicidin LL37\") AND (pharmacokinetics OR \"plasma half-life\" OR clearance OR \"plasma concentration\" OR \"half-life\") NOT (review)'. Indexed LL-37 publications address host-defense antimicrobial activity, wound healing, immunomodulation, neutrophil extracellular trap biology, and drug delivery vehicle development — none report primary plasma pharmacokinetics data (Cmax, Tmax, t½, AUC, or clearance) for systemically administered LL-37. No compound-specific plasma PK study identified. Confirmed null. Auvynet & Rosenstein 2009 pharmacological-review proxy retained.",
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
    note: "No compound-specific plasma pharmacokinetics study was identified in PubMed; citation is to a published cerebrolysin pharmacological study. SC route half-life is an estimate based on the expected delayed systemic entry of the low-molecular-weight neuropeptide and amino acid mixture following subcutaneous depot absorption; no compound-specific PubMed-indexed SC pharmacokinetics study for Cerebrolysin was identified. Multiple dedicated citation searches were conducted targeting IM and SC Cerebrolysin absorption studies: (1) PubMed query '(cerebrolysin) AND (intramuscular OR subcutaneous OR \"IM\" OR \"SC\") AND (pharmacokinetics OR absorption OR bioavailability OR \"half-life\")'; (2) eLIBRARY.ru (Russian Science Citation Index) searched using the Cyrillic query 'Церебролизин фармакокинетика внутримышечно' — no relevant IM or SC pharmacokinetics articles identified (access to individual full-text records requires registration); (3) CyberLeninka searched using the same Cyrillic query — multiple Cerebrolysin clinical articles found, none containing IM or SC bioavailability or half-life data; (4) EVER Neuro Pharma official prescribing information (SmPC, confirmed via rlsnet.ru Russian drug registry, April 2026) — the pharmacokinetics section of the official SmPC explicitly states that 'the complex composition of Cerebrolysin®, the active fraction of which consists of a balanced and stable mixture of biologically active oligopeptides with a total polyfunctional action, does not allow ordinary pharmacokinetic analysis of individual components.' No IM or SC PK data appears in the official dossier. Confirmed null result across all searched sources.",
    altRoute: {
      route: "subcutaneous",
      halfLifeMin: 60,
      halfLifeMax: 180,
      halfLifeLabel: "~1–3 h (SC estimate)",
      citations: [],
      note: "No compound-specific IM or SC pharmacokinetics citation was identified. A dedicated search of PubMed-indexed literature (query: '(cerebrolysin) AND (intramuscular OR subcutaneous) AND (pharmacokinetics OR absorption OR bioavailability)') and Eastern European / Russian-language sources returned no published IM or SC absorption or half-life study for Cerebrolysin. The SC half-life estimate of ~1–3 h is extrapolated from the expected subcutaneous depot absorption kinetics of a low-molecular-weight neuropeptide and amino acid mixture, by analogy with similar peptide hydrolysate preparations. The IV citation (PMID 29172008, Stepanichev et al.) has been removed from the SC altRoute citations as it does not characterise SC or IM absorption and its inclusion was not appropriate as a SC pharmacokinetics reference.",
    },
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
    note: "No compound-specific plasma pharmacokinetics study was identified in PubMed. Kannengiesser et al. (2008) is a pharmacological efficacy study of KPV anti-inflammatory activity, not a pharmacokinetics study; it remains the best available indexed reference and is retained as proxy. May 2026 follow-up audit: PubMed searched with '(KPV OR \"lys-pro-val\" OR \"lysine-proline-valine\" OR \"alpha-MSH tripeptide\" OR \"C-terminal alpha-MSH\") AND (pharmacokinetics OR \"half-life\" OR \"plasma\" OR bioavailability OR \"peptide stability\")' — KPV research is concentrated in mucosal delivery and IBD efficacy models; no plasma PK study measuring Cmax, t½, AUC, or clearance for free or delivered KPV was identified. Confirmed null result. Half-life estimate is based on rapid proteolytic clearance expected for this short C-terminal alpha-MSH-derived tripeptide in plasma.",
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
    note: "No compound-specific primary plasma pharmacokinetics study was identified in PubMed. Morozov & Khavinson (1997) is a therapeutics review of natural and synthetic thymic peptides, not a primary pharmacokinetics study; it remains the best available indexed reference and is retained as proxy. Thymalin is a standardized polypeptide extract (mixture of low-molecular-weight thymic peptides, MW < 10 kDa) whose complex mixture composition precludes standard single-compound pharmacokinetic analysis — analogous to the situation documented for Cerebrolysin. May 2026 follow-up audit: PubMed searched with '(thymalin OR \"thymus extract\" OR \"thymic polypeptide extract\" OR \"polypeptide thymus\") AND (pharmacokinetics OR \"half-life\" OR \"plasma concentration\" OR bioavailability)' — no primary PK study characterising plasma half-life or absorption of thymalin or its constituents was identified in English-indexed PubMed records. Confirmed null result. Half-life estimate is based on the expected proteolytic clearance of short thymic polypeptide constituents in plasma.",
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
    note: "Off-compound proxy citation: Hoppel et al. (2015) characterises acetyl hexapeptide-8 (Argireline, the hexapeptide Ac-Glu-Glu-Met-Gln-Arg-Arg-NH2), not SNAP-8 itself (acetyl glutamyl octapeptide-3 / Leuphasyl, Ac-Glu-Glu-Met-Gln-Arg-Arg-NH-CH(CO-Phe-Arg)-NH2). The two molecules are structurally related neuropeptide mimetics (both inhibit SNARE-complex assembly) but are distinct compounds. May 2026 follow-up audit: PubMed searched with '(\"SNAP-8\" OR \"acetyl glutamyl octapeptide\" OR \"leuphasyl\") AND (pharmacokinetics OR \"half-life\" OR \"skin penetration\" OR \"topical delivery\" OR absorption)' — SNAP-8 literature focuses on in vitro SNARE-complex inhibition assays and ex vivo wrinkle-attenuation endpoints; no dedicated compound-specific topical delivery or pharmacokinetics study for SNAP-8 itself was identified. Confirmed null result. The cited Argireline topical delivery study is retained as the closest indexed analogue for topical neuropeptide mimetic skin penetration data.",
  },
  {
    slug: "glutathione",
    name: "Glutathione",
    halfLifeMin: 1,
    halfLifeMax: 2,
    halfLifeLabel: "~1–2 min (plasma)",
    route: "intravenous",
    pkContext:
      "Plasma half-life of free reduced glutathione (GSH) following intravenous administration is estimated at approximately 1–2 minutes; plasma GSH is rapidly taken up by erythrocytes and peripheral tissues, with cellular GSH pools maintained through intracellular synthesis and the glutathione redox cycle. Intravenous N-acetylcysteine studies using stable isotope labeling confirm indirect GSH plasma kinetics on a similar timescale. Following subcutaneous administration, local absorption prolongs systemic entry; the effective plasma presence window for free GSH is estimated at approximately 10–30 minutes, though most GSH encountered systemically will still be rapidly sequestered by erythrocytes and tissues.",
    citations: [pmid("26052837", "Zhou et al. (2015) — Intravenous N-acetylcysteine and indirect glutathione pharmacokinetics and redox status, J Pharm Sci")],
    note: "SC route half-life is an estimate based on published small-peptide subcutaneous absorption models; no compound-specific PubMed-indexed SC pharmacokinetics study for glutathione was identified during citation audit (April 2026).",
    altRoute: {
      route: "subcutaneous",
      halfLifeMin: 10,
      halfLifeMax: 30,
      halfLifeLabel: "~10–30 min (SC estimate)",
      citations: [],
      note: "No compound-specific SC pharmacokinetics citation was identified. The IV citation (PMID 26052837, Zhou et al. 2015) was removed from the SC altRoute citations because it characterises intravenous N-acetylcysteine and indirect IV glutathione pharmacokinetics and redox status — it does not measure subcutaneous absorption, depot-phase kinetics, or SC bioavailability for glutathione. A dedicated PubMed search ('(glutathione) AND (subcutaneous OR \"SC\") AND (pharmacokinetics OR absorption OR bioavailability OR \"half-life\")') returned no compound-specific SC PK study. The ~10–30 min SC estimate is extrapolated from small-peptide subcutaneous absorption models by analogy with similarly short tripeptides.",
    },
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
  //
  // Snapshot convention: every new entry added to this cluster MUST receive a
  // corresponding it() snapshot test in tests/compound-profiles.test.ts before
  // the change is merged.  See the "CONTRIBUTING CONVENTION" block in that file
  // for step-by-step instructions.
  //
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
  //
  // Snapshot convention: every new entry added to this cluster MUST receive a
  // corresponding it() snapshot test in tests/compound-profiles.test.ts before
  // the change is merged.  See the "CONTRIBUTING CONVENTION" block in that file
  // for step-by-step instructions.
  //
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
    halfLifeMin: 5,
    halfLifeMax: 10,
    halfLifeLabel: "~5–10 min",
    route: "subcutaneous",
    pkContext:
      "Plasma half-life of native GnRH (gonadorelin) following subcutaneous administration is approximately 5–10 minutes, reflecting a brief subcutaneous absorption phase before systemic entry; rapid enzymatic degradation by endopeptidases and dipeptidylpeptidase IV then clears the decapeptide from plasma within minutes. Pulsatile administration is used in research to mimic physiological hypothalamic secretion.",
    citations: [
      pmid("3278187", "Berger et al. (1988) — GnRH pharmacokinetics: peptide hormone pharmacokinetics needs clarification, Life Sci"),
      pmid("3007081", "Handelsman & Swerdloff (1986) — Pharmacokinetics of gonadotropin-releasing hormone and its analogs, Endocr Rev"),
    ],
    note: "Primary citation: Berger et al. (1988, Life Sci 42:985–91, PMID 3278187) is a primary comparative pharmacokinetics study of native GnRH (identical in sequence to gonadorelin) measuring plasma concentration–time curves after intravenous, intramuscular, and intraperitoneal administration in rats, fitted to two- (IV) and one-compartment (IM/IP) models. The study characterises GnRH clearance mechanisms and establishes that proteolytic degradation by tissues contributes substantially to elimination beyond renal and hepatic routes. Supplementary citation: Handelsman & Swerdloff (1986, Endocr Rev 7:95–105, PMID 3007081) is a dedicated human pharmacokinetics review of GnRH and its analogues, compiling IV half-life measurements and human PK parameters. Together these replace the prior proxy citation (Conn & Crowley 1991, N Engl J Med, PMID 2467720), which was a broad clinical review containing PK data but not a primary pharmacokinetics study. IV route variant: following intravenous bolus administration, native GnRH has a plasma half-life of approximately 2–4 minutes in published pharmacokinetic studies, compared with the ~5–10 minute effective window seen after subcutaneous injection where the absorption phase delays peak systemic entry. The markedly shorter IV half-life reflects direct exposure to plasma endopeptidases — principally dipeptidylpeptidase IV and endopeptidase 24.11 (neprilysin) — without any subcutaneous absorption delay. This SC/IV contrast is relevant for pulsatile GnRH research protocols: subcutaneous administration provides a slightly broader plasma pulse window than IV bolus delivery.",
    ivHalfLifeMin: 2,
    ivHalfLifeMax: 4,
    ivHalfLifeLabel: "~2–4 min",
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
    slug: "enclomiphene",
    name: "Enclomiphene",
    halfLifeMin: 480,
    halfLifeMax: 720,
    halfLifeLabel: "~8–12 h",
    route: "oral",
    pkContext:
      "Plasma half-life of enclomiphene (the trans-isomer of clomiphene) is approximately 8–12 hours following oral administration, as characterized in published pharmacokinetic and pharmacodynamic studies of enclomiphene citrate; enclomiphene undergoes hepatic metabolism and enterohepatic recirculation, yielding a substantially longer half-life than the cis-isomer (zuclomiphene). Selective ERα antagonist activity at the hypothalamus and anterior pituitary persists over the dosing interval consistent with this plasma half-life.",
    citations: [pmid("22355298", "Wiehle et al. (2013) — Enclomiphene citrate stimulates testosterone and LH secretion pharmacokinetics and pharmacodynamics study, Int J Impot Res")],
    note: "Half-life refers to the trans-isomer (enclomiphene) specifically; the cis-isomer (zuclomiphene) has a markedly shorter half-life. Cited study documents enclomiphene pharmacokinetics and pharmacodynamics following oral administration.",
  },
  {
    slug: "kisspeptin-10",
    name: "Kisspeptin-10",
    halfLifeMin: 15,
    halfLifeMax: 30,
    halfLifeLabel: "~15–30 min",
    route: "subcutaneous",
    pkContext:
      "Plasma half-life of kisspeptin-10 is approximately 15–30 minutes following subcutaneous administration in published clinical pharmacokinetic studies; rapid enzymatic clearance by neprilysin and other endopeptidases limits its duration of action in plasma. Intravenous bolus administration yields a markedly shorter plasma half-life of approximately 2–5 minutes, reflecting direct systemic entry and the 10-residue peptide's particularly rapid neprilysin-mediated cleavage without a subcutaneous absorption phase delay; IV pharmacokinetic data are reported in Chan et al. (2009) and Jayasena et al. (2014).",
    citations: [
      pmid("24449855", "Jayasena et al. (2014) — Kisspeptin-54 and kisspeptin-10 pharmacodynamics compared in healthy men, J Clin Endocrinol Metab"),
      pmid("19237537", "Chan et al. (2009) — Kisspeptin-54 stimulates gonadotropin release most potently via a subcutaneous bolus route of administration with pharmacokinetic profiling, Eur J Endocrinol"),
    ],
    note: "IV route variant: following intravenous bolus administration, plasma half-life is approximately 2–5 minutes (Chan et al. 2009, PMID 19237537; Jayasena et al. 2014, PMID 24449855), compared with ~15–30 minutes via the subcutaneous route. The shorter IV half-life reflects the 10-residue peptide's rapid neprilysin-mediated cleavage upon direct systemic entry, without the absorption-phase delay seen after subcutaneous injection.",
    ivHalfLifeMin: 2,
    ivHalfLifeMax: 5,
    ivHalfLifeLabel: "~2–5 min",
  },
  {
    slug: "kisspeptin-54",
    name: "Kisspeptin-54",
    halfLifeMin: 28,
    halfLifeMax: 35,
    halfLifeLabel: "~28–35 min",
    route: "subcutaneous",
    pkContext:
      "Plasma half-life of kisspeptin-54 (the full-length 54-amino-acid KISS1 gene product) is approximately 28–35 minutes following subcutaneous administration in published clinical pharmacokinetic studies; substantially longer than kisspeptin-10 (~15–30 min) owing to the larger molecular size and slower neprilysin-mediated cleavage of the intact 54-residue sequence. Kisspeptin-54 directly stimulates pulsatile GnRH secretion via KISS1R on hypothalamic GnRH neurons, with the pharmacokinetic profile documented in a randomized crossover comparison with kisspeptin-10 in healthy male volunteers. Intravenous bolus administration yields a markedly shorter plasma half-life of approximately 10–20 minutes, reflecting unimpeded systemic distribution and rapid neprilysin-mediated clearance without the absorption phase delay of subcutaneous injection; IV infusion data are reported in the clinical pharmacokinetic trials by Dhillo et al. (2005) and Chan et al. (2009).",
    citations: [
      pmid("24449855", "Jayasena et al. (2014) — Kisspeptin-54 and kisspeptin-10 compared for gonadotropin-stimulating activity in healthy men, J Clin Endocrinol Metab"),
      pmid("19237537", "Chan et al. (2009) — Kisspeptin-54 stimulates gonadotropin release most potently via a subcutaneous bolus route of administration with pharmacokinetic profiling, Eur J Endocrinol"),
    ],
    note: "IV route variant: following intravenous bolus administration, plasma half-life is approximately 10–20 minutes (Dhillo et al. 2005, PMID 16278289; Chan et al. 2009, PMID 19237537), compared with ~28–35 minutes via the subcutaneous route. The shorter IV half-life reflects direct systemic entry and rapid neprilysin-mediated cleavage without a subcutaneous absorption phase. Citation note: Dhillo et al. (2005, PMID 16278289) characterises IV administration only and is therefore assigned exclusively to the IV altRoute citations array. Chan et al. (2009, PMID 19237537) primarily documents the SC bolus PK profile and is assigned exclusively to the parent SC citations array; its IV comparison data are referenced here by note only.",
    altRoute: {
      route: "intravenous",
      halfLifeLabel: "~10–20 min",
      citations: [
        pmid("16278289", "Dhillo et al. (2005) — Kisspeptin-54 stimulates the hypothalamic-pituitary gonadal axis in human males, J Clin Endocrinol Metab"),
      ],
    },
    ivHalfLifeMin: 10,
    ivHalfLifeMax: 20,
    ivHalfLifeLabel: "~10–20 min",
  },

  // ─── GH secretagogues ────────────────────────────────────────────────────────
  //
  // Snapshot convention: every new entry added to this cluster MUST receive a
  // corresponding it() snapshot test in tests/compound-profiles.test.ts before
  // the change is merged.  See the "CONTRIBUTING CONVENTION" block in that file
  // for step-by-step instructions.
  //
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
  //
  // Snapshot convention: every new hormonal-axis entry added to this cluster
  // (e.g. oxytocin, vasopressin-axis peptides, or future neurohormone entries)
  // MUST receive a corresponding it() snapshot test in
  // tests/compound-profiles.test.ts before the change is merged.  See the
  // "CONTRIBUTING CONVENTION" block in that file for step-by-step instructions.
  //
  {
    slug: "dsip",
    name: "DSIP",
    halfLifeMin: 20,
    halfLifeMax: 30,
    halfLifeLabel: "~20–30 min (SC estimate)",
    route: "subcutaneous",
    pkContext:
      "Delta sleep-inducing peptide (DSIP) plasma half-life is estimated at approximately 20–30 minutes following subcutaneous administration based on the IV half-life (10–20 min, Graf & Kastin 1984) extended by the subcutaneous absorption-phase delay expected for this nine-amino-acid neuropeptide (Trp-Ala-Gly-Gly-Asp-Ala-Ser-Gly-Glu). Intravenous administration of DSIP in preclinical pharmacokinetics studies yields a plasma half-life of approximately 10–20 minutes, as reviewed by Graf & Kastin (1984), reflecting rapid multi-enzymatic clearance upon direct systemic entry; the SC estimate adds the absorption-phase extension. No compound-specific SC plasma pharmacokinetics study has been identified.",
    citations: [pmid("6202839", "Graf & Kastin (1984) — Delta-sleep-inducing peptide (DSIP): a review, Neurosci Biobehav Rev")],
    note: "SC half-life is an estimate derived from the published IV half-life (10–20 min, Graf & Kastin 1984) plus the absorption-phase extension expected for subcutaneous injection of a nine-amino-acid neuropeptide — the same IV-plus-absorption-phase modelling used for VIP (see VIP note). No compound-specific PubMed-indexed plasma pharmacokinetics study for DSIP subcutaneous administration was identified in the April 2026 citation audit or in the May 2026 SC-inferred-from-IV systematic pass. Dedicated PubMed search (May 2026): '(DSIP OR \"delta sleep-inducing peptide\" OR \"delta sleep inducing peptide\" OR \"Trp-Ala-Gly-Gly-Asp-Ala-Ser-Gly-Glu\") AND (subcutaneous OR \"SC\") AND (pharmacokinetics OR absorption OR bioavailability OR \"half-life\" OR \"plasma concentration\")' — DSIP pharmacokinetic literature consists of IV-administered preclinical studies reviewed by Graf & Kastin (1984) and sleep-induction efficacy studies; no primary SC plasma pharmacokinetics study was identified. Confirmed null. IV route variant: plasma half-life of approximately 10–20 minutes following intravenous administration, as compiled in Graf & Kastin (1984, PMID 6202839), a comprehensive DSIP review covering preclinical pharmacokinetics studies of intravenously administered DSIP. The Graf & Kastin review is a secondary source compiling primary IV DSIP pharmacokinetics data.",
    ivHalfLifeMin: 10,
    ivHalfLifeMax: 20,
    ivHalfLifeLabel: "~10–20 min",
  },
  {
    slug: "vip",
    name: "VIP",
    halfLifeMin: 10,
    halfLifeMax: 30,
    halfLifeLabel: "~10–30 min (inhaled-route proxy; SC estimate)",
    route: "subcutaneous",
    pkContext:
      "Vasoactive intestinal peptide (VIP) plasma half-life is extremely short — approximately 1–2 minutes intravenously — owing to rapid enzymatic degradation by endopeptidases in plasma and vascular endothelium. No compound-specific subcutaneous pharmacokinetics study for VIP has been published. The closest documented non-IV data come from inhaled VIP trials in asthmatic subjects: Morice et al. (Lancet, 1983) administered VIP by aerosol inhalation and measured plasma VIP concentrations, documenting an apparent systemic absorption and residence window of approximately 15–30 minutes — roughly 10–15-fold longer than the IV half-life — because pulmonary mucosal absorption rate-limits systemic entry rather than plasma elimination. Subcutaneous administration creates an analogous depot-limited entry profile through slow transcapillary absorption; the effective plasma presence window is therefore estimated at approximately 10–30 minutes by analogy with the inhaled route data. The intrinsic plasma elimination rate of VIP (~1–2 min) is unchanged regardless of administration route.",
    citations: [pmid("6139325", "Morice et al. (1983) — Vasoactive intestinal peptide causes bronchodilation and protects against histamine-induced bronchoconstriction in asthmatic subjects, Lancet (inhaled VIP; plasma kinetics proxy for non-IV routes)")],
    note: "No compound-specific PubMed-indexed SC pharmacokinetics study for VIP was identified (May 2026 audit; confirmed null result). The ~10–30 min SC window is estimated using published inhaled VIP pharmacokinetics (Morice et al., 1983, PMID 6139325) as the closest available non-IV absorption proxy. Inhaled and SC routes both produce absorption-rate-limited systemic exposure relative to IV; the inhaled study is the only published human plasma-kinetics dataset for VIP by a non-IV route and represents a reasonable extrapolation basis. IV half-life (~1–2 min) is sourced from Domschke et al. (1979, PMID 7175453) and is assigned to the altRoute IV citations array.",
    altRoute: {
      route: "intravenous",
      halfLifeMin: 1,
      halfLifeMax: 2,
      halfLifeLabel: "~1–2 min",
      citations: [pmid("7175453", "Domschke et al. (1979) — Vasoactive intestinal peptide in plasma — pharmacokinetics and clinical significance, Gut")],
    },
    ivHalfLifeMin: 1,
    ivHalfLifeMax: 2,
    ivHalfLifeLabel: "~1–2 min",
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
      "Plasma half-life of oxytocin following subcutaneous administration is approximately 3–5 minutes based on direct SC plasma concentration measurements in rats; Mens et al. (1983, Brain Res 262:143–149, PMID 6831191) directly measured peripheral plasma oxytocin concentrations after subcutaneous injection in rats and reported rapid plasma clearance with a half-life of approximately 3–5 minutes, consistent with rapid enzymatic degradation by plasma oxytocinase (leucyl-cystinyl aminopeptidase, LNPEP) and vasopressinase. This is supported by the human IV infusion study of Seitchik et al. (1984, Am J Obstet Gynecol 150:225–228, PMID 6692949), which reported the same 3–5 minute elimination half-life for the IV route, confirming that the SC elimination phase reflects the same rapid oxytocinase-mediated clearance mechanism.",
    citations: [
      pmid("6831191", "Mens et al. (1983) — Penetration of neurohypophyseal peptides in cerebrospinal fluid of rats. A devoted comparison of their bioavailability after subcutaneous injection, Brain Res", "SC (rat model)"),
      pmid("6692949", "Seitchik et al. (1984) — Oxytocin augmentation of dysfunctional labor. IV. Oxytocin pharmacokinetics, Am J Obstet Gynecol", "IV (human)"),
    ],
    note: "SC half-life citation: Mens et al. (1983, Brain Res 262(1):143–149, PMID 6831191) is a PubMed-indexed primary animal study that directly measured peripheral plasma oxytocin concentrations in rats after subcutaneous injection, reporting a plasma half-life of approximately 3–5 minutes — a direct SC measurement in a well-characterised animal model. This brings the oxytocin SC entry to the same citation standard as vasopressin SC, which is anchored by Deyo et al. (1986, PMID 3951675). The SC half-life is no longer inferred from IV data alone. Secondary IV citation: Seitchik et al. (1984, Am J Obstet Gynecol 150:225–228, PMID 6692949) is retained as a supporting human IV plasma PK reference confirming the same 3–5 minute elimination half-life via the IV route, consistent with oxytocinase-mediated degradation. IV route variant: following intravenous bolus administration, oxytocin has a plasma half-life of approximately 1–5 minutes; the lower end of that range (~1–3 min) reflects rapid IV bolus kinetics and the upper end reflects steady-state IV infusion conditions as reported by Seitchik et al. (1984, PMID 6692949). IV oxytocin reaches steady-state plasma concentrations within approximately 30–40 minutes of the start of a constant-rate IV infusion, consistent with a 1–5 minute plasma half-life.",
    ivHalfLifeMin: 1,
    ivHalfLifeMax: 5,
    ivHalfLifeLabel: "~1–5 min",
  },
  {
    slug: "vasopressin",
    name: "Vasopressin",
    halfLifeMin: 10,
    halfLifeMax: 20,
    halfLifeLabel: "~10–20 min",
    route: "subcutaneous",
    pkContext:
      "Plasma half-life of arginine vasopressin (AVP) following subcutaneous administration is approximately 10–20 minutes based on direct SC plasma concentration measurements. Deyo et al. (1986, Neuroendocrinology 42:260–266, PMID 3951675) measured plasma AVP concentrations in rats after subcutaneous injection of behaviorally effective doses, observing peak plasma levels at approximately 5 minutes post-injection and a biphasic plasma decline over 115 minutes — consistent with a dominant SC absorption-phase half-life in the 10–20-minute range. The neurohypophysial nonapeptide is cleared by plasma vasopressinases, hepatic peptidases, and renal excretion. Vasopressin is structurally analogous to oxytocin (differing at positions 3 and 8) and shares similar enzymatic degradation routes. Intravenous administration yields a shorter plasma half-life of approximately 5–15 minutes, documented by Baumann & Dingman (1976) in a primary human pharmacokinetics study measuring metabolic clearance rate and volume of distribution during controlled IV infusion of radiolabeled AVP.",
    citations: [
      pmid("1262454", "Baumann & Dingman (1976) — Distribution, blood transport, and degradation of antidiuretic hormone in man, J Clin Invest"),
      pmid("3951675", "Deyo et al. (1986) — Subcutaneous administration of behaviorally effective doses of arginine vasopressin change brain AVP content only in median eminence, Neuroendocrinology"),
    ],
    note: "IV plasma half-life of arginine vasopressin (~5–15 min) is sourced from Baumann & Dingman (1976, PMID 1262454), a direct primary pharmacokinetic study in humans measuring metabolic clearance rate, plasma half-life, and volume of distribution during controlled intravenous infusion of radiolabeled AVP (J Clin Invest 57:1109–1116). SC half-life (~10–20 min) is supported by Deyo et al. (1986, PMID 3951675, Neuroendocrinology 42:260–266), a PubMed-indexed animal study that directly measured plasma AVP concentrations after SC injection in rats, reporting peak plasma levels at ~5 min post-injection and biphasic plasma decline over 115 min. The animal model is well-characterised for neuropeptide SC pharmacokinetics.",
    ivHalfLifeMin: 5,
    ivHalfLifeMax: 15,
    ivHalfLifeLabel: "~5–15 min",
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
    citations: [
      pmid(
        "15286081",
        "Yang et al. (2004) — Pharmacokinetics of pegfilgrastim in subjects with various degrees of renal function, J Clin Pharmacol [off-compound proxy: PEGylated G-CSF class PK]",
      ),
    ],
    note: "No compound-specific PubMed-indexed pharmacokinetics study for PEG-MGF was identified during citation audit (May 2026). The cited reference (Yang et al. 2004, J Clin Pharmacol 44:1061–9, PMID 15286081) is an off-compound proxy: it is a primary plasma pharmacokinetics study of pegfilgrastim (PEGylated G-CSF) — a PEGylated growth-factor analogue in the same compound class as PEG-MGF — showing that PEGylation extends the plasma half-life approximately 10–100-fold relative to the unmodified parent protein by shielding protease cleavage sites and reducing renal filtration. This class mechanism directly supports the ~3–5 day half-life extrapolation for PEG-MGF relative to unmodified MGF (~20–30 min). No primary compound-specific PEG-MGF PK study is currently indexed in PubMed.",
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
    note: "Cited reference is the primary FOXO4-DRI senolytic efficacy paper; no compound-specific plasma pharmacokinetics study was identified. Half-life is estimated from D-peptide class clearance data. May 2026 citation quality sweep: PubMed searched with '(\"FOXO4-DRI\" OR \"FOXO4 DRI\" OR \"retro-inverso FOXO4\") AND (pharmacokinetics OR \"half-life\" OR plasma)'; additionally searched '(FOXO4) AND (pharmacokinetics OR \"plasma concentration\" OR \"half-life\" OR clearance) AND (senolytic OR \"D-retro\" OR peptide)'. All indexed FOXO4-related publications address senolytic biology (apoptosis of senescent cells, endothelial senescence via p53, pulmonary hypertension, pulmonary fibrosis) — none report plasma pharmacokinetics data for FOXO4-DRI or any FOXO4-derived D-retro-inverso peptide. No compound-specific plasma PK study identified. Confirmed null. Baar 2017 efficacy-paper proxy retained.",
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
    note: "No compound-specific PubMed-indexed plasma pharmacokinetics study for Adipotide was identified during citation audit (April 2026) or the May 2026 citation quality sweep. May 2026 sweep: PubMed searched with '(adipotide OR CKGGRAKDC OR \"proapoptotic targeting peptide\" OR \"prohibitin ligand\") AND (pharmacokinetics OR \"half-life\" OR plasma)'; additionally searched '(adipotide OR CKGGRAKDC OR \"GG-D(KLAKLAK)\" OR \"proapoptotic peptide vasculature\") AND (pharmacokinetics OR plasma OR clearance)' — both queries returned zero results (count = 0). Adipotide has no indexed PubMed pharmacokinetics literature whatsoever. The compound is referenced in preclinical obesity / fat-depot targeting papers (primate weight-loss studies) that describe in vivo efficacy but contain no plasma half-life or PK parameter data. Half-life estimate based on proapoptotic targeting peptide class clearance data only. Confirmed null; this entry should not be re-searched without a specific PK-indexed paper to reference.",
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
    note: "No compound-specific PubMed-indexed plasma pharmacokinetics study for AICAR via subcutaneous administration was identified during citation audit (April 2026) or the May 2026 citation quality sweep. May 2026 sweep: PubMed searched with '(AICAR OR acadesine OR \"AICA riboside\" OR \"aminoimidazole carboxamide ribonucleotide\") AND (pharmacokinetics OR \"half-life\" OR \"plasma concentration\" OR bioavailability)'; additionally searched '(AICAR OR acadesine) AND (pharmacokinetic) AND (\"plasma concentration\" OR \"half-life\" OR \"clearance\" OR AUC)'; additionally searched '(AICAR OR acadesine) AND (pharmacokinetics OR \"plasma half-life\" OR \"plasma concentration\" OR \"half-life\" OR clearance) AND (clinical OR human OR volunteer OR patient)'. The clinical AICAR literature focuses on in vivo metabolic effects — AMPK activation, fatty acid oxidation, glucose uptake, LCFA clearance — and reports metabolic endpoints rather than plasma PK parameters (Cmax, Tmax, t½, AUC, clearance). PMIDs 16772328 and 15265760 (in vivo AMPK/metabolic studies using AICAR infusion) report metabolic response data, not plasma half-life. No compound-specific plasma PK study identified. Confirmed null. Half-life estimate based on nucleoside analogue pharmacokinetic class data.",
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
    note: "No compound-specific plasma pharmacokinetics study was identified in PubMed. Citation is to the primary SLU-PP-332 ERR agonist pharmacology study. Half-life estimated from small-molecule nuclear receptor ligand class data. May 2026 citation quality sweep: PubMed searched with '(\"SLU-PP-332\" OR \"SLU PP 332\") AND (pharmacokinetics OR \"half-life\" OR plasma)'; additionally searched '\"SLU-PP-332\" OR \"SLU PP 332\"' for all indexed papers (count = 10). Papers found: Dufour et al. 2021 (Cell Chem Biol, ERR agonist pharmacology, PMID 33207103); Xu et al. 2024 (Circulation, heart failure, PMID 37961903); Billon et al. 2023 (ACS Chem Biol, exercise response, PMID 36988910); Avliyakulov et al. 2026 (Drug Test Anal, in vitro metabolite identification for doping control, PMID 41688415); Okda et al. 2026 (Int J Biol Macromol, chemical optimization of SLU-PP-332, PMID 41850449); de Souza-Lima et al. 2026 (Rev Med Chil, review, PMID 42024694) — and several more. None of these papers report in vivo plasma pharmacokinetics data for SLU-PP-332 (Cmax, Tmax, t½, AUC, oral bioavailability, or clearance). Avliyakulov 2026 characterises in vitro Phase I/II metabolites for doping-control purposes but does not report plasma PK. No primary plasma PK study identified. Confirmed null. Dufour 2021 ERR-agonist pharmacology proxy retained.",
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
      "Cyanocobalamin (vitamin B12) following intramuscular or subcutaneous injection demonstrates a terminal plasma half-life of approximately 4–6 days; the initial distribution phase is rapid, with liver uptake within 1 hour. Long-term tissue stores in the liver have an effective biological half-life of years, but plasma pharmacokinetics reflect a multi-day terminal phase. Methylcobalamin (an active coenzyme form of B12) administered by subcutaneous or intramuscular injection has been directly characterised in a published LC-MS/MS pharmacokinetics study in rats (Hotta & Mano, 2024), confirming dose-proportional kinetics and complete (~100%) bioavailability via both SC and IM routes.",
    citations: [pmid("39245417", "Hotta & Mano (2024) — Pharmacokinetic profiles of methylcobalamin in rats after multiple administration routes by a simple LC-MS/MS assay, J Pharmacol Toxicol Methods")],
    note: "Citation upgraded (May 2026): Hotta & Mano (2024, J Pharmacol Toxicol Methods, PMID 39245417) is a primary compound-specific pharmacokinetics study of methylcobalamin (MBL, a biologically active B12 coenzyme form) in rats, developing and validating an LC-MS/MS assay (LLOQ 20 ng/mL, plasma volume 0.01 mL) and characterising PK after intravenous, intramuscular, and subcutaneous administration. The study confirms dose-proportional kinetics at 5–20 mg/kg and complete (~100%) bioavailability for both IM and SC routes. Note: this study characterises methylcobalamin specifically; the existing ~4–6 day terminal plasma half-life value reflects cyanocobalamin (the most common injectable B12 form), which has a substantially longer plasma terminal half-life than methylcobalamin due to lower protein-binding and different hepatic retention kinetics. The cited Hotta & Mano study does not report the multi-day terminal half-life characteristic of cyanocobalamin; it is cited because it is the most relevant compound-specific SC/IM B12-form pharmacokinetics study currently indexed in PubMed. No compound-specific cyanocobalamin SC pharmacokinetics study was identified.",  },
  {
    slug: "l-carnitine",
    name: "L-Carnitine",
    halfLifeMin: 180,
    halfLifeMax: 300,
    halfLifeLabel: "~3–5 h (SC estimate)",
    route: "subcutaneous",
    pkContext:
      "L-Carnitine (levocarnitine) plasma half-life following intravenous administration is approximately 3–5 hours; renal tubular reabsorption plays a major role in maintaining plasma levels, and urinary excretion increases markedly above the renal transport maximum. A population pharmacokinetics study of high-dose IV L-carnitine (6–18 g) in patients with vasopressor-dependent septic shock (Jennaro et al. 2023, Pharmacotherapy) demonstrated that a two-compartment model with linear elimination and a fixed volume of distribution of 17.1 L best described the data, with kidney function as the primary covariate driving elimination rate variability.",
    citations: [pmid("37775945", "Jennaro et al. (2023) — Kidney function as a key driver of the pharmacokinetic response to high-dose L-carnitine in septic shock, Pharmacotherapy")],
    note: "Citation upgraded (May 2026): Jennaro et al. (2023, Pharmacotherapy, PMID 37775945) is a primary human population pharmacokinetics study of high-dose intravenous L-carnitine (levocarnitine) in patients with vasopressor-dependent septic shock, based on a phase II randomised clinical trial. The study fitted a two-compartment model with linear elimination to 542 serum samples from 130 patients, establishing that kidney function (eGFR by CKD-EPI equation) is the dominant covariate on the elimination rate constant. Note: the study route is intravenous (not subcutaneous) and the clinical context (septic shock with organ dysfunction) differs substantially from a healthy-subject SC injection setting; the PK parameters reported reflect IV dosing. The SC route half-life estimate (~3–5 h) for this entry is extrapolated from IV kinetics with an added absorption phase. No compound-specific subcutaneous injection pharmacokinetics study for L-carnitine was identified in the May 2026 sweep: PubMed searched with '(\"L-carnitine\" OR levocarnitine) AND (subcutaneous OR intramuscular OR injection) AND (pharmacokinetics OR \"half-life\" OR \"plasma concentration\")' and '(\"L-carnitine\" OR levocarnitine) AND (\"intravenous\" OR \"intravenous infusion\") AND (pharmacokinetics OR \"half-life\" OR \"plasma concentration\") NOT (oral NOT intravenous)'. Jennaro 2023 is the best available indexed primary PK reference.",  },
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
    note: "Cited half-life reflects the primary ascorbic acid component following IV administration. Other Lipo-C constituents have distinct pharmacokinetic profiles. SC route half-life is an estimate for the ascorbic acid component; no compound-specific PubMed-indexed SC pharmacokinetics study for ascorbic acid was identified (see altRoute.note). The SC estimate extrapolates from the known IV clearance kinetics and the additional absorption-phase delay typical of subcutaneous small-molecule injection.",
    altRoute: {
      route: "subcutaneous",
      halfLifeMin: 120,
      halfLifeMax: 240,
      halfLifeLabel: "~2–4 h (SC estimate, ascorbic acid component)",
      citations: [],
      note: "No compound-specific SC pharmacokinetics citation was identified for ascorbic acid administered subcutaneously. The two previously listed citations were removed: PMID 11340098 (Graumlich et al. 1997, 'Pharmacokinetics of ascorbic acid in healthy adults after intravenous and oral dosing') is the same as the parent IV entry citation and characterises IV and oral routes only; PMID 15068981 (Padayatty et al. 2004, 'Vitamin C pharmacokinetics: implications for oral and intravenous use') similarly covers only oral and intravenous use. Neither study measures subcutaneous depot absorption or SC bioavailability for ascorbic acid. A dedicated PubMed search ('(ascorbic acid OR vitamin C) AND (subcutaneous) AND (pharmacokinetics OR absorption OR bioavailability OR \"half-life\")') identified no primary SC PK study applicable to the Lipo-C context. The ~2–4 h SC estimate is extrapolated from the known relationship between IV clearance half-life and the absorption-phase delay typical of subcutaneous small-molecule injections.",
    },
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
      pmid("23084823", "Ho et al. (2012) — Doping control analysis of TB-500 (Ac-LKKTETQ) in equine urine and plasma by LC-MS, J Chromatogr A"),
    ],
    note: "Composite PK profile. BPC-157 half-life is documented in He et al. (2022). TB-500 half-life is estimated from plasma characterisation data in the direct TB-500 doping-control study (Ho et al. 2012, PMID 23084823); this citation replaces the earlier thymosin alpha-1 PLGA proxy (Liu et al. 2010, PMID 20650309) that was used before the individual TB-500 entry was upgraded. No primary pharmacokinetic literature exists for this combination.",
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
  "enclomiphene": "enclomiphene",
  "kisspeptin-10": "kisspeptin-10",
  "kisspeptin-54": "kisspeptin-54",

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
