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
    MarketState as MarketStateEnum,
} from '@chiliztv/domain/shared/ports/IBlockchainService';
import {
    PARI_MATCH_FACTORY_INLINE_ABI,
    PARI_MATCH_BASE_INLINE_ABI,
    FOOTBALL_PARI_MATCH_INLINE_ABI,
    chainFor,
} from '@chiliztv/blockchain';
import { FOOTBALL_SEEDING_PAYLOAD, getFootballSeedingPayload } from '../markets/seedingPayload';
import { logger } from '../../logging/logger';

/* eslint-disable @typescript-eslint/no-explicit-any */

const MARKET_CREATED_TOPIC = keccak256(toBytes('MatchCreated(address,uint8,address)'));
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

    /**
     * Seeds the canonical 8-market lineup. Single source of truth is
     * {@link FOOTBALL_SEEDING_PAYLOAD}; this path MUST stay behaviour-
     * equivalent with {@link PariMatchDeploymentAdapter.setupDefaultMarkets}.
     * The behavioural-equivalence test asserts both adapters send the same
     * args to addMarketsBatch + openMarketsBatch — don't fork the payload here.
     */
    async setupDefaultMarkets(contractAddress: string, opts?: { isKnockout: boolean }): Promise<void> {
        const addr = contractAddress as `0x${string}`;
        const isKnockout = opts?.isKnockout === true;
        const { hashes, lines, marketIds } = getFootballSeedingPayload({ isKnockout });

        const sendAndWait = async (fn: () => Promise<`0x${string}`>) => {
            const hash = await fn();
            const receipt = await this.publicClient.waitForTransactionReceipt({ hash, timeout: 90_000 });
            if (receipt.status === 'reverted') {
                throw new Error(`Transaction reverted on-chain (hash: ${hash})`);
            }
            await delay();
        };

        logger.info('Adding default parimutuel markets', { contractAddress, count: hashes.length, isKnockout });
        // Knockout matches need a higher gas limit to fit the extra
        // FULL_TIME_WINNER market in the addMarketsBatch call.
        await sendAndWait(() => this.walletClient.writeContract({
            chain: undefined,
            address: addr,
            abi: PARI_MATCH_BASE_INLINE_ABI,
            functionName: 'addMarketsBatch',
            args: [hashes, lines],
            gas: isKnockout ? 3_400_000n : 3_000_000n,
        }));

        logger.info('Opening markets', { contractAddress, count: marketIds.length });
        await sendAndWait(() => this.walletClient.writeContract({
            chain: undefined,
            address: addr,
            abi: PARI_MATCH_BASE_INLINE_ABI,
            functionName: 'openMarketsBatch',
            args: [marketIds],
            gas: isKnockout ? 1_600_000n : 1_400_000n,
        }));

        logger.info('Default markets created and opened', { contractAddress, count: hashes.length, isKnockout });
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
            // Default AET aggregate to the 90' score so FULL_TIME_WINNER
            // resolves consistently with the 90' winner for non-knockout
            // matches. penWinner=255 means "no shootout occurred".
            const aetHomeGoals = score.aetHomeGoals ?? score.homeGoals;
            const aetAwayGoals = score.aetAwayGoals ?? score.awayGoals;
            const penWinner = score.penWinner ?? 255;

            const hash = await this.walletClient.writeContract({
                chain: undefined,
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

    /**
     * Single-step `resolveByScore` — caller is expected to have already
     * Closed the markets they want resolved. The HALFTIME early-resolution
     * path closes marketId=1 manually then calls this; only Closed markets
     * resolve, the rest stay Open.
     *
     * Returns the count of markets that transitioned to `Resolved`. Markets
     * cancelled by the contract's void protection (winningPool == 0) are
     * NOT counted in this number — caller can diff getMarketCore states
     * pre/post to count them separately.
     */
    async resolveAlreadyClosedMarkets(contractAddress: string, score: FootballScoreInput): Promise<number> {
        const addr = contractAddress as `0x${string}`;

        let count: number;
        try {
            count = Number(await this.publicClient.readContract({
                address: addr,
                abi: PARI_MATCH_BASE_INLINE_ABI,
                functionName: 'marketCount',
            }));
        } catch (err: any) {
            logger.error('resolveAlreadyClosedMarkets: failed to read marketCount', { contractAddress, error: err?.message ?? err });
            return 0;
        }
        if (count === 0) return 0;

        // Snapshot pre-resolve states so we can compute the diff. Markets
        // that were already terminal (Resolved/Cancelled) before our tx
        // shouldn't be attributed to it.
        const preStates: number[] = [];
        for (let id = 0; id < count; id++) {
            try {
                const core = await this.publicClient.readContract({
                    address: addr,
                    abi: PARI_MATCH_BASE_INLINE_ABI,
                    functionName: 'getMarketCore',
                    args: [BigInt(id)],
                }) as { state: number };
                preStates.push(core.state);
            } catch {
                preStates.push(-1);
            }
        }

        try {
            // Same defaults as the full-resolve path (see resolveMarketsByScore).
            const aetHomeGoals = score.aetHomeGoals ?? score.homeGoals;
            const aetAwayGoals = score.aetAwayGoals ?? score.awayGoals;
            const penWinner = score.penWinner ?? 255;

            const hash = await this.walletClient.writeContract({
                chain: undefined,
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
            });
            const receipt = await this.publicClient.waitForTransactionReceipt({ hash, timeout: 180_000 });
            if (receipt.status === 'reverted') {
                throw new Error(`resolveByScore reverted (hash: ${hash})`);
            }
            await delay();
        } catch (err: any) {
            logger.error('resolveAlreadyClosedMarkets: resolveByScore failed', { contractAddress, error: err?.message ?? err });
            return 0;
        }

        let newlyResolved = 0;
        for (let id = 0; id < count; id++) {
            try {
                const core = await this.publicClient.readContract({
                    address: addr,
                    abi: PARI_MATCH_BASE_INLINE_ABI,
                    functionName: 'getMarketCore',
                    args: [BigInt(id)],
                }) as { state: number };
                if (core.state === MarketState.Resolved && preStates[id] !== MarketState.Resolved) {
                    newlyResolved++;
                }
            } catch {
                // Silent — best-effort tally.
            }
        }
        logger.info('Markets resolved via resolveByScore (no pre-close)', {
            contractAddress: contractAddress.slice(0, 10) + '…',
            newlyResolved,
            score,
        });
        return newlyResolved;
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

    /**
     * Close a caller-specified subset of markets. Used by the HALFTIME
     * early-resolution path which closes ONLY marketId=1 — the other 7
     * markets stay Open so live bets keep flowing. Idempotent on already-
     * non-Open markets (the contract `closeMarketsBatch` skips them).
     */
    async closeMarketsByIds(contractAddress: string, marketIds: ReadonlyArray<bigint>): Promise<CloseMarketsResult> {
        const addr = contractAddress as `0x${string}`;
        if (marketIds.length === 0) return { closed: 0, skipped: 0 };

        // Filter to ids whose state is currently Open — `closeMarketsBatch` is
        // idempotent but a tx with all-skipped ids burns gas for nothing.
        const openIds: bigint[] = [];
        let skipped = 0;
        for (const id of marketIds) {
            try {
                const core = await this.publicClient.readContract({
                    address: addr,
                    abi: PARI_MATCH_BASE_INLINE_ABI,
                    functionName: 'getMarketCore',
                    args: [id],
                }) as { state: number };
                if (core.state === MarketState.Open) openIds.push(id);
                else skipped++;
            } catch (err: any) {
                logger.warn('closeMarketsByIds: getMarketCore failed', { contractAddress, id: Number(id), error: err?.message ?? err });
                skipped++;
            }
        }

        if (openIds.length === 0) return { closed: 0, skipped };

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
            logger.info('Markets closed (subset)', {
                contractAddress: contractAddress.slice(0, 10) + '…',
                closed: openIds.length,
                ids: openIds.map(Number),
                txHash: hash,
            });
            return { closed: openIds.length, skipped };
        } catch (err: any) {
            logger.error('closeMarketsByIds: closeMarketsBatch failed', {
                contractAddress, ids: openIds.map(Number), error: err?.message ?? err,
            });
            return { closed: 0, skipped };
        }
    }

    /**
     * Cancel a single market. Returns cancelled: 1 on success, 0 if the
     * market was already in a terminal state (Resolved/Cancelled) at the
     * pre-flight read — avoids burning gas on guaranteed-revert paths.
     */
    async cancelMarket(contractAddress: string, marketId: bigint, reason: string): Promise<CancelMarketsResult> {
        const addr = contractAddress as `0x${string}`;
        const TERMINAL = new Set<number>([MarketState.Resolved, MarketState.Cancelled]);

        try {
            const core = await this.publicClient.readContract({
                address: addr,
                abi: PARI_MATCH_BASE_INLINE_ABI,
                functionName: 'getMarketCore',
                args: [marketId],
            }) as { state: number };
            if (TERMINAL.has(core.state)) return { cancelled: 0, skipped: 1 };
        } catch (err: any) {
            logger.warn('cancelMarket: pre-flight getMarketCore failed', {
                contractAddress, marketId: Number(marketId), error: err?.message ?? err,
            });
            return { cancelled: 0, skipped: 0 };
        }

        try {
            const hash = await this.walletClient.writeContract({
                chain: undefined,
                address: addr,
                abi: PARI_MATCH_BASE_INLINE_ABI,
                functionName: 'cancelMarket',
                args: [marketId, reason],
            });
            await this.publicClient.waitForTransactionReceipt({ hash, timeout: 90_000 });
            await delay();
            logger.info('Market cancelled (single)', {
                contractAddress: contractAddress.slice(0, 10) + '…',
                marketId: Number(marketId), reason, txHash: hash,
            });
            return { cancelled: 1, skipped: 0 };
        } catch (err: any) {
            logger.error('cancelMarket: cancel tx failed', {
                contractAddress, marketId: Number(marketId), reason, error: err?.message ?? err,
            });
            return { cancelled: 0, skipped: 0 };
        }
    }

    /**
     * Cheap pre-flight read used by callers that want to know a market's
     * state before issuing a tx. Returns null on invalid marketId.
     */
    async getMarketState(contractAddress: string, marketId: bigint): Promise<MarketStateEnum | null> {
        const addr = contractAddress as `0x${string}`;
        try {
            const core = await this.publicClient.readContract({
                address: addr,
                abi: PARI_MATCH_BASE_INLINE_ABI,
                functionName: 'getMarketCore',
                args: [marketId],
            }) as { state: number };
            return core.state as MarketStateEnum;
        } catch {
            return null;
        }
    }

    getAdminAddress(): string {
        return this.account.address;
    }
}
