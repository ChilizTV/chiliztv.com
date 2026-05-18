import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { Match, MatchProps } from '@chiliztv/domain/matches/entities/Match';
import { IMatchRepository } from '@chiliztv/domain/matches/repositories/IMatchRepository';
import { NotFoundError } from '@chiliztv/domain/shared/errors/NotFoundError';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import { MatchCacheKeys, MatchCacheTtl } from '../MatchCacheKeys';

@injectable()
export class GetMatchByIdUseCase {
  constructor(
    @inject(TOKENS.IMatchRepository)
    private readonly matchRepository: IMatchRepository,
    @inject(TOKENS.ICacheService)
    private readonly cache: ICacheService,
  ) {}

  async execute(apiFootballId: number): Promise<Match> {
    const props = await this.cache.getOrLoad<MatchProps>({
      key: MatchCacheKeys.single(apiFootballId),
      ttlSeconds: MatchCacheTtl.singleSeconds,
      jitterPct: MatchCacheTtl.jitterPct,
      // Negative caching is short — a freshly-created match must be visible
      // within ~SyncMatchesJob latency, not ~singleSeconds.
      negativeTtlSeconds: 10,
      loader: async () => {
        const match = await this.matchRepository.findByApiFootballId(apiFootballId);
        return match ? match.toRaw() : null;
      },
    });

    if (!props) {
      throw new NotFoundError('Match', apiFootballId);
    }

    return Match.reconstitute(props);
  }
}
