import { injectable } from 'tsyringe';
import { createWalletClient, createPublicClient, http, keccak256, toBytes } from 'viem';
import { privateKeyToAccount, nonceManager } from 'viem/accounts';
import { chilizConfig, networkType } from '../../config/chiliz.config';
import {
    PARI_MATCH_FACTORY_INLINE_ABI,
    PARI_MATCH_BASE_INLINE_ABI,
    chainFor,
} from '@chiliztv/blockchain';
import { logger } from '../../logging/logger';

if (!process.env.PARI_MATCH_FACTORY_ADDRESS) {
    throw new Error('PARI_MATCH_FACTORY_ADDRESS env var is required');
}
const FACTORY_ADDRESS = process.env.PARI_MATCH_FACTORY_ADDRESS as `0x${string}`;
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY as `0x${string}`;
const ADMIN_ADDRESS = process.env.ADMIN_ADDRESS as `0x${string}`;

// PariMatchBase MarketState enum (cf. PariMatchBase.sol:102-108).
const MarketState = { Inactive: 0, Open: 1, Suspended: 2, Closed: 3, Resolved: 4, Cancelled: 5 } as const;

// Market type hashes (keccak256 of the ASCII name, cf. FootballPariMatch.sol:42-48).
const MARKET_WINNER = keccak256(toBytes('WINNER'));
const MARKET_GOALS_TOTAL = keccak256(toBytes('GOALS_TOTAL'));
const MARKET_BOTH_SCORE = keccak256(toBytes('BOTH_SCORE'));

const TX_DELAY_MS = 4000;
function delay(ms: number = TX_DELAY_MS): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Deploys FootballPariMatch proxies via the PariMatchFactory and seeds the
 * default 3-market lineup (WINNER + GOALS_TOTAL 2.5 + BOTH_SCORE). In the
 * parimutuel model markets carry no initial odds — pools emerge from stakes.
 */
@injectable()
export class PariMatchDeploymentAdapter {
    private walletClient;
    private publicClient;

    constructor() {
        if (!ADMIN_PRIVATE_KEY) {
            throw new Error('ADMIN_PRIVATE_KEY environment variable is required');
        }

        const chain = chainFor(networkType);
        const account = privateKeyToAccount(ADMIN_PRIVATE_KEY, { nonceManager });

        this.walletClient = createWalletClient({
            account,
            chain,
            transport: http(chilizConfig.rpcUrl),
        });

        this.publicClient = createPublicClient({
            chain,
            transport: http(chilizConfig.rpcUrl),
        });

        logger.info('PariMatchDeploymentAdapter initialized', {
            network: networkType,
            chain: chain.name,
            factoryAddress: FACTORY_ADDRESS,
            adminAddress: account.address,
        });
    }

    /**
     * Deploy a new FootballPariMatch proxy via the factory.
     * Factory signature: `createFootballMatch(string, address owner, address oracle) → address proxy`.
     */
    async deployFootballMatch(
        matchName: string,
        ownerAddress: string,
        oracleAddress?: string,
    ): Promise<string> {
        const oracle = (oracleAddress ?? process.env.RESOLVER_ADDRESS ?? ownerAddress) as `0x${string}`;
        logger.info('Deploying FootballPariMatch contract', { matchName, ownerAddress, oracle });

        const hash = await this.walletClient.writeContract({
            address: FACTORY_ADDRESS,
            abi: PARI_MATCH_FACTORY_INLINE_ABI,
            functionName: 'createFootballMatch',
            args: [matchName, ownerAddress as `0x${string}`, oracle],
        });
        logger.debug('Transaction sent', { hash });

        const receipt = await this.publicClient.waitForTransactionReceipt({
            hash,
            timeout: 120_000,
        });

        // `MatchCreated(address indexed proxy, uint8 sportType, address indexed owner)` — proxy is topic[1].
        const MATCH_CREATED_TOPIC = keccak256(toBytes('MatchCreated(address,uint8,address)'));
        const matchCreatedEvent = receipt.logs.find((log: any) => log.topics[0] === MATCH_CREATED_TOPIC);
        if (!matchCreatedEvent || !matchCreatedEvent.topics[1]) {
            throw new Error('MatchCreated event not found in transaction logs');
        }
        const proxyAddress = `0x${matchCreatedEvent.topics[1].slice(26)}` as `0x${string}`;

        logger.info('FootballPariMatch deployed', { contractAddress: proxyAddress, transactionHash: hash });
        return proxyAddress;
    }

