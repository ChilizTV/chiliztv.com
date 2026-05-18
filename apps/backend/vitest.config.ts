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
        // Placeholders satisfying the Zod env schema. Unit tests mock every
        // adapter so these values are never actually used at runtime — they
        // just need to make the env.ts import succeed in CI.
        env: {
            NODE_ENV: 'test',
            REDIS_URL: '',
            SUPABASE_URL: 'http://127.0.0.1:54321',
            SUPABASE_ANON_KEY: 'a'.repeat(60),
            API_FOOTBALL_KEY: 'test_api_football_key_placeholder',
            BETTING_MATCH_FACTORY_ADDRESS: `0x${'1'.repeat(40)}`,
            STREAM_WALLET_FACTORY_ADDRESS: `0x${'2'.repeat(40)}`,
            CHILIZ_SWAP_ROUTER_ADDRESS: `0x${'3'.repeat(40)}`,
            LIQUIDITY_POOL_PROXY: `0x${'4'.repeat(40)}`,
            USDC_ADDRESS: `0x${'5'.repeat(40)}`,
            WCHZ_ADDRESS: `0x${'6'.repeat(40)}`,
            ADMIN_PRIVATE_KEY: `0x${'a'.repeat(64)}`,
            JWT_SECRET: 'a'.repeat(32),
            CLOUDFLARE_ACCOUNT_ID: 'test',
            CLOUDFLARE_STREAM_API_TOKEN: 'test',
            CLOUDFLARE_STREAM_WEBHOOK_SECRET: 'test',
            CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN: 'test',
            ACCESS_CODE_HASH: 'a'.repeat(64),
            ACCESS_CODE_COOKIE_SECRET: 'a'.repeat(32),
        },
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
