import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
