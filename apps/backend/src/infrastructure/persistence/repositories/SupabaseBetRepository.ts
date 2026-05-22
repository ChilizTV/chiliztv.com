import { injectable } from 'tsyringe';
import { supabaseClient as supabase } from '../../database/supabase/client';
import {
    BetCounts,
    BetFilter,
    FindBetsByUserOptions,
    IBetRepository,
} from '@chiliztv/domain/blockchain-indexing/repositories/IBetRepository';
import { Bet, BetUpdate } from '@chiliztv/domain/blockchain-indexing/entities/Bet';
import { BetWithMatchInfo } from '@chiliztv/domain/blockchain-indexing/entities/BetWithMatchInfo';
import { logger } from '../../logging/logger';

/**
 * `claimable` = WON & not yet claimed, `refundable` = REFUNDED & not yet
 * claimed. The single `claimed_at` column tracks both kinds — disambiguation
 * is done via `status`.
 */
function applyBetFilter<Q extends { eq: (col: string, val: string) => Q; is: (col: string, val: null) => Q }>(query: Q, filter: BetFilter | undefined): Q {
    if (!filter || filter === 'all') return query;
    switch (filter) {
        case 'pending':    return query.eq('status', 'PENDING');
        case 'won':        return query.eq('status', 'WON');
        case 'lost':       return query.eq('status', 'LOST');
        case 'refunded':   return query.eq('status', 'REFUNDED');
        case 'claimable':  return query.eq('status', 'WON').is('claimed_at', null);
        case 'refundable': return query.eq('status', 'REFUNDED').is('claimed_at', null);
    }
}

interface BetRow {
    tx_hash: string;
    log_index: number;
    contract_address: string;
    market_id: number | string;
    user_address: string;
    outcome: number | string;
    stake_amount: string;
    new_outcome_pool: string;
    new_total_pool: string;
    status: 'PENDING' | 'WON' | 'LOST' | 'REFUNDED';
    payout_amount: string | null;
    block_number: number | string;
    block_timestamp: string;
    claimed_at: string | null;
    created_at: string;
}

function toDomain(row: BetRow): Bet {
    return {
        coordinates: {
            transactionHash: row.tx_hash as `0x${string}`,
            logIndex: row.log_index,
            blockNumber: BigInt(row.block_number),
            blockTimestamp: new Date(row.block_timestamp),
        },
        contractAddress: row.contract_address,
        marketId: BigInt(row.market_id),
        userAddress: row.user_address,
        outcome: BigInt(row.outcome),
        stakeAmount: BigInt(row.stake_amount),
        newOutcomePool: BigInt(row.new_outcome_pool),
        newTotalPool: BigInt(row.new_total_pool),
        status: row.status,
        payoutAmount: row.payout_amount ? BigInt(row.payout_amount) : null,
        placedAt: new Date(row.block_timestamp),
        claimedAt: row.claimed_at ? new Date(row.claimed_at) : null,
    };
}

@injectable()
export class SupabaseBetRepository implements IBetRepository {
    async insertIfAbsent(bet: Bet): Promise<boolean> {
        const row = {
            tx_hash: bet.coordinates.transactionHash.toLowerCase(),
            log_index: bet.coordinates.logIndex,
            block_number: bet.coordinates.blockNumber.toString(),
            block_timestamp: bet.coordinates.blockTimestamp.toISOString(),
            contract_address: bet.contractAddress.toLowerCase(),
            market_id: bet.marketId.toString(),
            user_address: bet.userAddress.toLowerCase(),
            outcome: bet.outcome.toString(),
            stake_amount: bet.stakeAmount.toString(),
            new_outcome_pool: bet.newOutcomePool.toString(),
            new_total_pool: bet.newTotalPool.toString(),
            status: bet.status,
            payout_amount: bet.payoutAmount?.toString() ?? null,
            claimed_at: bet.claimedAt?.toISOString() ?? null,
        };

        const { error, count } = await supabase
            .from('bets')
            .upsert(row, { onConflict: 'tx_hash,log_index', ignoreDuplicates: true, count: 'exact' });

        if (error) {
            logger.error('Failed to insert bet', { txHash: row.tx_hash, error: error.message });
            throw new Error('Failed to insert bet');
        }

        return (count ?? 0) > 0;
    }

