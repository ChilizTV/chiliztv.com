// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test}            from "forge-std/Test.sol";
import {ERC1967Proxy}    from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import {PariMatchBase}        from "../src/pari/PariMatchBase.sol";
import {FootballPariMatch}    from "../src/pari/FootballPariMatch.sol";
import {BasketballPariMatch}  from "../src/pari/BasketballPariMatch.sol";
import {MockUSDC}             from "./mocks/MockUSDC.sol";

/**
 * @title PariMatchResolveByScoreTest
 * @notice Coverage for the new oracle entrypoints `resolveByScore` and
 *         `resolveBatchByScore` on both sport contracts.
 *
 * @dev    The objective is to verify that one signed result blob (a typed
 *         score struct) correctly settles every Closed market on the match.
 *
 *         Football scenarios:
 *           - WINNER / GOALS_TOTAL / BOTH_SCORE / HALFTIME / CORRECT_SCORE /
 *             FIRST_SCORER / GOALS_EXACT all resolve from a single
 *             FootballScore input.
 *           - FIRST_SCORER is skipped when firstScorerId == 0.
 *           - Non-Closed markets are skipped.
 *           - Access control: only RESOLVER_ROLE.
 *
 *         Basketball scenarios:
 *           - WINNER / TOTAL_POINTS / SPREAD / QUARTER_WINNER /
 *             FIRST_TO_SCORE / HIGHEST_QUARTER / POINTS_EXACT resolve from a
 *             BasketballScore input.
 *           - Ties on WINNER / QUARTER_WINNER / SPREAD (push) and ties at
 *             the top of HIGHEST_QUARTER are skipped.
 *           - FIRST_TO_SCORE is skipped when firstToScore == 0.
 */
