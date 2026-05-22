import { injectable, inject } from 'tsyringe';
import {
    createWalletClient,
    createPublicClient,
    http,
    keccak256,
    toBytes,
} from 'viem';
import { privateKeyToAccount, nonceManager } from 'viem/accounts';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { INetworkConfig } from '@chiliztv/domain/shared/ports/INetworkConfig';
import {
    IBlockchainService,
    DeployContractResult,
    CloseMarketsResult,
    CancelMarketsResult,
    FootballScoreInput,
} from '@chiliztv/domain/shared/ports/IBlockchainService';
import {
    PARI_MATCH_FACTORY_INLINE_ABI,
    PARI_MATCH_BASE_INLINE_ABI,
    FOOTBALL_PARI_MATCH_INLINE_ABI,
    chainFor,
} from '@chiliztv/blockchain';
import { logger } from '../../logging/logger';

/* eslint-disable @typescript-eslint/no-explicit-any */

const MARKET_CREATED_TOPIC = keccak256(toBytes('MatchCreated(address,uint8,address)'));
const MARKET_WINNER       = keccak256(toBytes('WINNER'));
const MARKET_GOALS_TOTAL  = keccak256(toBytes('GOALS_TOTAL'));
const MARKET_BOTH_SCORE   = keccak256(toBytes('BOTH_SCORE'));
const TX_DELAY_MS         = 4000;

const MarketState = { Inactive: 0, Open: 1, Suspended: 2, Closed: 3, Resolved: 4, Cancelled: 5 } as const;

function delay(ms = TX_DELAY_MS): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Parimutuel implementation of IBlockchainService — wraps the PariMatchFactory,
 * PariMatchBase, and FootballPariMatch surfaces via viem. Receives all config
 * via INetworkConfig — never reads process.env directly.
 */
@injectable()
export class ViemBlockchainService implements IBlockchainService {
    private readonly walletClient: any;
    private readonly publicClient: any;
    private readonly account: ReturnType<typeof privateKeyToAccount>;

    constructor(
        @inject(TOKENS.INetworkConfig)
        private readonly config: INetworkConfig,
    ) {
        if (!config.adminPrivateKey) {
            throw new Error('INetworkConfig.adminPrivateKey is required');
        }

        const chain = chainFor(config.chainId === 88888 ? 'mainnet' : 'testnet');
        this.account = privateKeyToAccount(config.adminPrivateKey as `0x${string}`, { nonceManager });

        this.walletClient = createWalletClient({
            account: this.account,
            chain,
            transport: http(config.rpcUrl),
        });

        this.publicClient = createPublicClient({
            chain,
            transport: http(config.rpcUrl),
        });

        logger.info('ViemBlockchainService initialized', {
            network: config.chainId === 88888 ? 'mainnet' : 'testnet',
            rpcUrl: config.rpcUrl,
            factoryAddress: config.pariMatchFactoryAddress,
            adminAddress: this.account.address,
        });
    }

    // ─── IBlockchainService ───────────────────────────────────────────────────

    async deployBettingContract(
        matchName: string,
        ownerAddress: string,
        oracleAddress?: string,
    ): Promise<DeployContractResult> {
        const oracle = (oracleAddress ?? process.env.RESOLVER_ADDRESS ?? ownerAddress) as `0x${string}`;
        logger.info('Deploying FootballPariMatch proxy', { matchName, ownerAddress, oracle });

        const hash = await this.walletClient.writeContract({
            address: this.config.pariMatchFactoryAddress as `0x${string}`,
            abi: PARI_MATCH_FACTORY_INLINE_ABI,
            functionName: 'createFootballMatch',
            args: [matchName, ownerAddress as `0x${string}`, oracle],
        });

        const receipt = await this.publicClient.waitForTransactionReceipt({ hash, timeout: 120_000 });
        const matchCreatedLog = receipt.logs.find((log: any) => log.topics[0] === MARKET_CREATED_TOPIC);
        if (!matchCreatedLog?.topics[1]) {
            throw new Error('MatchCreated event not found in transaction logs');
        }

        const contractAddress = `0x${matchCreatedLog.topics[1].slice(26)}`;
        logger.info('FootballPariMatch deployed', { contractAddress, hash });
        return { contractAddress };
    }

