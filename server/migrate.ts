import fs from "fs";
import path from "path";
import { pool } from "./db";

const MIGRATIONS_DIR = path.resolve(process.cwd(), "server/migrations");

export async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    if (files.length === 0) {
      console.log("[migrate] No migration files found — nothing to do.");
      return;
    }

    const { rows } = await client.query<{ filename: string }>(
      "SELECT filename FROM schema_migrations"
    );
    const applied = new Set(rows.map((r) => r.filename));

    const pending = files.filter((f) => !applied.has(f));

    if (pending.length === 0) {
      console.log(`[migrate] All ${files.length} migration(s) already applied.`);
      return;
    }

    console.log(`[migrate] ${pending.length} pending migration(s) to apply...`);

    for (const filename of pending) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, filename), "utf-8").trim();
      console.log(`[migrate] Applying ${filename}...`);
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (filename) VALUES ($1)",
          [filename]
        );
        await client.query("COMMIT");
        console.log(`[migrate] ✓ ${filename} applied.`);
      } catch (err) {
        await client.query("ROLLBACK");
        throw new Error(
          `[migrate] FAILED on ${filename}: ${(err as Error).message}\nServer will not start with a broken schema.`
        );
      }
    }

    console.log(`[migrate] Done — ${pending.length} migration(s) applied.`);
  } finally {
    client.release();
  }
}
