/**
 * On-chain bet shape served by `GET /bets`. Pari-mutuel: one row per
 * `PositionTaken` event. Status transitions are driven by the indexer on
 * MarketResolved/Cancelled (status flip) and PositionClaimed/StakeRefunded
 * (claimed_at + payoutAmount).
 */

import {
    fmtSelectionWithMarket,
    MARKET_TYPE_HASHES,
    isHiddenMarket as isHiddenMarketByHash,
} from '@/lib/contracts/markets';

export type BetStatus = 'PENDING' | 'WON' | 'LOST' | 'REFUNDED';

export interface MyBet {
    readonly txHash: `0x${string}`;
    readonly logIndex: number;
    readonly contractAddress: `0x${string}`;
    readonly marketId: string;
    readonly userAddress: string;
    /** uint64 outcome index (0..maxOutcome). */
    readonly outcome: string;
    /** USDC raw — amount staked at this event. */
    readonly stakeAmount: string;
    /** Outcome pool snapshot post-stake (for historical implied probability). */
    readonly newOutcomePool: string;
    /** Total market pool snapshot post-stake. */
    readonly newTotalPool: string;
    readonly status: BetStatus;
    /** USDC raw payout — filled at claim time (WON) or refund time (REFUNDED). */
    readonly payoutAmount: string | null;
    readonly blockNumber: string;
    readonly blockTimestamp: string;
    readonly placedAt: string;
    /** Single timestamp for either claim or refund (parimutuel collapses both). */
    readonly claimedAt: string | null;
    /** Short-name market type ("WINNER", "GOALS_TOTAL"…) from MarketCreated. */
    readonly marketType: string | null;
    /** int16 line from FootballMarket (tenths of goal — 25 = 2.5). */
    readonly line: number | null;
    readonly match: {
        readonly apiFootballId: number;
        readonly homeTeamName: string;
        readonly awayTeamName: string;
        readonly leagueName: string | null;
        readonly matchDate: string;
        /** API-Football status code (NS, 1H, HT, 2H, FT…). Optional for
         *  cached payloads that predate the field. */
        readonly status?: string;
    } | null;
}

function marketTypeHashFor(marketType: string | null | undefined): string | null {
    if (!marketType) return null;
    const key = marketType as keyof typeof MARKET_TYPE_HASHES;
    return MARKET_TYPE_HASHES[key] ?? null;
}

export function isBetOnHiddenMarket(bet: Pick<MyBet, 'marketType'>): boolean {
    const hash = marketTypeHashFor(bet.marketType);
    return isHiddenMarketByHash(hash ?? undefined);
}

/** Match is over on the pitch — pending bets are now "resolving", not open. */
const FINISHED_MATCH_STATUSES: ReadonlySet<string> = new Set(['FT', 'AET', 'PEN']);

/**
 * True when the match has finished but the market hasn't been resolved
 * on-chain yet (resolver job + indexer in flight). Rendered as "Resolving"
 * instead of "Pending" so the user knows nothing is stuck.
 */
export function isAwaitingResolve(bet: Pick<MyBet, 'status' | 'match'>): boolean {
    return (
        bet.status === 'PENDING' &&
        bet.match?.status !== undefined &&
        FINISHED_MATCH_STATUSES.has(bet.match.status)
    );
}

export type BetFilter = 'all' | 'pending' | 'won' | 'lost' | 'refunded' | 'claimable' | 'refundable';

export interface BetCounts {
    readonly all: number;
    readonly pending: number;
    readonly won: number;
    readonly lost: number;
    readonly refunded: number;
    readonly claimable: number;
    readonly refundable: number;
}

export interface MyBetsResponse {
    readonly success: boolean;
    readonly bets: ReadonlyArray<MyBet>;
    readonly total: number;
    readonly statusCounts: BetCounts;
    readonly limit: number;
    readonly offset: number;
    readonly timestamp: number;
}

/** WON bet whose payout hasn't been collected. */
export function isClaimable(bet: MyBet): boolean {
    return bet.status === 'WON' && bet.claimedAt === null;
}

/** REFUNDED bet (cancelled market) whose stake hasn't been pulled back. */
export function isRefundable(bet: MyBet): boolean {
    return bet.status === 'REFUNDED' && bet.claimedAt === null;
}

export interface ClaimOverlay {
    has(key: string): boolean;
    get(key: string): { kind: 'claimed' | 'refunded' } | undefined;
}

/**
 * Overlay key — in parimutuel `claim(marketId)` settles every stake the user
 * has on the winning outcome, so the natural key is (contract, marketId).
 */
