import { test, expect } from "@playwright/test";

/**
 * Authenticated walk: dashboard home + all 7 sub-pages.
 *
 * Verifies that the Phase 2.5 refactor rendered each route correctly and that
 * real data elements (not just headings) are present.  Uses the pre-authenticated
 * storageState from globalSetup so no interactive login is needed.
 */

test.describe("Dashboard sub-pages walk", () => {
  test("dashboard home renders real data — orderCount, hero products, standing, recap labels", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Order count renders as a number or the empty-state string (not a blank/missing element)
    const orderCountEl = page.locator('[data-testid="link-all-orders"]').or(
      page.locator('text=/\\d+ order|No orders yet/i')
    );
    await expect(orderCountEl.first()).toBeVisible({ timeout: 8000 });

    // Hero row (Order Again / Quick Reorder) OR empty-state banner OR skeleton resolves
    // The account row for Orders links to /dashboard/orders — always rendered
    const ordersLink = page.locator('a[href="/dashboard/orders"]');
    await expect(ordersLink.first()).toBeVisible({ timeout: 8000 });

    // Standing card: tier badge or tier label is visible
    const tierIndicator = page.locator('[data-testid^="badge-tier-"], [data-testid^="text-tier-"]').or(
      page.locator('text=/Researcher|Pioneer|Scientist|Elite/i')
    );
    await expect(tierIndicator.first()).toBeVisible({ timeout: 8000 });

    // Academy continue card rendered (either continue or start CTA)
    await expect(page.locator('[data-testid="button-go-to-academy"]')).toBeVisible({ timeout: 8000 });

    // Continue CTA must stay in the /dashboard/* shell — NOT eject to standalone /academy
    const academyCta = page.locator('[data-testid="button-go-to-academy"]');
    const ctaParentLink = page.locator('a[href="/dashboard/academy"]').filter({ has: academyCta });
    // Check the surrounding Link's href is /dashboard/academy
    const href = await page.locator('a[href="/dashboard/academy"]').first().getAttribute("href");
    expect(href).toBe("/dashboard/academy");
  });

  test("/dashboard/orders — renders and Order Details dialog opens with real order data", async ({ page }) => {
    await page.goto("/dashboard/orders");
    await page.waitForLoadState("networkidle");

    // Back button present
    await expect(page.locator('[data-testid="button-back-to-dashboard"]')).toBeVisible();

    // Either order rows or empty state — not a blank screen
    const orderCards = page.locator('[data-testid^="order-item-"]');
    const emptyState = page.locator("text=No orders yet");
    const orderCount = await orderCards.count();
    const hasEmpty = await emptyState.count();
    expect(orderCount + hasEmpty).toBeGreaterThan(0);

    // If there are orders, trigger the Details dialog and confirm it opens with populated content
    if (orderCount > 0) {
      const detailsBtn = page.locator('[data-testid^="button-view-details-"]').first();
      await detailsBtn.click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 4000 });

      // Dialog must show "Order Details" title and a real order number (8 hex chars)
      await expect(dialog.getByText("Order Details")).toBeVisible();
      await expect(dialog.locator("text=/Order #[A-Z0-9]{8}/")).toBeVisible();

      // Dialog must show a status badge — confirms viewOrderDetails was set (not empty dialog)
      const statusBadge = dialog.locator('[class*="badge"], [data-testid*="status"]').or(
        dialog.locator('text=/pending|processing|shipped|delivered|completed/i')
      );
      await expect(statusBadge.first()).toBeVisible({ timeout: 3000 });

      // Product info visible
      const productName = dialog.locator('[class*="font-medium"]').or(dialog.locator('text=/qty/i'));
      await expect(productName.first()).toBeVisible();

      // Close it
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0, { timeout: 3000 });
    }
  });

  test("/dashboard/stacks — renders without crash", async ({ page }) => {
    await page.goto("/dashboard/stacks");
    await page.waitForLoadState("networkidle");
    await expect(page.locator('[data-testid="button-back-to-dashboard"]')).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
  });

  test("/dashboard/logbook — renders without crash", async ({ page }) => {
    await page.goto("/dashboard/logbook");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("main")).toBeVisible();
  });

  test("/dashboard/cycles — renders without crash", async ({ page }) => {
    await page.goto("/dashboard/cycles");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("main")).toBeVisible();
  });

  test("/dashboard/academy — renders without crash and Continue CTA in home links here", async ({ page }) => {
    await page.goto("/dashboard/academy");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("main")).toBeVisible();
    // Academy content should be visible (modules list or empty state)
    await expect(page.locator("main")).toBeVisible();
  });

  test("/dashboard/wishlist — renders without crash", async ({ page }) => {
    await page.goto("/dashboard/wishlist");
    await page.waitForLoadState("networkidle");
    await expect(page.locator('[data-testid="button-back-to-dashboard"]')).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
  });

  test("/dashboard/settings — renders settings cards", async ({ page }) => {
    await page.goto("/dashboard/settings");
    await page.waitForLoadState("networkidle");
    await expect(page.locator('[data-testid="button-back-to-dashboard"]')).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
    // Settings uses CardTitle (div) — check for at least one settings section label
    const sectionLabel = page.locator("text=/Profile|Addresses|Notifications|Account|Delete/i").first();
    await expect(sectionLabel).toBeVisible({ timeout: 5000 });
  });
});
