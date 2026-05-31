import { execFile } from "child_process";
import { promisify } from "util";
import { mkdtemp, writeFile, readFile, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import sharp from "sharp";
import { ObjectStorageService } from "./objectStorage";
import type { IStorage } from "./storage";

const execFileAsync = promisify(execFile);

const PREVIEW_SCALE_TO_X = 1400; // px width for high-quality preview

/**
 * Render the first page of a PDF buffer to an optimised PNG buffer
 * using pdftoppm (poppler-utils, pre-installed in the Nix environment).
 */
async function pdfBufferToPng(pdfBuffer: Buffer): Promise<Buffer | null> {
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
    console.error("[coaPreview] pdftoppm error:", (err as Error)?.message ?? err);
    return null;
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
 * Returns the new previewImageUrl on success, null on failure / skip.
 */
export async function generateCoaPreview(
  coaId: string,
  imageUrl: string,
  storage: IStorage
): Promise<string | null> {
  try {
    const svc = new ObjectStorageService();
    const file = await svc.getObjectEntityFile(imageUrl);
    const [downloaded] = await file.download();
    const buf = Buffer.from(downloaded);

    if (!looksLikePdf(buf)) {
      // Already an image — nothing to convert
      console.log(`[coaPreview] ${imageUrl} is not a PDF — skipping conversion`);
      return null;
    }

    const pngBuffer = await pdfBufferToPng(buf);
    if (!pngBuffer) return null;

    const previewPath = await svc.uploadProcessedImage(
      pngBuffer,
      "image/png",
      `coa-preview-${coaId}.png`
    );

    // Make the preview publicly readable
    await svc.trySetObjectEntityAclPolicy(previewPath, {
      owner: "system",
      visibility: "public",
    });

    await storage.updateCoa(coaId, { previewImageUrl: previewPath });

    console.log(`[coaPreview] ✓ COA ${coaId} → ${previewPath}`);
    return previewPath;
  } catch (err) {
    console.error(`[coaPreview] Failed for COA ${coaId}:`, (err as Error)?.message ?? err);
    return null;
  }
}

/**
 * Backfill: generate previews for every COA that has an imageUrl
 * but no previewImageUrl. Safe to run repeatedly — no-op when complete.
 */
export async function backfillCoaPreviews(storage: IStorage): Promise<{ processed: number; skipped: number }> {
  const allCoas = await storage.getAllCoas(true /* includeArchived */);
  const needsPreview = allCoas.filter((c) => c.imageUrl && !c.previewImageUrl);

  if (needsPreview.length === 0) {
    console.log("[coaPreview] Backfill: all COAs already have previews (or no imageUrl).");
    return { processed: 0, skipped: 0 };
  }

  console.log(`[coaPreview] Backfill: processing ${needsPreview.length} COA(s)...`);
  let processed = 0;
  let skipped = 0;

  for (const coa of needsPreview) {
    const result = await generateCoaPreview(coa.id, coa.imageUrl!, storage);
    if (result) {
      processed++;
    } else {
      skipped++;
    }
  }

  console.log(`[coaPreview] Backfill complete — ${processed} converted, ${skipped} skipped.`);
  return { processed, skipped };
}
