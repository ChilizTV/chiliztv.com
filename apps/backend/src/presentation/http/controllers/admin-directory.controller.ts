import { Request, Response, NextFunction } from 'express';
import { container, injectable } from 'tsyringe';

import { AdminAggregatePageQuerySchema } from '@chiliztv/shared/dto/admin/AdminDirectoryDtos';
import type {
    PlayerAggregate,
    StreamerAggregate,
} from '@chiliztv/domain/admin/repositories/IAdminDirectoryRepository';
import type { BetWithMatchInfo } from '@chiliztv/domain/blockchain-indexing/entities/BetWithMatchInfo';

import { ListPlayersUseCase } from '../../../application/admin/use-cases/ListPlayersUseCase';
import { GetPlayerDetailUseCase } from '../../../application/admin/use-cases/GetPlayerDetailUseCase';
import { ListStreamersUseCase } from '../../../application/admin/use-cases/ListStreamersUseCase';
import { ListAdminMatchesUseCase } from '../../../application/admin/use-cases/ListAdminMatchesUseCase';

// Dates may be Date or ISO string after a Redis round-trip — normalize both.
function toIso(value: Date | string | null): string | null {
    return value === null ? null : new Date(value).toISOString();
}

function serializePlayer(p: PlayerAggregate) {
    return {
        wallet: p.wallet,
        betCount: p.betCount,
        totalStaked: p.totalStaked,
        totalPayout: p.totalPayout,
        wonCount: p.wonCount,
        lostCount: p.lostCount,
        pendingCount: p.pendingCount,
        lastBetAt: toIso(p.lastBetAt),
    };
}

function serializeStreamer(s: StreamerAggregate) {
    return {
        wallet: s.wallet,
        donationCount: s.donationCount,
        donationTotal: s.donationTotal,
        subCount: s.subCount,
        subRevenue: s.subRevenue,
        lastActivityAt: toIso(s.lastActivityAt),
    };
}

function serializeBet(entry: BetWithMatchInfo) {
    const { bet, match, marketContext } = entry;
    return {
        contractAddress: bet.contractAddress,
        marketId: bet.marketId.toString(),
        outcome: bet.outcome.toString(),
        stakeAmount: bet.stakeAmount.toString(),
        payoutAmount: bet.payoutAmount?.toString() ?? null,
        status: bet.status,
        placedAt: bet.placedAt.toISOString(),
        claimedAt: bet.claimedAt?.toISOString() ?? null,
        match: match
            ? {
                  homeTeamName: match.homeTeamName,
                  awayTeamName: match.awayTeamName,
                  leagueName: match.leagueName,
                  matchDate: match.matchDate.toISOString(),
                  status: match.status,
              }
            : null,
        marketContext,
    };
}

@injectable()
export class AdminDirectoryController {
    async players(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { limit, offset } = AdminAggregatePageQuerySchema.parse(req.query);
            const page = await container.resolve(ListPlayersUseCase).execute(limit, offset);
            res.json({ success: true, data: { items: page.items.map(serializePlayer), total: page.total } });
        } catch (err) {
            next(err);
        }
    }

    async player(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const detail = await container.resolve(GetPlayerDetailUseCase).execute(req.params.wallet);
            res.json({
                success: true,
                data: {
                    player: serializePlayer(detail.player),
                    recentBets: detail.recentBets.map(serializeBet),
                },
            });
        } catch (err) {
            next(err);
        }
    }

    async streamers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { limit, offset } = AdminAggregatePageQuerySchema.parse(req.query);
            const page = await container.resolve(ListStreamersUseCase).execute(limit, offset);
            res.json({ success: true, data: { items: page.items.map(serializeStreamer), total: page.total } });
        } catch (err) {
            next(err);
        }
    }

    async matches(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const items = await container.resolve(ListAdminMatchesUseCase).execute();
            res.json({ success: true, data: { items } });
        } catch (err) {
            next(err);
        }
    }
}
