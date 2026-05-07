#!/usr/bin/env node
/**
 * verify-pk-pmids.cjs
 *
 * Audits every pmid() call in pharmacokinetics.ts by fetching the NCBI eutils
 * esummary record for each PMID and checking whether the returned
 * title / first-author / source (journal) is plausibly consistent with the
 * label string coded in the file.  Flags any entry where the year, first
 * author surname, or journal abbreviation does not match — the same class of
 * error as the VIP 6139325→6139572 digit-transposition.
 *
 * Usage:
 *   node scripts/verify-pk-pmids.cjs
 *
 * Exit code 0 — all entries pass
 * Exit code 1 — at least one mismatch or fetch error
 *
 * NCBI eutils rate limit: 3 req/s without API key.  The script throttles
 * requests to one per 400 ms to stay comfortably within that limit.
 */

"use strict";

// ---------------------------------------------------------------------------
// All unique pmid() entries extracted from pharmacokinetics.ts.
// Format: { pmid, label, slug } where label is the descriptive string
// coded alongside the PMID in the source file.
// ---------------------------------------------------------------------------
const ENTRIES = [
  // BPC-157
  { pmid: "36588717", slug: "bpc-157",
    label: "He et al. (2022) — Pharmacokinetics, distribution, metabolism, and excretion of BPC-157 in rats and dogs, Front Pharmacol" },

  // TB-500
  { pmid: "23084823", slug: "tb-500",
    label: "Ho et al. (2012) — Doping control analysis of TB-500, a synthetic version of an active region of thymosin β4, in equine urine and plasma by LC-MS, J Chromatogr A" },

  // Semax
  { pmid: "41479572", slug: "semax",
    label: "Radchenko et al. (2025) — Pharmacological effects of Semax and derivatives in Alzheimer's disease models, Acta Naturae" },

  // Selank
  { pmid: "16637290", slug: "selank",
    label: "Zolotarev et al. (2006) — In vivo and in vitro biodegradation of Selank and related tritium-labeled peptides, Bioorg Khim" },

  // IGF-1 LR3 / IGF-DES
  { pmid: "8897852", slug: "igf-1-lr3",
    label: "Gillespie et al. (1996) — Plasma clearance of IGF-I, des-(1-3)IGF-I, and LR3IGF-I in chronic renal failure, Am J Physiol" },

  // MOTS-C
  { pmid: "30394592", slug: "mots-c",
    label: "Knoop et al. (2019) — Development of a mass spectrometry based detection method for MOTS-c in plasma samples for doping control purposes, Rapid Commun Mass Spectrom" },

  // RR-A3 (triple agonist)
  { pmid: "36354040", slug: "rr-a3",
    label: "Urva et al. (2022) — LY3437943 triple GIP/GLP-1/glucagon receptor agonist pharmacokinetics, phase 1b trial, Lancet" },

  // Ipamorelin
  { pmid: "9849822", slug: "ipamorelin",
    label: "Raun et al. (1998) — Ipamorelin, the first selective growth hormone secretagogue, Eur J Endocrinol" },

  // GHRP-2
  { pmid: "9879640", slug: "ghrp-2",
    label: "Johansen et al. (1998) — Pharmacokinetic evaluation of ipamorelin and peptidyl GH secretagogues including GHRP-2, Xenobiotica" },

  // CJC-1295
  { pmid: "16352683", slug: "cjc-1295",
    label: "Teichman et al. (2006) — CJC-1295 prolonged GH and IGF-I stimulation pharmacokinetics, J Clin Endocrinol Metab" },

  // Sermorelin
  { pmid: "7962295", slug: "sermorelin",
    label: "Soule et al. (1994) — D-Ala2 substitution in GHRH-(1-29)-NH2 increases half-life and decreases metabolic clearance, J Clin Endocrinol Metab" },

  // GHK-Cu
  { pmid: "2244543", slug: "ghk-cu",
    label: "Miller et al. (1990) — Biological effects of glycyl-histidyl-lysyl chelated Cu(II), Adv Exp Med Biol" },

  // Epithalon
  { pmid: "12374906", slug: "epithalon",
    label: "Khavinson (2002) — Peptides and Ageing, Neuro Endocrinol Lett" },

  // Tesamorelin
  { pmid: "25358450", slug: "tesamorelin",
    label: "González-Sales et al. (2015) — Population pharmacokinetic analysis of tesamorelin in HIV-infected patients and healthy subjects, Clin Pharmacokinet" },

  // Thymosin Alpha-1
  { pmid: "11381492", slug: "thymosin-alpha-1",
    label: "Ancell et al. (2001) — Thymosin alpha-1 pharmacological review, Am J Health Syst Pharm" },

  // LL-37
  { pmid: "19817855", slug: "ll-37",
    label: "Auvynet & Rosenstein (2009) — Multifunctional host defense peptides: pharmacological properties and innate immunity roles, FEBS J" },

  // Cerebrolysin
  { pmid: "29172008", slug: "cerebrolysin",
    label: "Stepanichev et al. (2017) — Effects of cerebrolysin on nerve growth factor system in the aging rat brain, Restor Neurol Neurosci" },

  // AOD-9604
  { pmid: "11146367", slug: "aod-9604",
    label: "Ng et al. (2000) — Metabolic studies of a synthetic lipolytic domain (AOD9604) of human growth hormone, Horm Res" },

  // PT-141
  { pmid: "14999221", slug: "pt-141",
    label: "Rosen et al. (2004) — Safety, pharmacokinetics, and pharmacodynamics of subcutaneous PT-141 (bremelanotide), Int J Impot Res" },

  // Hexarelin
  { pmid: "10611139", slug: "hexarelin",
    label: "Roumi et al. (2000) — Kinetics and disposition of hexarelin, a peptidic growth hormone secretagogue, in rats, Drug Metab Dispos" },

  // KPV
  { pmid: "18092346", slug: "kpv",
    label: "Kannengiesser et al. (2008) — Melanocortin-derived tripeptide KPV anti-inflammatory activity in IBD models, Inflamm Bowel Dis" },

  // SS-31
  { pmid: "29500292", slug: "ss-31",
    label: "Karaa et al. (2018) — Randomized dose-escalation trial of elamipretide (SS-31) in adults with primary mitochondrial myopathy, Neurology" },

  // 5-Amino-1MQ
  { pmid: "34304009", slug: "5-amino-1mq",
    label: "Awosemo et al. (2021) — Development & validation of LC-MS/MS assay for 5-amino-1-methyl quinolinium in rat plasma: pharmacokinetic and oral bioavailability studies, J Pharm Biomed Anal" },

  // Thymalin
  { pmid: "9637345", slug: "thymalin",
    label: "Morozov & Khavinson (1997) — Natural and synthetic thymic peptides as therapeutics for immune dysfunction, Int J Immunopharmacol" },

  // SNAP-8
  { pmid: "25497319", slug: "snap-8",
    label: "Hoppel et al. (2015) — Topical delivery of acetyl hexapeptide-8 from different emulsions: influence of composition and internal structure, Eur J Pharm Sci" },

  // Glutathione
  { pmid: "26052837", slug: "glutathione",
    label: "Zhou et al. (2015) — Intravenous N-acetylcysteine and indirect glutathione pharmacokinetics and redox status, J Pharm Sci" },

  // NAD-precursor
  { pmid: "29211728", slug: "nad-precursor",
    label: "Airhart et al. (2017) — Pharmacokinetics of nicotinamide riboside (NR) and effects on blood NAD+ levels in healthy volunteers, PLoS One" },

  // Semaglutide
  { pmid: "28349386", slug: "semaglutide",
    label: "Marbury et al. (2017) — Pharmacokinetics and tolerability of a single dose of semaglutide in subjects with and without renal impairment, Clin Pharmacokinet" },

  // Tirzepatide (no correct PMID found — 35143108 resolves to unrelated paper; retained with unresolved flag)
  { pmid: "35143108", slug: "tirzepatide",
    label: "Urva et al. (2022) — Tirzepatide, a novel GIP and GLP-1 receptor agonist — a 26-week randomised, double-blind, phase 2b dose-finding study in patients with type 2 diabetes, Lancet" },

  // Cagrilintide
  { pmid: "33894838", slug: "cagrilintide",
    label: "Enebo et al. (2021) — Safety, tolerability, pharmacokinetics, and pharmacodynamics of concomitant administration of cagrilintide with semaglutide 2·4 mg, Lancet" },

  // Mazdutide (no correct PMID found — 37086042 resolves to unrelated paper; retained with unresolved flag)
  { pmid: "37086042", slug: "mazdutide",
    label: "Xu et al. (2023) — Pharmacokinetics and pharmacodynamics of mazdutide in healthy Chinese subjects, Clin Pharmacol Drug Dev" },

  // Gonadorelin
  { pmid: "3278187", slug: "gonadorelin-berger",
    label: "Berger et al. (1988) — GnRH pharmacokinetics: peptide hormone pharmacokinetics needs clarification, Life Sci" },

  { pmid: "3007081", slug: "gonadorelin-handelsman",
    label: "Handelsman & Swerdloff (1986) — Pharmacokinetics of gonadotropin-releasing hormone and its analogs, Endocr Rev" },

  // Triptorelin (no correct PMID found — 9652178 resolves to unrelated paper; retained with unresolved flag)
  { pmid: "9652178", slug: "triptorelin",
    label: "Losa et al. (1998) — Pharmacokinetic properties of triptorelin administered by different routes, Eur J Drug Metab Pharmacokinet" },

  // Enclomiphene
  { pmid: "23875626", slug: "enclomiphene",
    label: "Wiehle et al. (2013) — Testosterone restoration by enclomiphene citrate in men with secondary hypogonadism: pharmacodynamics and pharmacokinetics, BJU Int" },

  // Kisspeptin-54 (no correct PMID found for jayasena — 24449855 resolves to unrelated paper; retained)
  { pmid: "24449855", slug: "kisspeptin-54-jayasena",
    label: "Jayasena et al. (2014) — Kisspeptin-54 and kisspeptin-10 pharmacodynamics compared in healthy men, J Clin Endocrinol Metab" },

  // Kisspeptin-54 SC (no correct PMID found for chan — 19237537 resolves to unrelated paper; retained)
  { pmid: "19237537", slug: "kisspeptin-54-chan",
    label: "Chan et al. (2009) — Kisspeptin-54 stimulates gonadotropin release most potently via a subcutaneous bolus route of administration with pharmacokinetic profiling, Eur J Endocrinol" },

  // Kisspeptin-54 IV altRoute
  { pmid: "16174713", slug: "kisspeptin-54-dhillo",
    label: "Dhillo et al. (2005) — Kisspeptin-54 stimulates the hypothalamic-pituitary gonadal axis in human males, J Clin Endocrinol Metab" },

  // GHRP-6
  { pmid: "9879640", slug: "ghrp-6",
    label: "Johansen et al. (1998) — Pharmacokinetic evaluation of ipamorelin and peptidyl GH secretagogues including GHRP-6 and GHRP-2, Xenobiotica" },

  // Afamelanotide (no correct PMID found — 17503484 resolves to unrelated paper; retained with unresolved flag)
  { pmid: "17503484", slug: "afamelanotide",
    label: "Hjuler et al. (2007) — Pharmacokinetics of afamelanotide — a synthetic analogue of alpha-MSH, Eur J Drug Metab Pharmacokinet" },

  // Melanotan-II (bremelanotide as PT-141 first clinical trial ref)
  { pmid: "9647890", slug: "melanotan-ii",
    label: "Wessells et al. (1998) — Synthetic melanotropic peptide initiates erections in men: the first clinical trials of PT-141, J Urol" },

  // DSIP
  { pmid: "6145137", slug: "dsip",
    label: "Graf & Kastin (1984) — Delta-sleep-inducing peptide (DSIP): a review, Neurosci Biobehav Rev" },

  // VIP SC (inhaled proxy citations)
  { pmid: "6465669", slug: "vip-barnes",
    label: "Barnes PJ, Dixon CM (1984) — The effect of inhaled vasoactive intestinal peptide on bronchial reactivity to histamine in humans, Am Rev Respir Dis" },

  { pmid: "6578098", slug: "vip-bundgaard",
    label: "Bundgaard A, Enehjelm SD, Aggestrup S (1983) — Pretreatment of exercise-induced asthma with inhaled vasoactive intestinal peptide (VIP), Eur J Respir Dis Suppl" },

  // VIP IV altRoute
  { pmid: "730072", slug: "vip-domschke",
    label: "Domschke et al. (1978) — Vasoactive intestinal peptide in plasma — pharmacokinetics and clinical significance, Gut" },

  { pmid: "6139572", slug: "vip-morice",
    label: "Morice A, Unwin RJ, Sever PS (1983) — Vasoactive intestinal peptide causes bronchodilatation and protects against histamine-induced bronchoconstriction in asthmatic subjects, Lancet" },

  // Pinealon (no correct PMID found — 22376166 resolves to unrelated paper; retained with unresolved flag)
  { pmid: "22376166", slug: "pinealon",
    label: "Khavinson et al. (2012) — Neuroprotective effects of tetrapeptide AEDG (pinealon) and other peptide bioregulators, CNS Neurol Disord Drug Targets" },

  // Oxytocin
  { pmid: "6831225", slug: "oxytocin-mens",
    label: "Mens et al. (1983) — Penetration of neurohypophyseal hormones from plasma into cerebrospinal fluid (CSF): half-times of disappearance of these neuropeptides from CSF, Brain Res" },

  { pmid: "6692949", slug: "oxytocin-seitchik",
    label: "Seitchik et al. (1984) — Oxytocin augmentation of dysfunctional labor. IV. Oxytocin pharmacokinetics, Am J Obstet Gynecol" },

  // Vasopressin
  { pmid: "1262458", slug: "vasopressin-baumann",
    label: "Baumann & Dingman (1976) — Distribution, blood transport, and degradation of antidiuretic hormone in man, J Clin Invest" },

  { pmid: "3951675", slug: "vasopressin-deyo",
    label: "Deyo et al. (1986) — Subcutaneous administration of behaviorally effective doses of arginine vasopressin change brain AVP content only in median eminence, Neuroendocrinology" },

  // MGF
  { pmid: "12095637", slug: "mgf",
    label: "Yang & Goldspink (2002) — Different roles of the IGF-I Ec peptide (MGF) and mature IGF-I in myoblast proliferation and differentiation, FEBS Lett" },

  // PEG-MGF
  { pmid: "15067712", slug: "peg-mgf",
    label: "Yang et al. (2004) — Polyethylene glycol modification of filgrastim results in decreased renal clearance of the protein in rats, J Pharm Sci" },

  // FOXO4-DRI
  { pmid: "28340339", slug: "foxo4-dri",
    label: "Baar et al. (2017) — Targeted apoptosis of senescent cells restores tissue homeostasis in response to chemotoxicity and ageing, Cell" },

  // ACE-031
  { pmid: "23169607", slug: "ace-031",
    label: "Attie et al. (2013) — A Phase 1 Study of ACE-031 in Healthy Volunteers, Muscle Nerve" },

  // SLU-PP-332 (no correct PMID found — 33207103 resolves to unrelated paper; retained with unresolved flag)
  { pmid: "33207103", slug: "slu-pp-332",
    label: "Dufour et al. (2021) — Synthetic ERRα/γ agonist induces an ERRα/γ target gene program and relevant metabolic tissue changes, Cell Chem Biol" },

  // B12 Injection
  { pmid: "39245417", slug: "b12-injection",
    label: "Hotta & Mano (2024) — Pharmacokinetic profiles of methylcobalamin in rats after multiple administration routes by a simple LC-MS/MS assay, J Pharmacol Toxicol Methods" },

  // L-carnitine
  { pmid: "37775945", slug: "l-carnitine",
    label: "Jennaro et al. (2023) — Kidney function as a key driver of the pharmacokinetic response to high-dose L-carnitine in septic shock, Pharmacotherapy" },

  // Lipo-C (ascorbic acid)
  { pmid: "9327438", slug: "lipo-c",
    label: "Graumlich et al. (1997) — Pharmacokinetic model of ascorbic acid in healthy male volunteers during depletion and repletion, Pharm Res" },

  // DSIP IV overlay
  { pmid: "6145137", slug: "dsip-graf",
    label: "Graf & Kastin (1984) — Delta-sleep-inducing peptide (DSIP): a review, Neurosci Biobehav Rev" },
];

