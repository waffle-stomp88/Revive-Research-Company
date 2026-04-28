#!/usr/bin/env node
/**
 * scripts/verify-pk-citations.cjs
 *
 * Reads all citations from client/src/data/pharmacokinetics.ts, extracts
 * every PMID, and verifies via the PubMed eutils eSummary API that:
 *  1. The PMID exists (HTTP 200 and non-empty result)
 *  2. The record is not retracted
 *  3. The title is non-empty (catches deleted/merged records)
 *
 * Usage:
 *   node scripts/verify-pk-citations.cjs
 *   node scripts/verify-pk-citations.cjs --json              # emit JSON to stdout
 *   node scripts/verify-pk-citations.cjs --json --output report.json  # write JSON to file
 *
 * Exit code:
 *   0  — all PMIDs verified
 *   1  — one or more PMIDs failed
 */

"use strict";

const fs = require("fs");
const path = require("path");
const https = require("https");

const DATA_FILE = path.join(__dirname, "../client/src/data/pharmacokinetics.ts");
const EMIT_JSON = process.argv.includes("--json");
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

async function main() {
  const src = fs.readFileSync(DATA_FILE, "utf8");

  const pmidRegex = /pmid\(\s*"(\d+)"/g;
  const pmids = new Set();
  let m;
  while ((m = pmidRegex.exec(src)) !== null) {
    pmids.add(m[1]);
  }

  if (pmids.size === 0) {
    console.error("No PMIDs found in", DATA_FILE);
    process.exit(1);
  }

  const results = [];
  const list = [...pmids].sort();

  if (!EMIT_JSON) {
    console.log(`\nVerifying ${list.length} unique PMIDs from ${DATA_FILE}\n`);
  }

  for (const pmid of list) {
    const res = await verifyPmid(pmid);
    results.push(res);
    if (!EMIT_JSON) {
      if (res.ok) {
        console.log(`  ✓ ${pmid}  ${res.title}`);
      } else {
        console.error(`  ✗ ${pmid}  FAILED: ${res.reason}`);
      }
    }
    await sleep(RATE_LIMIT_MS);
  }

  const failed = results.filter((r) => !r.ok);
  const passed = results.filter((r) => r.ok);

  const report = {
    generatedAt: new Date().toISOString(),
    dataFile: DATA_FILE,
    checked: list.length,
    passed: passed.length,
    failed: failed.length,
    results,
  };
  const reportJson = JSON.stringify(report, null, 2);

  if (OUTPUT_FILE) {
    fs.writeFileSync(OUTPUT_FILE, reportJson, "utf8");
    console.log(`Report written to ${OUTPUT_FILE}`);
  }

  if (EMIT_JSON && !OUTPUT_FILE) {
    console.log(reportJson);
  } else if (!EMIT_JSON) {
    console.log(`\nResults: ${passed.length} passed, ${failed.length} failed`);
    if (failed.length > 0) {
      console.error("\nFailed PMIDs:");
      for (const f of failed) {
        console.error(`  PMID ${f.pmid}: ${f.reason}`);
      }
    }
  }

  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
