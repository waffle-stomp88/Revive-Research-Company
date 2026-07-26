// @vitest-environment node
/**
 * Route-level tests confirming that manual-payment and generic pre-payment
 * orders are linked to the authenticated user, and that those orders
 * subsequently appear in the user's order history.
 *
 * Two POST routes are covered:
 *
 *   POST /api/orders         — processor-agnostic pre-payment order creation
 *   POST /api/orders/manual  — CashApp / Zelle / Venmo manual payment
 *
 * For each route the tests verify:
 *   1. The `userId` field on the created order matches the authenticated
 *      user's canonical ID (req.user.claims.sub, mirrored in session).
 *   2. GET /api/orders/my-orders returns the newly created order for that user.
 *
 * All external dependencies (DB, email, PayPal, stock, storage) are mocked
 * so the tests run without a live database or network connection.
 *
 * Relevant source:
 *   server/routes.ts lines ~1120–1157  (POST /api/orders)
 *   server/routes.ts lines ~1157–1330  (POST /api/orders/manual)
 *   server/routes.ts lines ~2075–2106  (GET /api/orders/my-orders)
 */

import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import express from 'express';
import type { Express } from 'express';
import { createServer } from 'http';
import request from 'supertest';

// ─────────────────────────────────────────────────────────────────────────────
// Per-test session / identity control
// ─────────────────────────────────────────────────────────────────────────────

const TEST_USER_ID = 'canonical-user-sub-abc123';
const TEST_USER_EMAIL = 'testuser@example.com';

let _authenticated = false;

function setAuthenticated(value: boolean): void {
  _authenticated = value;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hoisted spy handles
// ─────────────────────────────────────────────────────────────────────────────

const {
  mockCreateOrder,
  mockGetOrdersByUserId,
  mockGetOrdersByEmail,
  mockGetCoaByBatchNumber,
  mockValidateStock,
} = vi.hoisted(() => ({
  mockCreateOrder: vi.fn(),
  mockGetOrdersByUserId: vi.fn(),
  mockGetOrdersByEmail: vi.fn(),
  mockGetCoaByBatchNumber: vi.fn().mockResolvedValue(null),
  mockValidateStock: vi.fn().mockResolvedValue({ valid: true, errors: [] }),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Module mocks — declared before any import of server code
// ─────────────────────────────────────────────────────────────────────────────

vi.mock('../sessionAuth', () => ({
  setupAuth: vi.fn((app: any) => {
    // Inject both session.userId and req.user.claims so both order-creation
    // routes (use session fallback) and my-orders (reads req.user.claims.sub)
    // work correctly in these tests.
    app.use((req: any, _res: any, next: any) => {
      if (_authenticated) {
        req.session = { userId: TEST_USER_ID };
        req.user = { claims: { sub: TEST_USER_ID, email: TEST_USER_EMAIL } };
        req.isAuthenticated = () => true;
      } else {
        req.session = {};
        req.isAuthenticated = () => false;
      }
      next();
    });
  }),
  // Allow all requests through; the routes themselves enforce auth where needed
  isAuthenticated: vi.fn((_req: any, res: any, next: any) => {
    if (_authenticated) return next();
    return res.status(401).json({ error: 'Unauthenticated' });
  }),
}));

vi.mock('../supabaseAuth', () => ({ verifySupabaseToken: vi.fn() }));

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
  getPaypalOrderDetails: vi.fn(),
  isPayPalSandbox: vi.fn().mockReturnValue(false),
  createPaypalOrder: vi.fn(),
  capturePaypalOrder: vi.fn(),
  loadPaypalDefault: vi.fn(),
}));

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
        returning: vi.fn().mockResolvedValue([{ id: 'stub-order-1' }]),
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
    getOrdersByEmail: mockGetOrdersByEmail,
    getCoaByBatchNumber: mockGetCoaByBatchNumber,
    validateStock: mockValidateStock,
    decrementStock: vi.fn().mockResolvedValue({ success: true, errors: [] }),
    updateOrderEmailStatus: vi.fn().mockResolvedValue({}),
    getOrder: vi.fn().mockResolvedValue(null),
    getProducts: vi.fn().mockResolvedValue([]),
    getProductBySlug: vi.fn().mockResolvedValue(null),
    getProductById: vi.fn().mockResolvedValue(null),
    getProductWithDosageStock: vi.fn().mockResolvedValue(null),
    getAllProducts: vi.fn().mockResolvedValue([]),
    getOrders: vi.fn().mockResolvedValue([]),
    updateOrder: vi.fn().mockResolvedValue(null),
    createContact: vi.fn().mockResolvedValue({}),
    getContacts: vi.fn().mockResolvedValue([]),
    getAffiliates: vi.fn().mockResolvedValue([]),
    getAffiliate: vi.fn().mockResolvedValue(null),
    getNewsletterSubscribers: vi.fn().mockResolvedValue([]),
    createNewsletterSubscriber: vi.fn().mockResolvedValue({}),
    getUserById: vi.fn().mockResolvedValue(null),
    getUser: vi.fn().mockResolvedValue(null),
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
    hasRedeemedFirstOrderPromo: vi.fn().mockResolvedValue(false),
    getUserResearchProfile: vi.fn().mockResolvedValue(null),
    getWishlistByUserId: vi.fn().mockResolvedValue([]),
  },
  resolveDisplayPrice: vi.fn().mockReturnValue({ price: 300, currency: 'USD' }),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Import real registerRoutes AFTER all vi.mock() declarations
