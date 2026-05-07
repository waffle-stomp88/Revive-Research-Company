/**
 * Snapshot tests for compound-profiles.ts
 *
 * Purpose: Lock in the verified formula and molecular-weight values so that
 * accidental edits (copy-paste errors, Unicode drift, decimal slip) are caught
 * immediately by CI.  After the PubChem verification run that corrected 11
 * formulas and 9 molecular weights, these tests encode the now-canonical values.
 *
 * Two test suites are included:
 *
 *   1. FORMAT CHECKS — structural assertions that apply to every entry that
 *      has a pubchemUrl: formula must use Unicode subscript digits only,
 *      MW must be a numeric string ending in " Da", and the PubChem identifier
 *      (CID for /compound/ links, SID for /substance/ fallback links) must be
 *      a positive integer.  Substance SID URLs are permitted only for the
 *      entries in SUBSTANCE_SID_ALLOWLIST (large recombinant proteins with no
 *      canonical PubChem compound CID).
 *
 *   2. VALUE SNAPSHOTS — vitest snapshot assertions for every entry that
 *      carries a real (non-N/A) formula.  The snapshot file is committed
 *      alongside this test.  Any change to a formula or MW string will fail
 *      CI and require an explicit `vitest --update-snapshots` to approve.
 */

import { describe, it, expect } from "vitest";
import { compoundProfiles } from "@/data/compound-profiles";
import { PEPTIDE_HALF_LIVES } from "@/data/pharmacokinetics";

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Unicode subscript digits U+2080 – U+2089 */
const SUBSCRIPT_DIGIT_RE = /[\u2080-\u2089]/;

/**
 * Returns true when a formula string contains only valid chemical-formula
 * characters and at least one Unicode subscript digit.
 * Allowed: uppercase letters, lowercase letters, Unicode subscript digits,
 * superscript plus (⁺) for cation notation.
 */
function isValidFormulaFormat(formula: string): boolean {
  // Must not contain ASCII digits
  if (/[0-9]/.test(formula)) return false;
  // Must contain at least one Unicode subscript digit
  if (!SUBSCRIPT_DIGIT_RE.test(formula)) return false;
  // Allowed characters: letters, Unicode subscripts U+2080-U+2089, superscript + U+207A
  return /^[A-Za-z\u2080-\u2089\u207A]+$/.test(formula);
}

/**
 * Returns true when a MW string is a plain decimal number followed by " Da".
 * E.g. "1419.55 Da" or "307.32 Da".
 */
function isValidMWFormat(mw: string): boolean {
  return /^\d+(\.\d+)? Da$/.test(mw);
}

/**
 * Extracts the PubChem identifier integer from a canonical PubChem compound
 * or substance URL.  Compound URLs use /compound/<CID> and substance URLs
 * use /substance/<SID>.  Both are valid: large recombinant proteins (e.g.
 * IGF-1 LR3, IGF-DES) have no compound CID in PubChem and are linked via
 * substance (SID) fallback records instead.
 * Returns NaN when neither pattern matches.
 */
function extractPubChemId(url: string): number {
  const m = url.match(/pubchem\.ncbi\.nlm\.nih\.gov\/(?:compound|substance)\/(\d+)$/);
  return m ? parseInt(m[1], 10) : NaN;
}

// ─── 1. FORMAT CHECKS ────────────────────────────────────────────────────────

