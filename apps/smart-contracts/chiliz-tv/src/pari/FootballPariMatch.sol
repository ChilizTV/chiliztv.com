// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {PariMatchBase} from "./PariMatchBase.sol";

/**
 * @title FootballPariMatch
 * @author ChilizTV Team
 * @notice Football pari-mutuel market contract.
 *
 * @dev Sport-specific layer on top of PariMatchBase. All position / pool /
 *      claim / refund accounting lives in the base; this contract only adds:
 *        (a) the football market-type whitelist
 *        (b) the max-outcome table for each (type, line) pair
 *        (c) `resolveByScore` — a typed oracle entrypoint that settles
 *            every Closed market of this match from a single FootballScore
 *            input, computing the winning outcome per market type.
 *
 *      Selection encoding (per market type):
 *        WINNER         0 = Home / 1 = Draw / 2 = Away
 *        GOALS_TOTAL    0 = Under / 1 = Over (line in 1/10-goal units, e.g. 25 = 2.5)
 *        BOTH_SCORE     0 = No / 1 = Yes
 *        HALFTIME       0 = Home / 1 = Draw / 2 = Away
 *        CORRECT_SCORE  encoded as clamp(home,9)*10 + clamp(away,9), 0..99
 *        FIRST_SCORER   player ID, 1..255 (0 reserved for "no goals")
 *        GOALS_EXACT    bucketed total goals: outcome = min(homeGoals + awayGoals, line);
 *                       line is the cap of the highest bucket (e.g. line=5 → 0,1,2,3,4,5+)
 *
 *      Line semantics:
 *        - GOALS_TOTAL: 1/10-goal units. Use half-goal lines (15, 25, 35, ...) to
 *          avoid pushes. Whole-number lines are accepted but settle as Under on tie.
 *        - GOALS_EXACT: integer in [1, 255]. Highest bucket is "≥line".
 */
