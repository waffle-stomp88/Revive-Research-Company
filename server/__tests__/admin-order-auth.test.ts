// @vitest-environment node
/**
 * Route-level tests confirming that admin order management routes are
 * gated by both isAuthenticated and isAdmin middleware.
 *
 * Three auth scenarios are covered for the key admin order routes:
 *
 *   1. UNAUTHENTICATED — no session userId; isAuthenticated fires first
 *      and must return 401 before any order data is touched.
 *
 *   2. AUTHENTICATED NON-ADMIN — valid session but user.isAdmin === false;
 *      isAdmin must return 403 before any order data is touched.
 *
 *   3. AUTHENTICATED ADMIN — valid session and user.isAdmin === true;
 *      the route proceeds and returns order data (200 / 404).
 *
 * Routes exercised:
 *   GET  /api/admin/orders           — list all orders
 *   GET  /api/admin/orders/:id       — single order lookup
 *   PATCH /api/admin/orders/:id/status — update payment status
 *
 * All external dependencies (DB, email, PayPal, storage, etc.) are mocked
 * so the tests run without a live database or network connection.
 */

import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import express from 'express';
import type { Express } from 'express';
import { createServer } from 'http';
import request from 'supertest';

// ─────────────────────────────────────────────────────────────────────────────
// Per-test auth-state control
// ─────────────────────────────────────────────────────────────────────────────

const ADMIN_USER_ID = 'admin-user-id-abc';
const REGULAR_USER_ID = 'regular-user-id-xyz';

type AuthState = 'unauthenticated' | 'regular' | 'admin';
let _authState: AuthState = 'unauthenticated';

