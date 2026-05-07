import { describe, it, expect } from "vitest";
import {
  buildProductKeywords,
  filterArticlesByProduct,
  ARTICLE_ALIAS_MAP,
} from "../articleMatching";

type ArticleStub = {
  id: string;
  slug: string;
  title: string;
  relatedProductIds?: string[] | null;
};

const makeArticle = (
  id: string,
  slug: string,
  title: string,
  relatedProductIds?: string[]
): ArticleStub => ({ id, slug, title, relatedProductIds: relatedProductIds ?? null });

// ---------------------------------------------------------------------------
// ARTICLE_ALIAS_MAP sanity checks
// ---------------------------------------------------------------------------
describe("ARTICLE_ALIAS_MAP", () => {
  it("igf1 key expands to 'insulin-like growth factor'", () => {
    expect(ARTICLE_ALIAS_MAP["igf1"]).toContain("insulin-like growth factor");
  });

  it("glp1 key expands to 'glucagon-like peptide' and 'semaglutide'", () => {
    expect(ARTICLE_ALIAS_MAP["glp1"]).toContain("glucagon-like peptide");
    expect(ARTICLE_ALIAS_MAP["glp1"]).toContain("semaglutide");
  });

  it("glp key expands to 'glucagon-like peptide' but NOT semaglutide", () => {
    expect(ARTICLE_ALIAS_MAP["glp"]).toContain("glucagon-like peptide");
    expect(ARTICLE_ALIAS_MAP["glp"]).not.toContain("semaglutide");
  });

  it("lr3 key expands to 'insulin-like growth factor' (for IGF-1 LR3 products)", () => {
    expect(ARTICLE_ALIAS_MAP["lr3"]).toContain("insulin-like growth factor");
  });
});

// ---------------------------------------------------------------------------
// buildProductKeywords — tokenisation behaviour
// ---------------------------------------------------------------------------
describe("buildProductKeywords", () => {
  it("returns empty array for null product", () => {
    expect(buildProductKeywords(null)).toEqual([]);
  });

  it("handles null name and slug gracefully", () => {
    expect(buildProductKeywords({ name: null, slug: null })).toEqual([]);
  });

  it("splits on hyphens so 'BPC-157' produces token 'bpc', not 'bpc157'", () => {
    const kws = buildProductKeywords({ name: "BPC-157", slug: "bpc-157" });
    expect(kws).toContain("bpc");
    expect(kws).not.toContain("bpc157");
  });

  it("'BPC-157' token 'bpc' then expands to bpc-157 and body-protection-compound aliases", () => {
    const kws = buildProductKeywords({ name: "BPC-157", slug: "bpc-157" });
    expect(kws).toContain("bpc-157");
    expect(kws).toContain("body protection compound");
  });

  it("'IGF-1 LR3' produces tokens 'igf' and 'lr3' (hyphens and short '1' are skipped)", () => {
    const kws = buildProductKeywords({ name: "IGF-1 LR3", slug: "igf-1-lr3" });
    expect(kws).toContain("igf");
    expect(kws).toContain("lr3");
    expect(kws).not.toContain("igf1");
  });

  it("'IGF-1 LR3' expands via 'lr3' alias to include 'insulin-like growth factor'", () => {
    const kws = buildProductKeywords({ name: "IGF-1 LR3", slug: "igf-1-lr3" });
    expect(kws.some(k => k.includes("insulin-like growth factor"))).toBe(true);
  });

  it("'GLP-1' (hyphenated) expands to 'glucagon-like peptide' via 'glp' alias", () => {
    const kws = buildProductKeywords({ name: "GLP-1 Research Peptide", slug: "glp-1" });
    expect(kws.some(k => k.includes("glucagon-like peptide"))).toBe(true);
  });

  it("'GLP1' (no hyphen) expands to semaglutide and tirzepatide via 'glp1' alias", () => {
    const kws = buildProductKeywords({ name: "GLP1 Research Compound", slug: "glp1" });
    expect(kws).toContain("semaglutide");
    expect(kws).toContain("tirzepatide");
  });

  it("stem-expands trailing digits so 'igf1' token also triggers 'igf' aliases", () => {
    const kws = buildProductKeywords({ name: "IGF1", slug: "igf1" });
    expect(kws).toContain("insulin-like growth factor");
  });

  it("skips tokens shorter than 3 characters (e.g. '1', 'ab')", () => {
    const kws = buildProductKeywords({ name: "AB 5mg peptide", slug: "ab-5mg" });
    expect(kws).not.toContain("ab");
    expect(kws).not.toContain("5");
    expect(kws).not.toContain("1");
  });

  it("skips stop-words: 'vial' and 'kit' are excluded", () => {
    const kws = buildProductKeywords({ name: "BPC-157 Vial Kit", slug: "bpc-157-vial-kit" });
    expect(kws).not.toContain("vial");
    expect(kws).not.toContain("kit");
  });

  it("produces no duplicate keywords when name and slug share the same tokens", () => {
    const kws = buildProductKeywords({ name: "IGF1", slug: "igf1" });
    const unique = new Set(kws);
    expect(unique.size).toBe(kws.length);
  });
});

