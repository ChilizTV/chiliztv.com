import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { GetUserBetsUseCase } from '../../../application/bets/use-cases/GetUserBetsUseCase';
import { BetWithMatchInfo } from '@chiliztv/domain/blockchain-indexing/entities/BetWithMatchInfo';
import { BetStatus } from '@chiliztv/domain/blockchain-indexing/entities/Bet';

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const ALLOWED_STATUS = new Set<BetStatus>(['PENDING', 'WON', 'LOST', 'REFUNDED']);
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

function serializeBet(entry: BetWithMatchInfo): Record<string, unknown> {
    const { bet, match, marketContext } = entry;
    return {
        txHash: bet.coordinates.transactionHash,
        logIndex: bet.coordinates.logIndex,
        contractAddress: bet.contractAddress,
        marketId: bet.marketId.toString(),
        betIndex: bet.betIndex.toString(),
        userAddress: bet.userAddress,
        selection: bet.selection.toString(),
        netStake: bet.netStake.toString(),
        grossStake: bet.grossStake?.toString() ?? null,
        oddsX10000: bet.oddsX10000,
        oddsIndex: bet.oddsIndex,
        status: bet.status,
        payout: bet.payout?.toString() ?? null,
        refundAmount: bet.refundAmount?.toString() ?? null,
        blockNumber: bet.coordinates.blockNumber.toString(),
        blockTimestamp: bet.coordinates.blockTimestamp.toISOString(),
        placedAt: bet.placedAt.toISOString(),
        resolvedAt: bet.resolvedAt?.toISOString() ?? null,
        claimedAt: bet.claimedAt?.toISOString() ?? null,
        refundedAt: bet.refundedAt?.toISOString() ?? null,
        // Market context (Lot 5) — short-name string ("WINNER", "GOALS_TOTAL"…)
        // and tenths-of-goal `line` (25 = 2.5). Null when MarketCreated event
        // wasn't indexed for this market — front falls back to `Selection #N`.
        marketType: marketContext?.marketType ?? null,
        line: marketContext?.line ?? null,
        match: match
            ? {
                  apiFootballId: match.apiFootballId,
                  homeTeamName: match.homeTeamName,
                  awayTeamName: match.awayTeamName,
                  leagueName: match.leagueName,
                  matchDate: match.matchDate.toISOString(),
              }
            : null,
    };
}

@injectable()
export class BetController {
    constructor(
        @inject(GetUserBetsUseCase)
        private readonly getUserBetsUseCase: GetUserBetsUseCase,
    ) {}

    async getUserBets(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userParam = (req.query.user as string | undefined)?.trim();
            if (!userParam || !ADDRESS_REGEX.test(userParam)) {
                res.status(400).json({ success: false, error: 'Missing or invalid `user` query parameter (expected 0x-prefixed address).' });
                return;
            }

            const statusParam = req.query.status as string | undefined;
            let status: BetStatus | undefined;
            if (statusParam !== undefined && statusParam !== '' && statusParam !== 'all') {
                const upper = statusParam.toUpperCase() as BetStatus;
                if (!ALLOWED_STATUS.has(upper)) {
                    res.status(400).json({ success: false, error: 'Invalid `status` filter. Use PENDING | WON | LOST | REFUNDED.' });
                    return;
                }
                status = upper;
            }

            const rawLimit = Number(req.query.limit ?? DEFAULT_LIMIT);
            const rawOffset = Number(req.query.offset ?? 0);
            const limit = Math.min(MAX_LIMIT, Math.max(1, Number.isFinite(rawLimit) ? Math.floor(rawLimit) : DEFAULT_LIMIT));
            const offset = Math.max(0, Number.isFinite(rawOffset) ? Math.floor(rawOffset) : 0);

            const bets = await this.getUserBetsUseCase.execute({
                userAddress: userParam.toLowerCase(),
                limit,
                offset,
                status,
            });

            res.json({
                success: true,
                bets: bets.map(serializeBet),
                count: bets.length,
                limit,
                offset,
                timestamp: Date.now(),
            });
        } catch (error) {
            next(error);
        }
    }
}
