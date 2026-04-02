import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { Match } from '@chiliztv/domain/matches/entities/Match';
import { IMatchRepository } from '@chiliztv/domain/matches/repositories/IMatchRepository';
import { NotFoundError } from '@chiliztv/domain/shared/errors/NotFoundError';

@injectable()
export class GetMatchByIdUseCase {
  constructor(
    @inject(TOKENS.IMatchRepository)
    private readonly matchRepository: IMatchRepository
  ) {}

  async execute(apiFootballId: number): Promise<Match> {
    const match = await this.matchRepository.findByApiFootballId(apiFootballId);

    if (!match) {
      throw new NotFoundError('Match', apiFootballId);
    }

    return match;
  }
}