describe("compound-profiles — format checks for entries with pubchemUrl", () => {
  const withPubchem = compoundProfiles.filter((p) => !!p.pubchemUrl);

  it("has at least 30 entries with a pubchemUrl (regression guard)", () => {
    expect(withPubchem.length).toBeGreaterThanOrEqual(30);
  });

  it("every formula uses Unicode subscript digits (no ASCII digits)", () => {
    for (const profile of withPubchem) {
      expect(
        isValidFormulaFormat(profile.formula),
        `[${profile.slug}] formula "${profile.formula}" must use Unicode subscripts and contain no ASCII digits`
      ).toBe(true);
    }
  });

  it("every molecularWeight ends with ' Da' and has a numeric prefix", () => {
    for (const profile of withPubchem) {
      expect(
        isValidMWFormat(profile.molecularWeight),
        `[${profile.slug}] molecularWeight "${profile.molecularWeight}" must match /^\\d+(\\.\\d+)? Da$/`
      ).toBe(true);
    }
  });

  it("every pubchemUrl contains a valid positive integer CID or SID", () => {
    for (const profile of withPubchem) {
      const pubchemId = extractPubChemId(profile.pubchemUrl!);
      expect(
        Number.isInteger(pubchemId) && pubchemId > 0,
        `[${profile.slug}] pubchemUrl "${profile.pubchemUrl}" must end with a positive integer CID (/compound/) or SID (/substance/)`
      ).toBe(true);
    }
  });

  /**
   * Allowlist of slugs whose pubchemUrl intentionally points to a PubChem
   * Substance record (/substance/<SID>) instead of a Compound record
   * (/compound/<CID>).  Only large recombinant proteins for which no PubChem
   * compound CID exists should appear here.  All other entries must use
   * /compound/ URLs.
   */
  const SUBSTANCE_SID_ALLOWLIST = new Set(["igf-1-lr3", "igf-des"]);

  it("only allowlisted entries use PubChem Substance (/substance/) URLs", () => {
    for (const profile of withPubchem) {
      if (profile.pubchemUrl!.includes("/substance/")) {
        expect(
          SUBSTANCE_SID_ALLOWLIST.has(profile.slug),
          `[${profile.slug}] uses a /substance/ URL but is not in SUBSTANCE_SID_ALLOWLIST — add it to the allowlist or use a /compound/ CID instead`
        ).toBe(true);
      }
    }
  });
});

// ─── 2. VALUE SNAPSHOTS ──────────────────────────────────────────────────────
//
// The snapshot captures the formula and molecularWeight for every entry that
// has a real molecular formula (i.e. does not start with "N/A").
//
// On the first run vitest writes the snapshot file
// (tests/__snapshots__/compound-profiles.test.ts.snap).  From that point on,
// any change to a formula or MW in compound-profiles.ts will break this test.
// An explicit `vitest --update-snapshots` is required to accept new values,
// ensuring every drift is a conscious decision.

describe("compound-profiles — value snapshots (formula + MW)", () => {
  it("formula and molecularWeight are stable for all entries with real formulas", () => {
    const entries = compoundProfiles
      .filter((p) => !p.formula.startsWith("N/A"))
      .map((p) => ({
        slug: p.slug,
        formula: p.formula,
        molecularWeight: p.molecularWeight,
      }));

    // Sanity: there must be a meaningful number of real-formula entries
    expect(entries.length).toBeGreaterThanOrEqual(35);

    expect(entries).toMatchSnapshot();
  });
});

// ─── 3. IV → altRoute CITATION REUSE AUDIT ───────────────────────────────────
//
// Guards against the data quality error found during the May 2026 citation
// audit: IV-primary entries (Glutathione, Lipo-C, Cerebrolysin) had their own
// PMID citations copied verbatim into the SC altRoute citation list. Those
// citations characterise the IV route only and are not appropriate references
// for subcutaneous pharmacokinetics.
//
// Rule: for any entry whose top-level route is "intravenous" and that carries
// an altRoute, no PMID in altRoute.citations may appear in the parent
// citations array. If a PMID appears in both arrays the test fails loudly,
// naming the slug and the duplicate PMID so the regression can be fixed.

