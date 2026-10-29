
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/coupling-ai-simulator",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
