import { inject, injectable } from 'tsyringe';
import { createPublicClient, http, type PublicClient } from 'viem';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { ILogger } from '@chiliztv/domain/shared/ports/ILogger';
import type {
    IPariMatchPoolsReader,
    MarketPoolSnapshot,
} from '@chiliztv/domain/markets/ports/IPariMatchPoolsReader';
import { chainFor } from '@chiliztv/blockchain';
import { PARI_MATCH_BASE_INLINE_ABI } from '@chiliztv/blockchain';
import { chilizConfig, networkType } from '../../config/chiliz.config';

interface MarketCoreRaw {
    state: number;
    result: bigint;
    createdAt: number;
    resolvedAt: number;
    resolvedNetPool: bigint;
}

interface MarketSpecRaw {
    marketType: string;
    line: number;
    maxOutcome: number;
    extra: number;
    groupId: number;
}

/**
 * Multicall reader for the parimutuel pool surfaces. One round-trip per
 * proxy regardless of market count — used by the `/matches/:address/pools`
 * endpoint cached behind Redis 3-5s.
 */
@injectable()
export class ViemPariMatchPoolsReader implements IPariMatchPoolsReader {
    private readonly client: PublicClient;

    constructor(@inject(TOKENS.ILogger) private readonly logger: ILogger) {
        const chain = chainFor(networkType);
        this.client = createPublicClient({
            chain,
            transport: http(chilizConfig.rpcUrl),
            batch: { multicall: true },
        }) as PublicClient;
    }

    async readPools(
        contractAddress: string,
        marketIds?: ReadonlyArray<bigint>,
    ): Promise<ReadonlyArray<MarketPoolSnapshot>> {
        const addr = contractAddress as `0x${string}`;

        // If no explicit list, read marketCount() and enumerate 0..N-1.
        let ids: bigint[];
        if (marketIds && marketIds.length > 0) {
            ids = [...marketIds];
        } else {
            const count = Number(await this.client.readContract({
                address: addr,
                abi: PARI_MATCH_BASE_INLINE_ABI,
                functionName: 'marketCount',
            }));
            ids = Array.from({ length: count }, (_, i) => BigInt(i));
        }
        if (ids.length === 0) return [];

        // Round 1: fetch core + spec for every market in parallel (multicall).
        const cores = await this.client.multicall({
            allowFailure: false,
            contracts: ids.map((id) => ({
                address: addr,
                abi: PARI_MATCH_BASE_INLINE_ABI,
                functionName: 'getMarketCore',
                args: [id],
            } as const)),
        }) as ReadonlyArray<MarketCoreRaw>;
        const specs = await this.client.multicall({
            allowFailure: false,
            contracts: ids.map((id) => ({
                address: addr,
                abi: PARI_MATCH_BASE_INLINE_ABI,
                functionName: 'getMarketSpec',
                args: [id],
            } as const)),
        }) as ReadonlyArray<MarketSpecRaw>;
        const totals = await this.client.multicall({
            allowFailure: false,
            contracts: ids.map((id) => ({
                address: addr,
                abi: PARI_MATCH_BASE_INLINE_ABI,
                functionName: 'getTotalPool',
                args: [id],
            } as const)),
        }) as ReadonlyArray<bigint>;

        // Round 2: fetch outcome pools per market (count varies, so one
        // multicall per market — still batched into a single HTTP call by
        // viem's `batch: { multicall: true }`).
        const outcomeCalls: Array<{ id: bigint; outcomes: number[] }> = ids.map((id, idx) => ({
            id,
            outcomes: Array.from({ length: (specs[idx]?.maxOutcome ?? 0) + 1 }, (_, i) => i),
        }));
        const flatOutcomeContracts = outcomeCalls.flatMap(({ id, outcomes }) =>
            outcomes.map((o) => ({
                address: addr,
                abi: PARI_MATCH_BASE_INLINE_ABI,
                functionName: 'getOutcomePool' as const,
                args: [id, BigInt(o)] as const,
            }))
        );
        const flatOutcomePools = flatOutcomeContracts.length > 0
            ? await this.client.multicall({
                allowFailure: false,
                contracts: flatOutcomeContracts,
            }) as ReadonlyArray<bigint>
            : [];

        // Re-slice flat results back into per-market arrays + compute implied prob.
        const snapshots: MarketPoolSnapshot[] = [];
        let cursor = 0;
        for (let idx = 0; idx < ids.length; idx++) {
            const id = ids[idx]!;
            const spec = specs[idx]!;
            const core = cores[idx]!;
            const total = totals[idx]!;
            const len = spec.maxOutcome + 1;
            const outcomePools = flatOutcomePools.slice(cursor, cursor + len);
            cursor += len;

            const impliedProbBps = total === 0n
                ? outcomePools.map(() => 0)
                : outcomePools.map((p) => Number((p * 10_000n) / total));

            snapshots.push({
                marketId: id,
                state: core.state,
                result: core.result,
                marketType: spec.marketType,
                line: spec.line,
                maxOutcome: spec.maxOutcome,
                totalPool: total,
                outcomePools,
                impliedProbBps,
            });
        }
        return snapshots;
    }
}
