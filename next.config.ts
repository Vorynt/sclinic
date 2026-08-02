import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Smaller image for Docker (`output: 'standalone'` → `.next/standalone`).
  output: "standalone",
  experimental: {
    // Enables next/navigation `forbidden()` → app/forbidden.tsx (403).
    authInterrupts: true,
  },
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/home",
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
