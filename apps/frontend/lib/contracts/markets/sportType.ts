import { SportType } from './types';

export { SportType };

/** True iff the on-chain `getSportType(matchAddress)` returns FOOTBALL (0). */
export function isFootballMatch(sport: SportType | number | undefined): boolean {
    return sport === SportType.FOOTBALL;
}
