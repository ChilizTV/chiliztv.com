import path from 'node:path';
import { defineConfig } from 'vitest/config';

// Mirror les `paths` du tsconfig backend pour que vitest résolve les
// imports `@chiliztv/domain/...` côté tests sans build préalable.
export default defineConfig({
    test: {
        environment: 'node',
        globals: false,
        include: ['src/**/*.test.ts'],
        // Integration suites live next to source but use a longer timeout +
        // separate config — exclude them from the fast unit-test default.
        exclude: ['src/testing/integration/**', 'node_modules', 'dist'],
        // tsyringe requires reflect-metadata to be loaded before any
        // decorator-annotated module is imported.
        setupFiles: ['reflect-metadata'],
        // Force the no-Redis branch for unit tests. The dev .env may point
        // REDIS_URL at a local instance that isn't running in CI; the cache
        // tests inject their own fake client and don't rely on this env.
        env: { REDIS_URL: '' },
    },
    resolve: {
        alias: [
            { find: /^@chiliztv\/domain$/, replacement: path.resolve(__dirname, '../../packages/domain/src/index.ts') },
            { find: /^@chiliztv\/domain\/(.*)$/, replacement: path.resolve(__dirname, '../../packages/domain/src/$1') },
            { find: /^@chiliztv\/blockchain$/, replacement: path.resolve(__dirname, '../../packages/blockchain/src/index.ts') },
            { find: /^@chiliztv\/blockchain\/(.*)$/, replacement: path.resolve(__dirname, '../../packages/blockchain/src/$1') },
            { find: /^@chiliztv\/shared$/, replacement: path.resolve(__dirname, '../../packages/shared/src/index.ts') },
            { find: /^@chiliztv\/shared\/(.*)$/, replacement: path.resolve(__dirname, '../../packages/shared/src/$1') },
        ],
    },
});
