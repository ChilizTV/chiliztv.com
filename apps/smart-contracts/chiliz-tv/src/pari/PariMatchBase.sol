// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Initializable}              from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable}         from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {AccessControlUpgradeable}   from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {UUPSUpgradeable}            from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {PausableUpgradeable}        from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {IERC20}                     from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20}                  from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title PariMatchBase
 * @author ChilizTV Team
 * @notice Abstract base for pari-mutuel (pooled-positions) sports markets.
 *
 * @dev Architecture overview
 * ──────────────────────────
 * This contract IS the escrow. User USDC flows directly here on placement
 * and flows back out at claim / refund time. No external LP vault is involved.
 *
 * Fund flow:
 *   User stakes USDC on outcome O of market M.
 *   USDC is held in this contract until resolution.
 *   On resolution the protocol fee is sent immediately to `feeRecipient`.
 *   Winners claim their proportional share of the net pool.
 *   Cancelled markets allow all stakers to withdraw their original stake.
 *
 * Payout formula (per winner):
 *   netPool        = totalPool[M] * (BPS_DENOM - feeBps) / BPS_DENOM
 *   userPayout     = userStake[M][user][winningOutcome]
 *                      * netPool
 *                      / outcomePool[M][winningOutcome]
 *
 * Special case — void market (winning outcome pool == 0):
 *   Market transitions to Cancelled automatically at resolution time.
 *   No fee is taken. Every staker reclaims their full _userTotalStake.
 *
 * No odds are stored on-chain. Indicative odds may be displayed in the
 * front-end from off-chain computation (e.g. implied probability =
 * outcomePool / totalPool) but are never contractually guaranteed.
 *
 * No LP shares, no investment tokens, no yield-bearing instruments.
 * The only financial instrument is a non-transferable on-chain accounting
 * entry of how much USDC a user put into a given outcome.
 *
 * Roles:
 *   DEFAULT_ADMIN_ROLE — upgrades, role management.
 *   ADMIN_ROLE         — market lifecycle (create/open/close/cancel).
 *   RESOLVER_ROLE      — set the winning outcome (oracle / off-chain backend).
 *   PAUSER_ROLE        — emergency pause.
 *   SWAP_ROUTER_ROLE   — place bets on behalf of users after swapping tokens.
 *
 * Storage invariant:
 *   IERC20(usdcToken).balanceOf(address(this))
 *     == Σ_unresolvedMarkets _totalPool[m]
 *      + Σ_resolvedMarkets (_totalPool[m] - feeAlreadyPaid[m] - payoutsAlreadyPaid[m])
 *   This is maintained by the CEI pattern + reentrancy guard.
 */
