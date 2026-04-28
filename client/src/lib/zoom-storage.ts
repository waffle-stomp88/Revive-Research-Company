/**
 * zoom-storage.ts
 *
 * Single source of truth for the per-stack zoom preference helpers.
 *
 * Used by the browser bundle (Vite/ESM) and — via `node --require tsx/cjs`
 * in the zoom-preference validation workflow — by the Node-based test script
 * (scripts/test-zoom-preference.cjs).  Both consumers share this exact file,
 * so any change here is immediately reflected in the tests.
 *
 * The optional `storage` parameter lets callers (e.g. unit tests) inject a
 * MockStorage instance.  In the browser it defaults to `localStorage`.
 */

export const PK_ZOOM_STORAGE_KEY_PREFIX = "pk-zoom-range-";

export function readStoredZoom(
  stackId: string,
  storage?: Pick<Storage, "getItem" | "setItem" | "removeItem">,
): number | null {
  const s = storage ?? (typeof localStorage !== "undefined" ? localStorage : null);
  if (!s) return null;
  try {
    const raw = s.getItem(PK_ZOOM_STORAGE_KEY_PREFIX + stackId);
    if (raw === null || raw === "auto") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function writeStoredZoom(
  stackId: string,
  value: number | null,
  storage?: Pick<Storage, "getItem" | "setItem" | "removeItem">,
): void {
  const s = storage ?? (typeof localStorage !== "undefined" ? localStorage : null);
  if (!s) return;
  try {
    if (value === null) {
      s.removeItem(PK_ZOOM_STORAGE_KEY_PREFIX + stackId);
    } else {
      s.setItem(PK_ZOOM_STORAGE_KEY_PREFIX + stackId, String(value));
    }
  } catch {
    // ignore quota / private-browsing errors
  }
}
