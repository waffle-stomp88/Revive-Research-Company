-- Migration 008: Fix UUID-as-name entries in the orders.items JSONB array.
--
-- Context: Migrations 006 and 007 back-filled historical orders by synthesising
-- a single-item array from productId/quantity/totalAmount. They used product_id
-- (a UUID) as the item name, producing rows like:
--   items = [{"productId":"<uuid>","name":"<same uuid>","quantity":1,"unitPrice":...}]
--
-- This migration corrects those entries by resolving each UUID name to the real
-- product name via the products table, with "Unavailable product" as a fallback
-- where the product no longer exists.
--
-- Idempotency: only rows where at least one item's "name" matches the strict
-- UUID format are touched. Real product names never match that pattern, so
-- re-running this migration on already-corrected rows is a safe no-op.
--
-- UUID pattern used (strict v4-compatible format):
--   ^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$
-- This is tighter than the loose [0-9a-f-]{36} pattern and avoids false-positives
-- on legitimately-named products that happen to be 36 characters long.

UPDATE orders
SET items = (
  SELECT jsonb_agg(
    CASE
      -- Only correct entries whose "name" is a bare UUID
      WHEN (elem->>'name') ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      THEN elem || jsonb_build_object(
        'name',
        COALESCE(
          (SELECT p.name FROM products p WHERE p.id = (elem->>'productId') LIMIT 1),
          'Unavailable product'
        )
      )
      -- Leave entries with real names untouched
      ELSE elem
    END
    ORDER BY ordinality
  )
  FROM jsonb_array_elements(orders.items) WITH ORDINALITY AS t(elem, ordinality)
)
WHERE
  -- Only process rows that have at least one UUID-named entry (idempotency guard)
  items IS NOT NULL
  AND jsonb_array_length(items) > 0
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements(items) AS elem
    WHERE (elem->>'name') ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  );
