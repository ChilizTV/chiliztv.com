// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IKayenMasterRouterV2} from "../interfaces/IKayenMasterRouterV2.sol";
import {IKayenRouter} from "../interfaces/IKayenRouter.sol";
import {BettingMatch} from "../betting/BettingMatch.sol";
import {BettingMatchFactory} from "../betting/BettingMatchFactory.sol";
import {StreamWallet} from "../streamer/StreamWallet.sol";
import {StreamWalletFactory} from "../streamer/StreamWalletFactory.sol";

/// @dev Minimal ERC-4626 surface needed by the router for liquidity deposits.
///      The pool itself is `LiquidityPool` (ERC-4626 over USDC); we only need
///      `deposit` here. Pulling the full IERC4626 interface would bloat compile
///      with no upside.
interface ILiquidityPoolDeposit {
    function deposit(uint256 assets, address receiver) external returns (uint256 shares);
    function asset() external view returns (address);
}

/**
 * @title ChilizSwapRouter
 * @author ChilizTV
 * @notice Unified swap router for the entire ChilizTV platform.
 *         Handles token-to-USDC swaps for **both** betting and streaming modules.
 *
 * @dev Replaces the previous BettingSwapRouter + StreamSwapRouter with a single
 *      contract that centralises all Kayen DEX interactions.
 *
 * Supported Payment Paths (all settle in USDC):
 * ══════════════════════════════════════════════════════════════════════════
 * BETTING:
 *   CHZ  (native) -> USDC -> BettingMatch.placeBetUSDCFor  (placeBetWithCHZ)
 *   ERC20         -> USDC -> BettingMatch.placeBetUSDCFor  (placeBetWithToken)
 *   USDC direct   ->         BettingMatch.placeBetUSDCFor  (placeBetWithUSDC)
 *
 * STREAMING (donations & subscriptions):
 *   CHZ  (native) -> USDC -> fee split -> streamer / treasury
 *   ERC20         -> USDC -> fee split -> streamer / treasury
 *   USDC direct   ->         fee split -> streamer / treasury
 *
 * Security Notes:
 *   - This contract requires SWAP_ROUTER_ROLE on each target BettingMatch proxy
 *   - All USDC flows through this contract but is immediately forwarded (no holding)
 *   - Reentrancy protected via OpenZeppelin ReentrancyGuard
 *   - SafeERC20 used for all token transfers
 *   - Strict deadline + slippage validation on every swap
 */
