// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {PariMatchBase} from "./PariMatchBase.sol";

/**
 * @title BasketballPariMatch
 * @author ChilizTV Team
 * @notice Basketball pari-mutuel market contract.
 *
 * @dev Same structure as FootballPariMatch: sport-specific metadata +
 *      outcome validation on top of the shared PariMatchBase.
 *
 *      Selection encoding:
 *        WINNER          → 0=Home / 1=Away
 *        TOTAL_POINTS    → 0=Under / 1=Over
 *        SPREAD          → 0=Home covers / 1=Away covers
 *        QUARTER_WINNER  → 0=Home / 1=Away  (quarter field selects Q1-Q4)
 *        FIRST_TO_SCORE  → 0=Home / 1=Away
 *        HIGHEST_QUARTER → 0=Q1 / 1=Q2 / 2=Q3 / 3=Q4
 */
contract BasketballPariMatch is PariMatchBase {

    // ═══════════════════════════════════════════════════════════════════════
    // MARKET TYPE CONSTANTS
    // ═══════════════════════════════════════════════════════════════════════

    bytes32 public constant MARKET_WINNER         = keccak256("WINNER");
    bytes32 public constant MARKET_TOTAL_POINTS   = keccak256("TOTAL_POINTS");
    bytes32 public constant MARKET_SPREAD         = keccak256("SPREAD");
    bytes32 public constant MARKET_QUARTER_WINNER = keccak256("QUARTER_WINNER");
    bytes32 public constant MARKET_FIRST_TO_SCORE = keccak256("FIRST_TO_SCORE");
    bytes32 public constant MARKET_HIGHEST_QUARTER = keccak256("HIGHEST_QUARTER");

    // ═══════════════════════════════════════════════════════════════════════
    // STORAGE
    // ═══════════════════════════════════════════════════════════════════════

    struct BasketballMarket {
        bytes32 marketType;
        int16   line;       // For O/U or spread (e.g. 2155 = 215.5 pts). 0 = no line.
        uint8   quarter;    // 1-4 for quarter markets; 0 = full game.
        uint8   maxOutcome;
    }

    mapping(uint256 => BasketballMarket) public basketballMarkets;

    // ═══════════════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════════════

    error InvalidMarketType(bytes32 marketType);
    error InvalidOutcomeValue(uint256 marketId, uint64 outcome, uint8 maxAllowed);
    error InvalidQuarter(uint8 quarter);

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
    // MARKET CREATION
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Add a full-game basketball market (quarter defaults to 0).
    function addMarketWithLine(bytes32 marketType, int16 line)
        external
        override
        onlyRole(ADMIN_ROLE)
    {
        _addBasketballMarket(marketType, line, 0);
    }

    /// @notice Add a quarter-specific market.
    function addMarketWithQuarter(bytes32 marketType, int16 line, uint8 quarter)
        external
        onlyRole(ADMIN_ROLE)
    {
        _addBasketballMarket(marketType, line, quarter);
    }

    function addMarketsBatch(
        bytes32[] calldata marketTypes,
        int16[]   calldata lines
    ) external onlyRole(ADMIN_ROLE) {
        uint256 n = marketTypes.length;
        if (n != lines.length) revert ArrayLengthMismatch();
        for (uint256 i; i < n; ++i) {
            _addBasketballMarket(marketTypes[i], lines[i], 0);
        }
    }

    function addMarketsBatchWithQuarter(
        bytes32[] calldata marketTypes,
        int16[]   calldata lines,
        uint8[]   calldata quarters
    ) external onlyRole(ADMIN_ROLE) {
        uint256 n = marketTypes.length;
        if (n != lines.length || n != quarters.length) revert ArrayLengthMismatch();
        for (uint256 i; i < n; ++i) {
            _addBasketballMarket(marketTypes[i], lines[i], quarters[i]);
        }
    }

    function _addBasketballMarket(bytes32 marketType, int16 line, uint8 quarter) internal {
        if (quarter > 4) revert InvalidQuarter(quarter);
        uint8 maxOutcome = _getMaxOutcome(marketType);

        uint256 marketId = marketCount++;

        _marketCores[marketId].state     = MarketState.Inactive;
        _marketCores[marketId].createdAt = uint40(block.timestamp);

        basketballMarkets[marketId] = BasketballMarket({
            marketType: marketType,
            line:       line,
            quarter:    quarter,
            maxOutcome: maxOutcome
        });

        emit MarketCreated(marketId, marketType);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VALIDATION
    // ═══════════════════════════════════════════════════════════════════════

    function _validateOutcome(uint256 marketId, uint64 outcome) internal view override {
        uint8 maxO = basketballMarkets[marketId].maxOutcome;
        if (outcome > maxO) revert InvalidOutcomeValue(marketId, outcome, maxO);
    }

    function _getMaxOutcome(bytes32 marketType) internal pure returns (uint8) {
        if (marketType == MARKET_WINNER)          return 1; // {0,1} Home / Away
        if (marketType == MARKET_TOTAL_POINTS)    return 1; // {0,1} Under / Over
        if (marketType == MARKET_SPREAD)          return 1; // {0,1} Home covers / Away covers
        if (marketType == MARKET_QUARTER_WINNER)  return 1; // {0,1} Home / Away
        if (marketType == MARKET_FIRST_TO_SCORE)  return 1; // {0,1} Home first / Away first
        if (marketType == MARKET_HIGHEST_QUARTER) return 3; // {0,1,2,3} Q1/Q2/Q3/Q4
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
        BasketballMarket storage bm   = basketballMarkets[marketId];
        MarketCore       storage core = _marketCores[marketId];
        marketType   = bm.marketType;
        state        = core.state;
        result       = core.result;
        totalPool    = _totalPool[marketId];
        outcomeCount = uint256(bm.maxOutcome) + 1;
    }

    function getBasketballMarket(uint256 marketId)
        external
        view
        validMarket(marketId)
        returns (
            string  memory marketTypeStr,
            int16          line,
            uint8          quarter,
            uint8          maxOutcome,
            MarketState    state,
            uint64         result,
            uint256        totalPool
        )
    {
        BasketballMarket storage bm   = basketballMarkets[marketId];
        MarketCore       storage core = _marketCores[marketId];
        marketTypeStr = _marketTypeToString(bm.marketType);
        line          = bm.line;
        quarter       = bm.quarter;
        maxOutcome    = bm.maxOutcome;
        state         = core.state;
        result        = core.result;
        totalPool     = _totalPool[marketId];
    }

    function _marketTypeToString(bytes32 mt) internal pure returns (string memory) {
        if (mt == MARKET_WINNER)          return "WINNER";
        if (mt == MARKET_TOTAL_POINTS)    return "TOTAL_POINTS";
        if (mt == MARKET_SPREAD)          return "SPREAD";
        if (mt == MARKET_QUARTER_WINNER)  return "QUARTER_WINNER";
        if (mt == MARKET_FIRST_TO_SCORE)  return "FIRST_TO_SCORE";
        if (mt == MARKET_HIGHEST_QUARTER) return "HIGHEST_QUARTER";
        return "UNKNOWN";
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STORAGE GAP
    // ═══════════════════════════════════════════════════════════════════════

    // forge-lint: disable-next-line(mixed-case-variable)
    uint256[48] private __gap_basketball;
}
