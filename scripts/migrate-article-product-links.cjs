/**
 * One-time migration: Fix missing and incorrect relatedProductIds on education articles.
 *
 * Problems fixed:
 *   1. 8 dedicated "what-is-X" articles had no relatedProductIds set, so they only
 *      surfaced via keyword matching (which was itself broken by "peptide" noise).
 *   2. The HCG article had a stale product ID for a product that is not in the catalog.
 *
 * Safe to re-run: uses WHERE id = '...' so each UPDATE is idempotent.
 *
 * Run with:
 *   node scripts/migrate-article-product-links.cjs
 */

"use strict";

const { neon } = require("@neondatabase/serverless");

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is not set.");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function run() {
  console.log("Running article-product link migration…");

  await sql`BEGIN`;

  try {
    // 1. what-is-5-amino-1mq-peptide → 5-Amino-1MQ
    await sql`
      UPDATE education_articles
      SET related_product_ids = ARRAY['0f1e01df-fe6c-43ac-81ae-07c6922b4bcc']
      WHERE id = '573dce89-5fc4-44a8-9464-6e1faacdf6c2'
    `;

    // 2. what-is-glutathione → Glutathione
    await sql`
      UPDATE education_articles
      SET related_product_ids = ARRAY['286391da-45c5-4bb9-9122-1e877d869e1b']
      WHERE id = 'beb8603d-bb8b-4e11-9e0d-a35e8819d1d3'
    `;

    // 3. what-is-melanotan-peptide → Melanotan I + Melanotan II
    await sql`
      UPDATE education_articles
      SET related_product_ids = ARRAY['8049dab4-1d8d-466d-9723-66aec56e5104', '6b312ffe-b300-498e-976e-c573e34af357']
      WHERE id = '7bd61a96-59e8-4daf-a308-860c99827d73'
    `;

    // 4. what-is-rr-a1-peptide → RR-A1
    await sql`
      UPDATE education_articles
      SET related_product_ids = ARRAY['c38ba8f1-af62-472c-989c-27ba0b2cdbc4']
      WHERE id = '1944079e-8ed0-40e0-9f1f-37e1b54326f7'
    `;

    // 5. what-is-rr-a2-peptide → RR-A2
    await sql`
      UPDATE education_articles
      SET related_product_ids = ARRAY['f6dc2020-f88f-4a66-83e0-6ebb7b125399']
      WHERE id = 'a2f912e6-93ce-46b9-adbf-5c7838d84fa9'
    `;

    // 6. what-is-gonadorelin-peptide → Gonadorelin
    await sql`
      UPDATE education_articles
      SET related_product_ids = ARRAY['f1e72c1f-efa9-4a84-8f0a-f25b6e4666a1']
      WHERE id = 'cf495385-2d81-4823-ae61-d9b6702d61e4'
    `;

    // 7. what-is-oxytocin-peptide → Oxytocin
    await sql`
      UPDATE education_articles
      SET related_product_ids = ARRAY['af6f24d8-afaf-4ebb-9946-58d9141586a4']
      WHERE id = '684015e3-df3c-4505-8896-726600f06068'
    `;

    // 8. what-is-triptorelin-peptide → Triptorelin
    await sql`
      UPDATE education_articles
      SET related_product_ids = ARRAY['0f2b763b-c5df-428d-8dc5-c19ff514ff0c']
      WHERE id = '6f82f48d-e4c6-4d3d-b8d5-3254b94f2b1a'
    `;

    // 9. what-is-hcg-peptide → clear stale link (HCG is not in the product catalog)
    await sql`
      UPDATE education_articles
      SET related_product_ids = ARRAY[]::text[]
      WHERE id = 'bcae2a0f-b92f-402f-bb4a-70bbf68a4957'
    `;

    await sql`COMMIT`;
    console.log("Migration complete — 9 articles updated.");
  } catch (err) {
    await sql`ROLLBACK`;
    console.error("Migration failed, rolled back:", err);
    process.exit(1);
  }
}

run();
