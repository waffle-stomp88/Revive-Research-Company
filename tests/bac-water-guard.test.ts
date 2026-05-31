/**
 * Unit tests for the free BAC water server-side abuse guard.
 *
 * These tests document the validation rules enforced in POST /api/orders/paypal
 * before the PayPal order is created. The guard prevents:
 *   - Multiple $0 BAC water line items in one order
 *   - A single $0 BAC water line with quantity > 1
 *   - A $0 BAC water line for a non-3ml dosage
 *   - Any $0 BAC water item for a repeat buyer
 *
 * Relevant files:
 *   server/lib/bac-water-guard.ts  — pure function under test
 *   server/routes.ts               — POST /api/orders/paypal (caller)
 */

import { describe, it, expect } from "vitest";
import { validateFreeBacWater, type FreeBacItem } from "../server/lib/bac-water-guard";

const BAC_ID = "afbee9d8-e3bb-444d-a798-35f52ce0edda";

function freeBacItem(overrides: Partial<FreeBacItem> = {}): FreeBacItem {
  return {
    productId: BAC_ID,
    dosage: "3ml",
    quantity: 1,
    price: "0.00",
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// No free BAC items (happy path — no promo)
// ─────────────────────────────────────────────────────────────────────────────

describe("validateFreeBacWater — no free BAC items", () => {
  it("returns null when the cart has no $0 BAC items (repeat buyer, no promo)", () => {
    expect(validateFreeBacWater([], false)).toBeNull();
  });

  it("returns null when the cart has no $0 BAC items (first-order user, no promo)", () => {
    expect(validateFreeBacWater([], true)).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Valid first-order promo
// ─────────────────────────────────────────────────────────────────────────────

describe("validateFreeBacWater — valid first-order promo", () => {
  it("returns null for one $0 3ml BAC water with qty 1 for a first-order user", () => {
    expect(validateFreeBacWater([freeBacItem()], true)).toBeNull();
  });

  it("accepts dosage '3mL' (mixed case) as valid", () => {
    expect(validateFreeBacWater([freeBacItem({ dosage: "3mL" })], true)).toBeNull();
  });

  it("accepts dosage '3ML' (all caps) as valid", () => {
    expect(validateFreeBacWater([freeBacItem({ dosage: "3ML" })], true)).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Abuse: multiple $0 BAC line items
// ─────────────────────────────────────────────────────────────────────────────

describe("validateFreeBacWater — multiple $0 BAC line items (abuse)", () => {
  it("rejects two $0 BAC water lines", () => {
    const result = validateFreeBacWater([freeBacItem(), freeBacItem()], true);
    expect(result).toBeTruthy();
    expect(result).toContain("Only one complimentary BAC water item");
  });

  it("rejects three $0 BAC water lines", () => {
    const result = validateFreeBacWater([freeBacItem(), freeBacItem(), freeBacItem()], true);
    expect(result).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Abuse: quantity escalation (qty > 1 on free line)
// ─────────────────────────────────────────────────────────────────────────────

describe("validateFreeBacWater — quantity > 1 on free BAC item (abuse)", () => {
  it("rejects qty=2 on a $0 BAC line", () => {
    const result = validateFreeBacWater([freeBacItem({ quantity: 2 })], true);
    expect(result).toBeTruthy();
    expect(result).toContain("limited to one unit");
  });

  it("rejects qty=10 on a $0 BAC line", () => {
    const result = validateFreeBacWater([freeBacItem({ quantity: 10 })], true);
    expect(result).toBeTruthy();
    expect(result).toContain("limited to one unit");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Abuse: wrong dosage at $0
// ─────────────────────────────────────────────────────────────────────────────

describe("validateFreeBacWater — non-3ml dosage at $0 (abuse)", () => {
  it("rejects a $0 BAC item with dosage '10ml'", () => {
    const result = validateFreeBacWater([freeBacItem({ dosage: "10ml" })], true);
    expect(result).toBeTruthy();
    expect(result).toContain("3ml dosage");
  });

  it("rejects a $0 BAC item with dosage '30ml'", () => {
    const result = validateFreeBacWater([freeBacItem({ dosage: "30ml" })], true);
    expect(result).toBeTruthy();
  });

  it("rejects a $0 BAC item with null dosage", () => {
    const result = validateFreeBacWater([freeBacItem({ dosage: null })], true);
    expect(result).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Abuse: repeat buyer tries to claim the promo
// ─────────────────────────────────────────────────────────────────────────────

describe("validateFreeBacWater — repeat buyer with $0 BAC (abuse)", () => {
  it("rejects a valid-shape $0 BAC item for a repeat buyer", () => {
    const result = validateFreeBacWater([freeBacItem()], false);
    expect(result).toBeTruthy();
    expect(result).toContain("first order");
  });

  it("rejects even correct dosage + qty=1 when buyer has prior orders", () => {
    const result = validateFreeBacWater([freeBacItem({ dosage: "3ml", quantity: 1 })], false);
    expect(result).toBeTruthy();
  });
});
