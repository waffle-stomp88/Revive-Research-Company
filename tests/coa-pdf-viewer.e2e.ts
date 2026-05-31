import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

/**
 * E2E tests for the COA PDF viewer component.
 *
 * These tests guard against regressions in the pdfjs rendering pipeline.
 *
 * Tested product: GHK-Cu (/peptides/ghk-cu) — has a Freedom Diagnostics COA
 * with a real PDF uploaded to object storage.
 *
 * Key assertions:
 *  - The canvas thumbnail is visible, non-zero in size, and has non-white pixels
 *  - The error state ("Unable to preview document") is NOT shown
 *  - Clicking the thumbnail opens the lightbox with the full-res JPEG data URL
 *
 * Polyfill context:
 *   pdfjs-dist ≥ 5 requires several APIs added after Chrome 125 (the version
 *   Playwright ships).  The COA viewer applies main-thread polyfills before
 *   importing pdfjs, and the /api/pdfjs-worker Express route prepends the same
 *   polyfills to the worker script before serving it.  Polyfilled APIs:
 *     - URL.parse                          (Chrome 126+)
 *     - Promise.try(fn, ...args)           (Chrome 127+)
 *     - Promise.withResolvers()            (polyfilled defensively)
 *     - Uint8Array.prototype.toHex()       (Chrome 132+)
 *     - Map.prototype.getOrInsertComputed() (Chrome 136+)
 *
 * The COA PDF URL (/objects/uploads/…) is cloud object storage that is not
 * reachable in the local dev environment, so each test intercepts that request
 * and returns the local PDF fixture at tests/fixtures/test-coa.pdf.
 */

/** Intercept the auth check so the RUO modal does not block the COA section. */
async function fakeAuthUser(page: import("@playwright/test").Page) {
  await page.route("**/api/auth/user", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: 1,
        email: "researcher@example.com",
        isAdmin: false,
        ruoAttestationAt: new Date("2025-01-01T00:00:00.000Z").toISOString(),
      }),
    });
  });
}

/** Intercept object-storage PDF requests and serve the local fixture PDF. */
async function fakePdfStorage(page: import("@playwright/test").Page) {
  const pdfFixture = fs.readFileSync(
    path.resolve("tests/fixtures/test-coa.pdf")
  );
  await page.route("**/objects/uploads/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/pdf",
      body: pdfFixture,
    })
  );
}

test.describe("COA PDF viewer — GHK-Cu Certification tab", () => {
  test.beforeEach(async ({ page }) => {
    await fakeAuthUser(page);
    await fakePdfStorage(page);
  });

  test("canvas thumbnail renders without error and has non-white pixels", async ({ page }) => {
    await page.goto("/peptides/ghk-cu");

    const certTab = page.locator('[data-testid="tab-cert"]');
    await expect(certTab).toBeVisible({ timeout: 15_000 });
    await certTab.click();

    const viewer = page.locator('[data-testid="coa-inline-pdf-viewer"]');
    await expect(viewer).toBeVisible({ timeout: 10_000 });

    // The error state must NOT appear
    await expect(page.locator('text="Unable to preview document"')).not.toBeVisible();

    // click-target wrapper is invisible while loading; becomes block when rendered
    const clickTarget = page.locator('[data-testid="coa-thumbnail-click-target"]');
    await expect(clickTarget).toBeVisible({ timeout: 40_000 });

    const canvas = page.locator('[data-testid="canvas-coa-pdf"]');
    await expect(canvas).toBeVisible();

    // Canvas must have real (non-default) dimensions
    const { width, height } = await canvas.evaluate((el: HTMLCanvasElement) => ({
      width: el.width,
      height: el.height,
    }));
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
    // Default blank canvas is 300×150; a real render will differ
    expect(width).not.toBe(300);
    expect(height).not.toBe(150);

    // Canvas must contain at least one opaque non-white pixel
    const hasContent = await canvas.evaluate((el: HTMLCanvasElement) => {
      const ctx = el.getContext("2d");
      if (!ctx) return false;
      const data = ctx.getImageData(0, 0, el.width, el.height).data;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 0 && (data[i] < 250 || data[i + 1] < 250 || data[i + 2] < 250)) {
          return true;
        }
      }
      return false;
    });
    expect(hasContent).toBe(true);
  });

  test("clicking the thumbnail opens the lightbox with a full-res JPEG image", async ({ page }) => {
    await page.goto("/peptides/ghk-cu");

    const certTab = page.locator('[data-testid="tab-cert"]');
    await expect(certTab).toBeVisible({ timeout: 15_000 });
    await certTab.click();

    const clickTarget = page.locator('[data-testid="coa-thumbnail-click-target"]');
    await expect(clickTarget).toBeVisible({ timeout: 40_000 });
    await clickTarget.click();

    const lightbox = page.locator('[data-testid="dialog-coa-lightbox"]');
    await expect(lightbox).toBeVisible({ timeout: 10_000 });

    const img = page.locator('[data-testid="img-lightbox-coa"]');
    await expect(img).toBeVisible({ timeout: 10_000 });

    const src = await img.getAttribute("src");
    expect(src).not.toBeNull();
    expect(src!.startsWith("data:image/jpeg")).toBe(true);

    await page.locator('[data-testid="button-lightbox-close"]').click({ force: true });
    await expect(lightbox).not.toBeVisible({ timeout: 5_000 });
  });
});
