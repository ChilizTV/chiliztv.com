#!/usr/bin/env ts-node
/**
 * CLI Script: Match scenario runner
 *
 * Usage:
 *   pnpm match:scenario list
 *   pnpm match:scenario run <name> [--no-deploy] [--advance-clock 120s]
 */

import { config } from 'dotenv';
import { resolve } from 'path';
// .env.local first so it overrides .env when present (local dev stack).
// dotenv defaults to "first wins"; missing files are ignored silently.
config({ path: resolve(__dirname, '../../../.env.local') });
config({ path: resolve(__dirname, '../../../.env') });
import 'reflect-metadata';
import { setupDependencyInjection, container } from '../../infrastructure/config/di-container';
import { ScenarioCommand } from './commands/ScenarioCommand';
import { logger } from '../../infrastructure/logging/logger';

setupDependencyInjection();

async function main(): Promise<void> {
    try {
        const command = container.resolve(ScenarioCommand);
        const exitCode = await command.execute(process.argv);
        process.exit(exitCode);
    } catch (error) {
        logger.error('match:scenario failed', {
            error: error instanceof Error ? error.message : String(error),
        });
        process.exit(1);
    }
}

main();
