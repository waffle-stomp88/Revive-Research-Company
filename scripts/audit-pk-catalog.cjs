#!/usr/bin/env node
/**
 * PK Catalog Coverage Audit — scripts/audit-pk-catalog.cjs
 *
 * Verifies that every product in the live product catalog has a corresponding
 * entry in pharmacokinetics.ts (either via PEPTIDE_HALF_LIVES directly or via
 * NAME_SLUG_OVERRIDES). This guards against new products being silently added
 * to the catalog without a PK chart entry.
 *
 * Unlike audit-pk-coverage.cjs (which checks known-stacks.ts), this script
 * queries the running API so it always reflects the full, up-to-date catalog.
 *
 * Usage:
 *   node scripts/audit-pk-catalog.cjs
 *
 * Prerequisites:
 *   The application server must be running on localhost:5000.
 *
 * Exit codes:
 *   0 — all product slugs are covered (or intentionally skipped)
 *   1 — one or more product slugs have no PK entry
 *   2 — a setup error occurred (API unreachable, parser broken, etc.)
 */

const fs = require("fs");
const path = require("path");
const http = require("http");

const ROOT = path.resolve(__dirname, "..");

// ─── Allow-list ───────────────────────────────────────────────────────────────
// Slugs that intentionally have no PK chart entry.
// These are non-peptide products (solvents, vitamins, etc.) that have no
// meaningful plasma half-life profile to display on the PK chart.
const PK_SKIP_LIST = new Set([
  "bacteriostatic-water",   // Bacteriostatic water for injection — solvent, not a research compound
  "acetic-acid-water",      // Acetic acid solution — solvent used for peptide reconstitution
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readFile(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function fetchProducts() {
  return new Promise((resolve, reject) => {
    const req = http.get("http://localhost:5000/api/products", (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`API returned status ${res.statusCode}`));
        return;
      }
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse API response: ${e.message}`));
        }
      });
    });
    req.on("error", (e) => {
      reject(
        new Error(
          `Could not reach the API at http://localhost:5000/api/products. ` +
            `Is the application server running? (${e.message})`
        )
      );
    });
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error("API request timed out after 10 s"));
    });
  });
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

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  // Load pharmacokinetics data
  const pkSrc = readFile("client/src/data/pharmacokinetics.ts");

  const pkSlugs = extractPkSlugs(pkSrc);
  if (pkSlugs.size === 0) {
    console.error(
      "ERROR: No PK slugs extracted from pharmacokinetics.ts — regex parser may be broken " +
        "or the file format has changed. Audit cannot continue."
    );
    process.exit(2);
  }

  const overrides = extractOverrides(pkSrc);

  // Fetch the live product catalog
  let products;
  try {
    products = await fetchProducts();
  } catch (err) {
    console.error(`ERROR: ${err.message}`);
    process.exit(2);
  }

  if (!Array.isArray(products) || products.length === 0) {
    console.error(
      "ERROR: API returned no products — the response format may have changed."
    );
    process.exit(2);
  }

  // Evaluate each product slug
  const covered = [];
  const skipped = [];
  const missing = [];

  for (const product of [...products].sort((a, b) =>
    (a.slug || "").localeCompare(b.slug || "")
  )) {
    const slug = product.slug;
    if (!slug) continue;

    if (PK_SKIP_LIST.has(slug)) {
      skipped.push({ slug, name: product.name });
      continue;
    }

    const resolved = overrides.get(slug) ?? slug;
    const found = pkSlugs.has(resolved);

    if (found) {
      covered.push({ slug, name: product.name, resolved, viaOverride: overrides.has(slug) });
    } else {
      missing.push({ slug, name: product.name, resolved });
    }
  }

  // Print report
  console.log("PK Catalog Coverage Audit — live product API");
  console.log("=".repeat(70));

  covered.forEach(({ slug, name, resolved, viaOverride }) => {
    const via = viaOverride && resolved !== slug ? `(override → ${resolved})` : "(direct)";
    console.log(`  ✓  ${slug.padEnd(32)} "${name}" ${via}`);
  });

  if (skipped.length > 0) {
    console.log("\n  INTENTIONALLY SKIPPED (allow-list):");
    skipped.forEach(({ slug, name }) => {
      console.log(`  –  ${slug.padEnd(32)} "${name}"`);
    });
  }

  if (missing.length > 0) {
    console.log("\n  MISSING PK ENTRIES:");
    missing.forEach(({ slug, name, resolved }) => {
      const lookupNote = resolved !== slug ? ` (looked up as "${resolved}")` : "";
      console.log(`  ✗  ${slug.padEnd(32)} "${name}"${lookupNote} — not found`);
    });
    console.log(
      `\n  ${missing.length} product slug(s) have no PK entry.`
    );
    console.log(
      "  For each missing slug, either:"
    );
    console.log(
      "    1. Add a HalfLifeEntry to PEPTIDE_HALF_LIVES in pharmacokinetics.ts, OR"
    );
    console.log(
      '    2. Add a mapping to NAME_SLUG_OVERRIDES pointing to an existing entry, OR'
    );
    console.log(
      '    3. Add the slug to the PK_SKIP_LIST in this script with an explanatory comment.'
    );
    process.exit(1);
  } else {
    const total = covered.length + skipped.length;
    console.log(
      `\n  All ${covered.length} cataloged peptide/compound slugs are covered` +
        (skipped.length > 0
          ? ` (${skipped.length} non-peptide slug(s) intentionally skipped).`
          : ".")
    );
    console.log(`  Total products checked: ${total}`);
    process.exit(0);
  }
}

run().catch((err) => {
  console.error(`FATAL: ${err.message}`);
  process.exit(2);
});
