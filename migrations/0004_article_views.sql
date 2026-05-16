CREATE TABLE IF NOT EXISTS "article_views" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" varchar NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "article_id" varchar NOT NULL,
  "viewed_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "uq_article_views_user_article" UNIQUE ("user_id", "article_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_article_views_user_viewedat" ON "article_views" ("user_id", "viewed_at");
