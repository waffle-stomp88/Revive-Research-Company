/**
 * Endpoint-level integration tests for POST /api/promo/bac-water-declined.
 *
 * These tests mount the real `registerRoutes` from server/routes.ts (not a
 * copied fixture) so a future regression in the actual handler is caught.
 *
 * Strategy:
 *   - All heavy server dependencies are vi.mock'd (db, storage, email, etc.)
 *   - db.insert is spied on to assert the exact userId written to the DB
 *   - An auth-injection middleware is added to the express app BEFORE
 *     registerRoutes, giving each test full control of req.isAuthenticated,
 *     req.user, and req.session
 *   - supertest drives HTTP
 *
 * Relevant files:
 *   server/routes.ts lines 829–842  — handler under test
 *   server/lib/promo-identity.ts    — resolvePromoUserId (imported by handler)
 *   shared/schema.ts                — firstOrderPromos table
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import http from "http";
import supertest from "supertest";

// ─── Mock heavy server dependencies ──────────────────────────────────────────
// These vi.mock calls are hoisted by Vitest before any import is evaluated.

vi.mock("../server/db", () => {
  const mockCatch = vi.fn();
  const mockValues = vi.fn().mockReturnValue({ catch: mockCatch });
  const mockInsert = vi.fn().mockReturnValue({ values: mockValues });
  return { db: { insert: mockInsert }, pool: { query: vi.fn() } };
});

vi.mock("../server/storage", () => {
  const noop = vi.fn().mockResolvedValue(undefined);
  const storageProxy = new Proxy({}, { get: () => noop });
  return { storage: storageProxy, resolveDisplayPrice: vi.fn() };
});

vi.mock("../server/sessionAuth", () => ({
  setupAuth: vi.fn().mockResolvedValue(undefined),
  isAuthenticated: vi.fn((_req: any, _res: any, next: any) => next()),
}));

vi.mock("../server/supabaseAuth", () => ({
  supabaseAdmin: null,
  verifySupabaseToken: vi.fn().mockResolvedValue(null),
}));

vi.mock("../server/stripeClient", () => ({
  getUncachableStripeClient: vi.fn().mockResolvedValue(null),
  getStripePublishableKey: vi.fn().mockResolvedValue("pk_test_mock"),
  getStripeSecretKey: vi.fn().mockResolvedValue("sk_test_mock"),
  getStripeSync: vi.fn().mockResolvedValue(null),
}));

vi.mock("../server/objectStorage", () => {
  class MockObjectStorageService {
    uploadFile = vi.fn().mockResolvedValue({ publicUrl: "http://mock/file" });
    downloadFile = vi.fn().mockResolvedValue(Buffer.from(""));
    deleteFile = vi.fn().mockResolvedValue(undefined);
    getSignedUploadUrl = vi.fn().mockResolvedValue({ url: "http://mock/upload", publicUrl: "http://mock/file" });
  }
  class ObjectNotFoundError extends Error {}
  return { ObjectStorageService: MockObjectStorageService, ObjectNotFoundError };
});

vi.mock("../server/imageProcessor", () => ({
  processProductImage: vi.fn().mockResolvedValue({ buffer: Buffer.from(""), contentType: "image/jpeg", size: 0 }),
  getImageMetadata: vi.fn().mockResolvedValue({ width: 100, height: 100 }),
}));

vi.mock("../server/email", () => {
  const fn = vi.fn().mockResolvedValue({ success: true });
  return {
    sendEmail: fn,
    sendOrderConfirmationEmail: fn,
    sendAdminOrderNotificationEmail: fn,
    sendShippedNotificationEmail: fn,
    sendNewsletterWelcomeEmail: fn,
    sendPreLaunchConfirmationEmail: fn,
    sendInviteEmail: fn,
    sendRestockSignupConfirmationEmail: fn,
    isEmailConfigured: vi.fn().mockReturnValue(false),
    getOrderConfirmationTemplate: vi.fn().mockReturnValue(""),
    getShippedNotificationTemplate: vi.fn().mockReturnValue(""),
    getAffiliateWelcomeTemplate: vi.fn().mockReturnValue(""),
    getAffiliateRejectionTemplate: vi.fn().mockReturnValue(""),
    getInviteEmailTemplate: vi.fn().mockReturnValue(""),
    getRestockSignupConfirmationTemplate: vi.fn().mockReturnValue(""),
  };
});

vi.mock("../server/notifications", () => ({
  sendOrderNotifications: vi.fn().mockResolvedValue({ email: false, sms: false }),
  sendShippingNotifications: vi.fn().mockResolvedValue(undefined),
  getNotificationStatus: vi.fn().mockReturnValue({ email: false, sms: false }),
}));

vi.mock("../server/zoho-campaigns", () => ({
  addContactToResearchList: vi.fn().mockResolvedValue(undefined),
  debugZohoNewsletter: vi.fn().mockResolvedValue({}),
  addContactToRestockSignups: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../server/restock-notifications", () => ({
  triggerRestockNotifications: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../server/coaPreview", () => ({
  generateCoaPreview: vi.fn().mockResolvedValue(null),
  backfillCoaPreviews: vi.fn().mockResolvedValue({ processed: 0, failed: 0, skipped: 0 }),
}));

vi.mock("../server/paypal", () => ({
  createPaypalOrder: vi.fn().mockResolvedValue(undefined),
  capturePaypalOrder: vi.fn().mockResolvedValue(undefined),
  loadPaypalDefault: vi.fn().mockResolvedValue(undefined),
  createPayPalSubscription: vi.fn().mockResolvedValue(undefined),
  cancelPayPalSubscription: vi.fn().mockResolvedValue(undefined),
  getOrCreateSubscriptionPlan: vi.fn().mockResolvedValue(undefined),
  getSubscriptionDiscounts: vi.fn().mockReturnValue({}),
  handlePayPalWebhook: vi.fn().mockResolvedValue(undefined),
  SUBSCRIPTION_DISCOUNTS: { weekly: 0.05, biweekly: 0.1, monthly: 0.15 },
  isPayPalSandbox: vi.fn().mockReturnValue(true),
  getPaypalOrderDetails: vi.fn().mockResolvedValue(null),
}));

vi.mock("openai", () => {
  class MockOpenAI {
    chat = { completions: { create: vi.fn().mockResolvedValue({ choices: [] }) } };
  }
  return { default: MockOpenAI };
});

// ─── Import production code after mocks are declared ─────────────────────────
import { db } from "../server/db";
import { registerRoutes } from "../server/routes";

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface AuthState {
  isAuthenticated?: () => boolean;
  user?: { claims?: { sub?: string } } | undefined;
  session?: { userId?: string };
}

/**
 * Build a real Express app with the actual registerRoutes mounted.
 * Auth state is injected via middleware before routes are registered.
 */