function setAuthState(state: AuthState): void {
  _authState = state;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hoisted spy handles — created before vi.mock() factories execute
// ─────────────────────────────────────────────────────────────────────────────

const {
  mockGetUser,
  mockGetAllOrders,
  mockGetOrder,
  mockUpdateOrderStatus,
} = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockGetAllOrders: vi.fn(),
  mockGetOrder: vi.fn(),
  mockUpdateOrderStatus: vi.fn(),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Module mocks — declared before any import of server code.
// vi.mock() calls are hoisted by vitest; factories run before imports.
// ─────────────────────────────────────────────────────────────────────────────

vi.mock('../sessionAuth', () => ({
  setupAuth: vi.fn((app: any) => {
    // Inject session.userId and req.user based on the current auth state.
    // The isAdmin middleware reads req.session.userId, so we must populate it.
    app.use((req: any, _res: any, next: any) => {
      if (_authState === 'admin') {
        req.session = { userId: ADMIN_USER_ID };
        req.user = { claims: { sub: ADMIN_USER_ID } };
        req.isAuthenticated = () => true;
      } else if (_authState === 'regular') {
        req.session = { userId: REGULAR_USER_ID };
        req.user = { claims: { sub: REGULAR_USER_ID } };
        req.isAuthenticated = () => true;
      } else {
        req.session = {};
        req.isAuthenticated = () => false;
      }
      next();
    });
  }),
  // isAuthenticated middleware: pass through for authenticated states, 401 for guests
  isAuthenticated: vi.fn((req: any, res: any, next: any) => {
    if (_authState === 'unauthenticated') {
      return res.status(401).json({ error: 'Authentication required' });
    }
    return next();
  }),
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
  getPaypalOrderDetails: vi.fn(),
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
        returning: vi.fn().mockResolvedValue([{ id: 'stub-id' }]),
        catch: vi.fn().mockResolvedValue(undefined),
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
    getUser: mockGetUser,
    getAllOrders: mockGetAllOrders,
    getOrder: mockGetOrder,
    updateOrderStatus: mockUpdateOrderStatus,
    // Stubs for other route handlers referenced during registerRoutes
    createOrder: vi.fn().mockResolvedValue({}),
    getOrdersByUserId: vi.fn().mockResolvedValue([]),
    getOrdersByEmail: vi.fn().mockResolvedValue([]),
    hasRedeemedFirstOrderPromo: vi.fn().mockResolvedValue(false),
    getAllProducts: vi.fn().mockResolvedValue([]),
    getProducts: vi.fn().mockResolvedValue([]),
    getProductBySlug: vi.fn().mockResolvedValue(null),
    getProductById: vi.fn().mockResolvedValue(null),
    getProductWithDosageStock: vi.fn().mockResolvedValue(null),
    getOrders: vi.fn().mockResolvedValue([]),
    updateOrder: vi.fn().mockResolvedValue(null),
    createContact: vi.fn().mockResolvedValue({}),
    getContacts: vi.fn().mockResolvedValue([]),
    getAffiliates: vi.fn().mockResolvedValue([]),
    getAffiliate: vi.fn().mockResolvedValue(null),
    getNewsletterSubscribers: vi.fn().mockResolvedValue([]),
    createNewsletterSubscriber: vi.fn().mockResolvedValue({}),
    getUserById: vi.fn().mockResolvedValue(null),
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
    validateStock: vi.fn().mockResolvedValue({ valid: true, errors: [] }),
    decrementStock: vi.fn().mockResolvedValue({ success: true, errors: [] }),
    updateOrderEmailStatus: vi.fn().mockResolvedValue({}),
    getCoaByBatchNumber: vi.fn().mockResolvedValue(null),
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
// Test app — built once; auth-state stub reads module-level flag per request
// ─────────────────────────────────────────────────────────────────────────────

let app: Express;

beforeAll(async () => {
  app = express();
  app.use(express.json());
  const httpServer = createServer(app);
  await registerRoutes(httpServer, app);
});

// Stub order used for admin-success scenarios
const STUB_ORDER = {
  id: 'order-stub-001',
  userId: 'some-user-id',
  email: 'customer@example.com',
  totalAmount: '150.00',
  status: 'pending_payment',
  fulfillmentStatus: null,
  createdAt: new Date().toISOString(),
};

// Stub admin user
const ADMIN_USER_STUB = { id: ADMIN_USER_ID, isAdmin: true, email: 'admin@example.com' };
// Stub regular (non-admin) user
const REGULAR_USER_STUB = { id: REGULAR_USER_ID, isAdmin: false, email: 'user@example.com' };

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 — GET /api/admin/orders
// ─────────────────────────────────────────────────────────────────────────────

describe('GET /api/admin/orders — auth guards', () => {
  beforeEach(() => {
    mockGetUser.mockClear();
    mockGetAllOrders.mockClear();
  });

  it('returns 401 for unauthenticated requests', async () => {
    setAuthState('unauthenticated');

    const res = await request(app).get('/api/admin/orders');

    expect(res.status).toBe(401);
    // isAdmin's storage lookup must not be called — isAuthenticated fires first
    expect(mockGetAllOrders).not.toHaveBeenCalled();
  });

  it('returns 403 for authenticated non-admin users', async () => {
    setAuthState('regular');
    mockGetUser.mockResolvedValue(REGULAR_USER_STUB);

    const res = await request(app).get('/api/admin/orders');

    expect(res.status).toBe(403);
    // The order list must never be fetched for a non-admin
    expect(mockGetAllOrders).not.toHaveBeenCalled();
  });

  it('returns 200 and order list for authenticated admin users', async () => {
    setAuthState('admin');
    mockGetUser.mockResolvedValue(ADMIN_USER_STUB);
    mockGetAllOrders.mockResolvedValue([STUB_ORDER]);

    const res = await request(app).get('/api/admin/orders');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(mockGetAllOrders).toHaveBeenCalledOnce();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 2 — GET /api/admin/orders/:id
// ─────────────────────────────────────────────────────────────────────────────

describe('GET /api/admin/orders/:id — auth guards', () => {
  beforeEach(() => {
    mockGetUser.mockClear();
    mockGetOrder.mockClear();
  });

  it('returns 401 for unauthenticated requests', async () => {
    setAuthState('unauthenticated');

    const res = await request(app).get('/api/admin/orders/order-stub-001');

    expect(res.status).toBe(401);
    expect(mockGetOrder).not.toHaveBeenCalled();
  });

  it('returns 403 for authenticated non-admin users', async () => {
    setAuthState('regular');
    mockGetUser.mockResolvedValue(REGULAR_USER_STUB);

    const res = await request(app).get('/api/admin/orders/order-stub-001');

    expect(res.status).toBe(403);
    expect(mockGetOrder).not.toHaveBeenCalled();
  });

  it('returns 200 with order data for authenticated admin users', async () => {
    setAuthState('admin');
    mockGetUser.mockResolvedValue(ADMIN_USER_STUB);
    mockGetOrder.mockResolvedValue(STUB_ORDER);

    const res = await request(app).get('/api/admin/orders/order-stub-001');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(STUB_ORDER.id);
    expect(mockGetOrder).toHaveBeenCalledWith('order-stub-001');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 3 — PATCH /api/admin/orders/:id/status
// ─────────────────────────────────────────────────────────────────────────────

describe('PATCH /api/admin/orders/:id/status — auth guards', () => {
  beforeEach(() => {
    mockGetUser.mockClear();
    mockUpdateOrderStatus.mockClear();
  });

  it('returns 401 for unauthenticated requests', async () => {
    setAuthState('unauthenticated');

    const res = await request(app)
      .patch('/api/admin/orders/order-stub-001/status')
      .set('Content-Type', 'application/json')
      .send({ status: 'paid' });

    expect(res.status).toBe(401);
    expect(mockUpdateOrderStatus).not.toHaveBeenCalled();
  });

  it('returns 403 for authenticated non-admin users', async () => {
    setAuthState('regular');
    mockGetUser.mockResolvedValue(REGULAR_USER_STUB);

    const res = await request(app)
      .patch('/api/admin/orders/order-stub-001/status')
      .set('Content-Type', 'application/json')
      .send({ status: 'paid' });

    expect(res.status).toBe(403);
    // The status update must never be applied for a non-admin
    expect(mockUpdateOrderStatus).not.toHaveBeenCalled();
  });

  it('returns 200 and updated order for authenticated admin users', async () => {
    setAuthState('admin');
    mockGetUser.mockResolvedValue(ADMIN_USER_STUB);
    mockUpdateOrderStatus.mockResolvedValue({ ...STUB_ORDER, status: 'paid' });

    const res = await request(app)
      .patch('/api/admin/orders/order-stub-001/status')
      .set('Content-Type', 'application/json')
      .send({ status: 'paid' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('paid');
    expect(mockUpdateOrderStatus).toHaveBeenCalledWith('order-stub-001', 'paid');
  });
});
