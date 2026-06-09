/**
 * Knockout detection — decides whether a fixture can potentially go to extra
 * time / penalties. The result is persisted ONCE at match create on the
 * `is_knockout` column and drives whether the FULL_TIME_WINNER market gets
 * seeded on the on-chain proxy.
 *
 * Order of decision matters. Two over-trigger cases must be EXCLUDED first
 * before applying positive signals:
 *
 *  1. **Group Stage in cup competitions** (World Cup group phase, Champions
 *     League group stage, Europa League groups). These have `league.type ==
 *     'Cup'` or `'World'` but never go to AET — group draws stand.
 *  2. **1st Leg of 2-legged knockout ties** (CL Round of 16 1st Leg, EL Semi
 *     1st Leg). These match the knockout round regex, but extra time only
 *     happens at the 2nd leg if aggregate is tied. The 1st leg itself never
 *     goes to AET.
 *
 * Then positive signals:
 *
 *  1. **PRIMARY** — `league.type === 'Cup'`. Language-agnostic; covers Coupe
 *     de France, Copa del Rey, FA Cup, DFB-Pokal, etc. even when `round` is
 *     localised in the league's native language.
 *  2. **FALLBACK** — regex on `league.round`. Catches knockout phases of
 *     league-format competitions (CL Round of 16 2nd Leg, EL Quarter-finals,
 *     World Cup knockout after the group phase). The regex is multilingual to
 *     cover romance-language API-Football payloads (Octavos, Cuartos,
 *     `1/8 de finale`, etc.).
 *
 * Mutations to this policy require updating the test fixtures in
 * `__tests__/KnockoutMatchPolicy.spec.ts` AND coordinating with the backend
 * `SyncMatchesUseCase` to re-run knockout detection on a backfill batch (the
 * flag is frozen at create — see Match entity / migration 035 docs).
 */

const GROUP_STAGE_REGEX = /Group Stage|Phase de Groupes|Group [A-H]|Grupo/i;
const FIRST_LEG_REGEX = /1st Leg|First Leg|Aller/i;
const KNOCKOUT_ROUND_REGEX = /(Final|Finale|Semi|Demi|Quarter|Quarts|Round of \d+|Octavos|Cuartos|Play-off|Knockout|1\/(?:2|4|8|16|32) de)/i;

export interface KnockoutMatchInput {
    league: {
        type?: string;
        round?: string;
    };
}

export function isKnockoutMatch(input: KnockoutMatchInput): boolean {
    const round = input.league?.round ?? '';

    // 1. Explicit exclusions FIRST — these over-trigger the positive signals.
    if (GROUP_STAGE_REGEX.test(round)) return false;
    if (FIRST_LEG_REGEX.test(round)) return false;

    // 2. PRIMARY positive: Cup competitions (native classification).
    if (input.league?.type === 'Cup') return true;

    // 3. FALLBACK positive: knockout-phase round names in League/World formats.
    if (KNOCKOUT_ROUND_REGEX.test(round)) return true;

    return false;
}
