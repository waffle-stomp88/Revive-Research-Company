/**
 * Unit tests for the BAC water first-order promo pricing logic.
 *
 * Tests the pure `applyBacWaterPromo` function from
 * `server/lib/bac-water-pricing.ts`, which is called by the
 * POST /api/orders/paypal route to enforce server-authoritative pricing.
 *
 * Checkout is behind a ProtectedRoute (login required), so every real
 * call to /api/orders/paypal has an authenticated session. These unit
 * tests cover the business-logic rules without a live server:
 *
 *   • First-order user (0 prior orders) + 3ml BAC water → price $0
 *   • First-order user + other dosage → full price (promo only for 3ml)
 *   • First-order user + qty > 1 → exactly 1 unit free, rest at full price
 *   • Repeat buyer + $0 BAC water → stripped (abuse prevention)
 *   • Repeat buyer + full-price BAC water → kept unchanged
 *   • Non-BAC items are never affected
 *
 * Relevant files:
 *   server/lib/bac-water-pricing.ts  — pure function under test
 *   server/routes.ts                 — POST /api/orders/paypal (~line 1220)
 */

import { describe, it, expect } from "vitest";
import { applyBacWaterPromo } from "../server/lib/bac-water-pricing";

const BAC_ID = "afbee9d8-e3bb-444d-a798-35f52ce0edda";
const PEPTIDE_ID = "069bc54f-3ec8-4be2-9a57-ac4a86f9d6a5";

function bacItem(overrides: Partial<{ dosage: string; price: string; quantity: number }> = {}) {
  return {
    productId: BAC_ID,
    dosage: "3ml",
    price: "20.00",
    quantity: 1,
    name: "Bacteriostatic Water",
    ...overrides,
  };
}

function peptideItem() {
  return { productId: PEPTIDE_ID, dosage: "10mg", price: "110.00", quantity: 1, name: "RR-A3" };
}

// ─────────────────────────────────────────────────────────────────────────────
// First-order user (isUserFirstOrder: true)
// ─────────────────────────────────────────────────────────────────────────────

describe("applyBacWaterPromo — first-order user (isUserFirstOrder: true)", () => {
  it("forces 3ml BAC water price to $0.00", () => {
    const result = applyBacWaterPromo([peptideItem(), bacItem()], BAC_ID, true);

    const bac = result.find((i) => i.productId === BAC_ID);
    expect(bac).toBeDefined();
    expect(bac?.price).toBe("0.00");
    expect(bac?.quantity).toBe(1);
  });

  it("keeps non-BAC items unchanged alongside the free BAC water", () => {
    const result = applyBacWaterPromo([peptideItem(), bacItem()], BAC_ID, true);

    const peptide = result.find((i) => i.productId === PEPTIDE_ID);
    expect(peptide?.price).toBe("110.00");
    expect(peptide?.quantity).toBe(1);
  });

  it("only makes the first unit free; additional units stay at full price", () => {
    const result = applyBacWaterPromo([bacItem({ quantity: 3 })], BAC_ID, true);

    const freeUnit = result.find((i) => i.productId === BAC_ID && i.price === "0.00");
    const paidUnits = result.find((i) => i.productId === BAC_ID && i.price !== "0.00");

    expect(freeUnit?.quantity).toBe(1);
    expect(paidUnits?.quantity).toBe(2);
    expect(paidUnits?.price).toBe("20.00");
  });

  it("does not apply promo to BAC water at a dosage other than 3ml", () => {
    const result = applyBacWaterPromo([bacItem({ dosage: "10ml", price: "30.00" })], BAC_ID, true);

    const bac = result.find((i) => i.productId === BAC_ID);
    expect(bac?.price).toBe("30.00");
  });

  it("strips a $0-priced non-3ml BAC water even on a first order (no free pass for wrong dosage)", () => {
    // A first-time buyer who submits a 10ml BAC water at $0 must NOT receive
    // it for free. Only the 3ml SKU qualifies for the first-order promo.
    const result = applyBacWaterPromo([peptideItem(), bacItem({ dosage: "10ml", price: "0" })], BAC_ID, true);

    expect(result.find((i) => i.productId === BAC_ID)).toBeUndefined();
    expect(result.find((i) => i.productId === PEPTIDE_ID)).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Repeat buyer (isUserFirstOrder: false)
// ─────────────────────────────────────────────────────────────────────────────

describe("applyBacWaterPromo — repeat buyer (isUserFirstOrder: false)", () => {
  it("strips a $0-priced BAC water item to block promo abuse", () => {
    const result = applyBacWaterPromo(
      [peptideItem(), bacItem({ price: "0.00" })],
      BAC_ID,
      false
    );

    expect(result.find((i) => i.productId === BAC_ID)).toBeUndefined();
    expect(result.find((i) => i.productId === PEPTIDE_ID)).toBeDefined();
  });

  it("keeps a full-price BAC water item for a repeat buyer", () => {
    const result = applyBacWaterPromo([bacItem({ price: "20.00" })], BAC_ID, false);

    const bac = result.find((i) => i.productId === BAC_ID);
    expect(bac?.price).toBe("20.00");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Edge cases
// ─────────────────────────────────────────────────────────────────────────────

describe("applyBacWaterPromo — edge cases", () => {
  it("returns items unchanged when bacWaterProductId is null", () => {
    const items = [peptideItem(), bacItem()];
    const result = applyBacWaterPromo(items, null, true);

    expect(result).toHaveLength(2);
    expect(result[1].price).toBe("20.00");
  });

  it("returns an empty array for an empty cart", () => {
    expect(applyBacWaterPromo([], BAC_ID, true)).toHaveLength(0);
  });
});
