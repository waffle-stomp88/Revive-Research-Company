import fs from "fs";
import path from "path";

/**
 * Locates files the server opens at runtime rather than imports.
 *
 * esbuild bundles the server into a single `dist/index.cjs`, but it only
 * bundles things that are `import`ed — SQL migrations, JSON manifests and the
 * pdf.js worker are read from disk while the process runs, so they are not in
 * the bundle. Resolving them against `process.cwd()` alone means the app only
 * boots when the whole repository happens to sit next to the built file, which
 * is true on Replit but not on a host that ships only the build output.
 *
 * Checking next to the bundle first and the working directory second makes one
 * code path work for `tsx server/index.ts` in development, a repo-style deploy,
 * and a build-output-only deploy.
 */

// In the CJS bundle `__dirname` is dist/. Under tsx the modules are ESM, where
// `__dirname` is not defined at all — `typeof` is the one way to test that
// without triggering a ReferenceError.
const bundleDir: string | null = typeof __dirname !== "undefined" ? __dirname : null;

export const runtimeRoots: string[] = Array.from(
  new Set([bundleDir, process.cwd()].filter((r): r is string => Boolean(r))),
);

/** First existing match, or null. Relative paths are tried in the order given. */
export function findRuntimePath(...relatives: string[]): string | null {
  for (const root of runtimeRoots) {
    for (const rel of relatives) {
      const candidate = path.resolve(root, rel);
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return null;
}

/**
 * Every candidate path, whether or not it exists yet. Use this for consumers
 * that tolerate a missing directory and re-check per request (express.static),
 * so a directory created after boot is still picked up.
 */
export function runtimeCandidates(...relatives: string[]): string[] {
  return Array.from(
    new Set(runtimeRoots.flatMap((root) => relatives.map((rel) => path.resolve(root, rel)))),
  );
}

/** Every location that was checked — for error messages worth reading. */
export function searchedLocations(...relatives: string[]): string {
  return runtimeRoots
    .flatMap((root) => relatives.map((rel) => path.resolve(root, rel)))
    .join("\n  ");
}
