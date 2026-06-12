'use client';

import { useEffect, useRef } from 'react';
import type { Address } from 'viem';
import { useWaitForTransactionReceipt } from 'wagmi';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
    usePariMatchBaseWriteClaim,
    usePariMatchBaseWriteClaimRefund,
} from '@/lib/contracts/generated';
import { chilizConfig } from '@/config/chiliz.config';
import { describeError } from '@/lib/contracts/errors';
import { usePoolDecimals } from '@/hooks/usePoolDecimals';
import { fmtUsd, timeAgo } from '../domain/formatters';
import {
    fmtSelection,
    isAwaitingResolve,
    isClaimableNow,
    isLocallyClaimed,
    isRefundableNow,
    type MyBet,
} from '../domain/bets';
import { useInvalidateMyBets } from '../hooks/useMyBets';
import { useLocallyClaimed } from '../hooks/useLocallyClaimed';
import { StatusPill } from './StatusPill';

interface BetRowProps {
    readonly bet: MyBet;
}

/**
 * Single row in the My Bets table — owns its own claim/refund tx state.
 *
 * The "Claim" / "Refund" affordance flips to a "Claimed" / "Refunded" pill
 * the instant the on-chain receipt confirms. We persist that flip in a
 * locally-claimed pub/sub store (24h TTL) so a query refetch — which
 * arrives before the indexer has caught up — can't reset the UI back to
 * a callable button (which would revert when clicked again).
 */
