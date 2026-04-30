#!/bin/sh
# Browser-level e2e tests for Research Stacks curation on /research-stacks.
#
# Verifies:
#   - Exactly 6 stack cards are rendered in the pre-built listing
#   - All 6 expected stack IDs are individually present
#   - Exactly 7 filter category tabs appear (All + 6 categories)
#   - The "Immune" category tab is absent
#   - Navigating to a removed stack URL redirects back to the listing
#
# Playwright will reuse an existing server on port 5000 if one is running,
# or start one automatically via `npm run dev` (see playwright.config.ts webServer).
# Chromium binary is discovered via `which chromium` at runtime.

exec npx playwright test tests/research-stacks-curation.e2e.ts --reporter=line
