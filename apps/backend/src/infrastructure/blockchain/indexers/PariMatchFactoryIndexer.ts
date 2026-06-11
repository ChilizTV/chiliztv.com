import { injectable, inject } from 'tsyringe';
import {
    createPublicClient,
    http,
    keccak256,
    toBytes,
    parseAbiItem,
    type Log,
    zeroAddress,
} from 'viem';
import { chainFor } from '@chiliztv/blockchain';
import { networkType } from '../../config/chiliz.config';
import { supabaseClient as supabase } from '../../database/supabase/client';
import { logger } from '../../logging/logger';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { INetworkConfig } from '@chiliztv/domain/shared/ports/INetworkConfig';
import { IIndexerCheckpointRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IIndexerCheckpointRepository';
import { IWiringAlertRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IWiringAlertRepository';
import { WiringStep } from '@chiliztv/domain/blockchain-indexing/entities/WiringAlert';
import type { ILockService } from '@chiliztv/domain/shared/ports/ILockService';
import { BaseIndexer, DEFAULT_TAIL_OVERLAP_BLOCKS } from './BaseIndexer';

const MATCH_CREATED = parseAbiItem(
    'event MatchCreated(address indexed proxy, uint8 sportType, address indexed owner)',
);
const WIRING_SET = parseAbiItem(
    'event WiringSet(address indexed usdcToken, address indexed feeRecipient, address indexed swapRouter)',
);
const LEADERBOARD_WIRING_SET = parseAbiItem(
    'event LeaderboardWiringSet(address indexed leaderboard, uint16 leaderboardFeeBps)',
);

const ALL_EVENTS = [MATCH_CREATED, WIRING_SET, LEADERBOARD_WIRING_SET];

const SWAP_ROUTER_ROLE = keccak256(toBytes('SWAP_ROUTER_ROLE'));
const RESOLVER_ROLE = keccak256(toBytes('RESOLVER_ROLE'));

const READ_ABI = [
    { type: 'function', name: 'usdcToken', inputs: [], outputs: [{ type: 'address' }], stateMutability: 'view' },
    { type: 'function', name: 'feeRecipient', inputs: [], outputs: [{ type: 'address' }], stateMutability: 'view' },
    { type: 'function', name: 'hasRole', inputs: [{ type: 'bytes32' }, { type: 'address' }], outputs: [{ type: 'bool' }], stateMutability: 'view' },
] as const;

/**
 * Listens for `MatchCreated` on the PariMatchFactory and validates that the
 * freshly-deployed proxy has been fully wired (usdcToken, feeRecipient,
 * SWAP_ROUTER_ROLE, RESOLVER_ROLE). Emits a `wiring_alerts` row when steps
 * are missing so ops can fix it without manual inspection.
 *
 * Parimutuel removes the LP wiring check — no more pool.authorizeMatch.
 */
@injectable()
export class PariMatchFactoryIndexer extends BaseIndexer {
    private readonly factoryAddress: `0x${string}`;
    private readonly swapRouterAddress: `0x${string}`;
    private readonly oracleAddress: `0x${string}`;

    constructor(
        @inject(TOKENS.IIndexerCheckpointRepository)
        checkpoints: IIndexerCheckpointRepository,
        @inject(TOKENS.IWiringAlertRepository)
        private readonly wiringAlerts: IWiringAlertRepository,
        @inject(TOKENS.INetworkConfig)
        private readonly network: INetworkConfig,
        @inject(TOKENS.ILockService)
        lockService: ILockService,
    ) {
        const factoryAddress = network.pariMatchFactoryAddress as `0x${string}`;
        super({
            name: 'PariMatchFactory',
            contractAddress: factoryAddress,
            client: createPublicClient({
                chain: chainFor(networkType),
                transport: http(network.rpcUrl),
            }),
            checkpoints,
            lockService,
            // Handlers dedup on (tx_hash, log_index) before side effects — replay-safe.
            tailOverlapBlocks: DEFAULT_TAIL_OVERLAP_BLOCKS,
        });
        this.factoryAddress = factoryAddress;
        this.swapRouterAddress = network.swapRouterAddress as `0x${string}`;
        this.oracleAddress = this.deriveOracleAddress();
    }

    protected async processBatch(fromBlock: bigint, toBlock: bigint): Promise<void> {
        const logs = await this.client.getLogs({
            address: this.factoryAddress,
            events: ALL_EVENTS,
            fromBlock,
            toBlock,
        });
        if (logs.length === 0) return;

        for (const log of logs) {
            const eventName = (log as { eventName?: string }).eventName;
            const args = (log as { args?: Record<string, unknown> }).args;
            if (!eventName || !args) continue;
            try {
                if (eventName === 'MatchCreated') {
                    await this.handleMatchCreated(log, args);
                }
            } catch (err) {
                logger.error(`${this.indexerName}: failed to process log`, {
                    eventName,
                    txHash: log.transactionHash,
                    error: err instanceof Error ? err.message : String(err),
                });
            }
        }
    }

    private async handleMatchCreated(log: Log, args: Record<string, unknown>): Promise<void> {
        const proxy = (args.proxy as string).toLowerCase();
        const sportType = Number(args.sportType ?? 0);
        const ownerAddr = (args.owner as string).toLowerCase();

        logger.info(`${this.indexerName}: MatchCreated`, {
            proxy,
            sportType,
            owner: ownerAddr,
            txHash: log.transactionHash,
        });

        await this.ensureMatchRow(proxy);

        const missingSteps = await this.detectMissingWiring(proxy);
        if (missingSteps.length > 0) {
            logger.error(`${this.indexerName}: incomplete wiring on freshly-deployed match`, {
                match: proxy,
                missingSteps,
            });
            await this.wiringAlerts.upsert(proxy, missingSteps);
        } else {
            logger.info(`${this.indexerName}: wiring OK for ${proxy}`);
        }
    }

    private async detectMissingWiring(matchAddress: string): Promise<WiringStep[]> {
        const match = matchAddress as `0x${string}`;
        const missing: WiringStep[] = [];

        const [usdcToken, feeRecipient, swapRouterRoleOk, resolverRoleOk] = await Promise.all([
            this.read(match, 'usdcToken', []),
            this.read(match, 'feeRecipient', []),
            this.read(match, 'hasRole', [SWAP_ROUTER_ROLE, this.swapRouterAddress]),
            this.read(match, 'hasRole', [RESOLVER_ROLE, this.oracleAddress]),
        ]);

        if ((usdcToken as string).toLowerCase() === zeroAddress.toLowerCase()) missing.push('setUSDCToken');
        if ((feeRecipient as string).toLowerCase() === zeroAddress.toLowerCase()) missing.push('setFeeRecipient');
        if (!swapRouterRoleOk) missing.push('grantRole.SWAP_ROUTER_ROLE');
        if (this.oracleAddress.toLowerCase() !== zeroAddress.toLowerCase() && !resolverRoleOk) {
            missing.push('grantRole.RESOLVER_ROLE');
        }
        return missing;
    }

    private async read<T = unknown>(address: `0x${string}`, functionName: 'usdcToken' | 'feeRecipient' | 'hasRole', args: readonly unknown[]): Promise<T> {
        try {
            return (await this.client.readContract({
                address,
                abi: READ_ABI,
                functionName,
                args: args as never,
            })) as T;
        } catch (err) {
            logger.warn(`${this.indexerName}: read ${functionName} failed`, {
                address,
                error: err instanceof Error ? err.message : String(err),
            });
            return (functionName === 'hasRole' ? false : zeroAddress) as T;
        }
    }

    private async ensureMatchRow(proxy: string): Promise<void> {
        try {
            const { data, error } = await supabase
                .from('matches')
                .select('api_football_id')
                .eq('betting_contract_address', proxy)
                .limit(1);
            if (error) throw error;
            if (!data || data.length === 0) {
                logger.warn(`${this.indexerName}: match ${proxy} created on-chain but missing from DB`, {
                    hint: 'Match likely deployed via Foundry script — back-fill api_football_id manually if needed',
                });
            }
        } catch (err) {
            logger.error(`${this.indexerName}: failed to verify matches row`, {
                proxy,
                error: err instanceof Error ? err.message : String(err),
            });
        }
    }

    private deriveOracleAddress(): `0x${string}` {
        const pk = this.network.adminPrivateKey;
        if (!pk || !pk.startsWith('0x') || pk.length !== 66) {
            return zeroAddress as `0x${string}`;
        }
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { privateKeyToAddress } = require('viem/accounts');
            return privateKeyToAddress(pk as `0x${string}`);
        } catch {
            return zeroAddress as `0x${string}`;
        }
    }
}
