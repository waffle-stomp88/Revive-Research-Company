---
name: ADD COLUMN idempotency on Neon
description: information_schema.columns inside a DO block silently misses columns on Neon under certain search_path configs; use native ADD COLUMN IF NOT EXISTS instead.
---

# ADD COLUMN idempotency — use native syntax, not information_schema

## The rule
Never use `DO $$ IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE ...) THEN ALTER TABLE ... ADD COLUMN` to guard idempotency. Use PostgreSQL's native syntax:

```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items jsonb DEFAULT '[]'::jsonb;
```

## Why
On Neon serverless, `information_schema.columns` inside a `DO $$` block can silently return no rows for a column that genuinely exists, if the connection's `search_path` doesn't surface `public` at the time the anonymous function runs. The result: the IF NOT EXISTS check evaluates to "column doesn't exist", the `ADD COLUMN` runs, PostgreSQL rejects it with error 42701 (duplicate_column), and the whole migration transaction rolls back. The server refuses to start.

`ALTER TABLE ... ADD COLUMN IF NOT EXISTS` is handled at the parser/executor level using `pg_catalog` directly — it cannot be fooled by search_path.

## How to apply
- All new `server/migrations/` files: use `ADD COLUMN IF NOT EXISTS` or `CREATE TABLE IF NOT EXISTS` or `DO $$ … IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE …)` (pg_constraint is schema-agnostic).
- Any existing `DO $$` migration that queries `information_schema`: replace with native syntax on the next touch.
- Drizzle-generated `migrations/*.sql` files: add `IF NOT EXISTS` manually when a column may already exist from a parallel migration path. The Drizzle journal tracks by tag/idx, not content hash, so editing the file is safe.
