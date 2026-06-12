import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

const here = path.dirname(fileURLToPath(import.meta.url));

// Vercel-only app (no Docker runtime stage). `output: 'standalone'` is for
// self-hosting and breaks Vercel's Build Output routing behind the proxy —
// the native Vercel builder serves the pages + proxy correctly without it.
const nextConfig: NextConfig = {
  // Climb to the repo root so pnpm's symlinked workspace packages get traced.
  outputFileTracingRoot: path.join(here, '../../'),
  transpilePackages: ['@chiliztv/ui'],
};

export default nextConfig;
