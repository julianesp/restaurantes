import { env } from 'cloudflare:workers';

// GET /media/<restaurante>/images/<archivo> — sirve imágenes públicas guardadas en R2.
// Las claves incluyen un UUID aleatorio, así que son inmutables y cacheables.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const bucket = (env as unknown as { MEDIA?: R2Bucket }).MEDIA;
  if (!bucket) return new Response('No disponible', { status: 503 });

  const { key } = await params;
  // Solo se sirve la zona de imágenes; se rechazan segmentos raros (../)
  if (key.length !== 3 || key[1] !== 'images' || key.some((part) => part === '..' || part === '')) {
    return new Response('No encontrado', { status: 404 });
  }

  const object = await bucket.get(key.join('/'));
  if (!object) return new Response('No encontrado', { status: 404 });

  return new Response(object.body, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      ETag: object.httpEtag,
    },
  });
}
