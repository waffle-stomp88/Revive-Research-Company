-- Migration: Add first_order_promos table
-- Tracks redeemed and declined first-order BAC water promo events per user.

CREATE TABLE IF NOT EXISTS first_order_promos (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id VARCHAR,
  status TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_first_order_promos_user_id ON first_order_promos(user_id);