// ---------------------------------------------------------------------------
// filterArticlesByProduct — IGF-1 LR3 matches "Insulin-like Growth Factor" articles
// ---------------------------------------------------------------------------
describe("filterArticlesByProduct — IGF-1 LR3 matches insulin-like growth factor articles", () => {
  const articles: ArticleStub[] = [
    makeArticle("a1", "insulin-like-growth-factor-guide", "Insulin-like Growth Factor Research Overview"),
    makeArticle("a2", "igf-1-lr3-protocol", "IGF-1 LR3 Dosing Protocol"),
    makeArticle("a3", "bpc-157-healing", "BPC-157 Body Protection Compound Guide"),
    makeArticle("a4", "unrelated-creatine", "Creatine Supplementation Overview"),
  ];

  const product = { name: "IGF-1 LR3", slug: "igf-1-lr3" };
  const productId = "prod-igf1lr3";
  const keywords = buildProductKeywords(product);

  it("matches article whose title contains 'Insulin-like Growth Factor'", () => {
    const results = filterArticlesByProduct(articles, keywords, productId);
    expect(results.map(a => a.id)).toContain("a1");
  });

  it("matches article whose slug contains 'igf-1-lr3'", () => {
    const results = filterArticlesByProduct(articles, keywords, productId);
    expect(results.map(a => a.id)).toContain("a2");
  });

  it("does NOT match a BPC-157 article for an IGF-1 LR3 product", () => {
    const results = filterArticlesByProduct(articles, keywords, productId);
    expect(results.map(a => a.id)).not.toContain("a3");
  });

  it("does NOT match a completely unrelated article (creatine)", () => {
    const results = filterArticlesByProduct(articles, keywords, productId);
    expect(results.map(a => a.id)).not.toContain("a4");
  });
});

// ---------------------------------------------------------------------------
// filterArticlesByProduct — GLP-1 (hyphenated) matches glucagon-like peptide articles
// ---------------------------------------------------------------------------
describe("filterArticlesByProduct — GLP-1 product (hyphenated) matches glucagon-like peptide articles", () => {
  const articles: ArticleStub[] = [
    makeArticle("b1", "glucagon-like-peptide-overview", "Glucagon-like Peptide Research Guide"),
    makeArticle("b2", "glp-1-receptor-agonists", "GLP-1 Receptor Agonist Mechanisms"),
    makeArticle("b3", "igf-1-growth-factors", "IGF-1 Growth Factors"),
    makeArticle("b4", "unrelated-topic", "General Lab Safety Procedures"),
  ];

  const product = { name: "GLP-1 Research Compound", slug: "glp-1" };
  const productId = "prod-glp1";
  const keywords = buildProductKeywords(product);

  it("matches article about glucagon-like peptide", () => {
    const results = filterArticlesByProduct(articles, keywords, productId);
    expect(results.map(a => a.id)).toContain("b1");
  });

  it("matches article whose slug/title contains 'GLP-1'", () => {
    const results = filterArticlesByProduct(articles, keywords, productId);
    expect(results.map(a => a.id)).toContain("b2");
  });

  it("does NOT match an IGF-1 article for a GLP-1 product", () => {
    const results = filterArticlesByProduct(articles, keywords, productId);
    expect(results.map(a => a.id)).not.toContain("b3");
  });

  it("does NOT match a completely unrelated article", () => {
    const results = filterArticlesByProduct(articles, keywords, productId);
    expect(results.map(a => a.id)).not.toContain("b4");
  });
});

