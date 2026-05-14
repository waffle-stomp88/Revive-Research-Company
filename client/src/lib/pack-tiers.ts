export const PACK_TIERS = [
  { qty: 1, label: "1 vial", discount: 0, popular: false },
  { qty: 3, label: "3-pack", discount: 0.10, popular: false },
  { qty: 5, label: "5-pack", discount: 0.15, popular: true },
  { qty: 10, label: "10-pack", discount: 0.20, popular: false },
] as const;

export type PackQty = 1 | 3 | 5 | 10;

/** Whole-dollar per-vial price after applying the pack tier discount. */
export function getPackPerVialPrice(basePrice: number, discount: number): number {
  return Math.round(basePrice * (1 - discount));
}

/** Whole-dollar total for a pack (rounded per-vial × qty). */
export function getPackTotalPrice(basePrice: number, qty: PackQty): number {
  const tier = PACK_TIERS.find(t => t.qty === qty)!;
  return getPackPerVialPrice(basePrice, tier.discount) * qty;
}
