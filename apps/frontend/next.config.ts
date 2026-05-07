import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

// __dirname isn't defined under ESM module loading — derive it from
// import.meta.url so `outputFileTracingRoot` can point at the repo root.
const here = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle into .next/standalone so the Docker
  // `frontend` runtime stage can ship without copying the whole repo.
  // Required by the `frontend` target in `Dockerfile` — do not remove unless
  // you're switching the prod image off the standalone copy pattern.
  output: 'standalone',

  // The standalone tracer roots from this app, so it climbs out of the
  // monorepo to find pnpm's symlinked workspace packages. `outputFileTracingRoot`
  // tells Next where to stop — set to the repo root to capture everything in
  // `node_modules/.pnpm` reachable from `apps/frontend`.
  outputFileTracingRoot: path.join(here, '../../'),

  transpilePackages: ['@chiliztv/blockchain', '@chiliztv/domain', '@chiliztv/shared'],

  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'framer-motion',
      '@dynamic-labs/sdk-react-core',
      'wagmi',
      'viem',
    ],
  },

  images: {
    remotePatterns: [
      { hostname: 'localhost' },
      { hostname: 'upload.wikimedia.org' },
      { hostname: 'media.api-sports.io' },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
