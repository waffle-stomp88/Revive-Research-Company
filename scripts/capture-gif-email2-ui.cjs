/**
 * Email 2 — Education Center UI Preview GIF
 * Usage: node scripts/capture-gif-email2-ui.cjs
 */
const { spawnSync } = require("child_process");
const path = require("path");
const fs   = require("fs");

const URL        = "http://localhost:23419/preview/GalaxyVfxComparison/email-assets/edu-ui-preview.html";
const FRAMES_DIR = "/tmp/gif-frames-edu-ui";
const OUTPUT     = path.resolve(__dirname, "../exports/email2-edu-ui-preview.gif");
const WIDTH      = 680;
const HEIGHT     = 600;
const FPS        = 15;
const DURATION_S = 5.0;
const TOTAL_FRAMES = Math.ceil(FPS * DURATION_S);
const INTERVAL_MS  = Math.round(1000 / FPS);
const CHROMIUM = "/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium";
const FFMPEG   = "/nix/store/8md1l3im3gbf73fxns3l5nmc9hwdz1r9-replit-runtime-path/bin/ffmpeg";

async function main() {
  if (fs.existsSync(FRAMES_DIR)) fs.rmSync(FRAMES_DIR, { recursive: true });
  fs.mkdirSync(FRAMES_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });

  const { chromium } = require("playwright");
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROMIUM,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log(`Navigating to ${URL} …`);
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForFunction(() => typeof window.setFrame === 'function' && window.__fontsReady, { timeout: 10000 });
  await page.waitForTimeout(600);

  // Measure pill geometry inside the browser
  const measured = await page.evaluate(() => {
    const qb = document.getElementById('btn-qb');
    const dd = document.getElementById('btn-dd');
    return { qbW: qb ? qb.offsetWidth : 148, ddW: dd ? dd.offsetWidth : 118 };
  });
  console.log(`Pill geometry — QB: ${measured.qbW}px  DD: ${measured.ddW}px`);

  console.log(`Capturing ${TOTAL_FRAMES} frames at ${FPS} fps …`);
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    await page.evaluate((t) => window.setFrame(t), i * INTERVAL_MS);
    await page.screenshot({
      path: path.join(FRAMES_DIR, `frame${String(i).padStart(4,'0')}.png`),
      clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
    });
    if (i % 10 === 0) process.stdout.write(`  frame ${i+1}/${TOTAL_FRAMES}\r`);
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
  ]);

  const r = spawnSync(FFMPEG, [
    "-y", "-framerate", String(FPS),
    "-i", path.join(FRAMES_DIR, "frame%04d.png"),
    "-i", palette,
    "-lavfi", `scale=${WIDTH}:${HEIGHT}:flags=lanczos[x];[x][1:v]paletteuse=dither=none:diff_mode=rectangle`,
    "-loop", "0",
    OUTPUT,
  ], { encoding: "utf8" });

  if (r.status !== 0) { console.error(r.stderr); process.exit(1); }
  const kb = Math.round(fs.statSync(OUTPUT).size / 1024);
  console.log(`\nDone! → ${OUTPUT}  (${kb} KB)`);
}

main().catch(e => { console.error(e); process.exit(1); });