describe("pharmacokinetics — IV altRoute citations must not reuse parent IV citations", () => {
  const ivEntriesWithAltRoute = PEPTIDE_HALF_LIVES.filter(
    (e) => e.route === "intravenous" && e.altRoute !== undefined
  );

  it("has at least one IV-primary entry with an altRoute (regression guard)", () => {
    expect(ivEntriesWithAltRoute.length).toBeGreaterThanOrEqual(1);
  });

  it("no altRoute citation PMID duplicates its parent IV entry's citation PMID", () => {
    const violations: string[] = [];

    for (const entry of ivEntriesWithAltRoute) {
      const parentIds = new Set(entry.citations.map((c) => c.id));
      const altCitations = entry.altRoute!.citations;

      for (const altCitation of altCitations) {
        if (parentIds.has(altCitation.id)) {
          violations.push(
            `[${entry.slug}] PMID ${altCitation.id} appears in both the parent IV citations and the altRoute citations — ` +
              `this citation characterises the IV route and must not be reused as an altRoute reference`
          );
        }
      }
    }

    expect(
      violations,
      violations.length > 0
        ? `Citation reuse detected in ${violations.length} IV altRoute entry/entries:\n${violations.join("\n")}`
        : ""
    ).toHaveLength(0);
  });

  // ─── Mirror case: SC-primary entries with an IV altRoute ─────────────────────
  //
  // The May 2026 audit reviewed kisspeptin-54 and VIP (both SC-primary entries
  // that carry an IV altRoute) and found citation-reuse errors in both — PMIDs
  // were duplicated between the parent SC citations array and the IV altRoute
  // citations array.  Those errors were corrected by Task 518.  This test now
  // guards against any future regression where an IV citation is accidentally
  // copied into the SC-primary parent citations array and then re-cited inside
  // the IV altRoute, or vice versa.
  //
  // Rule: for any entry whose top-level route is NOT "intravenous" and that
  // carries an altRoute whose route IS "intravenous", no PMID in
  // altRoute.citations may appear in the parent citations array.

  const scPrimaryWithIvAltRoute = PEPTIDE_HALF_LIVES.filter(
    (e) => e.route !== "intravenous" && e.altRoute?.route === "intravenous"
  );

  it("has at least one SC-primary entry with an IV altRoute (regression guard)", () => {
    expect(scPrimaryWithIvAltRoute.length).toBeGreaterThanOrEqual(1);
  });

  it("no IV altRoute citation PMID duplicates its parent SC-primary entry's citation PMID", () => {
    const violations: string[] = [];

    for (const entry of scPrimaryWithIvAltRoute) {
      const parentIds = new Set(entry.citations.map((c) => c.id));
      const altCitations = entry.altRoute!.citations;

      for (const altCitation of altCitations) {
        if (parentIds.has(altCitation.id)) {
          violations.push(
            `[${entry.slug}] PMID ${altCitation.id} appears in both the parent SC citations and the IV altRoute citations — ` +
              `this citation must belong to only one route block; remove it from the array where it does not characterise that administration route`
          );
        }
      }
    }

    expect(
      violations,
      violations.length > 0
        ? `Citation reuse detected in ${violations.length} SC-primary IV-altRoute entry/entries:\n${violations.join("\n")}`
        : ""
    ).toHaveLength(0);
  });
});

// ─── 4. IM → altRoute CITATION REUSE AUDIT ───────────────────────────────────
//
// Extends the IV/SC citation guard (section 3) to cover IM-primary entries.
//
// Rule: for any entry whose top-level route is "intramuscular" and that carries
// an altRoute, no PMID in altRoute.citations may appear in the parent
// citations array.  IM-primary entries with IV or SC altRoutes must use
// separate, route-appropriate citations for each block.
//
// Currently no IM-primary entries exist in PEPTIDE_HALF_LIVES; the regression
// guard (>= 0) therefore passes trivially.  Once the first IM-primary entry is
// added, the guard threshold should be bumped to >= 1 and the citation-reuse
// test will automatically cover it without any further changes.

describe("pharmacokinetics — IM altRoute citations must not reuse parent IM citations", () => {
  const imEntriesWithAltRoute = PEPTIDE_HALF_LIVES.filter(
    (e) => e.route === "intramuscular" && e.altRoute !== undefined
  );

  it("IM-primary entries with an altRoute count is tracked (regression guard)", () => {
    expect(imEntriesWithAltRoute.length).toBeGreaterThanOrEqual(0);
  });

  it("no altRoute citation PMID duplicates its parent IM entry's citation PMID", () => {
    const violations: string[] = [];

    for (const entry of imEntriesWithAltRoute) {
      const parentIds = new Set(entry.citations.map((c) => c.id));
      const altCitations = entry.altRoute!.citations;

      for (const altCitation of altCitations) {
        if (parentIds.has(altCitation.id)) {
          violations.push(
            `[${entry.slug}] PMID ${altCitation.id} appears in both the parent IM citations and the altRoute citations — ` +
              `this citation characterises the IM route and must not be reused as an altRoute reference; ` +
              `assign it exclusively to the route whose administration it documents`
          );
        }
      }
    }

    expect(
      violations,
      violations.length > 0
        ? `Citation reuse detected in ${violations.length} IM altRoute entry/entries:\n${violations.join("\n")}`
        : ""
    ).toHaveLength(0);
  });
});

