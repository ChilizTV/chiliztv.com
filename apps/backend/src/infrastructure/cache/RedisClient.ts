import IORedis, { type Redis } from 'ioredis';
import { URL } from 'node:url';
import type { ILogger } from '@chiliztv/domain/shared/ports/ILogger';

const LUA_RELEASE_LOCK = `
if redis.call("GET", KEYS[1]) == ARGV[1] then
  return redis.call("DEL", KEYS[1])
else
  return 0
end
`;

const LUA_RENEW_LOCK = `
if redis.call("GET", KEYS[1]) == ARGV[1] then
  return redis.call("PEXPIRE", KEYS[1], ARGV[2])
else
  return 0
end
`;

/**
 * Augments the ioredis client with the project's pre-loaded Lua scripts so
 * callers can use EVALSHA via the typed methods instead of inlining EVAL.
 * ioredis transparently uploads each script on first call (SCRIPT LOAD) and
 * re-uploads on NOSCRIPT.
 */
export interface RedisClient extends Redis {
  releaseCacheLock(key: string, token: string): Promise<number>;
  renewCacheLock(key: string, token: string, ttlMs: number): Promise<number>;
}

export function createRedisClient(url: string, logger: ILogger): RedisClient {
  const useTls = url.startsWith('rediss://');
  const hostname = new URL(url).hostname;

  const client = new IORedis(url, {
    lazyConnect: false,
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    retryStrategy: (times) => Math.min(times * 200, 30_000),
    reconnectOnError: (err) => err.message.includes('READONLY'),
    tls: useTls ? { servername: hostname } : undefined,
    keepAlive: 30_000,
    connectTimeout: 10_000,
    commandTimeout: 5_000,
    enableOfflineQueue: false,
    showFriendlyErrorStack: process.env.NODE_ENV !== 'production',
  });

  client.defineCommand('releaseCacheLock', {
    numberOfKeys: 1,
    lua: LUA_RELEASE_LOCK,
  });
  client.defineCommand('renewCacheLock', {
    numberOfKeys: 1,
    lua: LUA_RENEW_LOCK,
  });

  client.on('connect', () => logger.info('Redis connecting', { host: hostname }));
  client.on('ready', () => logger.info('Redis ready', { host: hostname }));
  client.on('reconnecting', (delay: number) =>
    logger.warn('Redis reconnecting', { host: hostname, delayMs: delay }),
  );
  client.on('error', (err: Error) =>
    logger.error('Redis error', { host: hostname, message: err.message }),
  );
  client.on('end', () => logger.info('Redis connection ended', { host: hostname }));
  client.on('close', () => logger.warn('Redis connection closed', { host: hostname }));

  return client as RedisClient;
}

/**
 * Resolves once the client emits `ready`, or after `timeoutMs` (no-throw).
 * Used at boot to gate work that needs a live connection so the first tick
 * doesn't fail against an offline-queue-disabled client.
 */
export async function waitForRedisReady(
  client: Redis,
  timeoutMs = 10_000,
): Promise<void> {
  if (client.status === 'ready') return;
  await new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, timeoutMs);
    const onReady = (): void => {
      clearTimeout(timer);
      resolve();
    };
    client.once('ready', onReady);
  });
}
