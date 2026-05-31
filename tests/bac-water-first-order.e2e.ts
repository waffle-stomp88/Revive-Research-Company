import { test, expect, request as playwrightRequest } from "@playwright/test";

/**
 * Verifies the free 3 ml BAC water promo for first-time buyers.
 *
 * Three coverage areas:
 *
 *  1. API — GET /api/my-first-order-status without a session cookie must
 *     return isFirstOrder: true and a non-null bacWaterProductId so guests
 *     (and session-expired users) always qualify for the promo.
 *
 *  2. Cart — when a first-time authenticated user has a peptide in the cart
 *     the BAC water is auto-injected and the cart renders the
 *     "Free — First Order" badge (data-testid="badge-free-<id>") together
 *     with the info banner (data-testid="banner-first-order-bac").
 *
 *  3. Checkout — after advancing through the shipping step the Order Review
 *     panel shows "Free — First Order" (data-testid="text-free-first-order")
 *     for the injected BAC water line item.
 *
 * Relevant files:
 *   server/routes.ts        – /api/my-first-order-status endpoint (~line 677)
 *   server/routes.ts        – PayPal order creation (~line 1267)
 *   client/src/pages/cart.tsx
 *   client/src/pages/checkout.tsx
 *   client/src/contexts/CartContext.tsx
 *   client/src/components/protected-route.tsx  (auth gate)
 */

const BAC_WATER_PRODUCT_ID = "afbee9d8-e3bb-444d-a798-35f52ce0edda";

/** A real in-stock peptide used to seed the cart in browser tests. */
const PEPTIDE_CART_ITEM = {
  productId: "069bc54f-3ec8-4be2-9a57-ac4a86f9d6a5", // RR-A3
  name: "RR-A3",
  price: 110,
  quantity: 1,
  dosage: "10mg",
};

/**
 * Mock user returned by /api/auth/user.
 * The ProtectedRoute renders children as soon as this query resolves.
 */
const MOCK_USER = {
  id: "test-first-time-buyer",
  email: "testbuyer@example.com",
  username: "testbuyer",
  firstName: "Test",
  lastName: "Buyer",
  isAdmin: false,
  emailVerified: true,
  // Non-null attestation so the site-wide RUO attestation modal is skipped.
  ruoAttestationAt: new Date("2024-01-01T00:00:00.000Z").toISOString(),
};

/**
 * Mock first-order status returned by /api/my-first-order-status.
 * Pins the BAC water product ID so the badge assertion is stable.
 */
const MOCK_FIRST_ORDER_STATUS = {
  isFirstOrder: true,
  bacWaterProductId: BAC_WATER_PRODUCT_ID,
  bacWaterName: "Bacteriostatic Water",
  bacWaterDosage: "3mL",
  bacWaterImageUrl: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. API / server integration
// ─────────────────────────────────────────────────────────────────────────────

test.describe("BAC water promo — API (no session)", () => {
  test(
    "GET /api/my-first-order-status without a session cookie returns isFirstOrder: true with BAC water data",
    async () => {
      // Use a fresh context with no cookies so there is no session at all.
      const ctx = await playwrightRequest.newContext({
        baseURL: "http://localhost:5000",
      });
      try {
        const res = await ctx.get("/api/my-first-order-status");
        expect(res.status()).toBe(200);

        const data = await res.json();

        // No session ⇒ treat as first-time buyer
        expect(data.isFirstOrder).toBe(true);

        // BAC water product must be identified so the promo can be applied
        expect(data.bacWaterProductId).toBeTruthy();
        expect(typeof data.bacWaterProductId).toBe("string");

        // The dosage the promo applies to must be present
        expect(data.bacWaterDosage).toBeTruthy();

        // Name should be populated for display in the cart
        expect(data.bacWaterName).toBeTruthy();
      } finally {
        await ctx.dispose();
      }
    }
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Shared helper: mock auth + first-order API routes so the ProtectedRoute
// passes and the first-order promo is always seen as active.
// ─────────────────────────────────────────────────────────────────────────────

async function mockAuthAndPromo(page: any) {
  // Make the ProtectedRoute believe a user is signed in.
  await page.route("**/api/auth/user", (route: any) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_USER),
    })
  );

  // CartContext fetches /api/cart for authenticated users; return an empty
  // server cart so it doesn't overwrite the localStorage-seeded items.
  await page.route("**/api/cart", (route: any) => {
    if (route.request().method() === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: [] }),
      });
    }
    return route.continue();
  });

  // Pin the first-order status so the badge/banner always appear.
  await page.route("**/api/my-first-order-status", (route: any) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_FIRST_ORDER_STATUS),
    })
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Cart page
// ─────────────────────────────────────────────────────────────────────────────

