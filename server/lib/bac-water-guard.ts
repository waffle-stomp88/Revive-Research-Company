/**
 * Pure validation logic for the free BAC water abuse guard.
 *
 * Called by POST /api/orders/paypal before creating the PayPal order.
 * Returns an error message string if the request should be rejected,
 * or null if it passes validation.
 *
 * Rules enforced:
 *   1. At most one $0 BAC water line item.
 *   2. That one line item must have quantity exactly 1.
 *   3. That line item must have dosage "3ml" (case-insensitive).
 *   4. The buyer must be a first-order user (checked by the caller via DB).
 */

export interface FreeBacItem {
  productId: string;
  dosage?: string | null;
  quantity?: number;
  price?: string | number;
}

/**
 * Validate free ($0) BAC water items in the submitted cart.
 *
 * @param zeroPricedBacItems - Items already filtered to $0 + matching BAC product ID.
 * @param isUserFirstOrder   - True if the caller has no prior completed orders.
 * @returns Error message string to send to the client, or null if valid.
 */
export function validateFreeBacWater(
  zeroPricedBacItems: FreeBacItem[],
  isUserFirstOrder: boolean
): string | null {
  if (zeroPricedBacItems.length > 1) {
    return "Only one complimentary BAC water item is allowed per order";
  }

  if (zeroPricedBacItems.length === 1) {
    const item = zeroPricedBacItems[0];

    if ((item.quantity ?? 1) !== 1) {
      return "Complimentary BAC water is limited to one unit";
    }

    if (String(item.dosage ?? "").toLowerCase() !== "3ml") {
      return "Complimentary BAC water promo only applies to the 3ml dosage";
    }

    if (!isUserFirstOrder) {
      return "Free BAC water promo is only available on your first order";
    }
  }

  return null;
}
