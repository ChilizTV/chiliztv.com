import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IFanTokenRepository, UserTokenBalance } from '@chiliztv/domain/fan-tokens/repositories/IFanTokenRepository';
@injectable()
export class GetUserFanTokenBalancesUseCase {
  constructor(
    @inject(TOKENS.IFanTokenRepository)
    private readonly fanTokenRepository: IFanTokenRepository
  ) {}

  async execute(walletAddress: string): Promise<UserTokenBalance> {
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }
    return this.fanTokenRepository.getUserBalances(walletAddress);
  }
}
