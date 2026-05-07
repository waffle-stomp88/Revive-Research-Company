// Pure helpers for article-suggestion matching — no database imports.
// Exported for direct use in unit tests without triggering DB connections.

export const ARTICLE_ALIAS_MAP: Record<string, string[]> = {
  // IGF family
  "igf1":    ["insulin-like growth factor", "insulinlike growth factor", "igf-1"],
  "igf":     ["insulin-like growth factor", "insulinlike growth factor"],
  "igf1lr3": ["igf-1 lr3", "igf1lr3", "long r3"],
  "lr3":     ["igf-1 lr3", "long r3", "insulin-like growth factor"],
  "igfdes":  ["igf-1 des", "des igf", "des(1-3)igf"],
  "mgf":     ["mechano growth factor", "mechano-growth factor"],
  "pegmgf":  ["peg mgf", "pegylated mgf", "mechano growth factor"],
  // GLP / metabolic
  "glp1":    ["glp-1", "glucagon-like peptide", "glucagonlike peptide", "semaglutide", "tirzepatide"],
  "glp":     ["glp-1", "glucagon-like peptide", "glucagonlike peptide"],
  "sema":    ["semaglutide", "glp-1", "glucagon-like peptide"],
  // GHRPs / secretagogues
  "ghrp":    ["growth hormone releasing peptide", "ghrelin"],
  "ghrp2":   ["ghrp-2", "growth hormone releasing peptide"],
  "ghrp6":   ["ghrp-6", "growth hormone releasing peptide"],
  "ghrh":    ["growth hormone releasing hormone", "sermorelin", "cjc"],
  "cjc":     ["cjc-1295", "cjc1295", "growth hormone releasing hormone"],
  "cjc1295": ["cjc-1295", "growth hormone releasing hormone", "ghrh"],
  "ipamorelin": ["ipamorelin", "growth hormone releasing peptide"],
  "sermorelin": ["sermorelin", "growth hormone releasing hormone", "ghrh"],
  // BPC / healing peptides
  "bpc":     ["bpc-157", "body protection compound"],
  "bpc157":  ["bpc-157", "body protection compound"],
  // TB / thymosin
  "tb4":     ["tb-500", "thymosin beta", "thymosin-beta"],
  "tb500":   ["tb-500", "thymosin beta", "thymosin-beta"],
  "thymosin":["tb-500", "tb-4", "thymosin beta", "thymosin alpha"],
  // PT-141 / sexual health
  "pt141":   ["pt-141", "bremelanotide", "melanocortin"],
  "bremelanotide": ["pt-141", "pt141", "melanocortin"],
  // Epithalon
  "epithalon":  ["epitalon", "epithalon", "epithalamin"],
  "epitalon":   ["epithalon", "epithalamin"],
  // Selank / Semax
  "selank":  ["semax", "anxiolytic peptide"],
  "semax":   ["selank", "nootropic peptide"],
  // AOD
  "aod":     ["aod-9604", "aod9604", "anti-obesity drug"],
  "aod9604": ["aod-9604", "anti-obesity drug", "growth hormone fragment"],
  // HGH fragment
  "frag":    ["hgh fragment", "growth hormone fragment", "176-191"],
  // Tesamorelin
  "tesamorelin": ["tesamorelin", "growth hormone releasing hormone"],
  // KPV / anti-inflammatory
  "kpv":     ["kpv", "alpha-msh", "anti-inflammatory peptide"],
};

export const ARTICLE_STOP_WORDS = new Set([
  "the", "and", "for", "with", "from", "this", "that", "vial", "kit",
]);

/**
 * Build the expanded keyword list for a product (pure, no DB access).
 * Words shorter than 3 chars and stop-words are excluded to avoid noisy matches.
 */
export function buildProductKeywords(
  product: { name?: string | null; slug?: string | null } | null
): string[] {
  const keywords: string[] = [];
  if (!product) return keywords;

  const raw = `${product.name ?? ""} ${product.slug ?? ""}`.toLowerCase();
  const tokens = raw.split(/[\s\-_\/]+/).map(t => t.replace(/[^a-z0-9]/g, ""));

  for (const t of tokens) {
    if (t.length >= 3 && !ARTICLE_STOP_WORDS.has(t)) {
      if (!keywords.includes(t)) {
        keywords.push(t);
      }
      const aliases = ARTICLE_ALIAS_MAP[t] ?? [];
      const stemmed = t.replace(/\d+$/, "");
      const stemAliases = stemmed !== t ? (ARTICLE_ALIAS_MAP[stemmed] ?? []) : [];
      for (const alias of [...aliases, ...stemAliases]) {
        if (!keywords.includes(alias)) {
          keywords.push(alias);
        }
      }
    }
  }
  return keywords;
}

/**
 * Filter a list of articles to those relevant to a product (pure, no DB access).
 */
export function filterArticlesByProduct<
  A extends { id?: string; slug?: string | null; title?: string | null; relatedProductIds?: string[] | null }
>(articles: A[], productKeywords: string[], productId: string): A[] {
  return articles.filter(article => {
    if (article.relatedProductIds && article.relatedProductIds.includes(productId)) {
      return true;
    }
    if (productKeywords.length > 0) {
      const haystack = `${article.slug ?? ""} ${article.title ?? ""}`.toLowerCase();
      if (productKeywords.some(kw => haystack.includes(kw))) {
        return true;
      }
    }
    return false;
  });
}
