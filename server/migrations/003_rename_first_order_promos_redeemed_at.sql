-- Migration: Rename created_at to redeemed_at in first_order_promos
ALTER TABLE first_order_promos RENAME COLUMN created_at TO redeemed_at;
