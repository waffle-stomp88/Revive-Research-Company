import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleNodePg, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const connectionString = process.env.DATABASE_URL;

function hostOf(url: string): string {
  // Split the authority on the *last* '@' rather than handing the string to
  // new URL().  A password containing an unencoded '@' or '/' makes URL()
  // silently mis-parse — it reports the password fragment as the hostname
  // instead of throwing — and the host is what decides which driver we load.
  const noQuery = url.split("?")[0];
  const at = noQuery.lastIndexOf("@");
  if (at >= 0) return noQuery.slice(at + 1).split(/[:/]/)[0] ?? "";
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

const host = hostOf(connectionString);

// Replit provisions a Neon database, which is reached over a WebSocket protocol
// that only @neondatabase/serverless speaks.  Supabase — and every other managed
// Postgres — uses the standard wire protocol.  Detecting which one we were handed
// lets a single build run against either, so the Replit → Supabase cutover is a
// DATABASE_URL change with an instant rollback rather than a redeploy.
const useNeon = host.endsWith(".neon.tech") || host.endsWith(".neon.build");

function ssl() {
  if (host === "localhost" || host === "127.0.0.1" || host === "") return false;
  // Supabase's pooler presents a publicly-trusted certificate, so verify it.
  // Set DATABASE_SSL_NO_VERIFY=1 only for hosts fronted by a private CA
  // (Supabase's direct db.<ref>.supabase.co endpoint is one of them).
  return { rejectUnauthorized: process.env.DATABASE_SSL_NO_VERIFY !== "1" };
}

if (useNeon) {
  neonConfig.webSocketConstructor = ws;
}

// Both drivers expose the pg-compatible surface this app uses (`connect`,
// `query`, `on`), so the call sites in routes.ts and migrate.ts are unaffected.
export const pool = (
  useNeon
    ? new NeonPool({ connectionString })
    : new pg.Pool({ connectionString, ssl: ssl(), max: 10 })
) as unknown as pg.Pool;

// Without this handler, any idle-connection error emitted by the pool
// (e.g. the provider terminating a connection for maintenance) becomes an
// unhandled Node.js 'error' event, which crashes the process.  Logging and
// continuing is safe — the pool re-establishes connections on the next query.
pool.on("error", (err: Error) => {
  console.error("[db] Pool error (non-fatal — pool will reconnect):", err.message);
});

export const db = (
  useNeon
    ? drizzleNeon({ client: pool as unknown as NeonPool, schema })
    : drizzleNodePg({ client: pool, schema })
) as NodePgDatabase<typeof schema>;

console.log(
  `[db] connected via ${useNeon ? "neon-serverless" : "node-postgres"} to ${host || "(unknown host)"}`,
);