// ─────────────────────────────────────────────────────────────────────────────

import { registerRoutes } from '../routes';

// ─────────────────────────────────────────────────────────────────────────────
// Test app — built once; session / identity stubs read module-level flags
// ─────────────────────────────────────────────────────────────────────────────

let app: Express;

beforeAll(async () => {
  app = express();
  app.use(express.json());
  const httpServer = createServer(app);
  await registerRoutes(httpServer, app);
});

// ─────────────────────────────────────────────────────────────────────────────
// Shared test data
// ─────────────────────────────────────────────────────────────────────────────

const GENERIC_ORDER_BODY = {
  email: 'testuser@example.com',
  firstName: 'Test',
  lastName: 'User',
  address: '123 Lab Lane',
  city: 'Austin',
  state: 'TX',
  zipCode: '78701',
  country: 'USA',
  productId: 'product-uuid-stub',
  quantity: 1,
  totalAmount: '49.99',
  paymentMethod: 'cashapp',
};

const MANUAL_ORDER_BODY = {
  paymentMethod: 'cashapp',
  customerEmail: 'testuser@example.com',
  customerName: 'Test User',
  shippingAddress: {
    street: '123 Lab Lane',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
  },
  items: [
    {
      productId: 'product-uuid-stub',
      name: 'BPC-157',
      dosage: '5mg',
      quantity: 1,
      price: 49.99,
    },
  ],
  total: 49.99,
  isTest: true, // skip stock decrement and email side-effects
};

