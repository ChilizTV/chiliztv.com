import { injectable } from 'tsyringe';
import { supabaseClient as supabase } from '../../database/supabase/client';
import { Match, MatchOdds } from '@chiliztv/domain/matches/entities/Match';
import { IMatchRepository, MatchStats } from '@chiliztv/domain/matches/repositories/IMatchRepository';
import { MatchFetchWindow } from '@chiliztv/domain/matches/value-objects/MatchFetchWindow';
import { logger } from '../../logging/logger';

interface MatchRow {
  id: number;
  api_football_id: number;
  home_team: any;
  away_team: any;
  home_score: number | null;
  away_score: number | null;
  match_date: string;
  status: string;
  league: any;
  season: number;
  venue: string | null;
  odds: any;
  betting_contract_address?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Read JSONB → typed `MatchOdds`. Accepts the new per-market shape
 *   `{ WINNER: {...}, HALFTIME: {...}, GOALS_TOTAL: {...}, BOTH_SCORE: {...}, FIRST_SCORER: {...} }`
 * and falls back to the legacy flat `{ home_win, draw, away_win }` shape
 * (auto-promoted to `winner`). Missing markets stay `undefined`.
 */
function mapOdds(raw: unknown): MatchOdds | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const r = raw as Record<string, any>;

  // Legacy flat shape — promote to `winner` and stop.
  if ((r.home_win !== undefined || r.homeWin !== undefined) && r.WINNER === undefined && r.winner === undefined) {
    return {
      winner: {
        homeWin: Number(r.home_win ?? r.homeWin),
        draw: Number(r.draw),
        awayWin: Number(r.away_win ?? r.awayWin),
      },
    };
  }

  const out: MatchOdds = {};
  const winner = r.WINNER ?? r.winner;
  if (winner && (winner.home_win !== undefined || winner.homeWin !== undefined)) {
    out.winner = {
      homeWin: Number(winner.home_win ?? winner.homeWin),
      draw: Number(winner.draw),
      awayWin: Number(winner.away_win ?? winner.awayWin),
    };
  }
  const halftime = r.HALFTIME ?? r.halftime;
  if (halftime && (halftime.home_win !== undefined || halftime.homeWin !== undefined)) {
    out.halftime = {
      homeWin: Number(halftime.home_win ?? halftime.homeWin),
      draw: Number(halftime.draw),
      awayWin: Number(halftime.away_win ?? halftime.awayWin),
    };
  }
  const gt = r.GOALS_TOTAL ?? r.goalsTotal;
  if (gt && gt.over !== undefined && gt.under !== undefined) {
    out.goalsTotal = {
      line: Number(gt.line),
      over: Number(gt.over),
      under: Number(gt.under),
    };
  }
  const bs = r.BOTH_SCORE ?? r.bothScore;
  if (bs && bs.yes !== undefined && bs.no !== undefined) {
    out.bothScore = { yes: Number(bs.yes), no: Number(bs.no) };
  }
  const fs = r.FIRST_SCORER ?? r.firstScorer;
  if (fs && fs.home !== undefined && fs.away !== undefined) {
    out.firstScorer = {
      home: Number(fs.home),
      away: Number(fs.away),
      none: Number(fs.none),
    };
  }

  return Object.keys(out).length > 0 ? out : undefined;
}

/** Typed `MatchOdds` → JSONB written to the `matches.odds` column. */
function unmapOdds(odds: MatchOdds): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (odds.winner) {
    out.WINNER = {
      home_win: odds.winner.homeWin,
      draw: odds.winner.draw,
      away_win: odds.winner.awayWin,
    };
  }
  if (odds.halftime) {
    out.HALFTIME = {
      home_win: odds.halftime.homeWin,
      draw: odds.halftime.draw,
      away_win: odds.halftime.awayWin,
    };
  }
  if (odds.goalsTotal) {
    out.GOALS_TOTAL = {
      line: odds.goalsTotal.line,
      over: odds.goalsTotal.over,
      under: odds.goalsTotal.under,
    };
  }
  if (odds.bothScore) {
    out.BOTH_SCORE = { yes: odds.bothScore.yes, no: odds.bothScore.no };
  }
  if (odds.firstScorer) {
    out.FIRST_SCORER = {
      home: odds.firstScorer.home,
      away: odds.firstScorer.away,
      none: odds.firstScorer.none,
    };
  }
  return out;
}

@injectable()
export class SupabaseMatchRepository implements IMatchRepository {
  async findAll(): Promise<Match[]> {
    const { data: rows, error } = await supabase
      .from('matches')
      .select('*')
      .order('match_date', { ascending: true });

    if (error) {
      logger.error('Failed to find all matches', { error: error.message });
      throw new Error('Failed to find matches');
    }

    return rows ? rows.map(row => this.toDomain(row)) : [];
  }

