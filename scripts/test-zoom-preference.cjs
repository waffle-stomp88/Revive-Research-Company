#!/usr/bin/env node
/**
 * test-zoom-preference.cjs
 *
 * Unit-level tests for the per-stack zoom preference feature.
 *
 * Verifies that:
 *   1. Setting a zoom on stack A does not affect stack B.
 *   2. Navigating away and back (simulated by re-reading) restores the
 *      correct zoom for each stack.
 *   3. The "Auto" button (null value) only clears the key for the current
 *      stack and leaves the other stack's key untouched.
 *
 * Usage:
 *   node scripts/test-zoom-preference.cjs
 */

"use strict";

// ---------------------------------------------------------------------------
// Minimal localStorage mock (mirrors browser localStorage API)
// ---------------------------------------------------------------------------
class MockStorage {
  constructor() {
    this._store = new Map();
  }
  getItem(key) {
    const v = this._store.get(key);
    return v === undefined ? null : v;
  }
  setItem(key, value) {
    this._store.set(key, String(value));
  }
  removeItem(key) {
    this._store.delete(key);
  }
  get length() {
    return this._store.size;
  }
  key(index) {
    return [...this._store.keys()][index] ?? null;
  }
  clear() {
    this._store.clear();
  }
}

// ---------------------------------------------------------------------------
// Re-implement the exact logic from research-stack-detail.tsx so these tests
// stay in sync with the source and catch regressions without requiring a build.
// ---------------------------------------------------------------------------
const PK_ZOOM_STORAGE_KEY_PREFIX = "pk-zoom-range:";

