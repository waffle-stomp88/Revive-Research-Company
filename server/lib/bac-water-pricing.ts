/**
 * Pure BAC water first-order promo logic.
 *
 * Extracted from the /api/orders/paypal route so it can be unit-tested
 * without a running server, database, or PayPal API connection.
 *
 * Rules (server-authoritative):
 *   1. First-order user + BAC water @ dosage "3ml"
 *      → exactly ONE unit is free across ALL cart lines (cross-line cap)
 *      → the first qualifying line gets qty clamped to 1, price forced to "0.00"
 *      → any extra units on that line are kept at the item's original price
 *      → any subsequent $0 BAC water lines (split-line attack) are stripped
 *   2. Any BAC water submitted at price ≤ $0 that does NOT match rule 1
 *      (wrong dosage on a first order, or any dosage on a repeat order)
 *      → item stripped entirely. Non-qualifying $0 items are never
 *      auto-repriced; they are removed so they cannot inflate the server
 *      subtotal or appear in fulfillmentNotes at zero cost.
 *   3. BAC water submitted at a positive price → item passed through unchanged
 */

export type CartItemInput = {
  productId: string;
  dosage?: string;
  price?: string | number;
  quantity?: number;
  [key: string]: unknown;
};

/**
 * Returns a server-sanitized copy of `items` with the BAC water first-order
 * promo applied (or blocked).
 *
 * @param items              Raw cart items from the client request body
 * @param bacWaterProductId  DB id of the BAC water product, or null if not found
 * @param isUserFirstOrder   True when the authenticated user has 0 prior orders
 */
export function applyBacWaterPromo(
  items: CartItemInput[],
  bacWaterProductId: string | null,
  isUserFirstOrder: boolean
): CartItemInput[] {
  const sanitized: CartItemInput[] = [];

  // Tracks whether the single allowed free unit has already been granted across
  // all cart lines in this request. This prevents a split-line attack where a
  // buyer submits two separate line items (each qty=1, price=$0) for BAC water.
  let freeUnitGranted = false;

  for (const rawItem of items) {
    if (!bacWaterProductId || rawItem.productId !== bacWaterProductId) {
      sanitized.push(rawItem);
      continue;
    }

    const qty = Math.max(1, Number(rawItem.quantity) || 1);
    const priceNum = parseFloat(String(rawItem.price ?? "0"));

    if (isUserFirstOrder && rawItem.dosage === "3ml") {
      if (!freeUnitGranted) {
        // First qualifying line — grant exactly one free unit.
        freeUnitGranted = true;
        sanitized.push({ ...rawItem, quantity: 1, price: "0.00" });
        if (qty > 1) {
          // Additional units beyond the free one are priced normally.
          sanitized.push({ ...rawItem, quantity: qty - 1 });
        }
      } else {
        // Free unit already granted by a prior cart line.
        // A $0-priced duplicate is a split-line attack — strip it.
        // A full-price line is legitimate and passes through unchanged.
        if (priceNum > 0) {
          sanitized.push(rawItem);
        }
        // priceNum <= 0: strip silently (split-line promo abuse)
      }
    } else if (priceNum <= 0) {
      // Any BAC water submitted at $0 that did not qualify for the 3ml
      // first-order promo (wrong dosage, or repeat buyer) must be stripped.
      // This prevents a first-order buyer from getting a non-3ml SKU for free
      // and also blocks the existing repeat-buyer promo-abuse path.
      // (no push)
    } else {
      // Full-price BAC water on any order → keep as-is.
      sanitized.push(rawItem);
    }
  }

  return sanitized;
}
