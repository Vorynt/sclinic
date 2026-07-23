import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Enables next/navigation `forbidden()` → app/forbidden.tsx (403).
    authInterrupts: true,
  },
};

export default nextConfig;
