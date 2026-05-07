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

  test("cognitive-edge-stack renders the pk-line-style-key with IV bolus overlay (Selank has published IV PK data)", async ({
    page,
  }) => {
    // Selank has ivHalfLifeLabel ("~2–3 min") from the Zolotarev 2006 citation audit,
    // so hasIVOverlay is true and the legend correctly shows even though both primary
    // administration routes are intranasal.
    await page.goto("/research-stacks");

    await page.waitForSelector('[data-testid="card-stack-cognitive-edge-stack"]', {
      timeout: 15000,
    });

    // Selank carries an ivHalfLifeLabel (~2–3 min IV bolus), which triggers the legend.
    const key = page.locator('[data-testid="pk-line-style-key-cognitive-edge-stack"]');
    await expect(key).toBeVisible({ timeout: 5000 });

    const ivKey = page.locator('[data-testid="pk-iv-overlay-key-cognitive-edge-stack"]');
    await expect(ivKey).toBeVisible({ timeout: 5000 });
  });

  test("cognitive-edge-stack IV vs SC tooltip is present in DOM and becomes visible on hover", async ({
    page,
  }) => {
    // Bypass the age-gate modal so we can interact with page content directly.
    // The modal checks sessionStorage.getItem("revive-research-age-verified").
    await page.addInitScript(() => {
      sessionStorage.setItem("revive-research-age-verified", "true");
    });

    await page.goto("/research-stacks");

    await page.waitForSelector('[data-testid="card-stack-cognitive-edge-stack"]', {
      timeout: 15000,
    });

    // The tooltip is always in the DOM (opacity-0 by default) when hasIVOverlay is true.
    // Selank has ivHalfLifeLabel, so cognitive-edge-stack always renders this tooltip.
    const tooltip = page.locator('[data-testid="mini-pk-chart-tooltip-cognitive-edge-stack"]');
    await expect(tooltip).toBeAttached({ timeout: 5000 });

    // Verify tooltip content regardless of visibility state.
    await expect(tooltip).toContainText("Route comparison");
    await expect(tooltip).toContainText("SC t½");
    await expect(tooltip).toContainText("IV t½");

    // Before hovering, the tooltip should be invisible (opacity: 0 via CSS).
    const hoverWrapper = page.locator('[data-testid="pk-mini-hover-cognitive-edge-stack"]');
    await hoverWrapper.scrollIntoViewIfNeeded();

    const opacityBefore = await tooltip.evaluate(
      (el) => window.getComputedStyle(el).opacity
    );
    expect(opacityBefore).toBe("0");

    // Hover the chart wrapper — native mouseenter listener sets tooltip opacity to 1 instantly.
    await hoverWrapper.hover();

    const opacityAfter = await tooltip.evaluate(
      (el) => window.getComputedStyle(el).opacity
    );
    expect(opacityAfter).toBe("1");
  });

  test("cognitive-edge-stack IV vs SC tooltip stays hidden on touch-only devices", async ({
    browser,
  }) => {
    // Emulate a touch-only mobile device — pointer:coarse, no hover capability.
    // The matchMedia("(hover: hover) and (pointer: fine)") guard in MiniPKChart
    // must prevent the mouseenter listener from being attached, so the tooltip
    // should remain at opacity 0 even after a simulated touch tap.
    const context = await browser.newContext({
      ...{ isMobile: true, hasTouch: true },
      viewport: { width: 390, height: 844 },
    });
    const mobilePage = await context.newPage();

    await mobilePage.addInitScript(() => {
      sessionStorage.setItem("revive-research-age-verified", "true");
    });

    await mobilePage.goto("/research-stacks");

    await mobilePage.waitForSelector('[data-testid="card-stack-cognitive-edge-stack"]', {
      timeout: 15000,
    });

    const tooltip = mobilePage.locator(
      '[data-testid="mini-pk-chart-tooltip-cognitive-edge-stack"]'
    );
    await expect(tooltip).toBeAttached({ timeout: 5000 });

    const hoverWrapper = mobilePage.locator(
      '[data-testid="pk-mini-hover-cognitive-edge-stack"]'
    );
    await hoverWrapper.scrollIntoViewIfNeeded();

    // On touch-only devices, matchMedia("(hover: hover) and (pointer: fine)") is false,
    // so MiniPKChart never attaches its mouseenter listener.
    // We dispatch mouseenter programmatically to confirm no listener is active —
    // the tooltip should remain hidden (opacity 0) because nothing is wired up.
    await mobilePage.evaluate(() => {
      const wrapper = document.querySelector(
        '[data-testid="pk-mini-hover-cognitive-edge-stack"]'
      );
      if (wrapper) {
        wrapper.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      }
    });

    const opacityAfterEvent = await tooltip.evaluate(
      (el) => window.getComputedStyle(el).opacity
    );
    expect(opacityAfterEvent).toBe("0");

    await context.close();
  });
});
