/**
 * Downscales a photo in the browser so phone photos (often 4-12 MB) stay under the upload limit.
 * Uses platform APIs only. Returns the original file if the browser cannot decode or shrink it.
 */
export async function compressImage(file: Blob, maxEdge = 1568, quality = 0.85): Promise<Blob> {
  if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') {
    return file;
  }
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality),
    );
    return blob && (blob.size < file.size || file.type === 'image/heic' || file.type === 'image/heif')
      ? blob
      : file;
  } catch {
    return file;
  }
}
