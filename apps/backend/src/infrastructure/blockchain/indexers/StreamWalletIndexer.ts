import { injectable, inject } from 'tsyringe';
import { createPublicClient, http, parseAbiItem, type Log } from 'viem';
import { chainFor } from '@chiliztv/blockchain';
import { networkType } from '../../config/chiliz.config';
import { supabaseClient as supabase } from '../../database/supabase/client';
import { logger } from '../../logging/logger';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { INetworkConfig } from '@chiliztv/domain/shared/ports/INetworkConfig';
import { IIndexerCheckpointRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IIndexerCheckpointRepository';
import { IStreamWalletRepository } from '@chiliztv/domain/stream-wallet/repositories/IStreamWalletRepository';
import { IChatRepository } from '@chiliztv/domain/chat/repositories/IChatRepository';
import { Donation } from '@chiliztv/domain/stream-wallet/entities/Donation';
import { Subscription } from '@chiliztv/domain/stream-wallet/entities/Subscription';
import { ChatMessage, MessageType } from '@chiliztv/domain/chat/entities/ChatMessage';
import type { ILockService } from '@chiliztv/domain/shared/ports/ILockService';
import { BaseIndexer } from './BaseIndexer';
import { getTokenDecimals } from '../utils/getTokenDecimals';
import { ResolveUserProfileUseCase } from '../../../application/users/use-cases/ResolveUserProfileUseCase';

const STREAM_WALLET_CREATED = parseAbiItem(
    'event StreamWalletCreated(address indexed streamer, address indexed wallet)',
);
const DONATION_RECEIVED = parseAbiItem(
    'event DonationReceived(address indexed donor, uint256 amount, string message, uint256 platformFee, uint256 streamerAmount)',
);
const SUBSCRIPTION_RECORDED = parseAbiItem(
    'event SubscriptionRecorded(address indexed subscriber, uint256 amount, uint256 duration, uint256 expiryTime)',
);
const REVENUE_WITHDRAWN = parseAbiItem(
    'event RevenueWithdrawn(address indexed streamer, uint256 amount)',
);
const PLATFORM_FEE_COLLECTED = parseAbiItem(
    'event PlatformFeeCollected(uint256 amount, address indexed treasury)',
);

const FACTORY_EVENTS = [STREAM_WALLET_CREATED];
const WALLET_EVENTS = [
    DONATION_RECEIVED,
    SUBSCRIPTION_RECORDED,
    REVENUE_WITHDRAWN,
    PLATFORM_FEE_COLLECTED,
];

const EXPIRY_CHECK_INTERVAL_MS = 60_000;

/**
 * Indexes the StreamWalletFactory + every StreamWallet proxy it creates.
 *
 * Source of truth for donations/subscriptions is the *wallet* contract (richer
 * payload — split fee/streamer amount on donation, expiryTime on sub) — not
 * the factory's DonationProcessed/SubscriptionProcessed events, which would
 * duplicate-write the same tx_hash with a different log_index. The factory
 * is only used for wallet discovery (StreamWalletCreated).
 */
@injectable()
export class StreamWalletIndexer extends BaseIndexer {
    private readonly factoryAddress: `0x${string}`;
    private knownWallets = new Set<`0x${string}`>();
    private expiryCheckTimer: ReturnType<typeof setInterval> | null = null;
    private usdcDecimalsCache: number | null = null;

    constructor(
        @inject(TOKENS.IIndexerCheckpointRepository)
        checkpoints: IIndexerCheckpointRepository,
        @inject(TOKENS.IStreamWalletRepository)
        private readonly streamWalletRepository: IStreamWalletRepository,
        @inject(TOKENS.IChatRepository)
        private readonly chatRepository: IChatRepository,
        @inject(TOKENS.INetworkConfig)
        private readonly network: INetworkConfig,
        @inject(ResolveUserProfileUseCase)
        private readonly resolveProfile: ResolveUserProfileUseCase,
        @inject(TOKENS.ILockService)
        lockService: ILockService,
    ) {
        const factoryAddress = network.streamWalletFactoryAddress as `0x${string}`;
        super({
            name: 'StreamWallet',
            contractAddress: factoryAddress,
            client: createPublicClient({
                chain: chainFor(networkType),
                transport: http(network.rpcUrl),
            }),
            checkpoints,
            lockService,
        });
        this.factoryAddress = factoryAddress;
    }

    async start(): Promise<void> {
        await this.hydrateKnownWallets();
        await super.start();
        this.startExpiredSubscriptionsCheck();
    }

    stop(): void {
        if (this.expiryCheckTimer) {
            clearInterval(this.expiryCheckTimer);
            this.expiryCheckTimer = null;
        }
        super.stop();
    }

    protected async processBatch(fromBlock: bigint, toBlock: bigint): Promise<void> {
        // Phase 1: factory events (wallet discovery).
        const factoryLogs = await this.client.getLogs({
            address: this.factoryAddress,
            events: FACTORY_EVENTS,
            fromBlock,
            toBlock,
        });

        const factoryBlockTs = await this.resolveBlockTimestamps(factoryLogs);
        for (const log of factoryLogs) {
            try {
                await this.handleFactoryLog(log, factoryBlockTs);
            } catch (err) {
                logger.error(`${this.indexerName}: factory log failed`, {
                    txHash: log.transactionHash,
                    error: err instanceof Error ? err.message : String(err),
                });
            }
        }

        // Phase 2: wallet events.
        const usdcDecimals = await this.getUsdcDecimals();
        const walletLogs = await this.client.getLogs({
            events: WALLET_EVENTS,
            fromBlock,
            toBlock,
        });
        const walletBlockTs = await this.resolveBlockTimestamps(walletLogs);

        for (const log of walletLogs) {
            try {
                await this.handleWalletLog(log, walletBlockTs, usdcDecimals);
            } catch (err) {
                logger.error(`${this.indexerName}: wallet log failed`, {
                    eventName: (log as { eventName?: string }).eventName,
                    txHash: log.transactionHash,
                    error: err instanceof Error ? err.message : String(err),
                });
            }
        }
    }

    private async handleFactoryLog(log: Log, blockTimestamps: Map<bigint, Date>): Promise<void> {
        const eventName = (log as { eventName?: string }).eventName;
        const args = (log as { args?: Record<string, unknown> }).args;
        if (eventName !== 'StreamWalletCreated' || !args || !log.transactionHash) return;

        const streamer = (args.streamer as string).toLowerCase();
        const wallet = (args.wallet as string).toLowerCase();

        if (await this.streamWalletRepository.findStreamWalletByTransactionHash(log.transactionHash)) {
            this.knownWallets.add(wallet as `0x${string}`);
            return;
        }
        await this.streamWalletRepository.saveStreamWallet(streamer, wallet, log.transactionHash);
        this.knownWallets.add(wallet as `0x${string}`);
        logger.info(`${this.indexerName}: discovered wallet`, { streamer, wallet });
    }

    private async handleWalletLog(
        log: Log,
        blockTimestamps: Map<bigint, Date>,
        usdcDecimals: number,
    ): Promise<void> {
        const eventName = (log as { eventName?: string }).eventName;
        const args = (log as { args?: Record<string, unknown> }).args;
        if (!eventName || !args || !log.transactionHash || log.logIndex == null || log.blockNumber == null) {
            return;
        }
        // eslint-disable-next-line no-restricted-syntax -- indexer block timestamp fallback
        const blockTimestamp = blockTimestamps.get(log.blockNumber) ?? new Date();
        const walletAddress = (log.address as string).toLowerCase();
        const streamerAddress = await this.lookupStreamerForWallet(walletAddress);

        switch (eventName) {
            case 'DonationReceived':
                await this.handleDonation(args, log.transactionHash, streamerAddress, walletAddress, blockTimestamp, usdcDecimals);
                return;
            case 'SubscriptionRecorded':
                await this.handleSubscription(args, log.transactionHash, streamerAddress, walletAddress, blockTimestamp, usdcDecimals);
                return;
            case 'RevenueWithdrawn':
                logger.info(`${this.indexerName}: RevenueWithdrawn`, {
                    streamer: streamerAddress,
                    amount: (args.amount as bigint).toString(),
                    txHash: log.transactionHash,
                });
                return;
            case 'PlatformFeeCollected':
                // Audit-only — already accounted in donations.platform_fee.
                return;
            default:
                return;
        }
    }

    private async handleDonation(
        args: Record<string, unknown>,
        txHash: string,
        streamerAddress: string | null,
        walletAddress: string,
        blockTimestamp: Date,
        usdcDecimals: number,
    ): Promise<void> {
        const a = args as unknown as {
            donor: string;
            amount: bigint;
            message: string;
            platformFee: bigint;
            streamerAmount: bigint;
        };

        if (await this.streamWalletRepository.findDonationByTransactionHash(txHash)) {
            return;
        }
        if (!streamerAddress) {
            return;
        }

        const decimals = 10 ** usdcDecimals;
        const donation = Donation.create({
            streamerAddress,
            donorAddress: a.donor,
            streamWalletAddress: walletAddress,
            amount: (Number(a.amount) / decimals).toString(),
            platformFee: (Number(a.platformFee) / decimals).toString(),
            streamerAmount: (Number(a.streamerAmount) / decimals).toString(),
            message: a.message || undefined,
            transactionHash: txHash,
            timestamp: blockTimestamp,
        });
        await this.streamWalletRepository.saveDonation(donation);

        const activeStream = await this.findActiveStream(streamerAddress, walletAddress);
        if (activeStream) {
            await this.postChatEvent('donation', activeStream, a.donor, (Number(a.amount) / decimals).toString(), a.message);
        }
    }

    private async handleSubscription(
        args: Record<string, unknown>,
        txHash: string,
        streamerAddress: string | null,
        walletAddress: string,
        blockTimestamp: Date,
        usdcDecimals: number,
    ): Promise<void> {
        const a = args as unknown as {
            subscriber: string;
            amount: bigint;
            duration: bigint;
            expiryTime: bigint;
        };

        if (await this.streamWalletRepository.findSubscriptionByTransactionHash(txHash)) {
            return;
        }
        if (!streamerAddress) {
            // Same rationale as `handleDonation`: foreign contract sharing
            // the topic signature — skip silently. `recoverStreamerFromContract`
            // already logs the `streamer()` revert at warn level when
            // appropriate, so we don't double-log here.
            return;
        }

        const decimals = 10 ** usdcDecimals;
        const PLATFORM_FEE_BPS = 500;
        const platformFee = (a.amount * BigInt(PLATFORM_FEE_BPS)) / BigInt(10_000);
        const streamerAmount = a.amount - platformFee;
        const startDate = blockTimestamp;
        const endDate = new Date(Number(a.expiryTime) * 1000);

        const subscription = Subscription.create({
            streamerAddress,
            subscriberAddress: a.subscriber,
            streamWalletAddress: walletAddress,
            durationSeconds: Number(a.duration),
            amount: (Number(a.amount) / decimals).toString(),
            platformFee: (Number(platformFee) / decimals).toString(),
            streamerAmount: (Number(streamerAmount) / decimals).toString(),
            startDate,
            endDate,
            transactionHash: txHash,
            status: 'active',
        });
        await this.streamWalletRepository.saveSubscription(subscription);

        const activeStream = await this.findActiveStream(streamerAddress, walletAddress);
        if (activeStream) {
            await this.postChatEvent('subscription', activeStream, a.subscriber, (Number(a.amount) / decimals).toString());
        }
    }

    private async hydrateKnownWallets(): Promise<void> {
        const { data, error } = await supabase
            .from('stream_wallets')
            .select('wallet_address');
        if (error) {
            logger.error(`${this.indexerName}: failed to hydrate known wallets`, { error: error.message });
            return;
        }
        for (const row of data ?? []) {
            if (row.wallet_address) {
                this.knownWallets.add((row.wallet_address as string).toLowerCase() as `0x${string}`);
            }
        }
        logger.info(`${this.indexerName}: hydrated ${this.knownWallets.size} known wallets`);
    }

    private async lookupStreamerForWallet(walletAddress: string): Promise<string | null> {
        const { data, error } = await supabase
            .from('stream_wallets')
            .select('streamer_address')
            .eq('wallet_address', walletAddress.toLowerCase())
            .maybeSingle();
        if (!error && data) {
            return (data.streamer_address as string).toLowerCase();
        }
        // Self-heal — the DB doesn't know this wallet (factory event missed,
        // re-org, or the deploy happened before this indexer started). Read
        // `streamer()` directly off the proxy and backfill the mapping so
        // every subsequent lookup hits the cache.
        return this.recoverStreamerFromContract(walletAddress);
    }

    private async recoverStreamerFromContract(walletAddress: string): Promise<string | null> {
        try {
            const streamer = (await this.client.readContract({
                address: walletAddress as `0x${string}`,
                abi: [
                    parseAbiItem('function streamer() view returns (address)'),
                ],
                functionName: 'streamer',
            })) as `0x${string}`;
            if (!streamer || streamer === '0x0000000000000000000000000000000000000000') {
                return null;
            }
            const lower = streamer.toLowerCase();
            // Best-effort persist — keyed by wallet_address; we don't have
            // the deploy txHash here so we use a synthetic placeholder.
            // Unique-violation on tx_hash (later, when the indexer sees the
            // factory event) is swallowed by the repo (PG code 23505).
            await this.streamWalletRepository.saveStreamWallet(
                lower,
                walletAddress.toLowerCase(),
                `recovered:${walletAddress.toLowerCase()}`,
            );
            logger.info(`${this.indexerName}: recovered wallet→streamer mapping`, {
                wallet: walletAddress,
                streamer: lower,
            });
            this.knownWallets.add(walletAddress.toLowerCase() as `0x${string}`);
            return lower;
        } catch (err) {
            // Expected for any contract that emitted a matching topic
            // signature but isn't a `StreamWallet` proxy. Logged at debug
            // level only so the noise floor stays clean — switching the
            // logger to debug surfaces these for troubleshooting.
            logger.debug(`${this.indexerName}: streamer() read failed`, {
                wallet: walletAddress,
                error: err instanceof Error ? err.message : String(err),
            });
            return null;
        }
    }

    private async findActiveStream(
        streamerAddress: string,
        walletAddress: string,
    ): Promise<{ matchId: number; streamId: string } | null> {
        try {
            const conditions = [streamerAddress, walletAddress]
                .map((a) => `streamer_wallet_address.ilike.${a.toLowerCase()}`)
                .join(',');
            const { data, error } = await supabase
                .from('live_streams')
                .select('id, match_id')
                .or(conditions)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            if (error || !data) return null;
            return { matchId: data.match_id, streamId: data.id };
        } catch {
            return null;
        }
    }

    private async postChatEvent(
        type: 'donation' | 'subscription',
        active: { matchId: number; streamId: string },
        userAddress: string,
        amount: string,
        extra?: string,
    ): Promise<void> {
        try {
            // Resolve the human display name first — falls through to the
            // truncated address only if both the `users` cache AND the
            // multi-source fallback come up empty. The system-event chat
            // row is the most visible surface for this string.
            const profile = await this.resolveProfile.execute(userAddress);
            const display = profile.username
                ?? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
            const formatted = parseFloat(amount).toFixed(2);
            const message = type === 'donation'
                ? `🎁 ${display} donated ${formatted} USDC${extra ? `: "${extra}"` : ''}`
                : `⭐ ${display} subscribed for ${formatted} USDC`;

            await this.chatRepository.saveMessage(ChatMessage.create({
                matchId: active.matchId,
                userId: 'system',
                walletAddress: userAddress,
                username: 'System',
                message,
                type: MessageType.SYSTEM,
                systemType: type,
                isFeatured: false,
                streamId: active.streamId,
            }));
        } catch (err) {
            logger.error(`${this.indexerName}: chat ${type} message failed`, {
                error: err instanceof Error ? err.message : String(err),
            });
        }
    }

    private startExpiredSubscriptionsCheck(): void {
        this.expiryCheckTimer = setInterval(async () => {
            try {
                const count = await this.streamWalletRepository.markExpiredSubscriptions();
                if (count > 0) {
                    logger.info(`${this.indexerName}: marked ${count} subscriptions as expired`);
                }
            } catch (err) {
                logger.error(`${this.indexerName}: expiry check failed`, {
                    error: err instanceof Error ? err.message : String(err),
                });
            }
        }, EXPIRY_CHECK_INTERVAL_MS);
    }

    private async getUsdcDecimals(): Promise<number> {
        if (this.usdcDecimalsCache !== null) return this.usdcDecimalsCache;
        if (!this.network.usdcAddress) {
            this.usdcDecimalsCache = 6;
            return 6;
        }
        const decimals = await getTokenDecimals(this.client, this.network.usdcAddress as `0x${string}`);
        this.usdcDecimalsCache = decimals;
        return decimals;
    }
}
