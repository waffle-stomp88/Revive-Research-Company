// @vitest-environment node
/**
 * Route-level tests for POST /api/orders/paypal
 *
 * Three correctness boundaries are guarded:
 *
 *   1. AUTHENTICATION GUARD — unauthenticated requests (no session userId)
 *      must receive 401 and never proceed to order creation. A future
 *      refactor that removes or moves the auth check will immediately
 *      fail this test.
 *
 *   2. BAC WATER PROMO INTEGRITY (repeat buyers) — repeat buyers must never
 *      receive the free 3ml BAC water promo. A $0-priced BAC water item
 *      submitted by a repeat buyer must be stripped from the sanitized items
 *      list so it does not appear in the created order.
 *
 *   3. BAC WATER PROMO PRESERVATION (first-time buyers) — a genuine
 *      first-time buyer's $0-priced 3ml BAC water item must survive
 *      sanitization and appear in fulfillmentNotes. A future refactor that
 *      accidentally removes the first-order grant will immediately fail this
 *      test.
 *
 * Implementation notes:
 *  - All external dependencies (DB, PayPal API, storage, email, etc.) are
 *    mocked via vi.mock so the tests run without a live database or network.
 *  - vi.hoisted() is used for spy handles referenced inside vi.mock()
 *    factories, which vitest hoists to the top of the file before variable
 *    declarations run.
 *  - The session is injected through a stub middleware (see mock for
 *    sessionAuth below). setTestSession() controls it per test.
 *  - The Express app is built once in beforeAll using the real registerRoutes
 *    so any future move of the auth check is caught automatically.
 */

import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import express from 'express';
import type { Express } from 'express';
import { createServer } from 'http';
import request from 'supertest';

// ─────────────────────────────────────────────────────────────────────────────
// Per-test session control
// ─────────────────────────────────────────────────────────────────────────────

let _testSessionUserId: string | null = null;
function setTestSession(userId: string | null): void {
  _testSessionUserId = userId;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hoisted spy handles — created before vi.mock() factories execute
// ─────────────────────────────────────────────────────────────────────────────

const {
  mockGetPaypalOrderDetails,
  mockCreateOrder,
  mockGetOrdersByUserId,
  mockHasRedeemedFirstOrderPromo,
  mockGetAllProducts,
  mockGetProductWithDosageStock,
  mockDbSelect,
  mockDbInsertReturning,
} = vi.hoisted(() => {
  // Shared spy for the terminal step of the promo INSERT chain:
  //   db.insert(firstOrderPromos).values(…).returning(…)
  // Default: resolves to a single promo row (simulates a successful INSERT).
  // Individual tests can override with .mockRejectedValueOnce() to simulate
  // a unique-constraint violation (PostgreSQL error code 23505) from the DB.
  const mockDbInsertReturning = vi.fn().mockResolvedValue([{ id: 'promo-slot-default' }]);

  return {
    mockGetPaypalOrderDetails: vi.fn(),
    mockCreateOrder: vi.fn().mockResolvedValue({
      id: 'order-stub-1',
      email: 'test@example.com',
    }),
    mockGetOrdersByUserId: vi.fn(),
    mockHasRedeemedFirstOrderPromo: vi.fn().mockResolvedValue(false),
    mockGetAllProducts: vi.fn(),
    mockGetProductWithDosageStock: vi.fn(),
    mockDbSelect: vi.fn(),
    mockDbInsertReturning,
  };
});

// ─────────────────────────────────────────────────────────────────────────────
// Module mocks — must be declared before any import of server code.
// vi.mock() calls are hoisted by vitest; factories run before imports.
// ─────────────────────────────────────────────────────────────────────────────

vi.mock('../sessionAuth', () => ({
  setupAuth: vi.fn((app: any) => {
    app.use((req: any, _res: any, next: any) => {
      req.session = { userId: _testSessionUserId };
      next();
    });
  }),
  isAuthenticated: vi.fn((_req: any, _res: any, next: any) => next()),
}));

vi.mock('../supabaseAuth', () => ({ verifySupabaseToken: vi.fn() }));

vi.mock('../stripeClient', () => ({
  getUncachableStripeClient: vi.fn(),
  getStripePublishableKey: vi.fn().mockReturnValue('pk_test_stub'),
}));

vi.mock('../objectStorage', () => ({
  ObjectStorageService: vi.fn().mockImplementation(() => ({})),
  ObjectNotFoundError: class ObjectNotFoundError extends Error {},
}));

vi.mock('../imageProcessor', () => ({ processProductImage: vi.fn() }));

vi.mock('../notifications', () => ({
  sendOrderNotifications: vi.fn().mockResolvedValue({}),
  getNotificationStatus: vi.fn().mockReturnValue({}),
}));

vi.mock('../zoho-campaigns', () => ({
  addContactToResearchList: vi.fn().mockResolvedValue({}),
  debugZohoNewsletter: vi.fn().mockResolvedValue({}),
  addContactToRestockSignups: vi.fn().mockResolvedValue({}),
}));

vi.mock('../restock-notifications', () => ({
  triggerRestockNotifications: vi.fn().mockResolvedValue({}),
}));

vi.mock('openai', () => {
  function OpenAIMock(this: any) {
    this.chat = { completions: { create: vi.fn() } };
  }
  return { default: OpenAIMock };
});

vi.mock('../email', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true }),
  sendOrderConfirmationEmail: vi.fn().mockResolvedValue({ success: true }),
  sendAdminOrderNotificationEmail: vi.fn().mockResolvedValue({ success: true }),
  sendShippedNotificationEmail: vi.fn().mockResolvedValue({ success: true }),
  sendNewsletterWelcomeEmail: vi.fn().mockResolvedValue({ success: true }),
  sendPreLaunchConfirmationEmail: vi.fn().mockResolvedValue({ success: true }),
  isEmailConfigured: vi.fn().mockReturnValue(false),
  getOrderConfirmationTemplate: vi.fn().mockReturnValue(''),
  getShippedNotificationTemplate: vi.fn().mockReturnValue(''),
  getAffiliateWelcomeTemplate: vi.fn().mockReturnValue(''),
  getAffiliateRejectionTemplate: vi.fn().mockReturnValue(''),
  getInviteEmailTemplate: vi.fn().mockReturnValue(''),
  sendInviteEmail: vi.fn().mockResolvedValue({ success: true }),
  sendRestockSignupConfirmationEmail: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('../paypal', () => ({
  getPaypalOrderDetails: mockGetPaypalOrderDetails,
  isPayPalSandbox: vi.fn().mockReturnValue(false),
  createPaypalOrder: vi.fn(),
  capturePaypalOrder: vi.fn(),
  loadPaypalDefault: vi.fn(),
  createPayPalSubscription: vi.fn(),
  cancelPayPalSubscription: vi.fn(),
  getOrCreateSubscriptionPlan: vi.fn(),
  getSubscriptionDiscounts: vi.fn().mockReturnValue([]),
  handlePayPalWebhook: vi.fn(),
  SUBSCRIPTION_DISCOUNTS: [],
}));

