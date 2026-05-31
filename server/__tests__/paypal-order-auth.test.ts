// @vitest-environment node
/**
 * Route-level tests for POST /api/orders/paypal
 *
 * Two security boundaries are guarded:
 *
 *   1. AUTHENTICATION GUARD — unauthenticated requests (no session userId)
 *      must receive 401 and never proceed to order creation. A future
 *      refactor that removes or moves the auth check will immediately
 *      fail this test.
 *
 *   2. BAC WATER PROMO INTEGRITY — repeat buyers must never receive the
 *      free 3ml BAC water promo. A $0-priced BAC water item submitted by a
 *      repeat buyer must be stripped from the sanitized items list so it
 *      does not appear in the created order.
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
