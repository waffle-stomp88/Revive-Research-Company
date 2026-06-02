-- Migration: Add items JSONB column to orders table
-- Stores the full cart line-item list at checkout time.
-- Idempotent: uses DO block to guard the ALTER TABLE.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'items'
  ) THEN
    ALTER TABLE orders ADD COLUMN items jsonb DEFAULT '[]'::jsonb;
  ELSE
    -- Column already exists: ensure the column-level default is set
    -- (idempotent; safe to run if default was already applied).
    ALTER TABLE orders ALTER COLUMN items SET DEFAULT '[]'::jsonb;
  END IF;
END
$$;

-- Backfill: synthesise a single-item array from productId/quantity/totalAmount
-- for every order that has no real line-item data yet.
-- Condition covers:
--   items IS NULL  — column existed before DEFAULT was added (dev path)
--   items = '[]'   — column added fresh with DEFAULT '[]' (prod path, where
--                    PostgreSQL back-fills existing rows with the default value)
-- Guard: only overwrites empty/null items; real populated arrays are skipped.
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
