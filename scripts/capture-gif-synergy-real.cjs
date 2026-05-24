'use strict';
/**
 * Email 3 GIF — Synergy Engine (custom HTML, same approach as Email 2)
 *
 * Uses a hand-crafted HTML page served from the mockup sandbox — zero real-app
 * complexity, zero age gate, zero backdrop-filter issues.  The animation is
 * controlled by window.setFrame(ms) exactly like Email 2.
 *
 * Output: 680×700 px, 15 fps  (matches Email 1: 680×760 / Email 2: 680×700)
 */

const { spawnSync } = require('child_process');
const path = require('path');
const fs   = require('fs');

const URL       = 'http://localhost:23419/preview/GalaxyVfxComparison/email-assets/synergy-engine.html';
const FRAMES_DIR = '/tmp/gif-frames-synergy';
const OUTPUT     = path.resolve(__dirname, '../exports/email3-synergy-engine.gif');
const W          = 680;
const H          = 700;
const FPS        = 15;
const DURATION_S = 9.0;   // one full animation loop
const TOTAL_FRAMES = Math.ceil(FPS * DURATION_S);
const INTERVAL_MS  = Math.round(1000 / FPS);

const CHROMIUM = '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';
const FFMPEG   = '/nix/store/8md1l3im3gbf73fxns3l5nmc9hwdz1r9-replit-runtime-path/bin/ffmpeg';

async function main() {
  if (fs.existsSync(FRAMES_DIR)) fs.rmSync(FRAMES_DIR, { recursive: true });
  fs.mkdirSync(FRAMES_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });

  const { chromium } = require('playwright');

  // Same Chromium args as Email 2 — no --disable-gpu (needed for proper SVG rendering)
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROMIUM,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const context = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  console.log(`Navigating to custom HTML …\n  ${URL}`);
  await page.goto(URL, { waitUntil: 'networkidle' });

  // Wait for fonts + setFrame to be available — same check as Email 2
  await page.waitForFunction(
    () => typeof window.setFrame === 'function' && window.__fontsReady,
    { timeout: 15000 }
  );
  await page.waitForTimeout(400);

  console.log(`Capturing ${TOTAL_FRAMES} frames at ${FPS} fps (${DURATION_S}s) …`);
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const ms = i * INTERVAL_MS;
    await page.evaluate((t) => window.setFrame(t), ms);
    await page.screenshot({
      path: path.join(FRAMES_DIR, `frame${String(i).padStart(4, '0')}.png`),
      clip: { x: 0, y: 0, width: W, height: H },
    });
    if (i % 15 === 0) process.stdout.write(`  frame ${i + 1}/${TOTAL_FRAMES}\r`);
  }
  process.stdout.write('\n');
  await browser.close();
  console.log('Frames captured.\n');

  // ── Two-pass FFmpeg palette GIF (locked pipeline — same as Email 1 & 2) ──
  const palette = path.join(FRAMES_DIR, 'palette.png');
  const scaleF  = `scale=${W}:-2:flags=lanczos`;

  console.log('Pass 1: palettegen …');
  const p1 = spawnSync(FFMPEG, [
    '-y', '-framerate', String(FPS), '-i', path.join(FRAMES_DIR, 'frame%04d.png'),
    '-vf', `${scaleF},palettegen=max_colors=256:stats_mode=diff`,
    palette,
  ], { encoding: 'utf8' });
  if (p1.status !== 0) { console.error(p1.stderr.slice(-2000)); process.exit(1); }

  console.log('Pass 2: GIF encode …');
  const p2 = spawnSync(FFMPEG, [
    '-y', '-framerate', String(FPS), '-i', path.join(FRAMES_DIR, 'frame%04d.png'),
    '-i', palette,
    '-lavfi', `${scaleF}[x];[x][1:v]paletteuse=dither=none`,
    '-loop', '0', OUTPUT,
  ], { encoding: 'utf8' });
  if (p2.status !== 0) { console.error(p2.stderr.slice(-2000)); process.exit(1); }

  const kb = Math.round(fs.statSync(OUTPUT).size / 1024);
  console.log(`\nDone → ${OUTPUT}`);
  console.log(`  ${kb} KB · ${TOTAL_FRAMES} frames · ${FPS} fps · ${W}×${H}px`);
}

main().catch(e => { console.error(e); process.exit(1); });
