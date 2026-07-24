-- Migration: Add partial unique index on first_order_promos to prevent
-- concurrent first-order promo redemptions (race-condition backstop).
--
-- A user can only have one 'redeemed' row.  The second concurrent insert
-- will fail with a unique-constraint violation (PG code 23505), which the
-- route converts to a 409 so the user sees an error rather than silently
-- getting two free BAC water units.
--
-- 'declined' rows are excluded so a user may have multiple declined rows.
--
-- Fully idempotent: wrapped in a single DO block so the pg driver always
-- executes both steps atomically. The DELETE is a no-op when there are no
-- duplicates; the CREATE INDEX is skipped when the index already exists.

DO $$
BEGIN
  -- Step 1: Remove duplicate 'redeemed' rows, keeping the earliest one per
  -- user_id. Necessary when the index was absent and a race produced multiple
  -- redeemed rows for the same user.
  DELETE FROM first_order_promos
  WHERE id IN (
    SELECT id FROM (
      SELECT id,
             ROW_NUMBER() OVER (
               PARTITION BY user_id
               ORDER BY redeemed_at ASC NULLS LAST, id ASC
             ) AS rn
      FROM first_order_promos
      WHERE status = 'redeemed'
    ) ranked
    WHERE rn > 1
  );

  -- Step 2: Create the unique index only if it does not already exist.
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname  = 'idx_first_order_promos_unique_redeemed'
  ) THEN
    EXECUTE 'CREATE UNIQUE INDEX idx_first_order_promos_unique_redeemed
             ON first_order_promos (user_id)
             WHERE status = ''redeemed''';
  END IF;
END $$;
