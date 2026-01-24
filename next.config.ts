import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Configuración de Turbopack
  turbopack: {
    root: path.resolve(__dirname),
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
    ],
  },
};

export default nextConfig;
