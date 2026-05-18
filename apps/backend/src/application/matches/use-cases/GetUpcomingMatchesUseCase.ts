import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { Match, MatchProps } from '@chiliztv/domain/matches/entities/Match';
import { IMatchRepository } from '@chiliztv/domain/matches/repositories/IMatchRepository';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import { MatchCacheKeys, MatchCacheTtl } from '../MatchCacheKeys';

@injectable()
export class GetUpcomingMatchesUseCase {
  constructor(
    @inject(TOKENS.IMatchRepository)
    private readonly matchRepository: IMatchRepository,
    @inject(TOKENS.ICacheService)
    private readonly cache: ICacheService,
  ) {}

  async execute(): Promise<Match[]> {
    const props = await this.cache.getOrLoad<readonly MatchProps[]>({
      key: MatchCacheKeys.listUpcoming,
      ttlSeconds: MatchCacheTtl.listSeconds,
      jitterPct: MatchCacheTtl.jitterPct,
      loader: async () => {
        const matches = await this.matchRepository.findUpcoming();
        return matches.map((m) => m.toRaw());
      },
    });
    return (props ?? []).map((p) => Match.reconstitute(p));
  }
}
