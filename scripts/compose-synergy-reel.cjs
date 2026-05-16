#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FFMPEG = '/nix/store/d10czjzvvk0f6diryazjgrfjmvdibkkd-replit-runtime-path/bin/ffmpeg';
const BEBAS  = '/tmp/reel/BebasNeue-Regular.ttf';
const DVSANS = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';

const CLIPS = [
  'attached_assets/generated_videos/hook_molecules.mp4',
  'attached_assets/generated_videos/build_stack.mp4',
  'attached_assets/generated_videos/shared_pathways.mp4',
  'attached_assets/generated_videos/synergy_ring.mp4',
  'attached_assets/generated_videos/cta_background.mp4',
];
const MUSIC  = 'attached_assets/generated_audio/music_synergy_reel_music.mp3';
const OUTPUT = 'client/public/videos/synergy_reel.mp4';

fs.mkdirSync('client/public/videos', { recursive: true });

// ─── text overlay builders ────────────────────────────────────────────────────
const Y  = '#E7FB10';   // neon yellow
const CY = '#21D8FF';  // cyan
const W  = '#FFFFFF';  // white

function dt({ font, size, color, alpha, y, text }) {
  const fc = alpha !== undefined ? `${color}@${alpha}` : color;
  return `drawtext=fontfile=${font}:fontsize=${size}:fontcolor=${fc}:x=(w-text_w)/2:y=${y}:text='${text}'`;
}

// ─── per-scene text stacks ────────────────────────────────────────────────────
const BRAND_BUG = dt({ font: BEBAS, size: 44, color: W, alpha: 0.50, y: 1750, text: 'REVIVE RESEARCH' });

const scenes = [
  // Scene 0 — Hook
  [
    dt({ font: BEBAS,  size: 130, color: Y,  y: 560,  text: 'YOUR PEPTIDES' }),
    dt({ font: BEBAS,  size: 130, color: Y,  y: 700,  text: 'WORK BETTER' }),
    dt({ font: BEBAS,  size: 130, color: Y,  y: 840,  text: 'TOGETHER.' }),
    BRAND_BUG,
  ],
  // Scene 1 — Build Your Stack
  [
    dt({ font: BEBAS,  size: 62,  color: CY, y: 560,  text: 'STEP 01' }),
    dt({ font: BEBAS,  size: 115, color: W,  y: 630,  text: 'BUILD YOUR STACK' }),
    dt({ font: DVSANS, size: 40,  color: W,  alpha: 0.85, y: 790, text: 'Select 2 to 4 research compounds' }),
    BRAND_BUG,
  ],
  // Scene 2 — Shared Pathways
  [
    dt({ font: BEBAS,  size: 62,  color: CY, y: 560,  text: 'STEP 02' }),
    dt({ font: BEBAS,  size: 115, color: W,  y: 630,  text: 'SHARED PATHWAYS' }),
    dt({ font: DVSANS, size: 40,  color: W,  alpha: 0.85, y: 790, text: 'Detected across receptor systems' }),
    BRAND_BUG,
  ],
  // Scene 3 — Synergy Ring
  [
    dt({ font: BEBAS,  size: 62,  color: CY, y: 560,  text: 'STEP 03' }),
    dt({ font: BEBAS,  size: 115, color: W,  y: 630,  text: 'THE SYNERGY RING' }),
    dt({ font: DVSANS, size: 40,  color: W,  alpha: 0.85, y: 790, text: 'Maps compatibility in real time' }),
    BRAND_BUG,
  ],
  // Scene 4 — CTA
  [
    dt({ font: BEBAS,  size: 170, color: Y,  y: 520,  text: 'TRY IT FREE' }),
    dt({ font: BEBAS,  size: 80,  color: W,  y: 715,  text: 'ReviveResearch.co' }),
    dt({ font: BEBAS,  size: 54,  color: W,  alpha: 0.70, y: 810, text: '/stack-builder' }),
    BRAND_BUG,
  ],
];

// ─── build filter_complex ─────────────────────────────────────────────────────
const chains = [];

for (let i = 0; i < 5; i++) {
  const textFilters = scenes[i].join(',');
  chains.push(
    `[${i}:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,` +
    `drawbox=x=0:y=0:w=iw:h=ih:color=0x0A0A0F@0.52:t=fill,` +
    `${textFilters}[s${i}]`
  );
}

// xfade chain — 0.4s transitions, offsets account for previous transitions
// With 6s clips and 0.4s fades: offset = (n * 6) - (n * 0.4) - 0.4
// offset1 = 5.6, offset2 = 11.2, offset3 = 16.8, offset4 = 22.4
const FADE_DUR = 0.4;
const CLIP_DUR = 6.0;
chains.push(`[s0][s1]xfade=transition=fade:duration=${FADE_DUR}:offset=${CLIP_DUR - FADE_DUR}[v01]`);
chains.push(`[v01][s2]xfade=transition=fade:duration=${FADE_DUR}:offset=${CLIP_DUR*2 - FADE_DUR*2}[v012]`);
chains.push(`[v012][s3]xfade=transition=fade:duration=${FADE_DUR}:offset=${CLIP_DUR*3 - FADE_DUR*3}[v0123]`);
chains.push(`[v0123][s4]xfade=transition=fade:duration=${FADE_DUR}:offset=${CLIP_DUR*4 - FADE_DUR*4}[vout]`);

// Total duration: 5*6 - 4*0.4 = 28.4s
const TOTAL = 5 * CLIP_DUR - 4 * FADE_DUR;
chains.push(
  `[5:a]atrim=0:${TOTAL},` +
  `afade=t=in:st=0:d=1.0,` +
  `afade=t=out:st=${TOTAL - 2}:d=2.0[aout]`
);

const filterComplex = chains.join(';\n');

// ─── build ffmpeg args ────────────────────────────────────────────────────────
const args = [];

// inputs: 5 video clips + 1 audio
for (const clip of CLIPS) args.push('-i', clip);
args.push('-i', MUSIC);

args.push(
  '-filter_complex', filterComplex,
  '-map', '[vout]',
  '-map', '[aout]',
  '-c:v', 'libx264',
  '-preset', 'fast',
  '-crf', '18',
  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  '-c:a', 'aac',
  '-b:a', '192k',
  '-t', String(TOTAL),
  '-y',
  OUTPUT
);

console.log('Starting FFmpeg composition...');
console.log(`Output: ${OUTPUT}`);
console.log(`Total duration: ${TOTAL}s`);
console.log('');
console.log('Filter complex preview:');
console.log(filterComplex.slice(0, 400) + '...');
console.log('');

const result = spawnSync(FFMPEG, args, {
  stdio: ['ignore', 'pipe', 'pipe'],
  maxBuffer: 50 * 1024 * 1024,
  timeout: 300_000,
});

if (result.error) {
  console.error('Spawn error:', result.error.message);
  process.exit(1);
}

const stderr = result.stderr ? result.stderr.toString() : '';
const stdout = result.stdout ? result.stdout.toString() : '';

if (result.status !== 0) {
  console.error('FFmpeg failed (exit', result.status, ')');
  console.error('STDERR tail:', stderr.slice(-3000));
  process.exit(1);
}

if (!fs.existsSync(OUTPUT)) {
  console.error('Output file not created.');
  console.error('STDERR tail:', stderr.slice(-2000));
  process.exit(1);
}

const size = fs.statSync(OUTPUT).size;
console.log(`\nDone! ${OUTPUT} — ${(size / 1024 / 1024).toFixed(1)} MB`);
