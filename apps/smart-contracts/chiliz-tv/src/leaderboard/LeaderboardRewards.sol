// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Initializable}              from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {AccessControlUpgradeable}   from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {UUPSUpgradeable}            from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {PausableUpgradeable}        from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {IERC20}                     from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20}                  from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {ILeaderboardRewards} from "../interfaces/ILeaderboardRewards.sol";

/// @dev Minimal slice of `PariMatchFactory.isMatch(address)` used by the
///      leaderboard to authorize `recordWin` calls. Living here as an inline
///      interface keeps the leaderboard contract independent of the rest of
///      the pari tree (no cyclic compile dependency).
interface IPariMatchFactoryView {
    function isMatch(address) external view returns (bool);
}

/**
 * @title LeaderboardRewards
 * @author ChilizTV Team
 * @notice Fully on-chain epoch-based leaderboard for pari-mutuel winners.
 *
 * @dev Architecture overview
 * ──────────────────────────
 * Match contracts (`PariMatch{Football,Basketball}`) credit per-epoch scores
 * via `recordWin(user, payout)`. The contract holds USDC funded by the
 * 1%-of-pool leaderboard fee taken at every market resolution.
 *
 * Distribution model: **pro-rata, per epoch**.
 *
 *   1. `recordWin` lazily advances the epoch if the current one's window has
 *      elapsed, then increments `_epochScores[currentEpoch][user]` and the
 *      epoch's running total `_epochTotalScore[currentEpoch]`.
 *   2. The first call past `epochStartTime + epochDuration` snapshots the
 *      open prize pool into `_epochs[closedId].prizePool`, flips the epoch
 *      to closed, opens a `epochDuration`-long claim window, and rolls
 *      `epochIndex` and `epochStartTime` forward by exactly one boundary.
 *      Anyone can also force-trigger this via the permissionless
 *      `advanceEpoch()` to keep the leaderboard live during quiet periods.
 *   3. `claim(epochId)` pays the caller their pro-rata share of the closed
 *      epoch's pool: `(epochScore[user] * prizePool) / totalScore`. No
 *      merkle proof — every scorer is implicitly entitled.
 *   4. After the claim window expires, any unclaimed remainder rolls back
 *      into the open prize pool via permissionless `rolloverEpoch(epochId)`.
 *
 * V2 upgrade notes
 * ────────────────
 * V1 used an off-chain ranker + merkle distribution. V2 deletes that path and
 * keeps everything on-chain. Storage layout is preserved: the legacy
 * cumulative `_score` mapping at slot 2 is left untouched (orphaned, harmless)
 * and the new state lives at slots 7–9 (slot 7 packs `epochStartTime` and
 * `epochDuration`; slots 8 and 9 hold the two new mappings). The
 * `Epoch.merkleRoot` field is also preserved (slot reservation) but never
 * written or read post-V2.
 *
 * Trust model
 * ────────────
 *   - Match proxies are authorized via `matchFactory.isMatch(msg.sender)` —
 *     identical to V1.
 *   - `ADMIN_ROLE` can rotate the epoch duration within sane bounds and
 *     manages the upgrade path. The duration change applies forward only;
 *     the current epoch's `epochStartTime` is not retroactively moved.
 *   - `ORACLE_ROLE` is preserved in the access-control table for backward
 *     compatibility (don't break `hasRole` callers) but no entry point uses
 *     it in V2.
 */
