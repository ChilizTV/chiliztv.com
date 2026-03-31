import { useState, useEffect, useCallback } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { parseEther, formatEther, type Address } from 'viem';
import { useWaitForTransactionReceipt } from 'wagmi';
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
    useStreamWalletFactoryWriteDonateToStream,
    useStreamWalletFactoryWriteSubscribeToStream
} from '@/lib/contracts/generated';
import { useStreamerDonations, useStreamerSubscriptions } from '@/hooks/api';
import type { Donation, Subscription } from '@/models/stream-wallet.model';

const FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_STREAM_WALLET_FACTORY_ADDRESS || 
    '0x7310cE3bD564fA63587a388b87a8C973a0BA3d7B') as `0x${string}`;

interface UseStreamWalletProps {
    streamerAddress?: `0x${string}`;
}

interface Statistics {
    totalRevenue: string;
    totalDonations: number;
    totalSubscribers: number;
    totalWithdrawn: string;
    availableBalance: string;
    platformFeeBps: number;
}

interface SubscriptionDetails {
    isSubscribed: boolean;
    amount: string;
    expiryTime: string;
    active: boolean;
}

interface DonationState {
    isPending: boolean;
    isConfirming: boolean;
    isSuccess: boolean;
    txHash?: `0x${string}`;
}

interface SubscriptionState {
    isPending: boolean;
    isConfirming: boolean;
    isSuccess: boolean;
    txHash?: `0x${string}`;
}