// A stub order row returned by storage.createOrder, matching the shape
// that GET /api/orders/my-orders expects.
function makeStubOrder(userId: string): Record<string, unknown> {
  return {
    id: 'stub-order-' + userId.slice(-6),
    userId,
    email: TEST_USER_EMAIL,
    firstName: 'Test',
    lastName: 'User',
    address: '123 Lab Lane',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    country: 'USA',
    productId: 'product-uuid-stub',
    quantity: 1,
    totalAmount: '49.99',
    status: 'pending_payment',
    paymentMethod: 'cashapp',
    isTest: true,
    batchNumber: null,
    items: [],
    createdAt: new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 — POST /api/orders (generic pre-payment route)
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/orders — user ID linking', () => {
  beforeEach(() => {
    setAuthenticated(true);
    mockCreateOrder.mockClear();
    mockGetOrdersByUserId.mockClear();
    mockGetOrdersByEmail.mockClear();
    const stubOrder = makeStubOrder(TEST_USER_ID);
    mockCreateOrder.mockResolvedValue(stubOrder);
    mockGetOrdersByUserId.mockResolvedValue([stubOrder]);
    mockGetOrdersByEmail.mockResolvedValue([]);
  });

  it('creates the order with the canonical userId from the authenticated session', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Content-Type', 'application/json')
      .send(GENERIC_ORDER_BODY);

    expect(res.status).toBe(201);
    expect(mockCreateOrder).toHaveBeenCalledOnce();

    const orderArg = mockCreateOrder.mock.calls[0][0];
    expect(orderArg.userId).toBe(TEST_USER_ID);
  });

  it('order appears in GET /api/orders/my-orders for the same user', async () => {
    // First, create the order so mockCreateOrder is satisfied
    const createRes = await request(app)
      .post('/api/orders')
      .set('Content-Type', 'application/json')
      .send(GENERIC_ORDER_BODY);

    expect(createRes.status).toBe(201);

    // Now fetch the user's order history
    const historyRes = await request(app)
      .get('/api/orders/my-orders')
      .set('Content-Type', 'application/json');

    expect(historyRes.status).toBe(200);
    expect(Array.isArray(historyRes.body)).toBe(true);
    expect(historyRes.body.length).toBeGreaterThan(0);

    // getOrdersByUserId must have been called with the canonical user ID
    expect(mockGetOrdersByUserId).toHaveBeenCalledWith(TEST_USER_ID);

    // The returned order must carry the correct userId
    const returnedOrder = historyRes.body[0];
    expect(returnedOrder.userId).toBe(TEST_USER_ID);
  });

  it('does not link an order to a user when the session is unauthenticated', async () => {
    setAuthenticated(false);
    mockCreateOrder.mockResolvedValue({ ...makeStubOrder(''), userId: null });

    const res = await request(app)
      .post('/api/orders')
      .set('Content-Type', 'application/json')
      .send(GENERIC_ORDER_BODY);

    // The route accepts anonymous orders — it just omits userId
    expect(res.status).toBe(201);

    const orderArg = mockCreateOrder.mock.calls[0][0];
    // userId should be absent or undefined when no session exists
    expect(orderArg.userId == null).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 2 — POST /api/orders/manual (CashApp / Zelle / Venmo)
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/orders/manual — user ID linking', () => {
  beforeEach(() => {
    setAuthenticated(true);
    mockCreateOrder.mockClear();
    mockGetOrdersByUserId.mockClear();
    mockGetOrdersByEmail.mockClear();

    const stubOrder = makeStubOrder(TEST_USER_ID);
    mockCreateOrder.mockResolvedValue(stubOrder);
    mockGetOrdersByUserId.mockResolvedValue([stubOrder]);
    mockGetOrdersByEmail.mockResolvedValue([]);
  });

  it('creates the manual order with the canonical userId from the authenticated session', async () => {
    const res = await request(app)
      .post('/api/orders/manual')
      .set('Content-Type', 'application/json')
      .send(MANUAL_ORDER_BODY);

    expect(res.status).toBe(201);
    expect(mockCreateOrder).toHaveBeenCalledOnce();

    const orderArg = mockCreateOrder.mock.calls[0][0];
    expect(orderArg.userId).toBe(TEST_USER_ID);
  });

  it('manual order appears in GET /api/orders/my-orders for the same user', async () => {
    // Create the manual order first
    const createRes = await request(app)
      .post('/api/orders/manual')
      .set('Content-Type', 'application/json')
      .send(MANUAL_ORDER_BODY);

    expect(createRes.status).toBe(201);

    // Fetch the user's order history
    const historyRes = await request(app)
      .get('/api/orders/my-orders')
      .set('Content-Type', 'application/json');

    expect(historyRes.status).toBe(200);
    expect(Array.isArray(historyRes.body)).toBe(true);
    expect(historyRes.body.length).toBeGreaterThan(0);

    // getOrdersByUserId must have been called with the canonical user ID
    expect(mockGetOrdersByUserId).toHaveBeenCalledWith(TEST_USER_ID);

    // The returned order must carry the correct userId
    const returnedOrder = historyRes.body[0];
    expect(returnedOrder.userId).toBe(TEST_USER_ID);
  });

  it('rejects manual orders that are missing required fields', async () => {
    const res = await request(app)
      .post('/api/orders/manual')
      .set('Content-Type', 'application/json')
      .send({ paymentMethod: 'cashapp' }); // missing customerEmail, customerName, etc.

    expect(res.status).toBe(400);
    expect(mockCreateOrder).not.toHaveBeenCalled();
  });

  it('rejects manual orders with an unsupported payment method', async () => {
    const res = await request(app)
      .post('/api/orders/manual')
      .set('Content-Type', 'application/json')
      .send({ ...MANUAL_ORDER_BODY, paymentMethod: 'bitcoin' });

    expect(res.status).toBe(400);
    expect(mockCreateOrder).not.toHaveBeenCalled();
  });

  it('does not link a manual order to a user when the session is unauthenticated', async () => {
    setAuthenticated(false);
    const stubOrder = { ...makeStubOrder(''), userId: null };
    mockCreateOrder.mockResolvedValue(stubOrder);

    const res = await request(app)
      .post('/api/orders/manual')
      .set('Content-Type', 'application/json')
      .send(MANUAL_ORDER_BODY);

    expect(res.status).toBe(201);

    const orderArg = mockCreateOrder.mock.calls[0][0];
    expect(orderArg.userId == null).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 3 — GET /api/orders/my-orders isolation
// ─────────────────────────────────────────────────────────────────────────────

describe('GET /api/orders/my-orders — history isolation', () => {
  beforeEach(() => {
    setAuthenticated(true);
    mockCreateOrder.mockClear();
    mockGetOrdersByUserId.mockClear();
    mockGetOrdersByEmail.mockClear();
  });

  it('returns an empty array when the user has no orders', async () => {
    mockGetOrdersByUserId.mockResolvedValue([]);
    mockGetOrdersByEmail.mockResolvedValue([]);

    const res = await request(app).get('/api/orders/my-orders');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(0);
  });

  it('queries by canonical userId (claims.sub), not by email, when orders exist', async () => {
    const stubOrder = makeStubOrder(TEST_USER_ID);
    mockGetOrdersByUserId.mockResolvedValue([stubOrder]);

    const res = await request(app).get('/api/orders/my-orders');

    expect(res.status).toBe(200);
    // Primary lookup must use the stable user ID
    expect(mockGetOrdersByUserId).toHaveBeenCalledWith(TEST_USER_ID);
    // Email fallback must NOT be attempted when the userId lookup found results
    expect(mockGetOrdersByEmail).not.toHaveBeenCalled();
  });

  it('falls back to email lookup when no orders are linked to the userId yet', async () => {
    const stubOrder = { ...makeStubOrder(TEST_USER_ID), userId: null };
    mockGetOrdersByUserId.mockResolvedValue([]);
    mockGetOrdersByEmail.mockResolvedValue([stubOrder]);

    const res = await request(app).get('/api/orders/my-orders');

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(mockGetOrdersByEmail).toHaveBeenCalledWith(TEST_USER_EMAIL);
  });

  it('returns 401 for unauthenticated requests', async () => {
    setAuthenticated(false);

    const res = await request(app).get('/api/orders/my-orders');

    expect(res.status).toBe(401);
  });
});
