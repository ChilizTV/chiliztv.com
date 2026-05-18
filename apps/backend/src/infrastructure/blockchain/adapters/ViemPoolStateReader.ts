import { injectable, inject } from 'tsyringe';
import { createPublicClient, http, type PublicClient } from 'viem';
import { chainFor, LIQUIDITY_POOL_ABI } from '@chiliztv/blockchain';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { IPoolStateReader, PoolState } from '@chiliztv/domain/shared/ports/IPoolStateReader';
import type { INetworkConfig } from '@chiliztv/domain/shared/ports/INetworkConfig';
import { networkType } from '../../config/chiliz.config';

/**
 * Reads the pool-global state in a single multicall-style burst. The viem
 * `multicall` aggregates all reads into one RPC call when the Multicall3
 * deployment is present on the chain; otherwise viem fans out the reads in
 * parallel. Either way, this is one network round-trip from the caller's
 * point of view.
 */
@injectable()
export class ViemPoolStateReader implements IPoolStateReader {
    private readonly client: PublicClient;
    private readonly poolAddress: `0x${string}`;

    constructor(
        @inject(TOKENS.INetworkConfig) private readonly network: INetworkConfig,
    ) {
        const chain = chainFor(networkType);
        this.client = createPublicClient({
            chain,
            transport: http(network.rpcUrl),
        });
        this.poolAddress = network.liquidityPoolAddress as `0x${string}`;
    }

    async read(): Promise<PoolState> {
        const contract = { address: this.poolAddress, abi: LIQUIDITY_POOL_ABI } as const;
        const [
            totalAssets,
            totalSupply,
            freeBalance,
            totalLiabilities,
            utilization,
            protocolFeeBps,
            treasuryShareBps,
            lpWithdrawalFeeBps,
            maxBetAmount,
            maxLiabilityPerMarketBps,
            maxLiabilityPerMatchBps,
            depositCooldownSeconds,
            paused,
            accruedTreasury,
            treasury,
            pendingTreasury,
        ] = await Promise.all([
            this.client.readContract({ ...contract, functionName: 'totalAssets' }) as Promise<bigint>,
            this.client.readContract({ ...contract, functionName: 'totalSupply' }) as Promise<bigint>,
            this.client.readContract({ ...contract, functionName: 'freeBalance' }) as Promise<bigint>,
            this.client.readContract({ ...contract, functionName: 'totalLiabilities' }) as Promise<bigint>,
            this.client.readContract({ ...contract, functionName: 'utilization' }) as Promise<bigint>,
            this.client.readContract({ ...contract, functionName: 'protocolFeeBps' }) as Promise<bigint>,
            this.client.readContract({ ...contract, functionName: 'treasuryShareBps' }) as Promise<bigint>,
            this.client.readContract({ ...contract, functionName: 'lpWithdrawalFeeBps' }) as Promise<bigint>,
            this.client.readContract({ ...contract, functionName: 'maxBetAmount' }) as Promise<bigint>,
            this.client.readContract({ ...contract, functionName: 'maxLiabilityPerMarketBps' }) as Promise<bigint>,
            this.client.readContract({ ...contract, functionName: 'maxLiabilityPerMatchBps' }) as Promise<bigint>,
            this.client.readContract({ ...contract, functionName: 'depositCooldownSeconds' }) as Promise<bigint>,
            this.client.readContract({ ...contract, functionName: 'paused' }) as Promise<boolean>,
            this.client.readContract({ ...contract, functionName: 'accruedTreasury' }) as Promise<bigint>,
            this.client.readContract({ ...contract, functionName: 'treasury' }) as Promise<string>,
            this.client.readContract({ ...contract, functionName: 'pendingTreasury' }) as Promise<string>,
        ]);

        return {
            totalAssets,
            totalSupply,
            freeBalance,
            totalLiabilities,
            utilization,
            protocolFeeBps: Number(protocolFeeBps),
            treasuryShareBps: Number(treasuryShareBps),
            lpWithdrawalFeeBps: Number(lpWithdrawalFeeBps),
            maxBetAmount,
            maxLiabilityPerMarketBps: Number(maxLiabilityPerMarketBps),
            maxLiabilityPerMatchBps: Number(maxLiabilityPerMatchBps),
            depositCooldownSeconds: Number(depositCooldownSeconds),
            paused,
            accruedTreasury,
            treasury,
            pendingTreasury,
        };
    }
}
