import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

const here = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  output: 'standalone',
  // Climb to the repo root so pnpm's symlinked workspace packages get traced.
  outputFileTracingRoot: path.join(here, '../../'),
  transpilePackages: ['@chiliztv/ui'],
};

export default nextConfig;
