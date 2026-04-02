import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { Donation } from '@chiliztv/domain/stream-wallet/entities/Donation';
import { IStreamWalletRepository } from '@chiliztv/domain/stream-wallet/repositories/IStreamWalletRepository';

@injectable()
export class GetStreamerDonationsUseCase {
  constructor(
    @inject(TOKENS.IStreamWalletRepository)
    private readonly streamWalletRepository: IStreamWalletRepository
  ) {}

  async execute(streamerAddress: string): Promise<Donation[]> {
    return await this.streamWalletRepository.findDonationsByStreamer(streamerAddress);
  }
}
