import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Smaller image for Docker (`output: 'standalone'` → `.next/standalone`).
  output: "standalone",
  experimental: {
    // Enables next/navigation `forbidden()` → app/forbidden.tsx (403).
    authInterrupts: true,
  },
  allowedDevOrigins: ["192.168.1.200"],
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/home",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
