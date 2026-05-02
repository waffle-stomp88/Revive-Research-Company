CREATE TABLE IF NOT EXISTS "cycle_tags" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"compound_key" text NOT NULL,
	"cycle_start_timestamp" timestamp NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "uq_cycle_tags_user_compound_start" UNIQUE("user_id","compound_key","cycle_start_timestamp")
);
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "cycle_tags" ADD CONSTRAINT "cycle_tags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;
