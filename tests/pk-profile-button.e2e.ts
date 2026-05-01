import { test, expect } from "@playwright/test";

/**
 * Browser-level e2e tests for the PK Profile button on the education article page.
 *
 * Regressions caught that unit tests cannot detect:
 *   - PK Profile button missing for articles that have PK data (BPC-157, Semax)
 *   - PK chart failing to render after clicking the button
 *   - PK Profile button incorrectly appearing for non-PK articles (storage, general)
 *   - Toggle behavior broken — clicking active PK button should restore previous reading mode
 *   - Semax intranasal curve rendered as solid instead of dashed (stroke-dasharray absent)
 */

const EDUCATION_URL = "/guides/peptide-education-center";

// Allow extra time: the education page loads articles from the API on first render
// and the chart animation runs before legend elements become visible.
test.describe("PK Profile button — article page", () => {
  test.setTimeout(90000);

  // Bypass the age-verification modal so it never intercepts pointer events.
  // The modal checks sessionStorage.getItem("revive-research-age-verified"); setting
  // it here before each navigation prevents the modal from opening.
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem("revive-research-age-verified", "true");
    });
  });

  test("BPC-157 article shows PK Profile button and chart renders on click", async ({ page }) => {
    await page.goto(EDUCATION_URL);

    // Wait for the API to return article data and the cards to render
    await page.waitForSelector('[data-testid="card-article-what-is-bpc-157-peptide"]', {
      timeout: 30000,
    });

    // Click the BPC-157 article card to expand it (Playwright auto-scrolls into view)
    await page.locator('[data-testid="card-article-what-is-bpc-157-peptide"]').click();

    // Wait for the PK Profile button to appear in the expanded article header
    await page.waitForSelector('[data-testid="button-pk-profile"]', { timeout: 15000 });

    const pkButton = page.locator('[data-testid="button-pk-profile"]');
    await expect(pkButton).toBeVisible();

    // Click the PK Profile button to switch to pharmacokinetics mode
    await pkButton.click();

    // The chart's zoom controls should now be visible, confirming the chart rendered
    const zoomControls = page.locator('[data-testid="pk-zoom-controls"]');
    await expect(zoomControls).toBeVisible({ timeout: 10000 });

    // The BPC-157 half-life chip should be visible in the legend
    const halfLifeChip = page.locator('[data-testid="chip-halflife-bpc-157"]');
    await expect(halfLifeChip).toBeVisible({ timeout: 8000 });

    // The route badge should mention "subcutaneous" for BPC-157 (case-insensitive)
    const routeBadge = page.locator('[data-testid="badge-route-bpc-157"]').first();
    await expect(routeBadge).toBeVisible({ timeout: 5000 });
    await expect(routeBadge).toContainText("subcutaneous", { ignoreCase: true });
  });

  test("Semax article shows PK Profile button with dashed intranasal curve", async ({ page }) => {
    await page.goto(EDUCATION_URL);

    // Wait for article cards to load from the API
    await page.waitForSelector('[data-testid="card-article-what-is-semax-peptide"]', {
      timeout: 30000,
    });

    // Expand the Semax article
    await page.locator('[data-testid="card-article-what-is-semax-peptide"]').click();

    await page.waitForSelector('[data-testid="button-pk-profile"]', { timeout: 15000 });

    const pkButton = page.locator('[data-testid="button-pk-profile"]');
    await expect(pkButton).toBeVisible();

    // Switch to PK Profile mode
    await pkButton.click();

    // Chart zoom controls confirm the chart is visible
    const zoomControls = page.locator('[data-testid="pk-zoom-controls"]');
    await expect(zoomControls).toBeVisible({ timeout: 10000 });

    // The Semax route badge should mention "intranasal" (case-insensitive).
    const routeBadge = page.locator('[data-testid="badge-route-semax"]').first();
    await expect(routeBadge).toBeVisible({ timeout: 8000 });
    await expect(routeBadge).toContainText("intranasal", { ignoreCase: true });

    // Verify the rendered SVG curve is actually dashed.
    // The chart applies stroke-dasharray="7 4" to any curve whose route is non-SC
    // (intranasal, oral, IV). Semax is intranasal, so its path must carry this attribute.
    // The selector is scoped to section-compounds (the chart's root container) to avoid
    // matching any unrelated dashed SVG elements elsewhere on the page.
    const dashedPath = page
      .locator('[data-testid="section-compounds"]')
      .locator('path[stroke-dasharray="7 4"]')
      .first();
    await expect(dashedPath).toBeAttached({ timeout: 8000 });

    // Note: the pk-line-style-key (dashed line legend) only appears when both SC and
    // non-SC routes are present in the same chart. A single-compound Semax article
    // shows only the intranasal route, so the key is intentionally absent.
    const lineStyleKey = page.locator('[data-testid="pk-line-style-key"]');
    await expect(lineStyleKey).not.toBeVisible({ timeout: 3000 });
  });

  test("Storage/general articles do NOT show the PK Profile button", async ({ page }) => {
    // Navigate to the education center with the general tab active
    await page.goto(`${EDUCATION_URL}?tab=general`);

    // Wait for the storage-101 article card to appear
    await page.waitForSelector('[data-testid="card-article-storage-101"]', {
      timeout: 30000,
    });

    // Expand the storage article
    await page.locator('[data-testid="card-article-storage-101"]').click();

    // The back button is a reliable signal that the article has expanded
    await page.waitForSelector('[data-testid="button-back-to-articles"]', { timeout: 15000 });

    // The PK Profile button must NOT be present for a non-PK storage article
    const pkButton = page.locator('[data-testid="button-pk-profile"]');
    await expect(pkButton).not.toBeVisible({ timeout: 3000 });
  });

  test("Clicking PK Profile button while PK is active returns to the previous reading mode", async ({
    page,
  }) => {
    await page.goto(EDUCATION_URL);

    await page.waitForSelector('[data-testid="card-article-what-is-bpc-157-peptide"]', {
      timeout: 30000,
    });

    // Open BPC-157 article
    await page.locator('[data-testid="card-article-what-is-bpc-157-peptide"]').click();
    await page.waitForSelector('[data-testid="button-pk-profile"]', { timeout: 15000 });

    const pkButton = page.locator('[data-testid="button-pk-profile"]');

    // BPC-157 has quick-breakdown content, so the article opens in quick-breakdown mode.
    // Confirm we start in quick-breakdown mode before touching the PK button.
    const quickBreakdownToggle = page.locator('[data-testid="toggle-quick-breakdown"]');
    await expect(quickBreakdownToggle).toHaveAttribute("aria-pressed", "true", { timeout: 5000 });

    // First click — enter PK mode
    await pkButton.click();

    const zoomControls = page.locator('[data-testid="pk-zoom-controls"]');
    await expect(zoomControls).toBeVisible({ timeout: 10000 });

    // While in PK mode the quick-breakdown toggle should no longer be the active mode
    await expect(quickBreakdownToggle).toHaveAttribute("aria-pressed", "false", { timeout: 3000 });

    // Second click — should exit PK mode and restore previous reading mode (quick-breakdown)
    await pkButton.click();

    // The chart zoom controls must no longer be visible
    await expect(zoomControls).not.toBeVisible({ timeout: 8000 });

    // The quick-breakdown toggle must be active again, confirming the previous mode was restored
    await expect(quickBreakdownToggle).toHaveAttribute("aria-pressed", "true", { timeout: 5000 });

    // The article is still expanded (back button remains visible)
    const backButton = page.locator('[data-testid="button-back-to-articles"]');
    await expect(backButton).toBeVisible({ timeout: 3000 });
  });
});
