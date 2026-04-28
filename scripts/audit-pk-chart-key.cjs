#!/usr/bin/env node
/**
 * PK Chart Key Audit — scripts/audit-pk-chart-key.cjs
 *
 * Verifies three things that prevent the listing-page mini PK chart, the
 * detail-page PK chart, and their SC / Other-route line-style keys from
 * silently breaking:
 *
 *   1. SOURCE CHECK — The data-testid attributes for mini-pk-chart-{stackId}
 *      and pk-line-style-key-{stackId} are still present in mini-pk-chart.tsx.
 *      A component refactor that drops these testids will be caught here.
 *
 *   2. SOURCE CHECK — The static data-testid="pk-line-style-key" attribute is
 *      still present in research-stack-detail.tsx. A refactor of the detail
 *      page that removes the testid will be caught here.
 *
 *   3. DATA CHECK — At least one pre-built research stack contains a compound
 *      whose PK route is NOT "subcutaneous". This guarantees the line-style key
 *      (dashed = Other route) has real data that would actually cause it to render.
 *      Removing the PK entry for Semax/Selank (or any other non-SC compound
 *      used in a pre-built stack) will be caught here.
 *
 * Exits 0 when all checks pass; exits 1 on any failure.
 *
 * Usage:
 *   node scripts/audit-pk-chart-key.cjs
 */

"use strict";

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

function extractResearchStackIds(src) {
  const ids = [];
  const matches = src.matchAll(/id:\s*"([^"]+)"/g);
  for (const m of matches) {
    ids.push(m[1]);
  }
  return ids;
}

function extractPrebuiltStackPeptides(src) {
  const stacks = [];
  const stackBlocks = src.matchAll(/\{\s*id:\s*"([^"]+)"[\s\S]*?peptides:\s*\[([\s\S]*?)\]/g);
  for (const block of stackBlocks) {
    const id = block[1];
    const peptideNamesRaw = block[2].matchAll(/name:\s*"([^"]+)"/g);
    const peptides = [];
    for (const m of peptideNamesRaw) {
      peptides.push(m[1]);
    }
    if (peptides.length > 0) {
      stacks.push({ id, peptides });
    }
  }
  return stacks;
}

function extractPkEntries(src) {
  const entries = new Map();
  const blocks = src.matchAll(/slug:\s*"([^"]+)"[\s\S]*?route:\s*"([^"]+)"/g);
  for (const b of blocks) {
    const slug = b[1];
    const route = b[2];
    entries.set(slug, route);
  }
  return entries;
}

function extractNameSlugOverrides(src) {
  const overrides = new Map();
  const section = src.match(/NAME_SLUG_OVERRIDES[^=]*=\s*\{([^}]+)\}/s);
  if (!section) return overrides;
  const pairs = section[1].matchAll(/"([^"]+)":\s*"([^"]+)"/g);
  for (const p of pairs) {
    overrides.set(p[1], p[2]);
  }
  return overrides;
}

function resolveSlug(displayName, overrides, pkEntries) {
  const raw = nameToSlug(displayName);
  const resolved = overrides.get(raw) ?? raw;
  if (pkEntries.has(resolved)) return resolved;

  for (const override of overrides.keys()) {
    if (raw.startsWith(override + "-") || raw.startsWith(override + " ")) {
      return overrides.get(override);
    }
  }

  for (const slug of pkEntries.keys()) {
    if (raw === slug || raw.startsWith(slug + "-")) {
      return slug;
    }
  }

  return null;
}

