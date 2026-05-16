// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Initializable}              from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {AccessControlUpgradeable}   from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {UUPSUpgradeable}            from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {PausableUpgradeable}        from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {IERC20}                     from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20}                  from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {MerkleProof}                from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

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
 * @notice On-chain leaderboard for pari-mutuel winners with epoch + merkle
 *         prize distribution.
 *
 * @dev Architecture overview
 * ──────────────────────────
 * Match contracts (`PariMatch{Football,Basketball}`) credit cumulative
 * payouts to each user via `recordWin(user, payout)`. The contract holds a
 * USDC balance fed by the 1%-of-pool leaderboard fee paid at every market
 * resolution.
 *
 * Prize distribution model: **epoch + merkle**.
 *
 *   1. `recordWin` is called by authorized matches (RECORDER_ROLE) on every
 *      claim; it bumps `score[user]`.
 *   2. The oracle (ORACLE_ROLE) periodically computes a ranking off-chain,
 *      builds a merkle tree of `(user, prizeAmount)` leaves where the top-N
 *      users by score share the epoch's prize pool, and submits the root by
 *      calling `closeEpoch(merkleRoot, claimDuration)`.
 *   3. The epoch's prize pool is snapshotted from `currentEpochPrizePool()`
 *      at close time. Users with non-zero leaves claim by submitting a
 *      merkle proof to `claim(epochId, prizeAmount, proof)`.
 *   4. After the epoch's claim window expires, any unclaimed funds roll over
 *      into the next epoch's pool automatically (no extra tx).
 *
 * Leaf format (OpenZeppelin standard, double-hashed to prevent
 * second-preimage attacks):
 *   leaf = keccak256(bytes.concat(keccak256(abi.encode(user, prizeAmount))))
 *
 * Trust model:
 *   - RECORDER_ROLE on this contract is held by authorized PariMatch
 *     proxies. Only they can move scores. They're granted by the factory at
 *     match-creation time.
 *   - ORACLE_ROLE submits the merkle root. This is a trusted off-chain
 *     ranker (typically the same backend that runs the resolver). The trust
 *     is bounded: it cannot mint USDC and the prize-pool size for a given
 *     epoch is snapshotted at close time, so the oracle can only choose how
 *     to distribute an already-funded pool — not steal funds outside it.
 *   - ADMIN_ROLE manages roles, upgrades, and emergency controls (pause,
 *     rotate USDC token if needed).
 *
 * Score model: cumulative gross USDC won (`payout` from each claim). Not
 * net profit. Simple, intuitive, cheap to maintain. The off-chain ranker can
 * compute any metric it wants from the score history (we just store the
 * monotonic cumulative sum).
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

    /// @notice Admin (role management, upgrades, pause, factory pointer).
    bytes32 public constant ADMIN_ROLE  = keccak256("ADMIN_ROLE");
    /// @notice Oracle that submits epoch merkle roots.
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    /// @notice Emergency pause.
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    /// @notice Hard upper bound on `claimDuration` per epoch (180 days).
    ///         Stops an oracle from posting a "forever-claim" epoch and
    ///         locking the pool indefinitely against rollover.
    uint256 public constant MAX_CLAIM_DURATION = 180 days;

    // ═══════════════════════════════════════════════════════════════════════
    // STRUCTS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice One epoch's distribution snapshot.
    /// @dev    Packed into 3 storage slots:
    ///         slot A — startTime(8) + closedAt(8) + claimExpiry(8) + closed(1) = 25 bytes
    ///         slot B — prizePool (32 bytes)
    ///         slot C — totalClaimed (32 bytes)
    ///         slot D — merkleRoot (32 bytes)
    ///         (a "stored" Epoch occupies 4 slots; struct packing groups A's
    ///         scalars into one slot.)
    struct Epoch {
        uint64  startTime;
        uint64  closedAt;
        uint64  claimExpiry;
        bool    closed;
        uint256 prizePool;
        uint256 totalClaimed;
        bytes32 merkleRoot;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STORAGE (upgrade-safe — do NOT reorder)
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice USDC token used to fund the leaderboard and pay prizes.
    IERC20 public usdcToken;                                              // slot 0

    /// @notice Monotonically increasing epoch index. Starts at 0 (current
    ///         epoch); incremented when `closeEpoch` is called.
    uint256 public epochIndex;                                            // slot 1

    /// @notice Cumulative USDC payouts credited to each user across all
    ///         claims on all match proxies that hold RECORDER_ROLE.
    mapping(address user => uint256 cumulativePayout) internal _score;    // slot 2

    /// @notice Epoch metadata keyed by epoch index.
    mapping(uint256 epochId => Epoch) internal _epochs;                   // slot 3

    /// @notice (epochId, user) → claimed flag. Prevents double-claim.
    mapping(uint256 epochId => mapping(address user => bool)) internal _claimed;  // slot 4

    /// @notice Sum of (Epoch.prizePool - Epoch.totalClaimed) over every
    ///         still-claimable closed epoch. Lets us compute the open
    ///         prize pool as `balanceOf(this) - _lockedInClosedEpochs`
    ///         without iterating all past epochs.
    uint256 internal _lockedInClosedEpochs;                               // slot 5

    /// @notice PariMatchFactory used to authorize `recordWin` callers.
    ///         A match address is accepted iff `matchFactory.isMatch(x)` is
    ///         true. Mirrors the same pattern `ChilizSwapRouter` uses to
    ///         validate match addresses, so the leaderboard stays in sync
    ///         with the factory's registry of deployed proxies.
    IPariMatchFactoryView public matchFactory;                            // slot 6

    /// Reserved storage gap (50 total slots).
    uint256[43] private __gap;

    // ═══════════════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════════════

    event Initialized(address indexed usdc, address indexed admin);

    /// @notice Cumulative score for `user` increased by `delta` after a claim
    ///         on `match_`. `newScore` is the post-increment total.
    event WinRecorded(address indexed match_, address indexed user, uint256 delta, uint256 newScore);

    /// @notice `epochId` closed with `merkleRoot`; the prize pool snapshot was
    ///         `prizePool` USDC and claims expire at `claimExpiry`.
    event EpochClosed(uint256 indexed epochId, bytes32 merkleRoot, uint256 prizePool, uint256 claimExpiry);

    /// @notice `user` claimed `amount` USDC from `epochId` against the merkle root.
    event PrizeClaimed(uint256 indexed epochId, address indexed user, uint256 amount);

    /// @notice Unclaimed funds from `epochId` (= `rolledOver`) released back into
    ///         the open prize pool because the claim window expired.
    event EpochRolledOver(uint256 indexed epochId, uint256 rolledOver);

    event USDCTokenSet(address indexed token);

    event MatchFactorySet(address indexed oldFactory, address indexed newFactory);

    // ═══════════════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════════════

    error ZeroAddress();
    error UnauthorizedMatch(address caller);
    error MatchFactoryNotSet();
    error InvalidClaimDuration(uint256 provided, uint256 max);
    error EpochAlreadyClosed(uint256 epochId);
    error EpochNotClosed(uint256 epochId);
    error EpochClaimWindowExpired(uint256 epochId, uint64 claimExpiry, uint256 nowTs);
    error EpochClaimWindowNotExpired(uint256 epochId, uint64 claimExpiry, uint256 nowTs);
    error AlreadyClaimed(uint256 epochId, address user);
    error InvalidMerkleProof();
    error PrizeAmountZero();
    error MerkleRootNotSet(uint256 epochId);
    error InsufficientContractBalance(uint256 needed, uint256 available);

    // ═══════════════════════════════════════════════════════════════════════
    // INITIALIZER
    // ═══════════════════════════════════════════════════════════════════════

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice One-shot initialization for the UUPS proxy.
    /// @param _usdc       USDC token used for prize distribution.
    /// @param _admin      Receives DEFAULT_ADMIN_ROLE + ADMIN_ROLE + PAUSER_ROLE.
    /// @param _oracle     Receives ORACLE_ROLE. May be the zero address; the
    ///                    admin can grant it later. Useful when the oracle
    ///                    address isn't known at deploy time.
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

    // ═══════════════════════════════════════════════════════════════════════
    // ADMIN
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Update the USDC token. Use rarely — the in-flight prize pool
    ///         was funded in the old token, so changing mid-stream silently
    ///         orphans those funds. Intended for upgrades / chain migrations
    ///         while the contract holds no balance.
    function setUSDCToken(address _usdc) external onlyRole(ADMIN_ROLE) {
        if (_usdc == address(0)) revert ZeroAddress();
        usdcToken = IERC20(_usdc);
        emit USDCTokenSet(_usdc);
    }

    /// @notice Register the PariMatchFactory used to authorize `recordWin`
    ///         callers. Required before any match can credit scores —
    ///         until set, `recordWin` will revert with `MatchFactoryNotSet`.
    ///
    ///         The leaderboard accepts `recordWin` from any address
    ///         `matchFactory.isMatch(addr)` says is one of its deployed
    ///         proxies. Replacing the factory pointer migrates auth to a
    ///         new registry — old matches lose authorization unless their
    ///         addresses also appear in the new factory's registry.
    function setMatchFactory(address _factory) external onlyRole(ADMIN_ROLE) {
        if (_factory == address(0)) revert ZeroAddress();
        address old = address(matchFactory);
        matchFactory = IPariMatchFactoryView(_factory);
        emit MatchFactorySet(old, _factory);
    }

    function emergencyPause() external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause()        external onlyRole(ADMIN_ROLE)  { _unpause(); }

    function _authorizeUpgrade(address) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    // ═══════════════════════════════════════════════════════════════════════
    // RECORDING WINS  (called by authorized match contracts)
    // ═══════════════════════════════════════════════════════════════════════

    /// @inheritdoc ILeaderboardRewards
    /// @dev Caller authorization: `matchFactory.isMatch(msg.sender)` must
    ///      return true. The factory registers every proxy it deploys, so
    ///      every legitimate PariMatch is automatically authorized — no
    ///      per-match role grant needed.
    ///
    ///      The match calls this from `_processClaim` AFTER paying the
    ///      user, wrapped in try/catch — so even if this function reverts
    ///      (e.g. paused, contract upgraded, ABI mismatch, factory not
    ///      configured), winners still receive their USDC.
    function recordWin(address user, uint256 payout)
        external
        override
        whenNotPaused
    {
        if (address(matchFactory) == address(0)) revert MatchFactoryNotSet();
        if (!matchFactory.isMatch(msg.sender)) revert UnauthorizedMatch(msg.sender);
        if (user == address(0)) revert ZeroAddress();
        if (payout == 0) return; // no-op, not an error

        uint256 newScore;
        unchecked {
            // Realistic payouts are bounded by total USDC supply; no overflow.
            newScore = _score[user] + payout;
        }
        _score[user] = newScore;

        emit WinRecorded(msg.sender, user, payout, newScore);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // EPOCH MANAGEMENT  (oracle)
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Close the current epoch and post the merkle root for prize
    ///         claims. The epoch's prize pool is snapshotted from the open
    ///         pool at close time. After `claimDuration` seconds, anyone may
    ///         call `rolloverEpoch(epochId)` to return unclaimed funds to
    ///         the open pool.
    ///
    /// @param merkleRoot     Root of `keccak256(bytes.concat(keccak256(abi.encode(user, amount))))`
    ///                       leaves over the top-N users by score.
    /// @param claimDuration  Seconds after closing during which winners may
    ///                       claim. Bounded by MAX_CLAIM_DURATION.
    function closeEpoch(bytes32 merkleRoot, uint256 claimDuration)
        external
        whenNotPaused
        onlyRole(ORACLE_ROLE)
        returns (uint256 closedId)
    {
        if (claimDuration > MAX_CLAIM_DURATION || claimDuration == 0) {
            revert InvalidClaimDuration(claimDuration, MAX_CLAIM_DURATION);
        }

        closedId = epochIndex;
        Epoch storage ep = _epochs[closedId];
        if (ep.closed) revert EpochAlreadyClosed(closedId);

        // Snapshot the open prize pool (whatever's funded minus what's locked
        // for not-yet-rolled-over closed epochs).
        uint256 pool = _openPrizePool();
        uint64  nowTs    = uint64(block.timestamp);
        uint64  expiry   = uint64(block.timestamp + claimDuration);

        // Set epoch start lazily — if it's the first close, startTime is 0
        // and we record nowTs so analytics have something to plot against.
        if (ep.startTime == 0) ep.startTime = nowTs;
        ep.closedAt     = nowTs;
        ep.claimExpiry  = expiry;
        ep.closed       = true;
        ep.merkleRoot   = merkleRoot;
        ep.prizePool    = pool;
        // ep.totalClaimed stays 0; mutated as claims come in.

        // Lock the snapshotted pool so a subsequent close doesn't re-allocate
        // the same USDC.
        unchecked { _lockedInClosedEpochs += pool; }

        // Roll forward.
        epochIndex = closedId + 1;
        _epochs[closedId + 1].startTime = nowTs;

        emit EpochClosed(closedId, merkleRoot, pool, expiry);
    }

    /// @notice Release the unclaimed remainder of an expired epoch back into
    ///         the open prize pool. Permissionless — anyone can call this
    ///         once the epoch's claim window has elapsed.
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

        // Move the unclaimed portion out of the "locked" bucket so the open
        // pool sees it again. The next close will snapshot it.
        unchecked {
            _lockedInClosedEpochs -= rolledOver;
            // Zero out so re-calling this is a no-op (rolledOver == 0).
            ep.totalClaimed = ep.prizePool;
        }

        emit EpochRolledOver(epochId, rolledOver);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CLAIM
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Claim `prizeAmount` USDC from `epochId` by proving the leaf
    ///         `keccak256(bytes.concat(keccak256(abi.encode(msg.sender, prizeAmount))))`
    ///         against the epoch's merkle root.
    function claim(uint256 epochId, uint256 prizeAmount, bytes32[] calldata proof)
        external
        nonReentrant
        whenNotPaused
    {
        if (prizeAmount == 0) revert PrizeAmountZero();

        Epoch storage ep = _epochs[epochId];
        if (!ep.closed) revert EpochNotClosed(epochId);
        if (ep.merkleRoot == bytes32(0)) revert MerkleRootNotSet(epochId);
        if (block.timestamp > ep.claimExpiry) {
            revert EpochClaimWindowExpired(epochId, ep.claimExpiry, block.timestamp);
        }
        if (_claimed[epochId][msg.sender]) revert AlreadyClaimed(epochId, msg.sender);

        bytes32 leaf = _leaf(msg.sender, prizeAmount);
        if (!MerkleProof.verify(proof, ep.merkleRoot, leaf)) revert InvalidMerkleProof();

        _claimed[epochId][msg.sender] = true;

        // Should never trip (we snapshotted the pool), but guard against
        // accidental config drift (e.g. admin yanking the USDC token).
        uint256 bal = usdcToken.balanceOf(address(this));
        if (bal < prizeAmount) revert InsufficientContractBalance(prizeAmount, bal);

        unchecked {
            ep.totalClaimed += prizeAmount;
            _lockedInClosedEpochs -= prizeAmount;
        }

        usdcToken.safeTransfer(msg.sender, prizeAmount);
        emit PrizeClaimed(epochId, msg.sender, prizeAmount);
    }

    /// @notice Leaf format: `keccak256(bytes.concat(keccak256(abi.encode(user, amount))))`.
    ///         Double-hashing follows the OpenZeppelin Merkle Tree library
    ///         convention and prevents second-preimage attacks where a
    ///         crafted intermediate node masquerades as a leaf.
    function _leaf(address user, uint256 amount) internal pure returns (bytes32) {
        return keccak256(bytes.concat(keccak256(abi.encode(user, amount))));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VIEWS
    // ═══════════════════════════════════════════════════════════════════════

    function score(address user) external view returns (uint256) {
        return _score[user];
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
    ///         = balance − amount locked by closed-but-not-yet-rolled epochs.
    function openPrizePool() external view returns (uint256) {
        return _openPrizePool();
    }

    function _openPrizePool() internal view returns (uint256) {
        uint256 bal = usdcToken.balanceOf(address(this));
        return bal > _lockedInClosedEpochs ? bal - _lockedInClosedEpochs : 0;
    }
}
