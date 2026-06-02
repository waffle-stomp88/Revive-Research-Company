-- Migration: Backfill order items for existing orders (dev catch-up)
-- On dev, migration 006 ran before the backfill condition was corrected.
-- At that time the column existed without a DEFAULT so the WHERE items IS NULL
-- clause worked correctly for truly-null rows, but did not cover rows that
-- PostgreSQL auto-filled with '[]' when the column was later given a DEFAULT.
-- This migration re-runs the same backfill with the corrected condition so
-- every order has at least a synthesised single-item array.
--
-- The UPDATE is idempotent: it only touches rows whose items column is still
-- null or is the empty-array default ('[]'). Orders already backfilled or
-- populated at checkout are unaffected.
UPDATE orders
SET items = jsonb_build_array(
  jsonb_build_object(
    'productId', product_id,
    'name',      product_id,
    'quantity',  quantity,
    'unitPrice', ROUND((total_amount / GREATEST(quantity, 1))::numeric, 2)
  )
)
WHERE items IS NULL OR items = '[]'::jsonb;