contract FootballPariMatch is PariMatchBase {

    // ═══════════════════════════════════════════════════════════════════════
    // MARKET TYPE CONSTANTS
    // ═══════════════════════════════════════════════════════════════════════

    bytes32 public constant MARKET_WINNER        = keccak256("WINNER");
    bytes32 public constant MARKET_GOALS_TOTAL   = keccak256("GOALS_TOTAL");
    bytes32 public constant MARKET_BOTH_SCORE    = keccak256("BOTH_SCORE");
    bytes32 public constant MARKET_HALFTIME      = keccak256("HALFTIME");
    bytes32 public constant MARKET_CORRECT_SCORE = keccak256("CORRECT_SCORE");
    bytes32 public constant MARKET_FIRST_SCORER  = keccak256("FIRST_SCORER");
    bytes32 public constant MARKET_GOALS_EXACT   = keccak256("GOALS_EXACT");

    // ═══════════════════════════════════════════════════════════════════════
    // TYPES
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Final score data used by `resolveByScore`.
    /// @dev    `firstScorerId == 0` means "unknown / not provided".
    ///         FIRST_SCORER markets are skipped (left in Closed state) when 0.
    ///         Player IDs 1..255 are the legitimate scorers.
    struct FootballScore {
        uint8 homeGoals;
        uint8 awayGoals;
        uint8 htHomeGoals;
        uint8 htAwayGoals;
        uint8 firstScorerId;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════════════

    event MatchScoreResolved(
        uint8 homeGoals,
        uint8 awayGoals,
        uint8 htHomeGoals,
        uint8 htAwayGoals,
        uint8 firstScorerId,
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
        __PariMatchBase_init(_matchName, "FOOTBALL", _owner);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MARKET TYPE HOOKS  (from PariMatchBase)
    // ═══════════════════════════════════════════════════════════════════════

    function _isValidMarketType(bytes32 marketType) internal pure override returns (bool) {
        return marketType == MARKET_WINNER
            || marketType == MARKET_GOALS_TOTAL
            || marketType == MARKET_BOTH_SCORE
            || marketType == MARKET_HALFTIME
            || marketType == MARKET_CORRECT_SCORE
            || marketType == MARKET_FIRST_SCORER
            || marketType == MARKET_GOALS_EXACT;
    }

    function _getMaxOutcome(bytes32 marketType, int16 line) internal pure override returns (uint8) {
        if (marketType == MARKET_WINNER)        return 2;   // 0=Home 1=Draw 2=Away
        if (marketType == MARKET_GOALS_TOTAL)   return 1;   // 0=Under 1=Over
        if (marketType == MARKET_BOTH_SCORE)    return 1;   // 0=No 1=Yes
        if (marketType == MARKET_HALFTIME)      return 2;   // 0=Home 1=Draw 2=Away
        if (marketType == MARKET_CORRECT_SCORE) return 99;  // home*10 + away (each 0..9)
        if (marketType == MARKET_FIRST_SCORER)  return 255; // player IDs 1..255 (0=no scorer)
        if (marketType == MARKET_GOALS_EXACT) {
            if (line < 1 || line > 255) revert InvalidLine(marketType, line);
            return uint8(uint16(line));
        }
        revert InvalidMarketType(marketType);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // RESOLVE-BY-SCORE
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Resolve every Closed market of this match from one final-score input.
    /// @dev    Markets that cannot be derived from `s` (e.g. FIRST_SCORER when
    ///         `firstScorerId == 0`) are skipped — they remain Closed and the
    ///         oracle may settle them later via `resolveMarket`.
    ///         Markets in any state other than Closed are skipped.
    ///         Reverts only on access control / arithmetic errors.
    function resolveByScore(FootballScore calldata s)
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
            s.homeGoals, s.awayGoals, s.htHomeGoals, s.htAwayGoals,
            s.firstScorerId, marketsResolved
        );
    }

    /// @notice Resolve a chosen subset of markets from a final-score input.
    ///         Useful when the oracle wants per-market control or knows that
    ///         some markets in this batch are not derivable from `s`.
    function resolveBatchByScore(uint256[] calldata marketIds, FootballScore calldata s)
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

    /// @notice View helper: what outcome would `s` produce for `marketId`?
    /// @return outcome     The computed winning outcome.
    /// @return resolvable  False if this market type cannot be derived from `s`
    ///                     in its current configuration (caller should skip).
    function computeOutcome(uint256 marketId, FootballScore calldata s)
        external
        view
        validMarket(marketId)
        returns (uint64 outcome, bool resolvable)
    {
        return _outcomeFromScore(marketId, s);
    }

    function _outcomeFromScore(uint256 marketId, FootballScore calldata s)
        internal
        view
        returns (uint64 outcome, bool resolvable)
    {
        MarketSpec storage spec = _marketSpec[marketId];
        bytes32 t = spec.marketType;

        if (t == MARKET_WINNER) {
            if (s.homeGoals > s.awayGoals)  return (0, true);
            if (s.homeGoals == s.awayGoals) return (1, true);
            return (2, true);
        }

        if (t == MARKET_GOALS_TOTAL) {
            // total*10 > line  →  Over. Whole-number lines push to Under.
            uint256 totalTenths = (uint256(s.homeGoals) + uint256(s.awayGoals)) * 10;
            int256  signedLine  = int256(spec.line);
            if (signedLine < 0) return (0, true); // never Over a negative line
            if (totalTenths > uint256(signedLine)) return (1, true);
            return (0, true);
        }

        if (t == MARKET_BOTH_SCORE) {
            return ((s.homeGoals > 0 && s.awayGoals > 0) ? uint64(1) : uint64(0), true);
        }

        if (t == MARKET_HALFTIME) {
            if (s.htHomeGoals > s.htAwayGoals)  return (0, true);
            if (s.htHomeGoals == s.htAwayGoals) return (1, true);
            return (2, true);
        }

        if (t == MARKET_CORRECT_SCORE) {
            uint256 home = s.homeGoals > 9 ? 9 : s.homeGoals;
            uint256 away = s.awayGoals > 9 ? 9 : s.awayGoals;
            return (uint64(home * 10 + away), true);
        }

        if (t == MARKET_FIRST_SCORER) {
            if (s.firstScorerId == 0) return (0, false); // skip — needs explicit resolveMarket
            return (uint64(s.firstScorerId), true);
        }

        if (t == MARKET_GOALS_EXACT) {
            uint256 total = uint256(s.homeGoals) + uint256(s.awayGoals);
            uint8 cap = spec.maxOutcome;
            if (total >= cap) return (uint64(cap), true);
            return (uint64(total), true);
        }

        return (0, false);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STORAGE GAP
    // ═══════════════════════════════════════════════════════════════════════

    // forge-lint: disable-next-line(mixed-case-variable)
    uint256[50] private __gap_football;
}
