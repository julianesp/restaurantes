import { NextResponse } from 'next/server';
import { env } from 'cloudflare:workers';
import { adminCtx } from '@/lib/tenant';

const ALLOWED: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * POST /api/upload-image
 * Sube una imagen a R2 bajo la carpeta del restaurante (solo admin del restaurante).
 * Devuelve la URL pública /media/<restaurante>/<carpeta>/<archivo>.
 */
export async function POST(request: Request) {
  try {
    const ctx = await adminCtx();
    if (!ctx.ok) return ctx.res;

    const bucket = (env as unknown as { MEDIA?: R2Bucket }).MEDIA;
    if (!bucket) return NextResponse.json({ error: 'Almacenamiento no configurado' }, { status: 503 });

    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 });
    }

    const extension = ALLOWED[file.type];
    if (!extension) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Solo se aceptan imágenes (JPEG, PNG, WebP, GIF)' },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'El archivo es muy grande. Tamaño máximo: 5MB' }, { status: 400 });
    }

    // La extensión sale del tipo MIME validado, no del nombre enviado por el cliente
    const filename = `${crypto.randomUUID()}.${extension}`;
    const key = `${ctx.tenant.id}/images/${filename}`;

    await bucket.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type, cacheControl: 'public, max-age=31536000, immutable' },
    });

    return NextResponse.json({ success: true, url: `/media/${key}`, filename });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Error al subir la imagen', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
