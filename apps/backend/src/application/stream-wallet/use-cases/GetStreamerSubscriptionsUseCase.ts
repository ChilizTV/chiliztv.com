import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { Subscription, type SubscriptionProps } from '@chiliztv/domain/stream-wallet/entities/Subscription';
import { IStreamWalletRepository } from '@chiliztv/domain/stream-wallet/repositories/IStreamWalletRepository';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import { StreamWalletCacheKeys, StreamWalletCacheTtl } from '../StreamWalletCacheKeys';

export interface GetStreamerSubscriptionsQuery {
  readonly streamerAddress: string;
  readonly limit: number;
  readonly offset: number;
}

export interface GetStreamerSubscriptionsResult {
  readonly items: Subscription[];
  readonly total: number;
}

interface CachedPage {
  readonly items: SubscriptionProps[];
  readonly total: number;
}

@injectable()
export class GetStreamerSubscriptionsUseCase {
  constructor(
    @inject(TOKENS.IStreamWalletRepository)
    private readonly streamWalletRepository: IStreamWalletRepository,
    @inject(TOKENS.ICacheService)
    private readonly cache: ICacheService,
  ) {}

  async execute(query: GetStreamerSubscriptionsQuery): Promise<GetStreamerSubscriptionsResult> {
    const cached = await this.cache.getOrLoad<CachedPage>({
      key: StreamWalletCacheKeys.subscriptionsByStreamer(query.streamerAddress, query.limit, query.offset),
      ttlSeconds: StreamWalletCacheTtl.listSeconds,
      jitterPct: StreamWalletCacheTtl.jitterPct,
      loader: async () => {
        const [items, total] = await Promise.all([
          this.streamWalletRepository.findSubscriptionsByStreamer(query.streamerAddress, {
            limit: query.limit,
            offset: query.offset,
          }),
          this.streamWalletRepository.countSubscriptionsByStreamer(query.streamerAddress),
        ]);
        return { items: items.map((s) => s.toJSON() as SubscriptionProps), total };
      },
    });
    const page = cached ?? { items: [], total: 0 };
    return {
      items: page.items.map((p) => Subscription.reconstitute(p)),
      total: page.total,
    };
  }
}
