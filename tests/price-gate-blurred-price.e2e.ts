import { test, expect } from "@playwright/test";

/**
 * E2E tests verifying that the blurred price shown to unauthenticated users
 * inside the price gate derives its value from the real product price returned
 * by the API (via getBasePrice()), rather than a hardcoded placeholder.
 *
 * Guard against regressions where:
 *   - A hardcoded value is reintroduced instead of using the API price
 *   - The blurred price and the authenticated price diverge from each other
 *   - A sale/original price is displayed correctly in the blurred section
 *
 * Strategy:
 *   - Mock /api/auth/user → null  (unauthenticated, no session cookie tricks needed)
 *   - Mock /api/products/:slug  → product with known price "89.00"
 *   - Mock all supporting endpoints by BOTH slug and numeric ID so the page
 *     stays fully hermetic after product load resolves the numeric id
 *   - Assert that [data-testid="blurred-gate-price"] contains "$89.00"
 *   - Assert it does NOT contain a stale placeholder like "$0.00"
 */

const PRODUCT_SLUG = "test-peptide-price-gate";
const PRODUCT_ID = 9001;
const PRODUCT_PRICE = "89.00";
const PRODUCT_ORIGINAL_PRICE = "119.00";

const MOCK_PRODUCT = {
  id: PRODUCT_ID,
  name: "Test Peptide BPC-157",
  slug: PRODUCT_SLUG,
  description: "A test peptide compound for automated testing purposes.",
  shortDescription: "Test peptide for price gate verification.",
  price: PRODUCT_PRICE,
  originalPrice: PRODUCT_ORIGINAL_PRICE,
  category: "recovery",
  inStock: true,
  stockAmount: 50,
  baselinePrice: null,
  imageUrl: null,
  images: [],
  dosages: [],
  tags: [],
  featured: false,
  labVerified: true,
  saleOfWeek: false,
  allowSubscription: false,
  subscriptionDiscounts: null,
  formula: null,
  molecularWeight: null,
  purity: "99%+",
  storage: "2-8°C",
  appearance: "White lyophilized powder",
  solubility: "Soluble in water",
  reconstitution: null,
  halfLife: null,
  researchUse: "In vitro research only",
  warningText: null,
  seoTitle: null,
  seoDescription: null,
  seoKeywords: null,
  isRetired: false,
  retiredRedirectSlug: null,
  priceOverrideLabel: null,
};

/** Mock a single resource at both its slug path and numeric-ID path. */
async function mockBySlugAndId(
  page: import("@playwright/test").Page,
  suffix: string,
  body: unknown,
  status = 200
) {
  const json = JSON.stringify(body);
  for (const key of [PRODUCT_SLUG, String(PRODUCT_ID)]) {
    await page.route(`**/api/products/${key}${suffix}`, (route) => {
      route.fulfill({ status, contentType: "application/json", body: json });
    });
  }
}

async function setupCommonMocks(page: import("@playwright/test").Page) {
  // Unauthenticated — no user session
  await page.route("**/api/auth/user", (route) => {
    route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify(null) });
  });

  // Main product endpoint (by slug)
  await page.route(`**/api/products/${PRODUCT_SLUG}`, (route) => {
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_PRODUCT) });
  });

  // No dosage stocks → getBasePrice() falls back to product.price directly
  await mockBySlugAndId(page, "/dosage-stocks", []);

  // Supporting per-product endpoints — mocked by BOTH slug and numeric ID
  // so they remain intercepted after product load resolves product.id
  await mockBySlugAndId(page, "/storage", null);
  await mockBySlugAndId(page, "/batches", []);
  await mockBySlugAndId(page, "/coas", []);
  await mockBySlugAndId(page, "/education", []);

  // Global product list endpoints
  await page.route("**/api/products/selling-fast", (route) => {
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  });
  await page.route("**/api/products/votes", (route) => {
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  });
  await page.route("**/api/products", (route) => {
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([MOCK_PRODUCT]) });
  });
  await page.route("**/api/wishlist/check/**", (route) => {
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ isInWishlist: false }) });
  });
}

