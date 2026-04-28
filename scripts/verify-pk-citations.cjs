#!/usr/bin/env node
/**
 * scripts/verify-pk-citations.cjs
 *
 * Reads all citations from one or more TypeScript source files, extracts
 * every PMID, and verifies via the PubMed eutils eSummary API that:
 *  1. The PMID exists (HTTP 200 and non-empty result)
 *  2. The record is not retracted
 *  3. The title is non-empty (catches deleted/merged records)
 *
 * By default the script recursively walks client/src/ and automatically
 * includes every *.ts file that contains at least one pmid("…") call.
 * Pass explicit paths as positional arguments to override:
 *
 * Usage:
 *   node scripts/verify-pk-citations.cjs                          # scan all client/src/**\/*.ts with PMIDs
 *   node scripts/verify-pk-citations.cjs path/to/file.ts          # scan specific file(s) only
 *   node scripts/verify-pk-citations.cjs --json
 *   node scripts/verify-pk-citations.cjs --json --output report.json
 *   node scripts/verify-pk-citations.cjs --discover               # list files with PMIDs, then exit (no API calls)
 *
 * Exit code:
 *   0  — all PMIDs verified (or --discover completed successfully)
 *   1  — one or more PMIDs failed
 */

"use strict";

const fs = require("fs");
const path = require("path");
const https = require("https");

const REPO_ROOT = path.join(__dirname, "..");
const DEFAULT_SCAN_ROOT = path.join(REPO_ROOT, "client/src");
const PMID_PATTERN = /pmid\(\s*"(\d+)"/;

const EMIT_JSON = process.argv.includes("--json");
const DISCOVER_ONLY = process.argv.includes("--discover");
const OUTPUT_INDEX = process.argv.indexOf("--output");
const OUTPUT_FILE = OUTPUT_INDEX !== -1 ? process.argv[OUTPUT_INDEX + 1] : null;
const RATE_LIMIT_MS = 350; // PubMed eutils: max 3 requests/second

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });
    req.on("error", reject);
    req.setTimeout(10000, () => {
      req.destroy(new Error("timeout"));
    });
  });
}