    async setupDefaultMarkets(contractAddress: string): Promise<void> {
        const addr = contractAddress as `0x${string}`;

        const sendAndWait = async (fn: () => Promise<`0x${string}`>) => {
            const hash = await fn();
            const receipt = await this.publicClient.waitForTransactionReceipt({ hash, timeout: 90_000 });
            if (receipt.status === 'reverted') {
                throw new Error(`Transaction reverted on-chain (hash: ${hash})`);
            }
            await delay();
        };

        logger.info('Adding default parimutuel markets (WINNER + GOALS_TOTAL + BOTH_SCORE)', { contractAddress });
        await sendAndWait(() => this.walletClient.writeContract({
            chain: undefined,
            address: addr,
            abi: PARI_MATCH_BASE_INLINE_ABI,
            functionName: 'addMarketsBatch',
            args: [
                [MARKET_WINNER, MARKET_GOALS_TOTAL, MARKET_BOTH_SCORE],
                [0, 25, 0],
            ],
            gas: 1_500_000n,
        }));

        logger.info('Opening markets', { contractAddress });
        await sendAndWait(() => this.walletClient.writeContract({
            chain: undefined,
            address: addr,
            abi: PARI_MATCH_BASE_INLINE_ABI,
            functionName: 'openMarketsBatch',
            args: [[0n, 1n, 2n]],
            gas: 600_000n,
        }));

        logger.info('Default markets created and opened', { contractAddress, count: 3 });
    }

    async resolveMarketsByScore(contractAddress: string, score: FootballScoreInput): Promise<number> {
        const addr = contractAddress as `0x${string}`;

        // 1. Read all market states. Markets still Open need a batch-close
        //    before resolveByScore (which only sweeps Closed markets).
        let count: number;
        try {
            count = Number(await this.publicClient.readContract({
                address: addr,
                abi: PARI_MATCH_BASE_INLINE_ABI,
                functionName: 'marketCount',
            }));
        } catch (err: any) {
            logger.error('resolveMarketsByScore: failed to read marketCount', { contractAddress, error: err?.message ?? err });
            return 0;
        }
        if (count === 0) return 0;

        const toClose: bigint[] = [];
        for (let id = 0; id < count; id++) {
            try {
                const core = await this.publicClient.readContract({
                    address: addr,
                    abi: PARI_MATCH_BASE_INLINE_ABI,
                    functionName: 'getMarketCore',
                    args: [BigInt(id)],
                }) as { state: number };
                if (core.state === MarketState.Open) toClose.push(BigInt(id));
            } catch (err: any) {
                logger.warn('resolveMarketsByScore: getMarketCore failed', { contractAddress, id, error: err?.message ?? err });
            }
        }

        if (toClose.length > 0) {
            try {
                const hash = await this.walletClient.writeContract({
                    chain: undefined,
                    address: addr,
                    abi: PARI_MATCH_BASE_INLINE_ABI,
                    functionName: 'closeMarketsBatch',
                    args: [toClose],
                });
                await this.publicClient.waitForTransactionReceipt({ hash, timeout: 120_000 });
                await delay();
                logger.info('Markets closed before resolve', { contractAddress, count: toClose.length });
            } catch (err: any) {
                logger.error('resolveMarketsByScore: closeMarketsBatch failed', { contractAddress, error: err?.message ?? err });
            }
        }

        // 2. Call resolveByScore — the contract sweeps every Closed market,
        //    computes the outcome, applies fees, and emits MarketResolved /
        //    MarketCancelled (for void markets).
        try {
            const hash = await this.walletClient.writeContract({
                chain: undefined,
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
            });
            const receipt = await this.publicClient.waitForTransactionReceipt({ hash, timeout: 180_000 });
            if (receipt.status === 'reverted') {
                throw new Error(`resolveByScore reverted (hash: ${hash})`);
            }
            await delay();
        } catch (err: any) {
            logger.error('resolveMarketsByScore: resolveByScore failed', { contractAddress, error: err?.message ?? err });
            return 0;
        }

        // 3. Re-read states to compute the count that actually transitioned
        //    to Resolved (void markets land in Cancelled — counted separately).
        let resolvedCount = 0;
        for (let id = 0; id < count; id++) {
            try {
                const core = await this.publicClient.readContract({
                    address: addr,
                    abi: PARI_MATCH_BASE_INLINE_ABI,
                    functionName: 'getMarketCore',
                    args: [BigInt(id)],
                }) as { state: number };
                if (core.state === MarketState.Resolved) resolvedCount++;
            } catch {
                // Silent — best-effort tally.
            }
        }
        logger.info('Markets resolved via resolveByScore', {
            contractAddress: contractAddress.slice(0, 10) + '…',
            resolvedCount,
            score,
        });
        return resolvedCount;
    }

