-- Migration: Rename created_at to redeemed_at in first_order_promos
-- Idempotent: skips the rename if created_at is already gone (table was
-- created directly with redeemed_at via a Drizzle push on production).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'first_order_promos'
      AND column_name = 'created_at'
  ) THEN
    ALTER TABLE first_order_promos RENAME COLUMN created_at TO redeemed_at;
  END IF;
END $$;