test.describe("Price gate — blurred price matches real product price", () => {
  test.beforeEach(async ({ page }) => {
    // Accept the age gate so the modal does not block the price section
    await page.addInitScript(() => {
      sessionStorage.setItem("revive-research-age-verified", "true");
    });

    await setupCommonMocks(page);
  });

  test("blurred price shown to unauthenticated users matches the API product price", async ({ page }) => {
    await page.goto(`/peptides/${PRODUCT_SLUG}`);

    const gateContainer = page.locator('[data-testid="blurred-gate-price"]');
    await expect(gateContainer).toBeVisible({ timeout: 15000 });

    const priceText = await gateContainer.textContent();
    expect(priceText).toContain(`$${PRODUCT_PRICE}`);
  });

  test("blurred price includes the original (strike-through) price when product is on sale", async ({ page }) => {
    await page.goto(`/peptides/${PRODUCT_SLUG}`);

    const gateContainer = page.locator('[data-testid="blurred-gate-price"]');
    await expect(gateContainer).toBeVisible({ timeout: 15000 });

    const priceText = await gateContainer.textContent();
    // Both the sale price and the crossed-out original price should be visible
    expect(priceText).toContain(`$${PRODUCT_PRICE}`);
    expect(priceText).toContain(`$${PRODUCT_ORIGINAL_PRICE}`);
  });

  test("blurred price does NOT contain a hardcoded placeholder value", async ({ page }) => {
    await page.goto(`/peptides/${PRODUCT_SLUG}`);

    const gateContainer = page.locator('[data-testid="blurred-gate-price"]');
    await expect(gateContainer).toBeVisible({ timeout: 15000 });

    const priceText = await gateContainer.textContent() ?? "";

    // $0.00 would indicate the product data was not used (e.g. early return in getBasePrice)
    expect(priceText).not.toContain("$0.00");

    // Price must match the mocked API value exactly — any other dollar amount signals
    // a hardcoded fallback was reintroduced
    expect(priceText).toContain(`$${PRODUCT_PRICE}`);
  });

  test("blurred price matches the price shown to authenticated users for the same product", async ({ page }) => {
    await page.goto(`/peptides/${PRODUCT_SLUG}`);

    const gateContainer = page.locator('[data-testid="blurred-gate-price"]');
    await expect(gateContainer).toBeVisible({ timeout: 15000 });

    // Extract the dollar amount shown in the blurred preview (e.g. "$89.00")
    const blurredText = await gateContainer.textContent() ?? "";
    const blurredMatch = blurredText.match(/\$(\d+\.\d{2})/);
    expect(blurredMatch).not.toBeNull();
    const blurredPrice = blurredMatch![1]; // e.g. "89.00"

    // Now mock an authenticated session and reload
    await page.route("**/api/auth/user", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: 1, email: "researcher@example.com", isAdmin: false }),
      });
    });

    await page.reload();

    // Authenticated view shows the real price in data-testid="text-product-price"
    const authenticatedPriceEl = page.locator('[data-testid="text-product-price"]');
    await expect(authenticatedPriceEl).toBeVisible({ timeout: 15000 });

    const authenticatedText = await authenticatedPriceEl.textContent() ?? "";
    const authenticatedMatch = authenticatedText.match(/\$(\d+\.\d{2})/);
    expect(authenticatedMatch).not.toBeNull();
    const authenticatedPrice = authenticatedMatch![1];

    // The two extracted prices must be identical — not just each matching a shared constant
    expect(blurredPrice).toBe(authenticatedPrice);

    // Also confirm both values equal the known mocked API price
    expect(blurredPrice).toBe(PRODUCT_PRICE);
    expect(authenticatedPrice).toBe(PRODUCT_PRICE);
  });
});
