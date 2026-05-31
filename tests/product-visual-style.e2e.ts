import { test, expect } from "@playwright/test";

/**
 * Visual-regression guard tests for product detail pages.
 *
 * These tests assert that the core design elements introduced with the
 * BPC-157 redesign — and subsequently applied to all product pages —
 * continue to render correctly as the codebase evolves.
 *
 * Covered elements on each product page:
 *   1. Category stripe label (coloured accent bar + mono text)
 *   2. Gradient separator line between product name and price
 *   3. Mechanism descriptor rendered above the price (or price gate placeholder)
 *   4. Bordered dosage selection container
 *   5. Trust badge bar with two segments ("3rd Party Tested", "Cold Chain Shipping")
 *   6. Checkmark badge on the default-selected "One-time" purchase option
 *   7. Stacked CTA column: Buy Now appears above Add to Cart in a vertical stack
 *
 * Products tested:
 *   - BPC-157        → /peptides/bpc-157       (Regenerative category)
 *   - Ipamorelin     → /peptides/ipamorelin    (GH-axis category)
 *   - GHK-Cu         → /peptides/ghk-cu        (Skin category)
 *
 * For products that are currently out of stock the stock-gated tests are
 * explicitly skipped only when the canonical out-of-stock panel
 * ([data-testid="panel-out-of-stock"]) is present.  If that panel is absent
 * the test still fails — catching accidental element removal regressions.
 *
 * When the soft gate (VITE_SOFT_GATE_ENABLED) is active for unauthenticated
 * visitors, the price and CTA area are replaced by an inline auth gate.
 * Tests that check gated elements are explicitly skipped in that case.
 */

interface ProductCase {
  name: string;
  slug: string;
  expectedStripeLabel: string;
}

const PRODUCTS: ProductCase[] = [
  {
    name: "BPC-157",
    slug: "bpc-157",
    expectedStripeLabel: "Regenerative Peptide",
  },
  {
    name: "Ipamorelin",
    slug: "ipamorelin",
    expectedStripeLabel: "GH Secretagogue",
  },
  {
    name: "GHK-Cu",
    slug: "ghk-cu",
    expectedStripeLabel: "Skin & Collagen Peptide",
  },
];

/** Returns true when the page is showing the out-of-stock panel. */
async function isOutOfStock(page: import("@playwright/test").Page): Promise<boolean> {
  // Wait for the page to render the CTA stack, the auth-gate sign-in button, or the OOS panel.
  await page.waitForSelector(
    '[data-testid="stack-cta"], [data-testid="panel-out-of-stock"], [data-testid="auth-gate-inline"]',
    { timeout: 10000 }
  );
  // Allow any in-flight network requests (e.g. dosage-stock API) to finish so we
  // observe the *final* rendered state rather than the transient in-stock state
  // that exists while dosage data is still loading.
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
  const panelCount = await page.locator('[data-testid="panel-out-of-stock"]').count();
  return panelCount > 0;
}

/**
 * Returns true when the soft auth gate is active — price and CTA elements are
 * replaced by the inline auth gate for unauthenticated visitors.
 */
async function isSoftGated(page: import("@playwright/test").Page): Promise<boolean> {
  const gateCount = await page.locator('[data-testid="auth-gate-inline"]').count();
  return gateCount > 0;
}

