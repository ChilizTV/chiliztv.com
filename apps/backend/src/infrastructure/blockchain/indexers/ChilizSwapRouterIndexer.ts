import { injectable, inject } from 'tsyringe';
import { createPublicClient, http, parseAbiItem, type Log } from 'viem';
import { chainFor } from '@chiliztv/blockchain';
import { networkType } from '../../config/chiliz.config';
import { logger } from '../../logging/logger';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { INetworkConfig } from '@chiliztv/domain/shared/ports/INetworkConfig';
import { IIndexerCheckpointRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IIndexerCheckpointRepository';
import { IPoolEventRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IPoolEventRepository';
import type { ILockService } from '@chiliztv/domain/shared/ports/ILockService';
import { BaseIndexer } from './BaseIndexer';

const BET_PLACED_VIA_CHZ = parseAbiItem(
    'event BetPlacedViaCHZ(address indexed bettingMatch, address indexed user, uint256 chzSpent, uint256 usdcReceived, uint256 marketId, uint64 selection)',
);
const BET_PLACED_VIA_TOKEN = parseAbiItem(
    'event BetPlacedViaToken(address indexed bettingMatch, address indexed user, address indexed token, uint256 tokenSpent, uint256 usdcReceived, uint256 marketId, uint64 selection)',
);
const BET_PLACED_WITH_USDC = parseAbiItem(
    'event BetPlacedWithUSDC(address indexed bettingMatch, address indexed user, uint256 amount, uint256 marketId, uint64 selection)',
);
const DONATION_WITH_CHZ = parseAbiItem(
    'event DonationWithCHZ(address indexed donor, address indexed streamer, uint256 chzSpent, uint256 usdcDonated, uint256 platformFee, string message)',
);
const DONATION_WITH_TOKEN = parseAbiItem(
    'event DonationWithToken(address indexed donor, address indexed streamer, address indexed token, uint256 tokenSpent, uint256 usdcDonated, uint256 platformFee, string message)',
);
const DONATION_WITH_USDC = parseAbiItem(
    'event DonationWithUSDCEvent(address indexed donor, address indexed streamer, uint256 amount, uint256 platformFee, string message)',
);
const SUBSCRIPTION_WITH_CHZ = parseAbiItem(
    'event SubscriptionWithCHZ(address indexed subscriber, address indexed streamer, uint256 chzSpent, uint256 usdcPaid, uint256 platformFee, uint256 duration)',
);
const SUBSCRIPTION_WITH_TOKEN = parseAbiItem(
    'event SubscriptionWithToken(address indexed subscriber, address indexed streamer, address indexed token, uint256 tokenSpent, uint256 usdcPaid, uint256 platformFee, uint256 duration)',
);
const SUBSCRIPTION_WITH_USDC = parseAbiItem(
    'event SubscriptionWithUSDCEvent(address indexed subscriber, address indexed streamer, uint256 amount, uint256 platformFee, uint256 duration)',
);
const LIQUIDITY_DEPOSITED_WITH_CHZ = parseAbiItem(
    'event LiquidityDepositedWithCHZ(address indexed depositor, address indexed receiver, uint256 chzSpent, uint256 usdcReceived, uint256 sharesMinted)',
);
const LIQUIDITY_DEPOSITED_WITH_TOKEN = parseAbiItem(
    'event LiquidityDepositedWithToken(address indexed depositor, address indexed receiver, address indexed token, uint256 tokenSpent, uint256 usdcReceived, uint256 sharesMinted)',
);
const LIQUIDITY_DEPOSITED_WITH_USDC = parseAbiItem(
    'event LiquidityDepositedWithUSDC(address indexed depositor, address indexed receiver, uint256 amount, uint256 sharesMinted)',
);
const TREASURY_SET = parseAbiItem('event TreasurySet(address indexed oldTreasury, address indexed newTreasury)');
const PLATFORM_FEE_SET = parseAbiItem('event PlatformFeeBpsSet(uint16 oldFeeBps, uint16 newFeeBps)');
const MATCH_FACTORY_SET = parseAbiItem('event MatchFactorySet(address indexed oldFactory, address indexed newFactory)');
const STREAM_WALLET_FACTORY_SET = parseAbiItem('event StreamWalletFactorySet(address indexed oldFactory, address indexed newFactory)');
const ROUTER_LIQUIDITY_POOL_SET = parseAbiItem('event LiquidityPoolSet(address indexed oldPool, address indexed newPool)');

const ALL_EVENTS = [
    BET_PLACED_VIA_CHZ,
    BET_PLACED_VIA_TOKEN,
    BET_PLACED_WITH_USDC,
    DONATION_WITH_CHZ,
    DONATION_WITH_TOKEN,
    DONATION_WITH_USDC,
    SUBSCRIPTION_WITH_CHZ,
    SUBSCRIPTION_WITH_TOKEN,
    SUBSCRIPTION_WITH_USDC,
    LIQUIDITY_DEPOSITED_WITH_CHZ,
    LIQUIDITY_DEPOSITED_WITH_TOKEN,
    LIQUIDITY_DEPOSITED_WITH_USDC,
    TREASURY_SET,
    PLATFORM_FEE_SET,
    MATCH_FACTORY_SET,
    STREAM_WALLET_FACTORY_SET,
    ROUTER_LIQUIDITY_POOL_SET,
];

/**
 * Audit-only indexer for the unified ChilizSwapRouter. Every multi-asset
 * entrypoint (bet/donate/subscribe/depositLiquidity via CHZ / token / USDC)
 * lands in `pool_events` so analytics can attribute volume by asset path.
 *
 * The pool-side accounting (BetRecorded, Deposit, etc.) is captured by the
 * LiquidityPoolIndexer; this one is purely about *how* each user reached
 * the pool.
 */
@injectable()
export class ChilizSwapRouterIndexer extends BaseIndexer {
    private readonly routerAddress: `0x${string}`;

    constructor(
        @inject(TOKENS.IIndexerCheckpointRepository)
        checkpoints: IIndexerCheckpointRepository,
        @inject(TOKENS.IPoolEventRepository)
        private readonly poolEvents: IPoolEventRepository,
        @inject(TOKENS.INetworkConfig)
        private readonly network: INetworkConfig,
        @inject(TOKENS.ILockService)
        lockService: ILockService,
    ) {
        const routerAddress = network.swapRouterAddress as `0x${string}`;
        super({
            name: 'ChilizSwapRouter',
            contractAddress: routerAddress,
            client: createPublicClient({
                chain: chainFor(networkType),
                transport: http(network.rpcUrl),
            }),
            checkpoints,
            lockService,
        });
        this.routerAddress = routerAddress;
    }

    protected async processBatch(fromBlock: bigint, toBlock: bigint): Promise<void> {
        const logs = await this.client.getLogs({
            address: this.routerAddress,
            events: ALL_EVENTS,
            fromBlock,
            toBlock,
        });
        if (logs.length === 0) return;

        logger.info(`${this.indexerName}: ${logs.length} log(s) in range`, {
            fromBlock: fromBlock.toString(),
            toBlock: toBlock.toString(),
        });

        const blockTimestamps = await this.resolveBlockTimestamps(logs);

        for (const log of logs) {
            try {
                await this.audit(log, blockTimestamps);
            } catch (err) {
                logger.error(`${this.indexerName}: failed to audit log`, {
                    eventName: (log as { eventName?: string }).eventName,
                    txHash: log.transactionHash,
                    error: err instanceof Error ? err.message : String(err),
                });
            }
        }
    }

    private async audit(log: Log, blockTimestamps: Map<bigint, Date>): Promise<void> {
        const eventName = (log as { eventName?: string }).eventName;
        const args = (log as { args?: Record<string, unknown> }).args;
        if (!eventName || !args || !log.transactionHash || log.logIndex == null || log.blockNumber == null) {
            return;
        }
        // eslint-disable-next-line no-restricted-syntax -- indexer block timestamp fallback
        const blockTimestamp = blockTimestamps.get(log.blockNumber) ?? new Date();
        await this.poolEvents.insertIfAbsent({
            coordinates: {
                transactionHash: log.transactionHash as `0x${string}`,
                logIndex: log.logIndex,
                blockNumber: log.blockNumber,
                blockTimestamp,
            },
            contractAddress: this.routerAddress,
            eventName,
            payload: serialize(args),
        });
    }
}

function serialize(value: unknown): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        if (typeof val === 'bigint') {
            out[key] = val.toString();
        } else if (typeof val === 'string' && val.startsWith('0x') && val.length === 42) {
            out[key] = val.toLowerCase();
        } else {
            out[key] = val;
        }
    }
    return out;
}
