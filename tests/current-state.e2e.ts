import { test } from "@playwright/test";
test("current mobile library state", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:5000/guides/peptide-education-center");
  await page.evaluate(() => localStorage.setItem("revive-research-age-verified", Date.now().toString()));
  await page.reload();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "tests/__snapshots__/state-top.png" });
  await page.evaluate(() => window.scrollTo(0, 550));
  await page.waitForTimeout(300);
  await page.screenshot({ path: "tests/__snapshots__/state-mid.png" });
  await page.evaluate(() => window.scrollTo(0, 1100));
  await page.waitForTimeout(300);
  await page.screenshot({ path: "tests/__snapshots__/state-shelves.png" });
  await ctx.close();
});
