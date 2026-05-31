---
name: pdfjs worker blob URL
description: Why CoaPdfViewer uses ?url import + Blob + createObjectURL instead of a direct path for the pdfjs worker
---

## Rule
Always load the pdfjs worker via Vite's `?url` import + a module-level cached blob URL. Never point `GlobalWorkerOptions.workerSrc` directly at a path string.

**Why:** Two separate Vite dev-server traps:
1. `new Worker("/api/pdfjs-worker")` or `import("/api/pdfjs-worker")` — Vite appends `?import` to the URL inside pdfjs's dynamic import(), turning it into a module request that fails.
2. `fetch("/api/pdfjs-worker")` — Vite's catch-all `app.use("*", ...)` handler in `server/vite.ts` can race with the Express route and return `index.html` instead of JS, causing "Unexpected token '<'".

Neither issue affects production builds (no Vite dev server). That's why the prod app works but dev is intermittent.

**How to apply:**
```ts
// Top of file — Vite resolves this at build time, no routing race
import pdfjsWorkerAssetUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// Module-level cache — fetched once per page load
let _workerBlobUrlPromise: Promise<string> | null = null;
function getWorkerBlobUrl(): Promise<string> {
  if (!_workerBlobUrlPromise) {
    _workerBlobUrlPromise = fetch(pdfjsWorkerAssetUrl)
      .then(r => r.text())
      .then(code => URL.createObjectURL(
        new Blob([POLYFILLS + '\n' + code], { type: "application/javascript" })
      ))
      .catch(err => { _workerBlobUrlPromise = null; throw err; });
  }
  return _workerBlobUrlPromise;
}

// In component effect:
const [pdfjsLib, workerBlobUrl] = await Promise.all([import("pdfjs-dist"), getWorkerBlobUrl()]);
pdfjsLib.GlobalWorkerOptions.workerSrc = workerBlobUrl;
```

Blob URLs are invisible to Vite's module graph so they're never rewritten. The `?url` import ensures the fetch always hits Vite's asset server, not Express. The module-level cache prevents the 1.5 MB worker from being fetched more than once.
