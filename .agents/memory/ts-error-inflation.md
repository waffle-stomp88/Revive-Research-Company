---
name: TS error count inflation
description: Raw tsc error count inflates relative to distinct undefined names; how to size repair work accurately
---

# TypeScript Error Count Inflation

## The rule
Raw `tsc --noEmit` error count ≠ number of distinct broken things. One undefined name referenced in N places produces N error lines. Always count unique undefined identifiers to accurately scope a repair task.

**Why:** A "123 errors" headline sounds alarming but 48 unique undefined names is the actual repair size — 48 things to restore or delete, not 123 independent problems.

**How to apply:**
- Before scoping a dashboard or large-file repair, run:
  ```
  npx tsc --noEmit 2>&1 | grep "file.tsx.*error TS" | grep -oP "Cannot find name '([^']+)'" | sort -u | wc -l
  ```
- The unique-name count is the real work estimate. The raw error count is just noise for sizing purposes.
- The list itself (without `wc -l`) reveals which names are dead (removed subcomponent state/imports that should be deleted) vs. live (names that need to be restored or re-imported).
