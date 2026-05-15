import {
  Trophy,
  Target,
  Users,
  Hash,
  Flag,
  Clock3,
  TrendingUp,
  ScrollText,
  type LucideIcon,
} from 'lucide-react';

export interface MarketCopy {
  label: string;
  hint: string;
  icon: LucideIcon;
  /** Tailwind/css accent colour used for the market header chip. */
  accent: string;
}

/** Frontend metadata for each (sport-agnostic) market-type slug. Slugs come
 *  from `marketTypeKey()` in usePariMatch.ts. */
export const MARKET_META: Record<string, MarketCopy> = {
  // Football
  winner:         { label: 'Match Winner',     hint: 'Home / Draw / Away',          icon: Trophy,     accent: '#E8001D' },
  goals_total:    { label: 'Total Goals',      hint: 'Over / Under',                icon: Target,     accent: '#F5A524' },
  both_score:     { label: 'Both Teams Score', hint: 'Yes / No',                    icon: Users,      accent: '#7C4DFF' },
  halftime:       { label: 'Halftime Result',  hint: 'Score at half',               icon: Clock3,     accent: '#00C853' },
  correct_score:  { label: 'Correct Score',    hint: 'Exact final score (0..9 each)', icon: Hash,     accent: '#00BCD4' },
  first_scorer:   { label: 'First Scorer',     hint: 'Player ID',                   icon: Flag,       accent: '#FF4081' },
  goals_exact:    { label: 'Exact Goals',      hint: 'Bucket: 0, 1, 2, …, cap+',    icon: TrendingUp, accent: '#FFC400' },
  // Basketball
  total_points:    { label: 'Total Points',     hint: 'Over / Under',                  icon: Target,     accent: '#F5A524' },
  spread:          { label: 'Point Spread',     hint: 'Home covers / Away covers',     icon: TrendingUp, accent: '#7C4DFF' },
  quarter_winner:  { label: 'Quarter Winner',   hint: 'Home / Away (per quarter)',     icon: Trophy,     accent: '#E8001D' },
  first_to_score:  { label: 'First to Score',   hint: 'Home / Away',                   icon: Flag,       accent: '#FF4081' },
  highest_quarter: { label: 'Highest Quarter',  hint: 'Q1 / Q2 / Q3 / Q4',             icon: Clock3,     accent: '#00C853' },
  points_exact:    { label: 'Exact Points',     hint: 'Bucketed total',                icon: TrendingUp, accent: '#FFC400' },
  // Fallback
  unknown:        { label: 'Unknown market',    hint: '',                            icon: ScrollText, accent: '#888888' },
};

/** Default per-outcome accent colours, ordered. The card cycles through them
 *  if a market has more outcomes than meta-coloured ones. */
export const OUTCOME_COLORS = [
  '#E8001D',  // home red
  '#7C4DFF',  // draw purple
  '#00BCD4',  // away cyan
  '#F5A524',  // amber
  '#00C853',  // green
  '#FF4081',  // pink
];

/**
 * Per-market-type outcome labels. For binary/ternary markets we hardcode
 * meaningful names; for high-cardinality markets (correct score, first scorer,
 * goals_exact, points_exact) we generate them at runtime from the maxOutcome
 * spec field.
 *
 * Returns an array of length `maxOutcome + 1`. `homeTeam` / `awayTeam` /
 * `line` flow in for label substitution.
 */
export function outcomeLabels(
  key: string,
  maxOutcome: number,
  line: number,
  homeTeam = 'Home',
  awayTeam = 'Away',
): string[] {
  switch (key) {
    case 'winner':
    case 'halftime':
      return [homeTeam, 'Draw', awayTeam];

    case 'goals_total': {
      const lnDisplay = (line / 10).toFixed(1);
      return [`Under ${lnDisplay}`, `Over ${lnDisplay}`];
    }

    case 'both_score':
      return ['No', 'Yes'];

    case 'correct_score':
      return Array.from({ length: maxOutcome + 1 }, (_, i) => `${Math.floor(i / 10)}-${i % 10}`);

    case 'first_scorer':
      return Array.from(
        { length: maxOutcome + 1 },
        (_, i) => (i === 0 ? 'No goals' : `Player #${i}`),
      );

    case 'goals_exact':
      return Array.from({ length: maxOutcome + 1 }, (_, i) =>
        i === maxOutcome ? `${i}+ goals` : `${i} goal${i === 1 ? '' : 's'}`,
      );

    case 'total_points': {
      const lnDisplay = (line / 10).toFixed(1);
      return [`Under ${lnDisplay}`, `Over ${lnDisplay}`];
    }

    case 'spread': {
      const lnDisplay = (line / 10).toFixed(1);
      return [`${homeTeam} ${line >= 0 ? '-' : '+'}${Math.abs(Number(lnDisplay))}`, `${awayTeam} cover`];
    }

    case 'quarter_winner':
      return [homeTeam, awayTeam];

    case 'first_to_score':
      return [homeTeam, awayTeam];

    case 'highest_quarter':
      return ['Q1', 'Q2', 'Q3', 'Q4'];

    case 'points_exact':
      return Array.from({ length: maxOutcome + 1 }, (_, i) =>
        i === maxOutcome ? `${i}+ buckets` : `Bucket ${i}`,
      );

    default:
      return Array.from({ length: maxOutcome + 1 }, (_, i) => `Outcome ${i}`);
  }
}
