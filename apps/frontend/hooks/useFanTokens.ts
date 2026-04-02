import { useMemo } from "react";
import { useUserFanTokenBalances } from "./api/useFanTokens";

export interface TokenBalance {
    symbol: string;
    balance: number;
}

export interface FanTokenData {
    totalBalance: number;
    tokenBreakdown: { [key: string]: number };
    tokenBalances: TokenBalance[];
    isLoading: boolean;
    error: string | null;
    isFeatured: boolean;
}

/**
 * @notice Reusable hook to fetch user fan tokens
 * @param walletAddress User's wallet address
 * @param enabled If false, hook won't make requests (default: true)
 * @return Fan token data with loading and error states
 */
export function useFanTokens(walletAddress?: string, enabled: boolean = true): FanTokenData {
    const { data, isLoading, error: queryError } = useUserFanTokenBalances(walletAddress || "");

    // Memoize the result to prevent infinite loops from array reference changes
    return useMemo(() => {
        if (!walletAddress || !enabled) {
            return {
                totalBalance: 0,
                tokenBreakdown: {},
                tokenBalances: [],
                isLoading: false,
                error: null,
                isFeatured: false,
            };
        }

        if (isLoading) {
            return {
                totalBalance: 0,
                tokenBreakdown: {},
                tokenBalances: [],
                isLoading: true,
                error: null,
                isFeatured: false,
            };
        }

        if (queryError) {
            return {
                totalBalance: 0,
                tokenBreakdown: {},
                tokenBalances: [],
                isLoading: false,
                error: queryError.message || "Failed to fetch token balances",
                isFeatured: false,
            };
        }

        if (data?.success && data.balance) {
            const balances: { [key: string]: number } = {};
            const balancesArray: TokenBalance[] = [];

            data.balance.tokenBalances.forEach(tb => {
                balances[tb.token.symbol] = tb.balance;
                balancesArray.push({
                    symbol: tb.token.symbol,
                    balance: tb.balance,
                });
            });

            return {
                totalBalance: data.balance.totalBalance,
                tokenBreakdown: balances,
                tokenBalances: balancesArray,
                isLoading: false,
                error: null,
                isFeatured: data.balance.isFeatured,
            };
        }

        return {
            totalBalance: 0,
            tokenBreakdown: {},
            tokenBalances: [],
            isLoading: false,
            error: null,
            isFeatured: false,
        };
    }, [walletAddress, enabled, data, isLoading, queryError]);
}
