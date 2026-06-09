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
 *     League group stage, Europa League groups). These never go to AET —
 *     group draws stand.
 *  2. **1st Leg of 2-legged knockout ties** (CL Round of 16 1st Leg, EL Semi
 *     1st Leg). These match the knockout round regex, but extra time only
 *     happens at the 2nd leg if aggregate is tied. The 1st leg itself never
 *     goes to AET.
 *
 * Then positive signals (in order of strength):
 *
 *  1. **PRIMARY** — `league.id ∈ PURE_KNOCKOUT_LEAGUE_IDS`. Authoritative
 *     for cup competitions where every fixture is knockout (Coupe de France,
 *     Copa del Rey, FA Cup, Carabao Cup, DFB-Pokal, Coppa Italia, KNVB Beker,
 *     Taça de Portugal, Türkiye Kupası, Copa do Brasil, plus all the super
 *     cups and UEFA Super Cup / CONMEBOL Recopa). Works regardless of the
 *     round label language because we identify the competition by its API ID.
 *  2. **SECONDARY** — `league.type === 'Cup'`. Useful when the upstream
 *     happens to expose the field (e.g. via a `/leagues` join). NOT present
 *     in `/fixtures` payloads today — kept as a no-op safety net.
 *  3. **FALLBACK** — regex on `league.round`. Catches knockout phases of
 *     league-format competitions not in the cup allowlist (CL Round of 16
 *     2nd Leg, EL Quarter-finals, World Cup knockout after the group phase).
 *     Multilingual regex covers romance-language API-Football payloads
 *     (Octavos, Cuartos, `1/8 de finale`, etc.).
 *
 * Mutations to this policy require updating the test fixtures in
 * `__tests__/KnockoutMatchPolicy.test.ts` AND coordinating with the backend
 * `SyncMatchesUseCase` — the flag is frozen at create (cf. migration 035 and
 * the no-update-on-resync rule in SyncMatchesUseCase update path).
 */

/**
 * Hardcoded allowlist of API-Football league IDs where every fixture is
 * knockout. Sourced from the Predcast competitions referential —
 * verify any addition via `GET /leagues?id=<X>` before merging. Mirrors
 * the cups + super cups + UEFA Super Cup + CONMEBOL Recopa subset of the
 * master `API_FOOTBALL_LEAGUE_IDS` allowlist (environment.ts).
 *
 * INTENTIONALLY hardcoded (not env-driven) — these IDs are domain knowledge
 * tied to API-Football's stable league numbering, not infra config. Adding
 * a new cup requires a code change + a review of the FULL_TIME_WINNER
 * market behaviour for that competition (e.g. some super cups go straight
 * to PEN without AET).
 */
const PURE_KNOCKOUT_LEAGUE_IDS: ReadonlySet<number> = new Set<number>([
    // Domestic cups
    66,   // France — Coupe de France
    143,  // Spain — Copa del Rey
    45,   // England — FA Cup
    48,   // England — EFL Cup (Carabao Cup)
    81,   // Germany — DFB-Pokal
    137,  // Italy — Coppa Italia
    90,   // Netherlands — KNVB Beker
    96,   // Portugal — Taça de Portugal
    97,   // Portugal — Taça da Liga
    206,  // Turkey — Türkiye Kupası
    73,   // Brazil — Copa do Brasil
    // Super cups (single-match knockout)
    526,  // France — Trophée des Champions
    556,  // Spain — Supercopa de España
    528,  // England — FA Community Shield
    529,  // Germany — DFL-Supercup
    547,  // Italy — Supercoppa Italiana
    92,   // Netherlands — Johan Cruyff Schaal
    550,  // Portugal — Supertaça
    75,   // Brazil — Supercopa do Brasil
    // UEFA Super Cup
    531,  // UEFA Super Cup
    // CONMEBOL Super Cup
    541,  // CONMEBOL Recopa Sudamericana
]);

const GROUP_STAGE_REGEX = /Group Stage|Phase de Groupes|Group [A-H]|Grupo/i;
const FIRST_LEG_REGEX = /1st Leg|First Leg|Aller/i;
const KNOCKOUT_ROUND_REGEX = /(Final|Finale|Semi|Demi|Quarter|Quarts|Round of \d+|Octavos|Cuartos|Play-off|Knockout|1\/(?:2|4|8|16|32) de)/i;

export interface KnockoutMatchInput {
    league: {
        id?: number;
        type?: string;
        round?: string;
    };
}

export function isKnockoutMatch(input: KnockoutMatchInput): boolean {
    const round = input.league?.round ?? '';

    // 1. Explicit exclusions FIRST — these over-trigger the positive signals.
    if (GROUP_STAGE_REGEX.test(round)) return false;
    if (FIRST_LEG_REGEX.test(round)) return false;

    // 2. PRIMARY positive: hardcoded cup / super-cup league IDs.
    //    Authoritative for competitions where 100% of fixtures are knockout —
    //    works even when `league.round` is localised in the native language
    //    (Coupe de France "32e tour", Copa del Rey "Treintaidosavos", ...).
    if (input.league?.id != null && PURE_KNOCKOUT_LEAGUE_IDS.has(input.league.id)) {
        return true;
    }

    // 3. SECONDARY positive: `league.type === 'Cup'` if exposed by the upstream.
    //    No-op today (API-Football /fixtures payload does NOT include `type`)
    //    but kept as a safety net in case a future cache layer joins the
    //    /leagues metadata onto the fixture rows.
    if (input.league?.type === 'Cup') return true;

    // 4. FALLBACK positive: knockout-phase round names in League/World formats.
    if (KNOCKOUT_ROUND_REGEX.test(round)) return true;

    return false;
}