    async settleMarket(
        contractAddress: string,
        marketId: bigint,
        winningOutcome: bigint,
    ): Promise<{ won: number; lost: number }> {
        const addr = contractAddress.toLowerCase();
        const wonRes = await supabase
            .from('bets')
            .update({ status: 'WON' })
            .eq('contract_address', addr)
            .eq('market_id', marketId.toString())
            .eq('outcome', winningOutcome.toString())
            .eq('status', 'PENDING')
            .select('tx_hash');

        const lostRes = await supabase
            .from('bets')
            .update({ status: 'LOST' })
            .eq('contract_address', addr)
            .eq('market_id', marketId.toString())
            .neq('outcome', winningOutcome.toString())
            .eq('status', 'PENDING')
            .select('tx_hash');

        if (wonRes.error || lostRes.error) {
            const message = wonRes.error?.message ?? lostRes.error?.message ?? 'unknown';
            logger.error('Failed to settle market', { contractAddress: addr, marketId: marketId.toString(), error: message });
            throw new Error('Failed to settle market');
        }

        return {
            won: wonRes.data?.length ?? 0,
            lost: lostRes.data?.length ?? 0,
        };
    }

    async cancelMarket(contractAddress: string, marketId: bigint): Promise<number> {
        const { data, error } = await supabase
            .from('bets')
            .update({ status: 'REFUNDED' })
            .eq('contract_address', contractAddress.toLowerCase())
            .eq('market_id', marketId.toString())
            .eq('status', 'PENDING')
            .select('tx_hash');

        if (error) {
            logger.error('Failed to cancel market', { contractAddress, marketId: marketId.toString(), error: error.message });
            throw new Error('Failed to cancel market');
        }
        return data?.length ?? 0;
    }

    async recordClaim(
        contractAddress: string,
        marketId: bigint,
        userAddress: string,
        payoutAmount: bigint,
        claimedAt: Date,
    ): Promise<number> {
        // One PositionClaimed event covers every stake the user holds on the
        // winning outcome (or every stake on a cancelled market for refunds).
        // We stamp `claimed_at` on all matching rows and attach the total
        // payout to the most-recent one (a tiny denormalization that lets
        // the UI render "Won $42" on the latest position without summing
        // across rows).
        const { data: rows, error: selectErr } = await supabase
            .from('bets')
            .select('id')
            .eq('contract_address', contractAddress.toLowerCase())
            .eq('market_id', marketId.toString())
            .eq('user_address', userAddress.toLowerCase())
            .in('status', ['WON', 'REFUNDED'])
            .is('claimed_at', null)
            .order('block_number', { ascending: false });

        if (selectErr) {
            logger.error('Failed to load claimable bets', { contractAddress, marketId: marketId.toString(), userAddress, error: selectErr.message });
            throw new Error('Failed to record claim');
        }
        if (!rows || rows.length === 0) return 0;

        const latestId = (rows[0] as { id: number }).id;
        const { error: stampErr } = await supabase
            .from('bets')
            .update({ claimed_at: claimedAt.toISOString() })
            .in('id', rows.map((r) => (r as { id: number }).id));
        if (stampErr) {
            logger.error('Failed to stamp claimed_at', { contractAddress, marketId: marketId.toString(), error: stampErr.message });
            throw new Error('Failed to record claim');
        }

        const { error: payoutErr } = await supabase
            .from('bets')
            .update({ payout_amount: payoutAmount.toString() })
            .eq('id', latestId);
        if (payoutErr) {
            logger.error('Failed to attach payout amount', { contractAddress, marketId: marketId.toString(), error: payoutErr.message });
            throw new Error('Failed to record claim');
        }

        return rows.length;
    }