// ─── 5. PK PROFILE SNAPSHOTS ─────────────────────────────────────────────────
//
// Locks in the pharmacokinetic fields (halfLifeMin, halfLifeMax, halfLifeLabel,
// route, and citation IDs) for specific compounds that have been verified
// against published clinical literature.  Any accidental removal or edit of
// these fields will fail CI and require an explicit `vitest --update-snapshots`
// to accept the change.
//
// ─── CONTRIBUTING CONVENTION — hormonal-axis entries ─────────────────────────
//
// Every new compound added to ANY of the hormonal-axis clusters in
// client/src/data/pharmacokinetics.ts MUST receive its own it() snapshot test
// in this block before the change is merged.  This applies to:
//
//   • GnRH / gonadal axis  (gonadorelin, GnRH analogues, kisspeptin isoforms,
//     enclomiphene and other selective ER modulators acting on the HPG axis)
//   • GLP-1 / incretin receptor agonists  (GLP-1 RAs, dual GIP/GLP-1 RAs,
//     triple-incretin RAs, amylin analogues, and blends thereof)
//   • GH-releasing hormone analogues  (CJC-1295 variants and any future
//     GHRH-analogue entries)
//   • GH secretagogues  (GHRP-class peptides, ghrelin mimetics)
//   • Neuropeptides / CNS  (oxytocin, future vasopressin-axis entries, and
//     any other peptide whose primary mechanism acts on a hormonal axis)
//
// Steps when adding a new hormonal-axis entry:
//
//   1. Add the HalfLifeEntry to pharmacokinetics.ts with a unique slug and at
//      least one PMID citation.
//
//   2. Add an it() test below (in the appropriate section comment group) that
//      calls pkSnapshot("<slug>") and asserts toMatchSnapshot().  Follow the
//      naming pattern:
//
//        it("<compound-name> PK fields are present and stable", () => {
//          expect(pkSnapshot("<slug>")).toMatchSnapshot();
//        });
//
//   3. Run `vitest --update-snapshots` once to write the initial snapshot,
//      then commit both the test file and the updated .snap file together.
//
// Current hormonal-axis slugs with active snapshots (all verified April 2026):
//
//   GnRH / gonadal axis:
//     gonadorelin, triptorelin, enclomiphene, kisspeptin-10, kisspeptin-54
//
//   GLP-1 / incretin receptor agonists:
//     rr-a1, rr-a2, rr-a3, cagrilintide, mazdutide, survodutide,
//     cag-sema-blend
//
//   GH-releasing hormone analogues:
//     cjc-1295-w-dac
//
//   GH secretagogues:
//     ghrp-6
//
//   Neuropeptides / CNS:
//     oxytocin
//
// Any future analogue must be added to the relevant list above when introduced.
// ─────────────────────────────────────────────────────────────────────────────

