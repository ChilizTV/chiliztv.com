import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { Match } from '@chiliztv/domain/matches/entities/Match';
import { IMatchRepository } from '@chiliztv/domain/matches/repositories/IMatchRepository';

@injectable()
export class GetMatchesByLeagueUseCase {
  constructor(
    @inject(TOKENS.IMatchRepository)
    private readonly matchRepository: IMatchRepository
  ) {}

  async execute(leagueId: number): Promise<Match[]> {
    return await this.matchRepository.findByLeagueId(leagueId);
  }
}
