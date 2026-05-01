export interface StripeConfig {
  label: string;
  accentColor: string;
}

const slugOverrides: Record<string, StripeConfig> = {
  "bpc-157": { label: "Regenerative Peptide · Research Grade", accentColor: "#E7FB10" },
  "tb-500": { label: "Regenerative Peptide · Research Grade", accentColor: "#E7FB10" },
  "bpc-157-tb-500-stack": { label: "Regenerative Blend · Research Grade", accentColor: "#E7FB10" },
  "glow-peptide-complex": { label: "Skin & Regenerative Blend · Research Grade", accentColor: "#ec4899" },
  "klow-peptide-complex": { label: "Immune & Regenerative Blend · Research Grade", accentColor: "#22c55e" },

  "ghk-cu": { label: "Skin & Collagen Peptide · Research Grade", accentColor: "#ec4899" },
  "snap-8": { label: "Cosmetic Peptide · Research Grade", accentColor: "#ec4899" },
  "aod-9604": { label: "Fat-Loss Peptide · Research Grade", accentColor: "#f97316" },
  "melanotan-i": { label: "Tanning Peptide · Research Grade", accentColor: "#f97316" },
  "melanotan-ii": { label: "Tanning Peptide · Research Grade", accentColor: "#f97316" },
  "pt-141": { label: "Sexual Health Peptide · Research Grade", accentColor: "#f43f5e" },

  "semax": { label: "Cognitive Peptide · Research Grade", accentColor: "#21d8ff" },
  "selank": { label: "Anxiolytic Peptide · Research Grade", accentColor: "#21d8ff" },
  "dsip": { label: "Sleep Peptide · Research Grade", accentColor: "#6366f1" },
  "cerebrolysin": { label: "Neuroprotective Compound · Research Grade", accentColor: "#21d8ff" },
  "vip": { label: "Neuropeptide · Research Grade", accentColor: "#21d8ff" },
  "pinealon": { label: "Cognitive Peptide · Research Grade", accentColor: "#21d8ff" },

  "ipamorelin": { label: "GH Secretagogue · Research Grade", accentColor: "#9d4edd" },
  "ghrp-2": { label: "GH Secretagogue · Research Grade", accentColor: "#9d4edd" },
  "ghrp-6": { label: "GH Secretagogue · Research Grade", accentColor: "#9d4edd" },
  "sermorelin": { label: "GHRH Analogue · Research Grade", accentColor: "#9d4edd" },
  "cjc-1295-no-dac": { label: "GHRH Analogue · Research Grade", accentColor: "#9d4edd" },
  "cjc-1295-w-dac": { label: "GHRH Analogue · Research Grade", accentColor: "#9d4edd" },
  "tesamorelin": { label: "GHRH Analogue · Research Grade", accentColor: "#9d4edd" },
  "hexarelin": { label: "GH Secretagogue · Research Grade", accentColor: "#9d4edd" },
  "igf-1-lr3": { label: "IGF-1 Analogue · Research Grade", accentColor: "#9d4edd" },
  "igf-des": { label: "IGF-1 Fragment · Research Grade", accentColor: "#9d4edd" },

  "epithalon": { label: "Longevity Peptide · Research Grade", accentColor: "#a855f7" },
  "thymalin": { label: "Thymic Peptide · Research Grade", accentColor: "#a855f7" },
  "thymosin-alpha-1": { label: "Immune Peptide · Research Grade", accentColor: "#22c55e" },
  "mots-c": { label: "Mitochondrial Peptide · Research Grade", accentColor: "#f59e0b" },
  "ss-31": { label: "Mitochondrial Peptide · Research Grade", accentColor: "#f59e0b" },
  "aicar": { label: "Metabolic Compound · Research Grade", accentColor: "#f59e0b" },
  "5-amino-1mq": { label: "Metabolic Compound · Research Grade", accentColor: "#f59e0b" },

  "ll-37": { label: "Antimicrobial Peptide · Research Grade", accentColor: "#22c55e" },
  "kpv": { label: "Anti-Inflammatory Peptide · Research Grade", accentColor: "#22c55e" },
  "foxo4-dri": { label: "Senolytic Peptide · Research Grade", accentColor: "#a855f7" },

  "cagrilintide": { label: "Amylin Analogue · Research Grade", accentColor: "#f97316" },
  "mazdutide": { label: "GLP-1/GCGR Dual Agonist · Research Grade", accentColor: "#f97316" },
  "survodutide": { label: "GLP-1/GCGR Dual Agonist · Research Grade", accentColor: "#f97316" },
  "cag-sema-blend": { label: "GLP-1 Blend · Research Grade", accentColor: "#f97316" },

  "oxytocin": { label: "Neurohypophysial Peptide · Research Grade", accentColor: "#6366f1" },
  "gonadorelin": { label: "GnRH Analogue · Research Grade", accentColor: "#9d4edd" },
  "triptorelin": { label: "GnRH Analogue · Research Grade", accentColor: "#9d4edd" },
  "kisspeptin-10": { label: "Reproductive Peptide · Research Grade", accentColor: "#9d4edd" },

  "glutathione": { label: "Antioxidant Compound · Research Grade", accentColor: "#22c55e" },
  "nad-precursor": { label: "NAD+ Precursor · Research Grade", accentColor: "#f59e0b" },
  "b12-injection": { label: "Vitamin B12 · Research Grade", accentColor: "#21d8ff" },
  "l-carnitine": { label: "Amino Acid Derivative · Research Grade", accentColor: "#f59e0b" },
  "bacteriostatic-water": { label: "Reconstitution Solution · Research Grade", accentColor: "#64748b" },

  "rr-a1": { label: "Receptor Research Compound · Research Grade", accentColor: "#9d4edd" },
  "rr-a2": { label: "Receptor Research Compound · Research Grade", accentColor: "#9d4edd" },
  "rr-a3": { label: "Receptor Research Compound · Research Grade", accentColor: "#9d4edd" },

  "adipotide": { label: "Experimental Peptide · Research Grade", accentColor: "#f97316" },
};

const categoryFallbacks: Record<string, StripeConfig> = {
  peptides: { label: "Research Peptide · Research Grade", accentColor: "#E7FB10" },
  "research compounds": { label: "Research Compound · Research Grade", accentColor: "#64748b" },
  supplements: { label: "Supplement · Research Grade", accentColor: "#f59e0b" },
};

const DEFAULT_STRIPE: StripeConfig = {
  label: "Research Compound · Research Grade",
  accentColor: "#E7FB10",
};

export function getStripeConfig(slug?: string | null, category?: string | null): StripeConfig {
  if (slug && slugOverrides[slug]) return slugOverrides[slug];
  if (category) {
    const key = category.toLowerCase().trim();
    if (categoryFallbacks[key]) return categoryFallbacks[key];
  }
  return DEFAULT_STRIPE;
}