contract PariMatchResolveByScoreTest is Test {

    // ─── Actors ────────────────────────────────────────────────────────────
    address owner    = makeAddr("owner");
    address oracle   = makeAddr("oracle");
    address feeAddr  = makeAddr("feeRecipient");
    address stranger = makeAddr("stranger");
    address alice    = makeAddr("alice");
    address bob      = makeAddr("bob");
    address carol    = makeAddr("carol");

    // ─── Contracts ─────────────────────────────────────────────────────────
    MockUSDC             usdc;
    FootballPariMatch    foot;
    BasketballPariMatch  bball;

    // ─── Roles / types ─────────────────────────────────────────────────────
    bytes32 constant RESOLVER_ROLE  = keccak256("RESOLVER_ROLE");

    bytes32 constant F_WINNER       = keccak256("WINNER");
    bytes32 constant F_GOALS_TOTAL  = keccak256("GOALS_TOTAL");
    bytes32 constant F_BOTH_SCORE   = keccak256("BOTH_SCORE");
    bytes32 constant F_HALFTIME     = keccak256("HALFTIME");
    bytes32 constant F_CORRECT      = keccak256("CORRECT_SCORE");
    bytes32 constant F_FIRST_SCORER = keccak256("FIRST_SCORER");
    bytes32 constant F_GOALS_EXACT  = keccak256("GOALS_EXACT");
    bytes32 constant F_DOUBLE_CHANCE = keccak256("DOUBLE_CHANCE");

    bytes32 constant B_WINNER          = keccak256("WINNER");
    bytes32 constant B_TOTAL_POINTS    = keccak256("TOTAL_POINTS");
    bytes32 constant B_SPREAD          = keccak256("SPREAD");
    bytes32 constant B_QUARTER_WINNER  = keccak256("QUARTER_WINNER");
    bytes32 constant B_FIRST_TO_SCORE  = keccak256("FIRST_TO_SCORE");
    bytes32 constant B_HIGHEST_QUARTER = keccak256("HIGHEST_QUARTER");
    bytes32 constant B_POINTS_EXACT    = keccak256("POINTS_EXACT");

    // ───────────────────────────────────────────────────────────────────────
    // SETUP
    // ───────────────────────────────────────────────────────────────────────

    function setUp() public {
        usdc = new MockUSDC();

        FootballPariMatch fImpl = new FootballPariMatch();
        foot = FootballPariMatch(payable(address(new ERC1967Proxy(
            address(fImpl),
            abi.encodeWithSelector(FootballPariMatch.initialize.selector, "PSG vs OM", owner)
        ))));

        BasketballPariMatch bImpl = new BasketballPariMatch();
        bball = BasketballPariMatch(payable(address(new ERC1967Proxy(
            address(bImpl),
            abi.encodeWithSelector(BasketballPariMatch.initialize.selector, "Lakers vs Celtics", owner)
        ))));

        vm.startPrank(owner);
        foot.grantRole(RESOLVER_ROLE, oracle);
        foot.setUSDCToken(address(usdc));
        foot.setFeeRecipient(feeAddr);

        bball.grantRole(RESOLVER_ROLE, oracle);
        bball.setUSDCToken(address(usdc));
        bball.setFeeRecipient(feeAddr);
        vm.stopPrank();

        usdc.mint(alice, 200_000e6);
        usdc.mint(bob,   200_000e6);
        usdc.mint(carol, 200_000e6);
    }

    // ───────────────────────────────────────────────────────────────────────
    // HELPERS
    // ───────────────────────────────────────────────────────────────────────

    function _addAndOpenFoot(bytes32 t, int16 line) internal returns (uint256 id) {
        vm.prank(owner);
        id = foot.addMarketWithLine(t, line);
        vm.prank(owner); foot.openMarket(id);
    }

    function _addAndOpenBball(bytes32 t, int16 line) internal returns (uint256 id) {
        vm.prank(owner);
        id = bball.addMarketWithLine(t, line);
        vm.prank(owner); bball.openMarket(id);
    }

    function _addQuarterBballMarket(bytes32 t, uint8 quarter) internal returns (uint256 id) {
        vm.prank(owner);
        id = bball.addQuarterMarket(t, 0, quarter);
        vm.prank(owner); bball.openMarket(id);
    }

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

    function _footMarketResult(uint256 mid) internal view returns (uint64) {
        PariMatchBase.MarketCore memory c = foot.getMarketCore(mid);
        return c.result;
    }

    function _footMarketState(uint256 mid) internal view returns (PariMatchBase.MarketState) {
        return foot.getMarketCore(mid).state;
    }

    function _bballMarketResult(uint256 mid) internal view returns (uint64) {
        return bball.getMarketCore(mid).result;
    }

    function _bballMarketState(uint256 mid) internal view returns (PariMatchBase.MarketState) {
        return bball.getMarketCore(mid).state;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 1. FOOTBALL — BUNDLE: ONE SCORE, ALL MARKET TYPES
    // ═══════════════════════════════════════════════════════════════════════

    /// @dev Creates every football market type on a single match, stakes both
    ///      sides (so every outcome has a backer), calls resolveByScore once,
    ///      and verifies each market settles to the expected outcome.
    ///
    ///      Score chosen: home 3 — away 1, HT 1 — 0, first scorer = player 7,
    ///      so:
    ///        WINNER         -> Home (0)
    ///        GOALS_TOTAL(25) -> total = 4 > 2.5 -> Over (1)
    ///        BOTH_SCORE     -> both scored -> Yes (1)
    ///        HALFTIME       -> 1 > 0 -> Home (0)
    ///        CORRECT_SCORE  -> 3*10 + 1 = 31
    ///        FIRST_SCORER   -> 7
    ///        GOALS_EXACT(3) -> total = 4 -> clamps to 3 (cap)
    function test_Football_ResolveByScore_BundleAllMarketTypes() public {
        uint256 mWinner   = _addAndOpenFoot(F_WINNER,       0);
        uint256 mGoals    = _addAndOpenFoot(F_GOALS_TOTAL,  25);
        uint256 mBtts     = _addAndOpenFoot(F_BOTH_SCORE,   0);
        uint256 mHalftime = _addAndOpenFoot(F_HALFTIME,     0);
        uint256 mCorrect  = _addAndOpenFoot(F_CORRECT,      0);
        uint256 mFirst    = _addAndOpenFoot(F_FIRST_SCORER, 0);
        uint256 mExact    = _addAndOpenFoot(F_GOALS_EXACT,  3);

        // Stake on every outcome so nothing voids.
        _stakeFoot(alice, mWinner,   0, 100e6);
        _stakeFoot(bob,   mWinner,   1, 50e6);
        _stakeFoot(carol, mWinner,   2, 50e6);

        _stakeFoot(alice, mGoals,    1, 100e6); // Over (winner)
        _stakeFoot(bob,   mGoals,    0, 50e6);

        _stakeFoot(alice, mBtts,     1, 100e6); // Yes (winner)
        _stakeFoot(bob,   mBtts,     0, 50e6);

        _stakeFoot(alice, mHalftime, 0, 100e6); // Home (winner)
        _stakeFoot(bob,   mHalftime, 1, 50e6);

        _stakeFoot(alice, mCorrect,  31, 100e6); // 3-1 (winner)
        _stakeFoot(bob,   mCorrect,  0,  50e6);

        _stakeFoot(alice, mFirst,    7,  100e6); // player 7 (winner)
        _stakeFoot(bob,   mFirst,    8,  50e6);

        _stakeFoot(alice, mExact,    3,  100e6); // cap bucket (winner — total clamps to 3)
        _stakeFoot(bob,   mExact,    0,  50e6);

        // Close everything.
        vm.startPrank(owner);
        foot.closeMarket(mWinner);
        foot.closeMarket(mGoals);
        foot.closeMarket(mBtts);
        foot.closeMarket(mHalftime);
        foot.closeMarket(mCorrect);
        foot.closeMarket(mFirst);
        foot.closeMarket(mExact);
        vm.stopPrank();

        FootballPariMatch.FootballScore memory s = FootballPariMatch.FootballScore({
            homeGoals:    3,
            awayGoals:    1,
            htHomeGoals:  1,
            htAwayGoals:  0,
            firstScorerId: 7,
            aetHomeGoals: 0,
            aetAwayGoals: 0,
            penWinner:    255
        });

        vm.prank(oracle);
        uint256 resolved = foot.resolveByScore(s);
        assertEq(resolved, 7, "all 7 markets resolved by single score input");

        assertEq(_footMarketResult(mWinner),   0,  "winner=Home");
        assertEq(_footMarketResult(mGoals),    1,  "goals_total=Over");
        assertEq(_footMarketResult(mBtts),     1,  "btts=Yes");
        assertEq(_footMarketResult(mHalftime), 0,  "halftime=Home");
        assertEq(_footMarketResult(mCorrect),  31, "correct=3-1");
        assertEq(_footMarketResult(mFirst),    7,  "first scorer=7");
        assertEq(_footMarketResult(mExact),    3,  "goals_exact=cap");

        assertEq(uint8(_footMarketState(mWinner)),   uint8(PariMatchBase.MarketState.Resolved));
        assertEq(uint8(_footMarketState(mExact)),    uint8(PariMatchBase.MarketState.Resolved));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 2. FOOTBALL — FIRST_SCORER SKIPPED WHEN UNKNOWN
    // ═══════════════════════════════════════════════════════════════════════

    function test_Football_ResolveByScore_FirstScorerSkippedWhenZero() public {
        uint256 mWinner = _addAndOpenFoot(F_WINNER,       0);
        uint256 mFirst  = _addAndOpenFoot(F_FIRST_SCORER, 0);

        _stakeFoot(alice, mWinner, 0, 100e6);
        _stakeFoot(bob,   mWinner, 2, 100e6);
        _stakeFoot(alice, mFirst,  5, 100e6);

        vm.startPrank(owner);
        foot.closeMarket(mWinner);
        foot.closeMarket(mFirst);
        vm.stopPrank();

        FootballPariMatch.FootballScore memory s = FootballPariMatch.FootballScore({
            homeGoals: 1, awayGoals: 0,
            htHomeGoals: 1, htAwayGoals: 0,
            firstScorerId: 0,  // unknown
            aetHomeGoals: 0,
            aetAwayGoals: 0,
            penWinner:    255
        });

        vm.prank(oracle);
        uint256 resolved = foot.resolveByScore(s);
        assertEq(resolved, 1, "only WINNER resolved; FIRST_SCORER skipped");

        assertEq(uint8(_footMarketState(mWinner)), uint8(PariMatchBase.MarketState.Resolved));
        assertEq(uint8(_footMarketState(mFirst)),  uint8(PariMatchBase.MarketState.Closed));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 3. FOOTBALL — NON-CLOSED MARKETS SKIPPED
    // ═══════════════════════════════════════════════════════════════════════

    function test_Football_ResolveByScore_SkipsNonClosedMarkets() public {
        uint256 mClosed = _addAndOpenFoot(F_WINNER, 0);
        uint256 mOpen   = _addAndOpenFoot(F_WINNER, 0); // stays Open

        _stakeFoot(alice, mClosed, 0, 100e6);
        _stakeFoot(bob,   mClosed, 1, 100e6);
        _stakeFoot(alice, mOpen,   0, 100e6);

        vm.prank(owner); foot.closeMarket(mClosed);

        FootballPariMatch.FootballScore memory s = FootballPariMatch.FootballScore({
            homeGoals: 1, awayGoals: 0,
            htHomeGoals: 0, htAwayGoals: 0,
            firstScorerId: 0,
            aetHomeGoals: 0,
            aetAwayGoals: 0,
            penWinner:    255
        });

        vm.prank(oracle);
        uint256 resolved = foot.resolveByScore(s);
        assertEq(resolved, 1, "only the Closed market resolves");
        assertEq(uint8(_footMarketState(mClosed)), uint8(PariMatchBase.MarketState.Resolved));
        assertEq(uint8(_footMarketState(mOpen)),   uint8(PariMatchBase.MarketState.Open));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 4. FOOTBALL — ACCESS CONTROL
    // ═══════════════════════════════════════════════════════════════════════

    function test_Football_ResolveByScore_OnlyResolver() public {
        FootballPariMatch.FootballScore memory s;
        vm.prank(stranger);
        vm.expectRevert();
        foot.resolveByScore(s);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 5. FOOTBALL — resolveBatchByScore SUBSET ONLY
    // ═══════════════════════════════════════════════════════════════════════

    function test_Football_ResolveBatchByScore_SubsetOnly() public {
        uint256 m0 = _addAndOpenFoot(F_WINNER, 0);
        uint256 m1 = _addAndOpenFoot(F_WINNER, 0);
        uint256 m2 = _addAndOpenFoot(F_WINNER, 0);

        _stakeFoot(alice, m0, 0, 100e6);  _stakeFoot(bob, m0, 1, 100e6);
        _stakeFoot(alice, m1, 0, 100e6);  _stakeFoot(bob, m1, 1, 100e6);
        _stakeFoot(alice, m2, 0, 100e6);  _stakeFoot(bob, m2, 1, 100e6);

        vm.startPrank(owner);
        foot.closeMarket(m0); foot.closeMarket(m1); foot.closeMarket(m2);
        vm.stopPrank();

        FootballPariMatch.FootballScore memory s = FootballPariMatch.FootballScore({
            homeGoals: 1, awayGoals: 0,
            htHomeGoals: 0, htAwayGoals: 0,
            firstScorerId: 0,
            aetHomeGoals: 0,
            aetAwayGoals: 0,
            penWinner:    255
        });

        uint256[] memory ids = new uint256[](2);
        ids[0] = m0; ids[1] = m2;

        vm.prank(oracle);
        uint256 resolved = foot.resolveBatchByScore(ids, s);
        assertEq(resolved, 2);
        assertEq(uint8(_footMarketState(m0)), uint8(PariMatchBase.MarketState.Resolved));
        assertEq(uint8(_footMarketState(m1)), uint8(PariMatchBase.MarketState.Closed));
        assertEq(uint8(_footMarketState(m2)), uint8(PariMatchBase.MarketState.Resolved));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 6. FOOTBALL — computeOutcome view
    // ═══════════════════════════════════════════════════════════════════════

    function test_Football_ComputeOutcome_View() public {
        uint256 m = _addAndOpenFoot(F_GOALS_TOTAL, 25);

        FootballPariMatch.FootballScore memory s = FootballPariMatch.FootballScore({
            homeGoals: 2, awayGoals: 1, // total = 3 > 2.5 -> Over
            htHomeGoals: 0, htAwayGoals: 0,
            firstScorerId: 0,
            aetHomeGoals: 0,
            aetAwayGoals: 0,
            penWinner:    255
        });

        (uint64 outcome, bool ok) = foot.computeOutcome(m, s);
        assertTrue(ok);
        assertEq(outcome, 1);

        // Score 1-0 -> total 1 -> Under.
        s.homeGoals = 1; s.awayGoals = 0;
        (outcome, ok) = foot.computeOutcome(m, s);
        assertTrue(ok);
        assertEq(outcome, 0);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 7. FOOTBALL — CORRECT_SCORE clamps to 9-9
    // ═══════════════════════════════════════════════════════════════════════

    function test_Football_ResolveByScore_CorrectScoreClamps() public {
        uint256 m = _addAndOpenFoot(F_CORRECT, 0);

        _stakeFoot(alice, m, 99, 100e6); // 9-9 (clamped)
        _stakeFoot(bob,   m, 0,  100e6);

        vm.prank(owner); foot.closeMarket(m);

        FootballPariMatch.FootballScore memory s = FootballPariMatch.FootballScore({
            homeGoals: 12, awayGoals: 15, // both clamp to 9 -> 99
            htHomeGoals: 0, htAwayGoals: 0,
            firstScorerId: 0,
            aetHomeGoals: 0,
            aetAwayGoals: 0,
            penWinner:    255
        });

        vm.prank(oracle); foot.resolveByScore(s);
        assertEq(_footMarketResult(m), 99);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 8. BASKETBALL — BUNDLE: ONE SCORE, MULTIPLE MARKET TYPES
    // ═══════════════════════════════════════════════════════════════════════

    /// @dev Score: H = 30/25/30/25 = 110, A = 20/30/20/35 = 105. Total = 215.
    ///        WINNER          -> Home (0)            (110 > 105)
    ///        TOTAL_POINTS(2105) -> 215*10 = 2150 > 2105 -> Over (1)
    ///        SPREAD(45)      -> diff = (110-105)*10 = 50 > 45 -> Home covers (0)
    ///        QUARTER_WINNER Q1 (extra=1) -> 30 > 20 -> Home (0)
    ///        QUARTER_WINNER Q2 (extra=2) -> 25 < 30 -> Away (1)
    ///        HIGHEST_QUARTER -> Q4 = 25+35 = 60 (Q2 = 55, Q1 = 50, Q3 = 50) -> idx=3
    ///        POINTS_EXACT(line=10, step=20) -> 215/20 = 10 -> cap (10)
    function test_Basketball_ResolveByScore_Bundle() public {
        uint256 mWinner   = _addAndOpenBball(B_WINNER,       0);
        uint256 mTotal    = _addAndOpenBball(B_TOTAL_POINTS, 2105);
        uint256 mSpread   = _addAndOpenBball(B_SPREAD,       45);
        uint256 mQ1Winner = _addQuarterBballMarket(B_QUARTER_WINNER, 1);
        uint256 mQ2Winner = _addQuarterBballMarket(B_QUARTER_WINNER, 2);
        uint256 mHighest  = _addAndOpenBball(B_HIGHEST_QUARTER, 0);
        vm.prank(owner);
        uint256 mPoints   = bball.addPointsExactMarket(10, 20);
        vm.prank(owner); bball.openMarket(mPoints);

        // Stake on both sides of every market to avoid voids.
        _stakeBball(alice, mWinner,   0, 100e6); _stakeBball(bob, mWinner,   1, 100e6);
        _stakeBball(alice, mTotal,    1, 100e6); _stakeBball(bob, mTotal,    0, 100e6);
        _stakeBball(alice, mSpread,   0, 100e6); _stakeBball(bob, mSpread,   1, 100e6);
        _stakeBball(alice, mQ1Winner, 0, 100e6); _stakeBball(bob, mQ1Winner, 1, 100e6);
        _stakeBball(alice, mQ2Winner, 1, 100e6); _stakeBball(bob, mQ2Winner, 0, 100e6);
        _stakeBball(alice, mHighest,  3, 100e6); _stakeBball(bob, mHighest,  0, 100e6);
        _stakeBball(alice, mPoints,  10, 100e6); _stakeBball(bob, mPoints,   5, 100e6);

        vm.startPrank(owner);
        bball.closeMarket(mWinner);
        bball.closeMarket(mTotal);
        bball.closeMarket(mSpread);
        bball.closeMarket(mQ1Winner);
        bball.closeMarket(mQ2Winner);
        bball.closeMarket(mHighest);
        bball.closeMarket(mPoints);
        vm.stopPrank();

        BasketballPariMatch.BasketballScore memory s = BasketballPariMatch.BasketballScore({
            homeQ1: 30, awayQ1: 20,
            homeQ2: 25, awayQ2: 30,
            homeQ3: 30, awayQ3: 20,
            homeQ4: 25, awayQ4: 35,
            firstToScore: 0
        });

        vm.prank(oracle);
        uint256 resolved = bball.resolveByScore(s);
        assertEq(resolved, 7, "every market resolved");

        assertEq(_bballMarketResult(mWinner),   0,  "home wins");
        assertEq(_bballMarketResult(mTotal),    1,  "over total");
        assertEq(_bballMarketResult(mSpread),   0,  "home covers");
        assertEq(_bballMarketResult(mQ1Winner), 0,  "Q1 home");
        assertEq(_bballMarketResult(mQ2Winner), 1,  "Q2 away");
        assertEq(_bballMarketResult(mHighest),  3,  "Q4 highest");
        assertEq(_bballMarketResult(mPoints),   10, "points cap bucket");
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 9. BASKETBALL — WINNER TIE SKIPPED
    // ═══════════════════════════════════════════════════════════════════════

    function test_Basketball_ResolveByScore_WinnerTieSkipped() public {
        uint256 m = _addAndOpenBball(B_WINNER, 0);
        _stakeBball(alice, m, 0, 100e6); _stakeBball(bob, m, 1, 100e6);
        vm.prank(owner); bball.closeMarket(m);

        BasketballPariMatch.BasketballScore memory s = BasketballPariMatch.BasketballScore({
            homeQ1: 25, awayQ1: 25,
            homeQ2: 25, awayQ2: 25,
            homeQ3: 25, awayQ3: 25,
            homeQ4: 25, awayQ4: 25,
            firstToScore: 0
        });

        vm.prank(oracle);
        uint256 resolved = bball.resolveByScore(s);
        assertEq(resolved, 0, "tie -> no resolution");
        assertEq(uint8(_bballMarketState(m)), uint8(PariMatchBase.MarketState.Closed));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 10. BASKETBALL — SPREAD PUSH SKIPPED
    // ═══════════════════════════════════════════════════════════════════════

    function test_Basketball_ResolveByScore_SpreadPushSkipped() public {
        // Spread line = 50 (home -5.0). Diff = exactly 50 -> push.
        uint256 m = _addAndOpenBball(B_SPREAD, 50);
        _stakeBball(alice, m, 0, 100e6); _stakeBball(bob, m, 1, 100e6);
        vm.prank(owner); bball.closeMarket(m);

        // 30+25+25+25 = 105 vs 25+25+25+25 = 100 -> diff = 5 -> diff*10 = 50.
        BasketballPariMatch.BasketballScore memory s = BasketballPariMatch.BasketballScore({
            homeQ1: 30, awayQ1: 25,
            homeQ2: 25, awayQ2: 25,
            homeQ3: 25, awayQ3: 25,
            homeQ4: 25, awayQ4: 25,
            firstToScore: 0
        });

        vm.prank(oracle);
        uint256 resolved = bball.resolveByScore(s);
        assertEq(resolved, 0, "push -> no resolution");
        assertEq(uint8(_bballMarketState(m)), uint8(PariMatchBase.MarketState.Closed));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 11. BASKETBALL — QUARTER_WINNER TIE SKIPPED
    // ═══════════════════════════════════════════════════════════════════════

    function test_Basketball_ResolveByScore_QuarterTieSkipped() public {
        uint256 m = _addQuarterBballMarket(B_QUARTER_WINNER, 3); // Q3
        _stakeBball(alice, m, 0, 100e6); _stakeBball(bob, m, 1, 100e6);
        vm.prank(owner); bball.closeMarket(m);

        BasketballPariMatch.BasketballScore memory s = BasketballPariMatch.BasketballScore({
            homeQ1: 0, awayQ1: 0,
            homeQ2: 0, awayQ2: 0,
            homeQ3: 25, awayQ3: 25, // Q3 tie
            homeQ4: 0, awayQ4: 0,
            firstToScore: 0
        });

        vm.prank(oracle);
        uint256 resolved = bball.resolveByScore(s);
        assertEq(resolved, 0, "quarter tie -> no resolution");
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 12. BASKETBALL — HIGHEST_QUARTER TIE AT TOP SKIPPED
    // ═══════════════════════════════════════════════════════════════════════

    function test_Basketball_ResolveByScore_HighestQuarterTieSkipped() public {
        uint256 m = _addAndOpenBball(B_HIGHEST_QUARTER, 0);
        _stakeBball(alice, m, 0, 100e6); _stakeBball(bob, m, 3, 100e6);
        vm.prank(owner); bball.closeMarket(m);

        // Q1 = 30+30 = 60, Q2 = 25+25 = 50, Q3 = 25+25 = 50, Q4 = 30+30 = 60.
        // Q1 and Q4 tie at top -> unresolvable.
        BasketballPariMatch.BasketballScore memory s = BasketballPariMatch.BasketballScore({
            homeQ1: 30, awayQ1: 30,
            homeQ2: 25, awayQ2: 25,
            homeQ3: 25, awayQ3: 25,
            homeQ4: 30, awayQ4: 30,
            firstToScore: 0
        });

        vm.prank(oracle);
        uint256 resolved = bball.resolveByScore(s);
        assertEq(resolved, 0, "tie at the top -> no resolution");
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 13. BASKETBALL — FIRST_TO_SCORE: ZERO SKIPS, 1/2 RESOLVES
    // ═══════════════════════════════════════════════════════════════════════

    function test_Basketball_ResolveByScore_FirstToScoreSkippedWhenZero() public {
        uint256 m = _addAndOpenBball(B_FIRST_TO_SCORE, 0);
        _stakeBball(alice, m, 0, 100e6); _stakeBball(bob, m, 1, 100e6);
        vm.prank(owner); bball.closeMarket(m);

        BasketballPariMatch.BasketballScore memory s = BasketballPariMatch.BasketballScore({
            homeQ1: 25, awayQ1: 25,
            homeQ2: 25, awayQ2: 25,
            homeQ3: 25, awayQ3: 25,
            homeQ4: 25, awayQ4: 25,
            firstToScore: 0
        });

        vm.prank(oracle);
        uint256 resolved = bball.resolveByScore(s);
        assertEq(resolved, 0, "unknown firstToScore -> skipped");
    }

    function test_Basketball_ResolveByScore_FirstToScoreHomeResolves() public {
        uint256 m = _addAndOpenBball(B_FIRST_TO_SCORE, 0);
        _stakeBball(alice, m, 0, 100e6); _stakeBball(bob, m, 1, 100e6);
        vm.prank(owner); bball.closeMarket(m);

        BasketballPariMatch.BasketballScore memory s = BasketballPariMatch.BasketballScore({
            homeQ1: 25, awayQ1: 25,
            homeQ2: 25, awayQ2: 25,
            homeQ3: 25, awayQ3: 25,
            homeQ4: 25, awayQ4: 25,
            firstToScore: 1  // home
        });

        vm.prank(oracle);
        uint256 resolved = bball.resolveByScore(s);
        assertEq(resolved, 1);
        assertEq(_bballMarketResult(m), 0, "home first -> outcome 0");
    }

    function test_Basketball_ResolveByScore_FirstToScoreAwayResolves() public {
        uint256 m = _addAndOpenBball(B_FIRST_TO_SCORE, 0);
        _stakeBball(alice, m, 0, 100e6); _stakeBball(bob, m, 1, 100e6);
        vm.prank(owner); bball.closeMarket(m);

        BasketballPariMatch.BasketballScore memory s = BasketballPariMatch.BasketballScore({
            homeQ1: 25, awayQ1: 25,
            homeQ2: 25, awayQ2: 25,
            homeQ3: 25, awayQ3: 25,
            homeQ4: 25, awayQ4: 25,
            firstToScore: 2
        });

        vm.prank(oracle);
        bball.resolveByScore(s);
        assertEq(_bballMarketResult(m), 1, "away first -> outcome 1");
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 14. BASKETBALL — ACCESS CONTROL
    // ═══════════════════════════════════════════════════════════════════════

    function test_Basketball_ResolveByScore_OnlyResolver() public {
        BasketballPariMatch.BasketballScore memory s;
        vm.prank(stranger);
        vm.expectRevert();
        bball.resolveByScore(s);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 15. FOOTBALL — DOUBLE_CHANCE
    // ═══════════════════════════════════════════════════════════════════════

    /// @dev DC variants encoded in `line`: 0=1X, 1=12, 2=2X. Each market is
    ///      its own Yes/No pool (0=No, 1=Yes). The truth table is:
    ///        line  | home win | draw | away win
    ///        ──────┼──────────┼──────┼──────────
    ///        0  1X | Yes      | Yes  | No
    ///        1  12 | Yes      | No   | Yes
    ///        2  2X | No       | Yes  | Yes
    function test_Football_DoubleChance_HomeWin_ResolvesCorrectly() public {
        uint256 m1X = _addAndOpenFoot(F_DOUBLE_CHANCE, 0);
        uint256 m12 = _addAndOpenFoot(F_DOUBLE_CHANCE, 1);
        uint256 m2X = _addAndOpenFoot(F_DOUBLE_CHANCE, 2);

        _stakeFoot(alice, m1X, 1, 100e6); _stakeFoot(bob, m1X, 0, 50e6);
        _stakeFoot(alice, m12, 1, 100e6); _stakeFoot(bob, m12, 0, 50e6);
        _stakeFoot(alice, m2X, 1, 100e6); _stakeFoot(bob, m2X, 0, 50e6);

        vm.startPrank(owner);
        foot.closeMarket(m1X); foot.closeMarket(m12); foot.closeMarket(m2X);
        vm.stopPrank();

        FootballPariMatch.FootballScore memory s = FootballPariMatch.FootballScore({
            homeGoals: 2, awayGoals: 0, htHomeGoals: 1, htAwayGoals: 0, firstScorerId: 0,
            aetHomeGoals: 0,
            aetAwayGoals: 0,
            penWinner:    255
        });
        vm.prank(oracle);
        foot.resolveByScore(s);

        assertEq(_footMarketResult(m1X), 1, "home win covers 1X");
        assertEq(_footMarketResult(m12), 1, "home win covers 12");
        assertEq(_footMarketResult(m2X), 0, "home win does not cover 2X");
    }

    function test_Football_DoubleChance_Draw_ResolvesCorrectly() public {
        uint256 m1X = _addAndOpenFoot(F_DOUBLE_CHANCE, 0);
        uint256 m12 = _addAndOpenFoot(F_DOUBLE_CHANCE, 1);
        uint256 m2X = _addAndOpenFoot(F_DOUBLE_CHANCE, 2);

        _stakeFoot(alice, m1X, 1, 100e6); _stakeFoot(bob, m1X, 0, 50e6);
        _stakeFoot(alice, m12, 1, 100e6); _stakeFoot(bob, m12, 0, 50e6);
        _stakeFoot(alice, m2X, 1, 100e6); _stakeFoot(bob, m2X, 0, 50e6);

        vm.startPrank(owner);
        foot.closeMarket(m1X); foot.closeMarket(m12); foot.closeMarket(m2X);
        vm.stopPrank();

        FootballPariMatch.FootballScore memory s = FootballPariMatch.FootballScore({
            homeGoals: 2, awayGoals: 2, htHomeGoals: 1, htAwayGoals: 1, firstScorerId: 0,
            aetHomeGoals: 0,
            aetAwayGoals: 0,
            penWinner:    255
        });
        vm.prank(oracle);
        foot.resolveByScore(s);

        assertEq(_footMarketResult(m1X), 1, "draw covers 1X");
        assertEq(_footMarketResult(m12), 0, "draw does not cover 12");
        assertEq(_footMarketResult(m2X), 1, "draw covers 2X");
    }

    function test_Football_DoubleChance_AwayWin_ResolvesCorrectly() public {
        uint256 m1X = _addAndOpenFoot(F_DOUBLE_CHANCE, 0);
        uint256 m12 = _addAndOpenFoot(F_DOUBLE_CHANCE, 1);
        uint256 m2X = _addAndOpenFoot(F_DOUBLE_CHANCE, 2);

        _stakeFoot(alice, m1X, 1, 100e6); _stakeFoot(bob, m1X, 0, 50e6);
        _stakeFoot(alice, m12, 1, 100e6); _stakeFoot(bob, m12, 0, 50e6);
        _stakeFoot(alice, m2X, 1, 100e6); _stakeFoot(bob, m2X, 0, 50e6);

        vm.startPrank(owner);
        foot.closeMarket(m1X); foot.closeMarket(m12); foot.closeMarket(m2X);
        vm.stopPrank();

        FootballPariMatch.FootballScore memory s = FootballPariMatch.FootballScore({
            homeGoals: 0, awayGoals: 2, htHomeGoals: 0, htAwayGoals: 1, firstScorerId: 0,
            aetHomeGoals: 0,
            aetAwayGoals: 0,
            penWinner:    255
        });
        vm.prank(oracle);
        foot.resolveByScore(s);

        assertEq(_footMarketResult(m1X), 0, "away win does not cover 1X");
        assertEq(_footMarketResult(m12), 1, "away win covers 12");
        assertEq(_footMarketResult(m2X), 1, "away win covers 2X");
    }

    function test_Football_DoubleChance_InvalidLine_Reverts() public {
        // line = 3 is out of range; addMarketWithLine should revert with InvalidLine.
        vm.prank(owner);
        vm.expectRevert();
        foot.addMarketWithLine(F_DOUBLE_CHANCE, 3);
    }

    function test_Football_DoubleChance_ComputeOutcome_View() public {
        uint256 m = _addAndOpenFoot(F_DOUBLE_CHANCE, 0);  // 1X
        FootballPariMatch.FootballScore memory s = FootballPariMatch.FootballScore({
            homeGoals: 1, awayGoals: 0, htHomeGoals: 0, htAwayGoals: 0, firstScorerId: 0,
            aetHomeGoals: 0,
            aetAwayGoals: 0,
            penWinner:    255
        });
        (uint64 outcome, bool ok) = foot.computeOutcome(m, s);
        assertTrue(ok);
        assertEq(outcome, 1, "home win covers 1X via view");
    }
}