function run() {
  let allPassed = true;

  const pkSrc = readFile("client/src/data/pharmacokinetics.ts");
  const stacksSrc = readFile("client/src/data/research-stacks.ts");

  // MiniPKChart testids live in the extracted component file
  const miniPkChartSrc = readFile("client/src/components/mini-pk-chart.tsx");
  // Detail-page PK chart key now lives in the shared pharmacokinetics-chart component
  const detailPageSrc = readFile("client/src/components/pharmacokinetics-chart.tsx");

  console.log("PK Chart Key Audit");
  console.log("=".repeat(70));

  // ── Check 1: mini-pk-chart testid pattern present in component ────────────
  const miniChartTestidPattern = /data-testid=\{`mini-pk-chart-\$\{stackId\}`\}/;
  if (miniChartTestidPattern.test(miniPkChartSrc)) {
    console.log("  ✓  data-testid=\"mini-pk-chart-{stackId}\" attribute found in mini-pk-chart.tsx");
  } else {
    console.error("  ✗  MISSING: data-testid=\"mini-pk-chart-{stackId}\" attribute not found in mini-pk-chart.tsx");
    console.error("     The MiniPKChart component may have been refactored or the testid removed.");
    allPassed = false;
  }

  // ── Check 2: pk-line-style-key testid pattern present in component ────────
  const lineStyleKeyTestidPattern = /data-testid=\{`pk-line-style-key-\$\{stackId\}`\}/;
  if (lineStyleKeyTestidPattern.test(miniPkChartSrc)) {
    console.log("  ✓  data-testid=\"pk-line-style-key-{stackId}\" attribute found in mini-pk-chart.tsx");
  } else {
    console.error("  ✗  MISSING: data-testid=\"pk-line-style-key-{stackId}\" attribute not found in mini-pk-chart.tsx");
    console.error("     The line-style key element may have been refactored or the testid removed.");
    allPassed = false;
  }

  // ── Check 3: pk-line-style-key static testid present in shared chart component ─
  const detailLineStyleKeyPattern = /data-testid="pk-line-style-key"/;
  if (detailLineStyleKeyPattern.test(detailPageSrc)) {
    console.log("  ✓  data-testid=\"pk-line-style-key\" attribute found in pharmacokinetics-chart.tsx");
  } else {
    console.error("  ✗  MISSING: data-testid=\"pk-line-style-key\" attribute not found in pharmacokinetics-chart.tsx");
    console.error("     The detail-page line-style key element may have been refactored or the testid removed.");
    allPassed = false;
  }

  // ── Check 4: at least one pre-built stack has a non-SC compound ────────────
  const pkEntries = extractPkEntries(pkSrc);
  if (pkEntries.size === 0) {
    console.error("  ✗  ERROR: No PK entries extracted from pharmacokinetics.ts — parser may be broken.");
    process.exit(2);
  }

  const overrides = extractNameSlugOverrides(pkSrc);
  const prebuiltStacks = extractPrebuiltStackPeptides(stacksSrc);
  if (prebuiltStacks.length === 0) {
    console.error("  ✗  ERROR: No pre-built stacks extracted from research-stacks.ts — parser may be broken.");
    process.exit(2);
  }

  const nonSCStacks = [];
  const stackResults = [];

  for (const stack of prebuiltStacks) {
    const nonSCCompounds = [];
    for (const peptideName of stack.peptides) {
      const slug = resolveSlug(peptideName, overrides, pkEntries);
      if (slug) {
        const route = pkEntries.get(slug) ?? "";
        if (route.toLowerCase() !== "subcutaneous") {
          nonSCCompounds.push({ peptideName, slug, route });
        }
      }
    }
    stackResults.push({ ...stack, nonSCCompounds });
    if (nonSCCompounds.length > 0) {
      nonSCStacks.push({ ...stack, nonSCCompounds });
    }
  }

  console.log("\n  Pre-built stacks non-SC compound check:");
  for (const s of stackResults) {
    if (s.nonSCCompounds.length > 0) {
      const detail = s.nonSCCompounds.map(c => `${c.peptideName} (${c.route})`).join(", ");
      console.log(`  ✓  ${s.id.padEnd(32)} → non-SC: ${detail}`);
    } else {
      console.log(`     ${s.id.padEnd(32)} → all SC (no key rendered for this stack — OK)`);
    }
  }

  if (nonSCStacks.length > 0) {
    console.log(`\n  ✓  ${nonSCStacks.length} pre-built stack(s) contain non-SC compounds — pk-line-style-key will render for those stacks.`);
  } else {
    console.error("\n  ✗  FAIL: No pre-built research stack contains a compound with a non-SC route.");
    console.error("     This means pk-line-style-key-{stackId} would not render for any pre-built stack card.");
    console.error("     Either a non-SC PK entry was deleted from pharmacokinetics.ts, or all pre-built");
    console.error("     stacks were changed to use only SC compounds.");
    console.error("     Affected stacks and their compounds:");
    for (const s of stackResults) {
      console.error(`       ${s.id}: ${s.peptides.join(", ")}`);
    }
    allPassed = false;
  }

  console.log("\n" + "=".repeat(70));

  if (allPassed) {
    console.log("  All PK chart key checks passed.\n");
    process.exit(0);
  } else {
    console.error("  One or more PK chart key checks FAILED. See above for details.\n");
    process.exit(1);
  }
}

run();
