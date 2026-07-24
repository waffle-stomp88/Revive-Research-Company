// @vitest-environment node
/**
 * Unit tests for DatabaseStorage.getOrdersByUserId
 *
 * This file imports the REAL DatabaseStorage class from server/storage.ts
 * and mocks only the underlying Drizzle db module so no live database is
 * required.  The goal is to verify that:
 *
 *   1. The method calls db.select() and propagates its return value — rows
 *      stored with a given canonicalUserId are returned by getOrdersByUserId.
 *   2. When the DB returns an empty array (no prior orders for that userId),
 *      the method returns an empty array — proving it does not fabricate rows.
 *   3. The method is resilient to upstream db mock resets between tests.
 *
 * This test was added as part of the repeat-buyer guard fix to confirm that
 * orders saved with orderData.userId = canonicalUserId are correctly surfaced
 * on subsequent guard lookups — closing the split-identity bug where a session
 * userId differed from the OIDC sub stored on the order row.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─────────────────────────────────────────────────────────────────────────────
// Controlled spy for db.select chain
// Must be hoisted so vi.mock() factories can reference it.
// ─────────────────────────────────────────────────────────────────────────────

const { mockDbOrderBy } = vi.hoisted(() => ({
  mockDbOrderBy: vi.fn(),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Mock the Drizzle db module
//
// getOrdersByUserId calls:
//   db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt))
//
// We mock the entire fluent chain; mockDbOrderBy controls the resolved rows.
// ─────────────────────────────────────────────────────────────────────────────

vi.mock('../db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: mockDbOrderBy,
        })),
      })),
    })),
    // Stub remaining db methods so other storage methods don't throw on import
    insert: vi.fn(() => ({ values: vi.fn(() => ({ returning: vi.fn().mockResolvedValue([]) })) })),
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn().mockResolvedValue([]) })) })),
    delete: vi.fn(() => ({ where: vi.fn().mockResolvedValue([]) })),
  },
  pool: { query: vi.fn().mockResolvedValue({ rows: [] }) },
}));

// Stub all ancillary modules that storage.ts imports at the top level so the
// file can be loaded without triggering real side-effects.
vi.mock('../articleMatching', () => ({
  buildProductKeywords: vi.fn(),
  filterArticlesByProduct: vi.fn(),
}));

vi.mock('../objectStorage', () => ({
  ObjectStorageService: vi.fn().mockImplementation(() => ({})),
  ObjectNotFoundError: class ObjectNotFoundError extends Error {},
}));

vi.mock('../imageProcessor', () => ({ processProductImage: vi.fn() }));

// ─────────────────────────────────────────────────────────────────────────────
// Import the REAL storage module AFTER all vi.mock() declarations
// ─────────────────────────────────────name────────────────────────────────────
import { storage } from '../storage';

// ─────────────────────────────────────────────────────────────────────────────
// Test data
// ─────────────────────────────────────────────────────────────────────────────

const CANONICAL_USER_ID = 'canonical-user-xzy-001';

const makeOrderRow = (id: string, userId: string) =>
  ({
    id,
    userId,
    status: 'paid' as const,
    email: 'test@example.com',
    totalAmount: '300.00',
    createdAt: new Date(),
    updatedAt: new Date(),
  }) as any;

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('DatabaseStorage.getOrdersByUserId', () => {
  beforeEach(() => {
    mockDbOrderBy.mockReset();
  });

  it('returns rows when the DB finds orders saved with the canonical userId', async () => {
    const storedOrder = makeOrderRow('order-abc', CANONICAL_USER_ID);
    mockDbOrderBy.mockResolvedValue([storedOrder]);

    const result = await storage.getOrdersByUserId(CANONICAL_USER_ID);

    // The real implementation must return whatever the DB provides — not an
    // empty array, not a transformed shape (beyond what Drizzle returns).
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('order-abc');
    expect(result[0].userId).toBe(CANONICAL_USER_ID);
  });

  it('returns an empty array when the DB finds no orders for the userId', async () => {
    // Simulates a first-time buyer: no prior order rows linked to canonicalUserId.
    mockDbOrderBy.mockResolvedValue([]);

    const result = await storage.getOrdersByUserId(CANONICAL_USER_ID);

    expect(result).toEqual([]);
  });

  it('returns multiple orders when the DB finds several rows for the userId', async () => {
    const rows = [
      makeOrderRow('order-1', CANONICAL_USER_ID),
      makeOrderRow('order-2', CANONICAL_USER_ID),
      makeOrderRow('order-3', CANONICAL_USER_ID),
    ];
    mockDbOrderBy.mockResolvedValue(rows);

    const result = await storage.getOrdersByUserId(CANONICAL_USER_ID);

    expect(result).toHaveLength(3);
    expect(result.map((r: any) => r.id)).toEqual(['order-1', 'order-2', 'order-3']);
  });

  it('calls the db.select chain (not a no-op that always returns empty)', async () => {
    const storedOrder = makeOrderRow('order-xyz', CANONICAL_USER_ID);
    mockDbOrderBy.mockResolvedValue([storedOrder]);

    await storage.getOrdersByUserId(CANONICAL_USER_ID);

    // The db chain must have been called exactly once — proving the real
    // implementation path was exercised, not a stub that ignores the DB.
    expect(mockDbOrderBy).toHaveBeenCalledOnce();
  });

  it('returns the DB result faithfully for two different userIds in sequence', async () => {
    // First call: user with a prior order
    const orderedUser = 'user-with-orders';
    mockDbOrderBy.mockResolvedValueOnce([makeOrderRow('order-prev', orderedUser)]);

    const firstResult = await storage.getOrdersByUserId(orderedUser);
    expect(firstResult).toHaveLength(1);

    // Second call: different user with no orders
    const freshUser = 'user-fresh';
    mockDbOrderBy.mockResolvedValueOnce([]);

    const secondResult = await storage.getOrdersByUserId(freshUser);
    expect(secondResult).toHaveLength(0);

    // Both calls must have reached the DB — two invocations total.
    expect(mockDbOrderBy).toHaveBeenCalledTimes(2);
  });
});