export function betOverlayKey(bet: Pick<MyBet, 'contractAddress' | 'marketId'>): string {
    return `${bet.contractAddress.toLowerCase()}:${String(bet.marketId)}`;
}

export function isLocallyClaimed(bet: MyBet, overlay: ClaimOverlay | undefined): boolean {
    if (!overlay) return false;
    // Overlay keys are (contract, marketId) — LOST rows share the key but were never claimed.
    if (bet.status !== 'WON' && bet.status !== 'REFUNDED') return false;
    return overlay.has(betOverlayKey(bet));
}

export function isClaimableNow(bet: MyBet, overlay: ClaimOverlay | undefined): boolean {
    return isClaimable(bet) && !isLocallyClaimed(bet, overlay);
}

export function isRefundableNow(bet: MyBet, overlay: ClaimOverlay | undefined): boolean {
    return isRefundable(bet) && !isLocallyClaimed(bet, overlay);
}

/**
 * Implied probability AT placement time, derived from the on-chain pool
 * snapshot embedded in the PositionTaken event. Returns null when the
 * snapshot is missing (degenerate row).
 */
export function placementImpliedProb(
    bet: Pick<MyBet, 'newOutcomePool' | 'newTotalPool'>,
): number | null {
    const total = Number(bet.newTotalPool);
    if (!Number.isFinite(total) || total <= 0) return null;
    const outcome = Number(bet.newOutcomePool);
    if (!Number.isFinite(outcome) || outcome < 0) return null;
    return outcome / total;
}

/**
 * Outcome label. When `marketType` is known, defer to the football catalog
 * for accurate per-market labels (Over 2.5, Both score: Yes, etc.). Falls
 * back to the legacy 0/1/2 → Home/Draw/Away guess.
 */
export function fmtSelection(
    outcome: string,
    homeTeamName?: string | null,
    awayTeamName?: string | null,
    marketType?: string | null,
    line?: number | null,
): string {
    const hash = marketTypeHashFor(marketType);
    if (hash) {
        // Market-qualified ("Mexico · Half-time") — bets from different
        // markets on the same match are indistinguishable otherwise.
        return fmtSelectionWithMarket(
            Number(outcome),
            hash,
            line ?? 0,
            homeTeamName ?? undefined,
            awayTeamName ?? undefined,
        );
    }
    switch (outcome) {
        case '0':
            return homeTeamName ? `${homeTeamName} (Home)` : 'Home';
        case '1':
            return 'Draw';
        case '2':
            return awayTeamName ? `${awayTeamName} (Away)` : 'Away';
        default:
            return `Outcome #${outcome}`;
    }
}

export function fmtStake(rawAmount: string, decimals: number | undefined, fractionDigits = 2): string {
    if (decimals === undefined) return '—';
    const value = Number(rawAmount) / 10 ** decimals;
    return value.toLocaleString('en-US', {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    });
}

/** Client-side bet counts for fully-loaded slices. */
export function computeBetCounts(
    bets: ReadonlyArray<MyBet>,
    overlay?: ClaimOverlay,
): BetCounts {
    return {
        all:        bets.length,
        pending:    bets.filter((b) => b.status === 'PENDING').length,
        won:        bets.filter((b) => b.status === 'WON').length,
        lost:       bets.filter((b) => b.status === 'LOST').length,
        refunded:   bets.filter((b) => b.status === 'REFUNDED').length,
        claimable:  bets.filter((b) => isClaimableNow(b, overlay)).length,
        refundable: bets.filter((b) => isRefundableNow(b, overlay)).length,
    };
}

/**
 * Sum of unclaimed payouts (feeds the claim banner). For WON-not-yet-claimed
 * rows the server hasn't filled `payoutAmount` yet, so we fall back to the
 * stake — conservative lower bound (real payout is `stake × netPool /
 * winningPool` and ≥ stake when the user is on the winning side). Refundable
 * rows always get exactly the stake back.
 */
export function sumClaimablePayouts(
    bets: ReadonlyArray<MyBet>,
    decimals: number | undefined,
    overlay?: ClaimOverlay,
): number {
    if (decimals === undefined) return 0;
    return bets
        .filter((b) => isClaimableNow(b, overlay) || isRefundableNow(b, overlay))
        .reduce((acc, b) => {
            if (b.payoutAmount) return acc + Number(b.payoutAmount) / 10 ** decimals;
            return acc + Number(b.stakeAmount) / 10 ** decimals;
        }, 0);
}
