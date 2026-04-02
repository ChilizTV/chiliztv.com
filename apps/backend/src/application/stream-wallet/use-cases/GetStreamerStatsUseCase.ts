import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IStreamWalletRepository, StreamerStats } from '@chiliztv/domain/stream-wallet/repositories/IStreamWalletRepository';

@injectable()
export class GetStreamerStatsUseCase {
  constructor(
    @inject(TOKENS.IStreamWalletRepository)
    private readonly streamWalletRepository: IStreamWalletRepository
  ) {}

  async execute(streamerAddress: string): Promise<StreamerStats> {
    return await this.streamWalletRepository.getStreamerStats(streamerAddress);
  }
}
