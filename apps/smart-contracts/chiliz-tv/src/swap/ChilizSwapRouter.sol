// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard}      from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable}              from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20}               from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20}            from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IKayenMasterRouterV2} from "../interfaces/IKayenMasterRouterV2.sol";
import {IKayenRouter}         from "../interfaces/IKayenRouter.sol";
import {PariMatchBase}        from "../pari/PariMatchBase.sol";
import {PariMatchFactory}     from "../pari/PariMatchFactory.sol";
import {StreamWallet}         from "../streamer/StreamWallet.sol";
import {StreamWalletFactory}  from "../streamer/StreamWalletFactory.sol";

/**
 * @title ChilizSwapRouter
 * @author ChilizTV
 * @notice Unified swap router for the ChilizTV platform (pari-mutuel edition).
 *
 * @dev Handles token-to-USDC swaps for both the pari-mutuel betting module
 *      and the streaming module (donations / subscriptions). No LP vault
 *      involved — USDC flows directly into the match contract (the escrow)
 *      on the betting path, and directly to streamers on the streaming path.
 *
 * Supported Payment Paths (all settle in USDC):
 * ══════════════════════════════════════════════════════════════════════════
 * BETTING (pari-mutuel):
 *   CHZ  (native) -> USDC -> PariMatch.placeBetUSDCFor  (placeBetWithCHZ)
 *   ERC20         -> USDC -> PariMatch.placeBetUSDCFor  (placeBetWithToken)
 *   USDC direct   ->         PariMatch.placeBetUSDCFor  (placeBetWithUSDC)
 *
 * STREAMING (donations & subscriptions):
 *   CHZ  (native) -> USDC -> fee split -> streamer / treasury
 *   ERC20         -> USDC -> fee split -> streamer / treasury
 *   USDC direct   ->         fee split -> streamer / treasury
 *
 * Security notes:
 *   - This contract requires SWAP_ROUTER_ROLE on each target PariMatch proxy.
 *   - USDC is forwarded immediately; this contract never holds USDC at rest.
 *   - bettingMatchFactory (PariMatchFactory) validates every match address
 *     before USDC is forwarded, preventing loss to arbitrary addresses.
 *   - Reentrancy protected via OpenZeppelin ReentrancyGuard.
 *   - SafeERC20 used for all token transfers.
 *   - Strict deadline + slippage validation on every swap.
 */