// Drizzle fluent-chain stub for the replay-attack check and promo inserts.
// The route does:
//   db.select({…}).from(table).where(eq(…)).limit(1)          — replay-attack guard
//   await db.insert(firstOrderPromos).values(…).returning(…)  — optimistic promo lock
//   db.update(…).set(…).where(…).catch(…)                     — orderId back-fill
//   db.delete(…).where(…).catch(…)                            — compensating delete on order failure
// mockDbSelect is a hoisted spy so individual tests can override its return
// value to simulate a pre-existing order (replay) or a clean slate.
// The global beforeEach (below) resets it to the "no existing order" default.
vi.mock('../db', () => ({
  db: {
    select: mockDbSelect,
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: mockDbInsertReturning,
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          catch: vi.fn().mockResolvedValue(undefined),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => ({
        catch: vi.fn().mockResolvedValue(undefined),
      })),
    })),
  },
  pool: { query: vi.fn() },
}));

vi.mock('../storage', () => ({
  storage: {
    createOrder: mockCreateOrder,
    getOrdersByUserId: mockGetOrdersByUserId,
    hasRedeemedFirstOrderPromo: mockHasRedeemedFirstOrderPromo,
    getAllProducts: mockGetAllProducts,
    getProductWithDosageStock: mockGetProductWithDosageStock,
    validateStock: vi.fn().mockResolvedValue({ valid: true, errors: [] }),
    decrementStock: vi.fn().mockResolvedValue({ success: true, errors: [] }),
    updateOrderEmailStatus: vi.fn().mockResolvedValue({}),
    // Stubs for other route handlers — not exercised by these tests
    getProducts: vi.fn().mockResolvedValue([]),
    getProductBySlug: vi.fn().mockResolvedValue(null),
    getProductById: vi.fn().mockResolvedValue(null),
    getOrders: vi.fn().mockResolvedValue([]),
    getOrderById: vi.fn().mockResolvedValue(null),
    updateOrder: vi.fn().mockResolvedValue(null),
    createContact: vi.fn().mockResolvedValue({}),
    getContacts: vi.fn().mockResolvedValue([]),
    getAffiliates: vi.fn().mockResolvedValue([]),
    getAffiliate: vi.fn().mockResolvedValue(null),
    getNewsletterSubscribers: vi.fn().mockResolvedValue([]),
    createNewsletterSubscriber: vi.fn().mockResolvedValue({}),
    getUserById: vi.fn().mockResolvedValue(null),
    getOrdersByEmail: vi.fn().mockResolvedValue([]),
    getSavedStacks: vi.fn().mockResolvedValue([]),
    createSavedStack: vi.fn().mockResolvedValue({}),
    deleteSavedStack: vi.fn().mockResolvedValue(null),
    updateSavedStack: vi.fn().mockResolvedValue(null),
    getDiscountCodeByCode: vi.fn().mockResolvedValue(null),
    incrementDiscountCodeUsage: vi.fn().mockResolvedValue(null),
    getDiscountCodes: vi.fn().mockResolvedValue([]),
    createDiscountCode: vi.fn().mockResolvedValue({}),
    updateDiscountCode: vi.fn().mockResolvedValue(null),
    deleteDiscountCode: vi.fn().mockResolvedValue(null),
  },
  resolveDisplayPrice: vi.fn().mockReturnValue({ price: 300, currency: 'USD' }),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Import real registerRoutes AFTER all vi.mock() declarations
// ─────────────────────────────────────────────────────────────────────────────

import { registerRoutes } from '../routes';

// ─────────────────────────────────────────────────────────────────────────────
// Test app — built once; session stub reads _testSessionUserId per request
// ─────────────────────────────────────────────────────────────────────────────

let app: Express;

beforeAll(async () => {
  app = express();
  app.use(express.json());
  const httpServer = createServer(app);
  await registerRoutes(httpServer, app);
});

// ─────────────────────────────────────────────────────────────────────────────
// Global default for the Drizzle db.select chain.
// Every test suite starts with "no pre-existing order" so the replay-attack
// guard is a no-op by default. Suite 10 overrides this per test.
// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockDbSelect.mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue([]),
      }),
    }),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Request body factory
// ─────────────────────────────────────────────────────────────────────────────

const BPC157_ID = 'bpc157-prod-1';
const BAC_WATER_ID = 'bac-water-prod-1';

