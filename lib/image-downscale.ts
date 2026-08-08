/** Client-side image downscale/recompress so uploads stay small (< ~2 MB).
 *  Shared by the storefront image search and the chatbot image attach. */

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      type,
      quality,
    );
  });
}

function scaledCanvas(
  bitmap: ImageBitmap,
  maxDimension: number,
): HTMLCanvasElement {
  const scale = Math.min(
    1,
    maxDimension / Math.max(bitmap.width, bitmap.height),
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D context unavailable");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/** Downscale to <= maxDimension px on the long edge and recompress to JPEG
 *  under maxBytes (drops quality in steps; floor 0.4). */
export async function downscaleImage(
  file: File | Blob,
  maxDimension = 1024,
  maxBytes = 2 * 1024 * 1024,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = scaledCanvas(bitmap, maxDimension);
    let quality = 0.9;
    let blob = await canvasToBlob(canvas, "image/jpeg", quality);
    while (blob.size > maxBytes && quality > 0.4) {
      quality -= 0.15;
      blob = await canvasToBlob(canvas, "image/jpeg", quality);
    }
    return blob;
  } finally {
    bitmap.close();
  }
}

/** Small JPEG data URL for showing the sent image in chat history. */
export async function makeThumbnailDataUrl(
  file: File | Blob,
  maxDimension = 256,
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = scaledCanvas(bitmap, maxDimension);
    return canvas.toDataURL("image/jpeg", 0.7);
  } finally {
    bitmap.close();
  }
}
