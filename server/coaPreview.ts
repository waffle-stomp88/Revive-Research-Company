import { execFile } from "child_process";
import { promisify } from "util";
import { mkdtemp, writeFile, readFile, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import sharp from "sharp";
import { ObjectStorageService } from "./objectStorage";
import type { IStorage } from "./storage";

const execFileAsync = promisify(execFile);

// pdftoppm (poppler-utils) is used for server-side PDF→PNG conversion.
// The canvas npm package (node-canvas) cannot be used in this environment:
// it fails with "libuuid.so.1: cannot open shared object file" because the
// NixOS sandbox does not expose that shared library to Node's dlopen path.
// pdftoppm is pre-installed via the Nix runtime and produces high-quality
// rasterised output without any native Node bindings.
const PREVIEW_SCALE_TO_X = 1400; // px width for high-quality preview

export interface BackfillResult {
  processed: number;
  succeeded: number;
  failed: number;
  errors: Array<{ coaId: string; message: string }>;
}

/**
 * Render the first page of a PDF buffer to an optimised PNG buffer
 * using pdftoppm (poppler-utils, pre-installed in the Nix environment).
 * Throws with a descriptive message on failure instead of returning null.
 */
async function pdfBufferToPng(pdfBuffer: Buffer): Promise<Buffer> {
  let tmpDir: string | null = null;
  try {
    tmpDir = await mkdtemp(join(tmpdir(), "coa-preview-"));
    const inputPath = join(tmpDir, "input.pdf");
    const outputPrefix = join(tmpDir, "page");

    await writeFile(inputPath, pdfBuffer);

    // -singlefile → only the first page; -scale-to-x → width in px; -png → PNG output
    await execFileAsync("pdftoppm", [
      "-singlefile",
      "-scale-to-x", String(PREVIEW_SCALE_TO_X),
      "-scale-to-y", "-1",
      "-png",
      inputPath,
      outputPrefix,
    ]);

    const rawBuffer = await readFile(`${outputPrefix}.png`);

    // Compress with sharp (lossless PNG)
    const optimised = await sharp(rawBuffer)
      .png({ compressionLevel: 7 })
      .toBuffer();

    return optimised;
  } catch (err) {
    const msg = (err as Error)?.message ?? String(err);
    console.error("[coaPreview] pdftoppm error:", msg);
    throw new Error(`PDF conversion failed: ${msg}`);
  } finally {
    if (tmpDir) {
      await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}

/** True if the buffer looks like a PDF file. */
function looksLikePdf(buf: Buffer): boolean {
  return buf.length > 4 && buf.slice(0, 4).toString("ascii") === "%PDF";
}

/**
 * Generate a PNG preview for a single COA.
 *  - Downloads the COA file from object storage.
 *  - If it is a PDF, converts the first page to PNG with pdftoppm.
 *  - Uploads the PNG, marks it public, updates the DB record.
 *
 * Returns the new previewImageUrl on success. Throws with a human-readable
 * message on every failure mode so callers can surface the reason to the user.
 */
export async function generateCoaPreview(
  coaId: string,
  imageUrl: string,
  storage: IStorage
): Promise<string> {
  const svc = new ObjectStorageService();

  // imageUrl may be a full GCS HTTPS URL or an /objects/ path.
  // getObjectEntityFile requires /objects/ form — normalize first.
  let normalizedPath: string;
  try {
    normalizedPath = svc.normalizeObjectEntityPath(imageUrl);
  } catch (normErr) {
    const msg = (normErr as Error)?.message ?? String(normErr);
    console.warn(`[coaPreview] Cannot normalize imageUrl "${imageUrl}":`, msg);
    throw new Error(`Cannot locate the COA file in storage — the stored URL is not a recognized object-storage path (${msg})`);
  }

  let buf: Buffer;
  try {
    const file = await svc.getObjectEntityFile(normalizedPath);
    const [downloaded] = await file.download();
    buf = Buffer.from(downloaded);
  } catch (dlErr) {
    const msg = (dlErr as Error)?.message ?? String(dlErr);
    console.error(`[coaPreview] Download failed for COA ${coaId}:`, msg);
    throw new Error(`Failed to download the COA file from storage: ${msg}`);
  }

  if (!looksLikePdf(buf)) {
    console.log(`[coaPreview] ${imageUrl} is not a PDF — skipping conversion`);
    throw new Error("The uploaded file is not a PDF. Only PDF files can be converted to preview images.");
  }

  // pdfBufferToPng now throws with a descriptive message on failure
  const pngBuffer = await pdfBufferToPng(buf);

  let previewPath: string;
  try {
    previewPath = await svc.uploadProcessedImage(
      pngBuffer,
      "image/png",
      `coa-preview-${coaId}.png`
    );
  } catch (upErr) {
    const msg = (upErr as Error)?.message ?? String(upErr);
    console.error(`[coaPreview] Upload failed for COA ${coaId}:`, msg);
    throw new Error(`Failed to upload the generated preview image: ${msg}`);
  }

  // Make the preview publicly readable
  await svc.trySetObjectEntityAclPolicy(previewPath, {
    owner: "system",
    visibility: "public",
  });

  await storage.updateCoa(coaId, { previewImageUrl: previewPath });

  console.log(`[coaPreview] ✓ COA ${coaId} → ${previewPath}`);
  return previewPath;
}

/**
 * Backfill: generate previews for every COA that has an imageUrl but no
 * previewImageUrl yet. Uses a DB-level filter (getCoasNeedingPreview) so
 * the query returns zero rows after the first successful run — truly a no-op.
 */
export async function backfillCoaPreviews(storage: IStorage): Promise<BackfillResult> {
  // DB-level filter: WHERE image_url IS NOT NULL AND preview_image_url IS NULL
  const needsPreview = await storage.getCoasNeedingPreview();

  if (needsPreview.length === 0) {
    console.log("[coaPreview] Backfill: all COAs already have previews (or no imageUrl).");
    return { processed: 0, succeeded: 0, failed: 0, errors: [] };
  }

  console.log(`[coaPreview] Backfill: processing ${needsPreview.length} COA(s)...`);
  const errors: Array<{ coaId: string; message: string }> = [];
  let succeeded = 0;
  let failed = 0;

  for (const coa of needsPreview) {
    try {
      await generateCoaPreview(coa.id, coa.imageUrl!, storage);
      succeeded++;
    } catch (err) {
      failed++;
      errors.push({ coaId: coa.id, message: (err as Error)?.message ?? String(err) });
    }
  }

  const processed = succeeded + failed;
  console.log(`[coaPreview] Backfill complete — ${succeeded} succeeded, ${failed} failed.`);
  return { processed, succeeded, failed, errors };
}
