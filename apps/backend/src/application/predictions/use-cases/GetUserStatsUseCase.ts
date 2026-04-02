import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IPredictionRepository, UserPredictionStats } from '@chiliztv/domain/predictions/repositories/IPredictionRepository';

@injectable()
export class GetUserStatsUseCase {
  constructor(
    @inject(TOKENS.IPredictionRepository)
    private readonly predictionRepository: IPredictionRepository
  ) {}

  async execute(userId: string, walletAddress: string): Promise<UserPredictionStats> {
    const stats = await this.predictionRepository.getUserStats(userId, walletAddress);

    if (!stats) {
      return {
        userId,
        walletAddress,
        totalPredictions: 0,
        totalWins: 0,
        totalLosses: 0,
        activePredictions: 0,
        winRate: 0,
      };
    }

    return stats;
  }
}
