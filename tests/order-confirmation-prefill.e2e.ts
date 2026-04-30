import { test, expect } from "@playwright/test";

/**
 * Confirms that the Venmo deep-link amount= parameter is pre-filled correctly
 * after a page refresh clears sessionStorage (API fallback added in task #182).
 *
 * The button's data-venmo-href attribute and its onClick both call the same
 * buildVenmoDeepLink helper, so reading the attribute gives an accurate
 * signal of what the click handler would pass to window.location.href.
 */

const MOCK_ORDER_ID = "test-order-abc12345678";
const MOCK_TOTAL_STR = "99.99";

test.describe("Order confirmation — Venmo deep-link pre-fill after page refresh", () => {
  test.beforeEach(async ({ page }) => {
    // Pre-accept the age gate (stored in sessionStorage) so the modal doesn't block interactions.
    await page.addInitScript(() => {
      sessionStorage.setItem("revive-research-age-verified", "true");
    });

    await page.route(`**/api/orders/${MOCK_ORDER_ID}`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: MOCK_ORDER_ID,
          totalAmount: MOCK_TOTAL_STR,
          email: "customer@example.com",
          paypalOrderId: "",
          status: "pending",
        }),
      });
    });
  });

  test("displays the order total fetched from the API when sessionStorage is empty", async ({
    page,
  }) => {
    await page.goto(
      `/order-confirmation?orderId=${MOCK_ORDER_ID}&manual=true&method=venmo`
    );

    await expect(page.locator("text=$99.99").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator(`text=and $${MOCK_TOTAL_STR}`)).toBeVisible({ timeout: 5000 });
  });

  test("Open in Venmo deep-link contains the correct amount= parameter after API fallback", async ({
    page,
  }) => {
    await page.goto(
      `/order-confirmation?orderId=${MOCK_ORDER_ID}&manual=true&method=venmo`
    );

    const venmoButton = page.locator('[data-testid="button-open-venmo"]');
    await expect(venmoButton).toBeEnabled({ timeout: 10000 });

    // data-venmo-href is set by the same buildVenmoDeepLink call used in onClick,
    // so this attribute accurately reflects the URL the button would open.
    const venmoHref = await venmoButton.getAttribute("data-venmo-href");

    expect(venmoHref).not.toBeNull();
    expect(venmoHref).toContain(`amount=${MOCK_TOTAL_STR}`);
    expect(venmoHref).toContain("venmo://paycharge");
    expect(venmoHref).toContain("recipients=reviveresearchco");
  });
});

test.describe("Order confirmation — CashApp deep-link pre-fill after page refresh", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem("revive-research-age-verified", "true");
    });

    await page.route(`**/api/orders/${MOCK_ORDER_ID}`, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: MOCK_ORDER_ID,
          totalAmount: MOCK_TOTAL_STR,
          email: "customer@example.com",
          paypalOrderId: "",
          status: "pending",
        }),
      });
    });
  });

  test("displays the order total fetched from the API when sessionStorage is empty", async ({
    page,
  }) => {
    await page.goto(
      `/order-confirmation?orderId=${MOCK_ORDER_ID}&manual=true&method=cashapp`
    );

    await expect(page.locator("text=$99.99").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator(`text=and $${MOCK_TOTAL_STR}`)).toBeVisible({ timeout: 5000 });
  });

  test("Open in CashApp deep-link contains the correct amount in the URL after API fallback", async ({
    page,
  }) => {
    await page.goto(
      `/order-confirmation?orderId=${MOCK_ORDER_ID}&manual=true&method=cashapp`
    );

    const cashAppButton = page.locator('[data-testid="button-open-cashapp"]');
    await expect(cashAppButton).toBeEnabled({ timeout: 10000 });

    // data-cashapp-href mirrors the URL constructed in onClick,
    // so this attribute accurately reflects what the button would open.
    const cashAppHref = await cashAppButton.getAttribute("data-cashapp-href");

    expect(cashAppHref).not.toBeNull();
    expect(cashAppHref).toContain(MOCK_TOTAL_STR);
    expect(cashAppHref).toContain("cash.app");
    expect(cashAppHref).toContain("reviveresearchco");
  });
});
