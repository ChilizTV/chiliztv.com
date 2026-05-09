import { getMarketSpec } from './marketTypes';

/** Human-readable label for one bet's `selection` given its market context. */
export function fmtSelectionByMarket(
    selection: number,
    marketTypeHash: string | undefined,
    line: number,
    homeTeamName?: string,
    awayTeamName?: string,
): string {
    const spec = getMarketSpec(marketTypeHash);
    if (!spec) return `Selection #${selection}`;

    const outcomes = spec.getOutcomes(line, homeTeamName, awayTeamName);
    const match = outcomes.find((o) => o.selection === selection);
    if (!match) {
        // Out-of-range selection — happens for FIRST_SCORER bets posted with
        // player IDs > 2 before the simplified UX (D2). Surface the raw index.
        return `Selection #${selection}`;
    }
    return match.label;
}
