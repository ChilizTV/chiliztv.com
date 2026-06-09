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
    /**
     * Optional. HALFTIME / FIRST_SCORER markets are no longer seeded on new
     * proxies; legacy contracts rely on PariMatchBase void protection to
     * refund stakers when these are omitted (winningPool == 0 → cancel).
     */
    htHomeGoals?: number;
    htAwayGoals?: number;
    firstScorerId?: number;
    /**
     * Aggregate score after extra time (90' + ET). When the match never went
     * to AET, callers MUST pass `aetHomeGoals = homeGoals` (and likewise for
     * away) — the contract uses these fields exclusively for
     * MARKET_FULL_TIME_WINNER and they have no effect on the other markets.
     * Defaults: when omitted, the adapter passes 0 for both, which makes
     * FULL_TIME_WINNER resolve as a tied AET with no PEN — that case is
     * safe (return (0, false) → market stays Closed for manual settle).
     */
    aetHomeGoals?: number;
    aetAwayGoals?: number;
    /**
     * Winner of the penalty shootout, encoded as 0=Home, 1=Away. Use 255
     * (= PEN_WINNER_NONE) when the match did NOT reach a penalty shootout.
     * Default 255 when omitted.
     */
    penWinner?: number;
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

            // Defaults for AET/PEN fields when caller omits them: pass the
            // 90' score as the AET aggregate (so FULL_TIME_WINNER falls back
            // to the 90' winner for non-knockout matches), and 255 for
            // penWinner meaning "no shootout occurred".
            const aetHomeGoals = score.aetHomeGoals ?? score.homeGoals;
            const aetAwayGoals = score.aetAwayGoals ?? score.awayGoals;
            const penWinner = score.penWinner ?? 255;

            const hash = await this.walletClient.writeContract({
                account: this.walletClient.account!,
                address: addr,
                abi: FOOTBALL_PARI_MATCH_INLINE_ABI,
                functionName: 'resolveByScore',
                args: [{
                    homeGoals: score.homeGoals,
                    awayGoals: score.awayGoals,
                    htHomeGoals: score.htHomeGoals ?? 0,
                    htAwayGoals: score.htAwayGoals ?? 0,
                    firstScorerId: score.firstScorerId ?? 0,
                    aetHomeGoals,
                    aetAwayGoals,
                    penWinner,
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
