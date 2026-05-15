// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {ERC1967Proxy}  from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import {PariMatchBase}       from "../src/pari/PariMatchBase.sol";
import {FootballPariMatch}   from "../src/pari/FootballPariMatch.sol";
import {BasketballPariMatch} from "../src/pari/BasketballPariMatch.sol";
import {PariMatchFactory}    from "../src/pari/PariMatchFactory.sol";
import {MockUSDC}            from "./mocks/MockUSDC.sol";

/**
 * @title PariMatchTest
 * @notice Full test suite for the pari-mutuel betting system.
 *
 * Coverage:
 *  1.  Market creation — football + basketball, batch, invalid type
 *  2.  Market lifecycle — state machine transitions and guard rails
 *  3.  Position taking — direct USDC, router path, minimum stake
 *  4.  Pari-mutuel math — winner payouts, pool proportionality
 *  5.  Fee collection — fee to feeRecipient, net pool invariant
 *  6.  Losing bets — cannot claim, nothing to claim
 *  7.  Double-claim prevention
 *  8.  Market cancellation — admin cancel, full refund
 *  9.  Void market — auto-cancel when no one bet on winning outcome
 * 10.  Multi-outcome staking — user bets on multiple outcomes
 * 11.  Batch claims — claimBatch, claimRefundBatch
 * 12.  Access control — role enforcement on every privileged function
 * 13.  Factory — deploy, wire, isMatch registry
 * 14.  Fuzz — total payouts + fee == totalPool (invariant)
 * 15.  Basketball markets — sport-specific validation
 */
