CREATE TABLE "article_views" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"article_id" varchar NOT NULL,
	"viewed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_article_views_user_article" UNIQUE("user_id","article_id")
);
--> statement-breakpoint
CREATE TABLE "lab_notes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"content" text NOT NULL,
	"icon_name" text DEFAULT 'Beaker' NOT NULL,
	"accent_color" text DEFAULT '#21d8ff' NOT NULL,
	"published_at" timestamp DEFAULT now(),
	"sort_order" integer DEFAULT 0,
	"is_published" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "research_stacks" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"subtitle" text DEFAULT '',
	"description" text NOT NULL,
	"long_description" text DEFAULT '',
	"peptide_ids" text[] DEFAULT '{}' NOT NULL,
	"peptide_details" jsonb DEFAULT '[]'::jsonb,
	"key_benefits" text[] DEFAULT '{}',
	"research_applications" text[] DEFAULT '{}',
	"synergy_copy" jsonb DEFAULT '{}'::jsonb,
	"storage_guide" text DEFAULT '',
	"education_links" jsonb DEFAULT '[]'::jsonb,
	"icon_name" text DEFAULT 'FlaskConical',
	"color" text DEFAULT '#6366f1',
	"badge" text,
	"badge_color" text,
	"category" text DEFAULT 'Recovery',
	"synergy_bonus" integer DEFAULT 0,
	"detail_page_id" text,
	"show_on_page" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_carts" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "coas" ADD COLUMN "preview_image_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "ruo_attestation_at" timestamp;--> statement-breakpoint
ALTER TABLE "article_views" ADD CONSTRAINT "article_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_carts" ADD CONSTRAINT "user_carts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_article_views_user_viewedat" ON "article_views" USING btree ("user_id","viewed_at");--> statement-breakpoint
CREATE UNIQUE INDEX "stock_notifications_email_product_idx" ON "stock_notifications" USING btree ("email","product_id");