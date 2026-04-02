import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { Subscription } from '@chiliztv/domain/stream-wallet/entities/Subscription';
import { IStreamWalletRepository } from '@chiliztv/domain/stream-wallet/repositories/IStreamWalletRepository';

@injectable()
export class GetStreamerSubscriptionsUseCase {
  constructor(
    @inject(TOKENS.IStreamWalletRepository)
    private readonly streamWalletRepository: IStreamWalletRepository
  ) {}

  async execute(streamerAddress: string): Promise<Subscription[]> {
    return await this.streamWalletRepository.findSubscriptionsByStreamer(streamerAddress);
  }
}
