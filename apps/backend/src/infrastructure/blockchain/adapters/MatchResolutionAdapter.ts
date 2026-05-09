import { injectable } from 'tsyringe';
import { createWalletClient, createPublicClient, http } from 'viem';
import { privateKeyToAccount, nonceManager } from 'viem/accounts';
import { chilizConfig, networkType } from '../../config/chiliz.config';
import { chainFor, chilizSpicy, chilizMainnet, FOOTBALL_MATCH_ABI } from '@chiliztv/blockchain';
import { logger } from '../../logging/logger';

const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY as `0x${string}`;
const MARKET_STATE_RESOLVED = 4;
const TX_DELAY_MS = 4000;

function delay(ms: number = TX_DELAY_MS): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Match Resolution Adapter
 * Resolves betting markets on-chain (resolveMarket) for finished matches.
 * Handles WINNER (1X2), GOALS_TOTAL (Over/Under 2.5), BOTH_SCORE (BTTS).
 */
@injectable()
export class MatchResolutionAdapter {
    private walletClient: ReturnType<typeof createWalletClient>;
    private publicClient: ReturnType<typeof createPublicClient>;
    private chain: typeof chilizSpicy | typeof chilizMainnet;

    constructor() {
        if (!ADMIN_PRIVATE_KEY) {
            throw new Error('ADMIN_PRIVATE_KEY environment variable is required for match resolution');
        }
        this.chain = chainFor(networkType);
        const account = privateKeyToAccount(ADMIN_PRIVATE_KEY, { nonceManager });
        this.walletClient = createWalletClient({
            account,
            chain: this.chain,
            transport: http(chilizConfig.rpcUrl),
        });
        this.publicClient = createPublicClient({
            chain: this.chain,
            transport: http(chilizConfig.rpcUrl),
        });
        logger.info('MatchResolutionAdapter initialized', {
            network: networkType,
            chain: this.chain.name
        });
    }

    /**
     * Compute result for a market from scores.
     * marketId 0 = WINNER (0=home, 1=draw, 2=away)
     * marketId 1 = GOALS_TOTAL line 2.5 (0=under, 1=over)
     * marketId 2 = BOTH_SCORE (0=no, 1=yes)
     */
    private computeResultForMarket(marketId: number, homeScore: number, awayScore: number): number {
        if (marketId === 0) {
            if (homeScore > awayScore) return 0;
            if (awayScore > homeScore) return 2;
            return 1;
        }
        if (marketId === 1) {
            const total = homeScore + awayScore;
            return total > 2 ? 1 : 0;
        }
        if (marketId === 2) {
            return homeScore > 0 && awayScore > 0 ? 1 : 0;
        }
        return 0;
    }

    /**
     * Resolve all non-resolved markets for a single match contract.
     * Returns the number of markets resolved.
     */
    async resolveMarketsForMatch(
        contractAddress: string,
        homeScore: number,
        awayScore: number
    ): Promise<number> {
        const addr = contractAddress as `0x${string}`;
        let resolvedCount = 0;

        try {
            const marketCount = await this.publicClient.readContract({
                address: addr,
                abi: FOOTBALL_MATCH_ABI,
                functionName: 'marketCount',
            });
            const count = Number(marketCount);
            if (count === 0) return 0;

            // Lifecycle: Open(1) → Closed(3) → Resolved(4). `resolveMarket`
            // requires Closed, so close-then-resolve when still Open.
            const MARKET_STATE_OPEN = 1;
            const MARKET_STATE_CLOSED = 3;

            for (let marketId = 0; marketId < count; marketId++) {
                try {
                    let core = await this.publicClient.readContract({
                        address: addr,
                        abi: FOOTBALL_MATCH_ABI,
                        functionName: 'getMarketCore',
                        args: [BigInt(marketId)],
                    }) as readonly [number, bigint, number, number, bigint];
                    if (core[0] === MARKET_STATE_RESOLVED) continue;

                    if (core[0] === MARKET_STATE_OPEN) {
                        const closeHash = await this.walletClient.writeContract({
                            account: this.walletClient.account!,
                            address: addr,
                            abi: FOOTBALL_MATCH_ABI,
                            functionName: 'closeMarket',
                            args: [BigInt(marketId)],
                            chain: this.chain,
                        });
                        await this.publicClient.waitForTransactionReceipt({ hash: closeHash, timeout: 90_000 });
                        await delay();
                        core = await this.publicClient.readContract({
                            address: addr,
                            abi: FOOTBALL_MATCH_ABI,
                            functionName: 'getMarketCore',
                            args: [BigInt(marketId)],
                        }) as readonly [number, bigint, number, number, bigint];
                    }

                    if (core[0] !== MARKET_STATE_CLOSED) {
                        logger.warn('Market not in Closed state — skipping resolveMarket', { contractAddress, marketId, state: core[0] });
                        continue;
                    }

                    const result = BigInt(this.computeResultForMarket(marketId, homeScore, awayScore));
                    const hash = await this.walletClient.writeContract({
                        account: this.walletClient.account!,
                        address: addr,
                        abi: FOOTBALL_MATCH_ABI,
                        functionName: 'resolveMarket',
                        args: [BigInt(marketId), result],
                        chain: this.chain,
                    });
                    await this.publicClient.waitForTransactionReceipt({ hash, timeout: 90_000 });
                    await delay();
                    resolvedCount++;
                    logger.info('Market resolved on-chain', {
                        contractAddress: contractAddress.slice(0, 10) + '...',
                        marketId,
                        result: Number(result)
                    });
                } catch (err: any) {
                    logger.error('Failed to resolve market', {
                        contractAddress,
                        marketId,
                        error: err.message
                    });
                }
            }
        } catch (err: any) {
            logger.error('Failed to resolve markets for match', {
                contractAddress,
                error: err.message
            });
        }

        return resolvedCount;
    }
}
