-- Migration: Create article_views table
-- Tracks which education articles each user has viewed (one row per user+article).
-- Idempotent: CREATE TABLE IF NOT EXISTS and CREATE INDEX IF NOT EXISTS.
CREATE TABLE IF NOT EXISTS article_views (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  article_id VARCHAR NOT NULL,
  viewed_at TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT uq_article_views_user_article UNIQUE (user_id, article_id)
);

CREATE INDEX IF NOT EXISTS idx_article_views_user_viewedat ON article_views (user_id, viewed_at);
