/**
 * Subida de imágenes desde el panel (/api/upload-image), en el navegador.
 *
 * Las fotos del celular suelen pesar 3-10 MB: antes de subirlas se reducen (lado mayor 1920 px,
 * WebP o JPEG) para que pasen el límite y carguen rápido en el sitio. Los GIF se suben tal cual
 * (redibujarlos perdería la animación). Los errores del servidor se leen aunque no sean JSON
 * (p. ej. un 413 en texto plano).
 */

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const MAX_SIDE = 1920;
// Por debajo de esto y sin exceder MAX_SIDE, el archivo se sube sin tocarlo
const SKIP_BELOW_BYTES = 600 * 1024;
const SERVER_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export class UploadError extends Error {}

async function decode(file: File): Promise<{ source: CanvasImageSource; width: number; height: number; close?: () => void }> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
    } catch {
      // Algunos navegadores no decodifican ciertos formatos con createImageBitmap: se prueba con <img>
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return { source: img, width: img.naturalWidth, height: img.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

const toBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

/** Reduce y recomprime la imagen. Devuelve el archivo original si no hace falta o no se puede. */
export async function shrinkImage(file: File): Promise<File> {
  if (file.type === "image/gif") return file;

  let decoded;
  try {
    decoded = await decode(file);
  } catch {
    // El navegador no sabe leerla (p. ej. HEIC fuera de Safari): el servidor decidirá
    return file;
  }
  const { source, width, height, close } = decoded;
  try {
    const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
    if (scale === 1 && file.size <= SKIP_BELOW_BYTES && SERVER_TYPES.includes(file.type)) return file;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);

    // WebP conserva la transparencia de los logos PNG; Safari antiguo no lo genera y cae a JPEG
    let blob = await toBlob(canvas, "image/webp", 0.85);
    if (!blob || blob.type !== "image/webp") {
      if (file.type === "image/png" && file.size <= MAX_UPLOAD_BYTES && scale === 1) return file;
      blob = await toBlob(canvas, "image/jpeg", 0.85);
    }
    if (!blob) return file;
    // Si la versión nueva no ahorra nada, se queda la original (cuando el servidor la acepta)
    if (blob.size >= file.size && SERVER_TYPES.includes(file.type)) return file;

    const ext = blob.type === "image/webp" ? "webp" : "jpg";
    const name = file.name.replace(/\.[^.]+$/, "") || "imagen";
    return new File([blob], `${name}.${ext}`, { type: blob.type });
  } finally {
    close?.();
  }
}

/** Mensaje legible de una respuesta fallida, sea JSON ({ error }) o texto plano. */
async function errorMessage(res: Response): Promise<string> {
  if (res.status === 413) return "La imagen es demasiado pesada. Prueba con una foto más pequeña (máx. 5 MB).";
  const text = await res.text().catch(() => "");
  try {
    const data = JSON.parse(text) as { error?: string };
    if (data.error) return data.error;
  } catch {
    // No era JSON
  }
  if (res.status === 401 || res.status === 403) return "Tu sesión expiró. Vuelve a iniciar sesión e inténtalo de nuevo.";
  return `No se pudo subir la imagen (error ${res.status}). Inténtalo de nuevo.`;
}

/** Reduce la imagen y la sube a R2. Devuelve la URL pública (/media/...) o lanza UploadError. */
export async function uploadImage(original: File): Promise<string> {
  if (!original.type.startsWith("image/")) throw new UploadError("El archivo no es una imagen.");

  const file = await shrinkImage(original);
  if (!SERVER_TYPES.includes(file.type)) {
    throw new UploadError("Formato no compatible. Usa una foto JPG, PNG o WebP.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadError("La imagen supera 5 MB incluso después de reducirla. Prueba con otra foto.");
  }

  const fd = new FormData();
  fd.append("file", file);
  let res: Response;
  try {
    res = await fetch("/api/upload-image", { method: "POST", body: fd });
  } catch {
    throw new UploadError("Sin conexión. Revisa tu internet e inténtalo de nuevo.");
  }
  if (!res.ok) throw new UploadError(await errorMessage(res));
  const data = (await res.json().catch(() => null)) as { url?: string } | null;
  if (!data?.url) throw new UploadError("El servidor no devolvió la imagen. Inténtalo de nuevo.");
  return data.url;
}