    /**
     * Seed and open the default 3-market lineup on a freshly-deployed proxy.
     * No odds parameter in parimutuel — implied probabilities emerge from
     * the outcome pools as stakes accumulate.
     */
    async setupDefaultMarkets(contractAddress: string): Promise<void> {
        const matchAddr = contractAddress as `0x${string}`;

        const sendAndWait = async (fn: () => Promise<`0x${string}`>) => {
            const hash = await fn();
            const receipt = await this.publicClient.waitForTransactionReceipt({
                hash,
                timeout: 180_000,
                pollingInterval: 4_000,
                retryCount: 4,
                retryDelay: 4_000,
            });
            if (receipt.status === 'reverted') {
                throw new Error(`Transaction reverted on-chain (hash: ${hash})`);
            }
            await delay();
        };

        // Batch-add the 3 default markets in one tx (line=0 for WINNER and
        // BOTH_SCORE, line=25 = 2.5 goals for GOALS_TOTAL).
        logger.info('Adding default markets (WINNER + GOALS_TOTAL + BOTH_SCORE)', { contractAddress });
        await sendAndWait(() => this.walletClient.writeContract({
            address: matchAddr,
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
            address: matchAddr,
            abi: PARI_MATCH_BASE_INLINE_ABI,
            functionName: 'openMarketsBatch',
            args: [[0n, 1n, 2n]],
            gas: 600_000n,
        }));

        logger.info('Default markets created and opened', { contractAddress, marketsCount: 3 });
    }

    async getMarketCount(contractAddress: string): Promise<number> {
        const result = await this.publicClient.readContract({
            address: contractAddress as `0x${string}`,
            abi: PARI_MATCH_BASE_INLINE_ABI,
            functionName: 'marketCount',
        });
        return Number(result);
    }

    /** Returns the current `state` field from `getMarketCore`. */
    async getMarketState(contractAddress: string, marketId: number): Promise<number> {
        const core = await this.publicClient.readContract({
            address: contractAddress as `0x${string}`,
            abi: PARI_MATCH_BASE_INLINE_ABI,
            functionName: 'getMarketCore',
            args: [BigInt(marketId)],
        }) as { state: number; result: bigint; createdAt: number; resolvedAt: number; resolvedNetPool: bigint };
        return core.state;
    }

    /** Opens every market currently in Inactive state. Used for partial-setup repair. */
    async openInactiveMarkets(contractAddress: string): Promise<number> {
        const count = await this.getMarketCount(contractAddress);
        if (count === 0) return 0;

        const matchAddr = contractAddress as `0x${string}`;
        const inactive: bigint[] = [];

        for (let marketId = 0; marketId < count; marketId++) {
            const state = await this.getMarketState(contractAddress, marketId);
            if (state === MarketState.Inactive) inactive.push(BigInt(marketId));
        }
        if (inactive.length === 0) return 0;

        logger.info('Opening inactive markets in batch', { contractAddress, count: inactive.length });
        const hash = await this.walletClient.writeContract({
            address: matchAddr,
            abi: PARI_MATCH_BASE_INLINE_ABI,
            functionName: 'openMarketsBatch',
            args: [inactive],
        });
        await this.publicClient.waitForTransactionReceipt({ hash, timeout: 90_000 });
        await delay();
        return inactive.length;
    }

    getAdminAddress(): string {
        return ADMIN_ADDRESS || this.walletClient.account.address;
    }
}
