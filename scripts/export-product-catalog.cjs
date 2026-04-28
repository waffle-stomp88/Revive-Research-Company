#!/usr/bin/env node
/**
 * Export Product Catalog — scripts/export-product-catalog.cjs
 *
 * Queries the live database for all products and writes their name/slug pairs
 * to scripts/product-catalog.json.  Run this script whenever you need to
 * regenerate the manifest from scratch (e.g. after a batch import or after
 * restoring a database backup).
 *
 * Normal admin-panel additions are handled automatically — the
 * POST /api/admin/products route updates the manifest on every save.  This
 * script is provided as a recovery / initialisation tool.
 *
 * Prerequisites:
 *   DATABASE_URL must be set in the environment (or a .env file at the project
 *   root must define it).
 *
 * Usage:
 *   node scripts/export-product-catalog.cjs
 *
 * Output:
 *   scripts/product-catalog.json  — sorted, pretty-printed JSON array of
 *                                   { name, slug } objects
 */

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "scripts", "product-catalog.json");

// Load .env so the script works outside of the running application server.
try {
  const dotenvPath = path.join(ROOT, ".env");
  if (fs.existsSync(dotenvPath)) {
    const envContent = fs.readFileSync(dotenvPath, "utf8");
    for (const line of envContent.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  }
} catch {
  // .env missing or unreadable — rely on environment variables being present.
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error(
    "ERROR: DATABASE_URL is not set.  Either export it in your shell or add it\n" +
    "       to a .env file in the project root before running this script."
  );
  process.exit(2);
}

async function main() {
  let client;
  try {
    const pg = require("pg");
    client = new pg.Client({ connectionString: DATABASE_URL });
    await client.connect();
  } catch (err) {
    console.error(`ERROR: Could not connect to the database — ${err.message}`);
    console.error("       Make sure the database is running and DATABASE_URL is correct.");
    process.exit(2);
  }

  let rows;
  try {
    const result = await client.query(
      "SELECT name, slug FROM products ORDER BY name ASC"
    );
    rows = result.rows;
  } catch (err) {
    console.error(`ERROR: Query failed — ${err.message}`);
    await client.end();
    process.exit(2);
  }

  await client.end();

  if (rows.length === 0) {
    console.warn("WARNING: No products found in the database.  The manifest will be empty.");
  }

  const entries = rows.map((r) => ({ name: r.name, slug: r.slug }));
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(entries, null, 2) + "\n", "utf8");

  console.log(`Wrote ${entries.length} product(s) to scripts/product-catalog.json`);
  entries.forEach((e) => console.log(`  ${e.slug.padEnd(32)} "${e.name}"`));
}

main().catch((err) => {
  console.error(`Unexpected error: ${err.message}`);
  process.exit(2);
});