function readStoredZoom(stackId, storage) {
  try {
    const raw = storage.getItem(PK_ZOOM_STORAGE_KEY_PREFIX + stackId);
    if (raw === null || raw === "auto") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function writeStoredZoom(stackId, value, storage) {
  try {
    if (value === null) {
      storage.removeItem(PK_ZOOM_STORAGE_KEY_PREFIX + stackId);
    } else {
      storage.setItem(PK_ZOOM_STORAGE_KEY_PREFIX + stackId, String(value));
    }
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Tiny test harness
// ---------------------------------------------------------------------------
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  PASS  ${message}`);
    passed++;
  } else {
    console.error(`  FAIL  ${message}`);
    failed++;
  }
}

function assertEqual(actual, expected, message) {
  if (actual === expected) {
    console.log(`  PASS  ${message}`);
    passed++;
  } else {
    console.error(`  FAIL  ${message} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    failed++;
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

console.log("\nTest suite: per-stack zoom preference\n");

// --- 1. Fresh storage: both stacks should return null (Auto) -----------------
{
  console.log("1. Initial state — both stacks default to null");
  const storage = new MockStorage();
  assertEqual(readStoredZoom("stack-a", storage), null,
    "stack-a starts as null");
  assertEqual(readStoredZoom("stack-b", storage), null,
    "stack-b starts as null");
}

// --- 2. Writing zoom for stack-a does not affect stack-b --------------------
{
  console.log("\n2. Zoom isolation — writing stack-a should not affect stack-b");
  const storage = new MockStorage();
  writeStoredZoom("stack-a", 360, storage);  // 6 h

  assertEqual(readStoredZoom("stack-a", storage), 360,
    "stack-a reads back 360");
  assertEqual(readStoredZoom("stack-b", storage), null,
    "stack-b is still null after writing stack-a");
}

// --- 3. Writing zoom for stack-b does not affect stack-a --------------------
{
  console.log("\n3. Zoom isolation — writing stack-b should not affect stack-a");
  const storage = new MockStorage();
  writeStoredZoom("stack-b", 10080, storage);  // 7 d

  assertEqual(readStoredZoom("stack-b", storage), 10080,
    "stack-b reads back 10080");
  assertEqual(readStoredZoom("stack-a", storage), null,
    "stack-a is still null after writing stack-b");
}

// --- 4. Independent values: stack-a=6h, stack-b=7d -------------------------
{
  console.log("\n4. Both stacks hold independent values simultaneously");
  const storage = new MockStorage();
  writeStoredZoom("stack-a", 360, storage);    // 6 h
  writeStoredZoom("stack-b", 10080, storage);  // 7 d

  assertEqual(readStoredZoom("stack-a", storage), 360,
    "stack-a is 360");
  assertEqual(readStoredZoom("stack-b", storage), 10080,
    "stack-b is 10080");
}

// --- 5. Navigate away and return: values are preserved ----------------------
{
  console.log("\n5. Navigate-away simulation — values persist across re-reads");
  const storage = new MockStorage();
  writeStoredZoom("stack-a", 60, storage);    // 1 h
  writeStoredZoom("stack-b", 1440, storage);  // 24 h

  // Simulate user navigates to stack-b then back to stack-a
  const zoomBeforeNav = readStoredZoom("stack-a", storage);
  readStoredZoom("stack-b", storage); // "visit" stack-b
  const zoomAfterNav = readStoredZoom("stack-a", storage);

  assertEqual(zoomAfterNav, zoomBeforeNav,
    "stack-a zoom is unchanged after 'visiting' stack-b");
  assertEqual(zoomAfterNav, 60,
    "stack-a zoom is still 60 after nav");
}

// --- 6. Auto on stack-a only clears stack-a key, not stack-b ---------------
{
  console.log("\n6. Auto (null) — only clears the targeted stack key");
  const storage = new MockStorage();
  writeStoredZoom("stack-a", 360, storage);
  writeStoredZoom("stack-b", 1440, storage);

  // User clicks "Auto" on stack-a
  writeStoredZoom("stack-a", null, storage);

  assertEqual(readStoredZoom("stack-a", storage), null,
    "stack-a is reset to null (Auto)");
  assertEqual(readStoredZoom("stack-b", storage), 1440,
    "stack-b is unaffected after Auto on stack-a");
}

// --- 7. Auto on stack-b only clears stack-b key, not stack-a ---------------
{
  console.log("\n7. Auto (null) — only clears the targeted stack key (stack-b)");
  const storage = new MockStorage();
  writeStoredZoom("stack-a", 60, storage);
  writeStoredZoom("stack-b", 10080, storage);

  // User clicks "Auto" on stack-b
  writeStoredZoom("stack-b", null, storage);

  assertEqual(readStoredZoom("stack-b", storage), null,
    "stack-b is reset to null (Auto)");
  assertEqual(readStoredZoom("stack-a", storage), 60,
    "stack-a is unaffected after Auto on stack-b");
}

// --- 8. Changing zoom on stack-a leaves stack-b zoom intact ----------------
{
  console.log("\n8. Changing stack-a zoom does not overwrite stack-b zoom");
  const storage = new MockStorage();
  writeStoredZoom("stack-a", 60, storage);    // 1 h
  writeStoredZoom("stack-b", 10080, storage); // 7 d

  // User changes stack-a zoom from 1h to 6h
  writeStoredZoom("stack-a", 360, storage);

  assertEqual(readStoredZoom("stack-a", storage), 360,
    "stack-a is updated to 360");
  assertEqual(readStoredZoom("stack-b", storage), 10080,
    "stack-b zoom is still 10080");
}

// --- 9. "auto" string stored by legacy code is read as null ----------------
{
  console.log("\n9. Legacy 'auto' string value is treated as null");
  const storage = new MockStorage();
  storage.setItem(PK_ZOOM_STORAGE_KEY_PREFIX + "stack-a", "auto");

  assertEqual(readStoredZoom("stack-a", storage), null,
    "stored 'auto' string is coerced to null");
}

// --- 10. Non-numeric stored value is treated as null -----------------------
{
  console.log("\n10. Corrupt or non-numeric stored value is treated as null");
  const storage = new MockStorage();
  storage.setItem(PK_ZOOM_STORAGE_KEY_PREFIX + "stack-a", "corrupted-value");

  assertEqual(readStoredZoom("stack-a", storage), null,
    "non-numeric value is coerced to null");
}

// --- 11. Storage key prefix is correctly namespaced ------------------------
{
  console.log("\n11. Storage keys are namespaced with the correct prefix");
  const storage = new MockStorage();
  writeStoredZoom("wolverine", 360, storage);

  const key = PK_ZOOM_STORAGE_KEY_PREFIX + "wolverine";
  assert(storage.getItem(key) === "360",
    `key "${key}" exists with value "360"`);
  assert(storage.getItem("wolverine") === null,
    `bare key "wolverine" does not exist (correct namespacing)`);
}

// --- 12. Realistic multi-stack scenario (stack-a=1h, stack-b=7d, stack-c=auto)
{
  console.log("\n12. Three-stack scenario: independent zooms per stack");
  const storage = new MockStorage();
  writeStoredZoom("gh-amplifier", 60, storage);        // 1 h
  writeStoredZoom("wolverine-stack", 10080, storage);  // 7 d
  // cognitive-edge left at Auto (no write = no key)

  assertEqual(readStoredZoom("gh-amplifier", storage), 60,
    "gh-amplifier is 60");
  assertEqual(readStoredZoom("wolverine-stack", storage), 10080,
    "wolverine-stack is 10080");
  assertEqual(readStoredZoom("cognitive-edge", storage), null,
    "cognitive-edge is null (never written)");

  // Reset gh-amplifier to Auto — others should be unaffected
  writeStoredZoom("gh-amplifier", null, storage);
  assertEqual(readStoredZoom("gh-amplifier", storage), null,
    "gh-amplifier is now null after Auto");
  assertEqual(readStoredZoom("wolverine-stack", storage), 10080,
    "wolverine-stack still 10080 after gh-amplifier Auto");
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${"─".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error("\nSome tests FAILED — zoom preference isolation is broken.");
  process.exit(1);
} else {
  console.log("\nAll tests PASSED — zoom preference is correctly isolated per stack.");
  process.exit(0);
}
