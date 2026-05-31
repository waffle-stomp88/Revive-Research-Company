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
  mockGetAllProducts,
  mockGetProductWithDosageStock,
} = vi.hoisted(() => ({
  mockGetPaypalOrderDetails: vi.fn(),
  mockCreateOrder: vi.fn().mockResolvedValue({
    id: 'order-stub-1',
    email: 'test@example.com',
  }),
  mockGetOrdersByUserId: vi.fn(),
  mockGetAllProducts: vi.fn(),
  mockGetProductWithDosageStock: vi.fn(),
}));

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

// Drizzle fluent-chain stub for the replay-attack check.
// The route does: db.select({…}).from(table).where(eq(…)).limit(1)
// Default returns []: no pre-existing order with this PayPal ID.
vi.mock('../db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue([]),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn().mockResolvedValue([{ id: 'order-stub-1' }]),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn().mockResolvedValue([]),
      })),
    })),
  },
  pool: { query: vi.fn() },
}));

vi.mock('../storage', () => ({
  storage: {
    createOrder: mockCreateOrder,
    getOrdersByUserId: mockGetOrdersByUserId,
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

    // PayPal captured $300. The $0 BAC water item contributes nothing to the
    // captured total, so the server-side amount check still passes after
    // the item is stripped.
    mockGetPaypalOrderDetails.mockResolvedValue({
      status: 'COMPLETED',
      currency: 'USD',
      capturedAmount: 300,
    });

    mockCreateOrder.mockClear();
  });

  it('accepts the order (201) and strips the $0 BAC water from the created record', async () => {
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

    // The order proceeds — stripping the promo is transparent to the buyer
    // because the captured PayPal amount already excludes the $0 item.
    expect(res.status).toBe(201);

    // createOrder must have been called exactly once
    expect(mockCreateOrder).toHaveBeenCalledOnce();

    // fulfillmentNotes is built from sanitizedItems and is the authoritative
    // record of what was ordered. The stripped BAC water must not appear.
    const orderArg = mockCreateOrder.mock.calls[0][0];
    expect(orderArg.fulfillmentNotes).toBeDefined();
    expect(orderArg.fulfillmentNotes).not.toContain('Bacteriostatic Water');
    expect(orderArg.fulfillmentNotes).toContain('BPC-157');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 3 — BAC water promo preserved for first-time buyers (3ml only)
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/orders/paypal — BAC water promo preserved for first-time buyers', () => {
  beforeEach(() => {
    setTestSession('user-first-time-buyer');

    // First-time buyer: zero prior orders
    mockGetOrdersByUserId.mockResolvedValue([]);

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
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/orders/paypal — BAC water quantity cap (multi-unit, first-time buyer)', () => {
  // BAC water catalogue price used across this suite.
  const BAC_WATER_CATALOGUE_PRICE = 20;

  beforeEach(() => {
    setTestSession('user-first-time-buyer-multiunit');

    // First-time buyer: zero prior orders
    mockGetOrdersByUserId.mockResolvedValue([]);

    // Product catalogue includes BAC water
    mockGetAllProducts.mockResolvedValue([
      {
        id: BAC_WATER_ID,
        slug: 'bacteriostatic-water',
        name: 'Bacteriostatic Water',
      },
    ]);

    // getProductWithDosageStock is called for the paid BAC water unit (price > 0
    // after sanitization). Return a valid catalogue entry so the server can
    // verify the per-unit price and compute a correct server-side subtotal.
    mockGetProductWithDosageStock.mockResolvedValue({
      id: BAC_WATER_ID,
      name: 'Bacteriostatic Water',
      price: String(BAC_WATER_CATALOGUE_PRICE),
      dosageStocks: [
        { dosage: '3ml', price: String(BAC_WATER_CATALOGUE_PRICE), stock: 100 },
      ],
    });

    // 1 paid BAC water unit ($20 subtotal) + flat-rate shipping ($20) = $40 total.
    // The free unit contributes $0 and is excluded from the server subtotal.
    mockGetPaypalOrderDetails.mockResolvedValue({
      status: 'COMPLETED',
      currency: 'USD',
      capturedAmount: 40,
    });

    mockCreateOrder.mockClear();
  });

  it('returns 201 when a first-time buyer orders 2 units of 3ml BAC water', async () => {
    const body = buildPaypalBody({
      items: [
        {
          productId: BAC_WATER_ID,
          name: 'Bacteriostatic Water',
          dosage: '3ml',
          // Buyer legitimately wants 2 vials; the server caps the promo at 1 free.
          quantity: 2,
          price: String(BAC_WATER_CATALOGUE_PRICE),
        },
      ],
      // Client submits the pre-promo total; server re-verifies independently.
      subtotal: String(BAC_WATER_CATALOGUE_PRICE),
      shipping: '20',
      tax: '0',
      total: '40',
    });

    const res = await request(app)
      .post('/api/orders/paypal')
      .set('Content-Type', 'application/json')
      .send(body);

    expect(res.status).toBe(201);
  });

  it('records exactly 1 free unit and 1 catalogue-priced unit in fulfillmentNotes', async () => {
    const body = buildPaypalBody({
      items: [
        {
          productId: BAC_WATER_ID,
          name: 'Bacteriostatic Water',
          dosage: '3ml',
          quantity: 2,
          price: String(BAC_WATER_CATALOGUE_PRICE),
        },
      ],
      subtotal: String(BAC_WATER_CATALOGUE_PRICE),
      shipping: '20',
      tax: '0',
      total: '40',
    });

    await request(app)
      .post('/api/orders/paypal')
      .set('Content-Type', 'application/json')
      .send(body);

    expect(mockCreateOrder).toHaveBeenCalledOnce();

    const orderArg = mockCreateOrder.mock.calls[0][0];
    expect(orderArg.fulfillmentNotes).toBeDefined();

    // The free unit must appear as qty 1 at $0.00 — the first-order promo cap.
    expect(orderArg.fulfillmentNotes).toContain('Bacteriostatic Water (3ml) x1 @ $0.00');

    // The paid unit must appear as qty 1 at the catalogue price — proving the
    // cap split the original qty-2 line into exactly two separate line items
    // and did NOT grant a second free vial.
    expect(orderArg.fulfillmentNotes).toContain(
      `Bacteriostatic Water (3ml) x1 @ $${BAC_WATER_CATALOGUE_PRICE}`
    );
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
// Suite 6 — Non-3ml BAC water at $0 is never free, even for first-time buyers
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/orders/paypal — non-3ml BAC water at $0 is stripped for first-time buyers', () => {
  beforeEach(() => {
    setTestSession('user-first-time-buyer-10ml');

    // First-time buyer: zero prior orders
    mockGetOrdersByUserId.mockResolvedValue([]);

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

    // PayPal captured $300. The 10ml BAC water submitted at $0 must be stripped
    // before the server subtotal is computed, so the captured amount still matches.
    mockGetPaypalOrderDetails.mockResolvedValue({
      status: 'COMPLETED',
      currency: 'USD',
      capturedAmount: 300,
    });

    mockCreateOrder.mockClear();
  });

  it('accepts the order (201) and does not include the $0 non-3ml BAC water in the created record', async () => {
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
          // Only the 3ml SKU qualifies for the first-order promo — this
          // must be stripped, not silently passed through at $0.
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

    // The order still succeeds — the BAC water is silently dropped, not rejected.
    expect(res.status).toBe(201);

    // createOrder must have been called exactly once.
    expect(mockCreateOrder).toHaveBeenCalledOnce();

    // fulfillmentNotes is built from sanitizedItems and is the authoritative
    // record. The $0 10ml BAC water must NOT appear — it was stripped by
    // applyBacWaterPromo because only the 3ml SKU is eligible for the promo.
    const orderArg = mockCreateOrder.mock.calls[0][0];
    expect(orderArg.fulfillmentNotes).toBeDefined();
    expect(orderArg.fulfillmentNotes).not.toContain('Bacteriostatic Water');
    expect(orderArg.fulfillmentNotes).toContain('BPC-157');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 6 — BAC water split-line attack: two separate $0 lines for first-time buyer
//
// A savvy buyer could attempt to game the promo by submitting two *separate*
// cart line items (each qty=1, price=$0) for the same BAC water product
// instead of a single line with qty=2. applyBacWaterPromo must recognise this
// cross-line pattern and honour only the first free unit, stripping the second
// $0 line entirely.
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/orders/paypal — BAC water split-line attack (first-time buyer)', () => {
  beforeEach(() => {
    setTestSession('user-first-time-buyer-splitline');

    // First-time buyer: zero prior orders
    mockGetOrdersByUserId.mockResolvedValue([]);

    // Product catalogue includes BAC water
    mockGetAllProducts.mockResolvedValue([
      {
        id: BAC_WATER_ID,
        slug: 'bacteriostatic-water',
        name: 'Bacteriostatic Water',
      },
      { id: BPC157_ID, slug: 'bpc-157', name: 'BPC-157' },
    ]);

    // BPC-157: $300 per 5mg vial (above $250 free-shipping threshold → $0 shipping)
    mockGetProductWithDosageStock.mockResolvedValue({
      id: BPC157_ID,
      name: 'BPC-157',
      price: '300',
      dosageStocks: [{ dosage: '5mg', price: '300', stock: 100 }],
    });

    // PayPal captured $300 (only BPC-157). The two $0 BAC water lines are
    // the attack; only one $0 unit should survive after sanitisation.
    mockGetPaypalOrderDetails.mockResolvedValue({
      status: 'COMPLETED',
      currency: 'USD',
      capturedAmount: 300,
    });

    mockCreateOrder.mockClear();
  });

  it('returns 201 when a first-time buyer submits two separate $0 BAC water lines', async () => {
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
          // First $0 BAC water line — legitimate first-order promo
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

    expect(res.status).toBe(201);
  });

  it('strips the second $0 BAC water line so only one free unit appears in fulfillmentNotes', async () => {
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

    expect(mockCreateOrder).toHaveBeenCalledOnce();

    const orderArg = mockCreateOrder.mock.calls[0][0];
    expect(orderArg.fulfillmentNotes).toBeDefined();

    // BPC-157 must be present — it is a normal paid item.
    expect(orderArg.fulfillmentNotes).toContain('BPC-157');

    // Exactly one free BAC water unit must appear (the first line).
    expect(orderArg.fulfillmentNotes).toContain('Bacteriostatic Water (3ml) x1 @ $0.00');

    // The second $0 line must have been stripped. The free-unit entry must
    // appear exactly once — count occurrences to verify no duplicate.
    const freeUnitOccurrences = (
      orderArg.fulfillmentNotes.match(/Bacteriostatic Water \(3ml\) x1 @ \$0\.00/g) ?? []
    ).length;
    expect(freeUnitOccurrences).toBe(1);
  });
});