  async findByDateRange(from: Date, to: Date): Promise<Match[]> {
    const { data: rows, error } = await supabase
      .from('matches')
      .select('*')
      .gte('match_date', from.toISOString())
      .lte('match_date', to.toISOString())
      .order('match_date', { ascending: true });

    if (error) {
      logger.error('Failed to find matches by date range', { error: error.message });
      throw new Error('Failed to find matches');
    }

    return rows ? rows.map(row => this.toDomain(row)) : [];
  }

  async findById(id: number): Promise<Match | null> {
    const { data: row, error } = await supabase
      .from('matches')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      logger.error('Failed to find match by id', { error: error.message, id });
      throw new Error('Failed to find match');
    }

    return row ? this.toDomain(row) : null;
  }

  async findByApiFootballId(apiFootballId: number): Promise<Match | null> {
    const { data: row, error } = await supabase
      .from('matches')
      .select('*')
      .eq('api_football_id', apiFootballId)
      .maybeSingle();

    if (error) {
      logger.error('Failed to find match by API Football ID', { error: error.message, apiFootballId });
      throw new Error('Failed to find match');
    }

    return row ? this.toDomain(row) : null;
  }

  async findByLeagueId(leagueId: number): Promise<Match[]> {
    const now = new Date();

    const { data: rows, error } = await supabase
      .from('matches')
      .select('*')
      .eq('league->>id', leagueId)
      .gte('match_date', MatchFetchWindow.fetchFrom(now).toISOString())
      .lte('match_date', MatchFetchWindow.fetchTo(now).toISOString())
      .order('match_date', { ascending: true });

    if (error) {
      logger.error('Failed to find matches by league', { error: error.message, leagueId });
      throw new Error('Failed to find matches');
    }

    return rows ? rows.map(row => this.toDomain(row)) : [];
  }

  async findLive(): Promise<Match[]> {
    const { data: rows, error } = await supabase
      .from('matches')
      .select('*')
      .in('status', ['1H', '2H', 'HT'])
      .order('match_date', { ascending: true });

    if (error) {
      logger.error('Failed to find live matches', { error: error.message });
      throw new Error('Failed to find live matches');
    }

    return rows ? rows.map(row => this.toDomain(row)) : [];
  }

  async findUpcoming(): Promise<Match[]> {
    const now = new Date();
    const twentyFourHoursAhead = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const { data: rows, error } = await supabase
      .from('matches')
      .select('*')
      .eq('status', 'NS')
      .gt('match_date', now.toISOString())
      .lte('match_date', twentyFourHoursAhead.toISOString())
      .order('match_date', { ascending: true });

    if (error) {
      logger.error('Failed to find upcoming matches', { error: error.message });
      throw new Error('Failed to find upcoming matches');
    }

    return rows ? rows.map(row => this.toDomain(row)) : [];
  }

  async save(match: Match): Promise<Match> {
    const row = this.toRow(match);
    const { id, ...insertRow } = row;

    logger.info('Saving match to database', {
      apiFootballId: insertRow.api_football_id,
      homeTeam: insertRow.home_team,
      awayTeam: insertRow.away_team,
      league: insertRow.league
    });

    const { data, error } = await supabase
      .from('matches')
      .insert(insertRow)
      .select()
      .single();

    if (error) {
      logger.error('Failed to save match', { error: error.message });
      throw new Error('Failed to save match');
    }

    logger.info('Match saved successfully', {
      id: data.id,
      homeTeam: data.home_team,
      awayTeam: data.away_team
    });

    return this.toDomain(data);
  }

  async saveMany(matches: Match[]): Promise<Match[]> {
    const rows = matches.map(m => this.toRow(m));

    const { data, error } = await supabase
      .from('matches')
      .upsert(rows, { onConflict: 'id' })
      .select();

    if (error) {
      logger.error('Failed to save matches', { error: error.message });
      throw new Error('Failed to save matches');
    }

    return data ? data.map(row => this.toDomain(row)) : [];
  }

  async update(match: Match): Promise<Match> {
    const row = this.toRow(match);
    const { id, ...updateRow } = row;

    const json = match.toJSON();
    const { data, error } = await supabase
      .from('matches')
      .update(updateRow)
      .eq('api_football_id', json.apiFootballId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update match', { error: error.message, apiFootballId: json.apiFootballId });
      throw new Error('Failed to update match');
    }

    return this.toDomain(data);
  }

  async deleteOldMatches(
    before: Date,
    exclusions?: {
      contractAddresses?: ReadonlySet<string>;
      apiFootballIds?: ReadonlySet<number>;
    },
  ): Promise<number> {
    // Fast path: no retention policy — keep the original single-query
    // behaviour so any caller that doesn't compose with bets/predictions
    // (e.g. a manual admin purge) still gets the same semantics.
    if (!exclusions || (
      (!exclusions.contractAddresses || exclusions.contractAddresses.size === 0) &&
      (!exclusions.apiFootballIds || exclusions.apiFootballIds.size === 0)
    )) {
      const { data, error } = await supabase
        .from('matches')
        .delete()
        .lt('match_date', before.toISOString())
        .select('id');

      if (error) {
        logger.error('Failed to delete old matches', { error: error.message });
        throw new Error('Failed to delete old matches');
      }

      return data ? data.length : 0;
    }

    // Retention path: fetch candidates first, filter exclusions in JS, then
    // delete by id list. Avoids the `NOT IN (huge list)` Supabase REST
    // pattern and stays safe even when the referenced sets grow.
    const { data: candidates, error: fetchErr } = await supabase
      .from('matches')
      .select('id, betting_contract_address, api_football_id')
      .lt('match_date', before.toISOString());

    if (fetchErr) {
      logger.error('Failed to fetch cleanup candidates', { error: fetchErr.message });
      throw new Error('Failed to fetch cleanup candidates');
    }

    if (!candidates?.length) return 0;

    const contractRefs = exclusions.contractAddresses;
    const apiIdRefs = exclusions.apiFootballIds;
    const idsToDelete: Array<number | string> = [];
    for (const c of candidates as Array<{
      id: number | string;
      betting_contract_address: string | null;
      api_football_id: number;
    }>) {
      const refByContract =
        contractRefs && c.betting_contract_address
          ? contractRefs.has(c.betting_contract_address.toLowerCase())
          : false;
      const refByApiId = apiIdRefs ? apiIdRefs.has(Number(c.api_football_id)) : false;
      if (!refByContract && !refByApiId) idsToDelete.push(c.id);
    }

    if (idsToDelete.length === 0) return 0;

    const { error: delErr } = await supabase
      .from('matches')
      .delete()
      .in('id', idsToDelete);

    if (delErr) {
      logger.error('Failed to delete old matches', { error: delErr.message });
      throw new Error('Failed to delete old matches');
    }
    return idsToDelete.length;
  }

  async getStats(): Promise<MatchStats> {
    const allMatches = await this.findAll();

    const totalMatches = allMatches.length;
    const liveMatches = allMatches.filter(m => m.isLive()).length;
    const upcomingMatches = allMatches.filter(m => m.isUpcoming()).length;
    const finishedMatches = allMatches.filter(m => m.isFinished()).length;

    return {
      totalMatches,
      liveMatches,
      upcomingMatches,
      finishedMatches,
    };
  }

  private toDomain(row: MatchRow): Match {
    const homeTeam = typeof row.home_team === 'string' ? JSON.parse(row.home_team) : row.home_team;
    const awayTeam = typeof row.away_team === 'string' ? JSON.parse(row.away_team) : row.away_team;
    const league = typeof row.league === 'string' ? JSON.parse(row.league) : row.league;

    const odds: MatchOdds | undefined = mapOdds(row.odds);

    return Match.reconstitute({
      id: row.id,
      apiFootballId: row.api_football_id,
      homeTeamId: homeTeam?.id || 0,
      homeTeamName: homeTeam?.name || 'Unknown',
      homeTeamLogo: homeTeam?.logo,
      awayTeamId: awayTeam?.id || 0,
      awayTeamName: awayTeam?.name || 'Unknown',
      awayTeamLogo: awayTeam?.logo,
      leagueId: league?.id || 0,
      leagueName: league?.name || 'Unknown',
      leagueLogo: league?.logo,
      leagueCountry: league?.country,
      season: row.season,
      status: row.status,
      matchDate: new Date(row.match_date),
      venue: row.venue || undefined,
      homeScore: row.home_score ?? undefined,
      awayScore: row.away_score ?? undefined,
      odds,
      bettingContractAddress: row.betting_contract_address || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  private toRow(match: Match): any {
    const json = match.toJSON();

    logger.info('toRow - Converting to database format', {
      homeTeam: json.homeTeam,
      awayTeam: json.awayTeam,
      league: json.league
    });

    return {
      id: json.id,
      api_football_id: json.apiFootballId,
      home_team: json.homeTeam,
      away_team: json.awayTeam,
      league: json.league,
      season: json.season,
      status: json.status,
      match_date: json.matchDate,
      venue: json.venue,
      home_score: json.score?.home,
      away_score: json.score?.away,
      odds: json.odds ? unmapOdds(json.odds) : null,
      // Normalize to lowercase so it joins against `bets.contract_address`
      // (which the indexer always writes lowercased). Mixed-case rows that
      // predate this fix break the join and surface as "Unknown match".
      betting_contract_address: json.bettingContractAddress?.toLowerCase(),
      created_at: json.createdAt,
      updated_at: json.updatedAt,
    };
  }
}
