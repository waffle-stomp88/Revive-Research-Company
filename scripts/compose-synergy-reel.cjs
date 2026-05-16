#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

// ── Paths ─────────────────────────────────────────────────────────────────────
const FFMPEG = '/nix/store/d10czjzvvk0f6diryazjgrfjmvdibkkd-replit-runtime-path/bin/ffmpeg';
const SRC    = '/tmp/reel/page@bfee80bc4d411d92e256bda9463b130c.webm';
const BEBAS  = '/tmp/reel/BebasNeue-Regular.ttf';
const DVSANS = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
const LOGO   = path.resolve('client/public/assets/logo.png');
const MUSIC  = path.resolve('attached_assets/generated_audio/music_synergy_reel_music.mp3');
const HUD_C  = path.resolve('attached_assets/generated_images/hud_corners.png');
const HUD_R  = path.resolve('attached_assets/generated_images/hud_ring.png');
const OUTRO  = path.resolve('attached_assets/generated_images/outro_bg.png');
const OUT    = 'client/public/videos/synergy_reel.mp4';
const TMP    = '/tmp/reel';

fs.mkdirSync('client/public/videos', { recursive: true });

// ── Canvas ────────────────────────────────────────────────────────────────────
const W = 1080, H = 1920;
// Scale source 1920×1080 → 3413×1920 (fills 9:16 height), then crop 1080×1920
const SCALE_W = 3413;

// ── Palette ───────────────────────────────────────────────────────────────────
const YELLOW = '#E7FB10';
const CYAN   = '#21D8FF';
const WHITE  = '#FFFFFF';

// ── Cyberpunk grade chain ─────────────────────────────────────────────────────
// colorbalance correct option names: rs/gs/bs (shadows), rm/gm/bm (mids), rh/gh/bh (highs)
const GRADE = [
  'eq=saturation=1.5:contrast=1.08:brightness=-0.02',
  "curves=r='0/0 0.5/0.42 1/0.88':g='0/0 0.5/0.51 1/1.0':b='0/0 0.5/0.62 1/1.0'",
  'colorbalance=rs=-0.08:bs=0.12:rm=0.02:bm=0.05:rh=-0.04:bh=0.06',
  'vignette',
].join(',');

// ── Helpers ───────────────────────────────────────────────────────────────────
function dt({ text, font = BEBAS, size = 72, color = WHITE, x = `(w-text_w)/2`, y, fadeIn }) {
  const alpha = fadeIn
    ? `if(lt(t\\,${fadeIn})\\,t/${fadeIn}\\,1)`
    : '1';
  return (
    `drawtext=fontfile='${font}':text='${text}':fontsize=${size}` +
    `:fontcolor=${color}:x=${x}:y=${y}:alpha='${alpha}'` +
    `:shadowcolor=black@0.85:shadowx=3:shadowy=3`
  );
}

function ff(args, label) {
  console.log(`\n▶ ${label}`);
  const r = spawnSync(FFMPEG, ['-y', ...args], { stdio: 'inherit', timeout: 180_000 });
  if (r.status !== 0) throw new Error(`FFmpeg failed at step: ${label}`);
}

