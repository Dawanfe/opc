import type { NextConfig } from "next";

const basePath = process.env.BASE_PATH || '';

const nextConfig: NextConfig = {
  basePath,
  assetPrefix: basePath,
  output: 'standalone',

  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },

  // Image optimization configuration
  images: {
    unoptimized: true, // Disable image optimization for simpler deployment
  },

  // Webpack configuration
  webpack: (config) => {
    // Handle better-sqlite3 native module
    config.externals = [...(config.externals || []), 'better-sqlite3'];
    return config;
  },
};

export default nextConfig;
