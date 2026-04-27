export const STACK_DISCOUNT = 0.10;

export interface StackComponent {
  slug: string;
  dosage: string;
  name: string;
}

export const STACK_COMPONENTS: Record<string, StackComponent[]> = {
  "recovery-tissue-stack": [
    { slug: "bpc-157", dosage: "10mg", name: "BPC-157" },
    { slug: "tb-500", dosage: "10mg", name: "TB-500" },
  ],
  "metabolic-pathway-stack": [
    { slug: "mots-c", dosage: "10mg", name: "MOTS-C" },
    { slug: "rr-a3", dosage: "10mg", name: "RR-A3" },
  ],
  "longevity-protocol-stack": [
    { slug: "epithalon", dosage: "10mg", name: "Epithalon" },
    { slug: "ghk-cu", dosage: "50mg", name: "GHK-Cu" },
  ],
  "cognitive-edge-stack": [
    { slug: "semax", dosage: "5mg", name: "Semax" },
    { slug: "selank", dosage: "5mg", name: "Selank" },
  ],
  "collagen-skin-stack": [
    { slug: "ghk-cu", dosage: "50mg", name: "GHK-Cu" },
    { slug: "bpc-157", dosage: "10mg", name: "BPC-157" },
  ],
  "elite-triple-stack": [
    { slug: "rr-a3", dosage: "10mg", name: "RR-A3" },
    { slug: "mots-c", dosage: "10mg", name: "MOTS-C" },
    { slug: "bpc-157", dosage: "10mg", name: "BPC-157" },
  ],
  "ghrh-analog-stack": [
    { slug: "cjc-1295-no-dac", dosage: "2mg", name: "CJC-1295 (No DAC)" },
    { slug: "sermorelin", dosage: "5mg", name: "Sermorelin" },
  ],
  "ghsr-secretagogue-stack": [
    { slug: "ipamorelin", dosage: "5mg", name: "Ipamorelin" },
    { slug: "ghrp-2", dosage: "5mg", name: "GHRP-2" },
  ],
};

export const BUNDLE_COMPONENTS: Record<string, StackComponent[]> = {
  "wolverine-stack": [
    { slug: "bpc-157", dosage: "10mg", name: "BPC-157" },
    { slug: "tb-500", dosage: "10mg", name: "TB-500" },
  ],
  "longevity-stack": [
    { slug: "epithalon", dosage: "10mg", name: "Epithalon" },
    { slug: "ghk-cu", dosage: "50mg", name: "GHK-Cu" },
    { slug: "nad-precursor", dosage: "100mg", name: "NAD+ Precursor" },
  ],
  "performance-stack": [
    { slug: "cjc-1295-no-dac", dosage: "2mg", name: "CJC-1295" },
    { slug: "ipamorelin", dosage: "5mg", name: "Ipamorelin" },
  ],
  "healing-protocol": [
    { slug: "bpc-157", dosage: "10mg", name: "BPC-157" },
    { slug: "tb-500", dosage: "10mg", name: "TB-500" },
    { slug: "ghk-cu", dosage: "50mg", name: "GHK-Cu" },
  ],
};

export interface DosagePrice {
  slug: string;
  dosage: string;
  price: number;
}

export function buildPriceLookup(productsWithStock: any[]): Map<string, number> {
  const lookup = new Map<string, number>();
  for (const product of productsWithStock) {
    const slug = product.slug;
    if (product.dosageStocks) {
      for (const ds of product.dosageStocks) {
        const parsed = parseFloat(ds.price);
      if (!isNaN(parsed) && parsed > 0) {
        lookup.set(`${slug}|${ds.dosage}`, parsed);
      }
      }
    }
  }
  return lookup;
}

export function calculateStackPricing(
  stackId: string,
  priceLookup: Map<string, number>,
  components: Record<string, StackComponent[]> = STACK_COMPONENTS
): { retailValue: number; stackPrice: number; savings: number } | null {
  const parts = components[stackId];
  if (!parts) return null;

  let retailValue = 0;
  for (const part of parts) {
    const price = priceLookup.get(`${part.slug}|${part.dosage}`);
    if (price === undefined) return null;
    retailValue += price;
  }

  const retailRounded = Math.round(retailValue * 100) / 100;
  const stackPrice = Math.round(retailRounded * (1 - STACK_DISCOUNT) * 100) / 100;
  const savings = Math.round((retailRounded - stackPrice) * 100) / 100;

  return { retailValue: retailRounded, stackPrice, savings };
}
