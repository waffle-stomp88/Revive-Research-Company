---
name: runTest tool cannot drive Supabase/Google OAuth login
description: The ad-hoc `runTest` testing tool's `testReplitAuth`/OIDC bypass only works for Replit Auth; apps using Supabase auth with Google OAuth get stuck on the real Google sign-in page.
---

This project's `useAuth` hook (`client/src/hooks/useAuth.ts`) uses Supabase
Auth with Google OAuth, syncing the Supabase access token to an Express
session via `/api/auth/sync`. The `runTest` skill's `testReplitAuth: true` +
`[OIDC] Configure the next login...` mechanism only intercepts Replit's own
OIDC provider screen — it does nothing for a Google OAuth popup/redirect, so
the test subagent gets stuck on Google's real sign-in page and reports
`status: "unable"`.

**Why:** `runTest`'s auth bypass is hardcoded to Replit's OIDC flow (see
`.local/skills/testing/replit-auth.md`); there is no equivalent bypass wired
up for Supabase/Google OAuth in that tool.

**How to apply:** When a feature to verify lives behind a page gated by
`ProtectedRoute` in this app (e.g. `/cart`), don't attempt `runTest` with
`testReplitAuth` — it will fail on the Google OAuth screen. Instead:
1. Check whether the target logic is exposed through an unauthenticated API
   route (many validation/lookup routes are public) and test via direct
   `curl`/`executeSql` calls plus careful code review of the auth-gated
   parts.
2. If a true authenticated browser flow is required, the repo's own
   Playwright suites (e.g. `pk-chart-key-e2e`, `stacks-curation-e2e`,
   `product-visual-style` workflows) already have a working
   `globalSetup`-based storageState auth bypass (see
   `playwright-age-gate-bypass.md`) — prefer extending one of those existing
   Playwright specs over trying to force `runTest` through Google OAuth.
3. If you must simulate a session directly (e.g. to hit a `sessionUserId`
   gated POST route), a session can be forged by inserting a row into the
   `sessions` table (connect-pg-simple: `sid`, `sess` JSON with `userId` +
   `cookie`, `expire`) and signing the cookie with `SESSION_SECRET` using the
   `cookie-signature` `sign()` algorithm (`sid + '.' + hmac-sha256(sid,
   secret).digest('base64')` with trailing `=` stripped, prefixed `s:`). This
   works but is heavyweight — always delete the forged session/user rows
   afterward, and don't print the secret.