// ── Scene renderer ────────────────────────────────────────────────────────────
// Pan across the 3413 px wide scaled frame from cropX1 → cropX2
// overlayFile: optional PNG for screen-blend HUD (corners / ring)
function renderScene({ name, start, dur, cropX1, cropX2, texts = [], overlayFile }) {
  const out  = `${TMP}/s_${name}.mp4`;
  const x2   = cropX2 ?? cropX1;
  const panX = Math.abs(x2 - cropX1) < 2
    ? String(cropX1)
    : `${cropX1}+(${x2}-${cropX1})*t/${dur}`;

  const baseVF   = `scale=${SCALE_W}:${H},crop=${W}:${H}:${panX}:0,${GRADE}`;
  const textPart = texts.length ? ',' + texts.map(dt).join(',') : '';

  if (fs.existsSync(out)) { console.log(`  ↩ reuse ${path.basename(out)}`); return out; }

  if (!overlayFile) {
    ff([
      '-ss', String(start), '-t', String(dur),
      '-i', SRC,
      '-vf', `${baseVF}${textPart}`,
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
      '-pix_fmt', 'yuv420p', '-r', '30', out,
    ], name);
  } else {
    // Screen-blend HUD overlay via filter_complex
    const fc = [
      `[0:v]${baseVF}[base]`,
      `[1:v]scale=${W}:${H}[hud]`,
      `[base][hud]blend=all_mode=screen:all_opacity=0.72${textPart}[out]`,
    ].join(';');
    ff([
      '-ss', String(start), '-t', String(dur),
      '-i', SRC,
      '-i', overlayFile,
      '-filter_complex', fc,
      '-map', '[out]',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
      '-pix_fmt', 'yuv420p', '-r', '30', out,
    ], name);
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
//  SCENE DEFINITIONS
//
//  Source 1920 px → scaled 3413 px.  Crop positions (x = left edge of 1080 crop):
//    Left panel (peptide grid):  x ≈ 400–500
//    Centre (both panels):       x ≈ 1100–1200
//    Right panel (synergy ring): x ≈ 2050–2150
// ─────────────────────────────────────────────────────────────────────────────
const TOP_Y = 80;
const SUB_Y = 168;
const BTM_Y = H - 200;

const scenes = [
  // 1 ─ Homepage hero (5 s)
  {
    name: 'homepage', start: 13, dur: 5,
    cropX1: 1100, cropX2: 1250,
    texts: [
      { text: 'THE SYNERGY ENGINE',                     size: 88,  color: CYAN,   y: TOP_Y, fadeIn: 0.5 },
      { text: 'AI-POWERED PEPTIDE STACK ANALYSIS', font: DVSANS, size: 30, color: WHITE, y: SUB_Y, fadeIn: 1.0 },
    ],
  },
  // 2 ─ Stack Builder page loads (5 s) — pan left → centre
  {
    name: 'builder_load', start: 29, dur: 5,
    cropX1: 600, cropX2: 1300,
    texts: [
      { text: 'CREATE YOUR PERFECT STACK',              size: 78,  color: YELLOW, y: TOP_Y, fadeIn: 0.6 },
      { text: 'SELECT 2-4 PEPTIDES  \u2022  DISCOVER SYNERGIES', font: DVSANS, size: 29, color: WHITE, y: SUB_Y, fadeIn: 1.0 },
    ],
  },
  // 3 ─ BPC-157 search + select (5 s) — left panel
  {
    name: 'bpc157', start: 41, dur: 5,
    cropX1: 350, cropX2: 500,
    texts: [
      { text: 'COMPOUND 01',      size: 68,  color: CYAN,   y: TOP_Y, fadeIn: 0.4 },
      { text: 'BPC-157  \u2022  HEALING', font: DVSANS, size: 36, color: YELLOW, y: SUB_Y, fadeIn: 0.8 },
    ],
  },
  // 4 ─ TB-500 + 95 % synergy fires (7 s) — dramatic pan left → synergy ring
  {
    name: 'wolverine', start: 48, dur: 7,
    cropX1: 400, cropX2: 2080,
    overlayFile: HUD_C,
    texts: [
      { text: '95% SYNERGY',                            size: 100, color: YELLOW, y: TOP_Y,        fadeIn: 0.6 },
      { text: 'RECOVERY + TISSUE MECHANISMS', font: DVSANS, size: 29, color: WHITE, y: SUB_Y,      fadeIn: 1.0 },
      { text: 'LEGENDARY COMBO DETECTED',               size: 52,  color: CYAN,   y: BTM_Y - 60,  fadeIn: 2.5 },
    ],
  },
  // 5 ─ Body Systems accordion (4 s) — right panel
  {
    name: 'body_systems', start: 60, dur: 4,
    cropX1: 2050, cropX2: 2050,
    overlayFile: HUD_R,
    texts: [
      { text: 'SHARED RECEPTOR SYSTEMS',               size: 68,  color: CYAN,   y: TOP_Y, fadeIn: 0.5 },
      { text: 'HEALING  \u2022  METABOLIC  \u2022  GROWTH', font: DVSANS, size: 29, color: WHITE, y: SUB_Y, fadeIn: 0.8 },
    ],
  },
  // 6 ─ Cart / CTA (4 s) — centre
  {
    name: 'cart_cta', start: 96, dur: 4,
    cropX1: 1100, cropX2: 1100,
    texts: [
      { text: 'YOUR STACK. 10% OFF.',                  size: 82,  color: YELLOW, y: TOP_Y,       fadeIn: 0.4 },
      { text: 'SYNERGY DISCOUNT APPLIED AUTOMATICALLY', font: DVSANS, size: 26, color: WHITE, y: SUB_Y, fadeIn: 0.8 },
      { text: 'ADD TO CART \u2192',                    size: 58,  color: CYAN,   y: BTM_Y - 50, fadeIn: 1.2 },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  LOGO OUTRO  (5 s static card)
// ─────────────────────────────────────────────────────────────────────────────
function makeOutro() {
  const out = `${TMP}/s_outro.mp4`;
  const fc = [
    `[0:v]scale=${W}:${H}[bg]`,
    `[1:v]scale=280:-1[logo]`,
    `[bg][logo]overlay=(main_w-overlay_w)/2:660[v0]`,
    `[v0]` + [
      dt({ text: 'REVIVE RESEARCH',              size: 90,  color: YELLOW, y: 1020 }),
      dt({ text: 'AI-POWERED PEPTIDE RESEARCH',  font: DVSANS, size: 28, color: WHITE, y: 1130 }),
      dt({ text: 'ReviveResearch.co',            font: DVSANS, size: 34, color: CYAN,  y: 1192 }),
    ].join(',') + '[out]',
  ].join(';');

  ff([
    '-loop', '1', '-t', '5', '-i', OUTRO,
    '-loop', '1', '-t', '5', '-i', LOGO,
    '-filter_complex', fc,
    '-map', '[out]',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
    '-pix_fmt', 'yuv420p', '-r', '30', out,
  ], 'outro');
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN
// ─────────────────────────────────────────────────────────────────────────────
console.log('=== Revive Research — Live UI Synergy Reel Composer ===\n');

// 1. Render each scene clip
const clips = scenes.map(s => renderScene(s));
clips.push(makeOutro());

// 2. Write concat list
const listFile = `${TMP}/concat.txt`;
fs.writeFileSync(listFile, clips.map(f => `file '${f}'`).join('\n') + '\n');
console.log('\nConcatenating clips:', clips.map(f => path.basename(f)).join(', '));

// 3. Stream-copy concat (all clips share same codec + resolution)
const concatRaw = `${TMP}/concat_raw.mp4`;
ff([
  '-f', 'concat', '-safe', '0', '-i', listFile,
  '-c', 'copy', concatRaw,
], 'concat');

// 4. Mix music with fade-out at end
const totalSec = scenes.reduce((s, c) => s + c.dur, 0) + 5; // scenes + outro
const fadeStart = totalSec - 3;
ff([
  '-i', concatRaw,
  '-i', MUSIC,
  '-filter_complex',
    `[1:a]aloop=loop=-1:size=2e+09,atrim=end=${totalSec},afade=t=in:st=0:d=1.5,afade=t=out:st=${fadeStart}:d=3[a]`,
  '-map', '0:v',
  '-map', '[a]',
  '-c:v', 'copy',
  '-c:a', 'aac', '-b:a', '192k',
  '-shortest', OUT,
], 'mix_music');

const size = fs.statSync(OUT).size;
console.log(`\n✅  Reel → ${OUT}  (${(size / 1024 / 1024).toFixed(1)} MB, ~${totalSec}s)`);
