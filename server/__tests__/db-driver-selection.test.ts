import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";

/**
 * server/db.ts picks its Postgres driver from the DATABASE_URL host: Neon's
 * WebSocket driver for *.neon.tech, plain node-postgres everywhere else. That
 * choice is what lets one build run against both the Replit-hosted Neon
 * database and Supabase, so a mis-detection means the app cannot connect at
 * all. These cases pin the detection down — including the URL shapes that
 * `new URL()` silently mis-parses.
 *
 * Constructing a pool does not open a connection (both drivers connect lazily),
 * so none of this touches the network.
 */

const ORIGINAL_URL = process.env.DATABASE_URL;

async function loadDb(url: string) {
  process.env.DATABASE_URL = url;
  vi.resetModules();
  const logs: string[] = [];
  const spy = vi.spyOn(console, "log").mockImplementation((m?: unknown) => {
    logs.push(String(m));
  });
  const mod = await import("../db");
  spy.mockRestore();
  const line = logs.find((l) => l.startsWith("[db]")) ?? "";
  return {
    driver: line.includes("neon-serverless") ? "neon-serverless" : "node-postgres",
    host: line.split(" to ").pop() ?? "",
    pool: mod.pool,
    db: mod.db,
  };
}

beforeEach(() => {
  vi.resetModules();
});

afterAll(() => {
  process.env.DATABASE_URL = ORIGINAL_URL;
});

describe("database driver selection", () => {
  it("uses neon-serverless for a Neon host", async () => {
    const r = await loadDb("postgresql://u:pw@ep-cool-1.us-east-2.aws.neon.tech/neondb");
    expect(r.driver).toBe("neon-serverless");
    expect(r.host).toBe("ep-cool-1.us-east-2.aws.neon.tech");
  });

  it("uses node-postgres for the Supabase pooler", async () => {
    const r = await loadDb(
      "postgresql://postgres.abc:pw@aws-1-us-east-2.pooler.supabase.com:5432/postgres",
    );
    expect(r.driver).toBe("node-postgres");
    expect(r.host).toBe("aws-1-us-east-2.pooler.supabase.com");
  });

  it("uses node-postgres for the Supabase direct endpoint", async () => {
    const r = await loadDb("postgresql://postgres:pw@db.abc.supabase.co:5432/postgres");
    expect(r.driver).toBe("node-postgres");
    expect(r.host).toBe("db.abc.supabase.co");
  });

  it("reads the host from the last '@' so an unencoded password can't hijack it", async () => {
    // new URL() parses this as hostname "ss" without throwing, which would send
    // a Neon URL down the node-postgres path (or vice versa).
    const r = await loadDb(
      "postgresql://u:p@ss/w:rd@aws-1-us-east-2.pooler.supabase.com:5432/postgres",
    );
    expect(r.host).toBe("aws-1-us-east-2.pooler.supabase.com");
    expect(r.driver).toBe("node-postgres");
  });

  it("ignores an '@' appearing in the query string", async () => {
    const r = await loadDb(
      "postgresql://u:pw@ep-x.us-east-2.aws.neon.tech/db?options=project%3D@x",
    );
    expect(r.driver).toBe("neon-serverless");
    expect(r.host).toBe("ep-x.us-east-2.aws.neon.tech");
  });

  it("handles a URL with no userinfo", async () => {
    const r = await loadDb("postgresql://aws-1-us-east-2.pooler.supabase.com:5432/postgres");
    expect(r.driver).toBe("node-postgres");
    expect(r.host).toBe("aws-1-us-east-2.pooler.supabase.com");
  });

  it("verifies TLS on remote hosts and skips it for localhost", async () => {
    const remote = await loadDb(
      "postgresql://postgres.abc:pw@aws-1-us-east-2.pooler.supabase.com:5432/postgres",
    );
    expect((remote.pool as any).options.ssl).toEqual({ rejectUnauthorized: true });

    const local = await loadDb("postgresql://postgres:pw@localhost:5432/postgres");
    expect((local.pool as any).options.ssl).toBe(false);
  });

  it("exposes a usable drizzle client either way", async () => {
    for (const url of [
      "postgresql://u:pw@ep-cool-1.us-east-2.aws.neon.tech/neondb",
      "postgresql://postgres.abc:pw@aws-1-us-east-2.pooler.supabase.com:5432/postgres",
    ]) {
      const r = await loadDb(url);
      expect(typeof r.db.select).toBe("function");
      expect(typeof (r.pool as any).connect).toBe("function");
    }
  });
});
