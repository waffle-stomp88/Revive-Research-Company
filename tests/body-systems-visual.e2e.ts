import { test } from "@playwright/test";
test("body systems vertical card list", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:5000/guides/peptide-education-center");
  await page.evaluate(() => sessionStorage.setItem("revive-research-age-verified","1"));
  await page.reload();
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollTo(0, 520));
  await page.waitForTimeout(400);
  await page.screenshot({ path: "tests/__snapshots__/body-systems-v2.png" });
  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(300);
  await page.screenshot({ path: "tests/__snapshots__/body-systems-v2-scrolled.png" });
  await ctx.close();
});