export function BetRow({ bet }: BetRowProps) {
    const { assetDecimals } = usePoolDecimals();
    const { map: claimedOverlay, lookup, mark } = useLocallyClaimed();
    const claimable = isClaimableNow(bet, claimedOverlay);
    const refundable = isRefundableNow(bet, claimedOverlay);
    const locallyHandled = isLocallyClaimed(bet, claimedOverlay);
    const isWon = bet.status === 'WON';
    const isLost = bet.status === 'LOST';
    const isPending = bet.status === 'PENDING';
    const isResolving = isAwaitingResolve(bet);

    // ── Claim / refund tx state ─────────────────────────────────────────
    const { writeContract: writeClaim, data: claimHash, isPending: claimPending, error: claimError } = usePariMatchBaseWriteClaim();
    const { isLoading: claimConfirming, isSuccess: claimSuccess } = useWaitForTransactionReceipt({ hash: claimHash });

    const { writeContract: writeRefund, data: refundHash, isPending: refundPending, error: refundError } = usePariMatchBaseWriteClaimRefund();
    const { isLoading: refundConfirming, isSuccess: refundSuccess } = useWaitForTransactionReceipt({ hash: refundHash });

    const invalidateBets = useInvalidateMyBets();
    const handledTxRef = useRef<`0x${string}` | null>(null);

    useEffect(() => {
        const success = claimSuccess || refundSuccess;
        if (!success) return;
        const txHash = (claimHash ?? refundHash) as `0x${string}` | undefined;
        if (!txHash || handledTxRef.current === txHash) return;
        handledTxRef.current = txHash;

        // Persistent overlay — survives the upcoming `invalidateBets` refetch
        // even when the indexer hasn't yet recorded the Payout/Refund event.
        mark(bet, claimSuccess ? 'claimed' : 'refunded', txHash);

        toast.success(claimSuccess ? 'Payout claimed' : 'Refund collected', {
            description: `${txHash.slice(0, 10)}…${txHash.slice(-8)}`,
        });
        // Trigger a refetch so the row eventually reconciles with the
        // indexer's authoritative `claimedAt` / `refundedAt` (the overlay
        // simply masks the gap until then).
        invalidateBets();
    }, [claimSuccess, refundSuccess, claimHash, refundHash, bet, invalidateBets, mark]);

    useEffect(() => {
        const err = claimError ?? refundError;
        if (!err) return;
        const { decoded } = describeError(err);
        const fn = decoded.severity === 'info' ? toast.info : decoded.severity === 'warning' ? toast.warning : toast.error;
        fn(decoded.title, { description: decoded.description });
    }, [claimError, refundError]);

    const onClaim = () => {
        const args: readonly [bigint] = [BigInt(bet.marketId)];
        const writeArgs = { address: bet.contractAddress as Address, args, chainId: chilizConfig.chainId } as const;
        if (refundable) writeRefund(writeArgs);
        else writeClaim(writeArgs);
    };

    const isTxPending = claimPending || claimConfirming || refundPending || refundConfirming;
    const decimals = assetDecimals ?? 6;
    const stake = Number(bet.stakeAmount) / 10 ** decimals;
    // Pari-mutuel: no fixed odds → no client-side "potential" computable
    // without the live pool snapshot. Display the actual payoutAmount when
    // the indexer has filled it (PositionClaimed/StakeRefunded), otherwise
    // the column shows "—" / "Pending" for un-settled rows.
    const claimedPayout = bet.payoutAmount ? Number(bet.payoutAmount) / 10 ** decimals : null;
    // Implied probability AT placement time — recorded on-chain via
    // newOutcomePool / newTotalPool. Useful historical info on the row.
    const placementProbPct = (() => {
        const total = Number(bet.newTotalPool);
        const outcome = Number(bet.newOutcomePool);
        if (!Number.isFinite(total) || total <= 0) return null;
        if (!Number.isFinite(outcome) || outcome < 0) return null;
        return (outcome / total) * 100;
    })();

    const matchLabel = bet.match ? `${bet.match.homeTeamName} vs ${bet.match.awayTeamName}` : 'Unknown match';
    const sel = fmtSelection(
        bet.outcome,
        bet.match?.homeTeamName,
        bet.match?.awayTeamName,
        bet.marketType,
        bet.line,
    );

    // Visible status — overlay first (the user just acted), server second.
    // The indexer's authoritative `claimedAt` drives both pills (parimutuel
    // collapses claim/refund into a single timestamp).
    // Status-gated: overlay keys are (contract, marketId), shared by LOST rows.
    const overlayEntry = lookup(bet);
    const showClaimedPill =
        (overlayEntry?.kind === 'claimed' && bet.status === 'WON') ||
        (bet.status === 'WON' && bet.claimedAt !== null);
    const showRefundedPill =
        (overlayEntry?.kind === 'refunded' && bet.status === 'REFUNDED') ||
        (bet.status === 'REFUNDED' && bet.claimedAt !== null);

    return (
        <div
            className="grid items-center gap-4 border-b border-[#1E1E1E] px-6 py-4 transition-colors hover:bg-white/[0.015]"
            style={{ gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) auto' }}
        >
            <div className="min-w-0">
                <div className="font-display truncate text-[15px] font-bold uppercase leading-tight tracking-[-0.005em] text-white">
                    {matchLabel}
                </div>
                <div className="font-mono-ctv mt-1 truncate text-[10px] uppercase tracking-[0.14em] text-white/45">
                    {bet.match?.leagueName ?? 'Market'} · <span className="text-white/65">{sel}</span>
                </div>
            </div>

            <div>
                <div className="font-mono-ctv text-[13px] font-semibold tabular-nums text-white">
                    {fmtUsd(stake)}
                </div>
            </div>

            <div>
                <div className="font-mono-ctv text-[13px] font-semibold tabular-nums text-white">
                    {placementProbPct !== null ? `${placementProbPct.toFixed(1)}%` : '—'}
                </div>
                <div className="font-mono-ctv mt-0.5 text-[10px] uppercase tracking-[0.14em] text-white/45">
                    {timeAgo(new Date(bet.placedAt).getTime())}
                </div>
            </div>

            <div>
                {(bet.status === 'WON' || bet.status === 'REFUNDED') && claimedPayout !== null ? (
                    <div
                        className="font-mono-ctv text-[13px] font-semibold tabular-nums"
                        style={{ color: isWon ? '#2dd4a4' : 'rgba(255,255,255,0.65)' }}
                    >
                        {fmtUsd(claimedPayout)}
                    </div>
                ) : isLost ? (
                    <div className="font-mono-ctv text-[13px] font-semibold tabular-nums text-white/35">—</div>
                ) : (
                    <div className="font-mono-ctv text-[13px] font-semibold tabular-nums text-white/65">
                        —
                    </div>
                )}
                <div className="font-mono-ctv mt-0.5 text-[10px] uppercase tracking-[0.14em] text-white/45">
                    {isResolving ? 'Resolving' : isPending ? 'Pending settle' : isWon ? 'Won' : isLost ? 'Lost' : 'Refund'}
                </div>
            </div>

            <div className="flex items-center justify-end gap-2">
                {claimable || refundable ? (
                    <button
                        type="button"
                        onClick={onClaim}
                        disabled={isTxPending}
                        className="font-mono-ctv inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition-all"
                        style={{
                            background: isTxPending ? '#3A3A3A' : '#E8001D',
                            border: refundable ? '1px solid #2A2A2A' : '1px solid transparent',
                            cursor: isTxPending ? 'not-allowed' : 'pointer',
                            boxShadow: claimable && !isTxPending ? '0 6px 20px rgba(232,0,29,0.25)' : 'none',
                        }}
                    >
                        {isTxPending && <Loader2 size={11} className="animate-spin" />}
                        {isTxPending ? 'Confirming…' : refundable ? 'Refund' : 'Claim'}
                    </button>
                ) : showClaimedPill ? (
                    <StatusPill status="claimed" />
                ) : showRefundedPill ? (
                    <StatusPill status="refunded" />
                ) : (
                    <StatusPill
                        status={
                            locallyHandled
                                ? 'claimed'
                                : isResolving
                                  ? 'resolving'
                                  : (bet.status.toLowerCase() as 'pending' | 'won' | 'lost' | 'refunded')
                        }
                    />
                )}
            </div>
        </div>
    );
}
