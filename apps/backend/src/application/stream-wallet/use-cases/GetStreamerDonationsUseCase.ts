import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { Donation, type DonationProps } from '@chiliztv/domain/stream-wallet/entities/Donation';
import { IStreamWalletRepository } from '@chiliztv/domain/stream-wallet/repositories/IStreamWalletRepository';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import { StreamWalletCacheKeys, StreamWalletCacheTtl } from '../StreamWalletCacheKeys';

export interface GetStreamerDonationsQuery {
  readonly streamerAddress: string;
  readonly limit: number;
  readonly offset: number;
}

export interface GetStreamerDonationsResult {
  readonly items: Donation[];
  readonly total: number;
}

interface CachedPage {
  readonly items: DonationProps[];
  readonly total: number;
}

@injectable()
export class GetStreamerDonationsUseCase {
  constructor(
    @inject(TOKENS.IStreamWalletRepository)
    private readonly streamWalletRepository: IStreamWalletRepository,
    @inject(TOKENS.ICacheService)
    private readonly cache: ICacheService,
  ) {}

  async execute(query: GetStreamerDonationsQuery): Promise<GetStreamerDonationsResult> {
    const cached = await this.cache.getOrLoad<CachedPage>({
      key: StreamWalletCacheKeys.donationsByStreamer(query.streamerAddress, query.limit, query.offset),
      ttlSeconds: StreamWalletCacheTtl.listSeconds,
      jitterPct: StreamWalletCacheTtl.jitterPct,
      loader: async () => {
        const [items, total] = await Promise.all([
          this.streamWalletRepository.findDonationsByStreamer(query.streamerAddress, {
            limit: query.limit,
            offset: query.offset,
          }),
          this.streamWalletRepository.countDonationsByStreamer(query.streamerAddress),
        ]);
        return { items: items.map((d) => d.toJSON() as DonationProps), total };
      },
    });
    const page = cached ?? { items: [], total: 0 };
    return {
      items: page.items.map((p) => Donation.reconstitute(p)),
      total: page.total,
    };
  }
}
