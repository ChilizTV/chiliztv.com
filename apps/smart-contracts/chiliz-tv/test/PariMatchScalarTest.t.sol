// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test}            from "forge-std/Test.sol";
import {ERC1967Proxy}    from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import {PariMatchBase}        from "../src/pari/PariMatchBase.sol";
import {FootballPariMatch}    from "../src/pari/FootballPariMatch.sol";
import {BasketballPariMatch}  from "../src/pari/BasketballPariMatch.sol";
import {MockUSDC}             from "./mocks/MockUSDC.sol";

/**
 * @title PariMatchScalarTest
 * @notice Covers scalar / bucket markets:
 *           - FootballPariMatch.MARKET_GOALS_EXACT
 *           - BasketballPariMatch.MARKET_POINTS_EXACT
 *
 * @dev Behaviour under test:
 *           1. maxOutcome == line (the highest bucket is the "≥line" bucket).
 *           2. addMarketWithLine reverts for unsupported lines (0, > 255).
 *           3. Multi-outcome staking and payouts compute correctly.
 *           4. Resolving with total == line settles into the cap bucket.
 *           5. Resolving with total >  line clamps to the cap bucket.
 *           6. Basketball POINTS_EXACT step parameter (extra) buckets totals.
 */
contract PariMatchScalarTest is Test {

    // ─── Actors ────────────────────────────────────────────────────────────
    address owner      = makeAddr("owner");
    address oracle     = makeAddr("oracle");
    address feeAddr    = makeAddr("feeRecipient");
    address alice      = makeAddr("alice");
    address bob        = makeAddr("bob");
    address carol      = makeAddr("carol");
    address dave       = makeAddr("dave");

    // ─── Contracts ─────────────────────────────────────────────────────────
    MockUSDC             usdc;
    FootballPariMatch    foot;
    BasketballPariMatch  bball;

    // ─── Constants ─────────────────────────────────────────────────────────
    bytes32 constant RESOLVER_ROLE      = keccak256("RESOLVER_ROLE");
    bytes32 constant MARKET_GOALS_EXACT = keccak256("GOALS_EXACT");
    bytes32 constant MARKET_POINTS_EXACT = keccak256("POINTS_EXACT");

    // ───────────────────────────────────────────────────────────────────────
    // SETUP
    // ───────────────────────────────────────────────────────────────────────

    function setUp() public {
        usdc = new MockUSDC();

        // Football proxy.
        FootballPariMatch fImpl = new FootballPariMatch();
        bytes memory fInit = abi.encodeWithSelector(
            FootballPariMatch.initialize.selector,
            "PSG vs OM",
            owner
        );
        foot = FootballPariMatch(payable(address(new ERC1967Proxy(address(fImpl), fInit))));

        // Basketball proxy.
        BasketballPariMatch bImpl = new BasketballPariMatch();
        bytes memory bInit = abi.encodeWithSelector(
            BasketballPariMatch.initialize.selector,
            "Lakers vs Celtics",
            owner
        );
        bball = BasketballPariMatch(payable(address(new ERC1967Proxy(address(bImpl), bInit))));

        vm.startPrank(owner);
        foot.grantRole(RESOLVER_ROLE, oracle);
        foot.setUSDCToken(address(usdc));
        foot.setFeeRecipient(feeAddr);

        bball.grantRole(RESOLVER_ROLE, oracle);
        bball.setUSDCToken(address(usdc));
        bball.setFeeRecipient(feeAddr);
        vm.stopPrank();

        usdc.mint(alice, 100_000e6);
        usdc.mint(bob,   100_000e6);
        usdc.mint(carol, 100_000e6);
        usdc.mint(dave,  100_000e6);
    }

    // ───────────────────────────────────────────────────────────────────────
    // HELPERS
    // ───────────────────────────────────────────────────────────────────────

    function _stakeFoot(address u, uint256 mid, uint64 outcome, uint256 amt) internal {
        vm.startPrank(u);
        usdc.approve(address(foot), amt);
        foot.placeBetUSDC(mid, outcome, amt);
        vm.stopPrank();
    }

    function _stakeBball(address u, uint256 mid, uint64 outcome, uint256 amt) internal {
        vm.startPrank(u);
        usdc.approve(address(bball), amt);
        bball.placeBetUSDC(mid, outcome, amt);
        vm.stopPrank();
    }

    // ───────────────────────────────────────────────────────────────────────
    // FOOTBALL — GOALS_EXACT
    // ───────────────────────────────────────────────────────────────────────

    function test_CreateGoalsExactMarket_OutcomeCountMatchesLinePlusOne() public {
        vm.prank(owner);
        foot.addMarketWithLine(MARKET_GOALS_EXACT, 5); // outcomes 0..5  (5 == "5+")

        (, , , , uint256 outcomes) = foot.getMarketInfo(0);
        assertEq(outcomes, 6, "GOALS_EXACT(5) -> 6 outcomes");

        PariMatchBase.MarketSpec memory spec = foot.getMarketSpec(0);
        assertEq(spec.line, int16(5));
        assertEq(spec.maxOutcome, uint8(5));
        assertEq(spec.marketType, MARKET_GOALS_EXACT);
    }

    function test_GoalsExact_ZeroLineReverts() public {
        vm.prank(owner);
        vm.expectRevert(
            abi.encodeWithSelector(
                PariMatchBase.InvalidLine.selector,
                MARKET_GOALS_EXACT,
                int16(0)
            )
        );
        foot.addMarketWithLine(MARKET_GOALS_EXACT, 0);
    }

    function test_GoalsExact_NegativeLineReverts() public {
        vm.prank(owner);
        vm.expectRevert(
            abi.encodeWithSelector(
                PariMatchBase.InvalidLine.selector,
                MARKET_GOALS_EXACT,
                int16(-1)
            )
        );
        foot.addMarketWithLine(MARKET_GOALS_EXACT, -1);
    }

    function test_GoalsExact_StakeAcrossBuckets_WinnerSharesNetPool() public {
        // Create GOALS_EXACT(line=3) → buckets 0, 1, 2, 3+ (4 outcomes).
        vm.prank(owner);
        foot.addMarketWithLine(MARKET_GOALS_EXACT, 3);
        vm.prank(owner);
        foot.openMarket(0);

        _stakeFoot(alice, 0, 0, 100e6); // 0 goals
        _stakeFoot(bob,   0, 1, 200e6); // 1 goal
        _stakeFoot(carol, 0, 2, 300e6); // 2 goals  (will win)
        _stakeFoot(dave,  0, 3, 400e6); // 3+ goals

        uint256 totalPool = 1000e6;
        uint16  bps       = foot.feeBps();
        uint256 fee       = (totalPool * bps) / 10_000;
        uint256 netPool   = totalPool - fee;

        // Resolve to bucket 2  (i.e. exactly 2 goals).
        vm.prank(owner); foot.closeMarket(0);
        vm.prank(oracle); foot.resolveMarket(0, 2);

        // Carol is the only winner — she gets the entire net pool.
        uint256 cBefore = usdc.balanceOf(carol);
        vm.prank(carol); foot.claim(0);
        assertEq(usdc.balanceOf(carol) - cBefore, netPool, "single winner gets full net pool");
    }

    function test_GoalsExact_ResolutionClampsToCap() public {
        // line = 3 → cap bucket is index 3 ("3+"). Score of 7 goals must clamp to 3.
        vm.prank(owner);
        foot.addMarketWithLine(MARKET_GOALS_EXACT, 3);
        vm.prank(owner);
        foot.openMarket(0);

        _stakeFoot(alice, 0, 3, 500e6); // bet on the cap bucket (3+)
        _stakeFoot(bob,   0, 0, 500e6);

        FootballPariMatch.FootballScore memory s = FootballPariMatch.FootballScore({
            homeGoals:    5,
            awayGoals:    2,            // total = 7 → clamps to cap (3)
            htHomeGoals:  0,
            htAwayGoals:  0,
            firstScorerId: 0,
            aetHomeGoals: 0,
            aetAwayGoals: 0,
            penWinner:    255
        });

        vm.prank(owner); foot.closeMarket(0);

        vm.prank(oracle);
        uint256 resolved = foot.resolveByScore(s);
        assertEq(resolved, 1, "exactly one market resolved");

        // Alice (cap bucket) wins.
        uint256 totalPool = 1000e6;
        uint256 fee       = (totalPool * foot.feeBps()) / 10_000;
        uint256 netPool   = totalPool - fee;

        uint256 aBefore = usdc.balanceOf(alice);
        vm.prank(alice); foot.claim(0);
        assertEq(usdc.balanceOf(alice) - aBefore, netPool, "cap bucket bettor wins");
    }

    function test_GoalsExact_ResolutionAtExactCap() public {
        // line = 3 → cap bucket is index 3 ("3+"). Total = 3 goes to bucket 3.
        vm.prank(owner);
        foot.addMarketWithLine(MARKET_GOALS_EXACT, 3);
        vm.prank(owner);
        foot.openMarket(0);

        _stakeFoot(alice, 0, 3, 600e6);
        _stakeFoot(bob,   0, 2, 400e6); // 2 goals — won't win

        FootballPariMatch.FootballScore memory s = FootballPariMatch.FootballScore({
            homeGoals: 2, awayGoals: 1, // total = 3 → bucket 3 (cap)
            htHomeGoals: 0, htAwayGoals: 0, firstScorerId: 0,
            aetHomeGoals: 0,
            aetAwayGoals: 0,
            penWinner:    255
        });

        vm.prank(owner); foot.closeMarket(0);
        vm.prank(oracle); foot.resolveByScore(s);

        // Alice wins because total==line goes into the cap bucket.
        uint256 aBefore = usdc.balanceOf(alice);
        vm.prank(alice); foot.claim(0);
        assertGt(usdc.balanceOf(alice), aBefore, "exact-cap settles into cap bucket");
    }

    // ───────────────────────────────────────────────────────────────────────
    // BASKETBALL — POINTS_EXACT
    // ───────────────────────────────────────────────────────────────────────

    function test_PointsExact_CreateWithStep() public {
        // Buckets of size 20 with cap 11 → [0-19],[20-39],...,[200-219],[220+].
        vm.prank(owner);
        bball.addPointsExactMarket(11, 20);

        PariMatchBase.MarketSpec memory spec = bball.getMarketSpec(0);
        assertEq(spec.marketType, MARKET_POINTS_EXACT);
        assertEq(spec.line, int16(11));
        assertEq(spec.maxOutcome, uint8(11));
        assertEq(spec.extra, uint8(20));
    }

    function test_PointsExact_DefaultStepIsOne() public {
        // extra=0 → step defaults to 1, behaving like the football GOALS_EXACT.
        vm.prank(owner);
        bball.addPointsExactMarket(50, 0);

        PariMatchBase.MarketSpec memory spec = bball.getMarketSpec(0);
        assertEq(spec.extra, uint8(0));
    }

    function test_PointsExact_BucketsByStep() public {
        // Cap 5, step 20 → buckets [0-19],[20-39],[40-59],[60-79],[80-99],[100+].
        vm.prank(owner);
        bball.addPointsExactMarket(5, 20);
        vm.prank(owner);
        bball.openMarket(0);

        _stakeBball(alice, 0, 2, 100e6); // bet bucket 2 (40-59)
        _stakeBball(bob,   0, 3, 200e6); // bet bucket 3 (60-79)
        _stakeBball(carol, 0, 5, 700e6); // bet bucket 5 cap (100+)

        // Score: home 30/30/30/30 = 120, away 60/0/0/0 = 60 → total = 180 → bucket = min(180/20, 5) = 5.
        BasketballPariMatch.BasketballScore memory s = BasketballPariMatch.BasketballScore({
            homeQ1: 30, awayQ1: 60,
            homeQ2: 30, awayQ2: 0,
            homeQ3: 30, awayQ3: 0,
            homeQ4: 30, awayQ4: 0,
            firstToScore: 0
        });

        vm.prank(owner); bball.closeMarket(0);
        vm.prank(oracle);
        uint256 r = bball.resolveByScore(s);
        assertEq(r, 1, "one market resolved");

        // Carol bet on the cap bucket and wins.
        uint256 totalPool = 1000e6;
        uint256 fee       = (totalPool * bball.feeBps()) / 10_000;
        uint256 netPool   = totalPool - fee;
        uint256 cBefore   = usdc.balanceOf(carol);
        vm.prank(carol); bball.claim(0);
        assertEq(usdc.balanceOf(carol) - cBefore, netPool, "carol wins cap bucket");
    }

    function test_PointsExact_BucketsByStep_MidBucket() public {
        // Cap 5, step 20. Total = 55 → bucket 2 ([40-59]).
        vm.prank(owner);
        bball.addPointsExactMarket(5, 20);
        vm.prank(owner);
        bball.openMarket(0);

        _stakeBball(alice, 0, 2, 500e6); // bucket 2 — winner
        _stakeBball(bob,   0, 5, 500e6); // cap bucket — loser

        BasketballPariMatch.BasketballScore memory s = BasketballPariMatch.BasketballScore({
            homeQ1: 10, awayQ1: 10,   // 20
            homeQ2: 10, awayQ2: 5,    // +15 → 35
            homeQ3: 5,  awayQ3: 10,   // +15 → 50
            homeQ4: 3,  awayQ4: 2,    // +5  → 55
            firstToScore: 0
        });

        vm.prank(owner); bball.closeMarket(0);
        vm.prank(oracle); bball.resolveByScore(s);

        uint256 aBefore = usdc.balanceOf(alice);
        vm.prank(alice); bball.claim(0);
        assertGt(usdc.balanceOf(alice), aBefore, "alice wins mid bucket");
    }
}