test.describe("BAC water promo — cart badge", () => {
  test(
    "first-time user: free 'First Order' banner and badge appear after peptide is added to cart",
    async ({ page }) => {
      // Bypass auth + promo API before any navigation.
      await mockAuthAndPromo(page);

      // Seed the cart with a single peptide via localStorage so CartContext
      // sees the item immediately on first render.
      await page.addInitScript((item) => {
        localStorage.setItem(
          "revive-research-cart",
          JSON.stringify([item])
        );
      }, PEPTIDE_CART_ITEM);

      await page.goto("/cart");

      // ── Banner ────────────────────────────────────────────────────────────
      const banner = page.locator('[data-testid="banner-first-order-bac"]');
      await expect(banner).toBeVisible({ timeout: 15_000 });

      // ── Free badge on the auto-injected BAC water line item ───────────────
      // cart.tsx renders a mobile layout (md:hidden) at [0] and a desktop
      // layout (hidden md:flex) at [1]. At the default 1280 px viewport the
      // desktop instance is visible; target it explicitly with .nth(1).
      const freeBadge = page
        .locator(`[data-testid="badge-free-${BAC_WATER_PRODUCT_ID}"]`)
        .nth(1);
      await expect(freeBadge).toBeVisible({ timeout: 10_000 });
      await expect(freeBadge).toContainText("Free — First Order");
    }
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Checkout order summary
// ─────────────────────────────────────────────────────────────────────────────

test.describe("BAC water promo — checkout order summary", () => {
  test(
    "'Free — First Order' label appears in the Order Review panel for the injected BAC water item",
    async ({ page }) => {
      await mockAuthAndPromo(page);

      // Seed cart with the peptide; BAC water will be auto-injected by
      // CartContext once it receives isFirstOrder: true from the API.
      await page.addInitScript((item) => {
        localStorage.setItem(
          "revive-research-cart",
          JSON.stringify([item])
        );
      }, PEPTIDE_CART_ITEM);

      // fromCart=true activates the 2-step cart checkout flow;
      // without it the page renders "No Product Selected".
      await page.goto("/checkout?fromCart=true");

      // ── Step 0: Accept the RUO reminder dialog ───────────────────────────
      // The span (data-testid="checkbox-ruo-acknowledge") is inside the div
      // that holds the onClick handler — clicking it bubbles to the parent.
      await page.locator('[data-testid="checkbox-ruo-acknowledge"]').click();
      const confirmBtn = page.locator('[data-testid="button-confirm-ruo"]');
      await expect(confirmBtn).toBeEnabled({ timeout: 5_000 });
      await confirmBtn.click();

      // ── Step 1: Fill in the shipping form ─────────────────────────────────
      await expect(
        page.locator('[data-testid="input-customer-name"]')
      ).toBeVisible({ timeout: 10_000 });

      await page.fill('[data-testid="input-customer-name"]', "Test Researcher");
      await page.fill(
        '[data-testid="input-customer-email"]',
        "test-researcher@example.com"
      );
      await page.fill('[data-testid="input-street"]', "456 Science Blvd");
      await page.fill('[data-testid="input-city"]', "Austin");

      // Radix Select — open the trigger then pick TX
      await page.locator('[data-testid="select-state"]').click();
      await page.getByRole("option", { name: "TX" }).click();

      await page.fill('[data-testid="input-zip"]', "78701");

      // ── Advance to the Payment step ───────────────────────────────────────
      await page.locator('[data-testid="button-continue-to-payment"]').click();

      // ── Step 2: Order Review panel should show "Free — First Order" ───────
      const freeLabel = page.locator('[data-testid="text-free-first-order"]');
      await expect(freeLabel).toBeVisible({ timeout: 15_000 });
      await expect(freeLabel).toContainText("Free — First Order");
    }
  );
});
