---
name: pdfjs worker route placement
description: Why /api/pdfjs-worker must be registered in server/index.ts before registerRoutes(), not inside registerRoutes()
---

## Rule
Register `app.get('/api/pdfjs-worker', ...)` in `server/index.ts` immediately after the logging middleware, **before** `registerRoutes()` and **before** `setupVite()`.

## Why
When the route was inside `registerRoutes()` (routes.ts line ~240), something later in that 6,989-line function silently prevented Express from ever reaching the handler. Every request to `/api/pdfjs-worker` fell through to Vite's `app.use("*", ...)` catch-all, which returned `index.html` with `Content-Type: text/html` instead of the JavaScript worker.

Other `/api/` routes inside `registerRoutes()` work fine — the shadowing was specific to this route. The root cause was never fully identified (possibly a wildcard or sub-router registered between line 240 and 6988 that matched this exact path). Moving the route to `server/index.ts` — before everything else — puts it at position 0 in the Express stack and guarantees nothing can shadow it.

## How to apply
If the worker route ever needs to be added back or modified, keep it in `server/index.ts` in the block labelled "pdfjs worker — registered here (not inside registerRoutes)". Do NOT move it back into `routes.ts`.
