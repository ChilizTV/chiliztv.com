// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {PariMatchBase} from "./PariMatchBase.sol";

/**
 * @title BasketballPariMatch
 * @author ChilizTV Team
 * @notice Basketball pari-mutuel market contract.
 *
 * @dev Sport-specific layer on top of PariMatchBase. All position / pool /
 *      claim / refund accounting lives in the base; this contract only adds:
 *        (a) the basketball market-type whitelist
 *        (b) the max-outcome table for each (type, line) pair
 *        (c) `resolveByScore` — a typed oracle entrypoint that settles
 *            every Closed market of this match from a single BasketballScore
 *            input (per-quarter scores), computing the winning outcome per
 *            market type.
 *
 *      Selection encoding (per market type):
 *        WINNER          0 = Home / 1 = Away  (no draw)
 *        TOTAL_POINTS    0 = Under / 1 = Over (line in 1/10-pt units, e.g. 2155 = 215.5)
 *        SPREAD          0 = Home covers / 1 = Away covers
 *                        line = home handicap in 1/10-pt units, e.g.  55 → home -5.5
 *                                                                    -55 → home +5.5
 *        QUARTER_WINNER  0 = Home / 1 = Away  (extra = 1..4 selects the quarter)
 *        FIRST_TO_SCORE  0 = Home / 1 = Away  (NOT derivable from final score)
 *        HIGHEST_QUARTER 0 = Q1 / 1 = Q2 / 2 = Q3 / 3 = Q4
 *        POINTS_EXACT    bucketed total points. outcome = min(total/step, line)
 *                        line  = highest bucket index (≥line goes to the cap)
 *                        extra = step size in points (0 ⇒ defaults to 1)
 *
 *      Markets whose outcome cannot be derived from a BasketballScore alone
 *      (FIRST_TO_SCORE, push on SPREAD, tie on QUARTER_WINNER /
 *      HIGHEST_QUARTER, misconfigured quarter) are left in Closed state by
 *      `resolveByScore` so the oracle can settle them manually via
 *      `resolveMarket` or the admin can `cancelMarket`.
 */
