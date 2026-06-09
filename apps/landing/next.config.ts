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
