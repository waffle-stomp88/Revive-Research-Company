import { defineConfig, devices } from "@playwright/test";
import { execSync } from "child_process";

function resolveChromiumPath(): string | undefined {
  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
    return process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  }
  try {
    return execSync("which chromium", { encoding: "utf8" }).trim() || undefined;
  } catch {
    return undefined;
  }
}

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.e2e.ts",
  timeout: 60000,
  retries: 0,
  workers: 1,
  webServer: {
    command: 'sh -c "nc -z 127.0.0.1 5000 2>/dev/null && sleep infinity || exec npm run dev"',
    port: 5000,
    timeout: 60000,
    reuseExistingServer: true,
  },
  use: {
    baseURL: "http://localhost:5000",
    headless: true,
    storageState: "tests/setup/storage-state.json",
    launchOptions: {
      executablePath: resolveChromiumPath(),
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
