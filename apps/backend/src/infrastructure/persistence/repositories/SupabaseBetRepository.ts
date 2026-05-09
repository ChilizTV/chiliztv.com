import { injectable } from 'tsyringe';
import { supabaseClient as supabase } from '../../database/supabase/client';
import { FindBetsByUserOptions, IBetRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IBetRepository';
import { Bet, BetUpdate } from '@chiliztv/domain/blockchain-indexing/entities/Bet';
import { BetWithMatchInfo } from '@chiliztv/domain/blockchain-indexing/entities/BetWithMatchInfo';
import { logger } from '../../logging/logger';

interface BetRow {
    tx_hash: string;
    log_index: number;
    contract_address: string;
    market_id: number | string;
    bet_index: number | string;
    user_address: string;
    selection: number | string;
    net_stake: string;
    gross_stake: string | null;
    odds_x10000: number;
    odds_index: number | null;
    status: 'PENDING' | 'WON' | 'LOST' | 'REFUNDED';
    payout: string | null;
    refund_amount: string | null;
    block_number: number | string;
    block_timestamp: string;
    placed_at: string;
    resolved_at: string | null;
    claimed_at: string | null;
    refunded_at: string | null;
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
        betIndex: BigInt(row.bet_index),
        userAddress: row.user_address,
        selection: BigInt(row.selection),
        netStake: BigInt(row.net_stake),
        grossStake: row.gross_stake ? BigInt(row.gross_stake) : null,
        oddsX10000: row.odds_x10000,
        oddsIndex: row.odds_index,
        status: row.status,
        payout: row.payout ? BigInt(row.payout) : null,
        refundAmount: row.refund_amount ? BigInt(row.refund_amount) : null,
        placedAt: new Date(row.placed_at),
        resolvedAt: row.resolved_at ? new Date(row.resolved_at) : null,
        claimedAt: row.claimed_at ? new Date(row.claimed_at) : null,
        refundedAt: row.refunded_at ? new Date(row.refunded_at) : null,
    };
}

