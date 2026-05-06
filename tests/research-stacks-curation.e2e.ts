import { test, expect } from "@playwright/test";

/**
 * Browser-level e2e tests verifying the Research Stacks curation state.
 *
 * These tests guard against regressions where:
 *   - Extra stacks sneak back into the listing (count must be exactly 8)
 *   - The removed "Immune" category tab reappears as a filter option
 *   - Removed/retired stack URLs fail to redirect back to the listing
 *
 * The page renders 8 filter buttons (All + 7 categories) and exactly 8 stack
 * cards when the pre-built stacks view is active (the default on load).
 * Categories: Recovery, Cognitive, Metabolic, GH Axis, Longevity, Skin, Hormonal
 */

const EXPECTED_STACK_IDS = [
  "recovery-tissue-stack",
  "gh-amplifier",
  "cognitive-edge-stack",
  "glow-protocol",
  "longevity-protocol",
  "fat-burner",
  "melanocortin-arousal-stack",
  "hpg-axis-restore-stack",
];

const EXPECTED_FILTER_TESTIDS = [
  "filter-category-all",
  "filter-category-recovery",
  "filter-category-cognitive",
  "filter-category-metabolic",
  "filter-category-gh-axis",
  "filter-category-longevity",
  "filter-category-skin",
  "filter-category-hormonal",
];

test.describe("Research Stacks curation — /research-stacks", () => {
  test("exactly 8 stack cards appear in the pre-built listing", async ({ page }) => {
    await page.goto("/research-stacks");

    // The page defaults to the pre-built tab; wait for cards to appear
    await page.waitForSelector('[data-testid^="card-stack-"]', { timeout: 15000 });

    const cards = page.locator('[data-testid^="card-stack-"]');
    await expect(cards).toHaveCount(8);
  });

  test("all 8 expected stack cards are individually present", async ({ page }) => {
    await page.goto("/research-stacks");

    await page.waitForSelector('[data-testid^="card-stack-"]', { timeout: 15000 });

    for (const id of EXPECTED_STACK_IDS) {
      const card = page.locator(`[data-testid="card-stack-${id}"]`);
      await expect(card).toBeVisible({ timeout: 10000 });
    }
  });

  test("exactly 8 category filter tabs appear (All + 7 categories)", async ({ page }) => {
    await page.goto("/research-stacks");

    // Wait for the filter buttons to render alongside the stack cards
    await page.waitForSelector('[data-testid="filter-category-all"]', { timeout: 15000 });

    for (const testId of EXPECTED_FILTER_TESTIDS) {
      const btn = page.locator(`[data-testid="${testId}"]`);
      await expect(btn).toBeVisible({ timeout: 10000 });
    }

    const allFilterButtons = page.locator('[data-testid^="filter-category-"]');
    await expect(allFilterButtons).toHaveCount(8);
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
