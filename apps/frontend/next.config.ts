import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {

    config.externals.push("pino-pretty", "lokijs", "encoding");
    // Exclure les modules React Native qui ne sont pas nécessaires pour le web
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@react-native-async-storage/async-storage': false,
      'react-native': false,
    };

    // Ignorer les modules React Native dans les résolutions
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
    };

    return config;
  },
  // Configuration pour éviter les erreurs de build
  // Note: esmExternals n'est pas supporté par Turbopack
  
  // Configuration pour les images
  images: {
    remotePatterns: [
      { hostname: 'localhost' },
      { hostname: 'upload.wikimedia.org' },
      { hostname: 'media.api-sports.io' },
    ],
    unoptimized: true,
  },
};

export default nextConfig;