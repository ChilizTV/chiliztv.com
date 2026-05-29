import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IMatchRepository } from '@chiliztv/domain/matches/repositories/IMatchRepository';
import { IBlockchainService } from '@chiliztv/domain/shared/ports/IBlockchainService';
import {
    classifyStatus,
    isBettable,
    type BettableResult,
} from '@chiliztv/domain/matches/policies/BettablePolicy';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import { logger } from '../../../infrastructure/logging/logger';

export interface CloseLiveMatchesMarketsResult {
    scanned: number;
    closed: number;
    cancelled: number;
    errors: number;
}

/**
 * Ferme on-chain les markets `Open` des matches devenus non-bettables.
 * - `live` / `finished` / `KICKOFF_BUFFER` → `closeMarketsBatch` (terminal).
 * - `blocked` (CANC/ABD) → `cancelMarket` (ouvre les refunds).
 * - `blocked` (PST) → `closeMarketsBatch` (le match peut être reprogrammé,
 *   on garde l'option de cancel manuel).
 *
 * Idempotent : le contrat skip les markets déjà non-Open.
 */
@injectable()
export class CloseLiveMatchesMarketsUseCase {
    private static readonly DEFAULT_KICKOFF_BUFFER_SEC = 120;

    constructor(
        @inject(TOKENS.IMatchRepository)
        private readonly matchRepository: IMatchRepository,
        @inject(TOKENS.IBlockchainService)
        private readonly blockchainService: IBlockchainService,
        @inject(TOKENS.IClock)
        private readonly clock: IClock,
    ) {}

    async execute(): Promise<CloseLiveMatchesMarketsResult> {
        const kickoffBufferSec = readBufferFromEnv() ?? CloseLiveMatchesMarketsUseCase.DEFAULT_KICKOFF_BUFFER_SEC;
        const now = this.clock.now();
        // DB-side filter via partial index `idx_matches_status_date`
        // (migration 031). Cuts the candidate set from "every match in the
        // 7-day window" to ~10-20% — typically 10-30 rows steady state.
        const candidates = await this.matchRepository.findOpenContractsCandidates(now, kickoffBufferSec);

        let scanned = 0;
        let closed = 0;
        let cancelled = 0;
        let errors = 0;

        for (const match of candidates) {
            const json = match.toJSON();
            // Defensive: DB filter already excludes null contracts, but a
            // race between sync (which writes the contract) and this read
            // could surface a NULL — keep the guard.
            const contract = json.bettingContractAddress;
            if (!contract || String(contract).trim() === '') continue;

            const kind = classifyStatus(json.status);
            // Skip explicitement les états terminaux pour limiter les appels RPC.
            // `finished` est géré par ResolveFinishedMatchesUseCase ; on évite
            // de doubler le travail.
            if (kind === 'finished') continue;

            const matchDate = json.matchDate;
            if (!matchDate) continue;

            const verdict: BettableResult = isBettable(
                { status: json.status, kickoffAt: matchDate as Date | string },
                now,
                { kickoffBufferSec },
            );
            if (verdict.ok) continue;

            scanned++;
            try {
                if (kind === 'blocked' && (json.status === 'CANC' || json.status === 'ABD')) {
                    const r = await this.blockchainService.cancelOpenMarketsForMatch(
                        contract,
                        `Match ${json.status}`,
                    );
                    cancelled += r.cancelled;
                    if (r.cancelled > 0) {
                        logger.info('Markets cancelled (match status)', {
                            matchId: json.id, contract, status: json.status, cancelled: r.cancelled,
                        });
                    }
                } else {
                    const r = await this.blockchainService.closeOpenMarketsForMatch(contract);
                    closed += r.closed;
                    if (r.closed > 0) {
                        logger.info('Markets closed (match no longer bettable)', {
                            matchId: json.id, contract, status: json.status, reason: verdict.reason, closed: r.closed,
                        });
                    }
                }
            } catch (err) {
                errors++;
                logger.warn('CloseLiveMatchesMarketsUseCase: per-match failure', {
                    matchId: json.id,
                    contract,
                    error: err instanceof Error ? err.message : String(err),
                });
            }
        }

        return { scanned, closed, cancelled, errors };
    }
}

function readBufferFromEnv(): number | null {
    const raw = process.env.CLOSE_LIVE_JOB_BUFFER_SEC;
    if (!raw) return null;
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) return null;
    return n;
}
