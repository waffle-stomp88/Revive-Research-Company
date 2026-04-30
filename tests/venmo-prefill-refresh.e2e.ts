import { test, expect, request } from "@playwright/test";

/**
 * Browser-level e2e tests for the Venmo pre-fill behaviour after a page refresh.
 *
 * Task #182 added an API fallback that re-fetches the order total from
 * GET /api/orders/:id when sessionStorage is empty (i.e. after a hard refresh).
 * Task #185 added the equivalent CashApp test.  These tests cover the same code
 * path for the Venmo payment method so a regression cannot go undetected.
 *
 * Flow under test:
 *   1. Create a test order via POST /api/orders/manual with isTest:true.
 *      This skips stock decrement and email side-effects entirely.
 *   2. Navigate directly to /order-confirmation?manual=true&method=venmo&orderId=<id>
 *      with sessionStorage intentionally empty — simulating a page refresh.
 *   3. The page should fall back to GET /api/orders/:id and display the amount.
 *   4. Clean up the test order via DELETE /api/orders/test-cleanup/:id (afterAll).
 *
 * Assertions (all in a single page load to avoid redundant round-trips):
 *   - The blue "Amount to send" hero renders with the correct dollar amount.
 *   - The "Open in Venmo" button is visible and not disabled.
 *   - The description below the button mentions the pre-filled amount.
 */

const PRODUCT_ID = "c076a497-fa30-45ea-9b65-d72d52b24f3b"; // TB-500, $49.99
const PRODUCT_PRICE = 49.99;
const EXPECTED_AMOUNT = "49.99";

test.describe("Venmo pre-fill — page refresh (sessionStorage empty)", () => {
  let orderId: string;

  test.beforeAll(async () => {
    const ctx = await request.newContext({ baseURL: "http://localhost:5000" });
    const res = await ctx.post("/api/orders/manual", {
      data: {
        paymentMethod: "venmo",
        customerEmail: "venmo-test@example.com",
        customerName: "Venmo Test User",
        shippingAddress: {
          street: "123 Test St",
          city: "Austin",
          state: "TX",
          zip: "78701",
          country: "US",
        },
        items: [
          {
            productId: PRODUCT_ID,
            quantity: 1,
            price: PRODUCT_PRICE,
          },
        ],
        total: PRODUCT_PRICE,
        isTest: true,
      },
    });

    if (!res.ok()) {
      const body = await res.text();
      throw new Error(`Failed to create test order: ${res.status()} ${body}`);
    }

    const order = await res.json();
    orderId = order.id;
    await ctx.dispose();
  });

  test.afterAll(async () => {
    if (!orderId) return;
    const ctx = await request.newContext({ baseURL: "http://localhost:5000" });
    await ctx.delete(`/api/orders/test-cleanup/${orderId}`);
    await ctx.dispose();
  });

  test("amount hero, Venmo button, and pre-fill description are all correct after refresh", async ({ page }) => {
    // Navigate directly — sessionStorage is empty in a fresh page context,
    // which mirrors the post-refresh state the fallback logic handles.
    await page.goto(
      `/order-confirmation?manual=true&method=venmo&orderId=${orderId}`
    );

    // Wait for the API fallback to complete and the Venmo button to appear.
    const venmoButton = page.locator('[data-testid="button-open-venmo"]');
    await expect(venmoButton).toBeVisible({ timeout: 15000 });

    // 1. "Open in Venmo" button must be enabled (not disabled while loading).
    await expect(venmoButton).toBeEnabled();

    // 2. The blue "Amount to send" hero must display the correct dollar amount.
    const amountHero = page.locator("text=Amount to send").locator("..");
    await expect(amountHero).toBeVisible();
    await expect(amountHero).toContainText(EXPECTED_AMOUNT);

    // 3. The description below the button must include the pre-filled amount.
    //    Rendered as: "Opens pre-filled with @reviveresearchco and $49.99"
    const description = page.locator("text=Opens pre-filled with");
    await expect(description).toBeVisible();
    await expect(description).toContainText(EXPECTED_AMOUNT);
  });
});
