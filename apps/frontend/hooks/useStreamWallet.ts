import { useCallback } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { formatUnits, type Address } from 'viem';
import {
    useStreamWalletFactoryReadHasWallet,
    useStreamWalletFactoryReadGetWallet,
    useStreamWalletReadTotalRevenue,
    useStreamWalletReadTotalWithdrawn,
    useStreamWalletReadAvailableBalance,
    useStreamWalletReadPlatformFeeBps,
    useStreamWalletReadTotalSubscribers,
    useStreamWalletReadIsSubscribed,
    useStreamWalletReadGetSubscription,
} from '@/lib/contracts/generated';
import { useStreamerDonations, useStreamerSubscriptions } from '@/hooks/api';
import { chilizConfig } from '@/config/chiliz.config';
import { usePoolDecimals } from '@/hooks/usePoolDecimals';

const FACTORY_ADDRESS = chilizConfig.streamWalletFactory;

// Pin reads to the deployed chain (memory: generated read hooks silently
// never fire when chainId is omitted and the wallet is on a different chain).
// Typed as `number` rather than a literal union — wagmi's generated read
// hook overloads explode TS's depth limit when the chainId is narrow.
const CHAIN_ID: number = chilizConfig.chainId;

interface UseStreamWalletProps {
    streamerAddress?: `0x${string}`;
}

interface Statistics {
    /** USDC, formatted to a human string (uses pool's true decimals). */
    totalRevenue: string;
    totalDonations: number;
    totalSubscribers: number;
    /** USDC, formatted to a human string. */
    totalWithdrawn: string;
    /** USDC, formatted to a human string. */
    availableBalance: string;
    /** Display percent (e.g. 5 for 5%). */
    platformFeeBps: number;
}

interface SubscriptionDetails {
    isSubscribed: boolean;
    /** USDC subscription cost, formatted. */
    amount: string;
    /** Localised expiry date string. */
    expiryTime: string;
    active: boolean;
}

/**
 * Read-only view over a streamer's StreamWallet.
 *
 * NOTE: Donation / subscription writes are NOT exposed here anymore. They go
 * through `useChilizSwapRouter` (donate / subscribe), which supports CHZ /
 * USDC / fan-token paths via the FanX swap. The factory's
 * `donateToStream` / `subscribeToStream` are fan-token-only and were
 * mis-wired to placeholder zero addresses in earlier revisions of this hook.
 */
