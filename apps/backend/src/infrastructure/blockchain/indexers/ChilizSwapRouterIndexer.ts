import { injectable, inject } from 'tsyringe';
import { createPublicClient, http, parseAbiItem, type Log } from 'viem';
import { chainFor } from '@chiliztv/blockchain';
import { networkType } from '../../config/chiliz.config';
import { logger } from '../../logging/logger';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { INetworkConfig } from '@chiliztv/domain/shared/ports/INetworkConfig';
import { IIndexerCheckpointRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IIndexerCheckpointRepository';
import { IMarketEventRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IMarketEventRepository';
import type { ILockService } from '@chiliztv/domain/shared/ports/ILockService';
import { BaseIndexer, DEFAULT_TAIL_OVERLAP_BLOCKS } from './BaseIndexer';

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
// Fires inside fan-token swaps (CAP-20 wrap before [wrapped, WCHZ, USDC]) —
// lets analytics tell wrapped bets apart from plain ERC20 ones.
const FAN_TOKEN_WRAPPED = parseAbiItem(
    'event FanTokenWrapped(address indexed token, address indexed wrapped, uint256 amountIn, uint256 wrappedAmount)',
);

// Bet events carry a marketId in their payload; persisting them in
// `market_events` keeps the audit colocated with the PariMatch events.
// Donations/subscriptions are emitted twice (once here, once on StreamWallet)
// — keeping the router emission lets analytics attribute volume by asset
// path (CHZ vs token vs USDC) without joining wallet→router on-the-fly.
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
    FAN_TOKEN_WRAPPED,
];

/**
 * Audit-only indexer for the unified ChilizSwapRouter. Captures every
 * multi-asset entrypoint (bet/donate/subscribe via CHZ / token / USDC) so
 * analytics can attribute volume by asset path. Writes to `market_events`
 * with `event_name` carrying the router-side event identifier; `market_id`
 * is null for donations/subscriptions.
 */
@injectable()
export class ChilizSwapRouterIndexer extends BaseIndexer {
    private readonly routerAddress: `0x${string}`;

    constructor(
        @inject(TOKENS.IIndexerCheckpointRepository)
        checkpoints: IIndexerCheckpointRepository,
        @inject(TOKENS.IMarketEventRepository)
        private readonly marketEvents: IMarketEventRepository,
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
            // Handlers dedup on (tx_hash, log_index) before side effects — replay-safe.
            tailOverlapBlocks: DEFAULT_TAIL_OVERLAP_BLOCKS,
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
        // eslint-disable-next-line no-restricted-syntax -- block timestamp fallback
        const blockTimestamp = blockTimestamps.get(log.blockNumber) ?? new Date();
        // Bet events have a marketId; everything else (donation/subscription) doesn't.
        const marketIdRaw = (args as { marketId?: bigint }).marketId;
        const marketId = typeof marketIdRaw === 'bigint' ? marketIdRaw : null;
        // For bet events, contract_address should be the bettingMatch proxy
        // so the audit is colocated with PariMatch events on the same market.
        const bettingMatch = (args as { bettingMatch?: string }).bettingMatch;
        const contractAddress = (bettingMatch ?? this.routerAddress).toString().toLowerCase();
        await this.marketEvents.insertIfAbsent({
            coordinates: {
                transactionHash: log.transactionHash as `0x${string}`,
                logIndex: log.logIndex,
                blockNumber: log.blockNumber,
                blockTimestamp,
            },
            contractAddress,
            marketId,
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
