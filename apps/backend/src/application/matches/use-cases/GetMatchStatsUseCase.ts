import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IMatchRepository, MatchStats } from '@chiliztv/domain/matches/repositories/IMatchRepository';

@injectable()
export class GetMatchStatsUseCase {
  constructor(
    @inject(TOKENS.IMatchRepository)
    private readonly matchRepository: IMatchRepository
  ) {}

  async execute(): Promise<MatchStats> {
    return await this.matchRepository.getStats();
  }
}