contract ChilizSwapRouter is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // ══════════════════════════════════════════════════════════════════════════
    // IMMUTABLES
    // ══════════════════════════════════════════════════════════════════════════

    IKayenMasterRouterV2 public immutable masterRouter;
    IKayenRouter         public immutable tokenRouter;
    IERC20               public immutable usdc;
    address              public immutable wchz;

    // ══════════════════════════════════════════════════════════════════════════
    // MUTABLE STATE
    // ══════════════════════════════════════════════════════════════════════════

    /// @notice Platform treasury for streaming fee collection.
    address public treasury;

    /// @notice Platform fee in basis points for streaming (e.g. 500 = 5%).
    uint16 public platformFeeBps;

    /// @notice StreamWalletFactory for wallet lookup/creation.
    StreamWalletFactory public streamWalletFactory;

    /// @notice PariMatchFactory — validates that bettingMatch addresses are legitimate
    ///         before any USDC is forwarded. Must be set before any placeBetWith* call.
    PariMatchFactory public bettingMatchFactory;

    // ══════════════════════════════════════════════════════════════════════════
    // EVENTS — BETTING
    // ══════════════════════════════════════════════════════════════════════════

    event BetPlacedViaCHZ(
        address indexed bettingMatch,
        address indexed user,
        uint256 chzSpent,
        uint256 usdcReceived,
        uint256 marketId,
        uint64  outcome
    );

    event BetPlacedViaToken(
        address indexed bettingMatch,
        address indexed user,
        address indexed token,
        uint256 tokenSpent,
        uint256 usdcReceived,
        uint256 marketId,
        uint64  outcome
    );

    event BetPlacedWithUSDC(
        address indexed bettingMatch,
        address indexed user,
        uint256 amount,
        uint256 marketId,
        uint64  outcome
    );

    // ══════════════════════════════════════════════════════════════════════════
    // EVENTS — STREAMING DONATIONS
    // ══════════════════════════════════════════════════════════════════════════

    event DonationWithCHZ(
        address indexed donor,
        address indexed streamer,
        uint256 chzSpent,
        uint256 usdcDonated,
        uint256 platformFee,
        string  message
    );

    event DonationWithToken(
        address indexed donor,
        address indexed streamer,
        address indexed token,
        uint256 tokenSpent,
        uint256 usdcDonated,
        uint256 platformFee,
        string  message
    );

    event DonationWithUSDCEvent(
        address indexed donor,
        address indexed streamer,
        uint256 amount,
        uint256 platformFee,
        string  message
    );

    // ══════════════════════════════════════════════════════════════════════════
    // EVENTS — STREAMING SUBSCRIPTIONS
    // ══════════════════════════════════════════════════════════════════════════

    event SubscriptionWithCHZ(
        address indexed subscriber,
        address indexed streamer,
        uint256 chzSpent,
        uint256 usdcPaid,
        uint256 platformFee,
        uint256 duration
    );

    event SubscriptionWithToken(
        address indexed subscriber,
        address indexed streamer,
        address indexed token,
        uint256 tokenSpent,
        uint256 usdcPaid,
        uint256 platformFee,
        uint256 duration
    );

    event SubscriptionWithUSDCEvent(
        address indexed subscriber,
        address indexed streamer,
        uint256 amount,
        uint256 platformFee,
        uint256 duration
    );

    // ══════════════════════════════════════════════════════════════════════════
    // EVENTS — ADMIN
    // ══════════════════════════════════════════════════════════════════════════

    event TreasurySet(address indexed oldTreasury, address indexed newTreasury);
    event PlatformFeeBpsSet(uint16 oldFeeBps, uint16 newFeeBps);
    event MatchFactorySet(address indexed oldFactory, address indexed newFactory);
    event StreamWalletFactorySet(address indexed oldFactory, address indexed newFactory);

    // ══════════════════════════════════════════════════════════════════════════
    // ERRORS
    // ══════════════════════════════════════════════════════════════════════════

    error ZeroAddress();
    error ZeroValue();
    error DeadlinePassed();
    error InvalidFeeBps();
    error TokenIsUSDC();
    error UnauthorizedBettingMatch(address bettingMatch);
    error BettingMatchFactoryNotSet();
    error RouterNotConfiguredOnFactory();

    // ══════════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ══════════════════════════════════════════════════════════════════════════

    constructor(
        address _masterRouter,
        address _tokenRouter,
        address _usdc,
        address _wchz,
        address _treasury,
        uint16  _platformFeeBps
    ) Ownable(msg.sender) {
        if (
            _masterRouter == address(0) || _tokenRouter == address(0)
                || _usdc == address(0) || _wchz == address(0) || _treasury == address(0)
        ) revert ZeroAddress();
        if (_platformFeeBps > 10_000) revert InvalidFeeBps();

        masterRouter   = IKayenMasterRouterV2(_masterRouter);
        tokenRouter    = IKayenRouter(_tokenRouter);
        usdc           = IERC20(_usdc);
        wchz           = _wchz;
        treasury       = _treasury;
        platformFeeBps = _platformFeeBps;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // BETTING — NATIVE CHZ -> USDC -> PARI-MATCH POSITION
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * @notice Swap exact native CHZ for USDC and take a position in a pari-mutuel market.
     * @param bettingMatch  Address of the PariMatch proxy.
     * @param marketId      Market identifier.
     * @param outcome       Chosen outcome index.
     * @param amountOutMin  Minimum USDC from the swap (slippage protection).
     * @param deadline      Unix timestamp deadline for the swap.
     */
    function placeBetWithCHZ(
        address bettingMatch,
        uint256 marketId,
        uint64  outcome,
        uint256 amountOutMin,
        uint256 deadline
    ) external payable nonReentrant {
        if (msg.value == 0) revert ZeroValue();
        if (block.timestamp > deadline) revert DeadlinePassed();

        uint256 usdcReceived = _swapCHZToUSDC(msg.value, amountOutMin, deadline);
        _placeBetOnBehalf(bettingMatch, marketId, outcome, usdcReceived);

        emit BetPlacedViaCHZ(bettingMatch, msg.sender, msg.value, usdcReceived, marketId, outcome);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // BETTING — USDC DIRECT -> PARI-MATCH POSITION
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * @notice Take a position directly with USDC (no swap).
     * @param bettingMatch  Address of the PariMatch proxy.
     * @param marketId      Market identifier.
     * @param outcome       Chosen outcome index.
     * @param amount        USDC amount (caller must approve this contract first).
     */
    function placeBetWithUSDC(
        address bettingMatch,
        uint256 marketId,
        uint64  outcome,
        uint256 amount
    ) external nonReentrant {
        if (amount == 0) revert ZeroValue();
        if (bettingMatch == address(0)) revert ZeroAddress();

        usdc.safeTransferFrom(msg.sender, address(this), amount);
        _placeBetOnBehalf(bettingMatch, marketId, outcome, amount);

        emit BetPlacedWithUSDC(bettingMatch, msg.sender, amount, marketId, outcome);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // BETTING — ERC20 TOKEN -> USDC -> PARI-MATCH POSITION
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * @notice Swap any ERC20 for USDC and take a pari-mutuel position.
     * @param token         ERC20 to swap (fan token, WCHZ, etc.).
     * @param amount        Token amount the caller intends to spend.
     * @param bettingMatch  Address of the PariMatch proxy.
     * @param marketId      Market identifier.
     * @param outcome       Chosen outcome index.
     * @param amountOutMin  Minimum USDC from the swap.
     * @param deadline      Unix timestamp for swap expiry.
     */
    function placeBetWithToken(
        address token,
        uint256 amount,
        address bettingMatch,
        uint256 marketId,
        uint64  outcome,
        uint256 amountOutMin,
        uint256 deadline
    ) external nonReentrant {
        if (amount == 0) revert ZeroValue();
        if (token == address(0) || bettingMatch == address(0)) revert ZeroAddress();
        if (token == address(usdc)) revert TokenIsUSDC();
        if (block.timestamp > deadline) revert DeadlinePassed();

        uint256 received     = _pullToken(IERC20(token), msg.sender, amount);
        uint256 usdcReceived = _swapTokensToUSDC(token, received, amountOutMin, deadline);
        _placeBetOnBehalf(bettingMatch, marketId, outcome, usdcReceived);

        emit BetPlacedViaToken(bettingMatch, msg.sender, token, received, usdcReceived, marketId, outcome);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // STREAMING — NATIVE CHZ -> USDC -> DONATE / SUBSCRIBE
    // ══════════════════════════════════════════════════════════════════════════

    function donateWithCHZ(
        address streamer,
        string calldata message,
        uint256 amountOutMin,
        uint256 deadline
    ) external payable nonReentrant {
        if (msg.value == 0) revert ZeroValue();
        if (streamer == address(0)) revert ZeroAddress();
        if (block.timestamp > deadline) revert DeadlinePassed();

        uint256 usdcReceived = _swapCHZToUSDC(msg.value, amountOutMin, deadline);
        (uint256 fee, uint256 streamerAmt) = _splitAndTransfer(streamer, usdcReceived);
        _recordDonation(streamer, msg.sender, usdcReceived, fee, streamerAmt, message);

        emit DonationWithCHZ(msg.sender, streamer, msg.value, usdcReceived, fee, message);
    }

    function subscribeWithCHZ(
        address streamer,
        uint256 duration,
        uint256 amountOutMin,
        uint256 deadline
    ) external payable nonReentrant {
        if (msg.value == 0) revert ZeroValue();
        if (streamer == address(0)) revert ZeroAddress();
        if (duration == 0) revert ZeroValue();
        if (block.timestamp > deadline) revert DeadlinePassed();

        uint256 usdcReceived = _swapCHZToUSDC(msg.value, amountOutMin, deadline);
        (uint256 fee,) = _splitAndTransfer(streamer, usdcReceived);
        _recordSubscription(streamer, msg.sender, usdcReceived, duration);

        emit SubscriptionWithCHZ(msg.sender, streamer, msg.value, usdcReceived, fee, duration);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // STREAMING — USDC DIRECT -> DONATE / SUBSCRIBE
    // ══════════════════════════════════════════════════════════════════════════

    function donateWithUSDC(
        address streamer,
        string calldata message,
        uint256 amount
    ) external nonReentrant {
        if (amount == 0) revert ZeroValue();
        if (streamer == address(0)) revert ZeroAddress();

        usdc.safeTransferFrom(msg.sender, address(this), amount);
        (uint256 fee, uint256 streamerAmt) = _splitAndTransfer(streamer, amount);
        _recordDonation(streamer, msg.sender, amount, fee, streamerAmt, message);

        emit DonationWithUSDCEvent(msg.sender, streamer, amount, fee, message);
    }

    function subscribeWithUSDC(
        address streamer,
        uint256 duration,
        uint256 amount
    ) external nonReentrant {
        if (amount == 0) revert ZeroValue();
        if (streamer == address(0)) revert ZeroAddress();
        if (duration == 0) revert ZeroValue();

        usdc.safeTransferFrom(msg.sender, address(this), amount);
        (uint256 fee,) = _splitAndTransfer(streamer, amount);
        _recordSubscription(streamer, msg.sender, amount, duration);

        emit SubscriptionWithUSDCEvent(msg.sender, streamer, amount, fee, duration);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // STREAMING — ERC20 TOKEN -> USDC -> DONATE / SUBSCRIBE
    // ══════════════════════════════════════════════════════════════════════════

    function donateWithToken(
        address token,
        uint256 amount,
        address streamer,
        string calldata message,
        uint256 amountOutMin,
        uint256 deadline
    ) external nonReentrant {
        if (amount == 0) revert ZeroValue();
        if (token == address(0) || streamer == address(0)) revert ZeroAddress();
        if (token == address(usdc)) revert TokenIsUSDC();
        if (block.timestamp > deadline) revert DeadlinePassed();

        uint256 received     = _pullToken(IERC20(token), msg.sender, amount);
        uint256 usdcReceived = _swapTokensToUSDC(token, received, amountOutMin, deadline);
        (uint256 fee, uint256 streamerAmt) = _splitAndTransfer(streamer, usdcReceived);
        _recordDonation(streamer, msg.sender, usdcReceived, fee, streamerAmt, message);

        emit DonationWithToken(msg.sender, streamer, token, received, usdcReceived, fee, message);
    }

    function subscribeWithToken(
        address token,
        uint256 amount,
        address streamer,
        uint256 duration,
        uint256 amountOutMin,
        uint256 deadline
    ) external nonReentrant {
        if (amount == 0) revert ZeroValue();
        if (token == address(0) || streamer == address(0)) revert ZeroAddress();
        if (token == address(usdc)) revert TokenIsUSDC();
        if (duration == 0) revert ZeroValue();
        if (block.timestamp > deadline) revert DeadlinePassed();

        uint256 received     = _pullToken(IERC20(token), msg.sender, amount);
        uint256 usdcReceived = _swapTokensToUSDC(token, received, amountOutMin, deadline);
        (uint256 fee,) = _splitAndTransfer(streamer, usdcReceived);
        _recordSubscription(streamer, msg.sender, usdcReceived, duration);

        emit SubscriptionWithToken(msg.sender, streamer, token, received, usdcReceived, fee, duration);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ADMIN
    // ══════════════════════════════════════════════════════════════════════════

    function setTreasury(address _treasury) external onlyOwner {
        if (_treasury == address(0)) revert ZeroAddress();
        address old = treasury;
        treasury = _treasury;
        emit TreasurySet(old, _treasury);
    }

    function setPlatformFeeBps(uint16 _feeBps) external onlyOwner {
        if (_feeBps > 10_000) revert InvalidFeeBps();
        uint16 old = platformFeeBps;
        platformFeeBps = _feeBps;
        emit PlatformFeeBpsSet(old, _feeBps);
    }

    /// @notice Register the PariMatchFactory so that bettingMatch addresses are validated
    ///         before USDC is forwarded. Must be set before any placeBetWith* call.
    function setMatchFactory(address _factory) external onlyOwner {
        if (_factory == address(0)) revert ZeroAddress();
        address old = address(bettingMatchFactory);
        bettingMatchFactory = PariMatchFactory(_factory);
        emit MatchFactorySet(old, _factory);
    }

    function setStreamWalletFactory(address _factory) external onlyOwner {
        if (_factory == address(0)) revert ZeroAddress();
        if (StreamWalletFactory(_factory).swapRouter() != address(this))
            revert RouterNotConfiguredOnFactory();
        address old = address(streamWalletFactory);
        streamWalletFactory = StreamWalletFactory(_factory);
        emit StreamWalletFactorySet(old, _factory);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // INTERNAL — SWAP HELPERS
    // ══════════════════════════════════════════════════════════════════════════

    function _pullToken(IERC20 token, address from, uint256 declared)
        internal
        returns (uint256 received)
    {
        uint256 balBefore = token.balanceOf(address(this));
        token.safeTransferFrom(from, address(this), declared);
        received = token.balanceOf(address(this)) - balBefore;
        if (received == 0) revert ZeroValue();
    }

    function _swapCHZToUSDC(
        uint256 chzAmount,
        uint256 amountOutMin,
        uint256 deadline
    ) internal returns (uint256 usdcReceived) {
        address[] memory path = new address[](2);
        path[0] = wchz;
        path[1] = address(usdc);

        uint256[] memory amounts = masterRouter.swapExactETHForTokens{value: chzAmount}(
            amountOutMin, path, address(this), deadline
        );
        usdcReceived = amounts[amounts.length - 1];
    }

    function _swapTokensToUSDC(
        address token,
        uint256 amount,
        uint256 amountOutMin,
        uint256 deadline
    ) internal returns (uint256 usdcReceived) {
        address[] memory path = new address[](2);
        path[0] = token;
        path[1] = address(usdc);

        IERC20(token).forceApprove(address(tokenRouter), amount);

        uint256[] memory amounts = tokenRouter.swapExactTokensForTokens(
            amount, amountOutMin, path, address(this), deadline
        );
        usdcReceived = amounts[amounts.length - 1];
    }

    // ══════════════════════════════════════════════════════════════════════════
    // INTERNAL — BETTING DELIVERY
    // ══════════════════════════════════════════════════════════════════════════

    /// @dev Transfer USDC directly to the match contract (it is its own escrow),
    ///      then call placeBetUSDCFor to record the position.
    ///      Factory registry check is always enforced — no USDC is forwarded to
    ///      an address not deployed by the registered factory.
    function _placeBetOnBehalf(
        address bettingMatch,
        uint256 marketId,
        uint64  outcome,
        uint256 amount
    ) internal {
        if (bettingMatch == address(0)) revert ZeroAddress();
        PariMatchFactory factory = bettingMatchFactory;
        if (address(factory) == address(0)) revert BettingMatchFactoryNotSet();
        if (!factory.isMatch(bettingMatch)) revert UnauthorizedBettingMatch(bettingMatch);

        // The match contract is the escrow — send USDC directly to it.
        usdc.safeTransfer(bettingMatch, amount);
        PariMatchBase(payable(bettingMatch)).placeBetUSDCFor(msg.sender, marketId, outcome, amount);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // INTERNAL — STREAMING HELPERS
    // ══════════════════════════════════════════════════════════════════════════

    function _splitAndTransfer(
        address streamer,
        uint256 totalAmount
    ) internal returns (uint256 fee, uint256 streamerAmount) {
        fee           = (totalAmount * platformFeeBps) / 10_000;
        streamerAmount = totalAmount - fee;
        if (fee > 0) usdc.safeTransfer(treasury, fee);
        usdc.safeTransfer(streamer, streamerAmount);
    }

    function _recordSubscription(
        address streamer,
        address subscriber,
        uint256 usdcAmount,
        uint256 duration
    ) internal {
        if (address(streamWalletFactory) != address(0)) {
            address wallet = streamWalletFactory.getOrCreateWallet(streamer);
            StreamWallet(payable(wallet)).recordSubscriptionByRouter(subscriber, usdcAmount, duration);
        }
    }

    function _recordDonation(
        address streamer,
        address donor,
        uint256 usdcAmount,
        uint256 platformFee,
        uint256 streamerAmount,
        string calldata message
    ) internal {
        if (address(streamWalletFactory) != address(0)) {
            address wallet = streamWalletFactory.getOrCreateWallet(streamer);
            StreamWallet(payable(wallet)).recordDonationByRouter(donor, usdcAmount, platformFee, streamerAmount, message);
        }
    }

    receive() external payable {}
}