    async updateByCoordinates(
        contractAddress: string,
        marketId: bigint,
        userAddress: string,
        update: BetUpdate,
    ): Promise<boolean> {
        const patch: Record<string, unknown> = {};
        if (update.status !== undefined)        patch.status         = update.status;
        if (update.payoutAmount !== undefined)  patch.payout_amount  = update.payoutAmount?.toString() ?? null;
        if (update.claimedAt !== undefined)     patch.claimed_at     = update.claimedAt?.toISOString() ?? null;

        if (Object.keys(patch).length === 0) return false;

        const { data, error } = await supabase
            .from('bets')
            .update(patch)
            .eq('contract_address', contractAddress.toLowerCase())
            .eq('market_id', marketId.toString())
            .eq('user_address', userAddress.toLowerCase())
            .select('tx_hash');

        if (error) {
            logger.error('Failed to update bet', { contractAddress, marketId: marketId.toString(), error: error.message });
            throw new Error('Failed to update bet');
        }
        return (data?.length ?? 0) > 0;
    }

    async findByUser(userAddress: string, options: FindBetsByUserOptions): Promise<Bet[]> {
        let query = supabase
            .from('bets')
            .select('*')
            .eq('user_address', userAddress.toLowerCase())
            .order('block_timestamp', { ascending: false })
            .range(options.offset, options.offset + options.limit - 1);

        query = applyBetFilter(query, options.filter);

        const { data, error } = await query;
        if (error) {
            logger.error('Failed to find bets by user', { userAddress, error: error.message });
            throw new Error('Failed to find bets');
        }
        return (data ?? []).map((row) => toDomain(row as BetRow));
    }

    async countByUser(userAddress: string, filter?: BetFilter): Promise<number> {
        let query = supabase
            .from('bets')
            .select('*', { count: 'exact', head: true })
            .eq('user_address', userAddress.toLowerCase());

        query = applyBetFilter(query, filter);

        const { count, error } = await query;
        if (error) {
            logger.error('Failed to count bets by user', { userAddress, filter, error: error.message });
            throw new Error('Failed to count bets');
        }
        return count ?? 0;
    }

    async countByUserStatuses(userAddress: string): Promise<BetCounts> {
        const filters: BetFilter[] = ['all', 'pending', 'won', 'lost', 'refunded', 'claimable', 'refundable'];
        const counts = await Promise.all(filters.map((f) => this.countByUser(userAddress, f)));
        return {
            all:        counts[0],
            pending:    counts[1],
            won:        counts[2],
            lost:       counts[3],
            refunded:   counts[4],
            claimable:  counts[5],
            refundable: counts[6],
        };
    }

