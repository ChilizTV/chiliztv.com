import { injectable, inject } from 'tsyringe';
import { createHash } from 'node:crypto';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IAccessCodeVerifier } from '@chiliztv/domain/access/ports/IAccessCodeVerifier';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';

export interface RedeemResult {
  granted: boolean;
}

const IDEMPOTENCY_TTL_SECONDS = 60;

/**
 * Idempotent code redemption.
 *
 * Hashing rule (cf. docs/plans/redis-integration.md §2.16): the dedup hash
 * is computed from the lowercased code only. Including a per-request
 * identifier would defeat dedup on legitimate client retries — each retry
 * carries a fresh request id and would create a distinct cache slot.
 *
 * On contention the second caller waits up to ~1 s for the first one to
 * land its result and returns the same answer. If Redis is unavailable the
 * NoopCacheService passes through, so the verifier runs synchronously like
 * before the migration.
 */
@injectable()
export class RedeemAccessCodeUseCase {
  constructor(
    @inject(TOKENS.IAccessCodeVerifier)
    private readonly verifier: IAccessCodeVerifier,
    @inject(TOKENS.ICacheService)
    private readonly cache: ICacheService,
  ) {}

  async execute(code: string): Promise<RedeemResult> {
    const key = `idem:access:${sha256(code.toLowerCase())}`;
    const cached = await this.cache.get<RedeemResult>(key);
    if (cached.hit) return cached.value;
    const result = await this.cache.getOrLoad<RedeemResult>({
      key,
      ttlSeconds: IDEMPOTENCY_TTL_SECONDS,
      loader: async () => {
        const granted = await this.verifier.verify(code);
        return { granted };
      },
    });
    return result ?? { granted: false };
  }
}

function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}
