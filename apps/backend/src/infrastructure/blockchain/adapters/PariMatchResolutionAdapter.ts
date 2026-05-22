import { injectable } from 'tsyringe';
import { createWalletClient, createPublicClient, http } from 'viem';
import { privateKeyToAccount, nonceManager } from 'viem/accounts';
import { chilizConfig, networkType } from '../../config/chiliz.config';
import {
    chainFor,
    chilizSpicy,
    chilizMainnet,
    PARI_MATCH_BASE_INLINE_ABI,
    FOOTBALL_PARI_MATCH_INLINE_ABI,
} from '@chiliztv/blockchain';
import { logger } from '../../logging/logger';

const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY as `0x${string}`;
const TX_DELAY_MS = 4000;

function delay(ms: number = TX_DELAY_MS): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export interface FootballScore {
    homeGoals: number;
    awayGoals: number;
    htHomeGoals: number;
    htAwayGoals: number;
    /** 0 = unknown — FIRST_SCORER markets are skipped when unknown. */
    firstScorerId: number;
}

/**
 * Resolves every closeable market on a FootballPariMatch by calling
 * `resolveByScore(FootballScore)` — the contract walks every Closed market
 * and computes the winning outcome from the score. Markets still in Open
 * are batch-closed first via `closeMarketsBatch`.
 */
@injectable()
export class PariMatchResolutionAdapter {
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
        logger.info('PariMatchResolutionAdapter initialized', {
            network: networkType,
            chain: this.chain.name,
        });
    }

    /**
     * Resolve every non-Resolved market on a FootballPariMatch from a score.
     * Returns the count of markets now in Resolved state after the call
     * (void markets that auto-cancel transition to Cancelled and are not
     * counted here).
     */
    async resolveMarketsForMatch(contractAddress: string, score: FootballScore): Promise<number> {
        const addr = contractAddress as `0x${string}`;
        const MarketState = { Open: 1, Closed: 3, Resolved: 4 } as const;

        try {
            const count = Number(await this.publicClient.readContract({
                address: addr,
                abi: PARI_MATCH_BASE_INLINE_ABI,
                functionName: 'marketCount',
            }));
            if (count === 0) return 0;

            // Collect markets still Open and batch-close them so resolveByScore
            // can sweep through. Already-Closed / Resolved are left untouched.
            const toClose: bigint[] = [];
            for (let i = 0; i < count; i++) {
                const core = await this.publicClient.readContract({
                    address: addr,
                    abi: PARI_MATCH_BASE_INLINE_ABI,
                    functionName: 'getMarketCore',
                    args: [BigInt(i)],
                }) as { state: number; result: bigint; createdAt: number; resolvedAt: number; resolvedNetPool: bigint };
                if (core.state === MarketState.Open) toClose.push(BigInt(i));
            }

            if (toClose.length > 0) {
                logger.info('Closing markets before resolve', { contractAddress, count: toClose.length });
                const closeHash = await this.walletClient.writeContract({
                    account: this.walletClient.account!,
                    address: addr,
                    abi: PARI_MATCH_BASE_INLINE_ABI,
                    functionName: 'closeMarketsBatch',
                    args: [toClose],
                    chain: this.chain,
                });
                await this.publicClient.waitForTransactionReceipt({ hash: closeHash, timeout: 120_000 });
                await delay();
            }

            const hash = await this.walletClient.writeContract({
                account: this.walletClient.account!,
                address: addr,
                abi: FOOTBALL_PARI_MATCH_INLINE_ABI,
                functionName: 'resolveByScore',
                args: [{
                    homeGoals: score.homeGoals,
                    awayGoals: score.awayGoals,
                    htHomeGoals: score.htHomeGoals,
                    htAwayGoals: score.htAwayGoals,
                    firstScorerId: score.firstScorerId,
                }],
                chain: this.chain,
            });
            const receipt = await this.publicClient.waitForTransactionReceipt({ hash, timeout: 180_000 });
            if (receipt.status === 'reverted') {
                throw new Error(`resolveByScore reverted (hash: ${hash})`);
            }
            await delay();

            // Re-read to count how many ended up Resolved.
            let resolvedCount = 0;
            for (let i = 0; i < count; i++) {
                const core = await this.publicClient.readContract({
                    address: addr,
                    abi: PARI_MATCH_BASE_INLINE_ABI,
                    functionName: 'getMarketCore',
                    args: [BigInt(i)],
                }) as { state: number; result: bigint; createdAt: number; resolvedAt: number; resolvedNetPool: bigint };
                if (core.state === MarketState.Resolved) resolvedCount++;
            }
            logger.info('Markets resolved on-chain', {
                contractAddress: contractAddress.slice(0, 10) + '...',
                resolvedCount,
                score,
            });
            return resolvedCount;
        } catch (err: any) {
            logger.error('Failed to resolve markets for match', {
                contractAddress,
                error: err.message,
            });
            return 0;
        }
    }
}
