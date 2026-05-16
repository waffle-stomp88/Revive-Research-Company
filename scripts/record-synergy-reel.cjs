'use strict';
const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'http://localhost:5000';
const OUT_DIR  = '/tmp/reel';
fs.mkdirSync(OUT_DIR, { recursive: true });

const timeline = [];
const mark = (label) => {
  const t = Date.now();
  timeline.push({ label, ms: t });
  console.log(`[${new Date(t).toISOString()}] ${label}`);
};

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--disable-software-rasterizer']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: OUT_DIR, size: { width: 1920, height: 1080 } },
    deviceScaleFactor: 1,
  });

  // Bypass age gate + hide UI overlays that block clicks during recording
  await context.addInitScript(() => {
    sessionStorage.setItem('revive-research-age-verified', 'true');
  });

  // Inject CSS to hide blockers once DOM is ready
  await context.addInitScript(() => {
    const style = document.createElement('style');
    style.textContent = `
      [data-testid="banner-free-shipping"] { display: none !important; }
      [data-testid="synergy-engine-auth-gate"] { display: none !important; }
      [data-testid="modal-age-verification"] { display: none !important; }
    `;
    document.head
      ? document.head.appendChild(style)
      : document.addEventListener('DOMContentLoaded', () => document.head.appendChild(style));
  });

  const page = await context.newPage();

  // ── Scene 1: Homepage hero ────────────────────────────────────────────────
  mark('scene_homepage_start');
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1500);

  await page.screenshot({ path: `${OUT_DIR}/ss_homepage.png` });
  mark('scene_homepage_loaded');
  await page.waitForTimeout(3000);

  // ── Scene 2: Scroll to Stack Builder teaser (3 s) ─────────────────────────
  mark('scene_scroll_teaser_start');
  const teaserEl = page.locator('[data-testid="section-stack-builder"]');
  await teaserEl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT_DIR}/ss_teaser.png` });
  mark('scene_teaser_visible');
  await page.waitForTimeout(2000);

  // ── Scene 3: Click "Build Your Stack" → navigate ─────────────────────────
  mark('scene_click_build_start');
  await page.locator('[data-testid="button-build-stack"]').click();
  await page.waitForURL('**/research-stacks**', { timeout: 10000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${OUT_DIR}/ss_stack_builder.png` });
  mark('scene_stack_builder_loaded');
  await page.waitForTimeout(2000);

  // ── Scene 4: Click Recovery goal chip ────────────────────────────────────
  mark('scene_goal_click_start');
  try {
    const goalCard = page.locator('[data-testid="card-goal-starters"]');
    await goalCard.scrollIntoViewIfNeeded({ timeout: 5000 });
    await page.waitForTimeout(500);
    await page.locator('[data-testid="button-goal-recovery"]').click({ timeout: 5000, force: true });
    mark('scene_goal_recovery_clicked');
  } catch {
    try {
      await page.locator('[data-testid="button-goal-mobile-recovery"]').click({ timeout: 3000, force: true });
      mark('scene_goal_recovery_mobile_clicked');
    } catch { mark('scene_goal_recovery_skipped'); }
  }
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT_DIR}/ss_goal_selected.png` });

  // ── Scene 5: Select BPC-157 ───────────────────────────────────────────────
  mark('scene_bpc157_search_start');
  const searchBox = page.locator('[data-testid="input-peptide-search"]');
  await searchBox.scrollIntoViewIfNeeded();
  await searchBox.fill('BPC-157');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT_DIR}/ss_bpc157_search.png` });

  const bpcCard = page.locator('[data-testid^="card-select-peptide-"]').first();
  await bpcCard.click({ force: true });
  mark('scene_bpc157_selected');
  await page.waitForTimeout(4000);
  await page.screenshot({ path: `${OUT_DIR}/ss_bpc157_ring.png` });

  // ── Scene 6: Select TB-500 → Wolverine Stack fires ────────────────────────
  mark('scene_tb500_search_start');
  await searchBox.fill('');
  await page.waitForTimeout(600);
  await searchBox.fill('TB-500');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT_DIR}/ss_tb500_search.png` });

  const tb500Card = page.locator('[data-testid^="card-select-peptide-"]').first();
  await tb500Card.click({ force: true });
  mark('scene_tb500_selected');
  await page.waitForTimeout(4500);
  await page.screenshot({ path: `${OUT_DIR}/ss_wolverine_stack.png` });

  // ── Scene 7: Show Synergy Ring detail (scroll right panel into view) ───────
  mark('scene_synergy_ring_start');
  await page.locator('[data-testid="card-synergy-ring"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${OUT_DIR}/ss_synergy_ring.png` });

  // ── Scene 8: Open Body Systems accordion ─────────────────────────────────
  mark('scene_body_systems_start');
  const systemsAccordion = page.locator('[data-testid="accordion-systems"]');
  await systemsAccordion.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await systemsAccordion.click();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT_DIR}/ss_body_systems.png` });
  mark('scene_body_systems_open');
  await page.waitForTimeout(2000);

  // ── Scene 9: Click pathway overlap cue chip ───────────────────────────────
  mark('scene_pathway_overlap_start');
  try {
    const cueChip = page.locator('[data-testid="chip-overlap-cue"]');
    await cueChip.scrollIntoViewIfNeeded();
    await cueChip.click({ timeout: 5000 });
    mark('scene_pathway_overlap_clicked');
    await page.waitForTimeout(3500);
    await page.screenshot({ path: `${OUT_DIR}/ss_pathway_overlap.png` });
  } catch { mark('scene_pathway_overlap_skipped'); }

  // ── Scene 10: Cart / pricing strip ───────────────────────────────────────
  mark('scene_cart_start');
  try {
    await page.locator('[data-testid="sticky-cart-bar"]').scrollIntoViewIfNeeded();
  } catch {
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
  }
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${OUT_DIR}/ss_cart.png` });
  mark('scene_cart_visible');
  await page.waitForTimeout(2000);

  mark('recording_end');

  // Save timeline
  const start = timeline[0].ms;
  const relative = timeline.map(e => ({ label: e.label, sec: ((e.ms - start) / 1000).toFixed(2) }));
  fs.writeFileSync(`${OUT_DIR}/timeline.json`, JSON.stringify(relative, null, 2));
  console.log('\nTimeline:');
  relative.forEach(e => console.log(`  ${e.sec}s  ${e.label}`));

  await context.close();
  await browser.close();

  // Find the recorded video
  const videos = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'));
  console.log('\nRecorded videos:', videos);
  fs.writeFileSync(`${OUT_DIR}/video_name.txt`, videos[0] || '');
})();
