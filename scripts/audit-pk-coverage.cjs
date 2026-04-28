#!/usr/bin/env node
/**
 * DEPRECATED — scripts/audit-pk-coverage.cjs
 *
 * This script has been superseded by scripts/audit-pk-catalog.cjs, which
 * checks the full product catalog (a strict superset of what this script
 * checked). The `pk-coverage` validation workflow has been removed; use the
 * `pk-catalog-coverage` workflow instead.
 *
 * This shim exists only to avoid breaking any local aliases or CI scripts
 * that still invoke this file by name. It delegates to the catalog audit and
 * exits with the same code.
 *
 * Canonical check:
 *   node scripts/audit-pk-catalog.cjs
 */

const { spawnSync } = require("child_process");
const path = require("path");

console.warn(
  "[DEPRECATED] audit-pk-coverage.cjs is retired.\n" +
    "  The authoritative PK audit is now audit-pk-catalog.cjs (pk-catalog-coverage).\n" +
    "  Delegating to that script now…\n"
);

const catalogScript = path.join(__dirname, "audit-pk-catalog.cjs");
const result = spawnSync(process.execPath, [catalogScript], { stdio: "inherit" });
process.exit(result.status ?? 1);
