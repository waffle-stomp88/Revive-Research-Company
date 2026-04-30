import { test, expect } from "@playwright/test";

/**
 * Browser-level e2e tests for the MiniPKChart component on /research-stacks.
 *
 * These tests launch a real Chromium browser and navigate to the research stacks
 * listing page, confirming that the chart SVG elements and the SC/Other-route key
 * actually render in the DOM — not just in jsdom unit tests.
 *
 * Regressions caught that jsdom unit tests cannot detect:
 *   - Runtime import errors in MiniPKChart that prevent rendering
 *   - Exceptions thrown during component render cycle
 *   - Chart elements removed from the card markup entirely
 *   - pk-line-style-key hidden by CSS or conditional rendering bugs
 */

test.describe("MiniPKChart — browser rendering on /research-stacks", () => {
  test("at least one mini-pk-chart SVG is visible in the DOM", async ({ page }) => {
    await page.goto("/research-stacks");

    await page.waitForSelector('[data-testid^="card-stack-"]', { timeout: 15000 });

    const chart = page.locator('[data-testid^="mini-pk-chart-"]').first();
    await expect(chart).toBeVisible({ timeout: 10000 });

    const tagName = await chart.evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe("svg");
  });

  test("fat-burner renders both the mini-pk-chart SVG and the pk-line-style-key (SC + oral = mixed routes)", async ({
    page,
  }) => {
    await page.goto("/research-stacks");

    await page.waitForSelector('[data-testid="card-stack-fat-burner"]', {
      timeout: 15000,
    });

    const chart = page.locator('[data-testid="mini-pk-chart-fat-burner"]');
    await expect(chart).toBeVisible({ timeout: 10000 });

    const tagName = await chart.evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe("svg");

    const key = page.locator('[data-testid="pk-line-style-key-fat-burner"]');
    await expect(key).toBeVisible({ timeout: 5000 });
  });

  test("cognitive-edge-stack does NOT render the pk-line-style-key (all intranasal — no SC curves)", async ({
    page,
  }) => {
    await page.goto("/research-stacks");

    await page.waitForSelector('[data-testid="card-stack-cognitive-edge-stack"]', {
      timeout: 15000,
    });

    const key = page.locator('[data-testid="pk-line-style-key-cognitive-edge-stack"]');
    await expect(key).not.toBeVisible({ timeout: 5000 });
  });
});
