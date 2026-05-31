/**
 * Pure BAC water first-order promo logic.
 *
 * Extracted from the /api/orders/paypal route so it can be unit-tested
 * without a running server, database, or PayPal API connection.
 *
 * Rules (server-authoritative):
 *   1. First-order user + BAC water @ dosage "3ml"
 *      → quantity clamped to 1, price forced to "0.00"
 *      → any extra units kept at the item's original price
 *   2. Non-first-order user + BAC water with price ≤ $0
 *      → item stripped entirely (promo-abuse prevention)
 *   3. All other cases → item passed through unchanged
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
 * @param items          Raw cart items from the client request body
 * @param bacWaterProductId  DB id of the BAC water product, or null if not found
 * @param isUserFirstOrder   True when the authenticated user has 0 prior orders
 */
export function applyBacWaterPromo(
  items: CartItemInput[],
  bacWaterProductId: string | null,
  isUserFirstOrder: boolean
): CartItemInput[] {
  const sanitized: CartItemInput[] = [];

  for (const rawItem of items) {
    if (!bacWaterProductId || rawItem.productId !== bacWaterProductId) {
      sanitized.push(rawItem);
      continue;
    }

    const qty = Math.max(1, Number(rawItem.quantity) || 1);
    const priceNum = parseFloat(String(rawItem.price ?? "0"));

    if (isUserFirstOrder && rawItem.dosage === "3ml") {
      // Exactly one unit is free on the first order.
      sanitized.push({ ...rawItem, quantity: 1, price: "0.00" });
      if (qty > 1) {
        // Additional units beyond the free one are priced normally.
        sanitized.push({ ...rawItem, quantity: qty - 1 });
      }
    } else if (!isUserFirstOrder && priceNum <= 0) {
      // Repeat buyer attempting to claim a $0 BAC water — strip it.
      // (no push)
    } else {
      // Any other scenario (non-3ml on first order, or full-price on repeat)
      // → keep as-is.
      sanitized.push(rawItem);
    }
  }

  return sanitized;
}
