#!/usr/bin/env node
/**
 * PK Catalog Coverage Audit — scripts/audit-pk-catalog.cjs
 *
 * Verifies that every product in the catalog has a corresponding entry in
 * pharmacokinetics.ts (either via PEPTIDE_HALF_LIVES directly or via
 * NAME_SLUG_OVERRIDES). This guards against new products being silently added
 * to the catalog without a PK chart entry.
 *
 * Product slugs are read directly from server/seed.ts using the same
 * name-to-slug logic that createProduct() applies in server/storage.ts,
 * so the check is server-independent and safe to run in CI without a
 * running application server.
 *
 * Usage:
 *   node scripts/audit-pk-catalog.cjs
 *
 * Exit codes:
 *   0 — all product slugs are covered (or intentionally skipped)
 *   1 — one or more product slugs have no PK entry
 *   2 — a setup error occurred (file unreadable, parser broken, etc.)
 */

const fs = require("fs");
const path = require("path");

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

/**
 * Derive a slug from a product name using the same logic as createProduct()
 * in server/storage.ts:
 *   .toLowerCase()
 *   .replace(/[^a-z0-9\s\-]/g, '')
 *   .replace(/\s+/g, '-')
 *   .replace(/-+/g, '-')
 */
function nameToSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Parse the sampleProducts array from server/seed.ts and return an array of
 * { name, slug } objects.  Products that define an explicit slug field use
 * that value directly; others have their slug derived from their name.
 */
function readProductsFromSeed(src) {
  // Isolate the sampleProducts literal (everything between `= [` and the
  // first `];` that closes it).
  const blockMatch = src.match(/const\s+sampleProducts\s*=\s*\[([\s\S]*?)\];/);
  if (!blockMatch) {
    throw new Error(
      "Could not locate the sampleProducts array in server/seed.ts. " +
        "Has the file format changed?"
    );
  }

  const block = blockMatch[1];
  const products = [];

  // Split on object boundaries — each product starts with `{` and contains
  // name/slug fields.  We scan for `name:` occurrences and for any sibling
  // `slug:` field within the same object block.
  //
  // Strategy: find all top-level `{...}` objects in the block, then extract
  // name and (optional) slug from each.
  const objectPattern = /\{([\s\S]*?)\}/g;
  let match;
  while ((match = objectPattern.exec(block)) !== null) {
    const obj = match[1];

    const nameMatch = obj.match(/\bname:\s*"([^"]+)"/);
    if (!nameMatch) continue; // Not a product object (e.g. nested benefit strings)

    const name = nameMatch[1];

    const slugMatch = obj.match(/\bslug:\s*"([^"]+)"/);
    const slug = slugMatch ? slugMatch[1] : nameToSlug(name);

    products.push({ name, slug });
  }

  return products;
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

function run() {
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

  // Read the product catalog directly from the seed file
  let seedSrc;
  try {
    seedSrc = readFile("server/seed.ts");
  } catch (err) {
    console.error(`ERROR: Could not read server/seed.ts — ${err.message}`);
    process.exit(2);
  }

  let catalogProducts;
  try {
    catalogProducts = readProductsFromSeed(seedSrc);
  } catch (err) {
    console.error(`ERROR: ${err.message}`);
    process.exit(2);
  }

  if (catalogProducts.length === 0) {
    console.error(
      "ERROR: No products extracted from server/seed.ts — the parser may be broken " +
        "or the sampleProducts array is empty."
    );
    process.exit(2);
  }

  // Evaluate each product slug
  const covered = [];
  const skipped = [];
  const missing = [];

  for (const product of [...catalogProducts].sort((a, b) =>
    a.slug.localeCompare(b.slug)
  )) {
    const { slug, name } = product;

    if (PK_SKIP_LIST.has(slug)) {
      skipped.push({ slug, name });
      continue;
    }

    const resolved = overrides.get(slug) ?? slug;
    const found = pkSlugs.has(resolved);

    if (found) {
      covered.push({ slug, name, resolved, viaOverride: overrides.has(slug) });
    } else {
      missing.push({ slug, name, resolved });
    }
  }

  // Print report
  console.log("PK Catalog Coverage Audit — seed catalog (server-independent)");
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
    console.log(
      `\n  All ${covered.length} cataloged peptide/compound slugs are covered` +
        (skipped.length > 0
          ? ` (${skipped.length} non-peptide slug(s) intentionally skipped).`
          : ".")
    );
    console.log(`  Total products checked: ${covered.length + skipped.length}`);
    process.exit(0);
  }
}

run();