async function buildApp(auth: AuthState): Promise<express.Express> {
  const app = express();
  app.use(express.json());

  // Inject mock auth/session into req before any route handler runs.
  app.use((req: any, _res, next) => {
    req.isAuthenticated = auth.isAuthenticated ?? (() => false);
    req.user = auth.user;
    req.session = auth.session ?? {};
    next();
  });

  const httpServer = http.createServer(app);
  await registerRoutes(httpServer, app);
  return app;
}

function getMockInsert() {
  return vi.mocked(db.insert);
}

function getCapturedValues(): { userId: string; status: string } | null {
  const insertMock = getMockInsert();
  if (!insertMock.mock.calls.length) return null;
  const valuesCallResult = (insertMock.mock.results[0].value as any).values;
  return valuesCallResult.mock.calls[0]?.[0] ?? null;
}

beforeEach(() => {
  vi.clearAllMocks();
  // Re-wire the mock chain after clearAllMocks resets return values.
  const mockCatch = vi.fn();
  const mockValues = vi.fn().mockReturnValue({ catch: mockCatch });
  vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. Authenticated path — auth-provider sub must be written to the DB
// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/promo/bac-water-declined — authenticated (OIDC) path", () => {
  it("responds 204 and writes the auth-provider sub to firstOrderPromos", async () => {
    const app = await buildApp({
      isAuthenticated: () => true,
      user: { claims: { sub: "auth-provider-sub-abc" } },
      session: {},
    });

    const res = await supertest(app).post("/api/promo/bac-water-declined");

    expect(res.status).toBe(204);
    expect(getMockInsert()).toHaveBeenCalledOnce();
    const written = getCapturedValues();
    expect(written?.userId).toBe("auth-provider-sub-abc");
    expect(written?.status).toBe("declined");
  });

  it("writes the auth-provider sub, NOT the session userId, when both are present", async () => {
    // Critical regression guard: must not revert to session userId when sub is available.
    const app = await buildApp({
      isAuthenticated: () => true,
      user: { claims: { sub: "provider-sub-canonical" } },
      session: { userId: "session-user-different" },
    });

    const res = await supertest(app).post("/api/promo/bac-water-declined");

    expect(res.status).toBe(204);
    const written = getCapturedValues();
    expect(written?.userId).toBe("provider-sub-canonical");
    expect(written?.userId).not.toBe("session-user-different");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Session-only (unauthenticated) fallback
// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/promo/bac-water-declined — session-only fallback", () => {
  it("responds 204 and writes session.userId when not authenticated", async () => {
    const app = await buildApp({
      isAuthenticated: () => false,
      user: undefined,
      session: { userId: "session-only-user-123" },
    });

    const res = await supertest(app).post("/api/promo/bac-water-declined");

    expect(res.status).toBe(204);
    expect(getMockInsert()).toHaveBeenCalledOnce();
    const written = getCapturedValues();
    expect(written?.userId).toBe("session-only-user-123");
    expect(written?.status).toBe("declined");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Anonymous — no insert, always 204
// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/promo/bac-water-declined — anonymous (no identity)", () => {
  it("responds 204 and skips the DB insert when no user identity is present", async () => {
    const app = await buildApp({
      isAuthenticated: () => false,
      user: undefined,
      session: {},
    });

    const res = await supertest(app).post("/api/promo/bac-water-declined");

    expect(res.status).toBe(204);
    expect(getMockInsert()).not.toHaveBeenCalled();
  });
});
