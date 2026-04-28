#!/bin/sh
# Browser-level e2e check: verifies MiniPKChart SVGs and the SC/Other-route key
# actually render in a real Chromium browser on the /research-stacks page.
#
# Playwright will reuse an existing server on port 5000 if one is running,
# or start one automatically via `npm run dev` (see playwright.config.ts webServer).
# Chromium binary is discovered via `which chromium` at runtime.

exec npx playwright test tests/pk-chart-key.e2e.ts --reporter=line
