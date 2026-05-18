import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IFanTokenRepository, UserTokenBalance } from '@chiliztv/domain/fan-tokens/repositories/IFanTokenRepository';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';

const TTL_SECONDS = 60;
const JITTER_PCT = 15;

@injectable()
export class GetUserFanTokenBalancesUseCase {
  constructor(
    @inject(TOKENS.IFanTokenRepository)
    private readonly fanTokenRepository: IFanTokenRepository,
    @inject(TOKENS.ICacheService)
    private readonly cache: ICacheService,
  ) {}

  async execute(walletAddress: string): Promise<UserTokenBalance> {
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }
    const wallet = walletAddress.toLowerCase();
    // Cache per-wallet for 60 s. Balances change only on user tx, so the
    // front re-triggers via refetchOnMutation post-tx; intra-user idle
    // refetches are absorbed by this layer, sparing the Chiliz RPC quota
    // (50 req/s plafond observed).
    const cached = await this.cache.getOrLoad<UserTokenBalance>({
      key: `fantoken:balances:${wallet}`,
      ttlSeconds: TTL_SECONDS,
      jitterPct: JITTER_PCT,
      loader: () => this.fanTokenRepository.getUserBalances(wallet),
    });
    return cached ?? this.fanTokenRepository.getUserBalances(wallet);
  }
}
