import { spawn, spawnSync, type ChildProcess } from 'child_process';
import { MockClock } from '../clock/MockClock';
import { runHealthCheck } from './_health-check';

export interface IntegrationContext {
    anvilProcess: ChildProcess | null;
    anvilRpcUrl: string;
    supabaseDbUrl: string;
    clock: MockClock;
    /** Snapshot ID returned by `evm_snapshot` — call before each test. */
    anvilSnapshotId?: string;
}

const ANVIL_DEFAULT_PORT = 8545;
const ANVIL_BOOT_TIMEOUT_MS = 10_000;
const ANVIL_BOOT_POLL_MS = 200;

/**
 * Stand up Anvil + read the Supabase local DB URL, run migrations, return a
 * context the tests can pull from. Caller MUST invoke `teardownIntegrationEnv`
 * on completion.
 *
 * Caveats:
 *   - Supabase local stack must already be running (`supabase start`) before
 *     calling this. Spawning it here would extend the bootstrap to 60s+ and
 *     conflict with whatever local instance the dev already uses.
 *   - Anvil is forked from Spicy by default. Override with
 *     `ANVIL_FORK_URL=""` (empty) to spin a vanilla local chain (faster but
 *     no Spicy state).
 */
export async function setupIntegrationEnv(): Promise<IntegrationContext> {
    const health = runHealthCheck();
    if (!health.ok) {
        throw new Error(`Integration prerequisites missing: ${health.missing.join(', ')}`);
    }

    const anvilRpcUrl = `http://127.0.0.1:${ANVIL_DEFAULT_PORT}`;
    const anvilProcess = await spawnAnvil(ANVIL_DEFAULT_PORT);
    await waitForAnvil(anvilRpcUrl);

    const supabaseDbUrl = resolveSupabaseDbUrl();
    runMigrations(supabaseDbUrl);

    // TODO(integration-deploy): once the deploy harness is wired, this is the
    // place to run `forge script script/DeployAll.s.sol --rpc-url <anvilRpcUrl>`
    // and capture the deployed addresses. Skipped for now — individual tests
    // that need contracts will call the deploy helper directly.

    return {
        anvilProcess,
        anvilRpcUrl,
        supabaseDbUrl,
        clock: new MockClock(new Date()),
    };
}

export async function teardownIntegrationEnv(ctx: IntegrationContext): Promise<void> {
    if (ctx.anvilProcess && !ctx.anvilProcess.killed) {
        ctx.anvilProcess.kill('SIGTERM');
        await new Promise<void>((res) => {
            ctx.anvilProcess?.once('exit', () => res());
            setTimeout(res, 2_000);
        });
    }
}

function spawnAnvil(port: number): Promise<ChildProcess> {
    const forkUrl = process.env.ANVIL_FORK_URL ?? 'https://spicy-rpc.chiliz.com';
    const args = ['--port', String(port)];
    if (forkUrl) args.push('--fork-url', forkUrl);
    const proc = spawn('anvil', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    proc.on('error', (err) => {
        throw new Error(`Failed to spawn anvil: ${err.message}`);
    });
    return Promise.resolve(proc);
}

async function waitForAnvil(rpcUrl: string): Promise<void> {
    const deadline = Date.now() + ANVIL_BOOT_TIMEOUT_MS;
    while (Date.now() < deadline) {
        try {
            const r = await fetch(rpcUrl, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] }),
            });
            if (r.ok) return;
        } catch {
            // Anvil not ready yet — keep polling.
        }
        await new Promise((res) => setTimeout(res, ANVIL_BOOT_POLL_MS));
    }
    throw new Error(`Anvil at ${rpcUrl} did not respond within ${ANVIL_BOOT_TIMEOUT_MS}ms`);
}

function resolveSupabaseDbUrl(): string {
    const explicit = process.env.SUPABASE_DB_URL ?? process.env.DATABASE_URL;
    if (explicit) return explicit;
    // Try `supabase status -o env` and pluck DB_URL.
    const r = spawnSync('supabase', ['status', '-o', 'env'], { stdio: 'pipe' });
    if (r.status === 0) {
        const out = r.stdout.toString();
        const match = /^DB_URL="?([^"\n]+)"?/m.exec(out);
        if (match) return match[1];
    }
    throw new Error('SUPABASE_DB_URL / DATABASE_URL not set and `supabase status` could not resolve it. Run `supabase start` first.');
}

function runMigrations(dbUrl: string): void {
    const wipe = spawnSync(
        'psql',
        [dbUrl, '-v', 'ON_ERROR_STOP=1', '-c',
            'DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO postgres; GRANT ALL ON SCHEMA public TO public;'],
        { stdio: 'inherit' },
    );
    if (wipe.status !== 0) {
        throw new Error(`psql wipe failed (exit ${wipe.status})`);
    }
    const r = spawnSync('pnpm', ['db:migrate'], {
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: dbUrl },
    });
    if (r.status !== 0) {
        throw new Error(`pnpm db:migrate failed (exit ${r.status})`);
    }
}
