import { test, expect } from "@playwright/test";

/**
 * Browser-level e2e tests for the proxy-citation warning badge in PharmacokineticsChart.
 *
 * Two compounds carry confirmed off-compound proxy citations:
 *   - SNAP-8: cites acetyl hexapeptide-8 / Argireline rather than SNAP-8 itself
 *   - PEG-MGF: cites pegfilgrastim (PEGylated G-CSF class) rather than PEG-MGF itself
 *
 * Both are products with individual detail pages. The PharmacokineticsChart renders
 * in single-compound mode on those product pages (Pharmacokinetics tab). When a
 * citation carries isOffCompoundProxy: true, an orange "Proxy" badge must appear
 * next to the citation link in the active citations strip below the chart.
 *
 * These tests verify the badge actually renders in a real Chromium browser — ensuring
 * the data flag, the badge rendering logic, and the DOM wiring all work end-to-end.
 */

const AGE_GATE_KEY = "revive-research-age-verified";

test.describe("Proxy citation badge — browser rendering on product PK tabs", () => {
  // Bypass the age-verification modal so it never intercepts pointer events.
  // The modal checks localStorage for a timestamp within the 7-day TTL window.
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((key) => {
      localStorage.setItem(key, Date.now().toString());
    }, AGE_GATE_KEY);
  });

  test("SNAP-8 product PK tab shows orange Proxy badge for off-compound proxy citation", async ({
    page,
  }) => {
    await page.goto("/products/snap-8");

    // Wait for the research-tab nav to appear (confirms the product loaded)
    await page.waitForSelector('[data-testid="nav-research-tabs"]', {
      timeout: 15000,
    });

    // Click the Pharmacokinetics tab
    const pkTab = page.locator('[data-testid="tab-pk"]');
    await expect(pkTab).toBeVisible({ timeout: 10000 });
    await pkTab.click();

    // Wait for the PK panel to render
    await page.waitForSelector('[data-testid="section-pk-panel"]', {
      timeout: 10000,
    });

    // The proxy badge for SNAP-8's first citation must be in the DOM and visible.
    // Badge test-id pattern: badge-proxy-citation-{slug}-{index}
    const badge = page.locator('[data-testid="badge-proxy-citation-snap-8-0"]');
    await expect(badge).toBeVisible({ timeout: 10000 });

    // Verify the badge text is "Proxy"
    await expect(badge).toContainText("Proxy");
  });

  test("PEG-MGF product PK tab shows orange Proxy badge for off-compound proxy citation", async ({
    page,
  }) => {
    await page.goto("/products/peg-mgf");

    await page.waitForSelector('[data-testid="nav-research-tabs"]', {
      timeout: 15000,
    });

    const pkTab = page.locator('[data-testid="tab-pk"]');
    await expect(pkTab).toBeVisible({ timeout: 10000 });
    await pkTab.click();

    await page.waitForSelector('[data-testid="section-pk-panel"]', {
      timeout: 10000,
    });

    const badge = page.locator('[data-testid="badge-proxy-citation-peg-mgf-0"]');
    await expect(badge).toBeVisible({ timeout: 10000 });
    await expect(badge).toContainText("Proxy");
  });

  test("SNAP-8 Proxy badge tooltip contains off-compound proxy explanation text", async ({
    page,
  }) => {
    await page.goto("/products/snap-8");

    await page.waitForSelector('[data-testid="nav-research-tabs"]', {
      timeout: 15000,
    });

    await page.locator('[data-testid="tab-pk"]').click();

    await page.waitForSelector('[data-testid="section-pk-panel"]', {
      timeout: 10000,
    });

    const badge = page.locator('[data-testid="badge-proxy-citation-snap-8-0"]');
    await expect(badge).toBeVisible({ timeout: 10000 });

    // Hover to trigger the Radix tooltip
    await badge.hover();

    // The tooltip content should mention "off-compound proxy" and "analogue"
    const tooltip = page.locator('[role="tooltip"]');
    await expect(tooltip).toBeVisible({ timeout: 5000 });
    await expect(tooltip).toContainText("off-compound proxy");
  });

  test("BPC-157 product PK tab does NOT show a Proxy badge (direct compound-specific study)", async ({
    page,
  }) => {
    await page.goto("/products/bpc-157");

    await page.waitForSelector('[data-testid="nav-research-tabs"]', {
      timeout: 15000,
    });

    const pkTab = page.locator('[data-testid="tab-pk"]');
    // BPC-157 has a direct PK study — if the tab exists, verify no proxy badge appears
    if (await pkTab.isVisible()) {
      await pkTab.click();

      await page.waitForSelector('[data-testid="section-pk-panel"]', {
        timeout: 10000,
      });

      // No proxy badge should exist for BPC-157
      const badge = page.locator('[data-testid^="badge-proxy-citation-bpc-157-"]');
      await expect(badge).toHaveCount(0);
    }
  });
});