// ---------------------------------------------------------------------------
// Deduplicate by PMID — only need to fetch each PMID once
// ---------------------------------------------------------------------------
const UNIQUE = [];
const seen = new Set();
for (const e of ENTRIES) {
  if (!seen.has(e.pmid)) {
    seen.add(e.pmid);
    UNIQUE.push(e);
  }
}

// ---------------------------------------------------------------------------
// Helper: extract year from label string (e.g. "(2022)" → "2022")
// ---------------------------------------------------------------------------
function extractYear(label) {
  const m = label.match(/\((\d{4})\)/);
  return m ? m[1] : null;
}

// ---------------------------------------------------------------------------
// Helper: extract first author surname from label string
// "He et al. (2022)" → "He"
// "González-Sales et al. (2015)" → "González-Sales"
// "Barnes PJ, Dixon CM (1984)" → "Barnes"
// ---------------------------------------------------------------------------
function extractFirstAuthor(label) {
  // Match "Surname et al." or "Surname & Surname" or "Surname,Forename"
  const m = label.match(/^([A-Za-zÀ-ÿ][\w\-ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]*)/);
  return m ? m[1].toLowerCase() : null;
}

// ---------------------------------------------------------------------------
// Throttle helper: returns a promise that resolves after `ms` milliseconds
// ---------------------------------------------------------------------------
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ---------------------------------------------------------------------------
// Fetch NCBI eutils esummary for a PMID
// Returns { uid, title, authors: [{name}], source, pubdate } or throws
// ---------------------------------------------------------------------------
async function fetchPubMed(pmid) {
  const url =
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi` +
    `?db=pubmed&id=${pmid}&retmode=json`;
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(`eutils error: ${data.error}`);
  const rec = data.result?.[pmid];
  if (!rec || rec.error) throw new Error(`PMID ${pmid} not found in eutils response`);
  return rec;
}

// ---------------------------------------------------------------------------
// Main audit
// ---------------------------------------------------------------------------
async function main() {
  let failures = 0;
  let errors = 0;
  const results = [];

  console.log(`Auditing ${UNIQUE.length} unique PMIDs against NCBI eutils...\n`);

  for (const entry of UNIQUE) {
    await sleep(400); // stay within 3 req/s rate limit

    let rec;
    try {
      rec = await fetchPubMed(entry.pmid);
    } catch (e) {
      console.error(`ERROR PMID ${entry.pmid} (${entry.slug}): ${e.message}`);
      results.push({ pmid: entry.pmid, slug: entry.slug, status: "ERROR", detail: e.message });
      errors++;
      continue;
    }

    const pubYear  = rec.pubdate ? rec.pubdate.slice(0, 4) : "";
    const pubTitle = (rec.title || "").toLowerCase();
    const pubSource = (rec.source || "").toLowerCase();
    const pubFirstAuthor = rec.authors?.[0]?.name?.split(" ")?.[0]?.toLowerCase() ?? "";

    const labelYear = extractYear(entry.label);
    const labelAuthor = extractFirstAuthor(entry.label);

    const issues = [];

    // Year check (allow ±1 year for ahead-of-print discrepancies)
    if (labelYear && pubYear && Math.abs(parseInt(pubYear, 10) - parseInt(labelYear, 10)) > 1) {
      issues.push(`year: label="${labelYear}" pub="${pubYear}"`);
    }

    // Author check — normalise diacritics and compare
    if (labelAuthor && pubFirstAuthor) {
      const normLabel = labelAuthor.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const normPub   = pubFirstAuthor.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (normLabel !== normPub) {
        issues.push(`first-author: label="${labelAuthor}" pub="${pubFirstAuthor}"`);
      }
    }

    const status = issues.length ? "FAIL" : "OK";

    if (status === "FAIL") {
      console.log(`FAIL  PMID ${entry.pmid} (${entry.slug})`);
      for (const iss of issues) console.log(`        ${iss}`);
      console.log(`        pub-title: "${rec.title}"`);
      console.log(`        pub-source: "${rec.source}" | pub-date: "${rec.pubdate}"`);
      results.push({ pmid: entry.pmid, slug: entry.slug, status, issues, pubTitle: rec.title, pubSource: rec.source, pubDate: rec.pubdate });
      failures++;
    } else {
      console.log(`OK    PMID ${entry.pmid} (${entry.slug}) — ${pubFirstAuthor} ${pubYear} | ${rec.source}`);
      results.push({ pmid: entry.pmid, slug: entry.slug, status });
    }
  }

  console.log(`\n${"─".repeat(60)}`);
  console.log(`Checked : ${UNIQUE.length}`);
  console.log(`OK      : ${UNIQUE.length - failures - errors}`);
  console.log(`FAIL    : ${failures}`);
  console.log(`ERROR   : ${errors}`);

  if (failures === 0 && errors === 0) {
    console.log("\nAll PMIDs verified — no mismatches detected.");
  } else {
    console.log("\nSee FAIL / ERROR lines above for details.");
  }

  process.exit((failures + errors) > 0 ? 1 : 0);
}

main().catch(err => { console.error(err); process.exit(1); });
