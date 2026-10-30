import sharp from 'sharp';

export interface ValidatedImage {
  buffer: Buffer;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  format: 'jpeg' | 'png' | 'webp';
  width: number;
  height: number;
  sizeBytes: number;
}

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MIN_DIMENSION_PX = 50;
export const MAX_DIMENSION_PX = 8192;

/**
 * Validate image binary header by inspecting magic numbers (file signature)
 */
export function detectMagicMimeType(buffer: Buffer): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (!buffer || buffer.length < 12) {
    return null;
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }

  // WebP: 'RIFF' .... 'WEBP'
  const isRiff =
    buffer[0] === 0x52 && // 'R'
    buffer[1] === 0x49 && // 'I'
    buffer[2] === 0x46 && // 'F'
    buffer[3] === 0x46; // 'F'

  const isWebp =
    buffer[8] === 0x57 && // 'W'
    buffer[9] === 0x45 && // 'E'
    buffer[10] === 0x42 && // 'B'
    buffer[11] === 0x50; // 'P'

  if (isRiff && isWebp) {
    return 'image/webp';
  }

  return null;
}

/**
 * Deeply validates an uploaded image buffer:
 * 1. File size within acceptable limits
 * 2. Magic byte signature matches JPEG, PNG, or WebP
 * 3. Sharp decodes image metadata without corruption
 * 4. Image dimensions are suitable for botanical vision analysis
 */
export async function validateImageBuffer(buffer: Buffer): Promise<ValidatedImage> {
  if (!buffer || buffer.length === 0) {
    throw new Error('No image data provided. Please select a valid plant photograph.');
  }

  if (buffer.length > MAX_IMAGE_SIZE_BYTES) {
    const sizeMb = (buffer.length / (1024 * 1024)).toFixed(2);
    throw new Error(
      `Image size (${sizeMb} MB) exceeds maximum allowed limit of 5 MB. Please upload a smaller or compressed photograph.`
    );
  }

  // 1. Check Magic Bytes
  const magicMime = detectMagicMimeType(buffer);
  if (!magicMime) {
    throw new Error(
      'Unsupported file format or corrupted binary signature. Only genuine JPEG, PNG, and WebP photographs are supported.'
    );
  }

  // 2. Decode using Sharp to verify image integrity and dimensions
  let metadata: sharp.Metadata;
  try {
    metadata = await sharp(buffer).metadata();
  } catch (err: any) {
    throw new Error(`Corrupted or unreadable image file: ${err.message || 'Failed to decode image data.'}`);
  }

  const { format, width, height } = metadata;

  if (!format || !['jpeg', 'png', 'webp'].includes(format)) {
    throw new Error(`Invalid image content format (${format || 'unknown'}). Supported formats are JPEG, PNG, and WebP.`);
  }

  if (!width || !height) {
    throw new Error('Could not determine image dimensions. The file may be truncated or corrupted.');
  }

  if (width < MIN_DIMENSION_PX || height < MIN_DIMENSION_PX) {
    throw new Error(
      `Image resolution is too low (${width}x${height} px). Please upload a clearer plant photograph with at least 50x50 pixels.`
    );
  }

  if (width > MAX_DIMENSION_PX || height > MAX_DIMENSION_PX) {
    throw new Error(
      `Image resolution is excessively high (${width}x${height} px). Maximum allowed dimension is ${MAX_DIMENSION_PX} px.`
    );
  }

  return {
    buffer,
    mimeType: magicMime,
    format: format as 'jpeg' | 'png' | 'webp',
    width,
    height,
    sizeBytes: buffer.length,
  };
}

/**
 * Optimize validated image for efficient multimodal AI vision inference.
 * Downsamples high-resolution camera captures (which can be up to 5MB) to max 1024x1024
 * while preserving botanical leaf venation, mycelium, and lesion detail.
 * Reduces transmission size from ~5MB down to ~120-180KB, drastically lowering API latency.
 */
export async function optimizeImageForVision(image: ValidatedImage): Promise<{
  base64Data: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
}> {
  if (image.width <= 1024 && image.height <= 1024 && image.sizeBytes <= 400 * 1024) {
    return {
      base64Data: image.buffer.toString('base64'),
      mimeType: image.mimeType,
    };
  }

  const optimizedBuffer = await sharp(image.buffer)
    .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  return {
    base64Data: optimizedBuffer.toString('base64'),
    mimeType: 'image/jpeg',
  };
}
