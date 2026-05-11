// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {PariMatchBase} from "./PariMatchBase.sol";

/**
 * @title FootballPariMatch
 * @author ChilizTV Team
 * @notice Football pari-mutuel market contract.
 *
 * @dev Inherits all stake / resolution / claim logic from PariMatchBase.
 *      This contract only adds:
 *        (a) football-specific market type definitions
 *        (b) per-market metadata (type + line + max valid outcome index)
 *        (c) outcome validation
 *
 *      Market types map to the same sport vocabulary as before, but odds
 *      are no longer stored here. Selection encoding is unchanged:
 *        WINNER         → 0=Home / 1=Draw / 2=Away
 *        GOALS_TOTAL    → 0=Under / 1=Over
 *        BOTH_SCORE     → 0=No / 1=Yes
 *        HALFTIME       → 0=Home / 1=Draw / 2=Away
 *        CORRECT_SCORE  → encoded score (0..99)
 *        FIRST_SCORER   → player ID (0..255)
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

    // ═══════════════════════════════════════════════════════════════════════
    // STORAGE
    // ═══════════════════════════════════════════════════════════════════════

    struct FootballMarket {
        bytes32 marketType;
        int16   line;           // For O/U: e.g. 25 = 2.5 goals. 0 = no line.
        uint8   maxOutcome;     // Maximum valid outcome index (inclusive).
    }

    mapping(uint256 => FootballMarket) public footballMarkets;

    // ═══════════════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════════════

    error InvalidMarketType(bytes32 marketType);
    error InvalidOutcomeValue(uint256 marketId, uint64 outcome, uint8 maxAllowed);

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
    // MARKET CREATION
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Add a football market (single).
    function addMarketWithLine(bytes32 marketType, int16 line)
        external
        override
        onlyRole(ADMIN_ROLE)
    {
        _addFootballMarket(marketType, line);
    }

    /// @notice Add multiple football markets in one tx.
    function addMarketsBatch(
        bytes32[] calldata marketTypes,
        int16[]   calldata lines
    ) external onlyRole(ADMIN_ROLE) {
        uint256 n = marketTypes.length;
        if (n != lines.length) revert ArrayLengthMismatch();
        for (uint256 i; i < n; ++i) {
            _addFootballMarket(marketTypes[i], lines[i]);
        }
    }

    function _addFootballMarket(bytes32 marketType, int16 line) internal {
        uint8 maxOutcome = _getMaxOutcome(marketType);

        uint256 marketId = marketCount++;

        _marketCores[marketId].state     = MarketState.Inactive;
        _marketCores[marketId].createdAt = uint40(block.timestamp);

        footballMarkets[marketId] = FootballMarket({
            marketType: marketType,
            line:       line,
            maxOutcome: maxOutcome
        });

        emit MarketCreated(marketId, marketType);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VALIDATION
    // ═══════════════════════════════════════════════════════════════════════

    function _validateOutcome(uint256 marketId, uint64 outcome) internal view override {
        uint8 maxO = footballMarkets[marketId].maxOutcome;
        if (outcome > maxO) revert InvalidOutcomeValue(marketId, outcome, maxO);
    }

    function _getMaxOutcome(bytes32 marketType) internal pure returns (uint8) {
        if (marketType == MARKET_WINNER)        return 2;   // 0=Home 1=Draw 2=Away
        if (marketType == MARKET_GOALS_TOTAL)   return 1;   // 0=Under 1=Over
        if (marketType == MARKET_BOTH_SCORE)    return 1;   // 0=No 1=Yes
        if (marketType == MARKET_HALFTIME)      return 2;   // 0=Home 1=Draw 2=Away
        if (marketType == MARKET_CORRECT_SCORE) return 99;  // Encoded home*10+away
        if (marketType == MARKET_FIRST_SCORER)  return 255; // Player IDs
        revert InvalidMarketType(marketType);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    function getMarketInfo(uint256 marketId)
        external
        view
        override
        validMarket(marketId)
        returns (
            bytes32     marketType,
            MarketState state,
            uint64      result,
            uint256     totalPool,
            uint256     outcomeCount
        )
    {
        FootballMarket storage fm = footballMarkets[marketId];
        MarketCore     storage core = _marketCores[marketId];
        marketType   = fm.marketType;
        state        = core.state;
        result       = core.result;
        totalPool    = _totalPool[marketId];
        outcomeCount = uint256(fm.maxOutcome) + 1;
    }

    function getFootballMarket(uint256 marketId)
        external
        view
        validMarket(marketId)
        returns (
            string  memory marketTypeStr,
            int16          line,
            uint8          maxOutcome,
            MarketState    state,
            uint64         result,
            uint256        totalPool
        )
    {
        FootballMarket storage fm   = footballMarkets[marketId];
        MarketCore     storage core = _marketCores[marketId];
        marketTypeStr = _marketTypeToString(fm.marketType);
        line          = fm.line;
        maxOutcome    = fm.maxOutcome;
        state         = core.state;
        result        = core.result;
        totalPool     = _totalPool[marketId];
    }

    function _marketTypeToString(bytes32 mt) internal pure returns (string memory) {
        if (mt == MARKET_WINNER)        return "WINNER";
        if (mt == MARKET_GOALS_TOTAL)   return "GOALS_TOTAL";
        if (mt == MARKET_BOTH_SCORE)    return "BOTH_SCORE";
        if (mt == MARKET_HALFTIME)      return "HALFTIME";
        if (mt == MARKET_CORRECT_SCORE) return "CORRECT_SCORE";
        if (mt == MARKET_FIRST_SCORER)  return "FIRST_SCORER";
        return "UNKNOWN";
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STORAGE GAP
    // ═══════════════════════════════════════════════════════════════════════

    // forge-lint: disable-next-line(mixed-case-variable)
    uint256[48] private __gap_football;
}
