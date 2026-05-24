#!/usr/bin/env node
/**
 * Flatten Foundry build artifacts into apps/frontend/artifacts/.
 *
 * Foundry layout:  apps/smart-contracts/chiliz-tv/out/<X>.sol/<X>.json
 * Frontend wants:  apps/frontend/artifacts/<X>.json (single { abi, bytecode } object)
 *
 * Run via `pnpm artifacts:sync` from apps/frontend.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = resolve(__dirname, '..');
const FOUNDRY_OUT = resolve(FRONTEND_ROOT, '../smart-contracts/chiliz-tv/out');
const ARTIFACTS = resolve(FRONTEND_ROOT, 'artifacts');
const PACKAGE_ABIS_JSON = resolve(FRONTEND_ROOT, '../../packages/blockchain/src/abis/json');

// Contracts whose artifacts the frontend actually consumes via wagmi.config.ts.
// Keep this list aligned with the imports in apps/frontend/wagmi.config.ts.
const TARGETS = [
    'PariMatchBase',
    'PariMatchFactory',
    'FootballPariMatch',
    'BasketballPariMatch',
    'LeaderboardRewards',
    'StreamWallet',
    'StreamWalletFactory',
    'ChilizSwapRouter',
];

if (!existsSync(FOUNDRY_OUT)) {
    console.error(`✖ Foundry out/ not found at ${FOUNDRY_OUT}`);
    console.error('  Run `forge build` in apps/smart-contracts/chiliz-tv first.');
    process.exit(1);
}

if (!existsSync(ARTIFACTS)) mkdirSync(ARTIFACTS, { recursive: true });
if (!existsSync(PACKAGE_ABIS_JSON)) mkdirSync(PACKAGE_ABIS_JSON, { recursive: true });

// Foundry stores each contract in <Name>.sol/<Name>.json. Some files (libraries,
// interfaces) are nested in subdirs; the canonical .sol dir is at the top of out/.
const subdirs = readdirSync(FOUNDRY_OUT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

const summary = [];

for (const name of TARGETS) {
    const dir = subdirs.find((d) => d === `${name}.sol`);
    if (!dir) {
        summary.push({ name, status: 'missing-sol-dir' });
        continue;
    }
    const src = join(FOUNDRY_OUT, dir, `${name}.json`);
    if (!existsSync(src)) {
        summary.push({ name, status: 'missing-json' });
        continue;
    }
    const raw = JSON.parse(readFileSync(src, 'utf-8'));
    const flat = {
        abi: raw.abi ?? [],
        bytecode: raw.bytecode?.object ?? raw.bytecode ?? '0x',
    };
    const json = JSON.stringify(flat, null, 2);
    writeFileSync(join(ARTIFACTS, `${name}.json`), json);
    writeFileSync(join(PACKAGE_ABIS_JSON, `${name}.json`), json);
    summary.push({ name, status: 'ok', abiItems: flat.abi.length });
}

console.log('Artifacts sync:');
for (const row of summary) {
    const status = row.status === 'ok'
        ? `✓ ${row.abiItems} ABI items`
        : `✖ ${row.status}`;
    console.log(`  ${row.name.padEnd(22)} ${status}`);
}

const failed = summary.filter((r) => r.status !== 'ok');
if (failed.length > 0) {
    process.exit(1);
}
