import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // vinext aplica este límite a TODO POST multipart/form-data (lo trata como posible server action),
  // incluido /api/upload-image: con el valor por defecto (1 MB) las fotos respondían 413.
  // 6 MB = imagen de 5 MB (límite de la ruta) + margen del multipart.
  experimental: {
    serverActions: { bodySizeLimit: "6mb" },
  },
  // Configuración de imágenes remotas (opcional para futuras imágenes)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '0dwas2ied3dcs14f.public.blob.vercel-storage.com',
        pathname: '/restaurants/**',
      },
      {
        protocol: 'https',
        hostname: '0dwas2ied3dcs14f.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'pixabay.com',
      },
    ],
  },
};

export default nextConfig;
