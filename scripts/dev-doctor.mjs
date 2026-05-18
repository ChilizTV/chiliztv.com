#!/usr/bin/env node
// Probes the local dev services so a stuck Redis or a not-yet-booted
// Supabase surfaces an actionable error instead of a cryptic backend crash.
// V1 = TCP probe only. Follow-up: replace by `redis-cli PING` and an HTTP
// probe on `/rest/v1/` so a process that listens but errors is also caught.
import { createConnection } from 'node:net';

const CHECKS = [
  { name: 'Redis local',  host: '127.0.0.1', port: 6379,  fix: 'pnpm dev:redis:start' },
  { name: 'Supabase API', host: '127.0.0.1', port: 54321, fix: 'pnpm dev:supabase:start' },
  { name: 'Supabase DB',  host: '127.0.0.1', port: 54322, fix: 'pnpm dev:supabase:start' },
  // Studio is disabled by default in config.toml (Docker File Sharing issue).
  // Re-add this entry if you re-enable it locally.
];

async function probe({ host, port }) {
  return new Promise((resolve) => {
    const socket = createConnection({ host, port, timeout: 1000 });
    socket.once('connect', () => { socket.destroy(); resolve(true); });
    socket.once('error', () => resolve(false));
    socket.once('timeout', () => { socket.destroy(); resolve(false); });
  });
}

async function main() {
  console.log('Local dev environment doctor\n');
  let allOk = true;
  for (const check of CHECKS) {
    const ok = await probe(check);
    const status = ok ? 'OK  ' : 'DOWN';
    console.log(`  [${status}] ${check.name} (${check.host}:${check.port})`);
    if (!ok) {
      console.log(`         fix: ${check.fix}`);
      allOk = false;
    }
  }
  console.log('');
  if (!allOk) {
    console.log('One or more services are down. Start them with the suggested commands.');
    process.exit(1);
  }
  console.log('All local services are up. You can run `pnpm dev:local` safely.');
}

main().catch((err) => { console.error(err); process.exit(2); });