async function verifyPmid(pmid) {
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmid}&retmode=json`;
  let parsed;
  try {
    const { status, body } = await httpsGet(url);
    if (status !== 200) {
      return { pmid, ok: false, reason: `HTTP ${status}` };
    }
    parsed = JSON.parse(body);
  } catch (err) {
    return { pmid, ok: false, reason: `Network/parse error: ${err.message}` };
  }

  const result = parsed?.result;
  if (!result) {
    return { pmid, ok: false, reason: "Empty result object from eutils" };
  }

  const record = result[pmid];
  if (!record || record.error) {
    return { pmid, ok: false, reason: record?.error || "Record not found" };
  }

  const title = (record.title || "").trim();
  if (!title) {
    return { pmid, ok: false, reason: "Empty title (possible deleted/merged record)" };
  }

  const pubTypes = (record.pubtype || []).map((t) =>
    typeof t === "string" ? t.toLowerCase() : (t.value || "").toLowerCase()
  );
  const isRetracted = pubTypes.some(
    (t) => t.includes("retract") || t.includes("withdrawal")
  );
  if (isRetracted) {
    return { pmid, ok: false, reason: `Retracted article (pubtypes: ${pubTypes.join(", ")})`, title };
  }

  return {
    pmid,
    ok: true,
    title: title.slice(0, 100),
    authors: (record.authors || [])
      .slice(0, 2)
      .map((a) => a.name)
      .join(", "),
    pubdate: record.pubdate,
    source: record.source,
  };
}

/**
 * Recursively collect all *.ts files under a directory.
 */
function walkTs(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkTs(full, results);
    } else if (entry.isFile() && entry.name.endsWith(".ts")) {
      results.push(full);
    }
  }
  return results;
}

/**
 * Collect positional (non-flag) arguments as file paths to scan.
 * When none are provided, recursively walk client/src/ and return only
 * the files that actually contain at least one pmid("…") call.
 */
function resolveTargetFiles() {
  const positional = process.argv.slice(2).filter((arg, i, arr) => {
    if (arg.startsWith("--")) return false;
    // Skip the value that follows --output
    const prev = arr[i - 1];
    if (prev === "--output") return false;
    return true;
  });

  if (positional.length > 0) {
    return positional.map((p) => path.resolve(p));
  }

  // Default: every *.ts file under client/src/ that contains pmid("…")
  return walkTs(DEFAULT_SCAN_ROOT).filter((f) => {
    const src = fs.readFileSync(f, "utf8");
    return PMID_PATTERN.test(src);
  });
}

/**
 * Extract all unique PMIDs from a file's source text,
 * using the pmid("NNNNNN", ...) helper call pattern.
 */
function extractPmids(src) {
  const pmidRegex = /pmid\(\s*"(\d+)"/g;
  const pmids = new Set();
  let m;
  while ((m = pmidRegex.exec(src)) !== null) {
    pmids.add(m[1]);
  }
  return [...pmids].sort();
}

/**
 * Build a map of PMID -> array of compound names that reference it within
 * a single source file. Scans for `name: "..."` entries and associates each
 * with the pmid() calls that appear after it (up to the next name entry).
 */
function buildPmidCompoundMap(src) {
  const map = new Map(); // pmid -> Set<string>

  // Find all name entries with their positions
  const nameRegex = /\bname:\s*"([^"]+)"/g;
  const names = [];
  let nm;
  while ((nm = nameRegex.exec(src)) !== null) {
    names.push({ name: nm[1], index: nm.index });
  }

  // For each PMID occurrence, find the nearest preceding name entry
  const pmidRegex = /pmid\(\s*"(\d+)"/g;
  let m;
  while ((m = pmidRegex.exec(src)) !== null) {
    const pmid = m[1];
    const pos = m.index;
    let compound = "Unknown";
    for (let i = names.length - 1; i >= 0; i--) {
      if (names[i].index < pos) {
        compound = names[i].name;
        break;
      }
    }
    if (!map.has(pmid)) map.set(pmid, new Set());
    map.get(pmid).add(compound);
  }

  // Convert Sets to sorted arrays
  const result = {};
  for (const [pmid, compounds] of map.entries()) {
    result[pmid] = [...compounds].sort();
  }
  return result;
}

async function main() {
  const targetFiles = resolveTargetFiles();

  // --discover: print which files would be scanned and how many PMIDs each
  // contains, then exit without making any API calls.
  if (DISCOVER_ONLY) {
    if (targetFiles.length === 0) {
      console.log("No files with pmid(...) calls found under client/src/");
      process.exit(0);
    }
    let totalPmids = 0;
    console.log("\nFiles with embedded PMIDs:\n");
    for (const filePath of targetFiles) {
      const src = fs.readFileSync(filePath, "utf8");
      const pmids = extractPmids(src);
      totalPmids += pmids.length;
      console.log(
        `  ${path.relative(REPO_ROOT, filePath)}: ${pmids.length} PMID(s)`
      );
    }
    console.log(`\nTotal: ${targetFiles.length} file(s), ${totalPmids} unique-per-file PMID(s)`);
    process.exit(0);
  }

  // Build a map of { filePath -> pmid[] } and { filePath -> compoundMap }
  const fileMap = new Map();
  const fileCompoundMap = new Map(); // filePath -> { pmid: string[] }
  for (const filePath of targetFiles) {
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }
    const src = fs.readFileSync(filePath, "utf8");
    const pmids = extractPmids(src);
    if (pmids.length > 0) {
      fileMap.set(filePath, pmids);
      fileCompoundMap.set(filePath, buildPmidCompoundMap(src));
    }
  }

  // Collect all unique PMIDs across all files, remembering which files
  // each PMID appears in so the report can trace back by source.
  const pmidToFiles = new Map(); // pmid -> Set<filePath>
  for (const [filePath, pmids] of fileMap) {
    for (const pmid of pmids) {
      if (!pmidToFiles.has(pmid)) pmidToFiles.set(pmid, new Set());
      pmidToFiles.get(pmid).add(filePath);
    }
  }

  // Build merged compound map: pmid -> sorted unique compounds across all files
  const globalCompoundMap = {}; // pmid -> string[]
  for (const [filePath, compoundMap] of fileCompoundMap) {
    for (const [pmid, compounds] of Object.entries(compoundMap)) {
      if (!globalCompoundMap[pmid]) globalCompoundMap[pmid] = new Set();
      for (const c of compounds) globalCompoundMap[pmid].add(c);
    }
  }
  for (const pmid of Object.keys(globalCompoundMap)) {
    globalCompoundMap[pmid] = [...globalCompoundMap[pmid]].sort();
  }

  const totalFiles = fileMap.size;
  const allPmids = [...pmidToFiles.keys()].sort();
  const totalPmids = allPmids.length;

  if (totalFiles === 0 || totalPmids === 0) {
    console.error(
      `No PMIDs found in any of the scanned files:\n  ${targetFiles.join("\n  ")}`
    );
    process.exit(1);
  }

  if (!EMIT_JSON) {
    console.log(
      `\nVerifying ${totalPmids} unique PMIDs across ${totalFiles} file(s)\n`
    );
    for (const [fp, pmids] of fileMap) {
      console.log(`  ${path.relative(REPO_ROOT, fp)}: ${pmids.length} PMID(s)`);
    }
    console.log();
  }

  // Verify each unique PMID once
  const verifiedMap = new Map(); // pmid -> result
  for (const pmid of allPmids) {
    const res = await verifyPmid(pmid);
    res.compounds = globalCompoundMap[pmid] ?? [];
    verifiedMap.set(pmid, res);
    if (!EMIT_JSON) {
      if (res.ok) {
        console.log(`  ✓ ${pmid}  ${res.title}`);
      } else {
        console.error(`  ✗ ${pmid}  FAILED: ${res.reason}`);
      }
    }
    await sleep(RATE_LIMIT_MS);
  }

  // Build per-file result groups
  const byFile = [];
  for (const [filePath, pmids] of fileMap) {
    const relPath = path.relative(REPO_ROOT, filePath);
    const results = pmids.map((pmid) => ({
      ...verifiedMap.get(pmid),
      sourceFile: relPath,
    }));
    const fileFailed = results.filter((r) => !r.ok);
    byFile.push({
      file: relPath,
      checked: pmids.length,
      passed: results.filter((r) => r.ok).length,
      failed: fileFailed.length,
      results,
    });
  }

  const globalFailed = allPmids
    .map((pmid) => verifiedMap.get(pmid))
    .filter((r) => !r.ok);
  const globalPassed = allPmids
    .map((pmid) => verifiedMap.get(pmid))
    .filter((r) => r.ok);

  // Top-level results array for backwards-compat with single-file consumers
  // (e.g. the admin citation-report API that reads citation-report.json)
  const results = allPmids.map((pmid) => verifiedMap.get(pmid));

  const report = {
    generatedAt: new Date().toISOString(),
    scannedFiles: targetFiles.map((f) => path.relative(REPO_ROOT, f)),
    checked: totalPmids,
    passed: globalPassed.length,
    failed: globalFailed.length,
    results,
    byFile,
  };
  const reportJson = JSON.stringify(report, null, 2);

  if (OUTPUT_FILE) {
    fs.writeFileSync(OUTPUT_FILE, reportJson, "utf8");
    if (!EMIT_JSON) {
      console.log(`\nReport written to ${OUTPUT_FILE}`);
    }
  }

  if (EMIT_JSON && !OUTPUT_FILE) {
    console.log(reportJson);
  } else if (!EMIT_JSON) {
    console.log(
      `\nResults: ${globalPassed.length} passed, ${globalFailed.length} failed`
    );

    if (globalFailed.length > 0) {
      console.error("\nFailed PMIDs:");
      for (const f of globalFailed) {
        const sources = [...pmidToFiles.get(f.pmid)]
          .map((fp) => path.relative(REPO_ROOT, fp))
          .join(", ");
        console.error(`  PMID ${f.pmid} (${sources}): ${f.reason}`);
      }
    }

    if (byFile.length > 1) {
      console.log("\nPer-file summary:");
      for (const entry of byFile) {
        const status = entry.failed > 0 ? "FAIL" : "OK";
        console.log(
          `  [${status}] ${entry.file}: ${entry.passed} passed, ${entry.failed} failed`
        );
      }
    }
  }

  process.exit(globalFailed.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
