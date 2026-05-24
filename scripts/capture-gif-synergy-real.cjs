'use strict';
const { chromium } = require('playwright');
const { spawnSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const CHROMIUM  = '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';
const FFMPEG    = '/nix/store/8md1l3im3gbf73fxns3l5nmc9hwdz1r9-replit-runtime-path/bin/ffmpeg';
const BASE_URL  = 'http://localhost:5000';
const FRAME_DIR = '/tmp/synergy-real-frames';
const OUT_GIF   = 'exports/email3-synergy-engine.gif';

const FPS    = 10;
const W_OUT  = 520;
const H_OUT  = 580;

fs.rmSync(FRAME_DIR, { recursive: true, force: true });
fs.mkdirSync(FRAME_DIR, { recursive: true });

// ── helpers ──────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

let frameIdx = 0;
async function snap(page, clip) {
  await page.screenshot({
    path: path.join(FRAME_DIR, `f${String(frameIdx++).padStart(4, '0')}.png`),
    clip,
  });
}

async function snapFor(page, clip, durationMs, intervalMs = 100) {
  const count = Math.round(durationMs / intervalMs);
  for (let i = 0; i < count; i++) {
    await snap(page, clip);
    await sleep(intervalMs);
  }
}

// ── main ─────────────────────────────────────────────────────────────────────
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROMIUM,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu',
           '--disable-dev-shm-usage', '--disable-software-rasterizer'],
  });

  // Wide viewport so we get the desktop two-column layout (lg breakpoint = 1024px+)
  // 1100px tall so the ring card + description have room below the clip
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    deviceScaleFactor: 2,
  });

  // Bypass age gate
  await context.addInitScript(() => {
    sessionStorage.setItem('revive-research-age-verified', 'true');
  });

  // Hide UI blockers and pull header out of flow so the builder fills more vertical space
  await context.addInitScript(() => {
    const s = document.createElement('style');
    s.textContent = `
      [data-testid="banner-free-shipping"] { display: none !important; }
      [data-testid="synergy-engine-auth-gate"]  { display: none !important; }
      [data-testid="modal-age-verification"]    { display: none !important; }
    `;
    (document.head || document.documentElement).appendChild(s);
    document.addEventListener('DOMContentLoaded', () =>
      (document.head || document.documentElement).appendChild(s));
  });

  const page = await context.newPage();

  console.log('Loading /research-stacks?tab=custom …');
  await page.goto(`${BASE_URL}/research-stacks?tab=custom`, {
    waitUntil: 'networkidle', timeout: 40000,
  });
  await sleep(2000);

  // Confirm products loaded
  await page.waitForSelector('[data-testid^="card-select-peptide-"]', { timeout: 20000 });
  console.log('Products loaded.');

  // Scroll to the synergy ring and position it near the top of the viewport
  const ringEl = page.locator('[data-testid="card-synergy-ring"]');
  await ringEl.scrollIntoViewIfNeeded();
  await sleep(400);

  // Scroll up a bit so the ring card starts around y=80 (leaves ~900px below it)
  const ringBox0 = await ringEl.boundingBox();
  await page.evaluate((targetY) => window.scrollBy(0, targetY), ringBox0.y - 80);
  await sleep(400);

  // ── Compute clip region ──────────────────────────────────────────────────
  // Focus on the RIGHT column (synergy ring). Read fresh bounding box after scroll.
  const ringBox = await ringEl.boundingBox();
  console.log('Ring bounding box (CSS px) after scroll:', ringBox);

  // Pad 20px on sides, 15px above, 350px below (description block expands ~130px).
  const PAD_X   = 20;
  const PAD_TOP = 15;
  const CLIP_H  = 700; // tall enough for ring + description + breathing room

  const clip = {
    x: Math.max(0, ringBox.x - PAD_X),
    y: Math.max(0, ringBox.y - PAD_TOP),
    width:  Math.min(1440 - ringBox.x + PAD_X, ringBox.width + PAD_X * 2),
    height: Math.min(1100 - (ringBox.y - PAD_TOP), CLIP_H),
  };
  console.log('Clip region (CSS px):', clip);

  const searchInput = page.locator('[data-testid="input-peptide-search"]');

  // ── Phase 1 — Empty state (0-2 s, 20 frames) ────────────────────────────
  console.log('Phase 1: empty ring …');
  await snapFor(page, clip, 2000);

  // ── Select BPC-157 ───────────────────────────────────────────────────────
  console.log('Selecting BPC-157 …');
  await searchInput.fill('BPC-157');
  await sleep(500);
  await page.locator('[data-testid^="card-select-peptide-"]').first().click({ force: true });
  await sleep(400);

  // ── Phase 2 — BPC-157 in ring (2-4 s, 20 frames) ───────────────────────
  console.log('Phase 2: BPC-157 selected …');
  await snapFor(page, clip, 2000);

  // ── Select TB-500 ────────────────────────────────────────────────────────
  console.log('Selecting TB-500 …');
  await searchInput.fill('');
  await sleep(150);
  await searchInput.fill('TB-500');
  await sleep(500);
  await page.locator('[data-testid^="card-select-peptide-"]').first().click({ force: true });
  await sleep(800); // let Wolverine badge animation start

  // ── Phase 3 — Wolverine Stack + 95% ring (4-9 s, 50 frames) ────────────
  // Reuse same clip so all frames have identical dimensions
  console.log('Phase 3: Wolverine Stack …');
  await snapFor(page, clip, 5000);

  await browser.close();
  console.log(`\nCaptured ${frameIdx} frames.`);

  // ── FFmpeg: two-pass palette GIF (locked pipeline) ───────────────────────
  // Frames are ~440×700 CSS px at 2x = ~880×1400 actual pixels.
  // Scale width to W_OUT (520); height becomes ~826px.
  // Crop top H_OUT (580) rows → exact 520×580 output.
  const scaleFilter = `scale=${W_OUT}:-2:flags=lanczos,crop=${W_OUT}:${H_OUT}:0:0`;
  const palette = path.join(FRAME_DIR, 'palette.png');

  console.log('\nPass 1: generating palette …');
  const p1 = spawnSync(FFMPEG, [
    '-y', '-framerate', String(FPS),
    '-i', path.join(FRAME_DIR, 'f%04d.png'),
    '-vf', `${scaleFilter},palettegen=max_colors=128:stats_mode=diff`,
    palette,
  ], { encoding: 'utf8' });
  if (p1.status !== 0) { console.error(p1.stderr); process.exit(1); }

  console.log('Pass 2: encoding GIF …');
  const p2 = spawnSync(FFMPEG, [
    '-y', '-framerate', String(FPS),
    '-i', path.join(FRAME_DIR, 'f%04d.png'),
    '-i', palette,
    '-lavfi', `${scaleFilter}[x];[x][1:v]paletteuse=dither=none:diff_mode=rectangle`,
    '-loop', '0',
    OUT_GIF,
  ], { encoding: 'utf8' });
  if (p2.status !== 0) { console.error(p2.stderr); process.exit(1); }

  const kb = Math.round(fs.statSync(OUT_GIF).size / 1024);
  console.log(`\nDone → ${OUT_GIF}  (${kb} KB, ${frameIdx} frames)`);
})().catch(e => { console.error(e); process.exit(1); });
