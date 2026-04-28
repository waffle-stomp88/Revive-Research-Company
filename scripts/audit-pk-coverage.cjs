#!/usr/bin/env node
/**
 * PK Coverage Audit — scripts/audit-pk-coverage.cjs
 *
 * Verifies that every unique peptide slug listed in known-stacks.ts has a
 * corresponding entry in pharmacokinetics.ts (either via PEPTIDE_HALF_LIVES
 * or NAME_SLUG_OVERRIDES). Exits with code 1 and prints missing slugs if any
 * gaps are found; exits 0 when all slugs are covered.
 *
 * Usage:
 *   node scripts/audit-pk-coverage.cjs
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

function readFile(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function nameToSlug(name) {
  return name
    .toLowerCase()
    .replace(/\s*\(no dac\)/i, "-no-dac")
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractKnownStackSlugs(src) {
  const slugs = new Set();
  const peptideBlocks = src.match(/peptides:\s*\[([^\]]+)\]/g) || [];
  peptideBlocks.forEach((block) => {
    const items = block.match(/"([^"]+)"/g) || [];
    items.forEach((i) => slugs.add(i.replace(/"/g, "")));
  });
  return slugs;
}

function extractPkSlugs(src) {
  const slugs = new Set();
  const slugMatches = src.match(/slug:\s*"([^"]+)"/g) || [];
  slugMatches.forEach((m) => {
    const match = m.match(/"([^"]+)"/);
    if (match) slugs.add(match[1]);
  });
  return slugs;
}

function extractOverrides(src) {
  const overrideSection = src.match(/NAME_SLUG_OVERRIDES[^=]*=\s*\{([^}]+)\}/s);
  if (!overrideSection) return new Map();
  const overrides = new Map();
  const pairs = overrideSection[1].match(/"([^"]+)":\s*"([^"]+)"/g) || [];
  pairs.forEach((pair) => {
    const [, from, to] = pair.match(/"([^"]+)":\s*"([^"]+)"/);
    overrides.set(from, to);
  });
  return overrides;
}

function run() {
  const knownSrc = readFile("client/src/data/known-stacks.ts");
  const pkSrc = readFile("client/src/data/pharmacokinetics.ts");

  const knownSlugs = extractKnownStackSlugs(knownSrc);
  if (knownSlugs.size === 0) {
    console.error(
      "ERROR: No peptide slugs extracted from known-stacks.ts — regex parser may be broken " +
      "or the file format has changed. Audit cannot continue."
    );
    process.exit(2);
  }

  const pkSlugs = extractPkSlugs(pkSrc);
  if (pkSlugs.size === 0) {
    console.error(
      "ERROR: No PK slugs extracted from pharmacokinetics.ts — regex parser may be broken " +
      "or the file format has changed. Audit cannot continue."
    );
    process.exit(2);
  }

  const overrides = extractOverrides(pkSrc);

  let missing = [];
  let covered = [];

  for (const slug of [...knownSlugs].sort()) {
    const raw = nameToSlug(slug);
    const resolved = overrides.get(raw) || raw;
    const found = pkSlugs.has(resolved);

    if (found) {
      covered.push({ slug, raw, resolved });
    } else {
      missing.push({ slug, raw, resolved });
    }
  }

  console.log("PK Coverage Audit — known-stacks.ts slugs");
  console.log("=".repeat(70));
  covered.forEach(({ slug, raw, resolved }) => {
    const via = overrides.has(raw) ? "(via override)" : "(direct)";
    console.log(`  ✓  ${slug.padEnd(26)} → ${resolved} ${via}`);
  });

  if (missing.length > 0) {
    console.log("\n  MISSING PK ENTRIES:");
    missing.forEach(({ slug, raw, resolved }) => {
      console.log(`  ✗  ${slug.padEnd(26)} → looked up as "${resolved}" — not found`);
    });
    console.log(
      `\n  ${missing.length} slug(s) have no PK entry. Add a HalfLifeEntry to PEPTIDE_HALF_LIVES,`
    );
    console.log(
      "  an alias in NAME_SLUG_OVERRIDES, or mark them intentionally non-chartable with a comment."
    );
    process.exit(1);
  } else {
    console.log(`\n  All ${covered.length} known-stack peptide slugs are covered. No gaps found.`);
    process.exit(0);
  }
}

run();
