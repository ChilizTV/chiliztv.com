// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {FootballMatch} from "../src/betting/FootballMatch.sol";
import {BettingMatch} from "../src/betting/BettingMatch.sol";
import {LiquidityPool} from "../src/liquidity/LiquidityPool.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {MockUSDC} from "./mocks/MockUSDC.sol";

/// @title LiquidityPoolPerformanceFeeTest
/// @notice Covers the per-LP `costBasis` tracking and the `lpWithdrawalFeeBps`
///         performance fee charged on withdraw/redeem gain.
///
///         Coverage:
///           1. No-bet exit: cost basis fully reclaimed, no fee charged.
///           2. After a losing bet credits LP NAV: fee = bps × gain → treasury.
///           3. Partial withdraw: cost basis decremented proportionally.
///           4. Share transfer: cost basis follows shares to recipient; fee
///              applies to recipient's gain only.
///           5. LP underwater (post-winning-claim by bettor): no fee, full
///              delivery, cost basis decremented.
///           6. setLpWithdrawalFeeBps boundary: cap is enforced.
contract LiquidityPoolPerformanceFeeTest is Test {
    // actors
    address internal admin    = address(0xA11CE);
    address internal treasury = address(0xB0B);
    address internal resolver = address(0xBEEF);
    address internal lp       = address(0x1111);
    address internal lp2      = address(0x1112);
    address internal alice    = address(0x2222);

    // contracts
    MockUSDC      internal usdc;
    LiquidityPool internal pool;
    FootballMatch internal footballMatch;

    bytes32 constant ODDS_SETTER_ROLE = keccak256("ODDS_SETTER_ROLE");
    bytes32 constant RESOLVER_ROLE    = keccak256("RESOLVER_ROLE");
    bytes32 constant MARKET_WINNER    = keccak256("WINNER");

    function setUp() public {
        usdc = new MockUSDC();

        LiquidityPool poolImpl = new LiquidityPool();
        bytes memory poolInit = abi.encodeWithSelector(
            LiquidityPool.initialize.selector,
            address(usdc),
            admin,
            treasury,
            uint16(0),    // protocol fee deprecated
            uint16(9000), // per-market cap
            uint16(9500), // per-match cap
            uint48(0)     // no cooldown — keeps the test focused
        );
        pool = LiquidityPool(address(new ERC1967Proxy(address(poolImpl), poolInit)));

        FootballMatch impl = new FootballMatch();
        bytes memory matchInit = abi.encodeWithSelector(
            FootballMatch.initialize.selector,
            "Test Match",
            admin
        );
        footballMatch = FootballMatch(payable(address(new ERC1967Proxy(address(impl), matchInit))));

        vm.startPrank(admin);
        footballMatch.grantRole(RESOLVER_ROLE, resolver);
        footballMatch.setUSDCToken(address(usdc));
        footballMatch.setLiquidityPool(address(pool));
        pool.authorizeMatch(address(footballMatch));
        vm.stopPrank();

        usdc.mint(lp,    1_000_000e6);
        usdc.mint(lp2,   1_000_000e6);
        usdc.mint(alice,   100_000e6);
    }

    // ──────────────────────────────────────────────────────────────────────
    // 1. NO-GAIN EXIT — fee is 0
    // ──────────────────────────────────────────────────────────────────────

    function test_NoGain_NoFee() public {
        _seedPool(lp, 10_000e6);
        assertEq(pool.costBasis(lp), 10_000e6, "cost basis recorded on deposit");

        uint256 before = usdc.balanceOf(lp);
        uint256 shares = pool.balanceOf(lp);
        vm.prank(lp);
        pool.redeem(shares, lp, lp);

        assertEq(usdc.balanceOf(lp) - before, 10_000e6, "full principal returned");
        assertEq(pool.costBasis(lp), 0,                  "cost basis fully consumed");
        assertEq(pool.accruedTreasury(), 0,              "no fee on flat exit");
    }

    // ──────────────────────────────────────────────────────────────────────
    // 2. GAIN EXIT — fee = bps × gain → accruedTreasury
    // ──────────────────────────────────────────────────────────────────────

    function test_Gain_FeeOnYield_GoesToTreasury() public {
        _seedPool(lp, 10_000e6);
        uint256 marketId = _newMarketAtOdds(20_000); // 2.00x
        _placeBet(alice, marketId, 0 /* loses */, 100e6);

        vm.prank(admin);   footballMatch.closeMarket(marketId);
        vm.prank(resolver); footballMatch.resolveMarket(marketId, 1);

        // After resolve: 100 USDC losing stake → 40 to accruedTreasury, 60 stays in pool.
        // LP NAV ↑ 60. lp's cost basis still 10_000.
        uint256 lpYield = (100e6 * (10_000 - uint256(pool.treasuryShareBps()))) / 10_000;
        assertEq(pool.totalAssets(), 10_000e6 + lpYield, "LP NAV gained yield");
        uint256 accruedFromBet = pool.accruedTreasury();

        // LP redeems all shares. Expected:
        //   gross assets = totalAssets ~= 10_060
        //   gain = 60
        //   fee = 60 * 500 / 10_000 = 3 USDC
        //   delivered = 10_060 - 3 = 10_057
        uint256 shares      = pool.balanceOf(lp);
        uint256 grossAssets = pool.previewRedeem(shares);
        uint256 expectedFee = (lpYield * uint256(pool.lpWithdrawalFeeBps())) / 10_000;

        uint256 lpBefore = usdc.balanceOf(lp);
        vm.prank(lp);
        pool.redeem(shares, lp, lp);

        // 1 wei tolerance covers OZ ERC4626 virtual-offset rounding.
        assertApproxEqAbs(usdc.balanceOf(lp) - lpBefore, grossAssets - expectedFee, 1, "LP gets net of fee");
        assertApproxEqAbs(pool.accruedTreasury(),        accruedFromBet + expectedFee, 1, "fee added to treasury");
        assertEq(pool.costBasis(lp),             0, "cost basis fully consumed");
    }

    // ──────────────────────────────────────────────────────────────────────
    // 3. PARTIAL WITHDRAW — proportional cost-basis decrement
    // ──────────────────────────────────────────────────────────────────────

    function test_PartialWithdraw_CostBasisProportional() public {
        _seedPool(lp, 10_000e6);
        uint256 sharesAll = pool.balanceOf(lp);

        // Withdraw exactly half the shares.
        uint256 halfShares = sharesAll / 2;
        vm.prank(lp);
        pool.redeem(halfShares, lp, lp);

        // Cost basis after: roughly half of original. (Due to virtual offset
        // rounding the residual can be off by 1 wei; assertApproxEqAbs.)
        assertApproxEqAbs(pool.costBasis(lp), 5_000e6, 1, "half cost basis remains");
        assertEq(pool.balanceOf(lp), sharesAll - halfShares, "half shares burned");

        // Second exit consumes the rest of the cost basis.
        uint256 remaining = pool.balanceOf(lp);
        vm.prank(lp);
        pool.redeem(remaining, lp, lp);
        assertEq(pool.costBasis(lp), 0, "remaining cost basis consumed");
    }

    // ──────────────────────────────────────────────────────────────────────
    // 4. SHARE TRANSFER — cost basis follows; fee charged at recipient's exit
    // ──────────────────────────────────────────────────────────────────────

    function test_ShareTransfer_MovesCostBasis() public {
        _seedPool(lp, 10_000e6);
        uint256 sharesAll = pool.balanceOf(lp);

        // Transfer all shares from lp to lp2 — cost basis must follow.
        vm.prank(lp);
        pool.transfer(lp2, sharesAll);

        assertEq(pool.balanceOf(lp),  0,           "sender shares = 0");
        assertEq(pool.balanceOf(lp2), sharesAll,  "recipient shares = all");
        assertEq(pool.costBasis(lp),  0,           "sender cost basis = 0");
        assertEq(pool.costBasis(lp2), 10_000e6,   "recipient inherits cost basis");

        // Now lp2 gets all the LP yield from a losing bet.
        uint256 marketId = _newMarketAtOdds(20_000);
        _placeBet(alice, marketId, 0 /* loses */, 100e6);
        vm.prank(admin);   footballMatch.closeMarket(marketId);
        vm.prank(resolver); footballMatch.resolveMarket(marketId, 1);

        uint256 lp2Before    = usdc.balanceOf(lp2);
        uint256 lp2Shares    = pool.balanceOf(lp2);
        uint256 grossAssets  = pool.previewRedeem(lp2Shares);
        uint256 lpYield      = (100e6 * (10_000 - uint256(pool.treasuryShareBps()))) / 10_000;
        uint256 expectedFee  = (lpYield * uint256(pool.lpWithdrawalFeeBps())) / 10_000;

        vm.prank(lp2);
        pool.redeem(lp2Shares, lp2, lp2);

        assertApproxEqAbs(usdc.balanceOf(lp2) - lp2Before, grossAssets - expectedFee, 1, "lp2 net = gross minus fee");
    }

    // ──────────────────────────────────────────────────────────────────────
    // 5. UNDERWATER — bettor wins, LP NAV drops below cost basis, no fee
    // ──────────────────────────────────────────────────────────────────────

    function test_Underwater_NoFee_FullDelivery() public {
        _seedPool(lp, 10_000e6);

        // Alice bets 500 on selection 0 at 2.00x. Market resolves selection 0 (alice wins).
        // Alice claims 1000. Pool balance: 10_000 + 500 (stake in) − 1000 (payout) = 9_500.
        // LP cost basis: 10_000. Gross redeem will be 9_500 < cost basis → no gain → no fee.
        uint256 marketId = _newMarketAtOdds(20_000);
        _placeBet(alice, marketId, 0 /* wins */, 500e6);

        vm.prank(admin);   footballMatch.closeMarket(marketId);
        vm.prank(resolver); footballMatch.resolveMarket(marketId, 0);
        vm.prank(alice);   footballMatch.claim(marketId, 0);

        assertEq(pool.totalAssets(), 9_500e6, "LP NAV underwater after winning bet");

        // Use maxRedeem rather than balanceOf — the underwater share price
        // makes balanceOf > maxRedeem after rounding through the virtual offset.
        uint256 before = usdc.balanceOf(lp);
        uint256 redeemable = pool.maxRedeem(lp);
        uint256 grossAssets = pool.previewRedeem(redeemable);
        vm.prank(lp);
        pool.redeem(redeemable, lp, lp);

        // No fee: gross < cost basis → gain = 0.
        assertEq(usdc.balanceOf(lp) - before, grossAssets,        "full underwater gross delivered");
        assertEq(pool.accruedTreasury(),      0,                   "no fee on loss exit");
        assertGt(pool.costBasis(lp),          0,                   "residual cost basis (loss not realized)");
    }

    // ──────────────────────────────────────────────────────────────────────
    // 6. CAP ENFORCEMENT
    // ──────────────────────────────────────────────────────────────────────

    function test_SetLpWithdrawalFeeBps_RejectsAboveCap() public {
        vm.prank(admin);
        vm.expectRevert(
            abi.encodeWithSelector(
                LiquidityPool.BpsOutOfRange.selector, 2_001, 2_000
            )
        );
        pool.setLpWithdrawalFeeBps(2_001);
    }

    function test_SetTreasuryShareBps_RejectsAboveCap() public {
        vm.prank(admin);
        vm.expectRevert(
            abi.encodeWithSelector(
                LiquidityPool.BpsOutOfRange.selector, 5_001, 5_000
            )
        );
        pool.setTreasuryShareBps(5_001);
    }

    function test_SetLpWithdrawalFeeBps_AppliesToFutureExits() public {
        // Bump to 10%.
        vm.prank(admin);
        pool.setLpWithdrawalFeeBps(1_000);

        _seedPool(lp, 10_000e6);
        uint256 marketId = _newMarketAtOdds(20_000);
        _placeBet(alice, marketId, 0 /* loses */, 1_000e6);
        vm.prank(admin);   footballMatch.closeMarket(marketId);
        vm.prank(resolver); footballMatch.resolveMarket(marketId, 1);

        uint256 lpYield = (1_000e6 * (10_000 - uint256(pool.treasuryShareBps()))) / 10_000;
        uint256 accruedFromBet = pool.accruedTreasury();
        uint256 shares = pool.balanceOf(lp);

        vm.prank(lp);
        pool.redeem(shares, lp, lp);

        // Fee = 10% * yield (600e6) = 60e6.
        uint256 expectedFee = (lpYield * 1_000) / 10_000;
        assertApproxEqAbs(pool.accruedTreasury() - accruedFromBet, expectedFee, 1, "10% fee accrued");
    }

    // ══════════════════════════════════════════════════════════════════════
    // HELPERS
    // ══════════════════════════════════════════════════════════════════════

    function _seedPool(address from, uint256 amount) internal {
        vm.startPrank(from);
        usdc.approve(address(pool), amount);
        pool.deposit(amount, from);
        vm.stopPrank();
    }

    function _newMarketAtOdds(uint32 odds) internal returns (uint256 marketId) {
        vm.prank(admin);
        footballMatch.addMarketWithLine(MARKET_WINNER, odds, 0);
        marketId = footballMatch.marketCount() - 1;
        vm.prank(admin);
        footballMatch.openMarket(marketId);
    }

    function _placeBet(address user, uint256 marketId, uint64 selection, uint256 amount) internal {
        vm.startPrank(user);
        usdc.approve(address(footballMatch), amount);
        footballMatch.placeBetUSDC(marketId, selection, amount);
        vm.stopPrank();
    }
}
