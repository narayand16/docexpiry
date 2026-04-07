import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true // TODO - remove this once we fix all type errors in the codebase
  }
};

export default nextConfig;
