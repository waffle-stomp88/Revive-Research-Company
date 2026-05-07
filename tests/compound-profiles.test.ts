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

// ─── 3. PK PROFILE SNAPSHOTS ─────────────────────────────────────────────────
//
// Locks in the pharmacokinetic fields (halfLifeMin, halfLifeMax, halfLifeLabel,
// route, and citation IDs) for specific compounds that have been verified
// against published clinical literature.  Any accidental removal or edit of
// these fields will fail CI and require an explicit `vitest --update-snapshots`
// to accept the change.

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

  it("oxytocin PK fields are present and stable", () => {
    expect(pkSnapshot("oxytocin")).toMatchSnapshot();
  });

  it("enclomiphene PK fields are present and stable", () => {
    expect(pkSnapshot("enclomiphene")).toMatchSnapshot();
  });
});
