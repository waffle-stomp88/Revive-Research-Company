import type { FullConfig } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";
import * as fs from "fs/promises";
import * as http from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_STATE_PATH = path.join(__dirname, "auth-storage-state.json");

function httpPost(url: string): Promise<{ status: number; body: string; setCookieHeaders: string[] }> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port ? parseInt(u.port, 10) : 80,
        path: u.pathname + u.search,
        method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": "0" },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk: Buffer) => (body += chunk));
        res.on("end", () => {
          const raw = res.headers["set-cookie"];
          const setCookieHeaders = Array.isArray(raw) ? raw : raw ? [raw] : [];
          resolve({ status: res.statusCode ?? 0, body, setCookieHeaders });
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

function parseSetCookie(cookieStr: string, hostname: string) {
  const parts = cookieStr.split(";").map((s) => s.trim());
  const eqIdx = parts[0].indexOf("=");
  const name = parts[0].slice(0, eqIdx).trim();
  const value = parts[0].slice(eqIdx + 1).trim();
  const attribs: Record<string, string> = {};
  for (const part of parts.slice(1)) {
    const [k, v = ""] = part.split("=");
    attribs[k.toLowerCase().trim()] = v.trim();
  }
  return {
    name,
    value,
    domain: hostname,
    path: attribs["path"] ?? "/",
    expires: attribs["expires"] ? new Date(attribs["expires"]).getTime() / 1000 : -1,
    httpOnly: "httponly" in attribs,
    secure: "secure" in attribs,
    sameSite: (attribs["samesite"] ?? "Lax") as "Lax" | "Strict" | "None",
  };
}

export default async function globalSetup(config: FullConfig) {
  const baseURL = (config.projects[0]?.use as { baseURL?: string })?.baseURL ?? "http://localhost:5000";
  const { hostname } = new URL(baseURL);

  const { status, body, setCookieHeaders } = await httpPost(`${baseURL}/api/test/login`);
  if (status !== 200) {
    throw new Error(`[global-setup] /api/test/login returned ${status}: ${body}`);
  }

  const cookies = setCookieHeaders.map((h) => parseSetCookie(h, hostname));

  const storageState = {
    cookies,
    origins: [
      {
        origin: baseURL,
        localStorage: [
          // Bypass the age verification modal (TTL check: Date.now() - ts < 7-day window;
          // a far-future ts makes the difference negative, which is always < the window)
          { name: "revive-research-age-verified", value: "9999999999999" },
        ],
      },
    ],
  };

  await fs.writeFile(AUTH_STATE_PATH, JSON.stringify(storageState, null, 2));
  console.log(`[global-setup] Auth state saved → ${AUTH_STATE_PATH}`);
}
