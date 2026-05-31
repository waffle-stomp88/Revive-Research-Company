import { defineConfig, devices } from "@playwright/test";
import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";

/**
 * Find the Playwright-managed bundled Chromium (Chrome 147+).
 * Returns the path to the chrome binary or undefined if not found.
 */
function findPlaywrightChrome(): string | undefined {
  const home = process.env.HOME ?? "/home/runner";
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH ?? join(home, ".cache/ms-playwright");
  try {
    // chromium-NNNN/chrome-linux64/chrome — ls glob, sort by revision descending
    const out = execSync(`ls ${base}/chromium-*/chrome-linux64/chrome 2>/dev/null`, {
      encoding: "utf8",
    }).trim();
    if (!out) return undefined;
    const lines = out.split("\n").filter(Boolean);
    // sort by the numeric revision in the path
    lines.sort((a, b) => {
      const revA = parseInt(a.match(/chromium-(\d+)/)?.[1] ?? "0");
      const revB = parseInt(b.match(/chromium-(\d+)/)?.[1] ?? "0");
      return revB - revA;
    });
    return lines[0];
  } catch {
    return undefined;
  }
}

/**
 * Read the NixOS system Chromium wrapper script and extract the path to
 * the unwrapped ELF binary that exec's at the end.
 */
function findNixOsChromiumUnwrapped(): string | undefined {
  try {
    const wrapper = execSync("which chromium 2>/dev/null", { encoding: "utf8" }).trim();
    if (!wrapper || !existsSync(wrapper)) return undefined;
    const src = readFileSync(wrapper, "utf8");
    // The wrapper ends with: exec "/nix/store/.../chromium" ...
    const m = src.match(/exec "([^"]+chromium[^"]*)" /);
    return m?.[1];
  } catch {
    return undefined;
  }
}

/**
 * Use patchelf to read the ELF interpreter of a binary.
 */
function getNixInterpreter(patchelf: string, binaryPath: string): string | undefined {
  try {
    return execSync(`${patchelf} --print-interpreter ${binaryPath} 2>/dev/null`, {
      encoding: "utf8",
    }).trim();
  } catch {
    return undefined;
  }
}

/**
 * Build a LD_LIBRARY_PATH string that contains every directory referenced by
 * ldd for the given binary.  This lets an external binary (e.g. Playwright's
 * bundled Chromium) find NixOS shared libraries at runtime.
 */
function buildNixLibraryPath(binaryPath: string): string {
  try {
    const lddOut = execSync(`ldd ${binaryPath} 2>/dev/null`, { encoding: "utf8" });
    const dirs = new Set<string>();
    for (const line of lddOut.split("\n")) {
      const m = line.match(/=> (\/nix\/store\/[^ ]+)/);
      if (m) dirs.add(dirname(m[1]));
    }
    return Array.from(dirs).join(":");
  } catch {
    return "";
  }
}

/**
 * Attempt to resolve Playwright's bundled Chromium (Chrome 147+) and make it
 * runnable on NixOS by:
 *   1. Patching the ELF interpreter to the NixOS glibc ld-linux.
 *   2. Building an LD_LIBRARY_PATH from the system Chromium's shared-library
 *      dependencies (so all .so files are resolvable at launch).
 *
 * Falls back to the NixOS system Chromium (≈ 125) when the bundled binary
 * cannot be found or made runnable.
 *
 * Returns { executablePath, env } suitable for playwright launchOptions.
 */
function resolveChromium(): {
  executablePath?: string;
  env?: Record<string, string>;
} {
  const pwChrome = findPlaywrightChrome();
  const nixUnwrapped = findNixOsChromiumUnwrapped();

  if (pwChrome && existsSync(pwChrome) && nixUnwrapped && existsSync(nixUnwrapped)) {
    try {
      const patchelf = execSync("which patchelf 2>/dev/null", { encoding: "utf8" }).trim();
      if (patchelf) {
        // Patch interpreter to use the NixOS glibc ld-linux — idempotent.
        const nixInterp = getNixInterpreter(patchelf, nixUnwrapped);
        if (nixInterp) {
          const currentInterp = getNixInterpreter(patchelf, pwChrome);
          if (currentInterp !== nixInterp) {
            execSync(`${patchelf} --set-interpreter ${nixInterp} ${pwChrome} 2>/dev/null`);
          }
        }
      }

      const nixLibPath = buildNixLibraryPath(nixUnwrapped);
      const chromeDir = dirname(pwChrome);
      const ldLibraryPath = nixLibPath ? `${chromeDir}:${nixLibPath}` : chromeDir;

      return {
        executablePath: pwChrome,
        env: { LD_LIBRARY_PATH: ldLibraryPath },
      };
    } catch {
      // fall through to system chromium
    }
  }

  // Fallback: system Chromium (may be < 136; polyfill shims required in tests)
  try {
    const systemChrome = execSync("which chromium 2>/dev/null", { encoding: "utf8" }).trim();
    if (systemChrome) return { executablePath: systemChrome };
  } catch {
    // ignore
  }
  return {};
}

const { executablePath, env: browserEnv } = resolveChromium();

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.e2e.ts",
  timeout: 60000,
  retries: 0,
  workers: 1,
  // Runs once before all test suites: logs in a test user and saves session +
  // age-gate localStorage to tests/setup/auth-storage-state.json
  globalSetup: "./tests/setup/global-setup.ts",
  webServer: {
    command: 'sh -c "nc -z 127.0.0.1 5000 2>/dev/null && sleep infinity || exec npm run dev"',
    port: 5000,
    timeout: 60000,
    reuseExistingServer: true,
  },
  use: {
    baseURL: "http://localhost:5000",
    headless: true,
    // auth-storage-state.json is generated by globalSetup and contains both
    // the Express session cookie (bypasses ProtectedRoute) and the age gate
    // localStorage value (bypasses the age verification modal).
    // For tests that need an unauthenticated context, use:
    //   test.use({ storageState: "tests/setup/storage-state.json" })
    storageState: "tests/setup/auth-storage-state.json",
    launchOptions: {
      executablePath,
      env: browserEnv,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
