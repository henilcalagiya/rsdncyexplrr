import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // bundle the SQLite db into every serverless function on Vercel
  outputFileTracingIncludes: {
    "/**": ["./residency_explorer.db"],
    "/": ["./residency_explorer.db"],
  },
};

export default nextConfig;
