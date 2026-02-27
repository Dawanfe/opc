import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: process.env.BASE_PATH || '',
  assetPrefix: process.env.BASE_PATH || '',
  output: 'standalone',

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
