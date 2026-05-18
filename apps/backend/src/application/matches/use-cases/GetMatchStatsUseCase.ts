import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IMatchRepository, MatchStats } from '@chiliztv/domain/matches/repositories/IMatchRepository';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import { MatchCacheKeys, MatchCacheTtl } from '../MatchCacheKeys';

@injectable()
export class GetMatchStatsUseCase {
  constructor(
    @inject(TOKENS.IMatchRepository)
    private readonly matchRepository: IMatchRepository,
    @inject(TOKENS.ICacheService)
    private readonly cache: ICacheService,
  ) {}

  async execute(): Promise<MatchStats> {
    const stats = await this.cache.getOrLoad<MatchStats>({
      key: MatchCacheKeys.statsSummary,
      ttlSeconds: MatchCacheTtl.statsSeconds,
      jitterPct: MatchCacheTtl.jitterPct,
      loader: () => this.matchRepository.getStats(),
    });
    // getStats never returns null (aggregator always responds); the ?? guards
    // strict mode without changing observable behaviour.
    return stats ?? { totalMatches: 0, liveMatches: 0, upcomingMatches: 0, finishedMatches: 0 };
  }
}