export function useStreamWallet({ streamerAddress }: UseStreamWalletProps) {
    const { primaryWallet } = useDynamicContext();
    const walletAddress = primaryWallet?.address as `0x${string}` | undefined;

    // The pool and the StreamWallet both account in the pool's USDC asset, so
    // we read the on-chain decimals once from the pool. Chiliz testnet USDC
    // happens to be 18-decimal; mainnet (Circle) USDC is 6-decimal.
    const { assetDecimals } = usePoolDecimals();

    // Backend data using React Query hooks
    const {
        data: donationsData,
        isLoading: isLoadingDonations,
        refetch: refetchDonations,
    } = useStreamerDonations(streamerAddress || '');
    const {
        data: subscriptionsData,
        isLoading: isLoadingSubscriptions,
        refetch: refetchSubscriptions,
    } = useStreamerSubscriptions(streamerAddress || '');

    const donations = donationsData?.donations || [];
    const subscriptions = subscriptionsData?.subscriptions || [];
    const isLoadingBackend = isLoadingDonations || isLoadingSubscriptions;

    // ============================================================
    // Blockchain reads
    // ============================================================

    const { data: hasWallet, refetch: refetchHasWallet } = useStreamWalletFactoryReadHasWallet({
        address: FACTORY_ADDRESS,
        args: streamerAddress ? [streamerAddress] : undefined,
        chainId: CHAIN_ID,
    });

    const { data: streamWalletAddress, refetch: refetchWalletAddress } = useStreamWalletFactoryReadGetWallet({
        address: FACTORY_ADDRESS,
        args: streamerAddress ? [streamerAddress] : undefined,
        chainId: CHAIN_ID,
    });

    const { data: totalRevenue } = useStreamWalletReadTotalRevenue({
        address: streamWalletAddress as `0x${string}` | undefined,
        chainId: CHAIN_ID,
    });

    const { data: totalWithdrawn } = useStreamWalletReadTotalWithdrawn({
        address: streamWalletAddress as `0x${string}` | undefined,
        chainId: CHAIN_ID,
    });

    const { data: availableBalance } = useStreamWalletReadAvailableBalance({
        address: streamWalletAddress as `0x${string}` | undefined,
        chainId: CHAIN_ID,
    });

    const { data: platformFeeBps } = useStreamWalletReadPlatformFeeBps({
        address: streamWalletAddress as `0x${string}` | undefined,
        chainId: CHAIN_ID,
    });

    const { data: totalSubscribers } = useStreamWalletReadTotalSubscribers({
        address: streamWalletAddress as `0x${string}` | undefined,
        chainId: CHAIN_ID,
    });

    const { data: isSubscribed, refetch: refetchIsSubscribed } = useStreamWalletReadIsSubscribed({
        address: streamWalletAddress as `0x${string}` | undefined,
        args: walletAddress ? [walletAddress] : undefined,
        chainId: CHAIN_ID,
    });

    const { data: subscription, refetch: refetchSubscription } = useStreamWalletReadGetSubscription({
        address: streamWalletAddress as `0x${string}` | undefined,
        args: walletAddress ? [walletAddress] : undefined,
        chainId: CHAIN_ID,
    });

    // ============================================================
    // Refetch
    // ============================================================

    const fetchBackendData = useCallback(() => {
        refetchDonations();
        refetchSubscriptions();
    }, [refetchDonations, refetchSubscriptions]);

    const refetchAll = useCallback(() => {
        refetchHasWallet();
        refetchWalletAddress();
        refetchIsSubscribed();
        refetchSubscription();
        fetchBackendData();
    }, [
        refetchHasWallet,
        refetchWalletAddress,
        refetchIsSubscribed,
        refetchSubscription,
        fetchBackendData,
    ]);

    // ============================================================
    // Statistics (combine blockchain + backend)
    // ============================================================

    const fmtUsdc = (v: bigint | undefined | null): string =>
        v !== undefined && v !== null && assetDecimals !== undefined ? formatUnits(v, assetDecimals) : '0';

    const statistics: Statistics = {
        totalRevenue: fmtUsdc(totalRevenue as bigint | undefined),
        totalDonations: donations.length,
        totalSubscribers: totalSubscribers ? Number(totalSubscribers) : subscriptions.length,
        totalWithdrawn: fmtUsdc(totalWithdrawn as bigint | undefined),
        availableBalance: fmtUsdc(availableBalance as bigint | undefined),
        platformFeeBps: platformFeeBps ? Number(platformFeeBps) / 100 : 5,
    };

    // ============================================================
    // Subscription details
    // ============================================================

    const sub = subscription as
        | { amount: bigint; expiryTime: bigint; active: boolean }
        | undefined;
    const subscriptionDetails: SubscriptionDetails | null = sub
        ? {
              isSubscribed:
                  !!isSubscribed && sub.active && Number(sub.expiryTime) > Date.now() / 1000,
              amount: fmtUsdc(sub.amount),
              expiryTime: new Date(Number(sub.expiryTime) * 1000).toLocaleDateString(),
              active: sub.active,
          }
        : null;

    return {
        // Wallet info
        hasWallet: !!hasWallet,
        streamWalletAddress: streamWalletAddress as Address | undefined,
        isLoading: isLoadingBackend,

        // Statistics
        statistics,

        // History from backend
        donations,
        subscriptions,

        subscription: subscriptionDetails,

        // Refetch
        refetch: fetchBackendData,
        refetchAll,
    };
}
