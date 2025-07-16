import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '',
  images: {
    unoptimized: true,
  },
  // Ensure GitHub Pages doesn't use Jekyll which would ignore files starting with underscore
  trailingSlash: true,
  // Disable the distDir option if it's set
  distDir: 'out',
};

export default nextConfig;
