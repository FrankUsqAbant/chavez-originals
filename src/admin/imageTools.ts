const MAX_SOURCE_BYTES = 12 * 1024 * 1024;
const MAX_OUTPUT_BYTES = 900 * 1024; // el almacenamiento acepta hasta 1 MB por foto

/**
 * Reduce una foto (máx. 900 px de lado) y la convierte a WebP antes de subirla, para que la tienda cargue rápido.
 * Conserva la transparencia de los PNG. Lanza un Error con un mensaje listo para mostrar.
 */
export async function fotoAWebp(file: File, maxSide = 900): Promise<Blob> {
  if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) throw new Error('Usa una imagen JPG, PNG o WebP.');
  if (file.size > MAX_SOURCE_BYTES) throw new Error('La imagen pesa demasiado (máximo 12 MB).');

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('No se pudo leer la imagen. Prueba con otro archivo.');
  }
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Tu navegador no pudo procesar la imagen.');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  for (const quality of [0.85, 0.75, 0.65, 0.5]) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
    if (blob && blob.size <= MAX_OUTPUT_BYTES) return blob;
  }
  throw new Error('No se pudo reducir la imagen lo suficiente. Prueba con una más simple.');
}
