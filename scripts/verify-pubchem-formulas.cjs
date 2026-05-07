#!/usr/bin/env node
/**
 * verify-pubchem-formulas.cjs
 *
 * One-time script that fetches the canonical MolecularFormula and MolecularWeight
 * for every compound in compound-profiles.ts that has a pubchemUrl, then prints
 * any mismatches.  Run with:
 *
 *   node scripts/verify-pubchem-formulas.cjs
 *
 * Exit code 0  — all entries match (within 0.5 Da tolerance)
 * Exit code 1  — at least one mismatch or fetch error found
 */

"use strict";

// --------------------------------------------------------------------------
// Inline copy of the entries to check (derived from compound-profiles.ts).
// Update this list whenever new pubchemUrl entries are added.
// --------------------------------------------------------------------------
const ENTRIES = [
  { slug: "bpc-157",          cid: 9941957,    formula: "C62H98N16O22",      mw: "1419.55" },
  { slug: "semax",            cid: 9811102,    formula: "C37H51N9O10S",      mw: "813.93"  },
  { slug: "selank",           cid: 11765600,   formula: "C33H57N11O9",       mw: "751.88"  },
  { slug: "igf-1-lr3",        cid: null,       formula: null,                mw: null      },
  { slug: "igf-des",          cid: null,       formula: null,                mw: null      },
  { slug: "mots-c",           cid: 146675088,  formula: "C101H152N28O22S2",  mw: "2174.60" },
  { slug: "ipamorelin",       cid: 9831659,    formula: "C38H49N9O5",        mw: "711.86"  },
  { slug: "ghrp-2",           cid: 6918245,    formula: "C45H55N9O6",        mw: "817.99"  },
  { slug: "sermorelin",       cid: 16132413,   formula: "C149H246N44O42S",   mw: "3357.93" },
  { slug: "ghk-cu",           cid: 139035031,  formula: "C14H21CuN6O4",      mw: "400.90"  },
  { slug: "epithalon",        cid: 219042,     formula: "C14H22N4O9",        mw: "390.35"  },
  { slug: "tesamorelin",      cid: 16137828,   formula: "C221H366N72O67S",   mw: "5135.88" },
  { slug: "thymosin-alpha-1", cid: 16130571,   formula: "C129H215N33O55",    mw: "3108.27" },
  { slug: "ll-37",            cid: 16198951,   formula: "C205H340N60O53",    mw: "4493.33" },
  { slug: "aod-9604",         cid: 71300630,   formula: "C78H123N23O23S2",   mw: "1815.07" },
  { slug: "pt-141",           cid: 9941379,    formula: "C50H68N14O10",      mw: "1025.18" },
  { slug: "hexarelin",        cid: 6918297,    formula: "C47H58N12O6",       mw: "887.05"  },
  { slug: "kpv",              cid: 125672,     formula: "C16H30N4O4",        mw: "342.43"  },
  { slug: "ss-31",            cid: 11764719,   formula: "C32H49N9O5",        mw: "639.80"  },
  { slug: "5-amino-1mq",      cid: 950107,     formula: "C10H11N2+",         mw: "159.21"  },
  { slug: "snap-8",           cid: 71587832,   formula: "C42H72N16O15S",     mw: "1073.19" },
  { slug: "glutathione",      cid: 124886,     formula: "C10H17N3O6S",       mw: "307.32"  },
  { slug: "nad-precursor",    cid: 14180,      formula: "C11H15N2O8P",       mw: "334.22"  },
  { slug: "ghrp-6",           cid: 9919153,    formula: "C46H56N12O6",       mw: "873.02"  },
  { slug: "melanotan-i",      cid: 16197727,   formula: "C78H111N21O19",     mw: "1646.87" },
  { slug: "melanotan-ii",     cid: 92432,      formula: "C50H69N15O9",       mw: "1024.18" },
  { slug: "dsip",             cid: 68816,      formula: "C35H48N10O15",      mw: "848.82"  },
  { slug: "vip",              cid: 16132300,   formula: "C147H237N43O43S",   mw: "3326.83" },
  { slug: "pinealon",         cid: 10273502,   formula: "C15H26N6O8",        mw: "418.40"  },
  { slug: "oxytocin",         cid: 439302,     formula: "C43H66N12O12S2",    mw: "1007.19" },
  { slug: "gonadorelin",      cid: 638793,     formula: "C55H75N17O13",      mw: "1182.32" },
  { slug: "triptorelin",      cid: 25074470,   formula: "C64H82N18O13",      mw: "1311.46" },
  { slug: "kisspeptin-10",    cid: 25240297,   formula: "C63H83N17O14",      mw: "1302.46" },
  { slug: "kisspeptin-54",    cid: 71306396,   formula: "C258H401N79O78",     mw: "5857"    },
  { slug: "aicar",            cid: 17513,      formula: "C9H14N4O5",         mw: "258.23"  },
  { slug: "b12-injection",    cid: 6436232,    formula: "C63H91CoN13O14P",   mw: "1344.38" },
  { slug: "l-carnitine",      cid: 2724480,    formula: "C7H15NO3",          mw: "161.20"  },
];

const MW_TOLERANCE = 0.5; // Da

function normaliseFormula(f) {
  if (!f) return "";
  return f
    .replace(/[\u2080-\u2089]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x2080 + 0x30))
    .replace(/\s+/g, "")
    .replace(/\u207a/g, "+")
    .trim();
}

async function fetchPubChem(cid) {
  const url =
    `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}` +
    `/property/MolecularFormula,MolecularWeight/JSON`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.PropertyTable.Properties[0];
}

async function main() {
  let failures = 0;

  for (const entry of ENTRIES) {
    if (entry.cid === null) {
      console.log(`SKIP  ${entry.slug} — no PubChem CID (documented)`);
      continue;
    }

    let pub;
    try {
      pub = await fetchPubChem(entry.cid);
    } catch (e) {
      console.error(`ERROR ${entry.slug} (CID ${entry.cid}): ${e.message}`);
      failures++;
      continue;
    }

    const pubFormula  = pub.MolecularFormula;
    const pubMW       = parseFloat(pub.MolecularWeight);
    const localFormula = normaliseFormula(entry.formula);
    const localMW      = parseFloat(entry.mw);
    const mwDiff       = Math.abs(pubMW - localMW);

    // PubChem sometimes appends a charge sign; strip it for comparison
    const pubFormulaBase   = pubFormula.replace(/[-+]$/, "");
    const localFormulaBase = localFormula.replace(/[-+]$/, "");

    const formulaOk = localFormulaBase === pubFormulaBase;
    const mwOk      = mwDiff <= MW_TOLERANCE;

    if (!formulaOk || !mwOk) {
      console.log(`FAIL  ${entry.slug} (CID ${entry.cid})`);
      if (!formulaOk) console.log(`       formula  local="${localFormula}" pub="${pubFormula}"`);
      if (!mwOk)      console.log(`       mw       local=${localMW} pub=${pubMW} diff=${mwDiff.toFixed(2)}`);
      failures++;
    } else {
      console.log(`OK    ${entry.slug}: ${pubFormula} | ${pub.MolecularWeight} Da`);
    }
  }

  console.log(`\n${failures} issue(s) found across ${ENTRIES.filter(e => e.cid !== null).length} checked entries.`);
  process.exit(failures > 0 ? 1 : 0);
}

main().catch(err => { console.error(err); process.exit(1); });