describe("compound-profiles — PK profile snapshots", () => {
  function pkSnapshot(slug: string) {
    const entry = PEPTIDE_HALF_LIVES.find((e) => e.slug === slug);
    expect(entry, `${slug} must exist in PEPTIDE_HALF_LIVES`).toBeDefined();
    return {
      slug: entry!.slug,
      halfLifeMin: entry!.halfLifeMin,
      halfLifeMax: entry!.halfLifeMax,
      halfLifeLabel: entry!.halfLifeLabel,
      route: entry!.route,
      citationIds: entry!.citations.map((c) => c.id),
    };
  }

  // ─── GnRH / gonadal axis ─────────────────────────────────────────────────────

  it("kisspeptin-54 PK fields are present and stable", () => {
    expect(pkSnapshot("kisspeptin-54")).toMatchSnapshot();
  });

  it("kisspeptin-10 PK fields are present and stable", () => {
    expect(pkSnapshot("kisspeptin-10")).toMatchSnapshot();
  });

  it("gonadorelin PK fields are present and stable", () => {
    expect(pkSnapshot("gonadorelin")).toMatchSnapshot();
  });

  it("triptorelin PK fields are present and stable", () => {
    expect(pkSnapshot("triptorelin")).toMatchSnapshot();
  });

  it("enclomiphene PK fields are present and stable", () => {
    expect(pkSnapshot("enclomiphene")).toMatchSnapshot();
  });

  // ─── GLP-1 / incretin receptor agonists ──────────────────────────────────────

  it("rr-a1 PK fields are present and stable", () => {
    expect(pkSnapshot("rr-a1")).toMatchSnapshot();
  });

  it("rr-a2 PK fields are present and stable", () => {
    expect(pkSnapshot("rr-a2")).toMatchSnapshot();
  });

  it("rr-a3 PK fields are present and stable", () => {
    expect(pkSnapshot("rr-a3")).toMatchSnapshot();
  });

  it("cagrilintide PK fields are present and stable", () => {
    expect(pkSnapshot("cagrilintide")).toMatchSnapshot();
  });

  it("mazdutide PK fields are present and stable", () => {
    expect(pkSnapshot("mazdutide")).toMatchSnapshot();
  });

  it("survodutide PK fields are present and stable", () => {
    expect(pkSnapshot("survodutide")).toMatchSnapshot();
  });

  it("cag-sema-blend PK fields are present and stable", () => {
    expect(pkSnapshot("cag-sema-blend")).toMatchSnapshot();
  });

  // ─── GH-releasing hormone analogues ──────────────────────────────────────────

  it("cjc-1295-w-dac PK fields are present and stable", () => {
    expect(pkSnapshot("cjc-1295-w-dac")).toMatchSnapshot();
  });

  // ─── GH secretagogues ────────────────────────────────────────────────────────

  it("ghrp-6 PK fields are present and stable", () => {
    expect(pkSnapshot("ghrp-6")).toMatchSnapshot();
  });

  // ─── Neuropeptides / CNS ──────────────────────────────────────────────────────

  it("oxytocin PK fields are present and stable", () => {
    expect(pkSnapshot("oxytocin")).toMatchSnapshot();
  });

  // ─── Metabolic / small-molecule ──────────────────────────────────────────────

  it("mots-c PK fields are present and stable", () => {
    expect(pkSnapshot("mots-c")).toMatchSnapshot();
  });

  it("5-amino-1mq PK fields are present and stable", () => {
    expect(pkSnapshot("5-amino-1mq")).toMatchSnapshot();
  });

  it("aod-9604 PK fields are present and stable", () => {
    expect(pkSnapshot("aod-9604")).toMatchSnapshot();
  });

  it("slu-pp-332 PK fields are present and stable", () => {
    expect(pkSnapshot("slu-pp-332")).toMatchSnapshot();
  });

  // ─── GH secretagogue cluster ─────────────────────────────────────────────────

  it("ghrp-6 PK fields are present and stable", () => {
    expect(pkSnapshot("ghrp-6")).toMatchSnapshot();
  });

  it("hexarelin PK fields are present and stable", () => {
    expect(pkSnapshot("hexarelin")).toMatchSnapshot();
  });

  // ─── Melanocortin / skin cluster ─────────────────────────────────────────────

  it("melanotan-i PK fields are present and stable", () => {
    expect(pkSnapshot("melanotan-i")).toMatchSnapshot();
  });

  it("melanotan-ii PK fields are present and stable", () => {
    expect(pkSnapshot("melanotan-ii")).toMatchSnapshot();
  });

  // ─── Neuropeptide cluster ─────────────────────────────────────────────────────

  it("dsip PK fields are present and stable", () => {
    expect(pkSnapshot("dsip")).toMatchSnapshot();
  });

  it("vip PK fields are present and stable", () => {
    expect(pkSnapshot("vip")).toMatchSnapshot();
  });

  it("pinealon PK fields are present and stable", () => {
    expect(pkSnapshot("pinealon")).toMatchSnapshot();
  });

  // ─── IGF / growth factor cluster ─────────────────────────────────────────────

  it("mgf PK fields are present and stable", () => {
    expect(pkSnapshot("mgf")).toMatchSnapshot();
  });

  it("peg-mgf PK fields are present and stable", () => {
    expect(pkSnapshot("peg-mgf")).toMatchSnapshot();
  });

  it("ace-031 PK fields are present and stable", () => {
    expect(pkSnapshot("ace-031")).toMatchSnapshot();
  });

  it("foxo4-dri PK fields are present and stable", () => {
    expect(pkSnapshot("foxo4-dri")).toMatchSnapshot();
  });

  // ─── Vitamins / supplements cluster ──────────────────────────────────────────

  it("b12-injection PK fields are present and stable", () => {
    expect(pkSnapshot("b12-injection")).toMatchSnapshot();
  });

  it("l-carnitine PK fields are present and stable", () => {
    expect(pkSnapshot("l-carnitine")).toMatchSnapshot();
  });
});