contract LeaderboardRewards is
    Initializable,
    AccessControlUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    ILeaderboardRewards
{
    using SafeERC20 for IERC20;

    // ═══════════════════════════════════════════════════════════════════════
    // CONSTANTS & ROLES
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Admin (role management, upgrades, pause, factory pointer,
    ///         epoch duration).
    bytes32 public constant ADMIN_ROLE  = keccak256("ADMIN_ROLE");
    /// @notice V1 role kept for backward compatibility. Unused in V2.
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    /// @notice Emergency pause.
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    /// @notice Default epoch duration applied at V2 init. Admin can rotate it.
    uint64 public constant DEFAULT_EPOCH_DURATION = 30 days;
    /// @notice Hard bounds on the admin-settable epoch duration.
    uint64 public constant MIN_EPOCH_DURATION = 1 days;
    uint64 public constant MAX_EPOCH_DURATION = 365 days;

    // ═══════════════════════════════════════════════════════════════════════
    // STRUCTS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice One epoch's distribution snapshot.
    /// @dev    V1 layout preserved; `merkleRoot` is dead storage in V2 but
    ///         kept so existing entries (currently none on mainnet/testnet)
    ///         stay readable.
    struct Epoch {
        uint64  startTime;
        uint64  closedAt;
        uint64  claimExpiry;
        bool    closed;
        uint256 prizePool;
        uint256 totalClaimed;
        bytes32 merkleRoot;   // V2: unused
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STORAGE (upgrade-safe — do NOT reorder)
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice USDC token used to fund the leaderboard and pay prizes.
    IERC20 public usdcToken;                                              // slot 0

    /// @notice Monotonically increasing epoch index. Starts at 0;
    ///         incremented when the active epoch's boundary passes.
    uint256 public epochIndex;                                            // slot 1

    /// @notice V1 cumulative score mapping. Orphaned in V2; left in place
    ///         so slot 2 keeps its meaning for any future reader.
    mapping(address user => uint256 cumulativePayout) internal _score;    // slot 2

    /// @notice Epoch metadata keyed by epoch index.
    mapping(uint256 epochId => Epoch) internal _epochs;                   // slot 3

    /// @notice (epochId, user) → claimed flag. Prevents double-claim.
    mapping(uint256 epochId => mapping(address user => bool)) internal _claimed; // slot 4

    /// @notice Sum of (Epoch.prizePool - Epoch.totalClaimed) over every
    ///         still-claimable closed epoch. Lets us compute the open
    ///         prize pool as `balanceOf(this) - _lockedInClosedEpochs`
    ///         without iterating all past epochs.
    uint256 internal _lockedInClosedEpochs;                               // slot 5

    /// @notice PariMatchFactory used to authorize `recordWin` callers.
    IPariMatchFactoryView public matchFactory;                            // slot 6

    // ─── V2 additions (appended; layout-safe) ──────────────────────────────

    /// @notice Start time of the currently-open epoch (`_epochs[epochIndex]`).
    ///         Set at V2 init and rolled forward by `_maybeAdvanceEpoch`.
    uint64 public epochStartTime;                                         // slot 7

    /// @notice Current epoch duration. Admin-settable in `[MIN, MAX]`.
    uint64 public epochDuration;                                          // slot 7 (packed with epochStartTime)

    /// @notice Per-epoch user score: `_epochScores[epochId][user]`.
    mapping(uint256 epochId => mapping(address user => uint256 score)) internal _epochScores; // slot 8

    /// @notice Sum of `_epochScores[epochId][*]` for each epoch. Updated on
    ///         every `recordWin` and read by `claim` for the pro-rata math.
    mapping(uint256 epochId => uint256 totalScore) internal _epochTotalScore; // slot 9

    /// Reserved storage gap. V1 reserved [43]; V2 consumes 3 new slots
    /// (slot 7 packs epochStartTime + epochDuration; slots 8 and 9 hold the
    /// two new mappings), leaving 40 slots = 43 - 3.
    uint256[40] private __gap;

    // ═══════════════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════════════

    event Initialized(address indexed usdc, address indexed admin);

    /// @notice Per-epoch score for `user` in `epochId` increased by `delta`.
    ///         `newEpochScore` is the post-increment total *for that epoch
    ///         only* — V2 scores do not carry over across epoch boundaries.
    event WinRecorded(
        address indexed match_,
        address indexed user,
        uint256 indexed epochId,
        uint256 delta,
        uint256 newEpochScore
    );

    /// @notice The contract advanced past an epoch boundary. `closedId` is
    ///         now claimable; `prizePool` is its snapshot; `totalScore` is
    ///         the sum of scorers' weights for pro-rata claims.
    event EpochAdvanced(
        uint256 indexed closedId,
        uint256 prizePool,
        uint256 totalScore,
        uint64  closedAt,
        uint64  claimExpiry
    );

    /// @notice `user` claimed `amount` USDC from `epochId`.
    event PrizeClaimed(uint256 indexed epochId, address indexed user, uint256 amount);

    /// @notice Unclaimed funds from `epochId` (= `rolledOver`) released back
    ///         into the open prize pool because the claim window expired.
    event EpochRolledOver(uint256 indexed epochId, uint256 rolledOver);

    event USDCTokenSet(address indexed token);
    event MatchFactorySet(address indexed oldFactory, address indexed newFactory);
    event EpochDurationSet(uint64 oldDuration, uint64 newDuration);

    // ═══════════════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════════════

    error ZeroAddress();
    error UnauthorizedMatch(address caller);
    error MatchFactoryNotSet();
    error InvalidEpochDuration(uint64 provided, uint64 min, uint64 max);
    error EpochNotClosed(uint256 epochId);
    error EpochClaimWindowExpired(uint256 epochId, uint64 claimExpiry, uint256 nowTs);
    error EpochClaimWindowNotExpired(uint256 epochId, uint64 claimExpiry, uint256 nowTs);
    error AlreadyClaimed(uint256 epochId, address user);
    error NothingToClaim(uint256 epochId, address user);
    error AdvanceNotReady(uint256 nowTs, uint256 boundary);
    error InsufficientContractBalance(uint256 needed, uint256 available);

    // ═══════════════════════════════════════════════════════════════════════
    // INITIALIZER
    // ═══════════════════════════════════════════════════════════════════════

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice One-shot V1 initialization for the UUPS proxy. Always runs at
    ///         proxy construction time — V2 builds on top of it by calling
    ///         `initializeV2()` afterwards. The V1 marker (set by the
    ///         `initializer` modifier) is a prerequisite for the V2
    ///         `reinitializer(2)` to advance.
    function initialize(address _usdc, address _admin, address _oracle) external initializer {
        if (_usdc == address(0))  revert ZeroAddress();
        if (_admin == address(0)) revert ZeroAddress();

        __AccessControl_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        __Pausable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE,         _admin);
        _grantRole(PAUSER_ROLE,        _admin);
        if (_oracle != address(0)) {
            _grantRole(ORACLE_ROLE, _oracle);
        }

        usdcToken = IERC20(_usdc);

        emit Initialized(_usdc, _admin);
    }

    /// @notice V2 initializer. Run once per proxy via one of two paths:
    ///         (a) on an existing V1 proxy, atomically through the upgrade
    ///         script's `upgradeToAndCall(newImpl, initializeV2())`; (b) on a
    ///         fresh proxy, immediately after construction in
    ///         `DeployAll._deployLeaderboard()`. The `reinitializer(2)` guard
    ///         is idempotent across re-upgrades.
    /// @dev    Anchors the epoch clock at the call timestamp and sets the
    ///         default 30-day duration. Doesn't touch any V1 state, so
    ///         existing `_score` entries (if any) remain readable but
    ///         unreferenced by V2 logic.
    function initializeV2() external reinitializer(2) {
        epochStartTime = uint64(block.timestamp);
        epochDuration  = DEFAULT_EPOCH_DURATION;
        _epochs[epochIndex].startTime = uint64(block.timestamp);
        emit EpochDurationSet(0, DEFAULT_EPOCH_DURATION);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ADMIN
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Update the USDC token. Same caveats as V1 — only safe when
    ///         the contract holds no balance.
    function setUSDCToken(address _usdc) external onlyRole(ADMIN_ROLE) {
        if (_usdc == address(0)) revert ZeroAddress();
        usdcToken = IERC20(_usdc);
        emit USDCTokenSet(_usdc);
    }

    /// @notice Register the PariMatchFactory used to authorize `recordWin`
    ///         callers. Required before any match can credit scores.
    function setMatchFactory(address _factory) external onlyRole(ADMIN_ROLE) {
        if (_factory == address(0)) revert ZeroAddress();
        address old = address(matchFactory);
        matchFactory = IPariMatchFactoryView(_factory);
        emit MatchFactorySet(old, _factory);
    }

    /// @notice Rotate the epoch duration. Applies to the current and future
    ///         epochs — does NOT retroactively shift `epochStartTime`, so a
    ///         shorter setting can immediately put the boundary in the past
    ///         and trigger an advance on the next interaction.
    function setEpochDuration(uint64 newDuration) external onlyRole(ADMIN_ROLE) {
        if (newDuration < MIN_EPOCH_DURATION || newDuration > MAX_EPOCH_DURATION) {
            revert InvalidEpochDuration(newDuration, MIN_EPOCH_DURATION, MAX_EPOCH_DURATION);
        }
        uint64 old = epochDuration;
        epochDuration = newDuration;
        emit EpochDurationSet(old, newDuration);
    }

    function emergencyPause() external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause()        external onlyRole(ADMIN_ROLE)  { _unpause(); }

    function _authorizeUpgrade(address) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    // ═══════════════════════════════════════════════════════════════════════
    // RECORDING WINS  (called by authorized match contracts)
    // ═══════════════════════════════════════════════════════════════════════

    /// @inheritdoc ILeaderboardRewards
    /// @dev Lazily advances the epoch first, then credits the score to
    ///      whatever epoch is now current. Wrapped in try/catch on the
    ///      match side, so a revert here cannot block winner payouts.
    function recordWin(address user, uint256 payout)
        external
        override
        whenNotPaused
    {
        if (address(matchFactory) == address(0)) revert MatchFactoryNotSet();
        if (!matchFactory.isMatch(msg.sender)) revert UnauthorizedMatch(msg.sender);
        if (user == address(0)) revert ZeroAddress();
        if (payout == 0) return; // no-op, not an error

        _maybeAdvanceEpoch();

        uint256 epId = epochIndex;
        uint256 newScore;
        unchecked {
            // Realistic payouts are bounded by total USDC supply; no overflow.
            newScore = _epochScores[epId][user] + payout;
            _epochTotalScore[epId] += payout;
        }
        _epochScores[epId][user] = newScore;

        emit WinRecorded(msg.sender, user, epId, payout, newScore);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // EPOCH ADVANCE
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Permissionless catch-up trigger. Advances the current epoch
    ///         to the next one if its boundary has elapsed. Reverts if the
    ///         boundary hasn't passed yet (so callers can detect a no-op).
    function advanceEpoch() external whenNotPaused returns (uint256 closedId) {
        uint256 boundary = uint256(epochStartTime) + uint256(epochDuration);
        if (block.timestamp < boundary) revert AdvanceNotReady(block.timestamp, boundary);
        closedId = epochIndex;
        _maybeAdvanceEpoch();
        // If `_maybeAdvanceEpoch` was a no-op (race / paused / already
        // advanced this block), epochIndex didn't move; treat as no-op too.
        if (epochIndex == closedId) revert AdvanceNotReady(block.timestamp, boundary);
    }

    /// @notice Advance one epoch boundary if elapsed. Internal so it can be
    ///         called inline from `recordWin` without a re-entrancy surface.
    /// @dev    Single-step on purpose: if many epochs have elapsed the caller
    ///         pays gas for one advance and `advanceEpoch()` can be called
    ///         multiple times to catch up.
    function _maybeAdvanceEpoch() internal {
        uint256 boundary = uint256(epochStartTime) + uint256(epochDuration);
        if (block.timestamp < boundary) return;

        uint256 closedId = epochIndex;
        Epoch storage ep = _epochs[closedId];
        if (ep.closed) return; // already closed; shouldn't happen with single-step but defensive

        uint64 closedAt    = uint64(boundary);              // align close to the boundary, not the actual call
        uint64 claimExpiry = uint64(boundary + epochDuration);
        uint256 pool       = _openPrizePool();
        uint256 totalScore = _epochTotalScore[closedId];

        ep.closed       = true;
        ep.closedAt     = closedAt;
        ep.claimExpiry  = claimExpiry;
        ep.prizePool    = pool;

        unchecked {
            _lockedInClosedEpochs += pool;
        }

        // Roll forward.
        uint256 nextId = closedId + 1;
        epochIndex      = nextId;
        epochStartTime  = uint64(boundary);
        _epochs[nextId].startTime = uint64(boundary);

        emit EpochAdvanced(closedId, pool, totalScore, closedAt, claimExpiry);
    }

    /// @notice Release the unclaimed remainder of an expired epoch back into
    ///         the open prize pool. Permissionless once the claim window has
    ///         elapsed.
    function rolloverEpoch(uint256 epochId)
        external
        whenNotPaused
        returns (uint256 rolledOver)
    {
        Epoch storage ep = _epochs[epochId];
        if (!ep.closed) revert EpochNotClosed(epochId);
        if (block.timestamp <= ep.claimExpiry) {
            revert EpochClaimWindowNotExpired(epochId, ep.claimExpiry, block.timestamp);
        }

        rolledOver = ep.prizePool - ep.totalClaimed;
        if (rolledOver == 0) return 0;

        unchecked {
            _lockedInClosedEpochs -= rolledOver;
            // Zero out so re-calling this is a no-op.
            ep.totalClaimed = ep.prizePool;
        }

        emit EpochRolledOver(epochId, rolledOver);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CLAIM (pro-rata, fully on-chain)
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Claim the caller's pro-rata share of `epochId`'s prize pool.
    ///         Amount = `epochScore[user] * prizePool / totalScore`.
    function claim(uint256 epochId)
        external
        nonReentrant
        whenNotPaused
        returns (uint256 amount)
    {
        Epoch storage ep = _epochs[epochId];
        if (!ep.closed) revert EpochNotClosed(epochId);
        if (block.timestamp > ep.claimExpiry) {
            revert EpochClaimWindowExpired(epochId, ep.claimExpiry, block.timestamp);
        }
        if (_claimed[epochId][msg.sender]) revert AlreadyClaimed(epochId, msg.sender);

        uint256 userScore = _epochScores[epochId][msg.sender];
        uint256 totalScore = _epochTotalScore[epochId];
        amount = (userScore == 0 || totalScore == 0)
            ? 0
            : (userScore * ep.prizePool) / totalScore;
        if (amount == 0) revert NothingToClaim(epochId, msg.sender);

        // Should never trip — pool was snapshotted at close — but guard
        // against config drift (e.g. admin yanking the USDC token).
        uint256 bal = usdcToken.balanceOf(address(this));
        if (bal < amount) revert InsufficientContractBalance(amount, bal);

        _claimed[epochId][msg.sender] = true;
        unchecked {
            ep.totalClaimed += amount;
            _lockedInClosedEpochs -= amount;
        }

        usdcToken.safeTransfer(msg.sender, amount);
        emit PrizeClaimed(epochId, msg.sender, amount);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VIEWS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Index of the currently-open epoch.
    function currentEpoch() external view returns (uint256) {
        return epochIndex;
    }

    /// @notice Per-epoch score for `user`.
    function epochScore(uint256 epochId, address user) external view returns (uint256) {
        return _epochScores[epochId][user];
    }

    /// @notice Sum of scores for `epochId`. For the open epoch this is the
    ///         live running total; for a closed epoch it's frozen.
    function epochTotalScore(uint256 epochId) external view returns (uint256) {
        return _epochTotalScore[epochId];
    }

    /// @notice Preview of what `claim(epochId)` would pay `user`. Returns 0
    ///         for the open epoch, already-claimed entries, expired windows,
    ///         and zero-score callers.
    function pendingClaim(uint256 epochId, address user) external view returns (uint256) {
        Epoch storage ep = _epochs[epochId];
        if (!ep.closed) return 0;
        if (block.timestamp > ep.claimExpiry) return 0;
        if (_claimed[epochId][user]) return 0;
        uint256 userScore  = _epochScores[epochId][user];
        uint256 totalScore = _epochTotalScore[epochId];
        if (userScore == 0 || totalScore == 0) return 0;
        return (userScore * ep.prizePool) / totalScore;
    }

    function epoch(uint256 epochId) external view returns (Epoch memory) {
        return _epochs[epochId];
    }

    function hasClaimed(uint256 epochId, address user) external view returns (bool) {
        return _claimed[epochId][user];
    }

    function lockedInClosedEpochs() external view returns (uint256) {
        return _lockedInClosedEpochs;
    }

    /// @notice USDC currently funding the (not-yet-snapshotted) next epoch's pool.
    function openPrizePool() external view returns (uint256) {
        return _openPrizePool();
    }

    function _openPrizePool() internal view returns (uint256) {
        uint256 bal = usdcToken.balanceOf(address(this));
        return bal > _lockedInClosedEpochs ? bal - _lockedInClosedEpochs : 0;
    }
}
