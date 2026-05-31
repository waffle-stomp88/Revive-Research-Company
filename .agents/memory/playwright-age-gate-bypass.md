---
name: Playwright age gate bypass
description: How to prevent the age verification modal from blocking e2e tests
---

## Rule
All Playwright e2e tests must pre-populate localStorage so the age gate is dismissed before any test runs.

## How
`tests/setup/storage-state.json` sets `revive-research-age-verified = 9999999999999` (far-future timestamp).
`playwright.config.ts` has `use: { storageState: "tests/setup/storage-state.json" }` which applies it globally to every test.

## Why
The age gate (`client/src/components/age-verification-modal.tsx`) reads `localStorage.getItem("revive-research-age-verified")` on every page load and checks `Date.now() - ts < AGE_GATE_TTL_MS` (7-day TTL). If the key is absent or expired, a full-screen overlay renders that covers all product page content, breaking any test that navigates to `/peptides/*` or any page gated by it.

Using `storageState` is preferable to per-test setup scripts because it applies to every new browser context automatically — no test file changes needed.

## How to apply
Any new Playwright test file automatically inherits this setup. If a specific test needs the age gate ACTIVE, override with `test.use({ storageState: undefined })` in that describe block.