    async closeOpenMarketsForMatch(contractAddress: string): Promise<CloseMarketsResult> {
        const addr = contractAddress as `0x${string}`;

        let count: number;
        try {
            count = Number(await this.publicClient.readContract({
                address: addr,
                abi: PARI_MATCH_BASE_INLINE_ABI,
                functionName: 'marketCount',
            }));
        } catch (err: any) {
            logger.error('closeOpenMarketsForMatch: failed to read marketCount', { contractAddress, error: err?.message ?? err });
            return { closed: 0, skipped: 0 };
        }
        if (count === 0) return { closed: 0, skipped: 0 };

        const openIds: bigint[] = [];
        for (let id = 0; id < count; id++) {
            try {
                const core = await this.publicClient.readContract({
                    address: addr,
                    abi: PARI_MATCH_BASE_INLINE_ABI,
                    functionName: 'getMarketCore',
                    args: [BigInt(id)],
                }) as { state: number };
                if (core.state === MarketState.Open) openIds.push(BigInt(id));
            } catch (err: any) {
                logger.warn('closeOpenMarketsForMatch: getMarketCore failed', { contractAddress, id, error: err?.message ?? err });
            }
        }

        const skipped = count - openIds.length;
        if (openIds.length === 0) {
            logger.debug('closeOpenMarketsForMatch: no Open markets', { contractAddress, skipped });
            return { closed: 0, skipped };
        }

        try {
            const hash = await this.walletClient.writeContract({
                chain: undefined,
                address: addr,
                abi: PARI_MATCH_BASE_INLINE_ABI,
                functionName: 'closeMarketsBatch',
                args: [openIds],
            });
            await this.publicClient.waitForTransactionReceipt({ hash, timeout: 90_000 });
            await delay();
            logger.info('Markets closed (batch)', {
                contractAddress: contractAddress.slice(0, 10) + '…',
                closed: openIds.length,
                ids: openIds.map(Number),
                txHash: hash,
            });
            return { closed: openIds.length, skipped };
        } catch (err: any) {
            logger.error('closeOpenMarketsForMatch: closeMarketsBatch failed', {
                contractAddress,
                ids: openIds.map(Number),
                error: err?.message ?? err,
            });
            return { closed: 0, skipped };
        }
    }

    async cancelOpenMarketsForMatch(contractAddress: string, reason: string): Promise<CancelMarketsResult> {
        const addr = contractAddress as `0x${string}`;
        const TERMINAL = new Set<number>([MarketState.Resolved, MarketState.Cancelled]);

        let count: number;
        try {
            count = Number(await this.publicClient.readContract({
                address: addr,
                abi: PARI_MATCH_BASE_INLINE_ABI,
                functionName: 'marketCount',
            }));
        } catch (err: any) {
            logger.error('cancelOpenMarketsForMatch: failed to read marketCount', { contractAddress, error: err?.message ?? err });
            return { cancelled: 0, skipped: 0 };
        }
        if (count === 0) return { cancelled: 0, skipped: 0 };

        let cancelled = 0;
        let skipped = 0;
        for (let id = 0; id < count; id++) {
            try {
                const core = await this.publicClient.readContract({
                    address: addr,
                    abi: PARI_MATCH_BASE_INLINE_ABI,
                    functionName: 'getMarketCore',
                    args: [BigInt(id)],
                }) as { state: number };
                if (TERMINAL.has(core.state)) {
                    skipped++;
                    continue;
                }
                const hash = await this.walletClient.writeContract({
                    chain: undefined,
                    address: addr,
                    abi: PARI_MATCH_BASE_INLINE_ABI,
                    functionName: 'cancelMarket',
                    args: [BigInt(id), reason],
                });
                await this.publicClient.waitForTransactionReceipt({ hash, timeout: 90_000 });
                await delay();
                cancelled++;
                logger.info('Market cancelled', {
                    contractAddress: contractAddress.slice(0, 10) + '…',
                    id, reason, txHash: hash,
                });
            } catch (err: any) {
                logger.error('cancelOpenMarketsForMatch: cancelMarket failed', {
                    contractAddress, id, reason, error: err?.message ?? err,
                });
            }
        }
        return { cancelled, skipped };
    }

    getAdminAddress(): string {
        return this.account.address;
    }
}
