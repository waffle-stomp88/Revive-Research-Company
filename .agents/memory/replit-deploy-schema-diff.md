---
name: Replit deploy schema diff
description: How Replit's publish flow diffs schemas and what to do when a migration blocks a deploy due to conflicting production data.
---

# Replit Deploy Schema Diff Behavior

## The rule
Replit's publish flow **introspects both the dev and prod databases** (not the Drizzle schema file) to compute a SQL diff. It generates and runs that diff against production BEFORE the application server starts. This means any custom migration runner (e.g. `server/migrations/`) cannot clean up data conflicts before the auto-generated diff runs.

**Why:** The diff happens at the platform layer during the promote phase, not at app startup.

## The failure pattern
- Dev DB has schema object (e.g. a unique index) that prod DB does not.
- Prod DB has data that conflicts with the schema object (e.g. duplicate rows blocking a unique index).
- Publish generates the bare DDL (no data cleanup), applies it to prod → fails.
- App never starts; the migration runner never runs.

## The fix sequence
1. Drop the conflicting schema object from dev DB.
2. Keep the custom migration's record in dev `schema_migrations` so the runner skips it on restart (the object stays gone through all dev restarts).
3. Now dev and prod match (neither has the object) → publish generates no diff → deploy succeeds.
4. Production server starts → custom migration runner sees the migration as pending (not in prod `schema_migrations`) → runs cleanup + creates object → done.
5. After successful publish: delete the migration record from dev `schema_migrations`, restart dev server → migration re-runs in dev → both databases back in sync for all future publishes.

**How to apply:** Any time a publish fails at "Migrations failed validation" with a DDL conflict caused by production data, use this sequence instead of trying to push DDL fixes through the Drizzle schema.
