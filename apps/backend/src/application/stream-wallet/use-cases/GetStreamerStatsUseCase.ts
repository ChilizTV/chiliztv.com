import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IStreamWalletRepository, StreamerStats } from '@chiliztv/domain/stream-wallet/repositories/IStreamWalletRepository';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import { StreamWalletCacheKeys, StreamWalletCacheTtl } from '../StreamWalletCacheKeys';

@injectable()
export class GetStreamerStatsUseCase {
  constructor(
    @inject(TOKENS.IStreamWalletRepository)
    private readonly streamWalletRepository: IStreamWalletRepository,
    @inject(TOKENS.ICacheService)
    private readonly cache: ICacheService,
  ) {}

  async execute(streamerAddress: string): Promise<StreamerStats> {
    const cached = await this.cache.getOrLoad<StreamerStats>({
      key: StreamWalletCacheKeys.streamerStats(streamerAddress),
      ttlSeconds: StreamWalletCacheTtl.statsSeconds,
      jitterPct: StreamWalletCacheTtl.jitterPct,
      loader: () => this.streamWalletRepository.getStreamerStats(streamerAddress),
    });
    return cached ?? this.streamWalletRepository.getStreamerStats(streamerAddress);
  }
}
