import { injectable, inject } from 'tsyringe';
import { Match } from '@chiliztv/domain/matches/entities/Match';
import { IMatchRepository } from '@chiliztv/domain/matches/repositories/IMatchRepository';

@injectable()
export class GetUpcomingMatchesUseCase {
  constructor(
    @inject('IMatchRepository')
    private readonly matchRepository: IMatchRepository
  ) {}

  async execute(): Promise<Match[]> {
    return await this.matchRepository.findUpcoming();
  }
}
