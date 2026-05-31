---
name: pdfjs worker blob URL
description: Why CoaPdfViewer uses fetch+Blob+createObjectURL instead of a direct path for the pdfjs worker in dev
---

## Rule
Always set `pdfjsLib.GlobalWorkerOptions.workerSrc` to a `blob:` URL created from the fetched worker script, never to a plain relative or absolute path.

**Why:** Vite's dev server intercepts dynamic `import()` calls made inside pdfjs-dist and appends `?import` to the URL (e.g. `/api/pdfjs-worker?import`). The Express route only matches the bare path, so the fetch fails with "Failed to fetch dynamically imported module". This does not affect production builds (no Vite dev server), which is why it only shows up in the Replit workspace preview iframe, not on real browsers or deployed apps.

**How to apply:**
```js
const workerResp = await fetch("/api/pdfjs-worker");
const workerCode = await workerResp.text();
const workerBlob = new Blob([workerCode], { type: "application/javascript" });
pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(workerBlob);
```
`blob:` URLs are invisible to Vite's module graph and are never rewritten. This works in both dev and production.
