import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Without this handler, any idle-connection error emitted by the pg Pool
// (e.g. Neon terminating the connection for maintenance) becomes an unhandled
// Node.js 'error' event, which crashes the process.  Logging and continuing
// is safe — Neon re-establishes connections automatically on the next query.
pool.on("error", (err) => {
  console.error("[db] Pool error (non-fatal — Neon will reconnect):", err.message);
});

export const db = drizzle({ client: pool, schema });