contract PariMatchTest is Test {

    // ═══════════════════════════════════════════════════════════════════════
    // ACTORS
    // ═══════════════════════════════════════════════════════════════════════

    address public owner      = makeAddr("owner");
    address public oracle     = makeAddr("oracle");
    address public feeAddr    = makeAddr("feeRecipient");
    address public swapRouter = makeAddr("swapRouter");
    address public alice      = makeAddr("alice");
    address public bob        = makeAddr("bob");
    address public carol      = makeAddr("carol");
    address public dave       = makeAddr("dave");
    address public stranger   = makeAddr("stranger");

    // ═══════════════════════════════════════════════════════════════════════
    // CONTRACTS
    // ═══════════════════════════════════════════════════════════════════════

    MockUSDC         public usdc;
    FootballPariMatch  public match_;   // proxy
    BasketballPariMatch public bball;   // proxy (for sport-specific tests)
    PariMatchFactory   public factory;

    // ═══════════════════════════════════════════════════════════════════════
    // ROLE CONSTANTS
    // ═══════════════════════════════════════════════════════════════════════

    bytes32 constant ADMIN_ROLE       = keccak256("ADMIN_ROLE");
    bytes32 constant RESOLVER_ROLE    = keccak256("RESOLVER_ROLE");
    bytes32 constant PAUSER_ROLE      = keccak256("PAUSER_ROLE");
    bytes32 constant SWAP_ROUTER_ROLE = keccak256("SWAP_ROUTER_ROLE");

    // ═══════════════════════════════════════════════════════════════════════
    // MARKET TYPE CONSTANTS
    // ═══════════════════════════════════════════════════════════════════════

    bytes32 constant MARKET_WINNER      = keccak256("WINNER");
    bytes32 constant MARKET_GOALS_TOTAL = keccak256("GOALS_TOTAL");
    bytes32 constant MARKET_BOTH_SCORE  = keccak256("BOTH_SCORE");

    // ═══════════════════════════════════════════════════════════════════════
    // SETUP
    // ═══════════════════════════════════════════════════════════════════════

    function setUp() public {
        usdc = new MockUSDC();

        // Deploy FootballPariMatch proxy.
        FootballPariMatch impl = new FootballPariMatch();
        bytes memory init = abi.encodeWithSelector(
            FootballPariMatch.initialize.selector,
            "Barcelona vs Real Madrid",
            owner
        );
        match_ = FootballPariMatch(payable(address(new ERC1967Proxy(address(impl), init))));

        // Configure: RESOLVER_ROLE, SWAP_ROUTER_ROLE, USDC, feeRecipient.
        vm.startPrank(owner);
        match_.grantRole(RESOLVER_ROLE,    oracle);
        match_.grantRole(SWAP_ROUTER_ROLE, swapRouter);
        match_.setUSDCToken(address(usdc));
        match_.setFeeRecipient(feeAddr);
        vm.stopPrank();

        // Deploy BasketballPariMatch proxy.
        BasketballPariMatch bimpl = new BasketballPariMatch();
        bytes memory binit = abi.encodeWithSelector(
            BasketballPariMatch.initialize.selector,
            "Lakers vs Celtics",
            owner
        );
        bball = BasketballPariMatch(payable(address(new ERC1967Proxy(address(bimpl), binit))));
        vm.startPrank(owner);
        bball.grantRole(RESOLVER_ROLE,    oracle);
        bball.grantRole(SWAP_ROUTER_ROLE, swapRouter);
        bball.setUSDCToken(address(usdc));
        bball.setFeeRecipient(feeAddr);
        vm.stopPrank();

        // Deploy factory.
        factory = new PariMatchFactory();

        // Fund actors.
        usdc.mint(alice,  100_000e6);
        usdc.mint(bob,    100_000e6);
        usdc.mint(carol,  100_000e6);
        usdc.mint(dave,   100_000e6);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════════════

    /// Create a WINNER market and open it.
    function _openWinnerMarket() internal returns (uint256 marketId) {
        vm.startPrank(owner);
        match_.addMarketWithLine(MARKET_WINNER, 0);
        marketId = match_.marketCount() - 1;
        match_.openMarket(marketId);
        vm.stopPrank();
    }

    /// Approve + stake from `user`.
    function _stake(address user, uint256 marketId, uint64 outcome, uint256 amount) internal {
        vm.startPrank(user);
        usdc.approve(address(match_), amount);
        match_.placeBetUSDC(marketId, outcome, amount);
        vm.stopPrank();
    }

    /// Close + resolve via oracle.
    function _closeResolve(uint256 marketId, uint64 result) internal {
        vm.prank(owner);
        match_.closeMarket(marketId);
        vm.prank(oracle);
        match_.resolveMarket(marketId, result);
    }

    /// Close + cancel via admin.
    function _closeCancel(uint256 marketId) internal {
        vm.prank(owner);
        match_.closeMarket(marketId);
        vm.prank(owner);
        match_.cancelMarket(marketId, "test cancel");
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 1. MARKET CREATION
    // ═══════════════════════════════════════════════════════════════════════

    function test_CreateWinnerMarket() public {
        vm.prank(owner);
        match_.addMarketWithLine(MARKET_WINNER, 0);

        assertEq(match_.marketCount(), 1);

        (bytes32 mtype, PariMatchBase.MarketState state,,, uint256 outcomes) =
            match_.getMarketInfo(0);
        assertEq(mtype, MARKET_WINNER);
        assertEq(uint8(state), uint8(PariMatchBase.MarketState.Inactive));
        assertEq(outcomes, 3); // Home / Draw / Away
    }

    function test_CreateGoalsTotalMarket() public {
        vm.prank(owner);
        match_.addMarketWithLine(MARKET_GOALS_TOTAL, 25); // 2.5 goals line

        (, , , , uint256 outcomes) = match_.getMarketInfo(0);
        assertEq(outcomes, 2); // Under / Over
    }

    function test_CreateBothScoreMarket() public {
        vm.prank(owner);
        match_.addMarketWithLine(MARKET_BOTH_SCORE, 0);

        (, , , , uint256 outcomes) = match_.getMarketInfo(0);
        assertEq(outcomes, 2); // No / Yes
    }

    function test_CreateMarketsBatch() public {
        bytes32[] memory types  = new bytes32[](3);
        int16[]   memory lines  = new int16[](3);
        types[0] = MARKET_WINNER;
        types[1] = MARKET_GOALS_TOTAL;
        types[2] = MARKET_BOTH_SCORE;
        lines[1] = 25;

        vm.prank(owner);
        match_.addMarketsBatch(types, lines);

        assertEq(match_.marketCount(), 3);
    }

    function test_Revert_CreateInvalidMarketType() public {
        vm.prank(owner);
        vm.expectRevert();
        match_.addMarketWithLine(keccak256("INVALID_TYPE"), 0);
    }

    function test_Revert_CreateMarketNotAdmin() public {
        vm.prank(stranger);
        vm.expectRevert();
        match_.addMarketWithLine(MARKET_WINNER, 0);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 2. MARKET LIFECYCLE — STATE TRANSITIONS
    // ═══════════════════════════════════════════════════════════════════════

    function test_LifecycleInactiveToOpen() public {
        uint256 mid = _openWinnerMarket();
        (, PariMatchBase.MarketState state,,,) = match_.getMarketInfo(mid);
        assertEq(uint8(state), uint8(PariMatchBase.MarketState.Open));
    }

    function test_LifecycleOpenToSuspendedToOpen() public {
        uint256 mid = _openWinnerMarket();

        vm.prank(owner);
        match_.suspendMarket(mid);
        (, PariMatchBase.MarketState s1,,,) = match_.getMarketInfo(mid);
        assertEq(uint8(s1), uint8(PariMatchBase.MarketState.Suspended));

        vm.prank(owner);
        match_.openMarket(mid);
        (, PariMatchBase.MarketState s2,,,) = match_.getMarketInfo(mid);
        assertEq(uint8(s2), uint8(PariMatchBase.MarketState.Open));
    }

    function test_LifecycleToClosed() public {
        uint256 mid = _openWinnerMarket();
        vm.prank(owner);
        match_.closeMarket(mid);
        (, PariMatchBase.MarketState state,,,) = match_.getMarketInfo(mid);
        assertEq(uint8(state), uint8(PariMatchBase.MarketState.Closed));
    }

    function test_LifecycleToCancelled() public {
        uint256 mid = _openWinnerMarket();
        vm.prank(owner);
        match_.cancelMarket(mid, "postponed");
        (, PariMatchBase.MarketState state,,,) = match_.getMarketInfo(mid);
        assertEq(uint8(state), uint8(PariMatchBase.MarketState.Cancelled));
    }

    function test_Revert_CannotBetOnClosedMarket() public {
        uint256 mid = _openWinnerMarket();
        vm.prank(owner);
        match_.closeMarket(mid);

        vm.startPrank(alice);
        usdc.approve(address(match_), 100e6);
        vm.expectRevert();
        match_.placeBetUSDC(mid, 0, 100e6);
        vm.stopPrank();
    }

    function test_Revert_CannotBetOnCancelledMarket() public {
        uint256 mid = _openWinnerMarket();
        vm.prank(owner);
        match_.cancelMarket(mid, "cancel");

        vm.startPrank(alice);
        usdc.approve(address(match_), 100e6);
        vm.expectRevert();
        match_.placeBetUSDC(mid, 0, 100e6);
        vm.stopPrank();
    }

    function test_Revert_CannotBetOnInactiveMarket() public {
        vm.prank(owner);
        match_.addMarketWithLine(MARKET_WINNER, 0);

        vm.startPrank(alice);
        usdc.approve(address(match_), 100e6);
        vm.expectRevert();
        match_.placeBetUSDC(0, 0, 100e6);
        vm.stopPrank();
    }

    function test_Revert_CannotResolveOpenMarket() public {
        uint256 mid = _openWinnerMarket();
        vm.prank(oracle);
        vm.expectRevert();
        match_.resolveMarket(mid, 0);
    }

    function test_BatchOpenClose() public {
        vm.startPrank(owner);
        match_.addMarketWithLine(MARKET_WINNER, 0);
        match_.addMarketWithLine(MARKET_GOALS_TOTAL, 0);
        match_.addMarketWithLine(MARKET_BOTH_SCORE, 0);

        uint256[] memory ids = new uint256[](3);
        ids[0] = 0; ids[1] = 1; ids[2] = 2;

        match_.openMarketsBatch(ids);
        match_.closeMarketsBatch(ids);
        vm.stopPrank();

        for (uint256 i; i < 3; i++) {
            (, PariMatchBase.MarketState s,,,) = match_.getMarketInfo(i);
            assertEq(uint8(s), uint8(PariMatchBase.MarketState.Closed));
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 3. POSITION TAKING
    // ═══════════════════════════════════════════════════════════════════════

    function test_StakeRecorded() public {
        uint256 mid = _openWinnerMarket();
        _stake(alice, mid, 0, 500e6);

        assertEq(match_.getUserStake(mid, alice, 0),    500e6);
        assertEq(match_.getUserTotalStake(mid, alice),  500e6);
        assertEq(match_.getOutcomePool(mid, 0),         500e6);
        assertEq(match_.getTotalPool(mid),              500e6);
    }

    function test_StakeAccumulatesOnSameOutcome() public {
        uint256 mid = _openWinnerMarket();
        _stake(alice, mid, 0, 300e6);
        _stake(alice, mid, 0, 200e6);

        assertEq(match_.getUserStake(mid, alice, 0),   500e6);
        assertEq(match_.getUserTotalStake(mid, alice), 500e6);
        assertEq(match_.getTotalPool(mid),             500e6);
    }

    function test_StakeOnMultipleOutcomes() public {
        uint256 mid = _openWinnerMarket();
        _stake(alice, mid, 0, 300e6); // Home
        _stake(alice, mid, 2, 200e6); // Away

        assertEq(match_.getUserStake(mid, alice, 0),   300e6);
        assertEq(match_.getUserStake(mid, alice, 2),   200e6);
        assertEq(match_.getUserTotalStake(mid, alice), 500e6); // total across outcomes
        assertEq(match_.getTotalPool(mid),             500e6);
    }

    function test_RouterPlacesBetUSDCFor() public {
        uint256 mid = _openWinnerMarket();

        // Router pre-sends USDC, then calls placeBetUSDCFor.
        usdc.mint(swapRouter, 1000e6);
        vm.startPrank(swapRouter);
        usdc.transfer(address(match_), 1000e6);
        match_.placeBetUSDCFor(alice, mid, 1, 1000e6);
        vm.stopPrank();

        assertEq(match_.getUserStake(mid, alice, 1), 1000e6);
    }

    function test_Revert_BetBelowMinStake() public {
        uint256 mid = _openWinnerMarket();

        vm.startPrank(alice);
        usdc.approve(address(match_), 1000);
        vm.expectRevert(
            abi.encodeWithSelector(
                PariMatchBase.StakeBelowMinimum.selector,
                1000,
                PariMatchBase(address(match_)).MIN_STAKE()
            )
        );
        match_.placeBetUSDC(mid, 0, 1000);
        vm.stopPrank();
    }

    function test_Revert_BetZeroAmount() public {
        uint256 mid = _openWinnerMarket();
        vm.startPrank(alice);
        vm.expectRevert(PariMatchBase.ZeroStake.selector);
        match_.placeBetUSDC(mid, 0, 0);
        vm.stopPrank();
    }

    function test_Revert_InvalidOutcome() public {
        uint256 mid = _openWinnerMarket();
        // WINNER market max outcome is 2 (0=Home 1=Draw 2=Away)
        vm.startPrank(alice);
        usdc.approve(address(match_), 100e6);
        vm.expectRevert();
        match_.placeBetUSDC(mid, 3, 100e6);
        vm.stopPrank();
    }

    function test_Revert_RouterRoleRequired() public {
        uint256 mid = _openWinnerMarket();
        vm.prank(stranger);
        vm.expectRevert();
        match_.placeBetUSDCFor(alice, mid, 0, 100e6);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 4. PARI-MUTUEL MATH — WINNER PAYOUTS
    // ═══════════════════════════════════════════════════════════════════════

    /// Scenario: all bettors on same outcome, one winner takes whole net pool.
    function test_SingleWinnerTakesEntireNetPool() public {
        uint256 mid = _openWinnerMarket();
        _stake(alice,  mid, 0, 1000e6); // wins
        _stake(bob,    mid, 1, 600e6);  // loses
        _stake(carol,  mid, 2, 400e6);  // loses

        uint256 totalPool   = 2000e6;
        uint256 fee         = (totalPool * uint256(match_.feeBps())) / 10_000;
        uint256 netPool     = totalPool - fee;

        // Capture before-balances before resolution (fee is sent at resolve time).
        uint256 feeRecipBefore = usdc.balanceOf(feeAddr);

        _closeResolve(mid, 0); // Home wins — fee transferred here

        uint256 aliceBefore = usdc.balanceOf(alice);

        vm.prank(alice);
        match_.claim(mid);

        assertEq(usdc.balanceOf(feeAddr) - feeRecipBefore, fee,     "fee to feeRecipient");
        assertEq(usdc.balanceOf(alice) - aliceBefore,      netPool, "alice gets all of net pool");
    }

    /// Scenario: two winners in the same outcome share proportionally.
    function test_TwoWinnersShareProportionally() public {
        uint256 mid = _openWinnerMarket();

        // Alice stakes 3x more than Bob on the winning outcome.
        _stake(alice,  mid, 0, 300e6);
        _stake(bob,    mid, 0, 100e6);
        _stake(carol,  mid, 1, 600e6); // loser

        uint256 totalPool = 1000e6;
        uint16 feeBps     = match_.feeBps();
        uint256 fee       = (totalPool * feeBps) / 10_000;
        uint256 netPool   = totalPool - fee;

        // Alice owns 300/400 = 75% of winning pool.
        // Bob  owns 100/400 = 25% of winning pool.
        uint256 winPool    = 400e6;
        uint256 alicePayout = (300e6 * netPool) / winPool;
        uint256 bobPayout   = (100e6 * netPool) / winPool;

        _closeResolve(mid, 0);

        uint256 aliceBefore = usdc.balanceOf(alice);
        uint256 bobBefore   = usdc.balanceOf(bob);

        vm.prank(alice); match_.claim(mid);
        vm.prank(bob);   match_.claim(mid);

        assertEq(usdc.balanceOf(alice) - aliceBefore, alicePayout, "alice proportional payout");
        assertEq(usdc.balanceOf(bob)   - bobBefore,   bobPayout,   "bob proportional payout");
    }

    /// Total payouts + fee must equal totalPool (within 1 wei per winner due to floor division).
    function test_TotalPayoutsEqualsNetPool() public {
        uint256 mid = _openWinnerMarket();
        _stake(alice, mid, 0, 333e6);
        _stake(bob,   mid, 0, 667e6);
        _stake(carol, mid, 1, 500e6);

        uint256 totalPool = 1500e6;
        uint256 fee       = (totalPool * uint256(match_.feeBps())) / 10_000;
        uint256 netPool   = totalPool - fee;

        // Capture fee-recipient balance before resolution (fee sent at resolve time).
        uint256 feeBefore = usdc.balanceOf(feeAddr);

        _closeResolve(mid, 0);

        uint256 aliceBefore = usdc.balanceOf(alice);
        uint256 bobBefore   = usdc.balanceOf(bob);

        vm.prank(alice); match_.claim(mid);
        vm.prank(bob);   match_.claim(mid);

        uint256 alicePayout = usdc.balanceOf(alice) - aliceBefore;
        uint256 bobPayout   = usdc.balanceOf(bob)   - bobBefore;
        uint256 feePaid     = usdc.balanceOf(feeAddr) - feeBefore;

        uint256 totalOut = alicePayout + bobPayout + feePaid;

        // Due to integer floor division, totalOut may be up to (winners - 1) wei less
        // than totalPool. It must never exceed it.
        assertLe(totalOut, totalPool, "cannot pay out more than totalPool");
        assertGe(totalPool - totalOut, 0);
        // At most 1 wei rounding per winner (2 winners here).
        assertLe(totalPool - totalOut, 2, "rounding remainder must be tiny");

        assertEq(feePaid, fee, "fee matches snapshot");
        // net pool distributed correctly
        assertLe(alicePayout + bobPayout, netPool);
    }

    /// Implied probability view reflects pool shares.
    function test_ImpliedProbabilityBps() public {
        uint256 mid = _openWinnerMarket();
        _stake(alice, mid, 0, 600e6); // 60% of pool
        _stake(bob,   mid, 1, 400e6); // 40% of pool

        uint256 pHome = match_.getImpliedProbabilityBps(mid, 0);
        uint256 pDraw = match_.getImpliedProbabilityBps(mid, 1);

        assertEq(pHome, 6_000); // 60%
        assertEq(pDraw, 4_000); // 40%
        assertEq(match_.getImpliedProbabilityBps(mid, 2), 0); // no bets on Away
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 5. FEE COLLECTION
    // ═══════════════════════════════════════════════════════════════════════

    function test_FeeTransferredAtResolution() public {
        uint256 mid = _openWinnerMarket();
        _stake(alice, mid, 0, 1000e6);
        _stake(bob,   mid, 1,  500e6);

        uint256 totalPool  = 1500e6;
        uint16 feeBps      = match_.feeBps(); // 200 bps = 2%
        uint256 expectedFee = (totalPool * feeBps) / 10_000;

        uint256 feeBefore = usdc.balanceOf(feeAddr);
        _closeResolve(mid, 0);

        assertEq(usdc.balanceOf(feeAddr) - feeBefore, expectedFee, "fee transferred at resolution");
    }

    function test_FeeIsZeroWhenFeeBpsIsZero() public {
        vm.prank(owner);
        match_.setFeeBps(0);

        uint256 mid = _openWinnerMarket();
        _stake(alice, mid, 0, 500e6);
        _stake(bob,   mid, 1, 500e6);

        uint256 feeBefore = usdc.balanceOf(feeAddr);
        _closeResolve(mid, 0);

        assertEq(usdc.balanceOf(feeAddr) - feeBefore, 0, "no fee when feeBps = 0");

        uint256 aliceBefore = usdc.balanceOf(alice);
        vm.prank(alice);
        match_.claim(mid);
        assertEq(usdc.balanceOf(alice) - aliceBefore, 1000e6, "winner gets full pool");
    }

    function test_FeeBpsChangeDoesNotAffectResolvedMarket() public {
        uint256 mid = _openWinnerMarket();
        _stake(alice, mid, 0, 1000e6);
        _stake(bob,   mid, 1, 1000e6);

        uint256 totalPool  = 2000e6;
        uint16 feeBpsAtResolution = match_.feeBps(); // 200
        uint256 expectedFee = (totalPool * feeBpsAtResolution) / 10_000;

        // Resolve (snaps fee bps).
        _closeResolve(mid, 0);

        // Now change fee bps — must NOT change alice's payout (snapshotted at resolution).
        vm.prank(owner);
        match_.setFeeBps(500); // raise to 5%

        uint256 aliceBefore = usdc.balanceOf(alice);
        vm.prank(alice);
        match_.claim(mid);

        uint256 expectedNetPool = totalPool - expectedFee;
        assertEq(usdc.balanceOf(alice) - aliceBefore, expectedNetPool, "payout uses snapshotted net pool");
    }

    function test_Revert_FeeBpsAboveMax() public {
        vm.prank(owner);
        vm.expectRevert(
            abi.encodeWithSelector(
                PariMatchBase.FeeBpsExceedsMax.selector,
                501,
                uint16(500)
            )
        );
        match_.setFeeBps(501);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 6. LOSING BETS
    // ═══════════════════════════════════════════════════════════════════════

    function test_LoserCannotClaim() public {
        uint256 mid = _openWinnerMarket();
        _stake(alice, mid, 0, 500e6); // Home — wins
        _stake(bob,   mid, 1, 500e6); // Draw — loses

        _closeResolve(mid, 0);

        vm.prank(bob);
        vm.expectRevert(
            abi.encodeWithSelector(PariMatchBase.NothingToClaim.selector, mid, bob)
        );
        match_.claim(mid);
    }

    function test_LoserUSDCStaysInContract() public {
        uint256 mid = _openWinnerMarket();
        _stake(alice, mid, 0, 600e6);
        _stake(bob,   mid, 1, 400e6);

        uint256 contractBefore = usdc.balanceOf(address(match_));
        _closeResolve(mid, 0);

        // Fee is taken out at resolution. Net pool stays.
        uint256 fee = (1000e6 * uint256(match_.feeBps())) / 10_000;
        assertEq(
            usdc.balanceOf(address(match_)),
            contractBefore - fee,
            "contract holds net pool after fee"
        );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 7. DOUBLE-CLAIM PREVENTION
    // ═══════════════════════════════════════════════════════════════════════

    function test_CannotClaimTwice() public {
        uint256 mid = _openWinnerMarket();
        _stake(alice, mid, 0, 500e6);
        _stake(bob,   mid, 1, 500e6);
        _closeResolve(mid, 0);

        vm.prank(alice);
        match_.claim(mid);

        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(PariMatchBase.AlreadyClaimed.selector, mid, alice)
        );
        match_.claim(mid);
    }

    function test_CannotRefundAfterAlreadyClaimed() public {
        uint256 mid = _openWinnerMarket();
        _stake(alice, mid, 0, 500e6);
        _stake(bob,   mid, 1, 500e6);

        // First cancel
        vm.prank(owner);
        match_.cancelMarket(mid, "test");

        vm.prank(alice);
        match_.claimRefund(mid);

        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(PariMatchBase.AlreadyClaimed.selector, mid, alice)
        );
        match_.claimRefund(mid);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 8. MARKET CANCELLATION — FULL REFUND
    // ═══════════════════════════════════════════════════════════════════════

    function test_AdminCancelFullRefund() public {
        uint256 mid = _openWinnerMarket();
        _stake(alice, mid, 0, 700e6);
        _stake(bob,   mid, 1, 300e6);

        _closeCancel(mid);

        uint256 aliceBefore = usdc.balanceOf(alice);
        uint256 bobBefore   = usdc.balanceOf(bob);

        vm.prank(alice); match_.claimRefund(mid);
        vm.prank(bob);   match_.claimRefund(mid);

        assertEq(usdc.balanceOf(alice) - aliceBefore, 700e6, "alice full refund");
        assertEq(usdc.balanceOf(bob)   - bobBefore,   300e6, "bob full refund");
        assertEq(usdc.balanceOf(feeAddr), 0, "no fee on cancel");
    }

    function test_RefundAfterCancelFromOpenState() public {
        uint256 mid = _openWinnerMarket();
        _stake(alice, mid, 0, 500e6);

        // Cancel directly from Open (before closing).
        vm.prank(owner);
        match_.cancelMarket(mid, "postponed");

        uint256 before = usdc.balanceOf(alice);
        vm.prank(alice);
        match_.claimRefund(mid);
        assertEq(usdc.balanceOf(alice) - before, 500e6);
    }

    function test_Revert_ClaimRefundOnResolvedMarket() public {
        uint256 mid = _openWinnerMarket();
        _stake(alice, mid, 0, 500e6);
        _stake(bob,   mid, 1, 500e6);
        _closeResolve(mid, 0);

        vm.prank(alice);
        vm.expectRevert(); // state must be Cancelled
        match_.claimRefund(mid);
    }

    function test_Revert_NothingToRefund() public {
        uint256 mid = _openWinnerMarket();
        _stake(alice, mid, 0, 500e6);
        _closeCancel(mid);

        vm.prank(carol); // carol never staked
        vm.expectRevert(
            abi.encodeWithSelector(PariMatchBase.NothingToRefund.selector, mid, carol)
        );
        match_.claimRefund(mid);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 9. VOID MARKET — AUTO-CANCEL WHEN NO WINNING BETS
    // ═══════════════════════════════════════════════════════════════════════

    function test_VoidMarketAutoCancelsWithFullRefund() public {
        uint256 mid = _openWinnerMarket();
        // Everyone bets on Home (0) and Draw (1). Nobody bets Away (2).
        _stake(alice, mid, 0, 400e6);
        _stake(bob,   mid, 1, 600e6);

        // Oracle resolves with Away (2) — nobody bet on it.
        vm.prank(owner);
        match_.closeMarket(mid);
        vm.prank(oracle);
        match_.resolveMarket(mid, 2); // triggers auto-cancel

        (, PariMatchBase.MarketState state,,,) = match_.getMarketInfo(mid);
        assertEq(uint8(state), uint8(PariMatchBase.MarketState.Cancelled), "auto-cancelled");

        // No fee should have been taken.
        assertEq(usdc.balanceOf(feeAddr), 0, "no fee on void market");

        // Full refunds available.
        uint256 aBefore = usdc.balanceOf(alice);
        uint256 bBefore = usdc.balanceOf(bob);

        vm.prank(alice); match_.claimRefund(mid);
        vm.prank(bob);   match_.claimRefund(mid);

        assertEq(usdc.balanceOf(alice) - aBefore, 400e6, "alice full refund on void");
        assertEq(usdc.balanceOf(bob)   - bBefore, 600e6, "bob full refund on void");
    }

    function test_VoidMarket_ClaimReverts() public {
        uint256 mid = _openWinnerMarket();
        _stake(alice, mid, 0, 500e6);

        vm.prank(owner);
        match_.closeMarket(mid);
        vm.prank(oracle);
        match_.resolveMarket(mid, 2); // void — auto-cancels

        // claim() requires Resolved state, but market is now Cancelled.
        vm.prank(alice);
        vm.expectRevert();
        match_.claim(mid);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 10. MULTI-OUTCOME STAKING
    // ═══════════════════════════════════════════════════════════════════════

    function test_UserBetsOnMultipleOutcomes_WinsOnOne() public {
        uint256 mid = _openWinnerMarket();

        // Alice bets on Home AND Draw.
        _stake(alice, mid, 0, 300e6); // Home — will win
        _stake(alice, mid, 1, 200e6); // Draw — will lose

        _stake(bob,   mid, 2, 500e6); // Away — loses

        uint256 totalPool = 1000e6;
        uint16  feeBps    = match_.feeBps();
        uint256 fee       = (totalPool * feeBps) / 10_000;
        uint256 netPool   = totalPool - fee;

        // Alice's entire winning pool = 300e6 (only hers).
        uint256 expectedPayout = (300e6 * netPool) / 300e6; // = netPool

        _closeResolve(mid, 0);

        uint256 before = usdc.balanceOf(alice);
        vm.prank(alice);
        match_.claim(mid);

        assertEq(usdc.balanceOf(alice) - before, expectedPayout,
            "alice gets payout based on winning stake only");
        assertEq(usdc.balanceOf(alice) - before, netPool,
            "since alice is only winner she gets entire net pool");
    }

    function test_UserTotalStakeIncludesAllOutcomes() public {
        uint256 mid = _openWinnerMarket();
        _stake(alice, mid, 0, 300e6);
        _stake(alice, mid, 1, 200e6);
        _stake(alice, mid, 2, 100e6);

        assertEq(match_.getUserTotalStake(mid, alice), 600e6);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 11. BATCH CLAIMS
    // ═══════════════════════════════════════════════════════════════════════

    function test_ClaimBatchMultipleMarkets() public {
        // Market 0
        vm.startPrank(owner);
        match_.addMarketWithLine(MARKET_WINNER, 0);
        match_.openMarket(0);
        vm.stopPrank();
        _stake(alice, 0, 0, 500e6);
        _stake(bob,   0, 1, 500e6);

        // Market 1
        vm.startPrank(owner);
        match_.addMarketWithLine(MARKET_GOALS_TOTAL, 0);
        match_.openMarket(1);
        vm.stopPrank();
        _stake(alice, 1, 1, 300e6); // Over
        _stake(carol, 1, 0, 700e6); // Under

        // Resolve both.
        vm.prank(owner); match_.closeMarket(0);
        vm.prank(oracle); match_.resolveMarket(0, 0); // Home wins

        vm.prank(owner); match_.closeMarket(1);
        vm.prank(oracle); match_.resolveMarket(1, 1); // Over wins

        uint256 before = usdc.balanceOf(alice);

        uint256[] memory mids = new uint256[](2);
        mids[0] = 0; mids[1] = 1;
        vm.prank(alice);
        match_.claimBatch(mids);

        assertGt(usdc.balanceOf(alice), before, "alice received payouts from both markets");
        assertTrue(match_.hasClaimed(0, alice));
        assertTrue(match_.hasClaimed(1, alice));
    }

    function test_ClaimBatchSkipsNonResolved() public {
        vm.startPrank(owner);
        match_.addMarketWithLine(MARKET_WINNER, 0);
        match_.openMarket(0);
        vm.stopPrank();
        _stake(alice, 0, 0, 500e6);
        // market 0 not resolved yet

        uint256 before = usdc.balanceOf(alice);
        uint256[] memory mids = new uint256[](1);
        mids[0] = 0;
        vm.prank(alice);
        match_.claimBatch(mids); // should not revert, just skip

        assertEq(usdc.balanceOf(alice), before, "no payout from unresolved market");
    }

    function test_RefundBatchMultipleMarkets() public {
        vm.startPrank(owner);
        match_.addMarketWithLine(MARKET_WINNER, 0);
        match_.addMarketWithLine(MARKET_GOALS_TOTAL, 0);
        vm.stopPrank();

        vm.startPrank(owner);
        match_.openMarket(0);
        match_.openMarket(1);
        vm.stopPrank();

        _stake(alice, 0, 0, 400e6);
        _stake(alice, 1, 1, 200e6);

        vm.startPrank(owner);
        match_.cancelMarket(0, "cancelled");
        match_.cancelMarket(1, "cancelled");
        vm.stopPrank();

        uint256 before = usdc.balanceOf(alice);
        uint256[] memory mids = new uint256[](2);
        mids[0] = 0; mids[1] = 1;
        vm.prank(alice);
        match_.claimRefundBatch(mids);

        assertEq(usdc.balanceOf(alice) - before, 600e6, "full refund from both cancelled markets");
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 12. ACCESS CONTROL
    // ═══════════════════════════════════════════════════════════════════════

    function test_Revert_OnlyAdminCanOpenMarket() public {
        vm.prank(owner);
        match_.addMarketWithLine(MARKET_WINNER, 0);

        vm.prank(stranger);
        vm.expectRevert();
        match_.openMarket(0);
    }

    function test_Revert_OnlyAdminCanCloseMarket() public {
        uint256 mid = _openWinnerMarket();
        vm.prank(stranger);
        vm.expectRevert();
        match_.closeMarket(mid);
    }

    function test_Revert_OnlyAdminCanCancelMarket() public {
        uint256 mid = _openWinnerMarket();
        vm.prank(stranger);
        vm.expectRevert();
        match_.cancelMarket(mid, "bad");
    }

    function test_Revert_OnlyResolverCanResolve() public {
        uint256 mid = _openWinnerMarket();
        vm.prank(owner);
        match_.closeMarket(mid);

        vm.prank(stranger);
        vm.expectRevert();
        match_.resolveMarket(mid, 0);
    }

    function test_Revert_OnlyAdminCanSetFeeRecipient() public {
        vm.prank(stranger);
        vm.expectRevert();
        match_.setFeeRecipient(address(0x999));
    }

    function test_Revert_OnlyAdminCanSetFeeBps() public {
        vm.prank(stranger);
        vm.expectRevert();
        match_.setFeeBps(100);
    }

    function test_AdminCanPause() public {
        vm.prank(owner);
        match_.emergencyPause();

        uint256 mid = _openWinnerMarket();
        vm.startPrank(alice);
        usdc.approve(address(match_), 100e6);
        vm.expectRevert();
        match_.placeBetUSDC(mid, 0, 100e6);
        vm.stopPrank();
    }

    function test_AdminCanUnpause() public {
        vm.prank(owner);
        match_.emergencyPause();
        vm.prank(owner);
        match_.unpause();

        uint256 mid = _openWinnerMarket();
        _stake(alice, mid, 0, 100e6); // should succeed
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 13. FACTORY
    // ═══════════════════════════════════════════════════════════════════════

    function test_FactoryDeployAndWire() public {
        factory.setWiring(address(usdc), feeAddr, swapRouter);

        address proxy = factory.createFootballMatch("PSG vs Monaco", owner, oracle);

        assertTrue(factory.isMatch(proxy));
        assertEq(factory.allMatches(0), proxy);
        assertEq(uint8(factory.matchSportType(proxy)), uint8(PariMatchFactory.SportType.FOOTBALL));
    }

    function test_FactoryMatchHasCorrectRoles() public {
        factory.setWiring(address(usdc), feeAddr, swapRouter);
        address proxy = factory.createFootballMatch("Lyon vs Nice", owner, oracle);

        FootballPariMatch m = FootballPariMatch(payable(proxy));

        assertTrue(m.hasRole(RESOLVER_ROLE,    oracle),      "oracle has resolver");
        assertTrue(m.hasRole(SWAP_ROUTER_ROLE, swapRouter),  "swapRouter has role");
        assertTrue(m.hasRole(ADMIN_ROLE,       owner),       "owner has admin");
        assertFalse(m.hasRole(ADMIN_ROLE, address(factory)), "factory renounced");
    }

    function test_FactoryDeployBasketball() public {
        factory.setWiring(address(usdc), feeAddr, swapRouter);
        address proxy = factory.createBasketballMatch("Lakers vs Celtics", owner, oracle);

        assertTrue(factory.isMatch(proxy));
        assertEq(uint8(factory.matchSportType(proxy)), uint8(PariMatchFactory.SportType.BASKETBALL));
    }

    function test_FactoryIsMatchReturnsFalseForArbitraryAddress() public {
        assertFalse(factory.isMatch(address(0x1234)));
    }

    function test_Revert_FactoryNotWired() public {
        vm.expectRevert(PariMatchFactory.WiringNotConfigured.selector);
        factory.createFootballMatch("Test", owner, oracle);
    }

    function test_Revert_FactoryOnlyOwner() public {
        factory.setWiring(address(usdc), feeAddr, swapRouter);
        vm.prank(stranger);
        vm.expectRevert();
        factory.createFootballMatch("Test", owner, oracle);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 14. BASKETBALL SPORT-SPECIFIC
    // ═══════════════════════════════════════════════════════════════════════

    function test_BasketballWinnerMarket() public {
        bytes32 BBALL_WINNER = keccak256("WINNER");

        vm.prank(owner);
        bball.addMarketWithLine(BBALL_WINNER, 0);

        vm.prank(owner);
        bball.openMarket(0);

        usdc.mint(alice, 100e6);
        vm.startPrank(alice);
        usdc.approve(address(bball), 500e6);
        bball.placeBetUSDC(0, 0, 500e6); // Home
        vm.stopPrank();

        usdc.mint(bob, 100e6);
        vm.startPrank(bob);
        usdc.approve(address(bball), 500e6);
        bball.placeBetUSDC(0, 1, 500e6); // Away
        vm.stopPrank();

        vm.prank(owner); bball.closeMarket(0);
        vm.prank(oracle); bball.resolveMarket(0, 0); // Home wins

        uint256 before = usdc.balanceOf(alice);
        vm.prank(alice);
        bball.claim(0);

        assertGt(usdc.balanceOf(alice) - before, 0, "alice wins");
    }

    function test_BasketballInvalidOutcomeForWinner() public {
        bytes32 BBALL_WINNER = keccak256("WINNER");

        vm.prank(owner);
        bball.addMarketWithLine(BBALL_WINNER, 0);
        vm.prank(owner);
        bball.openMarket(0);

        // Basketball WINNER is binary: 0=Home, 1=Away. Outcome 2 is invalid.
        vm.startPrank(alice);
        usdc.approve(address(bball), 100e6);
        vm.expectRevert();
        bball.placeBetUSDC(0, 2, 100e6);
        vm.stopPrank();
    }

    function test_BasketballHighestQuarterMarket() public {
        bytes32 HIGHEST_QUARTER = keccak256("HIGHEST_QUARTER");

        vm.prank(owner);
        bball.addMarketWithLine(HIGHEST_QUARTER, 0);

        (, , , , uint256 outcomes) = bball.getMarketInfo(0);
        assertEq(outcomes, 4); // Q1=0 / Q2=1 / Q3=2 / Q4=3
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 15. FUZZ — PAYOUT INVARIANT
    // ═══════════════════════════════════════════════════════════════════════

    /// Invariant: totalPayouts + fee <= totalPool, and the gap is at most
    ///            (numWinners) wei due to integer floor division.
    function testFuzz_PayoutInvariant(
        uint64 aliceStake,
        uint64 bobStake,
        uint64 carolStake
    ) public {
        // Bound to [MIN_STAKE, 10_000 USDC] per staker.
        uint256 minS = PariMatchBase(address(match_)).MIN_STAKE();
        uint256 a = bound(aliceStake, minS, 10_000e6);
        uint256 b = bound(bobStake,   minS, 10_000e6);
        uint256 c = bound(carolStake, minS, 10_000e6);

        usdc.mint(alice, a);
        usdc.mint(bob,   b);
        usdc.mint(carol, c);

        uint256 mid = _openWinnerMarket();

        // Alice and Bob both on Home (0). Carol on Away (2).
        _stake(alice, mid, 0, a);
        _stake(bob,   mid, 0, b);
        _stake(carol, mid, 2, c);

        uint256 totalPool = a + b + c;
        uint16  feeBps    = match_.feeBps();
        uint256 fee       = (totalPool * feeBps) / 10_000;
        uint256 netPool   = totalPool - fee;

        uint256 feeBefore   = usdc.balanceOf(feeAddr);
        uint256 aliceBefore = usdc.balanceOf(alice);
        uint256 bobBefore   = usdc.balanceOf(bob);

        _closeResolve(mid, 0); // Home wins

        vm.prank(alice); match_.claim(mid);
        vm.prank(bob);   match_.claim(mid);

        uint256 feePaid    = usdc.balanceOf(feeAddr) - feeBefore;
        uint256 aliceOut   = usdc.balanceOf(alice)   - aliceBefore;
        uint256 bobOut     = usdc.balanceOf(bob)     - bobBefore;
        uint256 totalOut   = feePaid + aliceOut + bobOut;

        // Never pays out more than deposited.
        assertLe(totalOut, totalPool, "cannot overpay");
        assertEq(feePaid, fee, "fee invariant");
        // Rounding gap: at most 1 wei per winner (2 winners here).
        assertLe(totalPool - totalOut, 2, "rounding gap max 2 wei");
        // Net pool perfectly distributed.
        assertLe(aliceOut + bobOut, netPool, "winners share le netPool");
    }

    function testFuzz_SingleWinnerGetsEntireNetPool(uint64 winStake, uint64 loseStake) public {
        uint256 minS = PariMatchBase(address(match_)).MIN_STAKE();
        uint256 w = bound(winStake,  minS, 5_000e6);
        uint256 l = bound(loseStake, minS, 5_000e6);

        usdc.mint(alice, w);
        usdc.mint(bob,   l);

        uint256 mid = _openWinnerMarket();
        _stake(alice, mid, 0, w);
        _stake(bob,   mid, 1, l);

        uint256 totalPool = w + l;
        uint16  feeBps    = match_.feeBps();
        uint256 expectedFee  = (totalPool * feeBps) / 10_000;
        uint256 expectedNet  = totalPool - expectedFee;

        _closeResolve(mid, 0);

        uint256 before = usdc.balanceOf(alice);
        vm.prank(alice);
        match_.claim(mid);

        assertEq(usdc.balanceOf(alice) - before, expectedNet,
            "single winner gets entire net pool");
    }

    function testFuzz_CancelFullRefund(uint64 aliceS, uint64 bobS) public {
        uint256 minS = PariMatchBase(address(match_)).MIN_STAKE();
        uint256 a = bound(aliceS, minS, 5_000e6);
        uint256 b = bound(bobS,   minS, 5_000e6);

        usdc.mint(alice, a);
        usdc.mint(bob,   b);

        uint256 mid = _openWinnerMarket();
        _stake(alice, mid, 0, a);
        _stake(bob,   mid, 1, b);

        _closeCancel(mid);

        uint256 aBefore = usdc.balanceOf(alice);
        uint256 bBefore = usdc.balanceOf(bob);

        vm.prank(alice); match_.claimRefund(mid);
        vm.prank(bob);   match_.claimRefund(mid);

        assertEq(usdc.balanceOf(alice) - aBefore, a, "alice full refund");
        assertEq(usdc.balanceOf(bob)   - bBefore, b, "bob full refund");
        assertEq(usdc.balanceOf(feeAddr), 0,         "no fee on cancel");
    }
}