contract ChilizSwapRouter is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // ══════════════════════════════════════════════════════════════════════════
    // IMMUTABLES
    // ══════════════════════════════════════════════════════════════════════════

    /// @notice Kayen DEX master router (native CHZ swaps)
    IKayenMasterRouterV2 public immutable masterRouter;

    /// @notice Kayen DEX token router (ERC20-to-ERC20 swaps)
    IKayenRouter public immutable tokenRouter;

    /// @notice USDC token address
    IERC20 public immutable usdc;

    /// @notice Wrapped CHZ (WCHZ) address
    address public immutable wchz;

    // ══════════════════════════════════════════════════════════════════════════
    // MUTABLE STATE (streaming fee config)
    // ══════════════════════════════════════════════════════════════════════════

    /// @notice Platform treasury for streaming fee collection
    address public treasury;

    /// @notice Platform fee in basis points (e.g., 500 = 5%)
    uint16 public platformFeeBps;

    /// @notice StreamWalletFactory for wallet lookup/creation
    StreamWalletFactory public streamWalletFactory;

    /// @notice BettingMatchFactory for validating that bettingMatch addresses are legitimate.
    /// @dev MUST be set before any `placeBetWith*` call — validation is always enforced.
    ///      If unset, all betting entrypoints revert with `BettingMatchFactoryNotSet`.
    ///      Deploy flow: deploy this router, deploy factory, call `setMatchFactory(factory)`.
    BettingMatchFactory public bettingMatchFactory;

    /// @notice ChilizTV LiquidityPool (ERC-4626 over USDC). Used by the
    ///         `depositLiquidityWith*` entrypoints to convert any supported
    ///         asset into USDC and mint LP shares to the user in a single tx.
    /// @dev Owner-set after pool deployment via `setLiquidityPool`. If unset,
    ///      every `depositLiquidityWith*` call reverts with `LiquidityPoolNotSet`
    ///      — same loud-failure pattern as `bettingMatchFactory`.
    ILiquidityPoolDeposit public liquidityPool;

    // ══════════════════════════════════════════════════════════════════════════
    // EVENTS — BETTING
    // ══════════════════════════════════════════════════════════════════════════

    event BetPlacedViaCHZ(
        address indexed bettingMatch,
        address indexed user,
        uint256 chzSpent,
        uint256 usdcReceived,
        uint256 marketId,
        uint64 selection
    );

    event BetPlacedViaToken(
        address indexed bettingMatch,
        address indexed user,
        address indexed token,
        uint256 tokenSpent,
        uint256 usdcReceived,
        uint256 marketId,
        uint64 selection
    );

    event BetPlacedWithUSDC(
        address indexed bettingMatch,
        address indexed user,
        uint256 amount,
        uint256 marketId,
        uint64 selection
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
        string message
    );

    event DonationWithToken(
        address indexed donor,
        address indexed streamer,
        address indexed token,
        uint256 tokenSpent,
        uint256 usdcDonated,
        uint256 platformFee,
        string message
    );

    event DonationWithUSDCEvent(
        address indexed donor,
        address indexed streamer,
        uint256 amount,
        uint256 platformFee,
        string message
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
    // ERRORS
    // ══════════════════════════════════════════════════════════════════════════

    error ZeroAddress();
    error ZeroValue();
    error DeadlinePassed();
    error InvalidFeeBps();
    error TokenIsUSDC();
    /// @notice Thrown when bettingMatch was not deployed by the registered factory
    error UnauthorizedBettingMatch(address bettingMatch);
    /// @notice Thrown when a bet is attempted before the BettingMatchFactory has been
    ///         registered via `setMatchFactory`. Prevents silent USDC theft through
    ///         unvalidated `bettingMatch` addresses.
    error BettingMatchFactoryNotSet();
    /// @notice Thrown when setStreamWalletFactory is called but the factory's swapRouter
    ///         is not this contract — prevents a misconfiguration that would silently
    ///         revert every streaming recording call.
    error RouterNotConfiguredOnFactory();
    /// @notice Thrown when a `depositLiquidityWith*` call is made before the pool
    ///         has been registered via `setLiquidityPool`. Same loud-failure
    ///         pattern as `BettingMatchFactoryNotSet`.
    error LiquidityPoolNotSet();
    /// @notice Thrown when `setLiquidityPool` is called with a pool whose
    ///         `asset()` is not the configured USDC. Prevents wiring the router
    ///         to a non-USDC vault by mistake.
    error PoolAssetMismatch(address poolAsset, address expectedUsdc);

    // ══════════════════════════════════════════════════════════════════════════
    // EVENTS — ADMIN
    // ══════════════════════════════════════════════════════════════════════════

    event TreasurySet(address indexed oldTreasury, address indexed newTreasury);
    event PlatformFeeBpsSet(uint16 oldFeeBps, uint16 newFeeBps);
    event MatchFactorySet(address indexed oldFactory, address indexed newFactory);
    event StreamWalletFactorySet(address indexed oldFactory, address indexed newFactory);
    event LiquidityPoolSet(address indexed oldPool, address indexed newPool);

    // ══════════════════════════════════════════════════════════════════════════
    // EVENTS — LIQUIDITY DEPOSITS
    // ══════════════════════════════════════════════════════════════════════════

    event LiquidityDepositedWithUSDC(
        address indexed depositor,
        address indexed receiver,
        uint256 amount,
        uint256 sharesMinted
    );

    event LiquidityDepositedWithCHZ(
        address indexed depositor,
        address indexed receiver,
        uint256 chzSpent,
        uint256 usdcReceived,
        uint256 sharesMinted
    );

    event LiquidityDepositedWithToken(
        address indexed depositor,
        address indexed receiver,
        address indexed token,
        uint256 tokenSpent,
        uint256 usdcReceived,
        uint256 sharesMinted
    );

    // ══════════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * @param _masterRouter Kayen MasterRouterV2 (native CHZ swaps)
     * @param _tokenRouter  Kayen token router (ERC20-to-ERC20 swaps)
     * @param _usdc         USDC token address
     * @param _wchz         Wrapped CHZ (WCHZ) address
     * @param _treasury     Platform treasury address
     * @param _platformFeeBps Platform fee in basis points (max 10 000)
     */
    constructor(
        address _masterRouter,
        address _tokenRouter,
        address _usdc,
        address _wchz,
        address _treasury,
        uint16 _platformFeeBps
    ) Ownable(msg.sender) {
        if (
            _masterRouter == address(0) || _tokenRouter == address(0)
                || _usdc == address(0) || _wchz == address(0) || _treasury == address(0)
        ) revert ZeroAddress();
        if (_platformFeeBps > 10_000) revert InvalidFeeBps();

        masterRouter = IKayenMasterRouterV2(_masterRouter);
        tokenRouter = IKayenRouter(_tokenRouter);
        usdc = IERC20(_usdc);
        wchz = _wchz;
        treasury = _treasury;
        platformFeeBps = _platformFeeBps;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // BETTING — NATIVE CHZ -> USDC -> BET
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * @notice Swap exact native CHZ for USDC and place a USDC bet
     * @param bettingMatch Address of the BettingMatch proxy
     * @param marketId     Market identifier
     * @param selection    User's pick (outcome ID)
     * @param amountOutMin Minimum USDC to accept (slippage protection)
     * @param deadline     Unix timestamp deadline for the swap
     */
    function placeBetWithCHZ(
        address bettingMatch,
        uint256 marketId,
        uint64 selection,
        uint256 amountOutMin,
        uint256 deadline
    ) external payable nonReentrant {
        if (msg.value == 0) revert ZeroValue();
        if (block.timestamp > deadline) revert DeadlinePassed();

        uint256 usdcReceived = _swapCHZToUSDC(msg.value, amountOutMin, deadline);
        _placeBetOnBehalf(bettingMatch, marketId, selection, usdcReceived);

        emit BetPlacedViaCHZ(bettingMatch, msg.sender, msg.value, usdcReceived, marketId, selection);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // BETTING — USDC DIRECT -> BET (NO SWAP)
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * @notice Place a bet directly with USDC (no swap needed)
     * @param bettingMatch Address of the BettingMatch proxy
     * @param marketId     Market identifier
     * @param selection    User's pick (outcome ID)
     * @param amount       USDC amount to bet (caller must approve first)
     */
    function placeBetWithUSDC(
        address bettingMatch,
        uint256 marketId,
        uint64 selection,
        uint256 amount
    ) external nonReentrant {
        if (amount == 0) revert ZeroValue();
        if (bettingMatch == address(0)) revert ZeroAddress();

        usdc.safeTransferFrom(msg.sender, address(this), amount);
        _placeBetOnBehalf(bettingMatch, marketId, selection, amount);

        
        emit BetPlacedWithUSDC(bettingMatch, msg.sender, amount, marketId, selection);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // BETTING — ERC20 TOKEN -> USDC -> BET
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * @notice Swap any ERC20 token for USDC and place a USDC bet
     * @param token        ERC20 token to swap (WCHZ, fan token, etc.)
     * @param amount       Amount of tokens to spend
     * @param bettingMatch Address of the BettingMatch proxy
     * @param marketId     Market identifier
     * @param selection    User's pick (outcome ID)
     * @param amountOutMin Minimum USDC to accept (slippage protection)
     * @param deadline     Unix timestamp for swap expiry
     */
    function placeBetWithToken(
        address token,
        uint256 amount,
        address bettingMatch,
        uint256 marketId,
        uint64 selection,
        uint256 amountOutMin,
        uint256 deadline
    ) external nonReentrant {
        if (amount == 0) revert ZeroValue();
        if (token == address(0) || bettingMatch == address(0)) revert ZeroAddress();
        if (token == address(usdc)) revert TokenIsUSDC();
        if (block.timestamp > deadline) revert DeadlinePassed();

        // Measure the actual amount received to stay safe with fee-on-transfer
        // / rebasing tokens — we swap what we *hold*, not what the user declared.
        uint256 received = _pullToken(IERC20(token), msg.sender, amount);
        uint256 usdcReceived = _swapTokensToUSDC(token, received, amountOutMin, deadline);
        _placeBetOnBehalf(bettingMatch, marketId, selection, usdcReceived);

        emit BetPlacedViaToken(bettingMatch, msg.sender, token, received, usdcReceived, marketId, selection);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // STREAMING — NATIVE CHZ -> USDC -> DONATE / SUBSCRIBE
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * @notice Donate to a streamer: swap CHZ -> USDC and send to streamer/treasury
     */
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

        // Record donation in StreamWallet
        _recordDonation(streamer, msg.sender, usdcReceived, fee, streamerAmt, message);

        emit DonationWithCHZ(msg.sender, streamer, msg.value, usdcReceived, fee, message);
    }

    /**
     * @notice Subscribe to a streamer: swap CHZ -> USDC and send to streamer/treasury
     */
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

        // Record subscription in StreamWallet
        _recordSubscription(streamer, msg.sender, usdcReceived, duration);

        emit SubscriptionWithCHZ(msg.sender, streamer, msg.value, usdcReceived, fee, duration);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // STREAMING — USDC DIRECT -> DONATE / SUBSCRIBE (NO SWAP)
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * @notice Donate to a streamer directly with USDC (no swap)
     */
    function donateWithUSDC(
        address streamer,
        string calldata message,
        uint256 amount
    ) external nonReentrant {
        if (amount == 0) revert ZeroValue();
        if (streamer == address(0)) revert ZeroAddress();

        usdc.safeTransferFrom(msg.sender, address(this), amount);
        (uint256 fee, uint256 streamerAmt) = _splitAndTransfer(streamer, amount);

        // Record donation in StreamWallet
        _recordDonation(streamer, msg.sender, amount, fee, streamerAmt, message);

        emit DonationWithUSDCEvent(msg.sender, streamer, amount, fee, message);
    }

    /**
     * @notice Subscribe to a streamer directly with USDC (no swap)
     */
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

        // Record subscription in StreamWallet
        _recordSubscription(streamer, msg.sender, amount, duration);

        emit SubscriptionWithUSDCEvent(msg.sender, streamer, amount, fee, duration);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // STREAMING — ERC20 TOKEN -> USDC -> DONATE / SUBSCRIBE
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * @notice Donate to a streamer: swap any ERC20 -> USDC and send to streamer/treasury
     */
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

        uint256 received = _pullToken(IERC20(token), msg.sender, amount);
        uint256 usdcReceived = _swapTokensToUSDC(token, received, amountOutMin, deadline);
        (uint256 fee, uint256 streamerAmt) = _splitAndTransfer(streamer, usdcReceived);

        // Record donation in StreamWallet
        _recordDonation(streamer, msg.sender, usdcReceived, fee, streamerAmt, message);

        emit DonationWithToken(msg.sender, streamer, token, received, usdcReceived, fee, message);
    }

    /**
     * @notice Subscribe to a streamer: swap any ERC20 -> USDC and send to streamer/treasury
     */
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

        uint256 received = _pullToken(IERC20(token), msg.sender, amount);
        uint256 usdcReceived = _swapTokensToUSDC(token, received, amountOutMin, deadline);
        (uint256 fee,) = _splitAndTransfer(streamer, usdcReceived);

        // Record subscription in StreamWallet
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

    /// @notice Register the BettingMatchFactory so that bettingMatch addresses are validated
    ///         before USDC is forwarded to them (M-02 fix).
    /// @dev MUST be set before any `placeBetWith*` call. Validation is ALWAYS enforced
    ///      in `_placeBetOnBehalf`; pre-registration means every bet reverts with
    ///      `BettingMatchFactoryNotSet`. No silent-forward path exists.
    function setMatchFactory(address _factory) external onlyOwner {
        if (_factory == address(0)) revert ZeroAddress();
        address old = address(bettingMatchFactory);
        bettingMatchFactory = BettingMatchFactory(_factory);
        emit MatchFactorySet(old, _factory);
    }

    /// @notice Register the StreamWalletFactory for wallet recording.
    /// @dev Validates that this router is already set as swapRouter on the factory,
    ///      preventing a misconfiguration where streaming calls silently revert.
    ///      Correct setup order: (1) deploy router, (2) factory.setSwapRouter(router),
    ///      (3) router.setStreamWalletFactory(factory).
    function setStreamWalletFactory(address _factory) external onlyOwner {
        if (_factory == address(0)) revert ZeroAddress();
        // Guard against config order mistake: the factory must already have this
        // router registered as its swapRouter, otherwise every streaming recording
        // call will revert with Unauthorized inside getOrCreateWallet.
        if (StreamWalletFactory(_factory).swapRouter() != address(this)) {
            revert RouterNotConfiguredOnFactory();
        }
        address old = address(streamWalletFactory);
        streamWalletFactory = StreamWalletFactory(_factory);
        emit StreamWalletFactorySet(old, _factory);
    }

    /// @notice Register the ChilizTV LiquidityPool used by the
    ///         `depositLiquidityWith*` entrypoints.
    /// @dev Owner-only. Validates that the pool's underlying asset is the
    ///      configured USDC, so a misconfigured non-USDC vault can't be wired
    ///      in by mistake. Pre-registration of the pool is required before any
    ///      `depositLiquidityWith*` call — otherwise reverts with
    ///      `LiquidityPoolNotSet` (loud failure, no silent fund loss).
    function setLiquidityPool(address _pool) external onlyOwner {
        if (_pool == address(0)) revert ZeroAddress();
        address poolAsset = ILiquidityPoolDeposit(_pool).asset();
        if (poolAsset != address(usdc)) revert PoolAssetMismatch(poolAsset, address(usdc));
        address old = address(liquidityPool);
        liquidityPool = ILiquidityPoolDeposit(_pool);
        emit LiquidityPoolSet(old, _pool);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // LIQUIDITY DEPOSITS — USDC / CHZ / ERC20 -> ctvLP shares
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * @notice Deposit USDC directly into the LiquidityPool and mint ctvLP shares.
     * @dev Caller must approve `amount` USDC to this router.
     * @param amount   USDC to deposit (atomic units, 6 decimals).
     * @param receiver Address that receives the ctvLP shares (cooldown anchor).
     * @return shares  ctvLP shares minted to `receiver`.
     */
    function depositLiquidityWithUSDC(
        uint256 amount,
        address receiver
    ) external nonReentrant returns (uint256 shares) {
        if (amount == 0) revert ZeroValue();
        if (receiver == address(0)) revert ZeroAddress();

        usdc.safeTransferFrom(msg.sender, address(this), amount);
        shares = _depositToPool(amount, receiver);

        emit LiquidityDepositedWithUSDC(msg.sender, receiver, amount, shares);
    }

    /**
     * @notice Swap exact native CHZ for USDC and deposit it into the LiquidityPool
     *         in a single transaction. Mints ctvLP shares to `receiver`.
     * @dev    Pool cooldown is anchored on `receiver` (= the share holder).
     * @param amountOutMin Minimum USDC to accept from the swap (slippage protection).
     * @param deadline     Unix timestamp deadline for the swap.
     * @param receiver     Address that receives the ctvLP shares.
     * @return shares      ctvLP shares minted to `receiver`.
     */
    function depositLiquidityWithCHZ(
        uint256 amountOutMin,
        uint256 deadline,
        address receiver
    ) external payable nonReentrant returns (uint256 shares) {
        if (msg.value == 0) revert ZeroValue();
        if (receiver == address(0)) revert ZeroAddress();
        if (block.timestamp > deadline) revert DeadlinePassed();

        uint256 usdcReceived = _swapCHZToUSDC(msg.value, amountOutMin, deadline);
        shares = _depositToPool(usdcReceived, receiver);

        emit LiquidityDepositedWithCHZ(msg.sender, receiver, msg.value, usdcReceived, shares);
    }

    /**
     * @notice Swap any supported ERC20 for USDC (via Kayen/FanX) and deposit it
     *         into the LiquidityPool in a single transaction.
     * @dev    Caller must approve `amount` of `token` to this router.
     *         Fee-on-transfer / rebasing tokens are handled by `_pullToken`,
     *         which uses the actually-received amount for the swap.
     * @param token        ERC20 to swap (must not equal USDC).
     * @param amount       Token amount the caller intends to spend.
     * @param amountOutMin Minimum USDC to accept from the swap (slippage protection).
     * @param deadline     Unix timestamp deadline for the swap.
     * @param receiver     Address that receives the ctvLP shares.
     * @return shares      ctvLP shares minted to `receiver`.
     */
    function depositLiquidityWithToken(
        address token,
        uint256 amount,
        uint256 amountOutMin,
        uint256 deadline,
        address receiver
    ) external nonReentrant returns (uint256 shares) {
        if (amount == 0) revert ZeroValue();
        if (token == address(0) || receiver == address(0)) revert ZeroAddress();
        if (token == address(usdc)) revert TokenIsUSDC();
        if (block.timestamp > deadline) revert DeadlinePassed();

        uint256 received = _pullToken(IERC20(token), msg.sender, amount);
        uint256 usdcReceived = _swapTokensToUSDC(token, received, amountOutMin, deadline);
        shares = _depositToPool(usdcReceived, receiver);

        emit LiquidityDepositedWithToken(
            msg.sender, receiver, token, received, usdcReceived, shares
        );
    }

    // ══════════════════════════════════════════════════════════════════════════
    // INTERNAL — SWAP HELPERS
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * @dev Pull `declared` tokens from `from` to this contract and return the
     *      *actual* amount received. Fee-on-transfer, rebasing, and other
     *      non-conforming ERC20s deliver less than `declared`; we swap what we
     *      actually hold, not what the user said they'd send.
     */
    function _pullToken(IERC20 token, address from, uint256 declared)
        internal
        returns (uint256 received)
    {
        uint256 balBefore = token.balanceOf(address(this));
        token.safeTransferFrom(from, address(this), declared);
        uint256 balAfter = token.balanceOf(address(this));
        // Underflow-safe: balAfter >= balBefore or safeTransferFrom would have reverted.
        received = balAfter - balBefore;
        if (received == 0) revert ZeroValue();
    }

    /**
     * @dev Swap exact native CHZ to USDC via Kayen master router
     */
    function _swapCHZToUSDC(
        uint256 chzAmount,
        uint256 amountOutMin,
        uint256 deadline
    ) internal returns (uint256 usdcReceived) {
        address[] memory path = new address[](2);
        path[0] = wchz;
        path[1] = address(usdc);

        uint256[] memory amounts = masterRouter.swapExactETHForTokens{value: chzAmount}(
            amountOutMin,
            path,
            false,
            address(this),
            deadline
        );

        usdcReceived = amounts[amounts.length - 1];
    }

    /**
     * @dev Approve token router and execute ERC20 -> USDC swap
     */
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
            amount,
            amountOutMin,
            path,
            address(this),
            deadline
        );

        usdcReceived = amounts[amounts.length - 1];
    }

    // ══════════════════════════════════════════════════════════════════════════
    // INTERNAL — DELIVERY HELPERS
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * @dev Transfer USDC to the LiquidityPool the match is wired to, then book
     *      the bet on the match. The match contract holds NO USDC — every
     *      stake lives in the pool, every payout comes back out of it. We read
     *      the pool address from the match itself so the router can never
     *      desync from the match's `liquidityPool` setting.
     *
     *      Validation against the factory registry is ALWAYS enforced — USDC
     *      is never forwarded for an address the factory didn't deploy. If
     *      the factory has not yet been registered the call reverts loudly
     *      (no silent fund loss).
     */
    function _placeBetOnBehalf(
        address bettingMatch,
        uint256 marketId,
        uint64 selection,
        uint256 amount
    ) internal {
        if (bettingMatch == address(0)) revert ZeroAddress();
        BettingMatchFactory factory = bettingMatchFactory;
        if (address(factory) == address(0)) revert BettingMatchFactoryNotSet();
        if (!factory.isMatch(bettingMatch)) revert UnauthorizedBettingMatch(bettingMatch);

        address pool = address(BettingMatch(payable(bettingMatch)).liquidityPool());
        if (pool == address(0)) revert ZeroAddress();
        usdc.safeTransfer(pool, amount);
        BettingMatch(payable(bettingMatch)).placeBetUSDCFor(msg.sender, marketId, selection, amount);
    }

    /**
     * @dev Approve USDC to the LiquidityPool and call ERC-4626 `deposit`.
     *      Reverts loudly if the pool has not been registered. Cooldown is
     *      tracked on `receiver` by the pool itself (in its `_update`).
     */
    function _depositToPool(uint256 usdcAmount, address receiver)
        internal
        returns (uint256 shares)
    {
        ILiquidityPoolDeposit pool = liquidityPool;
        if (address(pool) == address(0)) revert LiquidityPoolNotSet();

        IERC20(address(usdc)).forceApprove(address(pool), usdcAmount);
        shares = pool.deposit(usdcAmount, receiver);
    }

    /**
     * @dev Split USDC between streamer and treasury, then transfer
     * @return fee Platform fee amount
     * @return streamerAmount Amount sent to streamer
     */
    function _splitAndTransfer(
        address streamer,
        uint256 totalAmount
    ) internal returns (uint256 fee, uint256 streamerAmount) {
        fee = (totalAmount * platformFeeBps) / 10_000;
        streamerAmount = totalAmount - fee;

        if (fee > 0) {
            usdc.safeTransfer(treasury, fee);
        }
        usdc.safeTransfer(streamer, streamerAmount);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // INTERNAL — STREAM WALLET RECORDING HELPERS
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * @dev Get or create a StreamWallet and record a subscription
     */
    function _recordSubscription(
        address streamer,
        address subscriber,
        uint256 usdcAmount,
        uint256 duration
    ) internal {
        if (address(streamWalletFactory) != address(0)) {
            address wallet = streamWalletFactory.getOrCreateWallet(streamer);
            StreamWallet(payable(wallet)).recordSubscriptionByRouter(
                subscriber,
                usdcAmount,
                duration
            );
        }
    }

    /**
     * @dev Get or create a StreamWallet and record a donation
     */
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
            StreamWallet(payable(wallet)).recordDonationByRouter(
                donor,
                usdcAmount,
                platformFee,
                streamerAmount,
                message
            );
        }
    }

    /// @notice Receive refunded CHZ from router
    receive() external payable {}
}
