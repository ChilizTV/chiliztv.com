import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { Match } from '@chiliztv/domain/matches/entities/Match';
import { IMatchRepository } from '@chiliztv/domain/matches/repositories/IMatchRepository';
import { MatchFetchWindow } from '@chiliztv/domain/matches/value-objects/MatchFetchWindow';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';

@injectable()
export class GetAllMatchesUseCase {
  constructor(
    @inject(TOKENS.IMatchRepository)
    private readonly matchRepository: IMatchRepository,
    @inject(TOKENS.IClock)
    private readonly clock: IClock,
  ) {}

  async execute(): Promise<Match[]> {
    const now = this.clock.now();
    return await this.matchRepository.findFromDate(
      MatchFetchWindow.displayFrom(now),
    );
  }
}