// ---------------------------------------------------------------------------
// filterArticlesByProduct — GLP1 (no hyphen) matches semaglutide and tirzepatide articles
// ---------------------------------------------------------------------------
describe("filterArticlesByProduct — GLP1 product (no hyphen) matches semaglutide and tirzepatide", () => {
  const articles: ArticleStub[] = [
    makeArticle("c1", "semaglutide-research-notes", "Semaglutide Research Notes"),
    makeArticle("c2", "tirzepatide-metabolic", "Tirzepatide and Metabolic Research"),
    makeArticle("c3", "glucagon-like-peptide-overview", "Glucagon-like Peptide Research Guide"),
    makeArticle("c4", "igf-1-basics", "IGF-1 Basics and Mechanisms"),
  ];

  const product = { name: "GLP1 Research Compound", slug: "glp1" };
  const productId = "prod-glp1-nohyphen";
  const keywords = buildProductKeywords(product);

  it("matches a semaglutide article", () => {
    const results = filterArticlesByProduct(articles, keywords, productId);
    expect(results.map(a => a.id)).toContain("c1");
  });

  it("matches a tirzepatide article", () => {
    const results = filterArticlesByProduct(articles, keywords, productId);
    expect(results.map(a => a.id)).toContain("c2");
  });

  it("matches a glucagon-like peptide article", () => {
    const results = filterArticlesByProduct(articles, keywords, productId);
    expect(results.map(a => a.id)).toContain("c3");
  });

  it("does NOT match an IGF-1 article for a GLP1 product", () => {
    const results = filterArticlesByProduct(articles, keywords, productId);
    expect(results.map(a => a.id)).not.toContain("c4");
  });
});

// ---------------------------------------------------------------------------
// filterArticlesByProduct — explicit relatedProductIds override
// ---------------------------------------------------------------------------
describe("filterArticlesByProduct — explicit relatedProductIds override", () => {
  const productId = "prod-explicit-123";

  it("always includes an article that explicitly lists the productId even with no keyword match", () => {
    const articles = [
      makeArticle("d1", "some-random-article", "Completely Random Topic", [productId]),
      makeArticle("d2", "another-random-article", "Another Random Topic"),
    ];
    const keywords = buildProductKeywords({ name: "XYZ NoMatch", slug: "xyz-nomatch" });
    const results = filterArticlesByProduct(articles, keywords, productId);
    expect(results.map(a => a.id)).toContain("d1");
    expect(results.map(a => a.id)).not.toContain("d2");
  });
});

// ---------------------------------------------------------------------------
// filterArticlesByProduct — BPC-157 product: no cross-family false positives
// ---------------------------------------------------------------------------
describe("filterArticlesByProduct — BPC-157 product has no cross-family false positives", () => {
  const articles: ArticleStub[] = [
    makeArticle("e1", "bpc-157-body-protection-compound", "BPC-157 Body Protection Compound"),
    makeArticle("e2", "igf-1-growth-factors", "IGF-1 Growth Factors"),
    makeArticle("e3", "glp-1-glucagon-peptide", "GLP-1 Glucagon-like Peptide Research"),
  ];

  const product = { name: "BPC-157", slug: "bpc-157" };
  const keywords = buildProductKeywords(product);

  it("matches the BPC-157 article", () => {
    const results = filterArticlesByProduct(articles, keywords, "prod-bpc157");
    expect(results.map(a => a.id)).toContain("e1");
  });

  it("does NOT match IGF-1 articles for BPC-157", () => {
    const results = filterArticlesByProduct(articles, keywords, "prod-bpc157");
    expect(results.map(a => a.id)).not.toContain("e2");
  });

  it("does NOT match GLP-1 articles for BPC-157", () => {
    const results = filterArticlesByProduct(articles, keywords, "prod-bpc157");
    expect(results.map(a => a.id)).not.toContain("e3");
  });
});

// ---------------------------------------------------------------------------
// filterArticlesByProduct — edge cases
// ---------------------------------------------------------------------------
describe("filterArticlesByProduct — edge cases", () => {
  it("returns empty array when no articles match", () => {
    const articles = [makeArticle("f1", "some-article", "Some Random Article About Chemistry")];
    const keywords = buildProductKeywords({ name: "XYZ NoMatch Compound", slug: "xyz-no-match" });
    expect(filterArticlesByProduct(articles, keywords, "prod-xyz")).toHaveLength(0);
  });

  it("returns empty array when article list is empty", () => {
    const keywords = buildProductKeywords({ name: "IGF-1 LR3", slug: "igf-1-lr3" });
    expect(filterArticlesByProduct([], keywords, "prod-igf1lr3")).toHaveLength(0);
  });
});
