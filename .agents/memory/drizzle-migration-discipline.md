---
name: Drizzle migration discipline
description: Two-system migration architecture, rules for schema changes, and the prod gap repair pattern
---

## CRITICAL: There are two completely separate migration systems

### System 1 — `server/migrations/` (the runtime system, the one that matters)
- Read by `runMigrations()` in `server/migrate.ts` at every server startup
- Tracked in the `schema_migrations` table (filename + applied_at)
- Applied in alphabetical sort order, one transaction per file
- **This is what runs on publish.** `await runMigrations()` is called before any route registers, so schema lands before the first request hits the new binary. Failure crashes the process intentionally — never serves traffic against a broken schema.
- Files at time of repair: `001_add_paypal_captured_amount.sql`, `002_add_first_order_promos.sql`, `003_rename_first_order_promos_redeemed_at.sql`, `004_add_is_founding_member.sql`, `005_create_article_views.sql`
- All new schema additions go here as numbered SQL files with IF NOT EXISTS guards

### System 2 — `migrations/` with `_journal.json` (drizzle-kit tooling only)
- Managed by `drizzle-kit generate` / `drizzle-kit migrate`
- **`runMigrations()` never reads this directory.** It is invisible to the runtime.
- Useful for: keeping drizzle-kit's snapshot in sync with `schema.ts` so `generate` produces clean diffs; not useful for actually getting DDL to prod
- Journal was repaired in June 2026 (0003 migration added, empty second-generate confirmed)

## The rule for new schema changes
**Add a new numbered SQL file to `server/migrations/` with IF NOT EXISTS guards.** That's the only path that reaches prod.

Optionally also run `drizzle-kit generate` to keep the snapshot current (prevents phantom diffs next time). But the `server/migrations/` file is what closes the gap.

## Idempotency guard patterns
- `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...`
- `CREATE TABLE IF NOT EXISTS ...`
- `CREATE INDEX IF NOT EXISTS ...`
- FK/rename — use a DO block: `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '...') THEN ... END IF; END $$;`
- Column rename: `DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='t' AND column_name='old') THEN ALTER TABLE t RENAME COLUMN old TO new; END IF; END $$;`

## Verification
After adding a `server/migrations/` file: restart the app, check logs for `[migrate] ✓ <filename> applied.`. A successful restart with no migration errors means the file is idempotent against dev. Prod gets the same treatment on publish.

## Production gap (June 2026 repair)
- Root cause: schema objects added to `schema.ts` and dev DB without corresponding files in `server/migrations/`
- `is_founding_member` (users table): added via `004_add_is_founding_member.sql`
- `article_views` table: added via `005_create_article_views.sql`
- Both applied cleanly to dev on restart; will apply to prod on next publish
- Safe window: published binary predated Phase 2, so prod INSERT didn't name the missing column. Risk gate: next publish must carry 004+005 (guaranteed by server/migrations/) before Phase 2 code serves traffic
