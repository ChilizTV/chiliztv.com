import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { BetCounts, BetFilter, IBetRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IBetRepository';
import { BetWithMatchInfo } from '@chiliztv/domain/blockchain-indexing/entities/BetWithMatchInfo';

export interface GetUserBetsQuery {
    readonly userAddress: string;
    readonly limit: number;
    readonly offset: number;
    readonly filter?: BetFilter;
}

export interface GetUserBetsResult {
    readonly items: BetWithMatchInfo[];
    /** Total rows matching the filter — independent of limit/offset. */
    readonly total: number;
    /** Counts per filter bucket — feeds the My Bets `TabPill` badges. */
    readonly statusCounts: BetCounts;
}

@injectable()
export class GetUserBetsUseCase {
    constructor(
        @inject(TOKENS.IBetRepository)
        private readonly bets: IBetRepository,
    ) {}

    async execute(query: GetUserBetsQuery): Promise<GetUserBetsResult> {
        // Listing + total + per-status counts in parallel. statusCounts ignores
        // limit/offset by design — that's the count behind the `TabPill` badges.
        const [items, total, statusCounts] = await Promise.all([
            this.bets.findByUserWithMatchInfo(query.userAddress, {
                limit: query.limit,
                offset: query.offset,
                filter: query.filter,
            }),
            this.bets.countByUser(query.userAddress, query.filter),
            this.bets.countByUserStatuses(query.userAddress),
        ]);

        // No self-heal needed: PariMatchBase emits MarketCreated with the full
        // payload (marketType + line + maxOutcome) at addMarketWithLine time,
        // so the indexer never has to synthesize the row.
        return { items, total, statusCounts };
    }
}
