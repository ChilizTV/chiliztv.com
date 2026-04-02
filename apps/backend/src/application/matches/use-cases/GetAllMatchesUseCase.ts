import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { Match } from '@chiliztv/domain/matches/entities/Match';
import { IMatchRepository } from '@chiliztv/domain/matches/repositories/IMatchRepository';
import { MatchFetchWindow } from '@chiliztv/domain/matches/value-objects/MatchFetchWindow';

@injectable()
export class GetAllMatchesUseCase {
  constructor(
    @inject(TOKENS.IMatchRepository)
    private readonly matchRepository: IMatchRepository
  ) {}

  async execute(): Promise<Match[]> {
    const now = new Date();
    return await this.matchRepository.findByDateRange(
      MatchFetchWindow.fetchFrom(now),
      MatchFetchWindow.fetchTo(now),
    );
  }
}
