import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile, cp, mkdir, access } from "fs/promises";
import path from "path";

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "@google/generative-ai",
  "@neondatabase/serverless",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "pg",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

// Files the server opens at runtime instead of importing, so esbuild never
// sees them. Copying them next to the bundle lets dist/ be deployed on its own
// — without this the migration runner throws at boot and the server never
// binds. `required: true` fails the build rather than shipping something that
// cannot start.
const runtimeAssets: Array<{ from: string; to: string; required: boolean }> = [
  // Mirrors the repo path so one relative lookup works from dist/ and a checkout.
  { from: "server/migrations", to: "dist/server/migrations", required: true },
  {
    from: "node_modules/pdfjs-dist/build/pdf.worker.min.mjs",
    to: "dist/pdf.worker.min.mjs",
    required: true,
  },
  // CI-generated; the admin endpoint degrades to `available: false` without it.
  { from: "citation-report.json", to: "dist/citation-report.json", required: false },
];

async function exists(p: string) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function copyRuntimeAssets() {
  console.log("copying runtime assets...");
  for (const asset of runtimeAssets) {
    if (!(await exists(asset.from))) {
      if (asset.required) {
        throw new Error(
          `Required runtime asset missing: ${asset.from}\n` +
            `The server reads this at runtime, so the build must not succeed without it.`,
        );
      }
      console.log(`  skip ${asset.from} (not present, optional)`);
      continue;
    }
    await mkdir(path.dirname(asset.to), { recursive: true });
    await cp(asset.from, asset.to, { recursive: true });
    console.log(`  ${asset.from} -> ${asset.to}`);
  }
}

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });

  await copyRuntimeAssets();
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
