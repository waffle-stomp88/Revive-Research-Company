/**
 * Email 2 — Education Center stat-reveal GIF
 * Usage: node scripts/capture-gif-email2.cjs
 */
const { spawnSync } = require("child_process");
const path = require("path");
const fs   = require("fs");

const URL        = "http://localhost:23419/preview/GalaxyVfxComparison/email-assets/edu-stats.html";
const FRAMES_DIR = "/tmp/gif-frames-email2";
const OUTPUT     = path.resolve(__dirname, "../exports/email2-edu-stats.gif");
const WIDTH      = 680;
const HEIGHT     = 800;
const FPS        = 15;
const DURATION_S = 8.0;
const TOTAL_FRAMES = Math.ceil(FPS * DURATION_S);
const INTERVAL_MS  = Math.round(1000 / FPS);
const FFMPEG = "/nix/store/8md1l3im3gbf73fxns3l5nmc9hwdz1r9-replit-runtime-path/bin/ffmpeg";

async function main() {
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
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log(`Navigating to ${URL} …`);
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForFunction(() => typeof window.setFrame === 'function', { timeout: 8000 });
  await page.waitForTimeout(1400);

  console.log(`Capturing ${TOTAL_FRAMES} frames at ${FPS} fps …`);
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    await page.evaluate((t) => window.setFrame(t), i * INTERVAL_MS);
    const pad = String(i).padStart(4, "0");
    await page.screenshot({
      path: path.join(FRAMES_DIR, `frame${pad}.png`),
      clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
    });
    if (i % 10 === 0) process.stdout.write(`  frame ${i + 1}/${TOTAL_FRAMES}\r`);
  }
  process.stdout.write("\n");
  await browser.close();
  console.log("Frames captured. Running FFmpeg …");

  const palette = path.join(FRAMES_DIR, "palette.png");
  spawnSync(FFMPEG, [
    "-y", "-framerate", String(FPS),
    "-i", path.join(FRAMES_DIR, "frame%04d.png"),
    "-vf", `scale=${WIDTH}:${HEIGHT}:flags=lanczos,palettegen=max_colors=256:stats_mode=full`,
    palette,
  ], { encoding: "utf8" });

  const gifResult = spawnSync(FFMPEG, [
    "-y", "-framerate", String(FPS),
    "-i", path.join(FRAMES_DIR, "frame%04d.png"),
    "-i", palette,
    "-lavfi", `scale=${WIDTH}:${HEIGHT}:flags=lanczos[x];[x][1:v]paletteuse=dither=none:diff_mode=rectangle`,
    "-loop", "0",
    OUTPUT,
  ], { encoding: "utf8" });

  if (gifResult.status !== 0) { console.error(gifResult.stderr); process.exit(1); }
  const sizeKB = Math.round(fs.statSync(OUTPUT).size / 1024);
  console.log(`\nDone! → ${OUTPUT}  (${sizeKB} KB)`);
}

main().catch((err) => { console.error(err); process.exit(1); });
