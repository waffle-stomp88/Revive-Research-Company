-- Migration: Add partial unique index on first_order_promos to prevent
-- concurrent first-order promo redemptions (race-condition backstop).
--
-- A user can only have one 'redeemed' row.  The second concurrent insert
-- will fail with a unique-constraint violation (PG code 23505), which the
-- route converts to a 409 so the user sees an error rather than silently
-- getting two free BAC water units.
--
-- 'declined' rows are excluded so a user may have multiple declined rows
-- (e.g. they passed through the promo gate several times without buying).
--
-- Idempotent: the DO block checks pg_indexes before creating, so re-running
-- this migration on a database where the index already exists is a no-op.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'idx_first_order_promos_unique_redeemed'
  ) THEN
    CREATE UNIQUE INDEX idx_first_order_promos_unique_redeemed
      ON first_order_promos (user_id)
      WHERE status = 'redeemed';
  END IF;
END $$;
