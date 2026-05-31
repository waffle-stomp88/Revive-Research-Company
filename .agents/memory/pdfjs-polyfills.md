---
name: pdfjs-dist polyfills
description: How pdfjs-dist ≥5 polyfills were handled and the current worker-serving approach (updated mid-2026 — production is now polyfill-free)
---

# pdfjs-dist ≥ 5 — Polyfill history and current approach

## Current approach (mid-2026): production is polyfill-free

pdfjs-dist 5.x uses five APIs (URL.parse, Promise.try, Promise.withResolvers,
Uint8Array.prototype.toHex, Map.prototype.getOrInsertComputed) that landed in
Chrome 126–136.  All supported real-user browsers now have these natively.

### Worker serving

Worker is served as a plain static file from `client/public/pdf.worker.min.mjs`
— a verbatim copy of `node_modules/pdfjs-dist/build/pdf.worker.min.mjs`.
The component sets:

```ts
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
```

Vite passes files in `client/public/` through as-is (no module transformation),
which keeps the Web Worker free of `/@vite/client` injections that would break
its global scope.

**Why not `?url` import?**  
`import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url"` fails at
runtime in this Vite setup — Vite loads the `.mjs` as a real ES module and the
`?url` qualifier is not applied, producing "does not provide an export named
'default'".  Copying to `client/public/` is the reliable alternative.

**Why not the old Express `/api/pdfjs-worker` route?**  
The route read the full ≈1 MB worker on first request and kept it in memory; it
also served polyfills that are no longer needed.  Both the route and the
polyfills have been removed.

**Keep `client/public/pdf.worker.min.mjs` in sync** with the installed
pdfjs-dist version.  When upgrading pdfjs-dist, copy the new worker file.

### Main-thread component (`client/src/components/coa-pdf-viewer.tsx`)

No polyfills.  Just:
```ts
const pdfjsLib = await import("pdfjs-dist");
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
```

---

## Test environment — NixOS system Chromium ≈ 125

The system Chromium used by Playwright is v125 (predates all five APIs).
Tests inject compatibility guards in **two places**:

1. **Main thread** — `page.addInitScript(COMPAT_POLYFILLS)` must be called
   **before** `page.goto()`.  pdfjs calls URL.parse etc. on the main thread.

2. **Worker** — `page.route("**/pdf.worker.min.mjs", ...)` intercepts the
   worker script request and prepends the same guards.  Workers have their own
   global scope and do not inherit `addInitScript` patches.

See `tests/coa-pdf-viewer.e2e.ts` for the shared `COMPAT_POLYFILLS` constant
and the `injectMainThreadPolyfills` / `fakePolyfillWorker` helpers.

**Critical `Promise.try` gotcha** (unchanged): pdfjs calls
`Promise.try(action, data.data)` and the args must be forwarded.  The polyfill
must use `fn(...args)`, not `fn()`:
```js
Promise.try = function(f, ...args) {
  return new Promise((res, rej) => { try { res(f(...args)); } catch(e) { rej(e); } });
};
```

---

## Key files

- `client/src/components/coa-pdf-viewer.tsx` — component (polyfill-free)
- `client/public/pdf.worker.min.mjs` — static worker copy (keep in sync with pdfjs-dist)
- `tests/coa-pdf-viewer.e2e.ts` — injects polyfills via addInitScript + route interception
