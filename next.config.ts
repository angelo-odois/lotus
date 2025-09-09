import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // devtools: {
  //   enabled: false
  // },
};

export default nextConfig;
