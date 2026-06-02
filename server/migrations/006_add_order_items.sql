-- Migration: Add items JSONB column to orders table
-- Stores the full cart line-item list at checkout time.
-- Idempotent: uses ADD COLUMN IF NOT EXISTS (PostgreSQL native, pg 9.6+).
-- Avoids information_schema lookups which can miss columns under certain
-- Neon connection / search_path configurations.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items jsonb DEFAULT '[]'::jsonb;

-- Ensure the column-level default is set regardless of how the column was
-- originally created (idempotent; harmless if default was already '[]').
ALTER TABLE orders ALTER COLUMN items SET DEFAULT '[]'::jsonb;

-- Backfill: synthesise a single-item array from productId/quantity/totalAmount
-- for every order that has no real line-item data yet.
-- Guard: only overwrites empty/null items; real populated arrays are untouched.
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