contract BasketballPariMatch is PariMatchBase {

    // ═══════════════════════════════════════════════════════════════════════
    // MARKET TYPE CONSTANTS
    // ═══════════════════════════════════════════════════════════════════════

    bytes32 public constant MARKET_WINNER          = keccak256("WINNER");
    bytes32 public constant MARKET_TOTAL_POINTS    = keccak256("TOTAL_POINTS");
    bytes32 public constant MARKET_SPREAD          = keccak256("SPREAD");
    bytes32 public constant MARKET_QUARTER_WINNER  = keccak256("QUARTER_WINNER");
    bytes32 public constant MARKET_FIRST_TO_SCORE  = keccak256("FIRST_TO_SCORE");
    bytes32 public constant MARKET_HIGHEST_QUARTER = keccak256("HIGHEST_QUARTER");
    bytes32 public constant MARKET_POINTS_EXACT    = keccak256("POINTS_EXACT");

    // ═══════════════════════════════════════════════════════════════════════
    // TYPES
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Per-quarter final score data used by `resolveByScore`.
    /// @dev    `firstToScore == 0` means "unknown / not provided" — FIRST_TO_SCORE
    ///         markets are skipped in that case. 1 = Home, 2 = Away.
    struct BasketballScore {
        uint8 homeQ1; uint8 awayQ1;
        uint8 homeQ2; uint8 awayQ2;
        uint8 homeQ3; uint8 awayQ3;
        uint8 homeQ4; uint8 awayQ4;
        uint8 firstToScore;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════════════

    error InvalidQuarter(uint8 quarter);

    // ═══════════════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════════════

    event MatchScoreResolved(
        uint16 homeTotal,
        uint16 awayTotal,
        uint8 firstToScore,
        uint256 marketsResolved
    );

    // ═══════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR & INITIALIZER
    // ═══════════════════════════════════════════════════════════════════════

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(string memory _matchName, address _owner) external initializer {
        __PariMatchBase_init(_matchName, "BASKETBALL", _owner);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MARKET CREATION HELPERS  (sport-specific ergonomics on top of base)
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Quarter markets need `extra` to select Q1..Q4.
    ///         Thin wrapper over `addMarketAdvanced(type, line, quarter, 0)`.
    function addQuarterMarket(bytes32 marketType, int16 line, uint8 quarter)
        external
        onlyRole(ADMIN_ROLE)
        returns (uint256 marketId)
    {
        if (quarter < 1 || quarter > 4) revert InvalidQuarter(quarter);
        return _addMarket(marketType, line, quarter, 0);
    }

    /// @notice Points-exact markets use `extra` as bucket step (0 ⇒ step = 1).
    function addPointsExactMarket(int16 line, uint8 step)
        external
        onlyRole(ADMIN_ROLE)
        returns (uint256 marketId)
    {
        return _addMarket(MARKET_POINTS_EXACT, line, step, 0);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MARKET TYPE HOOKS  (from PariMatchBase)
    // ═══════════════════════════════════════════════════════════════════════

    function _isValidMarketType(bytes32 marketType) internal pure override returns (bool) {
        return marketType == MARKET_WINNER
            || marketType == MARKET_TOTAL_POINTS
            || marketType == MARKET_SPREAD
            || marketType == MARKET_QUARTER_WINNER
            || marketType == MARKET_FIRST_TO_SCORE
            || marketType == MARKET_HIGHEST_QUARTER
            || marketType == MARKET_POINTS_EXACT;
    }

    function _getMaxOutcome(bytes32 marketType, int16 line) internal pure override returns (uint8) {
        if (marketType == MARKET_WINNER)          return 1; // Home / Away
        if (marketType == MARKET_TOTAL_POINTS)    return 1; // Under / Over
        if (marketType == MARKET_SPREAD)          return 1; // Home covers / Away covers
        if (marketType == MARKET_QUARTER_WINNER)  return 1; // Home / Away
        if (marketType == MARKET_FIRST_TO_SCORE)  return 1; // Home / Away
        if (marketType == MARKET_HIGHEST_QUARTER) return 3; // Q1..Q4
        if (marketType == MARKET_POINTS_EXACT) {
            if (line < 1 || line > 255) revert InvalidLine(marketType, line);
            return uint8(uint16(line));
        }
        revert InvalidMarketType(marketType);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // RESOLVE-BY-SCORE
    // ═══════════════════════════════════════════════════════════════════════

    function resolveByScore(BasketballScore calldata s)
        external
        onlyRole(RESOLVER_ROLE)
        returns (uint256 marketsResolved)
    {
        uint256 n = marketCount;
        for (uint256 i; i < n; ++i) {
            if (_marketCores[i].state != PariMatchBase.MarketState.Closed) continue;
            (uint64 outcome, bool ok) = _outcomeFromScore(i, s);
            if (!ok) continue;
            _resolveMarketInternal(i, outcome);
            unchecked { ++marketsResolved; }
        }
        emit MatchScoreResolved(
            _homeTotal(s), _awayTotal(s), s.firstToScore, marketsResolved
        );
    }

    function resolveBatchByScore(uint256[] calldata marketIds, BasketballScore calldata s)
        external
        onlyRole(RESOLVER_ROLE)
        returns (uint256 marketsResolved)
    {
        uint256 n = marketIds.length;
        for (uint256 i; i < n; ++i) {
            uint256 mid = marketIds[i];
            if (mid >= marketCount) revert InvalidMarketId(mid);
            if (_marketCores[mid].state != PariMatchBase.MarketState.Closed) continue;
            (uint64 outcome, bool ok) = _outcomeFromScore(mid, s);
            if (!ok) continue;
            _resolveMarketInternal(mid, outcome);
            unchecked { ++marketsResolved; }
        }
    }

    function computeOutcome(uint256 marketId, BasketballScore calldata s)
        external
        view
        validMarket(marketId)
        returns (uint64 outcome, bool resolvable)
    {
        return _outcomeFromScore(marketId, s);
    }

    function _outcomeFromScore(uint256 marketId, BasketballScore calldata s)
        internal
        view
        returns (uint64 outcome, bool resolvable)
    {
        MarketSpec storage spec = _marketSpec[marketId];
        bytes32 t = spec.marketType;

        if (t == MARKET_WINNER) {
            uint16 h = _homeTotal(s); uint16 a = _awayTotal(s);
            if (h > a) return (0, true);
            if (a > h) return (1, true);
            return (0, false); // tie — basketball winner is binary; let oracle decide
        }

        if (t == MARKET_TOTAL_POINTS) {
            uint256 totalTenths = (uint256(_homeTotal(s)) + uint256(_awayTotal(s))) * 10;
            int256  signedLine  = int256(spec.line);
            if (signedLine < 0) return (0, true);
            if (totalTenths > uint256(signedLine)) return (1, true);
            return (0, true);
        }

        if (t == MARKET_SPREAD) {
            int256 diff = (int256(uint256(_homeTotal(s))) - int256(uint256(_awayTotal(s)))) * 10;
            int256 signedLine = int256(spec.line);
            if (diff > signedLine) return (0, true); // home covers
            if (diff < signedLine) return (1, true); // away covers
            return (0, false); // push
        }

        if (t == MARKET_QUARTER_WINNER) {
            uint8 q = spec.extra;
            if (q < 1 || q > 4) return (0, false); // misconfigured
            (uint8 h, uint8 a) = _quarterScores(s, q);
            if (h > a) return (0, true);
            if (a > h) return (1, true);
            return (0, false); // tie
        }

        if (t == MARKET_FIRST_TO_SCORE) {
            if (s.firstToScore == 1) return (0, true);
            if (s.firstToScore == 2) return (1, true);
            return (0, false); // unknown / not derivable from final score
        }

        if (t == MARKET_HIGHEST_QUARTER) {
            uint16 q1 = uint16(s.homeQ1) + s.awayQ1;
            uint16 q2 = uint16(s.homeQ2) + s.awayQ2;
            uint16 q3 = uint16(s.homeQ3) + s.awayQ3;
            uint16 q4 = uint16(s.homeQ4) + s.awayQ4;
            uint16 best = q1; uint64 idx = 0; uint256 ties = 0;
            if (q2 > best) { best = q2; idx = 1; ties = 0; } else if (q2 == best) { ++ties; }
            if (q3 > best) { best = q3; idx = 2; ties = 0; } else if (q3 == best) { ++ties; }
            if (q4 > best) { best = q4; idx = 3; ties = 0; } else if (q4 == best) { ++ties; }
            if (ties > 0) return (0, false); // tie at top — admin must resolve
            return (idx, true);
        }

        if (t == MARKET_POINTS_EXACT) {
            uint256 total = uint256(_homeTotal(s)) + uint256(_awayTotal(s));
            uint8 step = spec.extra == 0 ? 1 : spec.extra;
            uint256 bucket = total / step;
            uint8 cap = spec.maxOutcome;
            if (bucket >= cap) return (uint64(cap), true);
            return (uint64(bucket), true);
        }

        return (0, false);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // INTERNAL HELPERS
    // ═══════════════════════════════════════════════════════════════════════

    function _homeTotal(BasketballScore calldata s) private pure returns (uint16) {
        unchecked {
            return uint16(s.homeQ1) + uint16(s.homeQ2) + uint16(s.homeQ3) + uint16(s.homeQ4);
        }
    }

    function _awayTotal(BasketballScore calldata s) private pure returns (uint16) {
        unchecked {
            return uint16(s.awayQ1) + uint16(s.awayQ2) + uint16(s.awayQ3) + uint16(s.awayQ4);
        }
    }

    function _quarterScores(BasketballScore calldata s, uint8 q)
        private pure returns (uint8 h, uint8 a)
    {
        if (q == 1) return (s.homeQ1, s.awayQ1);
        if (q == 2) return (s.homeQ2, s.awayQ2);
        if (q == 3) return (s.homeQ3, s.awayQ3);
        return (s.homeQ4, s.awayQ4);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STORAGE GAP
    // ═══════════════════════════════════════════════════════════════════════

    // forge-lint: disable-next-line(mixed-case-variable)
    uint256[50] private __gap_basketball;
}
