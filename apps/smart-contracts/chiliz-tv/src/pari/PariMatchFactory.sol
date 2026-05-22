// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Ownable}      from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import {PariMatchBase}       from "./PariMatchBase.sol";
import {FootballPariMatch}   from "./FootballPariMatch.sol";
import {BasketballPariMatch} from "./BasketballPariMatch.sol";

/**
 * @title PariMatchFactory
 * @author ChilizTV Team
 * @notice Factory for deploying UUPS-upgradeable pari-mutuel match proxies.
 *
 * @dev Simpler than the previous BettingMatchFactory — no LP pool wiring.
 *      Each proxy is initialized with:
 *        - The intended owner (who gets all admin roles).
 *        - The oracle address (who gets RESOLVER_ROLE).
 *        - USDC and fee-recipient set via the factory's config.
 *        - SWAP_ROUTER_ROLE granted to the configured swap router.
 *
 *      The factory itself holds no permanent roles on deployed proxies —
 *      it renounces all roles in the same transaction.
 *
 *      isMatch(address) provides the router with a factory-registry check
 *      before forwarding USDC, preventing fund loss to arbitrary addresses.
 */
contract PariMatchFactory is Ownable {

    // ═══════════════════════════════════════════════════════════════════════
    // TYPES
    // ═══════════════════════════════════════════════════════════════════════

    enum SportType { FOOTBALL, BASKETBALL }

    uint8 public constant FOOTBALL   = uint8(SportType.FOOTBALL);
    uint8 public constant BASKETBALL = uint8(SportType.BASKETBALL);

    // ═══════════════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════════════

    address[] public allMatches;
    mapping(address => SportType) public matchSportType;
    mapping(address => bool)      public isMatch;

    /// @notice FootballPariMatch implementation for new proxies.
    address public footballImplementation;

    /// @notice BasketballPariMatch implementation for new proxies.
    address public basketballImplementation;

    // ─── Wiring config ─────────────────────────────────────────────────────

    /// @notice USDC token address passed to every new match.
    address public usdcToken;

    /// @notice Platform fee recipient passed to every new match.
    address public feeRecipient;

    /// @notice Swap router granted SWAP_ROUTER_ROLE on every new match.
    address public swapRouter;

    /// @notice LeaderboardRewards proxy wired into every new match as the
    ///         recipient of the leaderboard-fee split + the sink for
    ///         `recordWin` notifications on claims. May be `address(0)` —
    ///         legacy / no-leaderboard mode, all fees go to `feeRecipient`.
    address public leaderboardRewards;

    /// @notice Leaderboard's share of the total fee, in basis points OF THE
    ///         POOL. Default 100 (1%). The factory writes this into every
    ///         new match alongside `leaderboardRewards`.
    uint16 public leaderboardFeeBps;

    // ═══════════════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════════════

    event MatchCreated(address indexed proxy, SportType sportType, address indexed owner);
    event FootballImplementationUpdated(address indexed oldImpl, address indexed newImpl);
    event BasketballImplementationUpdated(address indexed oldImpl, address indexed newImpl);
    event WiringSet(address indexed usdcToken, address indexed feeRecipient, address indexed swapRouter);
    event LeaderboardWiringSet(address indexed leaderboard, uint16 leaderboardFeeBps);

    // ═══════════════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════════════

    error MatchNotFound(address matchAddress);
    error InvalidAddress();
    error WiringNotConfigured();

    // ═══════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════════════

    constructor() Ownable(msg.sender) {
        footballImplementation   = address(new FootballPariMatch());
        basketballImplementation = address(new BasketballPariMatch());
        // Default to 1% of pool to the leaderboard (matches the 1% / 1%
        // distribution baseline). Owner can override via setLeaderboardWiring.
        leaderboardFeeBps = 100;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // WIRING CONFIG
    // ═══════════════════════════════════════════════════════════════════════

    function setWiring(address _usdcToken, address _feeRecipient, address _swapRouter)
        external
        onlyOwner
    {
        if (_usdcToken == address(0) || _feeRecipient == address(0) || _swapRouter == address(0))
            revert InvalidAddress();
        usdcToken    = _usdcToken;
        feeRecipient = _feeRecipient;
        swapRouter   = _swapRouter;
        emit WiringSet(_usdcToken, _feeRecipient, _swapRouter);
    }

    /// @notice Configure (or update) the leaderboard split applied to every
    ///         FUTURE match the factory creates. Existing matches are left
    ///         untouched — they keep whatever leaderboard recipient / bps
    ///         they were initialized with.
    /// @param _leaderboard Address of the LeaderboardRewards proxy. Pass
    ///                     `address(0)` to disable the leaderboard split
    ///                     for new matches.
    /// @param _bps         Leaderboard's share of the pool, in basis points.
    ///                     Must be <= the match's total `feeBps` (200 by
    ///                     default → max 200; checked by the match setter).
    function setLeaderboardWiring(address _leaderboard, uint16 _bps) external onlyOwner {
        leaderboardRewards = _leaderboard;
        leaderboardFeeBps  = _bps;
        emit LeaderboardWiringSet(_leaderboard, _bps);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MATCH DEPLOYMENT
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Deploy, initialize, and fully wire a FootballPariMatch proxy.
    /// @param _matchName Human-readable name (e.g. "Barcelona vs Real Madrid").
    /// @param _owner     Receives all admin roles + Ownable ownership.
    /// @param _oracle    Receives RESOLVER_ROLE (result-setting key).
    /// @return proxy     Address of the ready-to-use match proxy.
    function createFootballMatch(
        string calldata _matchName,
        address _owner,
        address _oracle
    ) external onlyOwner returns (address proxy) {
        _requireWiring();
        if (_owner == address(0) || _oracle == address(0)) revert InvalidAddress();

        bytes memory initData = abi.encodeWithSelector(
            FootballPariMatch.initialize.selector,
            _matchName,
            address(this)   // factory is temp admin
        );
        proxy = address(new ERC1967Proxy(footballImplementation, initData));
        allMatches.push(proxy);
        isMatch[proxy]        = true;
        matchSportType[proxy] = SportType.FOOTBALL;

        _wireMatch(proxy, _owner, _oracle);
        emit MatchCreated(proxy, SportType.FOOTBALL, _owner);
    }

    /// @notice Deploy, initialize, and fully wire a BasketballPariMatch proxy.
    function createBasketballMatch(
        string calldata _matchName,
        address _owner,
        address _oracle
    ) external onlyOwner returns (address proxy) {
        _requireWiring();
        if (_owner == address(0) || _oracle == address(0)) revert InvalidAddress();

        bytes memory initData = abi.encodeWithSelector(
            BasketballPariMatch.initialize.selector,
            _matchName,
            address(this)
        );
        proxy = address(new ERC1967Proxy(basketballImplementation, initData));
        allMatches.push(proxy);
        isMatch[proxy]        = true;
        matchSportType[proxy] = SportType.BASKETBALL;

        _wireMatch(proxy, _owner, _oracle);
        emit MatchCreated(proxy, SportType.BASKETBALL, _owner);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // IMPLEMENTATION MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    function setFootballImplementation(address newImpl) external onlyOwner {
        if (newImpl == address(0)) revert InvalidAddress();
        address old = footballImplementation;
        footballImplementation = newImpl;
        emit FootballImplementationUpdated(old, newImpl);
    }

    function setBasketballImplementation(address newImpl) external onlyOwner {
        if (newImpl == address(0)) revert InvalidAddress();
        address old = basketballImplementation;
        basketballImplementation = newImpl;
        emit BasketballImplementationUpdated(old, newImpl);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VIEW
    // ═══════════════════════════════════════════════════════════════════════

    function getAllMatches() external view returns (address[] memory) {
        return allMatches;
    }

    function getSportType(address matchAddress) external view returns (SportType) {
        if (!isMatch[matchAddress]) revert MatchNotFound(matchAddress);
        return matchSportType[matchAddress];
    }

    function implementations(uint8 sport) external view returns (address) {
        if (sport == FOOTBALL)   return footballImplementation;
        if (sport == BASKETBALL) return basketballImplementation;
        revert InvalidAddress();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // INTERNAL
    // ═══════════════════════════════════════════════════════════════════════

    function _requireWiring() internal view {
        if (usdcToken == address(0) || feeRecipient == address(0) || swapRouter == address(0))
            revert WiringNotConfigured();
    }

    /// @dev Full wiring sequence while the factory is the temporary admin.
    ///      After this function the factory holds NO role on the proxy.
    function _wireMatch(address proxy, address _owner, address _oracle) internal {
        PariMatchBase m = PariMatchBase(payable(proxy));

        // 1) Configure token + fee recipient (ADMIN_ROLE-gated).
        m.setUSDCToken(usdcToken);
        m.setFeeRecipient(feeRecipient);

        // 1b) Leaderboard split (optional; both must be set or both zero).
        //     The match enforces leaderboardFeeBps <= feeBps; the factory's
        //     leaderboardFeeBps must therefore be <= the match's MAX_FEE_BPS.
        //     Recipient may be `address(0)` to opt out — then we leave the
        //     match's leaderboard fields at their zero defaults.
        if (leaderboardRewards != address(0)) {
            m.setLeaderboardRecipient(leaderboardRewards);
            m.setLeaderboardFeeBps(leaderboardFeeBps);
        }

        // 2) Grant operational roles (DEFAULT_ADMIN_ROLE-gated).
        m.grantRole(m.SWAP_ROUTER_ROLE(), swapRouter);
        m.grantRole(m.RESOLVER_ROLE(),    _oracle);

        // 3) Transfer ownership and all admin roles to the intended owner.
        m.grantRole(m.DEFAULT_ADMIN_ROLE(), _owner);
        m.grantRole(m.ADMIN_ROLE(),         _owner);
        m.grantRole(m.PAUSER_ROLE(),        _owner);
        m.transferOwnership(_owner);

        // 4) Renounce every factory role. DEFAULT_ADMIN last.
        m.renounceRole(m.ADMIN_ROLE(),         address(this));
        m.renounceRole(m.PAUSER_ROLE(),        address(this));
        m.renounceRole(m.DEFAULT_ADMIN_ROLE(), address(this));
    }
}