function buildPaypalBody(overrides: Record<string, unknown> = {}) {
  return {
    paypalOrderId: 'PAYPALTESTORDER001',
    paypalPayerId: 'PAYER001',
    customerEmail: 'test@example.com',
    customerName: 'Test Researcher',
    shippingAddress: {
      street: '123 Lab Lane',
      city: 'Testville',
      state: '',
      zip: '90210',
      country: 'USA',
    },
    items: [
      {
        productId: BPC157_ID,
        name: 'BPC-157',
        dosage: '5mg',
        quantity: 1,
        price: '300',
      },
    ],
    subtotal: '300',
    shipping: '0',
    tax: '0',
    total: '300',
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 — Authentication guard
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/orders/paypal — authentication guard', () => {
  beforeEach(() => {
    // Return a COMPLETED USD order so the route reaches the auth check
    // rather than failing earlier on payment-verification steps.
    mockGetPaypalOrderDetails.mockResolvedValue({
      status: 'COMPLETED',
      currency: 'USD',
      capturedAmount: 300,
    });
    mockCreateOrder.mockClear();
  });

  it('returns 401 when the request has no authenticated session', async () => {
    setTestSession(null);

    const res = await request(app)
      .post('/api/orders/paypal')
      .set('Content-Type', 'application/json')
      .send(buildPaypalBody());

    expect(res.status).toBe(401);
    expect(typeof res.body.error).toBe('string');
    expect(res.body.error.toLowerCase()).toContain('authentication required');
  });

  it('never calls createOrder when the session is absent', async () => {
    setTestSession(null);

    await request(app)
      .post('/api/orders/paypal')
      .set('Content-Type', 'application/json')
      .send(buildPaypalBody());

    expect(mockCreateOrder).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 2 — BAC water promo integrity for repeat buyers
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/orders/paypal — BAC water promo blocked for repeat buyers', () => {
  beforeEach(() => {
    setTestSession('user-repeat-buyer');

    // Repeat buyer: has at least one prior completed order
    mockGetOrdersByUserId.mockResolvedValue([{ id: 'prior-order-abc' }]);
    mockHasRedeemedFirstOrderPromo.mockResolvedValue(false);

    // Product catalogue includes BAC water
    mockGetAllProducts.mockResolvedValue([
      {
        id: BAC_WATER_ID,
        slug: 'bacteriostatic-water',
        name: 'Bacteriostatic Water',
      },
      { id: BPC157_ID, slug: 'bpc-157', name: 'BPC-157' },
    ]);

    // BPC-157: $300 per 5 mg vial (above $250 free-shipping threshold → $0 shipping)
    mockGetProductWithDosageStock.mockResolvedValue({
      id: BPC157_ID,
      name: 'BPC-157',
      price: '300',
      dosageStocks: [{ dosage: '5mg', price: '300', stock: 100 }],
    });

    // PayPal captured $300. The $0 BAC water item is a promo-abuse attempt
    // from a repeat buyer — the guard must reject the request before any
    // order is created.
    mockGetPaypalOrderDetails.mockResolvedValue({
      status: 'COMPLETED',
      currency: 'USD',
      capturedAmount: 300,
    });

    mockCreateOrder.mockClear();
  });

  it('rejects with 400 when a repeat buyer attempts the first-order free BAC water promo', async () => {
    const body = buildPaypalBody({
      items: [
        {
          productId: BPC157_ID,
          name: 'BPC-157',
          dosage: '5mg',
          quantity: 1,
          price: '300',
        },
        {
          // Repeat buyer attempting to claim the first-order free promo
          productId: BAC_WATER_ID,
          name: 'Bacteriostatic Water',
          dosage: '3ml',
          quantity: 1,
          price: '0',
        },
      ],
      total: '300',
    });

    const res = await request(app)
      .post('/api/orders/paypal')
      .set('Content-Type', 'application/json')
      .send(body);

    // The guard must hard-reject the request — not silently strip the item.
    // The buyer's original PayPal order included a $0 BAC water that was
    // already captured, so the only safe action is to reject the confirmation
    // and surface an error the frontend can show.
    expect(res.status).toBe(400);
    expect(typeof res.body.error).toBe('string');
    expect(res.body.error.toLowerCase()).toContain('first order');
  });

  it('never calls createOrder when the repeat-buyer BAC water guard fires', async () => {
    const body = buildPaypalBody({
      items: [
        {
          productId: BPC157_ID,
          name: 'BPC-157',
          dosage: '5mg',
          quantity: 1,
          price: '300',
        },
        {
          productId: BAC_WATER_ID,
          name: 'Bacteriostatic Water',
          dosage: '3ml',
          quantity: 1,
          price: '0',
        },
      ],
      total: '300',
    });

    await request(app)
      .post('/api/orders/paypal')
      .set('Content-Type', 'application/json')
      .send(body);

    expect(mockCreateOrder).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 3 — BAC water promo preserved for first-time buyers (3ml only)
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/orders/paypal — BAC water promo preserved for first-time buyers', () => {
  beforeEach(() => {
    setTestSession('user-first-time-buyer');

    // First-time buyer: zero prior orders and promo not yet redeemed
    mockGetOrdersByUserId.mockResolvedValue([]);
    mockHasRedeemedFirstOrderPromo.mockResolvedValue(false);

    // Product catalogue includes BAC water
    mockGetAllProducts.mockResolvedValue([
      {
        id: BAC_WATER_ID,
        slug: 'bacteriostatic-water',
        name: 'Bacteriostatic Water',
      },
      { id: BPC157_ID, slug: 'bpc-157', name: 'BPC-157' },
    ]);

    // BPC-157: $300 per 5 mg vial (above $250 free-shipping threshold → $0 shipping)
    mockGetProductWithDosageStock.mockResolvedValue({
      id: BPC157_ID,
      name: 'BPC-157',
      price: '300',
      dosageStocks: [{ dosage: '5mg', price: '300', stock: 100 }],
    });

    // PayPal captured $300. The $0 BAC water item is legitimately free on a
    // first order, so the captured amount correctly excludes it.
    mockGetPaypalOrderDetails.mockResolvedValue({
      status: 'COMPLETED',
      currency: 'USD',
      capturedAmount: 300,
    });

    mockCreateOrder.mockClear();
  });

  it('accepts the order (201) and keeps the $0 BAC water in the created record', async () => {
    const body = buildPaypalBody({
      items: [
        {
          productId: BPC157_ID,
          name: 'BPC-157',
          dosage: '5mg',
          quantity: 1,
          price: '300',
        },
        {
          // Legitimate first-order free promo — must NOT be stripped
          productId: BAC_WATER_ID,
          name: 'Bacteriostatic Water',
          dosage: '3ml',
          quantity: 1,
          price: '0',
        },
      ],
      total: '300',
    });

    const res = await request(app)
      .post('/api/orders/paypal')
      .set('Content-Type', 'application/json')
      .send(body);

    expect(res.status).toBe(201);

    // createOrder must have been called exactly once
    expect(mockCreateOrder).toHaveBeenCalledOnce();

    // fulfillmentNotes is the authoritative record of what was ordered.
    // The free BAC water MUST still be present — it is a legitimate line item
    // for a first-time buyer.
    const orderArg = mockCreateOrder.mock.calls[0][0];
    expect(orderArg.fulfillmentNotes).toBeDefined();
    expect(orderArg.fulfillmentNotes).toContain('Bacteriostatic Water');
    expect(orderArg.fulfillmentNotes).toContain('BPC-157');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 4 — BAC water quantity cap: only 1 unit free for first-time buyers
//
// The guard enforces that a $0-priced BAC water line item must have quantity
// exactly 1.  If a buyer submits quantity > 1 at $0, the server rejects with
// 400 ("limited to one unit"). The promo can only be claimed via a single
// qty-1 $0 line; ordering additional units requires separate paid line items.
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/orders/paypal — BAC water quantity cap (multi-unit, first-time buyer)', () => {
  const BAC_WATER_CATALOGUE_PRICE = 20;

  beforeEach(() => {
    setTestSession('user-first-time-buyer-multiunit');

    // First-time buyer: zero prior orders and promo not yet redeemed
    mockGetOrdersByUserId.mockResolvedValue([]);
    mockHasRedeemedFirstOrderPromo.mockResolvedValue(false);

    mockGetAllProducts.mockResolvedValue([
      {
        id: BAC_WATER_ID,
        slug: 'bacteriostatic-water',
        name: 'Bacteriostatic Water',
      },
      { id: BPC157_ID, slug: 'bpc-157', name: 'BPC-157' },
    ]);

    mockGetProductWithDosageStock.mockResolvedValue({
      id: BAC_WATER_ID,
      name: 'Bacteriostatic Water',
      price: String(BAC_WATER_CATALOGUE_PRICE),
      dosageStocks: [
        { dosage: '3ml', price: String(BAC_WATER_CATALOGUE_PRICE), stock: 100 },
      ],
    });

    mockGetPaypalOrderDetails.mockResolvedValue({
      status: 'COMPLETED',
      currency: 'USD',
      capturedAmount: 300,
    });

    mockCreateOrder.mockClear();
  });

  it('rejects with 400 when a first-time buyer submits qty=2 at $0 (only 1 free unit allowed)', async () => {
    // The buyer tries to claim 2 free BAC water units in a single $0 line item.
    // The guard requires quantity === 1 for the complimentary unit; qty=2 at $0
    // triggers "Complimentary BAC water is limited to one unit".
    const body = buildPaypalBody({
      items: [
        {
          productId: BPC157_ID,
          name: 'BPC-157',
          dosage: '5mg',
          quantity: 1,
          price: '300',
        },
        {
          productId: BAC_WATER_ID,
          name: 'Bacteriostatic Water',
          dosage: '3ml',
          quantity: 2,
          price: '0',
        },
      ],
      total: '300',
    });

    const res = await request(app)
      .post('/api/orders/paypal')
      .set('Content-Type', 'application/json')
      .send(body);

    expect(res.status).toBe(400);
    expect(typeof res.body.error).toBe('string');
    expect(res.body.error.toLowerCase()).toContain('one unit');
  });

  it('accepts when a first-time buyer submits qty=1 at $0 plus additional paid units', async () => {
    // Correct usage: one free qty-1 $0 line, plus a separate paid BAC water line.
    // This is how the promo + extra units are legitimately structured in the cart.
    mockGetProductWithDosageStock.mockImplementation(async (productId: string) => {
      if (productId === BPC157_ID) {
        return {
          id: BPC157_ID,
          name: 'BPC-157',
          price: '300',
          dosageStocks: [{ dosage: '5mg', price: '300', stock: 100 }],
        };
      }
      return {
        id: BAC_WATER_ID,
        name: 'Bacteriostatic Water',
        price: String(BAC_WATER_CATALOGUE_PRICE),
        dosageStocks: [{ dosage: '3ml', price: String(BAC_WATER_CATALOGUE_PRICE), stock: 100 }],
      };
    });

    // PayPal captured: $300 BPC-157 + $20 paid BAC water = $320, free-shipping threshold exceeded
    mockGetPaypalOrderDetails.mockResolvedValue({
      status: 'COMPLETED',
      currency: 'USD',
      capturedAmount: 320,
    });

    const body = buildPaypalBody({
      items: [
        {
          productId: BPC157_ID,
          name: 'BPC-157',
          dosage: '5mg',
          quantity: 1,
          price: '300',
        },
        {
          // Legitimate single free unit
          productId: BAC_WATER_ID,
          name: 'Bacteriostatic Water',
          dosage: '3ml',
          quantity: 1,
          price: '0',
        },
        {
          // Additional paid unit — not part of the promo
          productId: BAC_WATER_ID,
          name: 'Bacteriostatic Water',
          dosage: '3ml',
          quantity: 1,
          price: String(BAC_WATER_CATALOGUE_PRICE),
        },
      ],
      subtotal: String(300 + BAC_WATER_CATALOGUE_PRICE),
      shipping: '0',
      tax: '0',
      total: String(300 + BAC_WATER_CATALOGUE_PRICE),
    });

    const res = await request(app)
      .post('/api/orders/paypal')
      .set('Content-Type', 'application/json')
      .send(body);

    expect(res.status).toBe(201);
    expect(mockCreateOrder).toHaveBeenCalledOnce();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 5 (new) — Server-computed totalAmount stored on order, not client total
//
// Guards against the scenario where a client submits a `total` that does not
// match the authoritative server-side computation (e.g. because the client
// cart included a $0 BAC water that was stripped, or any other price tamper).
// The stored `totalAmount` must always equal what the server computed, not what
// the client sent.
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/orders/paypal — totalAmount is server-computed, not client-submitted', () => {
  beforeEach(() => {
    setTestSession('user-total-integrity');

    // Repeat buyer — no promo entitlements
    mockGetOrdersByUserId.mockResolvedValue([{ id: 'prior-order-xyz' }]);
    mockHasRedeemedFirstOrderPromo.mockResolvedValue(false);

    mockGetAllProducts.mockResolvedValue([
      { id: BPC157_ID, slug: 'bpc-157', name: 'BPC-157' },
    ]);

    // BPC-157: $300 per 5 mg vial; subtotal $300 → above $250 → free shipping
    mockGetProductWithDosageStock.mockResolvedValue({
      id: BPC157_ID,
      name: 'BPC-157',
      price: '300',
      dosageStocks: [{ dosage: '5mg', price: '300', stock: 100 }],
    });

    // PayPal captured $300, which matches the server-computed total.
    mockGetPaypalOrderDetails.mockResolvedValue({
      status: 'COMPLETED',
      currency: 'USD',
      capturedAmount: 300,
    });

    mockCreateOrder.mockClear();
  });

  it('stores the server-computed total even when the client submits a different total', async () => {
    // Client submits total: '999' — an inflated (or deflated) value.
    // The server must ignore this and store serverTotal instead.
    const body = buildPaypalBody({
      items: [
        {
          productId: BPC157_ID,
          name: 'BPC-157',
          dosage: '5mg',
          quantity: 1,
          price: '300',
        },
      ],
      subtotal: '999',
      shipping: '0',
      tax: '0',
      total: '999',
    });

    const res = await request(app)
      .post('/api/orders/paypal')
      .set('Content-Type', 'application/json')
      .send(body);

    // Order should succeed — the captured PayPal amount ($300) exceeds the
    // server-computed total ($300), so verification passes.
    expect(res.status).toBe(201);
    expect(mockCreateOrder).toHaveBeenCalledOnce();

    // The critical assertion: stored totalAmount must be the server-computed
    // value ($300.00), not the client-submitted value ($999).
    const orderArg = mockCreateOrder.mock.calls[0][0];
    expect(orderArg.totalAmount).toBe('300.00');
    expect(orderArg.totalAmount).not.toBe('999');
  });

  it('stores the server-computed total when the client submits the correct value too', async () => {
    // Happy path: client and server agree. The stored value still comes from
    // the server (the test just confirms it ends up as the expected amount).
    const body = buildPaypalBody({
      items: [
        {
          productId: BPC157_ID,
          name: 'BPC-157',
          dosage: '5mg',
          quantity: 1,
          price: '300',
        },
      ],
      subtotal: '300',
      shipping: '0',
      tax: '0',
      total: '300',
    });

    const res = await request(app)
      .post('/api/orders/paypal')
      .set('Content-Type', 'application/json')
      .send(body);

    expect(res.status).toBe(201);
    expect(mockCreateOrder).toHaveBeenCalledOnce();

    const orderArg = mockCreateOrder.mock.calls[0][0];
    expect(orderArg.totalAmount).toBe('300.00');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 6 — Non-3ml BAC water at $0 is rejected, even for first-time buyers
//
// The promo is exclusive to the 3ml SKU. Any $0 BAC water item with a
// different dosage (e.g. 10ml) must be rejected with 400 rather than silently
// passed through — the dosage check is enforced by validateFreeBacWater.
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/orders/paypal — non-3ml BAC water at $0 is rejected for first-time buyers', () => {
  beforeEach(() => {
    setTestSession('user-first-time-buyer-10ml');

    // First-time buyer: zero prior orders and promo not yet redeemed
    mockGetOrdersByUserId.mockResolvedValue([]);
    mockHasRedeemedFirstOrderPromo.mockResolvedValue(false);

    mockGetAllProducts.mockResolvedValue([
      {
        id: BAC_WATER_ID,
        slug: 'bacteriostatic-water',
        name: 'Bacteriostatic Water',
      },
      { id: BPC157_ID, slug: 'bpc-157', name: 'BPC-157' },
    ]);

    mockGetProductWithDosageStock.mockResolvedValue({
      id: BPC157_ID,
      name: 'BPC-157',
      price: '300',
      dosageStocks: [{ dosage: '5mg', price: '300', stock: 100 }],
    });

    mockGetPaypalOrderDetails.mockResolvedValue({
      status: 'COMPLETED',
      currency: 'USD',
      capturedAmount: 300,
    });

    mockCreateOrder.mockClear();
  });

  it('rejects with 400 when a first-time buyer submits a $0 10ml BAC water (only 3ml is eligible)', async () => {
    const body = buildPaypalBody({
      items: [
        {
          productId: BPC157_ID,
          name: 'BPC-157',
          dosage: '5mg',
          quantity: 1,
          price: '300',
        },
        {
          // First-time buyer trying to get a 10ml BAC water for free.
          // Only the 3ml SKU qualifies — this must be rejected, not passed through.
          productId: BAC_WATER_ID,
          name: 'Bacteriostatic Water',
          dosage: '10ml',
          quantity: 1,
          price: '0',
        },
      ],
      total: '300',
    });

    const res = await request(app)
      .post('/api/orders/paypal')
      .set('Content-Type', 'application/json')
      .send(body);

    expect(res.status).toBe(400);
    expect(typeof res.body.error).toBe('string');
    expect(res.body.error.toLowerCase()).toContain('3ml');
  });

  it('never calls createOrder when the non-3ml dosage guard fires', async () => {
    const body = buildPaypalBody({
      items: [
        {
          productId: BPC157_ID,
          name: 'BPC-157',
          dosage: '5mg',
          quantity: 1,
          price: '300',
        },
        {
          productId: BAC_WATER_ID,
          name: 'Bacteriostatic Water',
          dosage: '10ml',
          quantity: 1,
          price: '0',
        },
      ],
      total: '300',
    });

    await request(app)
      .post('/api/orders/paypal')
      .set('Content-Type', 'application/json')
      .send(body);

    expect(mockCreateOrder).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 7 — BAC water split-line attack: two separate $0 lines
//
// A savvy buyer could attempt to game the promo by submitting two *separate*
// cart line items (each qty=1, price=$0) for the same BAC water product.
// The server counts ALL zero-priced BAC items before calling the guard.
// Two $0 lines yields zeroPricedBacItems.length = 2, which triggers the
// "only one complimentary item" rule and returns 400 before any order is
// created — no items are stripped or silently passed through.
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/orders/paypal — BAC water split-line attack rejected (first-time buyer)', () => {
  beforeEach(() => {
    setTestSession('user-first-time-buyer-splitline');

    // First-time buyer: zero prior orders and promo not yet redeemed
    mockGetOrdersByUserId.mockResolvedValue([]);
    mockHasRedeemedFirstOrderPromo.mockResolvedValue(false);

    mockGetAllProducts.mockResolvedValue([
      {
        id: BAC_WATER_ID,
        slug: 'bacteriostatic-water',
        name: 'Bacteriostatic Water',
      },
      { id: BPC157_ID, slug: 'bpc-157', name: 'BPC-157' },
    ]);

    mockGetProductWithDosageStock.mockResolvedValue({
      id: BPC157_ID,
      name: 'BPC-157',
      price: '300',
      dosageStocks: [{ dosage: '5mg', price: '300', stock: 100 }],
    });

    mockGetPaypalOrderDetails.mockResolvedValue({
      status: 'COMPLETED',
      currency: 'USD',
      capturedAmount: 300,
    });

    mockCreateOrder.mockClear();
  });

  it('rejects with 400 when a first-time buyer submits two separate $0 BAC water lines', async () => {
    const body = buildPaypalBody({
      items: [
        {
          productId: BPC157_ID,
          name: 'BPC-157',
          dosage: '5mg',
          quantity: 1,
          price: '300',
        },
        {
          // First $0 BAC water line
          productId: BAC_WATER_ID,
          name: 'Bacteriostatic Water',
          dosage: '3ml',
          quantity: 1,
          price: '0',
        },
        {
          // Second $0 BAC water line — split-line attack attempt
          productId: BAC_WATER_ID,
          name: 'Bacteriostatic Water',
          dosage: '3ml',
          quantity: 1,
          price: '0',
        },
      ],
      total: '300',
    });

    const res = await request(app)
      .post('/api/orders/paypal')
      .set('Content-Type', 'application/json')
      .send(body);

    // Both $0 lines are counted before the guard runs; count=2 triggers the
    // "only one complimentary item" rejection path.
    expect(res.status).toBe(400);
    expect(typeof res.body.error).toBe('string');
    expect(res.body.error.toLowerCase()).toContain('one');
  });

  it('never calls createOrder when the split-line attack is detected', async () => {
    const body = buildPaypalBody({
      items: [
        {
          productId: BPC157_ID,
          name: 'BPC-157',
          dosage: '5mg',
          quantity: 1,
          price: '300',
        },
        {
          productId: BAC_WATER_ID,
          name: 'Bacteriostatic Water',
          dosage: '3ml',
          quantity: 1,
          price: '0',
        },
        {
          productId: BAC_WATER_ID,
          name: 'Bacteriostatic Water',
          dosage: '3ml',
          quantity: 1,
          price: '0',
        },
      ],
      total: '300',
    });

    await request(app)
      .post('/api/orders/paypal')
      .set('Content-Type', 'application/json')
      .send(body);

    expect(mockCreateOrder).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 8 (NEW) — canonicalUserId order-linking: guard reads the same userId
//                 that was stored on the first order
//
// The fix that sets orderData.userId = canonicalUserId ensures that
// getOrdersByUserId(canonicalUserId) finds the first order on the second
// attempt. This suite verifies the end-to-end behaviour:
//
//   1. The route calls getOrdersByUserId with the *canonical* user ID
//      (session userId when no OIDC sub is present).
//   2. When that call returns a prior order, a second free-BAC-water attempt
//      is rejected with 400 — proving the guard is actually dual.
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/orders/paypal — repeat-buyer guard uses canonicalUserId from order-linking fix', () => {
  const CANONICAL_USER_ID = 'canonical-user-abc';

  beforeEach(() => {
    // Session userId = canonicalUserId (no OIDC sub in this test environment)
    setTestSession(CANONICAL_USER_ID);

    mockGetAllProducts.mockResolvedValue([
      {
        id: BAC_WATER_ID,
        slug: 'bacteriostatic-water',
        name: 'Bacteriostatic Water',
      },
      { id: BPC157_ID, slug: 'bpc-157', name: 'BPC-157' },
    ]);

    mockGetProductWithDosageStock.mockResolvedValue({
      id: BPC157_ID,
      name: 'BPC-157',
      price: '300',
      dosageStocks: [{ dosage: '5mg', price: '300', stock: 100 }],
    });

    mockGetPaypalOrderDetails.mockResolvedValue({
      status: 'COMPLETED',
      currency: 'USD',
      capturedAmount: 300,
    });

    mockCreateOrder.mockClear();
    mockGetOrdersByUserId.mockReset();
    mockHasRedeemedFirstOrderPromo.mockResolvedValue(false);
  });

  it('rejects with 400 when getOrdersByUserId(canonicalUserId) returns a prior order', async () => {
    // Simulate: the first order was saved with userId = canonicalUserId.
    // The guard calls getOrdersByUserId(canonicalUserId) and finds it.
    mockGetOrdersByUserId.mockResolvedValue([{ id: 'first-order-linked-to-canonical' }]);

    const body = buildPaypalBody({
      items: [
        {
          productId: BPC157_ID,
          name: 'BPC-157',
          dosage: '5mg',
          quantity: 1,
          price: '300',
        },
        {
          // Second attempt at the first-order BAC water promo
          productId: BAC_WATER_ID,
          name: 'Bacteriostatic Water',
          dosage: '3ml',
          quantity: 1,
          price: '0',
        },
      ],
      total: '300',
    });

    const res = await request(app)
      .post('/api/orders/paypal')
      .set('Content-Type', 'application/json')
      .send(body);

    // The guard must detect the prior order and reject the second attempt.
    expect(res.status).toBe(400);
    expect(typeof res.body.error).toBe('string');
    expect(res.body.error.toLowerCase()).toContain('first order');
  });

  it('calls getOrdersByUserId with the canonical user ID (same ID stored on the order)', async () => {
    // Return a prior order so the guard fires and we can inspect the call args.
    mockGetOrdersByUserId.mockResolvedValue([{ id: 'first-order-linked-to-canonical' }]);

    const body = buildPaypalBody({
      items: [
        {
          productId: BPC157_ID,
          name: 'BPC-157',
          dosage: '5mg',
          quantity: 1,
          price: '300',
        },
        {
          productId: BAC_WATER_ID,
          name: 'Bacteriostatic Water',
          dosage: '3ml',
          quantity: 1,
          price: '0',
        },
      ],
      total: '300',
    });

    await request(app)
      .post('/api/orders/paypal')
      .set('Content-Type', 'application/json')
      .send(body);

    // The route MUST look up prior orders by canonicalUserId — the same ID
    // written to orderData.userId on the first order. Any split-identity bug
    // (looking up by a different ID) would make this assertion fail.
    expect(mockGetOrdersByUserId).toHaveBeenCalledWith(CANONICAL_USER_ID);
  });

  it('allows the promo when getOrdersByUserId(canonicalUserId) returns no prior orders', async () => {
    // No prior orders for this canonical user — they are a genuine first-time buyer.
    mockGetOrdersByUserId.mockResolvedValue([]);

    const body = buildPaypalBody({
      items: [
        {
          productId: BPC157_ID,
          name: 'BPC-157',
          dosage: '5mg',
          quantity: 1,
          price: '300',
        },
        {
          productId: BAC_WATER_ID,
          name: 'Bacteriostatic Water',
          dosage: '3ml',
          quantity: 1,
          price: '0',
        },
      ],
      total: '300',
    });

    const res = await request(app)
      .post('/api/orders/paypal')
      .set('Content-Type', 'application/json')
      .send(body);

    // First-time buyer with a valid promo: order must succeed.
    expect(res.status).toBe(201);
    expect(mockCreateOrder).toHaveBeenCalledOnce();

    // The created order must be linked to the canonical user ID so that
    // future getOrdersByUserId(canonicalUserId) calls find this order.
    const orderArg = mockCreateOrder.mock.calls[0][0];
    expect(orderArg.userId).toBe(CANONICAL_USER_ID);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 9 (NEW) — storage.getOrdersByUserId lookup behaviour
//
// Verifies that the route correctly delegates the repeat-buyer lookup to
// storage.getOrdersByUserId and uses its return value to gate the promo.
// This acts as a unit-level contract for the guard ↔ storage integration:
// if getOrdersByUserId returns a non-empty array, the promo must be blocked;
// if it returns an empty array (and hasRedeemedFirstOrderPromo is false),
// the promo must be allowed.
// ─────────────────────────────────────────────────────────────────────────────

describe('storage.getOrdersByUserId — rows saved with canonicalUserId are found on lookup', () => {
  const USER_WITH_ORDERS = 'user-with-prior-orders';
  const USER_WITHOUT_ORDERS = 'user-without-prior-orders';

  const bacWaterBody = (userId: string) => {
    setTestSession(userId);
    return buildPaypalBody({
      items: [
        {
          productId: BPC157_ID,
          name: 'BPC-157',
          dosage: '5mg',
          quantity: 1,
          price: '300',
        },
        {
          productId: BAC_WATER_ID,
          name: 'Bacteriostatic Water',
          dosage: '3ml',
          quantity: 1,
          price: '0',
        },
      ],
      total: '300',
    });
  };

  beforeEach(() => {
    mockGetAllProducts.mockResolvedValue([
      {
        id: BAC_WATER_ID,
        slug: 'bacteriostatic-water',
        name: 'Bacteriostatic Water',
      },
      { id: BPC157_ID, slug: 'bpc-157', name: 'BPC-157' },
    ]);

    mockGetProductWithDosageStock.mockResolvedValue({
      id: BPC157_ID,
      name: 'BPC-157',
      price: '300',
      dosageStocks: [{ dosage: '5mg', price: '300', stock: 100 }],
    });

    mockGetPaypalOrderDetails.mockResolvedValue({
      status: 'COMPLETED',
      currency: 'USD',
      capturedAmount: 300,
    });

    mockHasRedeemedFirstOrderPromo.mockResolvedValue(false);
    mockGetOrdersByUserId.mockReset();
    mockCreateOrder.mockClear();
  });

  it('blocks the promo (400) when getOrdersByUserId returns a row for the canonical userId', async () => {
    // getOrdersByUserId returns a prior order only for USER_WITH_ORDERS —
    // simulating a row that was saved with userId = canonicalUserId.
    mockGetOrdersByUserId.mockImplementation(async (uid: string) =>
      uid === USER_WITH_ORDERS ? [{ id: 'stored-order-1' }] : []
    );

    const res = await request(app)
      .post('/api/orders/paypal')
      .set('Content-Type', 'application/json')
      .send(bacWaterBody(USER_WITH_ORDERS));

    expect(res.status).toBe(400);
    expect(mockGetOrdersByUserId).toHaveBeenCalledWith(USER_WITH_ORDERS);
  });

  it('allows the promo (201) when getOrdersByUserId returns no rows for the canonical userId', async () => {
    // getOrdersByUserId returns empty for USER_WITHOUT_ORDERS — first-time buyer.
    mockGetOrdersByUserId.mockResolvedValue([]);

    const res = await request(app)
      .post('/api/orders/paypal')
      .set('Content-Type', 'application/json')
      .send(bacWaterBody(USER_WITHOUT_ORDERS));

    expect(res.status).toBe(201);
    expect(mockGetOrdersByUserId).toHaveBeenCalledWith(USER_WITHOUT_ORDERS);
  });

  it('blocks the promo when hasRedeemedFirstOrderPromo is true even if order history is empty', async () => {
    // Backstop check: the firstOrderPromos table records the redemption even
    // if the order row's userId was somehow not set (pre-fix edge case).
    mockGetOrdersByUserId.mockResolvedValue([]);
    mockHasRedeemedFirstOrderPromo.mockResolvedValue(true);

    const res = await request(app)
      .post('/api/orders/paypal')
      .set('Content-Type', 'application/json')
      .send(bacWaterBody(USER_WITHOUT_ORDERS));

    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 10 — Duplicate-order replay-attack guard
//
// The route checks the database for an existing order with the same
// paypalOrderId before doing anything else (after field validation). If a row
// already exists the route must return 409 and must NOT call createOrder.
//
// Two scenarios are tested:
//   A. Replay: the db select returns an existing order row → 409, no insert.
//   B. Fresh:  the db select returns [] (new order ID)   → proceeds normally.
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/orders/paypal — duplicate-order replay-attack guard', () => {
  const DUPLICATE_ORDER_ID = 'PAYPAL-ALREADY-FINALIZED-001';
  const FRESH_ORDER_ID = 'PAYPAL-FRESH-ORDER-002';

  beforeEach(() => {
    setTestSession('user-replay-test');

    // Authenticated repeat buyer (no promo concerns — these tests focus purely
    // on the paypalOrderId uniqueness check that runs before promo logic).
    mockGetOrdersByUserId.mockResolvedValue([{ id: 'prior-order-irrelevant' }]);
    mockHasRedeemedFirstOrderPromo.mockResolvedValue(false);

    mockGetAllProducts.mockResolvedValue([
      { id: BPC157_ID, slug: 'bpc-157', name: 'BPC-157' },
    ]);

    mockGetProductWithDosageStock.mockResolvedValue({
      id: BPC157_ID,
      name: 'BPC-157',
      price: '300',
      dosageStocks: [{ dosage: '5mg', price: '300', stock: 100 }],
    });

    mockGetPaypalOrderDetails.mockResolvedValue({
      status: 'COMPLETED',
      currency: 'USD',
      capturedAmount: 300,
    });

    mockCreateOrder.mockClear();
  });

  it('returns 409 when the paypalOrderId is already recorded in the database', async () => {
    // Configure the db.select chain to return a pre-existing order row,
    // simulating the replay-attack scenario where the same PayPal order ID
    // is submitted a second time.
    mockDbSelect.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: 'db-order-already-exists' }]),
        }),
      }),
    });

    const res = await request(app)
      .post('/api/orders/paypal')
      .set('Content-Type', 'application/json')
      .send(buildPaypalBody({ paypalOrderId: DUPLICATE_ORDER_ID }));

    expect(res.status).toBe(409);
    expect(typeof res.body.error).toBe('string');
    expect(res.body.error.toLowerCase()).toContain('already been finalized');
  });

  it('does not call createOrder when the replay-attack guard fires', async () => {
    // Same setup: pre-existing order row in the database.
    mockDbSelect.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: 'db-order-already-exists' }]),
        }),
      }),
    });

    await request(app)
      .post('/api/orders/paypal')
      .set('Content-Type', 'application/json')
      .send(buildPaypalBody({ paypalOrderId: DUPLICATE_ORDER_ID }));

    // The guard must short-circuit before any order creation logic runs.
    expect(mockCreateOrder).not.toHaveBeenCalled();
  });

  it('allows a fresh paypalOrderId through (no existing row → order proceeds)', async () => {
    // The global beforeEach already sets mockDbSelect to return [] (no existing
    // order). This test confirms the happy path: a new, unseen paypalOrderId
    // must not be rejected by the replay guard.

    const res = await request(app)
      .post('/api/orders/paypal')
      .set('Content-Type', 'application/json')
      .send(buildPaypalBody({ paypalOrderId: FRESH_ORDER_ID }));

    // The request should proceed past the replay guard and reach order creation.
    expect(res.status).toBe(201);
    expect(mockCreateOrder).toHaveBeenCalledOnce();
  });

  it('returns 409 and skips side-effects when createOrder throws a unique constraint violation (race condition)', async () => {
    // Simulate the SELECT→INSERT race: the SELECT returns no existing row
    // (both concurrent requests pass the check), but the INSERT for the losing
    // request hits the unique constraint on paypal_order_id (pg error 23505).
    // The handler must catch this, return 409, and NOT proceed to stock
    // decrement, email sending, or any other side-effect.

    const pgUniqueViolation = Object.assign(
      new Error('duplicate key value violates unique constraint "orders_paypal_order_id_unique"'),
      { code: '23505' }
    );
    mockCreateOrder.mockRejectedValueOnce(pgUniqueViolation);

    const decrementStock = vi.mocked(
      (await import('../storage')).storage.decrementStock
    );
    const updateOrderEmailStatus = vi.mocked(
      (await import('../storage')).storage.updateOrderEmailStatus
    );
    decrementStock.mockClear();
    updateOrderEmailStatus.mockClear();

    const res = await request(app)
      .post('/api/orders/paypal')
      .set('Content-Type', 'application/json')
      .send(buildPaypalBody({ paypalOrderId: FRESH_ORDER_ID }));

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already been finalized/i);

    // Side-effects must not have fired for the losing concurrent request.
    expect(decrementStock).not.toHaveBeenCalled();
    expect(updateOrderEmailStatus).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 11 — Promo race-condition backstop (optimistic lock)
//
// The read-based guard (getOrdersByUserId + hasRedeemedFirstOrderPromo) has a
// TOCTOU window: two simultaneous first-order requests can both pass the read
// check before either writes the firstOrderPromos row.
//
// The fix inserts the firstOrderPromos row *before* creating the order, using a
// partial unique index (user_id WHERE status = 'redeemed') as an optimistic
// lock.  A concurrent request that also passed the read guard will hit a
// PostgreSQL unique-constraint violation (code 23505) on the INSERT and
// receive a 409 instead of silently receiving a second free BAC water unit.
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/orders/paypal — promo race-condition backstop', () => {
  const RACING_USER = 'user-first-order-racing';

  const bacWaterBody = () => {
    setTestSession(RACING_USER);
    return buildPaypalBody({
      items: [
        {
          productId: BPC157_ID,
          name: 'BPC-157',
          dosage: '5mg',
          quantity: 1,
          price: '300',
        },
        {
          productId: BAC_WATER_ID,
          name: 'Bacteriostatic Water',
          dosage: '3ml',
          quantity: 1,
          price: '0',
        },
      ],
      total: '300',
    });
  };

  beforeEach(() => {
    mockGetAllProducts.mockResolvedValue([
      { id: BAC_WATER_ID, slug: 'bacteriostatic-water', name: 'Bacteriostatic Water' },
      { id: BPC157_ID, slug: 'bpc-157', name: 'BPC-157' },
    ]);

    mockGetProductWithDosageStock.mockResolvedValue({
      id: BPC157_ID,
      name: 'BPC-157',
      price: '300',
      dosageStocks: [{ dosage: '5mg', price: '300', stock: 100 }],
    });

    mockGetPaypalOrderDetails.mockResolvedValue({
      status: 'COMPLETED',
      currency: 'USD',
      capturedAmount: 300,
    });

    // Both concurrent requests see no prior orders and no redeemed promo —
    // both would pass the read-based guard.
    mockGetOrdersByUserId.mockResolvedValue([]);
    mockHasRedeemedFirstOrderPromo.mockResolvedValue(false);

    mockCreateOrder.mockClear();
    // Reset to default (success) so each test that needs a failure can override.
    mockDbInsertReturning.mockResolvedValue([{ id: 'promo-slot-1' }]);
  });

  it('succeeds (201) for the first request — optimistic promo lock acquired', async () => {
    // The first request wins the INSERT race; the DB returns the new promo row.
    mockDbInsertReturning.mockResolvedValueOnce([{ id: 'promo-slot-1' }]);

    const res = await request(app)
      .post('/api/orders/paypal')
      .set('Content-Type', 'application/json')
      .send(bacWaterBody());

    expect(res.status).toBe(201);
    expect(mockCreateOrder).toHaveBeenCalledOnce();
  });

  it('returns 409 for the second concurrent request — unique-constraint violation on promo insert', async () => {
    // Simulate the DB rejecting the INSERT because a concurrent request already
    // holds the unique slot (user_id WHERE status = 'redeemed').
    const uniqueViolation = Object.assign(new Error('duplicate key value violates unique constraint'), {
      code: '23505',
    });
    mockDbInsertReturning.mockRejectedValueOnce(uniqueViolation);

    const res = await request(app)
      .post('/api/orders/paypal')
      .set('Content-Type', 'application/json')
      .send(bacWaterBody());

    // The second concurrent request must be rejected, not silently creating
    // a second order with free BAC water.
    expect(res.status).toBe(409);
    expect(typeof res.body.error).toBe('string');
    expect(res.body.error.toLowerCase()).toContain('promo');

    // Order must NOT have been created for the racing second request.
    expect(mockCreateOrder).not.toHaveBeenCalled();
  });

  it('does not block the order when a non-unique DB error occurs during promo insert', async () => {
    // Transient / unexpected DB errors on the promo insert must not prevent a
    // paid order from completing.  The lock reservation is best-effort for
    // non-constraint errors.
    const transientError = Object.assign(new Error('connection timeout'), { code: 'ECONNRESET' });
    mockDbInsertReturning.mockRejectedValueOnce(transientError);

    const res = await request(app)
      .post('/api/orders/paypal')
      .set('Content-Type', 'application/json')
      .send(bacWaterBody());

    // Order proceeds despite the promo-tracking failure.
    expect(res.status).toBe(201);
    expect(mockCreateOrder).toHaveBeenCalledOnce();
  });
});
