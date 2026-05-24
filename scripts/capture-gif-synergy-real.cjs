'use strict';
/**
 * Email 3 GIF — Synergy Engine showcase (BPC-157 + TB-500 → Wolverine Stack 95%)
 *
 * Matches Email 1 (680×760) / Email 2 (680×700) pipeline exactly:
 *   - Chromium args: NO --disable-gpu, NO --disable-software-rasterizer
 *     (those flags prevent SVG/Framer-Motion rendering in headless mode)
 *   - Output: 680×700 px at 2× device scale → captured at 1360×1400 actual px
 *   - page.screenshot({ clip }) — same approach as Email 2
 *   - Two-pass FFmpeg: palettegen(diff) → paletteuse(dither=none) — locked pipeline
 *
 * Selection fix:
 *   - Fake /api/auth/user → isAuthenticated=true → soft gate never renders
 *   - dispatchEvent(new MouseEvent('click',{bubbles:true})) — native events
 *     trigger React's event system; Playwright synthetic clicks do not for motion.button
 */

const { chromium } = require('playwright');
const { spawnSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const CHROMIUM  = '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';
const FFMPEG    = '/nix/store/8md1l3im3gbf73fxns3l5nmc9hwdz1r9-replit-runtime-path/bin/ffmpeg';
const BASE_URL  = 'http://localhost:5000';
const FRAME_DIR = '/tmp/synergy-real-frames';
const OUT_GIF   = 'exports/email3-synergy-engine.gif';

// Match Email 1/2 dimensions
const W_OUT = 680;
const H_OUT = 700;
const FPS   = 15;

fs.rmSync(FRAME_DIR, { recursive: true, force: true });
fs.mkdirSync(FRAME_DIR, { recursive: true });

const sleep = ms => new Promise(r => setTimeout(r, ms));

let frameIdx = 0;
async function snapClip(page, clip) {
  await page.screenshot({
    path: path.join(FRAME_DIR, `f${String(frameIdx++).padStart(4, '0')}.png`),
    clip,
  });
}
async function snapFor(page, clip, ms, interval = 67) { // 67ms ≈ 15fps
  for (let i = 0; i < Math.round(ms / interval); i++) {
    await snapClip(page, clip);
    await sleep(interval);
  }
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROMIUM,
    // Same args as Email 2's working capture — NO --disable-gpu
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const context = await browser.newContext({
    viewport:          { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  // ── Fake auth → isAuthenticated=true → soft gate never renders ────────────
  await context.route('**/api/auth/user', route => {
    route.fulfill({
      status:      200,
      contentType: 'application/json',
      body: JSON.stringify({ id: 999, email: 'gif@reviveresearch.co', username: 'gifbot', isAdmin: false }),
    });
  });

  // ── Age gate — four-layer suppression ────────────────────────────────────
  // L1: Set window.__IS_BOT__ = true so isSearchBot() returns early before
  //     the useEffect ever calls setIsOpen(true).  This is the most targeted
  //     fix: the component's own code gates on this flag.
  // L2: sessionStorage key (redundant but harmless)
  // L3: HTML-level CSS injection via route intercept (beats page's !important
  //     because it's injected into the raw HTML before any stylesheet loads)
  // L4: Post-load DOM removal + addStyleTag + class cleanup
  await context.addInitScript(() => {
    // L1 — bot flag: age gate's isSearchBot() returns true → skips setIsOpen(true)
    window.__IS_BOT__ = true;
    // L2 — storage key
    sessionStorage.setItem('revive-research-age-verified', 'true');
  });

  // L3 — intercept the HTML document and inject a <style> that beats
  //        the page's own !important rules (injected styles loaded first in
  //        cascade win when specificity + importance are equal, because the
  //        page's later !important rules still overwrite... BUT injecting into
  //        the HTML itself means it's literally the first <style> in the document)
  //        Actually: inject as the LAST style in </head> so it wins.
  await context.route('http://localhost:5000/**', async route => {
    const req = route.request();
    // Only modify HTML responses (the initial document request)
    if (req.resourceType() !== 'document') { await route.continue(); return; }
    const response = await route.fetch();
    const ct = response.headers()['content-type'] || '';
    if (!ct.includes('text/html')) { await route.fulfill({ response }); return; }
    let body = await response.text();
    const inject = `<style id="__gif-no-age__">
      .age-modal-overlay,.age-modal-backdrop,[data-testid="modal-age-verification"]
      {display:none!important;opacity:0!important;visibility:hidden!important;pointer-events:none!important}
      html.modal-open,body.modal-open
      {overflow:auto!important;position:static!important;height:auto!important;width:auto!important}
    </style>`;
    // Inject just before </head> so it's the LAST style → wins specificity ties
    body = body.replace('</head>', inject + '</head>');
    if (!body.includes('</head>')) body = inject + body; // fallback
    await route.fulfill({ response, body, contentType: ct });
  });

  const page = await context.newPage();

  console.log('Loading /research-stacks?tab=custom …');
  await page.goto(`${BASE_URL}/research-stacks?tab=custom`, {
    waitUntil: 'networkidle', timeout: 45000,
  });

  // L2 reinforcement — re-inject CSS after load (addInitScript CSS may have
  // been overridden by the page's own stylesheets via specificity)
  await page.addStyleTag({ content: [
    '.age-modal-overlay, .age-modal-backdrop, [data-testid="modal-age-verification"]',
    '{ display: none !important; opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; }',
    'html.modal-open, body.modal-open',
    '{ overflow: auto !important; position: static !important; height: auto !important; width: auto !important; }',
  ].join(' ') });

  // L3 — DOM removal + class cleanup
  await page.evaluate(() => {
    // Remove modal elements from DOM entirely
    document.querySelectorAll(
      '.age-modal-overlay, [data-testid="modal-age-verification"]'
    ).forEach(el => el.remove());
    // Remove scroll-locking classes the modal adds
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
    // Ensure sessionStorage is set (paranoid re-set)
    sessionStorage.setItem('revive-research-age-verified', 'true');
  });

  await sleep(2000);

  await page.waitForSelector('[data-testid^="card-select-peptide-"]', { timeout: 20000 });
  const cardCount = await page.locator('[data-testid^="card-select-peptide-"]').count();
  console.log(`Products loaded (${cardCount} cards).`);

  // ── Hide fixed nav and reduce main top padding ───────────────────────────
  await page.evaluate(() => {
    let el = document.querySelector('nav');
    while (el && el !== document.body) {
      if (getComputedStyle(el).position === 'fixed') { el.style.display = 'none'; break; }
      el = el.parentElement;
    }
    const main = document.querySelector('main');
    if (main) main.style.paddingTop = '8px';
  });
  await sleep(200);

  // ── Measure ring card position ─────────────────────────────────────────
  const ringEl  = page.locator('[data-testid="card-synergy-ring"]');
  const ringBox = await ringEl.boundingBox(); // CSS px
  if (!ringBox) { console.error('Ring card not found!'); await browser.close(); process.exit(1); }
  console.log('Ring card (CSS px):', ringBox);

  // Scroll ring into view
  await ringEl.scrollIntoViewIfNeeded();
  await sleep(300);

  // Re-measure after scroll
  const ringBox2 = await ringEl.boundingBox();
  console.log('Ring card after scroll (CSS px):', ringBox2);

  // ── Build clip ────────────────────────────────────────────────────────────
  // We want 680×700 output at scale 680/(ringBox.width*2):
  //   actual ring card width  = ringBox.width * 2  (≈ 803 actual px)
  //   scale factor            = W_OUT / actualW    (≈ 680/803 = 0.847)
  //   clip height CSS needed  = H_OUT / scale / 2  (= 700/0.847/2 ≈ 413 CSS px)
  // Then FFmpeg: scale=680:-2 → 680×700
  const clipH_CSS = Math.round(H_OUT / (W_OUT / (ringBox2.width * 2)) / 2);
  const clip = {
    x:      Math.round(ringBox2.x),
    y:      Math.round(ringBox2.y),
    width:  Math.round(ringBox2.width),
    height: clipH_CSS,
  };
  console.log('Clip (CSS px):', clip);

  // ── Select BPC-157 via native dispatchEvent ───────────────────────────────
  // Playwright synthetic click does NOT trigger React's event system for motion.button
  // in headless mode. Native dispatchEvent does.
  console.log('Selecting BPC-157 …');
  const bpcResult = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('[data-testid^="card-select-peptide-"]'));
    const bpc   = cards.find(c => /bpc.?157/i.test(c.textContent || ''));
    if (!bpc) return 'NOT FOUND (' + cards.length + ' total)';
    bpc.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    return bpc.dataset.testid;
  });
  console.log('BPC-157:', bpcResult);
  await sleep(1000);

  const ringText1 = await ringEl.textContent();
  console.log('Ring after BPC-157:', ringText1?.trim().slice(0, 80));

  // ── Phase 1 — BPC-157 alone (2.5 s) ──────────────────────────────────────
  console.log('Phase 1: BPC-157 state …');
  await snapFor(page, clip, 2500);

  // ── Select TB-500 ─────────────────────────────────────────────────────────
  console.log('Selecting TB-500 …');
  const tb500Result = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('[data-testid^="card-select-peptide-"]'));
    const tb    = cards.find(c => /tb.?500/i.test(c.textContent || ''));
    if (!tb) return 'NOT FOUND';
    tb.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    return tb.dataset.testid;
  });
  console.log('TB-500:', tb500Result);
  await sleep(400);

  const ringText2 = await ringEl.textContent();
  console.log('Ring after TB-500:', ringText2?.trim().slice(0, 100));

  // ── Phase 2 — ring animating 0% → 95% (2 s) ──────────────────────────────
  console.log('Phase 2: animation …');
  await snapFor(page, clip, 2000);

  // ── Phase 3 — Wolverine Stack hold (7 s) ─────────────────────────────────
  console.log('Phase 3: Wolverine Stack hold …');
  await snapFor(page, clip, 7000);

  await browser.close();
  console.log(`\nCaptured ${frameIdx} frames.`);

  // Confirm actual frame dimensions
  const probe = spawnSync(FFMPEG, ['-i', path.join(FRAME_DIR, 'f0000.png')], { encoding: 'utf8' });
  const dimM = probe.stderr.match(/(\d+)x(\d+)/);
  if (dimM) console.log(`Frame dimensions: ${dimM[1]}×${dimM[2]} actual px`);

  // ── FFmpeg two-pass palette GIF (locked pipeline from Email 1/2) ──────────
  const palette = path.join(FRAME_DIR, 'palette.png');
  const scaleF  = `scale=${W_OUT}:-2:flags=lanczos`;

  console.log('\nPass 1: palettegen …');
  const p1 = spawnSync(FFMPEG, [
    '-y', '-framerate', String(FPS), '-i', path.join(FRAME_DIR, 'f%04d.png'),
    '-vf', `${scaleF},palettegen=max_colors=256:stats_mode=diff`,
    palette,
  ], { encoding: 'utf8' });
  if (p1.status !== 0) { console.error(p1.stderr.slice(-2000)); process.exit(1); }

  console.log('Pass 2: GIF encode …');
  const p2 = spawnSync(FFMPEG, [
    '-y', '-framerate', String(FPS), '-i', path.join(FRAME_DIR, 'f%04d.png'),
    '-i', palette,
    '-lavfi', `${scaleF}[x];[x][1:v]paletteuse=dither=none`,
    '-loop', '0', OUT_GIF,
  ], { encoding: 'utf8' });
  if (p2.status !== 0) { console.error(p2.stderr.slice(-2000)); process.exit(1); }

  const kb = Math.round(fs.statSync(OUT_GIF).size / 1024);
  console.log(`\nDone → ${OUT_GIF}  (${kb} KB, ${frameIdx} frames, ${FPS} fps, ${W_OUT}×${H_OUT}px)`);
})().catch(e => { console.error(e); process.exit(1); });
