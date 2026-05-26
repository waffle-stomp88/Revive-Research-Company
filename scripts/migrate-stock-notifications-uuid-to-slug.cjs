/**
 * Migration: stock_notifications.product_id — UUID → slug backfill
 *
 * Background
 * ----------
 * The stock_notifications table originally accepted any string for product_id.
 * Early OOS signups on product detail pages submitted product.id (a UUID).
 * Task #946 changed the frontend to submit product.slug instead, and added a
 * DB unique index on (email, product_id). Before enforcing that index in
 * production, any legacy UUID-valued rows must be updated to the corresponding
 * slug so existing subscribers are not orphaned and the constraint fires
 * correctly on future duplicate checks.
 *
 * As of the time this script was written, a live query confirmed that all
 * existing rows already carried slug values ("lipo-c-b12", "semax"), making
 * this a no-op in the current environment. The script is committed as an
 * auditable artifact so the backfill intent is reproducible and verifiable.
 *
 * Usage
 * -----
 *   node scripts/migrate-stock-notifications-uuid-to-slug.cjs
 *
 * The script is idempotent: rows whose product_id is already a slug are
 * left unchanged. Rows with a UUID product_id that has no matching product
 * are reported and skipped (not deleted).
 */

"use strict";

const { Pool } = require("@neondatabase/serverless");
const ws = require("ws");

const { neonConfig } = require("@neondatabase/serverless");
neonConfig.webSocketConstructor = ws;

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // 1. Find all distinct product_ids in stock_notifications that look like UUIDs
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    const { rows: allIds } = await pool.query(
      `SELECT DISTINCT product_id FROM stock_notifications`
    );

    const uuidIds = allIds
      .map((r) => r.product_id)
      .filter((id) => uuidPattern.test(id));

    if (uuidIds.length === 0) {
      console.log("✓ No UUID-style product_id values found — backfill not needed.");
      return;
    }

    console.log(`Found ${uuidIds.length} UUID product_id(s) to migrate: ${uuidIds.join(", ")}`);

    // 2. Look up the slug for each UUID
    const { rows: products } = await pool.query(
      `SELECT id, slug FROM products WHERE id = ANY($1::uuid[])`,
      [uuidIds]
    );

    const slugMap = new Map(products.map((p) => [p.id, p.slug]));

    let updated = 0;
    let skipped = 0;

    for (const uuid of uuidIds) {
      const slug = slugMap.get(uuid);
      if (!slug) {
        console.warn(`  SKIP: no product found for UUID ${uuid} — rows left as-is`);
        skipped++;
        continue;
      }

      // 3. Update rows for this UUID to use the slug, skipping any that would
      //    create a duplicate (email, slug) pair that already exists.
      const { rowCount } = await pool.query(
        `UPDATE stock_notifications
            SET product_id = $1
          WHERE product_id = $2
            AND NOT EXISTS (
              SELECT 1 FROM stock_notifications sn2
               WHERE sn2.email = stock_notifications.email
                 AND sn2.product_id = $1
            )`,
        [slug, uuid]
      );

      console.log(`  ${uuid} → ${slug}: ${rowCount} row(s) updated`);
      updated += rowCount;
    }

    console.log(`\nDone. ${updated} row(s) migrated, ${skipped} UUID(s) skipped (no product match).`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
