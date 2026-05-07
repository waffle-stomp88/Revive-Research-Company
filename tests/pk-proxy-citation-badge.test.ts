import { describe, it, expect } from "vitest";
import { PEPTIDE_HALF_LIVES } from "@/data/pharmacokinetics";

/**
 * Guards against regressions in the proxy-citation warning system.
 *
 * Two compounds are confirmed off-compound proxies with the "[off-compound proxy:"
 * label marker in their citation text:
 *   - PEG-MGF: cites pegfilgrastim PK (PEGylated G-CSF class) rather than PEG-MGF itself.
 *   - SNAP-8: cites acetyl hexapeptide-8 / Argireline rather than SNAP-8 (acetyl glutamyl
 *     octapeptide-3 / Leuphasyl) itself.
 *
 * The pmid() helper in pharmacokinetics.ts auto-detects "[off-compound proxy:" in the label
 * and sets isOffCompoundProxy: true. The PharmacokineticsChart renders a "Proxy" badge next
 * to any citation carrying this flag so readers can distinguish a direct compound-specific
 * citation from an off-compound proxy at a glance.
 */
describe("pharmacokinetics — proxy citation detection", () => {
  it("PEG-MGF citation carries isOffCompoundProxy: true (PEGylated G-CSF class proxy)", () => {
    const entry = PEPTIDE_HALF_LIVES.find(e => e.slug === "peg-mgf");
    expect(entry, "peg-mgf entry must exist in PEPTIDE_HALF_LIVES").toBeDefined();

    expect(entry!.citations.length).toBeGreaterThan(0);
    const proxyCitations = entry!.citations.filter(c => c.isOffCompoundProxy);
    expect(
      proxyCitations.length,
      `Expected at least one citation on peg-mgf to have isOffCompoundProxy=true. ` +
      `Citations: ${JSON.stringify(entry!.citations.map(c => c.label))}`
    ).toBeGreaterThan(0);
  });

  it("SNAP-8 citation carries isOffCompoundProxy: true (acetyl hexapeptide-8 / Argireline proxy)", () => {
    const entry = PEPTIDE_HALF_LIVES.find(e => e.slug === "snap-8");
    expect(entry, "snap-8 entry must exist in PEPTIDE_HALF_LIVES").toBeDefined();

    expect(entry!.citations.length).toBeGreaterThan(0);
    const proxyCitations = entry!.citations.filter(c => c.isOffCompoundProxy);
    expect(
      proxyCitations.length,
      `Expected at least one citation on snap-8 to have isOffCompoundProxy=true. ` +
      `Citations: ${JSON.stringify(entry!.citations.map(c => c.label))}`
    ).toBeGreaterThan(0);
  });

  it("BPC-157 citation does NOT carry isOffCompoundProxy (it has a direct compound-specific study)", () => {
    const entry = PEPTIDE_HALF_LIVES.find(e => e.slug === "bpc-157");
    expect(entry, "bpc-157 entry must exist in PEPTIDE_HALF_LIVES").toBeDefined();

    const proxyCitations = entry!.citations.filter(c => c.isOffCompoundProxy);
    expect(
      proxyCitations.length,
      "BPC-157 has a direct compound-specific PK study and must NOT be flagged as off-compound proxy"
    ).toBe(0);
  });

  it("all citations carrying isOffCompoundProxy also contain '[off-compound proxy:' in their label", () => {
    const violations: string[] = [];
    for (const entry of PEPTIDE_HALF_LIVES) {
      for (const cit of entry.citations) {
        if (cit.isOffCompoundProxy && !cit.label.includes("[off-compound proxy:")) {
          violations.push(`[${entry.slug}] PMID ${cit.id}: isOffCompoundProxy=true but label does not include '[off-compound proxy:'`);
        }
      }
      if (entry.altRoute) {
        for (const cit of entry.altRoute.citations) {
          if (cit.isOffCompoundProxy && !cit.label.includes("[off-compound proxy:")) {
            violations.push(`[${entry.slug} altRoute] PMID ${cit.id}: isOffCompoundProxy=true but label does not include '[off-compound proxy:'`);
          }
        }
      }
    }
    expect(violations, violations.join("\n")).toHaveLength(0);
  });

  it("all citations containing '[off-compound proxy:' in their label carry isOffCompoundProxy: true", () => {
    const violations: string[] = [];
    for (const entry of PEPTIDE_HALF_LIVES) {
      for (const cit of entry.citations) {
        if (cit.label.includes("[off-compound proxy:") && !cit.isOffCompoundProxy) {
          violations.push(`[${entry.slug}] PMID ${cit.id}: label contains '[off-compound proxy:' but isOffCompoundProxy is not true`);
        }
      }
      if (entry.altRoute) {
        for (const cit of entry.altRoute.citations) {
          if (cit.label.includes("[off-compound proxy:") && !cit.isOffCompoundProxy) {
            violations.push(`[${entry.slug} altRoute] PMID ${cit.id}: label contains '[off-compound proxy:' but isOffCompoundProxy is not true`);
          }
        }
      }
    }
    expect(violations, violations.join("\n")).toHaveLength(0);
  });
});
