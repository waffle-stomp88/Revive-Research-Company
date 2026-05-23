/**
 * Captures frames from an animated HTML file using Playwright,
 * then stitches them into an animated GIF via FFmpeg.
 *
 * Usage: node scripts/capture-gif.cjs
 */

const { execFileSync, spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

// ── Config ──────────────────────────────────────────────────────────────────
const URL        = "http://localhost:23419/preview/GalaxyVfxComparison/email-assets/coa-animated.html";
const FRAMES_DIR = "/tmp/gif-frames";
const OUTPUT     = path.resolve(__dirname, "../exports/email1-coa-animated.gif");
const WIDTH      = 600;
const HEIGHT     = 700;   // tall enough to include stat bar + bottom CTA
const FPS        = 15;    // frames per second in final GIF
const DURATION_S = 7.5;   // animation builds to ~3050ms, then holds ~4.5s for reading
const TOTAL_FRAMES = Math.ceil(FPS * DURATION_S);  // ~57 frames
const INTERVAL_MS  = Math.round(1000 / FPS);       // ~67ms between frames

// FFmpeg path
const FFMPEG = "/nix/store/8md1l3im3gbf73fxns3l5nmc9hwdz1r9-replit-runtime-path/bin/ffmpeg";

async function main() {
  // Clean frame dir
  if (fs.existsSync(FRAMES_DIR)) fs.rmSync(FRAMES_DIR, { recursive: true });
  fs.mkdirSync(FRAMES_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });

  const { chromium } = require("playwright");
  const browser = await chromium.launch({
    headless: true,
    executablePath: "/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  console.log(`Navigating to ${URL} …`);
  await page.goto(URL, { waitUntil: "networkidle" });

  // Wait for setFrame() to be defined (script has executed)
  await page.waitForFunction(() => typeof window.setFrame === 'function', { timeout: 8000 });
  // Give Google Fonts a moment to load over the network
  await page.waitForTimeout(1200);

  console.log(`Capturing ${TOTAL_FRAMES} frames at ${FPS} fps via setFrame() …`);

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const timeMs = i * INTERVAL_MS;

    // Drive the JS animation to exactly this timestamp
    await page.evaluate((t) => window.setFrame(t), timeMs);

    const pad = String(i).padStart(4, "0");
    const framePath = path.join(FRAMES_DIR, `frame${pad}.png`);
    await page.screenshot({ path: framePath, clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });

    if (i % 10 === 0) process.stdout.write(`  frame ${i + 1}/${TOTAL_FRAMES}\r`);
  }
  process.stdout.write("\n");

  await browser.close();
  console.log("Frames captured. Running FFmpeg …");

  // Step 1: Build palette for best GIF colour quality
  const palette = path.join(FRAMES_DIR, "palette.png");
  const paletteResult = spawnSync(FFMPEG, [
    "-y",
    "-framerate", String(FPS),
    "-i", path.join(FRAMES_DIR, "frame%04d.png"),
    "-vf", "palettegen=max_colors=256:stats_mode=full",
    palette,
  ], { encoding: "utf8" });

  if (paletteResult.status !== 0) {
    console.error("FFmpeg palettegen failed:", paletteResult.stderr);
    process.exit(1);
  }

  // Step 2: Encode GIF using palette
  const gifResult = spawnSync(FFMPEG, [
    "-y",
    "-framerate", String(FPS),
    "-i", path.join(FRAMES_DIR, "frame%04d.png"),
    "-i", palette,
    "-lavfi", "paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle",
    "-loop", "0",   // 0 = loop forever
    OUTPUT,
  ], { encoding: "utf8" });

  if (gifResult.status !== 0) {
    console.error("FFmpeg GIF encode failed:", gifResult.stderr);
    process.exit(1);
  }

  const sizeKB = Math.round(fs.statSync(OUTPUT).size / 1024);
  console.log(`\nDone! GIF saved to: ${OUTPUT}`);
  console.log(`File size: ${sizeKB} KB`);
}

main().catch((err) => { console.error(err); process.exit(1); });