    async findByUserWithMatchInfo(
        userAddress: string,
        options: FindBetsByUserOptions,
    ): Promise<BetWithMatchInfo[]> {
        const bets = await this.findByUser(userAddress, options);
        if (bets.length === 0) return [];

        const contractAddresses = new Set(bets.map((b) => b.contractAddress.toLowerCase()));

        const { data, error } = await supabase
            .from('matches')
            .select('api_football_id, home_team, away_team, league, match_date, betting_contract_address')
            .not('betting_contract_address', 'is', null);
        if (error) {
            logger.error('Failed to load match metadata for bets', { userAddress, error: error.message });
            return bets.map((bet) => ({ bet, match: null, marketContext: null }));
        }

        type JsonBlob = { name?: string; id?: number } | string | null | undefined;
        type MatchMetaRow = {
            api_football_id: number;
            home_team: JsonBlob;
            away_team: JsonBlob;
            league: JsonBlob;
            match_date: string;
            betting_contract_address: string;
        };

        const parseBlob = (raw: JsonBlob): { name?: string; id?: number } | null => {
            if (!raw) return null;
            if (typeof raw === 'string') {
                try {
                    return JSON.parse(raw);
                } catch {
                    return { name: raw };
                }
            }
            return raw;
        };
        const teamName = (raw: JsonBlob): string => parseBlob(raw)?.name ?? 'Unknown';
        const leagueName = (raw: JsonBlob): string | null => parseBlob(raw)?.name ?? null;

        const matchByContract = new Map<string, BetWithMatchInfo['match']>();
        for (const row of (data ?? []) as MatchMetaRow[]) {
            const lower = row.betting_contract_address.toLowerCase();
            if (!contractAddresses.has(lower)) continue;
            matchByContract.set(lower, {
                apiFootballId: row.api_football_id,
                homeTeamName: teamName(row.home_team),
                awayTeamName: teamName(row.away_team),
                leagueName: leagueName(row.league),
                matchDate: new Date(row.match_date),
            });
        }

        const marketKeys = Array.from(
            new Set(bets.map((b) => `${b.contractAddress.toLowerCase()}:${b.marketId.toString()}`)),
        );
        const marketContextByKey = new Map<string, BetWithMatchInfo['marketContext']>();

        if (marketKeys.length > 0) {
            const { data: meRows, error: meError } = await supabase
                .from('market_events')
                .select('contract_address, market_id, payload')
                .eq('event_name', 'MarketCreated')
                .in('contract_address', Array.from(contractAddresses));
            if (meError) {
                logger.warn('Failed to load market_events for bet enrichment', { userAddress, error: meError.message });
            } else {
                interface MarketEventRow {
                    contract_address: string;
                    market_id: string | number;
                    payload: { marketType?: unknown; line?: unknown } | null;
                }
                for (const row of (meRows ?? []) as MarketEventRow[]) {
                    const key = `${row.contract_address.toLowerCase()}:${String(row.market_id)}`;
                    if (marketContextByKey.has(key)) continue;
                    const p = row.payload ?? {};
                    const marketType = typeof p.marketType === 'string' ? p.marketType : null;
                    const line = typeof p.line === 'number' ? p.line : null;
                    if (!marketType) continue;
                    marketContextByKey.set(key, { marketType, line });
                }
            }
        }

        return bets.map((bet) => {
            const key = `${bet.contractAddress.toLowerCase()}:${bet.marketId.toString()}`;
            return {
                bet,
                match: matchByContract.get(bet.contractAddress.toLowerCase()) ?? null,
                marketContext: marketContextByKey.get(key) ?? null,
            };
        });
    }

    async listReferencedContractAddresses(): Promise<ReadonlySet<string>> {
        const { data, error } = await supabase
            .from('bets')
            .select('contract_address')
            .not('contract_address', 'is', null);

        if (error) {
            logger.error('Failed to list referenced contract addresses', { error: error.message });
            throw new Error('Failed to list referenced contract addresses');
        }

        const set = new Set<string>();
        for (const row of (data ?? []) as Array<{ contract_address: string | null }>) {
            if (row.contract_address) set.add(row.contract_address.toLowerCase());
        }
        return set;
    }

    async sumStakeAmountSince(since: Date): Promise<bigint> {
        // Pull only `stake_amount` and sum client-side — PostgREST has no
        // generic SUM over `numeric(78,0)`. The dataset is small (one row
        // per PositionTaken event, bounded by an epoch's worth of bets) and
        // `block_timestamp` is indexed, so the scan stays cheap.
        const { data, error } = await supabase
            .from('bets')
            .select('stake_amount')
            .gte('block_timestamp', since.toISOString());
        if (error) {
            logger.error('Failed to sum stake_amount', { error: error.message });
            throw new Error('Failed to sum stake_amount');
        }
        let total = BigInt(0);
        for (const row of (data ?? []) as Array<{ stake_amount: string | null }>) {
            if (row.stake_amount) total += BigInt(row.stake_amount);
        }
        return total;
    }
}
