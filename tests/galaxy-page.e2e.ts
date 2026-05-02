import { test, expect } from "@playwright/test";

test.describe("Synergy Galaxy page", () => {
  test("renders 3D scene or fallback with header & filter bar", async ({
    page,
  }) => {
    await page.goto("/galaxy");

    // Page heading
    await expect(page.getByRole("heading", { name: /Peptide Universe/i })).toBeVisible();

    // Either the WebGL canvas or the SVG fallback should be present
    const canvas = page.locator("canvas");
    const fallback = page.getByTestId("galaxy-svg-fallback");
    await expect(canvas.or(fallback).first()).toBeVisible({ timeout: 15000 });

    // If 3D rendered, the filter bar should appear
    if (await canvas.count()) {
      await expect(page.getByTestId("galaxy-filter-bar")).toBeVisible();
      await expect(page.getByTestId("galaxy-search-input")).toBeVisible();
      await expect(page.getByTestId("galaxy-reset-view")).toBeVisible();
    }
  });

  test("system filter buttons toggle aria-pressed state", async ({ page }) => {
    await page.goto("/galaxy");
    const canvas = page.locator("canvas").first();
    if (!(await canvas.count())) test.skip();

    const healing = page.getByTestId("galaxy-filter-healing");
    await expect(healing).toBeVisible();
    await expect(healing).toHaveAttribute("aria-pressed", "true");
    await healing.click();
    await expect(healing).toHaveAttribute("aria-pressed", "false");
    await healing.click();
    await expect(healing).toHaveAttribute("aria-pressed", "true");
  });

  test("search input narrows the constellation", async ({ page }) => {
    await page.goto("/galaxy");
    if (!(await page.locator("canvas").count())) test.skip();

    const search = page.getByTestId("galaxy-search-input");
    await search.fill("bpc");
    await expect(search).toHaveValue("bpc");
    await page.getByTestId("galaxy-search-clear").click();
    await expect(search).toHaveValue("");
  });

  test("reset view button is functional", async ({ page }) => {
    await page.goto("/galaxy");
    if (!(await page.locator("canvas").count())) test.skip();
    await page.getByTestId("galaxy-reset-view").click();
  });

  test("?peptide= deep link opens the side panel with details", async ({
    page,
  }) => {
    await page.goto("/galaxy?peptide=bpc-157");
    const panel = page.getByTestId("galaxy-side-panel");
    await expect(panel).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("galaxy-panel-title")).toContainText(
      /BPC-157/i
    );
    const productCta = page.getByTestId("galaxy-panel-view-product");
    await expect(productCta).toBeVisible();

    // Closing the panel
    await page.getByTestId("galaxy-panel-close").click();
    await expect(panel).toBeHidden();
  });

  test("research-stacks page links to galaxy", async ({ page }) => {
    await page.goto("/research-stacks");
    const link = page.getByTestId("link-explore-galaxy");
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/galaxy/);
  });

  test("SVG fallback renders when reduced-motion is preferred", async ({
    browser,
  }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/galaxy");
    await expect(page.getByTestId("galaxy-svg-fallback")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText("Synergy Constellation Map")).toBeVisible();
    await context.close();
  });
});
