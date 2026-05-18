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
import { BaseIndexer } from './BaseIndexer';

const MATCH_CREATED = parseAbiItem(
    'event MatchCreated(address indexed proxy, uint8 sportType, address indexed owner)',
);
const WIRING_SET = parseAbiItem(
    'event WiringSet(address indexed liquidityPool, address indexed usdcToken, address indexed swapRouter)',
);

const ALL_EVENTS = [MATCH_CREATED, WIRING_SET];

const SWAP_ROUTER_ROLE = keccak256(toBytes('SWAP_ROUTER_ROLE'));
const RESOLVER_ROLE = keccak256(toBytes('RESOLVER_ROLE'));
const MATCH_ROLE = keccak256(toBytes('MATCH_ROLE'));

const READ_ABI = [
    { type: 'function', name: 'usdcToken', inputs: [], outputs: [{ type: 'address' }], stateMutability: 'view' },
    { type: 'function', name: 'liquidityPool', inputs: [], outputs: [{ type: 'address' }], stateMutability: 'view' },
    { type: 'function', name: 'hasRole', inputs: [{ type: 'bytes32' }, { type: 'address' }], outputs: [{ type: 'bool' }], stateMutability: 'view' },
] as const;

/**
 * Listens for `MatchCreated` on the BettingMatchFactory and validates that
 * the freshly-deployed proxy has been fully wired (setUSDCToken, setLiquidityPool,
 * pool.authorizeMatch, grantRole(SWAP_ROUTER_ROLE/RESOLVER_ROLE)). Emits a
 * `wiring_alerts` row if anything is missing, so ops can fix it without
 * having to manually inspect every newly-deployed match.
 *
 * Does NOT auto-correct: the deployer key is held by the factory's admin /
 * a Safe, and the indexer should never carry an admin key.
 */
@injectable()
export class BettingMatchFactoryIndexer extends BaseIndexer {
    private readonly factoryAddress: `0x${string}`;
    private readonly poolAddress: `0x${string}`;
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
        const factoryAddress = network.bettingFactoryAddress as `0x${string}`;
        super({
            name: 'BettingMatchFactory',
            contractAddress: factoryAddress,
            client: createPublicClient({
                chain: chainFor(networkType),
                transport: http(network.rpcUrl),
            }),
            checkpoints,
            lockService,
        });
        this.factoryAddress = factoryAddress;
        this.poolAddress = network.liquidityPoolAddress as `0x${string}`;
        this.swapRouterAddress = network.swapRouterAddress as `0x${string}`;
        // The oracle that should hold RESOLVER_ROLE is the admin EOA.
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

        // Confirm the row exists in `matches` (it may have been written by
        // BettingContractDeploymentAdapter); if not, log so ops knows the
        // match was created out of band.
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

        const [usdcToken, liquidityPool, swapRouterRoleOk, resolverRoleOk] = await Promise.all([
            this.read(match, 'usdcToken', []),
            this.read(match, 'liquidityPool', []),
            this.read(match, 'hasRole', [SWAP_ROUTER_ROLE, this.swapRouterAddress]),
            this.read(match, 'hasRole', [RESOLVER_ROLE, this.oracleAddress]),
        ]);

        const matchAuthorized = await this.read(this.poolAddress, 'hasRole', [MATCH_ROLE, match]);

        if ((usdcToken as string).toLowerCase() === zeroAddress.toLowerCase()) missing.push('setUSDCToken');
        if ((liquidityPool as string).toLowerCase() === zeroAddress.toLowerCase()) missing.push('setLiquidityPool');
        if (!matchAuthorized) missing.push('pool.authorizeMatch');
        if (!swapRouterRoleOk) missing.push('grantRole.SWAP_ROUTER_ROLE');
        if (this.oracleAddress.toLowerCase() !== zeroAddress.toLowerCase() && !resolverRoleOk) {
            missing.push('grantRole.RESOLVER_ROLE');
        }
        return missing;
    }

    private async read<T = unknown>(address: `0x${string}`, functionName: 'usdcToken' | 'liquidityPool' | 'hasRole', args: readonly unknown[]): Promise<T> {
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
            // Default to a "missing" answer so the alert is raised — better
            // a false-positive alert than a silently broken match.
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
        // The oracle in the current architecture is the same admin EOA that
        // holds DEFAULT_ADMIN_ROLE on every match. We derive its address from
        // the admin private key via viem's privateKeyToAccount.
        const pk = this.network.adminPrivateKey;
        if (!pk || !pk.startsWith('0x') || pk.length !== 66) {
            return zeroAddress as `0x${string}`;
        }
        // Light derivation without importing viem/accounts here — we only
        // need the address. Return zero if the derivation isn't available
        // (the wiring check skips the RESOLVER_ROLE step when oracle is 0x0).
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { privateKeyToAddress } = require('viem/accounts');
            return privateKeyToAddress(pk as `0x${string}`);
        } catch {
            return zeroAddress as `0x${string}`;
        }
    }
}
