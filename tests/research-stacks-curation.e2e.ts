import { test, expect } from "@playwright/test";

/**
 * Browser-level e2e tests verifying the Research Stacks curation state.
 *
 * These tests guard against regressions where:
 *   - Extra stacks sneak back into the listing (count must be exactly 6)
 *   - The removed "Immune" category tab reappears as a filter option
 *   - Removed/retired stack URLs fail to redirect back to the listing
 *
 * The page renders 7 filter buttons (All + 6 categories) and exactly 6 stack
 * cards when the pre-built stacks view is active (the default on load).
 */

const EXPECTED_STACK_IDS = [
  "recovery-tissue-stack",
  "gh-amplifier",
  "cognitive-edge-stack",
  "glow-protocol",
  "longevity-protocol",
  "fat-burner",
];

const EXPECTED_FILTER_TESTIDS = [
  "filter-category-all",
  "filter-category-recovery",
  "filter-category-cognitive",
  "filter-category-metabolic",
  "filter-category-gh-axis",
  "filter-category-longevity",
  "filter-category-skin",
];

test.describe("Research Stacks curation — /research-stacks", () => {
  test("exactly 6 stack cards appear in the pre-built listing", async ({ page }) => {
    await page.goto("/research-stacks");

    // The page defaults to the pre-built tab; wait for cards to appear
    await page.waitForSelector('[data-testid^="card-stack-"]', { timeout: 15000 });

    const cards = page.locator('[data-testid^="card-stack-"]');
    await expect(cards).toHaveCount(6);
  });

  test("all 6 expected stack cards are individually present", async ({ page }) => {
    await page.goto("/research-stacks");

    await page.waitForSelector('[data-testid^="card-stack-"]', { timeout: 15000 });

    for (const id of EXPECTED_STACK_IDS) {
      const card = page.locator(`[data-testid="card-stack-${id}"]`);
      await expect(card).toBeVisible({ timeout: 10000 });
    }
  });

  test("exactly 7 category filter tabs appear (All + 6 categories)", async ({ page }) => {
    await page.goto("/research-stacks");

    // Wait for the filter buttons to render alongside the stack cards
    await page.waitForSelector('[data-testid="filter-category-all"]', { timeout: 15000 });

    for (const testId of EXPECTED_FILTER_TESTIDS) {
      const btn = page.locator(`[data-testid="${testId}"]`);
      await expect(btn).toBeVisible({ timeout: 10000 });
    }

    const allFilterButtons = page.locator('[data-testid^="filter-category-"]');
    await expect(allFilterButtons).toHaveCount(7);
  });

  test("the Immune category filter tab is absent", async ({ page }) => {
    await page.goto("/research-stacks");

    // Wait for legitimate filter buttons to confirm the section has rendered
    await page.waitForSelector('[data-testid="filter-category-all"]', { timeout: 15000 });

    const immuneTab = page.locator('[data-testid="filter-category-immune"]');
    await expect(immuneTab).toHaveCount(0);
  });

  test("navigating to a removed stack URL redirects back to the listing", async ({ page }) => {
    await page.goto("/research-stacks/deep-sleep");

    // The detail page redirects to /research-stacks when the stack ID is unknown
    await page.waitForSelector('[data-testid="heading-research-stacks"]', { timeout: 15000 });

    await expect(page).toHaveURL(/\/research-stacks$/);

    const heading = page.locator('[data-testid="heading-research-stacks"]');
    await expect(heading).toBeVisible();

    const allFilter = page.locator('[data-testid="filter-category-all"]');
    await expect(allFilter).toBeVisible({ timeout: 5000 });
  });
});
