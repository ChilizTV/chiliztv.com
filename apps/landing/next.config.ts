// Static export consumed by deploy-landing.yml (Cloudflare Pages). The 
// NEXT_PUBLIC_* values listed in that workflow are inlined here at build time.
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  transpilePackages: ["@chiliztv/ui"],
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@dynamic-labs/sdk-react-core",
      "wagmi",
      "viem",
    ],
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
