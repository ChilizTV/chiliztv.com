'use client';

import { useEffect, useRef } from 'react';
import type { Address } from 'viem';
import { useWaitForTransactionReceipt } from 'wagmi';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
    useBettingMatchWriteClaim,
    useBettingMatchWriteClaimRefund,
} from '@/lib/contracts/generated';
import { chilizConfig } from '@/config/chiliz.config';
import { describeError } from '@/lib/contracts/errors';
import { usePoolDecimals } from '@/hooks/usePoolDecimals';
import { fmtUsd, timeAgo } from '../domain/formatters';
import {
    fmtSelection,
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

    // ── Claim / refund tx state ─────────────────────────────────────────
    const { writeContract: writeClaim, data: claimHash, isPending: claimPending, error: claimError } = useBettingMatchWriteClaim();
    const { isLoading: claimConfirming, isSuccess: claimSuccess } = useWaitForTransactionReceipt({ hash: claimHash });

    const { writeContract: writeRefund, data: refundHash, isPending: refundPending, error: refundError } = useBettingMatchWriteClaimRefund();
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
        const args: readonly [bigint, bigint] = [BigInt(bet.marketId), BigInt(bet.betIndex)];
        const writeArgs = { address: bet.contractAddress as Address, args, chainId: chilizConfig.chainId } as const;
        if (refundable) writeRefund(writeArgs);
        else writeClaim(writeArgs);
    };

    const isTxPending = claimPending || claimConfirming || refundPending || refundConfirming;
    const stake = Number(bet.netStake) / 10 ** (assetDecimals ?? 6);
    const potential = stake * (bet.oddsX10000 / 10_000);
    // `bet.payout` is only populated on the Payout event (i.e. after the user
    // claims). When a market settles but the user hasn't claimed yet, the
    // backend marks status=WON but leaves payout null — fall back to the
    // expected `stake × odds` so the row never displays "$0.00 Won".
    const claimedPayout = bet.payout ? Number(bet.payout) / 10 ** (assetDecimals ?? 6) : 0;
    const payout = claimedPayout > 0 ? claimedPayout : potential;

    const matchLabel = bet.match ? `${bet.match.homeTeamName} vs ${bet.match.awayTeamName}` : 'Unknown match';
    const sel = fmtSelection(
        bet.selection,
        bet.match?.homeTeamName,
        bet.match?.awayTeamName,
        bet.marketType,
        bet.line,
    );

    // Visible status — overlay first (the user just acted), server second.
    // The indexer's authoritative `claimedAt` / `refundedAt` also drives
    // the "Claimed" / "Refunded" pills.
    const overlayEntry = lookup(bet);
    const showClaimedPill =
        overlayEntry?.kind === 'claimed' ||
        (bet.status === 'WON' && bet.claimedAt !== null);
    const showRefundedPill =
        overlayEntry?.kind === 'refunded' ||
        (bet.status === 'REFUNDED' && bet.refundedAt !== null);

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
                    ×{(bet.oddsX10000 / 10_000).toFixed(2)}
                </div>
                <div className="font-mono-ctv mt-0.5 text-[10px] uppercase tracking-[0.14em] text-white/45">
                    {timeAgo(new Date(bet.placedAt).getTime())}
                </div>
            </div>

            <div>
                {bet.status === 'WON' || bet.status === 'REFUNDED' ? (
                    <div
                        className="font-mono-ctv text-[13px] font-semibold tabular-nums"
                        style={{ color: isWon ? '#2dd4a4' : 'rgba(255,255,255,0.65)' }}
                    >
                        {fmtUsd(payout)}
                    </div>
                ) : isLost ? (
                    <div className="font-mono-ctv text-[13px] font-semibold tabular-nums text-white/35">—</div>
                ) : (
                    <div className="font-mono-ctv text-[13px] font-semibold tabular-nums text-white/65">
                        {fmtUsd(potential)}
                    </div>
                )}
                <div className="font-mono-ctv mt-0.5 text-[10px] uppercase tracking-[0.14em] text-white/45">
                    {isPending ? 'Potential' : isWon ? 'Won' : isLost ? 'Lost' : 'Refund'}
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
                                : (bet.status.toLowerCase() as 'pending' | 'won' | 'lost' | 'refunded')
                        }
                    />
                )}
            </div>
        </div>
    );
}
