import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { Prediction } from '@chiliztv/domain/predictions/entities/Prediction';
import { IPredictionRepository } from '@chiliztv/domain/predictions/repositories/IPredictionRepository';
import { TransactionHash } from '@chiliztv/domain/predictions/value-objects/TransactionHash';
import { Odds } from '@chiliztv/domain/predictions/value-objects/Odds';
import { PredictionStatus } from '@chiliztv/domain/predictions/value-objects/PredictionStatus';
import { CreatePredictionDto } from '@chiliztv/shared/dto/predictions/CreatePredictionDto';
import { ConflictError } from '@chiliztv/domain/shared/errors/ConflictError';
import { v4 as uuidv4 } from 'uuid';

@injectable()
export class CreatePredictionUseCase {
  constructor(
    @inject(TOKENS.IPredictionRepository)
    private readonly predictionRepository: IPredictionRepository
  ) {}

  async execute(dto: CreatePredictionDto): Promise<Prediction> {
    const transactionHash = TransactionHash.create(dto.transactionHash);

    const existing = await this.predictionRepository.findByTransactionHash(transactionHash);
    if (existing) {
      throw new ConflictError('Prediction already exists for this transaction');
    }

    const odds = Odds.create(dto.odds);

    const prediction = Prediction.create({
      id: uuidv4(),
      userId: dto.userId,
      walletAddress: dto.walletAddress,
      username: dto.username,
      matchId: dto.matchId,
      matchName: dto.matchName,
      predictionType: dto.predictionType,
      predictionValue: dto.predictionValue,
      predictedTeam: dto.predictedTeam,
      odds,
      status: PredictionStatus.PENDING,
      transactionHash,
      matchStartTime: dto.matchStartTime,
    });

    return await this.predictionRepository.save(prediction);
  }
}
