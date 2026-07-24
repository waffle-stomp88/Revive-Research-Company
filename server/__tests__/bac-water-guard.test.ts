// @vitest-environment node
/**
 * Unit tests for validateFreeBacWater (server/lib/bac-water-guard.ts)
 *
 * This file covers the pure validation function that is called by
 * POST /api/orders/paypal before any DB or PayPal interaction.
 * It acts as a fast, no-mock regression safety net for the guard logic:
 * if someone accidentally changes a comparison, removes a branch, or
 * renames the $0-price check, one of these tests will fail immediately.
 *
 * Three key contracts tested here mirror the task requirements:
 *   1. A user with prior orders (isUserFirstOrder = false) is rejected.
 *   2. A user whose firstOrderPromos row marks them "redeemed"
 *      (isUserFirstOrder = false, from the backstop path) is also rejected.
 *   3. A genuine first-time buyer (isUserFirstOrder = true) with a valid
 *      promo item is allowed through (null returned).
 */

import { describe, it, expect } from 'vitest';
import { validateFreeBacWater } from '../lib/bac-water-guard';
import type { FreeBacItem } from '../lib/bac-water-guard';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const validBacItem: FreeBacItem = {
  productId: 'bac-water-product-id',
  dosage: '3ml',
  quantity: 1,
  price: 0,
};

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 — repeat buyer is blocked (orders exist in DB)
//
// This mirrors the scenario: "user with an existing paid order attempts to
// submit a cart containing a $0 BAC water item".
// The caller sets isUserFirstOrder = false when getOrdersByUserId() returns
// a non-empty array.
// ─────────────────────────────────────────────────────────────────────────────

describe('validateFreeBacWater — repeat buyer rejected (prior orders path)', () => {
  it('returns an error message when isUserFirstOrder is false', () => {
    const result = validateFreeBacWater([validBacItem], false);

    expect(typeof result).toBe('string');
    expect(result).not.toBeNull();
  });

  it('error message contains "first order" wording', () => {
    const result = validateFreeBacWater([validBacItem], false);

    expect(result!.toLowerCase()).toContain('first order');
  });

  it('returns null for the same user when no $0 BAC item is in the cart', () => {
    // Repeat buyer without a promo item — nothing to block.
    const result = validateFreeBacWater([], false);

    expect(result).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 2 — backstop: firstOrderPromos "redeemed" row blocks the promo
//
// This mirrors: "a user with a firstOrderPromos 'redeemed' row is blocked even
// if they have no orders in the orders table".
// The caller resolves isUserFirstOrder = false when hasRedeemedFirstOrderPromo()
// returns true, regardless of the order-history count.
// ─────────────────────────────────────────────────────────────────────────────

describe('validateFreeBacWater — backstop: redeemed promo row blocks even with no order history', () => {
  it('returns an error when isUserFirstOrder is false (redeemed via firstOrderPromos)', () => {
    // Caller passed false because hasRedeemedFirstOrderPromo() returned true,
    // even though getOrdersByUserId() returned [].
    const result = validateFreeBacWater([validBacItem], false);

    expect(result).not.toBeNull();
  });

  it('error wording still references "first order" for the backstop path', () => {
    const result = validateFreeBacWater([validBacItem], false);

    expect(result!.toLowerCase()).toContain('first order');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 3 — genuine first-time buyer is allowed through
// ─────────────────────────────────────────────────────────────────────────────

describe('validateFreeBacWater — first-time buyer allowed', () => {
  it('returns null for a valid $0 3ml BAC water item on a first order', () => {
    const result = validateFreeBacWater([validBacItem], true);

    expect(result).toBeNull();
  });

  it('returns null when there are no $0 BAC items at all (any buyer)', () => {
    const result = validateFreeBacWater([], true);

    expect(result).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 4 — shape/quantity/dosage validation (guard integrity)
//
// These tests protect the four rules documented in bac-water-guard.ts.
// If any check is accidentally removed the relevant test fails.
// ─────────────────────────────────────────────────────────────────────────────

describe('validateFreeBacWater — line-item shape rules', () => {
  it('rejects more than one $0 BAC item', () => {
    const result = validateFreeBacWater([validBacItem, validBacItem], true);

    expect(result).not.toBeNull();
    expect(result!.toLowerCase()).toContain('one');
  });

  it('rejects a quantity other than 1', () => {
    const result = validateFreeBacWater(
      [{ ...validBacItem, quantity: 2 }],
      true,
    );

    expect(result).not.toBeNull();
    expect(result!.toLowerCase()).toContain('one unit');
  });

  it('rejects a dosage other than 3ml (case-insensitive check)', () => {
    const result = validateFreeBacWater(
      [{ ...validBacItem, dosage: '10ml' }],
      true,
    );

    expect(result).not.toBeNull();
    expect(result!.toLowerCase()).toContain('3ml');
  });

  it('accepts dosage "3ML" (case-insensitive)', () => {
    const result = validateFreeBacWater(
      [{ ...validBacItem, dosage: '3ML' }],
      true,
    );

    expect(result).toBeNull();
  });

  it('rejects a missing dosage', () => {
    const result = validateFreeBacWater(
      [{ ...validBacItem, dosage: null }],
      true,
    );

    expect(result).not.toBeNull();
  });
});
