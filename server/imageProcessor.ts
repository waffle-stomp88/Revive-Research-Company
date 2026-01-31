import sharp from "sharp";

const STANDARD_SIZE = 800;
const BACKGROUND_COLOR = { r: 26, g: 26, b: 31, alpha: 1 }; // #1a1a1f dark charcoal

export interface ProcessedImage {
  buffer: Buffer;
  mimeType: string;
}

export async function processProductImage(imageBuffer: Buffer): Promise<ProcessedImage> {
  const processedBuffer = await sharp(imageBuffer)
    .resize(STANDARD_SIZE, STANDARD_SIZE, {
      fit: "contain",
      background: BACKGROUND_COLOR,
    })
    .flatten({ background: BACKGROUND_COLOR })
    .png({ quality: 90 })
    .toBuffer();

  return {
    buffer: processedBuffer,
    mimeType: "image/png",
  };
}

export async function getImageMetadata(imageBuffer: Buffer) {
  return sharp(imageBuffer).metadata();
}
