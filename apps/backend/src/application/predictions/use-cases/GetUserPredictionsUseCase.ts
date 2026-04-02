import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { Prediction } from '@chiliztv/domain/predictions/entities/Prediction';
import { IPredictionRepository } from '@chiliztv/domain/predictions/repositories/IPredictionRepository';

@injectable()
export class GetUserPredictionsUseCase {
  constructor(
    @inject(TOKENS.IPredictionRepository)
    private readonly predictionRepository: IPredictionRepository
  ) {}

  async execute(userId: string, walletAddress: string, limit: number = 50, offset: number = 0): Promise<Prediction[]> {
    return await this.predictionRepository.findByUserId(userId, walletAddress, limit, offset);
  }
}
