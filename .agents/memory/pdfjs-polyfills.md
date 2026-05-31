---
name: pdfjs-dist polyfills
description: How pdfjs-dist ≥5 polyfills were handled and the current worker-serving approach (updated mid-2026 — production and tests are both polyfill-free)
---

# pdfjs-dist ≥ 5 — Polyfill history and current approach

## Current approach (mid-2026): production and tests are both polyfill-free

pdfjs-dist 5.x uses five APIs (URL.parse, Promise.try, Promise.withResolvers,
Uint8Array.prototype.toHex, Map.prototype.getOrInsertComputed) that landed in
Chrome 126–136.  All supported real-user browsers now have these natively.
The test environment now uses Playwright's bundled Chromium (≥ 147), so no
compatibility shims are needed anywhere.

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

**Keep `client/public/pdf.worker.min.mjs` in sync** with the installed
pdfjs-dist version.  When upgrading pdfjs-dist, copy the new worker file.

### Main-thread component (`client/src/components/coa-pdf-viewer.tsx`)

No polyfills.  Just:
```ts
const pdfjsLib = await import("pdfjs-dist");
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
```

---

## Test environment — Playwright bundled Chromium ≥ 147

`playwright.config.ts` now uses Playwright's bundled Chromium (147+) on NixOS
by combining two tricks:

1. **patchelf** — patches the ELF interpreter of the bundled binary to the
   NixOS glibc `ld-linux-x86-64.so.2` (discovered dynamically from the system
   Chromium wrapper).  Without this, the binary crashes with SIGFPE due to a
   glibc ABI mismatch (not a missing-library 127 exit).

2. **LD_LIBRARY_PATH** — built from `ldd` output of the NixOS system Chromium
   unwrapped binary, passed via `launchOptions.env` in playwright.config.ts.

Both paths are discovered dynamically (no hardcoded NixOS store hashes):
- System Chromium wrapper: `which chromium` then parse the `exec "..."` line
- NixOS glibc interpreter: `patchelf --print-interpreter <unwrapped>`
- Library dirs: `ldd <unwrapped>` → extract `/nix/store/...` paths → dirname
- Playwright Chrome: glob `~/.cache/ms-playwright/chromium-*/chrome-linux64/chrome`

The patching is **idempotent** — `patchelf --print-interpreter` is checked
first; the binary is only patched if the interpreter differs.

If the Playwright bundled Chromium is not found or fails to configure, the
config falls back to the NixOS system Chromium (≈ 125).

**Why SIGFPE and not exit 127?**  
When LD_LIBRARY_PATH resolves the libraries but the interpreter is still
`/lib64/ld-linux-x86-64.so.2` (which symlinks to a different glibc version
than the NixOS `.so` files expect), the binary runs but crashes with SIGFPE
immediately. Patching the interpreter fixes the ABI mismatch.

---

## Key files

- `client/src/components/coa-pdf-viewer.tsx` — component (polyfill-free)
- `client/public/pdf.worker.min.mjs` — static worker copy (keep in sync with pdfjs-dist)
- `tests/coa-pdf-viewer.e2e.ts` — no polyfills; uses native Chrome 147 APIs
- `playwright.config.ts` — `resolveChromium()` handles patchelf + LD_LIBRARY_PATH
