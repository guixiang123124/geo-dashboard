import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://geo-insights-api-production.up.railway.app/api/:path*',
      },
      {
        source: '/health',
        destination: 'https://geo-insights-api-production.up.railway.app/health',
      },
    ];
  },
};

export default nextConfig;
