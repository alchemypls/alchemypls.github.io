import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '',
  images: {
    unoptimized: true,
  },
  // Ensure GitHub Pages doesn't use Jekyll which would ignore files starting with underscore
  trailingSlash: true,
};

export default nextConfig;
