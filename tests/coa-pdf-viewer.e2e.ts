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
 * Worker context:
 *   pdfjs-dist ≥ 5 requires several APIs that were added in Chrome 126–136.
 *   As of mid-2026 all supported browsers include these APIs natively, so the
 *   production code has no polyfills.  The worker is served as a static file
 *   from client/public/pdf.worker.min.mjs (GlobalWorkerOptions.workerSrc =
 *   "/pdf.worker.min.mjs").
 *
 *   The test browser in CI is the NixOS system Chromium (≈ 125), which predates
 *   these APIs.  fakePolyfillWorker() intercepts the worker script request and
 *   prepends the same five guards so the tests can run in that environment
 *   without touching production code.
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

/**
 * Shared polyfill guards for the five APIs that Chrome < 136 lacks.
 * These are no-ops on Chrome 136+ where the APIs exist natively.
 */
const COMPAT_POLYFILLS = [
  "if(typeof URL.parse==='undefined'){URL.parse=function(u,b){try{return new URL(u,b);}catch(e){return null;}};}",
  "if(typeof Promise.try==='undefined'){Promise.try=function(f){var a=Array.prototype.slice.call(arguments,1);return new Promise(function(res,rej){try{res(f.apply(this,a));}catch(e){rej(e);}});};}",
  "if(typeof Promise.withResolvers==='undefined'){Promise.withResolvers=function(){var res,rej,p=new Promise(function(r,j){res=r;rej=j;});return{promise:p,resolve:res,reject:rej};};}",
  "if(typeof Uint8Array.prototype.toHex==='undefined'){Uint8Array.prototype.toHex=function(){return Array.from(this).map(function(b){return b.toString(16).padStart(2,'0');}).join('');};}",
  "if(typeof Map.prototype.getOrInsertComputed==='undefined'){Map.prototype.getOrInsertComputed=function(k,fn){if(this.has(k))return this.get(k);var v=fn(k);this.set(k,v);return v;};}",
].join("\n");

/**
 * Inject compatibility guards into the main thread before any page scripts run.
 * pdfjs calls URL.parse, Promise.try, etc. on the main thread as well as
 * inside the worker, so both scopes need patching when running under Chrome 125.
 *
 * Production code is polyfill-free; these guards only run inside the test
 * browser (system Chromium ≈ 125).
 */
async function injectMainThreadPolyfills(page: import("@playwright/test").Page) {
  await page.addInitScript(COMPAT_POLYFILLS);
}

/**
 * Intercept the pdfjs worker script served from /pdf.worker.min.mjs and
 * prepend the same compatibility guards for the Worker's global scope.
 *
 * Web Workers run in a separate global that does not inherit main-thread
 * addInitScript patches, so the worker also needs its own injection.
 */
async function fakePolyfillWorker(page: import("@playwright/test").Page) {
  const workerCode = fs.readFileSync(
    path.resolve("node_modules/pdfjs-dist/build/pdf.worker.min.mjs"),
    "utf-8"
  );

  await page.route("**/pdf.worker.min.mjs", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: COMPAT_POLYFILLS + "\n" + workerCode,
    })
  );
}

test.describe("COA PDF viewer — GHK-Cu Certification tab", () => {
  test.beforeEach(async ({ page }) => {
    await injectMainThreadPolyfills(page);
    await fakeAuthUser(page);
    await fakePdfStorage(page);
    await fakePolyfillWorker(page);
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