for (const product of PRODUCTS) {
  test.describe(`Product page visual elements — ${product.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/peptides/${product.slug}`, { waitUntil: "domcontentloaded" });
      await page.waitForSelector('[data-testid="text-product-name"]', { timeout: 15000 });
    });

    test("category stripe label is visible and contains the expected text", async ({ page }) => {
      const stripe = page.locator('[data-testid="stripe-category"]');
      await expect(stripe).toBeVisible({ timeout: 10000 });
      await expect(stripe).toContainText(product.expectedStripeLabel);
      await expect(stripe).toContainText("Research Grade");
    });

    test("gradient separator line is visible below the product name", async ({ page }) => {
      const separator = page.locator('[data-testid="separator-gradient"]');
      await expect(separator).toBeVisible({ timeout: 10000 });
    });

    test("mechanism descriptor appears above the product price", async ({ page }) => {
      // Skip when out of stock — the price element (OrderSummary) is intentionally hidden.
      if (await isOutOfStock(page)) {
        test.skip(true, `${product.name} is currently out of stock — price element is hidden`);
        return;
      }
      const descriptor = page.locator('[data-testid="text-mechanism-descriptor"]');
      // When soft gate is active this locator resolves to the price-gate placeholder
      // element, which carries the same testid and is in the correct position.
      const price = page.locator('[data-testid="text-product-price"]');
      await expect(descriptor).toBeVisible({ timeout: 10000 });
      await expect(price).toBeVisible({ timeout: 10000 });

      const descriptorBox = await descriptor.boundingBox();
      const priceBox = await price.boundingBox();
      expect(descriptorBox).not.toBeNull();
      expect(priceBox).not.toBeNull();
      expect(descriptorBox!.y).toBeLessThan(priceBox!.y);
    });

    test("bordered dosage container is rendered", async ({ page }) => {
      const dosageBox = page.locator('[data-testid="box-dosage"]');
      await expect(dosageBox).toBeVisible({ timeout: 10000 });
    });

    test("trust badge bar shows both segments", async ({ page }) => {
      const bar = page.locator('[data-testid="bar-trust-badges"]');
      await expect(bar).toBeVisible({ timeout: 10000 });
      await expect(bar).toContainText("3rd Party Tested");
      await expect(bar).toContainText("Cold Chain Shipping");
    });

    test("checkmark is visible on the default-selected one-time purchase option", async ({ page }) => {
      // Skip when the product is out of stock — purchase options are intentionally hidden.
      if (await isOutOfStock(page)) {
        test.skip(true, `${product.name} is currently out of stock — purchase options are hidden`);
        return;
      }
      // Skip when the soft gate is active — purchase options are replaced by the auth gate.
      if (await isSoftGated(page)) {
        test.skip(true, `${product.name} — soft gate active for unauthenticated visitor`);
        return;
      }
      const optionOneTime = page.locator('[data-testid="option-one-time"]');
      await expect(optionOneTime).toBeVisible({ timeout: 10000 });
      const checkmark = page.locator('[data-testid="check-one-time"]');
      await expect(checkmark).toBeVisible({ timeout: 10000 });
    });

    test("Buy Now and Add to Cart buttons are stacked vertically in the CTA column", async ({ page }) => {
      // Skip when the product is explicitly out of stock.
      if (await isOutOfStock(page)) {
        test.skip(true, `${product.name} is currently out of stock — CTA stack is hidden`);
        return;
      }
      // Skip when the soft gate is active — buttons are replaced by the auth gate.
      if (await isSoftGated(page)) {
        test.skip(true, `${product.name} — soft gate active for unauthenticated visitor`);
        return;
      }

      // The CTA container must be present and visible.
      const ctaStack = page.locator('[data-testid="stack-cta"]');
      await expect(ctaStack).toBeVisible({ timeout: 10000 });

      // Both primary action buttons must live inside the CTA stack.
      const buyNow = ctaStack.locator('[data-testid="button-buy-now"]');
      const addToCart = ctaStack.locator('[data-testid="button-add-to-cart"]');
      await expect(buyNow).toBeVisible({ timeout: 10000 });
      await expect(addToCart).toBeVisible({ timeout: 10000 });

      // Verify stacked layout: Buy Now must appear above Add to Cart.
      const buyNowBox = await buyNow.boundingBox();
      const addToCartBox = await addToCart.boundingBox();
      expect(buyNowBox).not.toBeNull();
      expect(addToCartBox).not.toBeNull();
      expect(buyNowBox!.y).toBeLessThan(addToCartBox!.y);
    });
  });
}
