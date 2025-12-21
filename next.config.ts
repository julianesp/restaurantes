import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Configuración de Turbopack
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Configuración de imágenes remotas (opcional para futuras imágenes)
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
