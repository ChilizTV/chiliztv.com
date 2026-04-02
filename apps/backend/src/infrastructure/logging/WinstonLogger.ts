import { injectable } from 'tsyringe';
import { ILogger } from '@chiliztv/domain/shared/ports/ILogger';
import { logger } from './logger';

/**
 * WinstonLogger
 * Implements ILogger port, wrapping the shared Winston instance.
 * Registered in DI as TOKENS.ILogger — use this instead of importing
 * `logger` directly in application or infrastructure classes.
 */
@injectable()
export class WinstonLogger implements ILogger {
    info(message: string, meta?: Record<string, unknown>): void {
        logger.info(message, meta);
    }

    warn(message: string, meta?: Record<string, unknown>): void {
        logger.warn(message, meta);
    }

    error(message: string, meta?: Record<string, unknown>): void {
        logger.error(message, meta);
    }

    debug(message: string, meta?: Record<string, unknown>): void {
        logger.debug(message, meta);
    }
}