abstract contract PariMatchBase is
    Initializable,
    OwnableUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable
{
    using SafeERC20 for IERC20;

    // ═══════════════════════════════════════════════════════════════════════
    // CONSTANTS & ROLES
    // ═══════════════════════════════════════════════════════════════════════

    bytes32 public constant ADMIN_ROLE       = keccak256("ADMIN_ROLE");
    bytes32 public constant RESOLVER_ROLE    = keccak256("RESOLVER_ROLE");
    bytes32 public constant PAUSER_ROLE      = keccak256("PAUSER_ROLE");
    bytes32 public constant SWAP_ROUTER_ROLE = keccak256("SWAP_ROUTER_ROLE");

    /// @notice Minimum stake per placement (anti-dust / anti-griefing).
    ///         0.01 USDC in 6-decimal precision.
    uint256 public constant MIN_STAKE = 10_000;

    /// @notice Denominator for basis-point calculations.
    uint256 public constant BPS_DENOM = 10_000;

    /// @notice Hard ceiling on the protocol fee (5%). Prevents fee parameter
    ///         from being raised to a level that would constitute a hidden
    ///         expropriation of user funds.
    uint16 public constant MAX_FEE_BPS = 500;

    // ═══════════════════════════════════════════════════════════════════════
    // ENUMS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Market lifecycle. Transitions are one-directional except that
    ///         Cancelled is reachable from Open, Suspended, and Closed.
    enum MarketState {
        Inactive,   // Created, not yet open for stakes.
        Open,       // Accepting stakes.
        Suspended,  // Temporarily paused (e.g. live score changes).
        Closed,     // No more stakes; awaiting resolution.
        Resolved,   // Winner set; claims open.
        Cancelled   // All stakers may refund (used for void / abandoned events).
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STRUCTS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Core market data. Two slots.
    ///         Slot A: state(1) + result(8) + createdAt(5) + resolvedAt(5) = 19 bytes → 1 slot
    ///         Slot B: resolvedNetPool (32 bytes) → 1 slot
    struct MarketCore {
        MarketState state;       // 1 byte
        uint64      result;      // 8 bytes — winning outcome index; valid only in Resolved
        uint40      createdAt;   // 5 bytes
        uint40      resolvedAt;  // 5 bytes
        // 1 + 8 + 5 + 5 = 19 bytes in slot A; 13 bytes padding
        uint256     resolvedNetPool;
        // Net pool available to winners = totalPool * (BPS_DENOM - feeBps) / BPS_DENOM
        // Snapshotted at resolveMarket() so late feeBps changes cannot affect in-flight claims.
        // 0 means either unresolved or void (no winning bets — auto-cancelled).
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STORAGE  (Upgrade-safe — do NOT reorder or delete slots)
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Human-readable match identifier (e.g. "Barcelona vs Real Madrid").
    string public matchName;                                          // slot 0

    /// @notice Sport identifier set by the child initializer.
    string public sportType;                                          // slot 1

    /// @notice Total number of markets created on this match.
    uint256 public marketCount;                                       // slot 2

    /// @notice Core data per market.
    mapping(uint256 marketId => MarketCore) internal _marketCores;   // slot 3

    /// @notice Gross USDC pool for each market (sum of all outcome pools).
    ///         Never decremented after placement — reflects the historical total
    ///         of all user stakes regardless of payout/refund status.
    mapping(uint256 marketId => uint256) internal _totalPool;         // slot 4

    /// @notice USDC pool per outcome.
    ///         outcomePool[m][o] = Σ stakes placed on outcome o in market m.
    mapping(uint256 marketId => mapping(uint64 outcome => uint256)) internal _outcomePool;  // slot 5

    /// @notice Individual user stake per outcome.
    ///         This is the accounting primitive for winner payouts.
    ///         A user may place multiple bets on the same outcome; they accumulate.
    ///         A user may also bet on multiple distinct outcomes of the same market.
    mapping(uint256 marketId => mapping(address user => mapping(uint64 outcome => uint256))) internal _userStake;  // slot 6

    /// @notice Sum of all user stakes in a market, across all outcomes.
    ///         Used for O(1) full-refund calculation on cancellation.
    mapping(uint256 marketId => mapping(address user => uint256)) internal _userTotalStake;  // slot 7

    /// @notice Claim / refund gate. Set to true the first time a user claims
    ///         or refunds from a market. Prevents double-withdrawals.
    mapping(uint256 marketId => mapping(address user => bool)) internal _claimed;  // slot 8

    /// @notice USDC token used for all settlements.
    IERC20 public usdcToken;                                          // slot 9

    /// @notice Address that receives protocol fees at market resolution.
    ///         Should be a multi-sig or trusted treasury. NOT an LP vault.
    address public feeRecipient;                                      // slot 10

    /// @notice Protocol fee in basis points (default 200 = 2%).
    ///         Capped at MAX_FEE_BPS. Applied to the gross pool at resolution.
    ///         Winners share the net pool proportionally.
    uint16 public feeBps;                                             // slot 10 (packed with feeRecipient)
    //   address = 20 bytes, uint16 = 2 bytes → 22 bytes ≤ 32 bytes → same slot.

    // Slots 0-10 = 11 named slots.
    // Gap to 50 total slots.
    uint256[39] private __gap;

    // ═══════════════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════════════

    event MatchInitialized(string indexed name, string sportType, address indexed owner);
    event MarketCreated(uint256 indexed marketId, bytes32 marketType);
    event MarketStateChanged(uint256 indexed marketId, MarketState oldState, MarketState newState);
    event MarketCancelled(uint256 indexed marketId, string reason);

    event PositionTaken(
        uint256 indexed marketId,
        address indexed user,
        uint64  outcome,
        uint256 stake,
        uint256 newOutcomePool,
        uint256 newTotalPool
    );

    event MarketResolved(
        uint256 indexed marketId,
        uint64  result,
        uint256 totalPool,
        uint256 fee,
        uint256 resolvedNetPool
    );

    event PositionClaimed(
        uint256 indexed marketId,
        address indexed user,
        uint256 stake,
        uint256 payout
    );

    event StakeRefunded(
        uint256 indexed marketId,
        address indexed user,
        uint256 amount
    );

    event FeeRecipientSet(address indexed oldRecipient, address indexed newRecipient);
    event FeeBpsSet(uint16 oldBps, uint16 newBps);
    event USDCTokenSet(address indexed token);

    // ═══════════════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════════════

    error InvalidMarketId(uint256 marketId);
    error InvalidMarketState(uint256 marketId, MarketState current, MarketState required);
    error InvalidOutcome(uint256 marketId, uint64 outcome);
    error StakeBelowMinimum(uint256 stake, uint256 minimum);
    error ZeroStake();
    error AlreadyClaimed(uint256 marketId, address user);
    error NothingToClaim(uint256 marketId, address user);
    error NothingToRefund(uint256 marketId, address user);
    error USDCNotConfigured();
    error FeeRecipientNotConfigured();
    error FeeBpsExceedsMax(uint16 provided, uint16 max);
    error ArrayLengthMismatch();

    // ═══════════════════════════════════════════════════════════════════════
    // MODIFIERS
    // ═══════════════════════════════════════════════════════════════════════

    modifier validMarket(uint256 marketId) {
        if (marketId >= marketCount) revert InvalidMarketId(marketId);
        _;
    }

    modifier inState(uint256 marketId, MarketState required) {
        MarketState current = _marketCores[marketId].state;
        if (current != required) revert InvalidMarketState(marketId, current, required);
        _;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // INITIALIZER (called by sport-specific child initializer)
    // ═══════════════════════════════════════════════════════════════════════

    // forge-lint: disable-next-line(mixed-case-function)
    function __PariMatchBase_init(
        string memory _matchName,
        string memory _sportType,
        address _owner
    ) internal onlyInitializing {
        __Ownable_init(_owner);
        __AccessControl_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        __Pausable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, _owner);
        _grantRole(ADMIN_ROLE,         _owner);
        _grantRole(PAUSER_ROLE,        _owner);

        // RESOLVER_ROLE is intentionally NOT granted here. Resolution must be
        // assigned to a dedicated oracle address after deployment via
        // grantRole(RESOLVER_ROLE, oracle), separating oracle key from admin key.

        matchName = _matchName;
        sportType = _sportType;
        feeBps    = 200; // 2% default

        emit MatchInitialized(_matchName, _sportType, _owner);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ADMIN SETTERS
    // ═══════════════════════════════════════════════════════════════════════

    function setUSDCToken(address _usdc) external onlyRole(ADMIN_ROLE) {
        if (_usdc == address(0)) revert USDCNotConfigured();
        usdcToken = IERC20(_usdc);
        emit USDCTokenSet(_usdc);
    }

    function setFeeRecipient(address _recipient) external onlyRole(ADMIN_ROLE) {
        if (_recipient == address(0)) revert FeeRecipientNotConfigured();
        address old = feeRecipient;
        feeRecipient = _recipient;
        emit FeeRecipientSet(old, _recipient);
    }

    function setFeeBps(uint16 _feeBps) external onlyRole(ADMIN_ROLE) {
        if (_feeBps > MAX_FEE_BPS) revert FeeBpsExceedsMax(_feeBps, MAX_FEE_BPS);
        uint16 old = feeBps;
        feeBps = _feeBps;
        emit FeeBpsSet(old, _feeBps);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MARKET STATE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    function openMarket(uint256 marketId)
        external validMarket(marketId) onlyRole(ADMIN_ROLE)
    { _transitionMarketState(marketId, MarketState.Open); }

    function suspendMarket(uint256 marketId)
        external validMarket(marketId) onlyRole(ADMIN_ROLE)
    { _transitionMarketState(marketId, MarketState.Suspended); }

    function closeMarket(uint256 marketId)
        external validMarket(marketId) onlyRole(ADMIN_ROLE)
    { _transitionMarketState(marketId, MarketState.Closed); }

    function openMarketsBatch(uint256[] calldata marketIds) external onlyRole(ADMIN_ROLE) {
        uint256 n = marketIds.length;
        for (uint256 i; i < n; ++i) {
            if (marketIds[i] >= marketCount) revert InvalidMarketId(marketIds[i]);
            if (_marketCores[marketIds[i]].state == MarketState.Open) continue;
            _transitionMarketState(marketIds[i], MarketState.Open);
        }
    }

    function closeMarketsBatch(uint256[] calldata marketIds) external onlyRole(ADMIN_ROLE) {
        uint256 n = marketIds.length;
        for (uint256 i; i < n; ++i) {
            if (marketIds[i] >= marketCount) revert InvalidMarketId(marketIds[i]);
            MarketState s = _marketCores[marketIds[i]].state;
            if (s == MarketState.Closed || s == MarketState.Resolved || s == MarketState.Cancelled) continue;
            _transitionMarketState(marketIds[i], MarketState.Closed);
        }
    }

    function cancelMarket(uint256 marketId, string calldata reason)
        external validMarket(marketId) onlyRole(ADMIN_ROLE)
    {
        _transitionMarketState(marketId, MarketState.Cancelled);
        emit MarketCancelled(marketId, reason);
    }

    function _transitionMarketState(uint256 marketId, MarketState newState) internal {
        MarketCore storage core = _marketCores[marketId];
        MarketState oldState = core.state;

        if (newState == MarketState.Open) {
            if (oldState != MarketState.Inactive && oldState != MarketState.Suspended)
                revert InvalidMarketState(marketId, oldState, newState);
        } else if (newState == MarketState.Suspended) {
            if (oldState != MarketState.Open)
                revert InvalidMarketState(marketId, oldState, newState);
        } else if (newState == MarketState.Closed) {
            if (oldState != MarketState.Open && oldState != MarketState.Suspended)
                revert InvalidMarketState(marketId, oldState, newState);
        } else if (newState == MarketState.Cancelled) {
            if (
                oldState != MarketState.Open &&
                oldState != MarketState.Suspended &&
                oldState != MarketState.Closed
            ) revert InvalidMarketState(marketId, oldState, newState);
        } else {
            revert InvalidMarketState(marketId, oldState, newState);
        }

        core.state = newState;
        emit MarketStateChanged(marketId, oldState, newState);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // POSITION TAKING
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Place a stake directly with USDC.
    /// @dev    Caller must approve `amount` USDC to THIS contract.
    ///         Stakes accumulate: calling twice on the same outcome adds to
    ///         the existing position rather than replacing it.
    function placeBetUSDC(uint256 marketId, uint64 outcome, uint256 amount)
        external
        nonReentrant
        validMarket(marketId)
        inState(marketId, MarketState.Open)
        whenNotPaused
    {
        if (address(usdcToken) == address(0)) revert USDCNotConfigured();
        if (amount == 0) revert ZeroStake();
        if (amount < MIN_STAKE) revert StakeBelowMinimum(amount, MIN_STAKE);

        _validateOutcome(marketId, outcome);

        // Pull USDC from the caller into this contract (the escrow).
        usdcToken.safeTransferFrom(msg.sender, address(this), amount);

        _recordStake(msg.sender, marketId, outcome, amount);
    }

    /// @notice Place a stake on behalf of a user after the router has already
    ///         transferred `amount` USDC to this contract.
    /// @dev    Only callable by SWAP_ROUTER_ROLE. No safeTransferFrom is
    ///         performed here — the router must transfer the funds first then
    ///         call this in the same transaction.
    function placeBetUSDCFor(
        address user,
        uint256 marketId,
        uint64  outcome,
        uint256 amount
    )
        external
        nonReentrant
        validMarket(marketId)
        inState(marketId, MarketState.Open)
        whenNotPaused
        onlyRole(SWAP_ROUTER_ROLE)
    {
        if (amount == 0) revert ZeroStake();
        if (amount < MIN_STAKE) revert StakeBelowMinimum(amount, MIN_STAKE);
        _validateOutcome(marketId, outcome);
        _recordStake(user, marketId, outcome, amount);
    }

    function _recordStake(
        address user,
        uint256 marketId,
        uint64  outcome,
        uint256 amount
    ) internal {
        _userStake[marketId][user][outcome]    += amount;
        _userTotalStake[marketId][user]        += amount;
        _outcomePool[marketId][outcome]        += amount;
        _totalPool[marketId]                   += amount;

        emit PositionTaken(
            marketId, user, outcome, amount,
            _outcomePool[marketId][outcome],
            _totalPool[marketId]
        );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // RESOLUTION
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Resolve a market with the winning outcome.
    /// @dev    If the winning outcome pool is zero (no one bet on the winner),
    ///         the market auto-transitions to Cancelled so all stakers can
    ///         refund. No fee is taken in that case.
    ///         Otherwise: fee = totalPool * feeBps / BPS_DENOM is transferred
    ///         to feeRecipient immediately; resolvedNetPool is snapshotted.
    function resolveMarket(uint256 marketId, uint64 result)
        external
        validMarket(marketId)
        onlyRole(RESOLVER_ROLE)
    {
        _resolveMarketInternal(marketId, result);
    }

    function resolveMarketsBatch(uint256[] calldata marketIds, uint64[] calldata results)
        external
        onlyRole(RESOLVER_ROLE)
    {
        uint256 n = marketIds.length;
        if (n != results.length) revert ArrayLengthMismatch();
        for (uint256 i; i < n; ++i) {
            if (marketIds[i] >= marketCount) revert InvalidMarketId(marketIds[i]);
            _resolveMarketInternal(marketIds[i], results[i]);
        }
    }

    function _resolveMarketInternal(uint256 marketId, uint64 result) internal {
        MarketCore storage core = _marketCores[marketId];
        if (core.state != MarketState.Closed)
            revert InvalidMarketState(marketId, core.state, MarketState.Closed);

        _validateOutcome(marketId, result);

        uint256 total       = _totalPool[marketId];
        uint256 winningPool = _outcomePool[marketId][result];

        // Void market: no one bet on the winning side → cancel so all stakers refund.
        if (winningPool == 0) {
            core.state = MarketState.Cancelled;
            emit MarketStateChanged(marketId, MarketState.Closed, MarketState.Cancelled);
            emit MarketCancelled(marketId, "void: no winning bets");
            return;
        }

        // Normal resolution.
        uint256 fee     = (total * feeBps) / BPS_DENOM;
        uint256 netPool = total - fee;

        core.result          = result;
        core.resolvedAt      = uint40(block.timestamp);
        core.state           = MarketState.Resolved;
        core.resolvedNetPool = netPool;

        emit MarketStateChanged(marketId, MarketState.Closed, MarketState.Resolved);
        emit MarketResolved(marketId, result, total, fee, netPool);

        // CEI: state is written before the external call below.
        if (fee > 0) {
            if (feeRecipient == address(0)) revert FeeRecipientNotConfigured();
            usdcToken.safeTransfer(feeRecipient, fee);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CLAIM (WINNER)
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Claim the payout for a resolved market.
    /// @dev    Payout = userStake[winningOutcome] * resolvedNetPool / outcomePool[winningOutcome].
    ///         If the user has no stake on the winning outcome their call reverts.
    ///         A user who bet on both winning and losing outcomes receives payout
    ///         only for the winning-outcome stake; losing stakes are implicit losses
    ///         already included in the pool.
    function claim(uint256 marketId)
        external
        nonReentrant
        validMarket(marketId)
        inState(marketId, MarketState.Resolved)
        whenNotPaused
    {
        _processClaim(msg.sender, marketId);
    }

    /// @notice Claim payouts from multiple markets in a single tx.
    function claimBatch(uint256[] calldata marketIds)
        external
        nonReentrant
        whenNotPaused
    {
        uint256 n = marketIds.length;
        for (uint256 i; i < n; ++i) {
            uint256 mid = marketIds[i];
            if (mid >= marketCount) revert InvalidMarketId(mid);
            if (_marketCores[mid].state != MarketState.Resolved) continue; // skip non-resolved
            if (_claimed[mid][msg.sender]) continue;                        // skip already claimed
            _processClaim(msg.sender, mid);
        }
    }

    function _processClaim(address user, uint256 marketId) internal {
        if (_claimed[marketId][user]) revert AlreadyClaimed(marketId, user);

        MarketCore storage core = _marketCores[marketId];
        uint64 winningOutcome   = core.result;
        uint256 userWinStake    = _userStake[marketId][user][winningOutcome];

        if (userWinStake == 0) revert NothingToClaim(marketId, user);

        uint256 winningPool = _outcomePool[marketId][winningOutcome];
        uint256 netPool     = core.resolvedNetPool;

        // payout = userWinStake * netPool / winningPool
        // Multiplication before division to preserve precision.
        uint256 payout = (userWinStake * netPool) / winningPool;

        // CEI: flag before transfer.
        _claimed[marketId][user] = true;

        usdcToken.safeTransfer(user, payout);
        emit PositionClaimed(marketId, user, userWinStake, payout);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // REFUND (CANCELLED MARKET)
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Refund the full stake when a market is cancelled.
    /// @dev    Covers both admin cancellations and auto-void (no winning bets).
    ///         Returns _userTotalStake[marketId][user] — the sum of all stakes
    ///         across every outcome the user bet on.
    function claimRefund(uint256 marketId)
        external
        nonReentrant
        validMarket(marketId)
        inState(marketId, MarketState.Cancelled)
    {
        _processRefund(msg.sender, marketId);
    }

    /// @notice Batch refund from multiple cancelled markets.
    function claimRefundBatch(uint256[] calldata marketIds)
        external
        nonReentrant
    {
        uint256 n = marketIds.length;
        for (uint256 i; i < n; ++i) {
            uint256 mid = marketIds[i];
            if (mid >= marketCount) revert InvalidMarketId(mid);
            if (_marketCores[mid].state != MarketState.Cancelled) continue;
            if (_claimed[mid][msg.sender]) continue;
            _processRefund(msg.sender, mid);
        }
    }

    function _processRefund(address user, uint256 marketId) internal {
        if (_claimed[marketId][user]) revert AlreadyClaimed(marketId, user);

        uint256 refund = _userTotalStake[marketId][user];
        if (refund == 0) revert NothingToRefund(marketId, user);

        _claimed[marketId][user] = true;

        usdcToken.safeTransfer(user, refund);
        emit StakeRefunded(marketId, user, refund);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    function getMarketCore(uint256 marketId)
        external view validMarket(marketId) returns (MarketCore memory)
    { return _marketCores[marketId]; }

    function getTotalPool(uint256 marketId)
        external view validMarket(marketId) returns (uint256)
    { return _totalPool[marketId]; }

    function getOutcomePool(uint256 marketId, uint64 outcome)
        external view validMarket(marketId) returns (uint256)
    { return _outcomePool[marketId][outcome]; }

    function getUserStake(uint256 marketId, address user, uint64 outcome)
        external view validMarket(marketId) returns (uint256)
    { return _userStake[marketId][user][outcome]; }

    function getUserTotalStake(uint256 marketId, address user)
        external view validMarket(marketId) returns (uint256)
    { return _userTotalStake[marketId][user]; }

    function hasClaimed(uint256 marketId, address user)
        external view validMarket(marketId) returns (bool)
    { return _claimed[marketId][user]; }

    /// @notice Off-chain indicative implied probability for an outcome.
    ///         NOT a guaranteed payout — this changes as more stakes come in.
    ///         Returns 0 if totalPool == 0.
    function getImpliedProbabilityBps(uint256 marketId, uint64 outcome)
        external view validMarket(marketId) returns (uint256 bps)
    {
        uint256 total = _totalPool[marketId];
        if (total == 0) return 0;
        return (_outcomePool[marketId][outcome] * BPS_DENOM) / total;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // EMERGENCY
    // ═══════════════════════════════════════════════════════════════════════

    function emergencyPause() external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause()        external onlyRole(ADMIN_ROLE)  { _unpause(); }

    function _authorizeUpgrade(address) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    // ═══════════════════════════════════════════════════════════════════════
    // ABSTRACT (sport-specific)
    // ═══════════════════════════════════════════════════════════════════════

    /// @dev Children validate that `outcome` is a legal value for `marketId`.
    function _validateOutcome(uint256 marketId, uint64 outcome) internal view virtual;

    /// @dev Children create markets with sport-specific metadata.
    function addMarketWithLine(bytes32 marketType, int16 line) external virtual;

    function getMarketInfo(uint256 marketId) external view virtual returns (
        bytes32    marketType,
        MarketState state,
        uint64     result,
        uint256    totalPool,
        uint256    outcomeCount
    );
}
