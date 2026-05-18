#!/usr/bin/env ts-node
/**
 * CLI Script: reset test data
 *
 * Usage: pnpm match:reset
 *
 * Deletes every row in `matches` with `api_football_id >= 999000` — the
 * range reserved to fixtures/scenarios. Production matches keep IDs from
 * API-Football (well below 999000) so they are never touched.
 */

import { config } from 'dotenv';
import { resolve } from 'path';
// .env.local first so it overrides .env when present (local dev stack).
config({ path: resolve(__dirname, '../../../.env.local') });
config({ path: resolve(__dirname, '../../../.env') });
import 'reflect-metadata';
import { setupDependencyInjection, container } from '../../infrastructure/config/di-container';
import { ResetTestDataCommand } from './commands/ResetTestDataCommand';
import { logger } from '../../infrastructure/logging/logger';

setupDependencyInjection();

async function main(): Promise<void> {
    try {
        const command = container.resolve(ResetTestDataCommand);
        const exitCode = await command.execute();
        process.exit(exitCode);
    } catch (error) {
        logger.error('match:reset failed', {
            error: error instanceof Error ? error.message : String(error),
        });
        process.exit(1);
    }
}

main();
