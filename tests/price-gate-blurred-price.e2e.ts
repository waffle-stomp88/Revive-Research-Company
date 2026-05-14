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

// Dosage-variant test constants — prices deliberately differ from PRODUCT_PRICE
// so a regression (falling back to product.price) is unambiguously detectable.
const DOSAGE_PRODUCT_SLUG = "test-peptide-dosage-gate";
const DOSAGE_PRODUCT_ID = 9002;
const DOSAGE_BASE_PRICE = "89.00";   // the product-level fallback — must NOT appear
const DOSAGE_5MG_PRICE  = "65.00";   // lowest in-stock dosage → auto-selected default
const DOSAGE_10MG_PRICE = "99.00";   // higher dosage for variant-switch assertion

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

const MOCK_DOSAGE_PRODUCT = {
  id: DOSAGE_PRODUCT_ID,
  name: "Test Peptide BPC-157 Dosage",
  slug: DOSAGE_PRODUCT_SLUG,
  description: "A test peptide with multiple dosage variants for price gate verification.",
  shortDescription: "Dosage-variant test peptide.",
  price: DOSAGE_BASE_PRICE,
  originalPrice: null,
  category: "recovery",
  inStock: true,
  stockAmount: 45,
  baselinePrice: null,
  imageUrl: null,
  images: [],
  dosages: ["5mg", "10mg"],
  dosageOptions: ["5mg", "10mg"],
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

const MOCK_DOSAGE_STOCKS = [
  {
    id: 1,
    productId: DOSAGE_PRODUCT_ID,
    dosage: "5mg",
    price: DOSAGE_5MG_PRICE,
    originalPrice: null,
    inStock: true,
    stockAmount: 25,
  },
  {
    id: 2,
    productId: DOSAGE_PRODUCT_ID,
    dosage: "10mg",
    price: DOSAGE_10MG_PRICE,
    originalPrice: null,
    inStock: true,
    stockAmount: 20,
  },
];

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

/**
 * Additional describe block covering the dosage-variant code path inside getBasePrice().
 *
 * When a product has multiple dosage options backed by per-dosage stock records, the
 * page auto-selects the lowest in-stock dosage and then derives getBasePrice() from
 * selectedDosageStock.price — not from product.price.  A regression in that branch
 * would silently show the wrong price to unauthenticated users.
 *
 * Strategy:
 *   - Mock /api/products/:slug → product with dosageOptions ["5mg", "10mg"]
 *     and product.price = "89.00" (the fallback that must NOT appear)
 *   - Mock /api/products/:id/dosage-stocks → two entries:
 *       5mg @ $65.00  (lower → auto-selected default)
 *       10mg @ $99.00 (higher)
 *   - Assert blurred-gate-price shows the 5mg dosage price ($65.00), not $89.00
 *   - Switch the dosage selector to 10mg and assert the blurred price updates to $99.00
 *   - Assert product.price ($89.00) never appears in the blurred gate section
 */
test.describe("Price gate — blurred price reflects selected dosage variant", () => {
  async function setupDosageMocks(page: import("@playwright/test").Page) {
    // Unauthenticated session
    await page.route("**/api/auth/user", (route) => {
      route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify(null) });
    });

    // Main product endpoint (by slug)
    await page.route(`**/api/products/${DOSAGE_PRODUCT_SLUG}`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_DOSAGE_PRODUCT),
      });
    });

    // Dosage stocks — by BOTH slug and numeric ID so the page stays hermetic after it
    // resolves the numeric id from the product response.
    const dosageStocksJson = JSON.stringify(MOCK_DOSAGE_STOCKS);
    for (const key of [DOSAGE_PRODUCT_SLUG, String(DOSAGE_PRODUCT_ID)]) {
      await page.route(`**/api/products/${key}/dosage-stocks`, (route) => {
        route.fulfill({ status: 200, contentType: "application/json", body: dosageStocksJson });
      });
    }

    // Supporting per-product endpoints — mocked by BOTH slug and numeric ID
    for (const key of [DOSAGE_PRODUCT_SLUG, String(DOSAGE_PRODUCT_ID)]) {
      await page.route(`**/api/products/${key}/storage`, (route) => {
        route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(null) });
      });
      await page.route(`**/api/products/${key}/batches`, (route) => {
        route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
      });
      await page.route(`**/api/products/${key}/coas`, (route) => {
        route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
      });
      await page.route(`**/api/products/${key}/education`, (route) => {
        route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
      });
    }

    // Global product list endpoints
    await page.route("**/api/products/selling-fast", (route) => {
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
    });
    await page.route("**/api/products/votes", (route) => {
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
    });
    await page.route("**/api/products", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([MOCK_DOSAGE_PRODUCT]),
      });
    });
    await page.route("**/api/wishlist/check/**", (route) => {
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ isInWishlist: false }) });
    });
  }

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem("revive-research-age-verified", "true");
    });
    await setupDosageMocks(page);
  });

  test("blurred gate price uses the dosage-specific price (5mg default), not product.price", async ({ page }) => {
    await page.goto(`/peptides/${DOSAGE_PRODUCT_SLUG}`);

    const gateContainer = page.locator('[data-testid="blurred-gate-price"]');
    await expect(gateContainer).toBeVisible({ timeout: 15000 });

    // Use Playwright's polling assertion so we wait until the dosage stocks have
    // loaded and getBasePrice() has switched from the product.price fallback to
    // the dosage-specific price.  A plain textContent() read would race against
    // the async /dosage-stocks response and could capture the stale fallback.
    await expect(gateContainer).toContainText(`$${DOSAGE_5MG_PRICE}`, { timeout: 10000 });

    // With the 5mg price confirmed, also verify the fallback is absent.
    const priceText = await gateContainer.textContent() ?? "";
    expect(priceText).not.toContain(`$${DOSAGE_BASE_PRICE}`);
  });

  test("blurred gate price updates to the newly selected dosage price when the variant changes", async ({ page }) => {
    await page.goto(`/peptides/${DOSAGE_PRODUCT_SLUG}`);

    const gateContainer = page.locator('[data-testid="blurred-gate-price"]');
    await expect(gateContainer).toBeVisible({ timeout: 15000 });

    // Wait for dosage stocks to load before checking or interacting with the selector.
    await expect(gateContainer).toContainText(`$${DOSAGE_5MG_PRICE}`, { timeout: 10000 });

    // Open the dosage select and pick 10mg
    const dosageTrigger = page.locator('[data-testid="select-dosage"]');
    await dosageTrigger.click();

    // SelectContent items are rendered in a portal — match by visible text
    const tenMgOption = page.getByRole("option", { name: /10mg/i });
    await expect(tenMgOption).toBeVisible({ timeout: 5000 });
    await tenMgOption.click();

    // Blurred gate price should now reflect the 10mg dosage price
    await expect(gateContainer).toContainText(`$${DOSAGE_10MG_PRICE}`, { timeout: 5000 });

    // And the 5mg price should no longer be shown as the primary price
    const updatedText = await gateContainer.textContent() ?? "";
    expect(updatedText).not.toContain(`$${DOSAGE_5MG_PRICE}`);
  });

  test("blurred gate price never shows the base product price when dosage stocks exist", async ({ page }) => {
    await page.goto(`/peptides/${DOSAGE_PRODUCT_SLUG}`);

    const gateContainer = page.locator('[data-testid="blurred-gate-price"]');
    await expect(gateContainer).toBeVisible({ timeout: 15000 });

    // Wait until the dosage stocks have loaded and the price has updated to the
    // dosage-specific value before making the negative assertion.  Without this
    // wait, the gate might still show product.price ($89.00) as a transient
    // fallback because the /dosage-stocks response hasn't resolved yet.
    await expect(gateContainer).toContainText(`$${DOSAGE_5MG_PRICE}`, { timeout: 10000 });

    // Check on the default (5mg) selection
    let priceText = await gateContainer.textContent() ?? "";
    expect(priceText).not.toContain(`$${DOSAGE_BASE_PRICE}`);

    // Switch to 10mg and check again
    const dosageTrigger = page.locator('[data-testid="select-dosage"]');
    await dosageTrigger.click();

    const tenMgOption = page.getByRole("option", { name: /10mg/i });
    await expect(tenMgOption).toBeVisible({ timeout: 5000 });
    await tenMgOption.click();

    await expect(gateContainer).toContainText(`$${DOSAGE_10MG_PRICE}`, { timeout: 5000 });

    priceText = await gateContainer.textContent() ?? "";
    expect(priceText).not.toContain(`$${DOSAGE_BASE_PRICE}`);
  });
});
