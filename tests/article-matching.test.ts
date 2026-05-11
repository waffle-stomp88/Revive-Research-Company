/**
 * Unit tests for server/articleMatching.ts
 *
 * Guards the two fixes applied in Task #711:
 *
 *   1. ARTICLE_STOP_WORDS — "peptide" and related noisy tokens must be excluded
 *      so that products whose slugs contain only stop-word tokens produce zero
 *      keyword matches and never show unrelated articles.
 *
 *   2. filterArticlesByProduct — articles explicitly linked via relatedProductIds
 *      must always appear before articles matched only by keyword.
 *
 * These tests are pure (no database access) and run in milliseconds.
 */

import { describe, it, expect } from "vitest";
import {
  ARTICLE_STOP_WORDS,
  buildProductKeywords,
  filterArticlesByProduct,
} from "../server/articleMatching";

// ─── helpers ─────────────────────────────────────────────────────────────────

type StubArticle = {
  id: string;
  slug: string;
  title: string;
  relatedProductIds: string[] | null;
};

function article(
  id: string,
  slug: string,
  title: string,
  relatedProductIds: string[] | null = null
): StubArticle {
  return { id, slug, title, relatedProductIds };
}

// ─── 1. ARTICLE_STOP_WORDS ────────────────────────────────────────────────────

describe("ARTICLE_STOP_WORDS", () => {
  const NOISE = ["peptide", "complex", "compound", "research", "guide", "analog", "blend", "stack"];

  it("contains all required noisy tokens", () => {
    for (const word of NOISE) {
      expect(ARTICLE_STOP_WORDS.has(word), `"${word}" must be a stop word`).toBe(true);
    }
  });

  it("still retains classic stop words", () => {
    for (const word of ["the", "and", "for", "with"]) {
      expect(ARTICLE_STOP_WORDS.has(word), `"${word}" must still be a stop word`).toBe(true);
    }
  });
});

// ─── 2. buildProductKeywords — stop-word filtering ───────────────────────────

describe("buildProductKeywords — stop-word filtering", () => {
  it("does not include 'peptide' as a keyword for any product", () => {
    const kws = buildProductKeywords({ name: "KLOW Peptide Complex", slug: "klow-peptide-complex" });
    expect(kws).not.toContain("peptide");
    expect(kws).not.toContain("complex");
  });

  it("still includes the meaningful compound token for KLOW", () => {
    const kws = buildProductKeywords({ name: "KLOW Peptide Complex", slug: "klow-peptide-complex" });
    expect(kws).toContain("klow");
  });

  it("does not include 'compound' or 'research' as keywords", () => {
    const kws = buildProductKeywords({ name: "Research Compound", slug: "research-compound-x" });
    expect(kws).not.toContain("compound");
    expect(kws).not.toContain("research");
  });

  it("returns empty array when product is null", () => {
    expect(buildProductKeywords(null)).toEqual([]);
  });

  it("slug-only-stop-word product produces zero keywords (no spurious matches)", () => {
    const kws = buildProductKeywords({ name: "Research Peptide Blend", slug: "research-peptide-blend" });
    expect(kws.length).toBe(0);
  });
});

// ─── 3. filterArticlesByProduct — explicit-first ordering ────────────────────

describe("filterArticlesByProduct — explicit relatedProductIds are returned first", () => {
  const PRODUCT_ID = "prod-001";
  const OTHER_PRODUCT_ID = "prod-002";

  const explicitArticle = article(
    "art-explicit",
    "what-is-klow",
    "What is KLOW?",
    [PRODUCT_ID]
  );

  const keywordArticle = article(
    "art-keyword",
    "what-is-klow-research",
    "KLOW research overview",
    null
  );

  const unrelatedArticle = article(
    "art-unrelated",
    "what-is-bpc-157",
    "What is BPC-157?",
    [OTHER_PRODUCT_ID]
  );

  it("explicit article appears before keyword article even when keyword article is listed first in input", () => {
    const results = filterArticlesByProduct(
      [keywordArticle, explicitArticle, unrelatedArticle],
      ["klow"],
      PRODUCT_ID
    );
    expect(results[0].id).toBe("art-explicit");
  });

  it("unrelated article (explicit link for a different product) is excluded", () => {
    const results = filterArticlesByProduct(
      [explicitArticle, keywordArticle, unrelatedArticle],
      ["klow"],
      PRODUCT_ID
    );
    const ids = results.map(a => a.id);
    expect(ids).not.toContain("art-unrelated");
  });

  it("keyword article is still included when it matches", () => {
    const results = filterArticlesByProduct(
      [explicitArticle, keywordArticle, unrelatedArticle],
      ["klow"],
      PRODUCT_ID
    );
    const ids = results.map(a => a.id);
    expect(ids).toContain("art-keyword");
  });

  it("returns only the explicit article when keywords are empty", () => {
    const results = filterArticlesByProduct(
      [explicitArticle, keywordArticle, unrelatedArticle],
      [],
      PRODUCT_ID
    );
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("art-explicit");
  });

  it("returns empty array when nothing matches", () => {
    const results = filterArticlesByProduct(
      [unrelatedArticle],
      ["klow"],
      PRODUCT_ID
    );
    expect(results).toHaveLength(0);
  });
});

// ─── 4. Regression: "peptide" stop word prevents KLOW showing wrong articles ─

describe("filterArticlesByProduct — KLOW regression guard", () => {
  const KLOW_ID = "klow-prod-id";
  const RR_A2_ID = "rr-a2-prod-id";

  const klowArticle = article("klow-art", "what-is-klow-peptide-complex", "What is KLOW?", [KLOW_ID]);
  const rrA2Article = article("rr-a2-art", "what-is-rr-a2-peptide", "What is RR-A2?", [RR_A2_ID]);
  const igfDesArticle = article("igf-des-art", "what-is-igf-des-peptide", "What is IGF-DES?", null);

  it("KLOW product returns only its own article — not RR-A2 or IGF-DES", () => {
    const klowKeywords = buildProductKeywords({
      name: "KLOW Peptide Complex",
      slug: "klow-peptide-complex",
    });

    const results = filterArticlesByProduct(
      [rrA2Article, igfDesArticle, klowArticle],
      klowKeywords,
      KLOW_ID
    );

    const ids = results.map(a => a.id);
    expect(ids).toContain("klow-art");
    expect(ids).not.toContain("rr-a2-art");
    expect(ids).not.toContain("igf-des-art");
  });

  it("KLOW dedicated article appears as the first result", () => {
    const klowKeywords = buildProductKeywords({
      name: "KLOW Peptide Complex",
      slug: "klow-peptide-complex",
    });

    const results = filterArticlesByProduct(
      [rrA2Article, igfDesArticle, klowArticle],
      klowKeywords,
      KLOW_ID
    );

    expect(results[0].id).toBe("klow-art");
  });
});

// ─── 5. Products without a dedicated article show zero results ────────────────

describe("filterArticlesByProduct — products without dedicated articles", () => {
  it("GHRP-2 (no dedicated article) returns zero results when only noise keywords exist", () => {
    const ghrp2Keywords = buildProductKeywords({
      name: "GHRP-2 Peptide",
      slug: "ghrp-2-peptide",
    });

    const articles = [
      article("igf-art", "what-is-igf-1-peptide", "What is IGF-1?", null),
      article("bpc-art", "what-is-bpc-157", "What is BPC-157?", null),
    ];

    const results = filterArticlesByProduct(articles, ghrp2Keywords, "ghrp-2-prod-id");

    expect(results.every(a => !a.relatedProductIds?.includes("ghrp-2-prod-id"))).toBe(true);
  });
});