@injectable()
export class SupabaseBetRepository implements IBetRepository {
    async insertIfAbsent(bet: Bet): Promise<boolean> {
        const row = {
            tx_hash: bet.coordinates.transactionHash.toLowerCase(),
            log_index: bet.coordinates.logIndex,
            contract_address: bet.contractAddress.toLowerCase(),
            market_id: bet.marketId.toString(),
            bet_index: bet.betIndex.toString(),
            user_address: bet.userAddress.toLowerCase(),
            selection: bet.selection.toString(),
            net_stake: bet.netStake.toString(),
            gross_stake: bet.grossStake?.toString() ?? null,
            odds_x10000: bet.oddsX10000,
            odds_index: bet.oddsIndex,
            status: bet.status,
            payout: bet.payout?.toString() ?? null,
            refund_amount: bet.refundAmount?.toString() ?? null,
            block_number: bet.coordinates.blockNumber.toString(),
            block_timestamp: bet.coordinates.blockTimestamp.toISOString(),
            placed_at: bet.placedAt.toISOString(),
            resolved_at: bet.resolvedAt?.toISOString() ?? null,
            claimed_at: bet.claimedAt?.toISOString() ?? null,
            refunded_at: bet.refundedAt?.toISOString() ?? null,
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
        winningSelection: bigint,
        resolvedAt: Date,
    ): Promise<{ won: number; lost: number }> {
        const addr = contractAddress.toLowerCase();
        const wonRes = await supabase
            .from('bets')
            .update({ status: 'WON', resolved_at: resolvedAt.toISOString() })
            .eq('contract_address', addr)
            .eq('market_id', marketId.toString())
            .eq('selection', winningSelection.toString())
            .eq('status', 'PENDING')
            .select('tx_hash');

        const lostRes = await supabase
            .from('bets')
            .update({ status: 'LOST', resolved_at: resolvedAt.toISOString() })
            .eq('contract_address', addr)
            .eq('market_id', marketId.toString())
            .neq('selection', winningSelection.toString())
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

    async cancelMarket(
        contractAddress: string,
        marketId: bigint,
        refundedAt: Date,
    ): Promise<number> {
        const { data, error } = await supabase
            .from('bets')
            .update({ status: 'REFUNDED', refunded_at: refundedAt.toISOString() })
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

    async updateByCoordinates(
        contractAddress: string,
        marketId: bigint,
        betIndex: bigint,
        userAddress: string,
        update: BetUpdate,
    ): Promise<boolean> {
        const patch: Record<string, unknown> = {};
        if (update.status !== undefined)        patch.status         = update.status;
        if (update.payout !== undefined)        patch.payout         = update.payout?.toString() ?? null;
        if (update.refundAmount !== undefined)  patch.refund_amount  = update.refundAmount?.toString() ?? null;
        if (update.resolvedAt !== undefined)    patch.resolved_at    = update.resolvedAt?.toISOString() ?? null;
        if (update.claimedAt !== undefined)     patch.claimed_at     = update.claimedAt?.toISOString() ?? null;
        if (update.refundedAt !== undefined)    patch.refunded_at    = update.refundedAt?.toISOString() ?? null;

        if (Object.keys(patch).length === 0) return false;

        const { data, error } = await supabase
            .from('bets')
            .update(patch)
            .eq('contract_address', contractAddress.toLowerCase())
            .eq('market_id', marketId.toString())
            .eq('bet_index', betIndex.toString())
            .eq('user_address', userAddress.toLowerCase())
            .select('tx_hash');

        if (error) {
            logger.error('Failed to update bet', { contractAddress, marketId: marketId.toString(), betIndex: betIndex.toString(), error: error.message });
            throw new Error('Failed to update bet');
        }
        return (data?.length ?? 0) > 0;
    }

    async findByUser(userAddress: string, options: FindBetsByUserOptions): Promise<Bet[]> {
        let query = supabase
            .from('bets')
            .select('*')
            .eq('user_address', userAddress.toLowerCase())
            .order('placed_at', { ascending: false })
            .range(options.offset, options.offset + options.limit - 1);

        if (options.status) {
            query = query.eq('status', options.status);
        }

        const { data, error } = await query;

        if (error) {
            logger.error('Failed to find bets by user', { userAddress, error: error.message });
            throw new Error('Failed to find bets');
        }

        return (data ?? []).map((row) => toDomain(row as BetRow));
    }

    async findByUserWithMatchInfo(
        userAddress: string,
        options: FindBetsByUserOptions,
    ): Promise<BetWithMatchInfo[]> {
        // Fetch the user's bets first; we then look up matches for the unique
        // contract addresses in a single follow-up query. A direct PostgREST
        // foreign-key join would require a declared FK, which doesn't exist
        // (matches.betting_contract_address is just a text column today).
        const bets = await this.findByUser(userAddress, options);
        if (bets.length === 0) return [];

        const contractAddresses = new Set(
            bets.map((b) => b.contractAddress.toLowerCase()),
        );

        // Fetch every match that has *any* betting_contract_address — small
        // set (one row per match). Using `.in('betting_contract_address', ...)`
        // would miss rows saved in mixed case (the indexer writes
        // `bets.contract_address` lowercased, the deploy adapter saves the
        // match's `betting_contract_address` as-is from the event topic).
        // JS-side case-insensitive filter sidesteps the trap.
        const { data, error } = await supabase
            .from('matches')
            .select('api_football_id, home_team, away_team, league, match_date, betting_contract_address')
            .not('betting_contract_address', 'is', null);

        if (error) {
            logger.error('Failed to load match metadata for bets', { userAddress, error: error.message });
            // Graceful degradation: render the bets without match info rather than 500.
            return bets.map((bet) => ({ bet, match: null, marketContext: null }));
        }

        // The `matches` table stores `home_team`, `away_team`, and `league`
        // as JSONB blobs (sometimes serialized as strings), not flat columns.
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

        // Pull the MarketCreated event payload for each (contract, marketId)
        // tuple so the front can render "Over 2.5 goals" instead of `Selection #1`.
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
                logger.warn('Failed to load market_events for bet enrichment', {
                    userAddress,
                    error: meError.message,
                });
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
}