export function useStreamWallet({ streamerAddress }: UseStreamWalletProps) {
    const { primaryWallet } = useDynamicContext();
    const walletAddress = primaryWallet?.address as `0x${string}` | undefined;

    // Backend data using React Query hooks
    const { data: donationsData, isLoading: isLoadingDonations, refetch: refetchDonations } = useStreamerDonations(streamerAddress || "");
    const { data: subscriptionsData, isLoading: isLoadingSubscriptions, refetch: refetchSubscriptions } = useStreamerSubscriptions(streamerAddress || "");

    const donations = donationsData?.donations || [];
    const subscriptions = subscriptionsData?.subscriptions || [];
    const isLoadingBackend = isLoadingDonations || isLoadingSubscriptions;

    // ============================================================
    // Blockchain reads
    // ============================================================

    const { data: hasWallet, refetch: refetchHasWallet } = useStreamWalletFactoryReadHasWallet({
        address: FACTORY_ADDRESS,
        args: streamerAddress ? [streamerAddress] : undefined,
    });

    const { data: streamWalletAddress, refetch: refetchWalletAddress } = useStreamWalletFactoryReadGetWallet({
        address: FACTORY_ADDRESS,
        args: streamerAddress ? [streamerAddress] : undefined,
    });

    const { data: totalRevenue } = useStreamWalletReadTotalRevenue({
        address: streamWalletAddress as `0x${string}` | undefined,
    });

    const { data: totalWithdrawn } = useStreamWalletReadTotalWithdrawn({
        address: streamWalletAddress as `0x${string}` | undefined,
    });

    const { data: availableBalance } = useStreamWalletReadAvailableBalance({
        address: streamWalletAddress as `0x${string}` | undefined,
    });

    const { data: platformFeeBps } = useStreamWalletReadPlatformFeeBps({
        address: streamWalletAddress as `0x${string}` | undefined,
    });

    const { data: totalSubscribers } = useStreamWalletReadTotalSubscribers({
        address: streamWalletAddress as `0x${string}` | undefined,
    });

    const { data: isSubscribed, refetch: refetchIsSubscribed } = useStreamWalletReadIsSubscribed({
        address: streamWalletAddress as `0x${string}` | undefined,
        args: walletAddress ? [walletAddress] : undefined,
    });

    const { data: subscription, refetch: refetchSubscription } = useStreamWalletReadGetSubscription({
        address: streamWalletAddress as `0x${string}` | undefined,
        args: walletAddress ? [walletAddress] : undefined,
    });

    // ============================================================
    // Blockchain writes (using generated hooks)
    // ============================================================

    const {
        writeContract: donateWrite,
        isPending: isDonatePending,
        isSuccess: isDonateSuccess,
        data: donateTxHash,
        error: donateError
    } = useStreamWalletFactoryWriteDonateToStream();

    const {
        writeContract: subscribeWrite,
        isPending: isSubscribePending,
        isSuccess: isSubscribeSuccess,
        data: subscribeTxHash,
        error: subscribeError
    } = useStreamWalletFactoryWriteSubscribeToStream();

    // ============================================================
    // Transaction confirmations
    // ============================================================

    const { isLoading: isDonateConfirming } = useWaitForTransactionReceipt({
        hash: donateTxHash,
    });

    const { isLoading: isSubscribeConfirming } = useWaitForTransactionReceipt({
        hash: subscribeTxHash,
    });

    // ============================================================
    // Refetch backend data
    // ============================================================

    const fetchBackendData = useCallback(() => {
        refetchDonations();
        refetchSubscriptions();
    }, [refetchDonations, refetchSubscriptions]);

    // Handle errors from write hooks
    useEffect(() => {
        if (donateError) {
            console.error('❌ Donate error:', donateError);
            const message = donateError.message || 'Failed to send donation';
            if (message.includes('User rejected') || message.includes('rejected')) {
                alert('Transaction was rejected');
            } else {
                alert(`Error: ${message}`);
            }
        }
    }, [donateError]);

    useEffect(() => {
        if (subscribeError) {
            console.error('❌ Subscribe error:', subscribeError);
            const message = subscribeError.message || 'Failed to subscribe';
            if (message.includes('User rejected') || message.includes('rejected')) {
                alert('Transaction was rejected');
            } else {
                alert(`Error: ${message}`);
            }
        }
    }, [subscribeError]);

    // Refetch after successful transactions
    useEffect(() => {
        if (isDonateSuccess && donateTxHash) {
            // Refetch wallet info in case it was just created
            refetchHasWallet();
            refetchWalletAddress();
            // Wait a bit for indexing then refetch backend data
            setTimeout(() => {
                fetchBackendData();
            }, 3000);
        }
    }, [isDonateSuccess, donateTxHash, refetchHasWallet, refetchWalletAddress, fetchBackendData]);

    useEffect(() => {
        if (isSubscribeSuccess && subscribeTxHash) {
            refetchIsSubscribed();
            refetchSubscription();
            // Wait a bit for indexing then refetch
            setTimeout(() => {
                fetchBackendData();
            }, 3000);
        }
    }, [isSubscribeSuccess, subscribeTxHash, refetchIsSubscribed, refetchSubscription, fetchBackendData]);

    // ============================================================
    // Statistics (combine blockchain + backend)
    // ============================================================

    const statistics: Statistics = {
        totalRevenue: totalRevenue ? formatEther(totalRevenue) : '0',
        totalDonations: donations.length,
        totalSubscribers: totalSubscribers ? Number(totalSubscribers) : subscriptions.length,
        totalWithdrawn: totalWithdrawn ? formatEther(totalWithdrawn) : '0',
        availableBalance: availableBalance ? formatEther(availableBalance) : '0',
        platformFeeBps: platformFeeBps ? Number(platformFeeBps) / 100 : 5
    };

    // ============================================================
    // Transaction functions (wrapped for error handling)
    // ============================================================

    const donate = useCallback(async (amount: string, message: string) => {
        if (!streamerAddress) {
            console.error('❌ Missing streamer address');
            return;
        }

        if (!donateWrite) {
            console.error('❌ Wallet not connected');
            alert('Please connect your wallet');
            return;
        }

        try {
            donateWrite({
                address: FACTORY_ADDRESS,
                args: [streamerAddress, message],
                value: parseEther(amount),
            });
        } catch (error: any) {
            console.error('❌ Error donating:', error);
            if (error.message?.includes('User rejected')) {
                alert('Transaction was rejected');
            } else {
                alert(`Error: ${error.message || 'Failed to send donation'}`);
            }
        }
    }, [streamerAddress, donateWrite]);

    const subscribe = useCallback(async (amount: string, durationDays: number) => {
        if (!streamerAddress) {
            console.error('❌ Missing streamer address');
            return;
        }

        if (!subscribeWrite) {
            console.error('❌ Wallet not connected');
            alert('Please connect your wallet');
            return;
        }

        try {
            const durationSeconds = BigInt(durationDays * 24 * 60 * 60);
            subscribeWrite({
                address: FACTORY_ADDRESS,
                args: [streamerAddress, durationSeconds],
                value: parseEther(amount),
            });
        } catch (error: any) {
            console.error('❌ Error subscribing:', error);
            if (error.message?.includes('User rejected')) {
                alert('Transaction was rejected');
            } else {
                alert(`Error: ${error.message || 'Failed to subscribe'}`);
            }
        }
    }, [streamerAddress, subscribeWrite]);

    // ============================================================
    // Subscription details
    // ============================================================

    const subscriptionDetails: SubscriptionDetails | null = subscription ? {
        isSubscribed: !!isSubscribed && subscription.active && Number(subscription.expiryTime) > Date.now() / 1000,
        amount: formatEther(subscription.amount),
        expiryTime: new Date(Number(subscription.expiryTime) * 1000).toLocaleDateString(),
        active: subscription.active
    } : null;

    // ============================================================
    // Return hook interface
    // ============================================================

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

        // Donation
        donate,
        donationState: {
            isPending: isDonatePending,
            isConfirming: isDonateConfirming,
            isSuccess: isDonateSuccess,
            txHash: donateTxHash
        } as DonationState,

        // Subscription
        subscribe,
        subscriptionState: {
            isPending: isSubscribePending,
            isConfirming: isSubscribeConfirming,
            isSuccess: isSubscribeSuccess,
            txHash: subscribeTxHash
        } as SubscriptionState,
        subscription: subscriptionDetails,

        // Refetch
        refetch: fetchBackendData
    };
}
