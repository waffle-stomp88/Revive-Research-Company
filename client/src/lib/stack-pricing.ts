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
  "cognitive-edge-stack": [
    { slug: "semax", dosage: "5mg", name: "Semax" },
    { slug: "selank", dosage: "5mg", name: "Selank" },
  ],
  "gh-amplifier": [
    { slug: "ipamorelin", dosage: "5mg", name: "Ipamorelin" },
    { slug: "cjc-1295-no-dac", dosage: "2mg", name: "CJC-1295" },
  ],
  "glow-protocol": [
    { slug: "bpc-157", dosage: "10mg", name: "BPC-157" },
    { slug: "tb-500", dosage: "10mg", name: "TB-500" },
    { slug: "ghk-cu", dosage: "50mg", name: "GHK-Cu" },
  ],
  "longevity-protocol": [
    { slug: "epithalon", dosage: "10mg", name: "Epithalon" },
    { slug: "ghk-cu", dosage: "50mg", name: "GHK-Cu" },
  ],
  "fat-burner": [
    { slug: "aod-9604", dosage: "5mg", name: "AOD-9604" },
    { slug: "5-amino-1mq", dosage: "50mg", name: "5-Amino-1MQ" },
  ],
  "melanocortin-arousal-stack": [
    { slug: "pt-141", dosage: "10mg", name: "PT-141" },
    { slug: "oxytocin", dosage: "10mg", name: "Oxytocin" },
  ],
  "gonadorelin-kisspeptin-hpg-cascade": [
    { slug: "kisspeptin-10", dosage: "10mg", name: "Kisspeptin-10" },
    { slug: "gonadorelin", dosage: "5mg", name: "Gonadorelin" },
  ],
  "triptorelin-enclomiphene-hpg-axis": [
    { slug: "triptorelin", dosage: "2mg", name: "Triptorelin" },
    { slug: "enclomiphene", dosage: "50mg", name: "Enclomiphene" },
  ],
  "hpg-axis-restore-stack": [
    { slug: "kisspeptin-10", dosage: "10mg", name: "Kisspeptin-10" },
    { slug: "melanotan-ii", dosage: "10mg", name: "MT-2" },
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

export function buildStockLookup(productsWithStock: any[]): Map<string, boolean> {
  const lookup = new Map<string, boolean>();
  for (const product of productsWithStock) {
    const slug = product.slug;
    if (product.dosageStocks) {
      for (const ds of product.dosageStocks) {
        lookup.set(`${slug}|${ds.dosage}`, ds.inStock === true && ds.stockAmount > 0);
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

export function isStackAvailable(
  stackId: string,
  stockLookup: Map<string, boolean>,
  components: Record<string, StackComponent[]> = STACK_COMPONENTS
): { available: boolean; oosComponents: string[] } {
  const parts = components[stackId];
  if (!parts) return { available: false, oosComponents: [] };

  const oosComponents: string[] = [];
  for (const part of parts) {
    const inStock = stockLookup.get(`${part.slug}|${part.dosage}`);
    if (!inStock) {
      oosComponents.push(part.name);
    }
  }
  return { available: oosComponents.length === 0, oosComponents };
}
