import { injectable, inject } from 'tsyringe';
import { Match } from '@chiliztv/domain/matches/entities/Match';
import { IMatchRepository } from '@chiliztv/domain/matches/repositories/IMatchRepository';

@injectable()
export class GetMatchesByLeagueUseCase {
  constructor(
    @inject('IMatchRepository')
    private readonly matchRepository: IMatchRepository
  ) {}

  async execute(leagueId: number): Promise<Match[]> {
    return await this.matchRepository.findByLeagueId(leagueId);
  }
}
