// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {ChilizSwapRouter, ILiquidityPoolDeposit} from "../src/swap/ChilizSwapRouter.sol";
import {LiquidityPool} from "../src/liquidity/LiquidityPool.sol";
import {BettingMatchFactory} from "../src/betting/BettingMatchFactory.sol";

import {MockUSDC} from "./mocks/MockUSDC.sol";
import {MockKayenRouter} from "./mocks/MockKayenRouter.sol";

contract MockFanTokenLp is ERC20 {
    constructor() ERC20("Fan Token", "FAN") {}
    function mint(address to, uint256 amount) external { _mint(to, amount); }
}

/// @dev Second mock USDC used to verify the `PoolAssetMismatch` guard on
///      `setLiquidityPool` (a pool whose `asset()` is not the configured USDC).
contract OtherUSDC is ERC20 {
    constructor() ERC20("Other USDC", "oUSDC") {}
    function mint(address to, uint256 amount) external { _mint(to, amount); }
    function decimals() public pure override returns (uint8) { return 6; }
}

/**
 * @title SwapLiquidityDepositTest
 * @notice Coverage for the multi-asset LP deposit helpers on ChilizSwapRouter:
 *         depositLiquidityWithUSDC / depositLiquidityWithCHZ / depositLiquidityWithToken.
 *
 * Layout mirrors SwapIntegrationTest's setUp so behavior is comparable.
 */
contract SwapLiquidityDepositTest is Test {
    LiquidityPool public pool;
    ChilizSwapRouter public swapRouter;
    MockUSDC public usdc;
    MockKayenRouter public mockRouter;
    MockFanTokenLp public fanToken;
    BettingMatchFactory public factory;

    address public deployer = address(this);
    address public admin    = address(0xA1);
    address public treasury = address(0xA2);
    address public alice    = address(0x100);
    address public bob      = address(0x101);

    address public constant WCHZ = address(0xC42);

    uint48 public constant COOLDOWN = 1 hours;

    function setUp() public {
        usdc = new MockUSDC();
        mockRouter = new MockKayenRouter(address(usdc));
        fanToken = new MockFanTokenLp();

        // LiquidityPool with a non-zero cooldown so we can prove the cooldown
        // is anchored on the share-receiver (the user), not on the router.
        LiquidityPool poolImpl = new LiquidityPool();
        bytes memory initData = abi.encodeWithSelector(
            LiquidityPool.initialize.selector,
            address(usdc),
            admin,
            treasury,
            uint16(0),    // protocol fee
            uint16(5000), // per-market liab cap
            uint16(9000), // per-match liab cap
            COOLDOWN
        );
        ERC1967Proxy poolProxy = new ERC1967Proxy(address(poolImpl), initData);
        pool = LiquidityPool(address(poolProxy));

        // Deploy router (treasury here is the router fee sink — separate from pool's treasury)
        swapRouter = new ChilizSwapRouter(
            address(mockRouter),
            address(mockRouter),
            address(usdc),
            WCHZ,
            address(0x999),
            500
        );

        // Wire the betting factory and pool registration so `setMatchFactory` /
        // `setLiquidityPool` post-conditions hold (mirrors prod deploy order).
        factory = new BettingMatchFactory();
        bytes32 authRole = pool.MATCH_AUTHORIZER_ROLE();
        vm.prank(admin);
        pool.grantRole(authRole, address(factory));
        factory.setWiring(address(pool), address(usdc), address(swapRouter));

        swapRouter.setMatchFactory(address(factory));
        swapRouter.setLiquidityPool(address(pool));

        // Funding
        usdc.mint(alice, 1_000e6);
        usdc.mint(bob, 1_000e6);
        fanToken.mint(alice, 1_000 ether);
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
    }

    // ──────────────────────────────────────────────────────────────────────
    // depositLiquidityWithUSDC
    // ──────────────────────────────────────────────────────────────────────

    function test_DepositWithUSDC_HappyPath() public {
        uint256 amount = 100e6;

        vm.startPrank(alice);
        usdc.approve(address(swapRouter), amount);
        uint256 shares = swapRouter.depositLiquidityWithUSDC(amount, alice);
        vm.stopPrank();

        assertGt(shares, 0, "shares minted");
        assertEq(pool.balanceOf(alice), shares, "alice gets shares");
        assertEq(pool.balanceOf(address(swapRouter)), 0, "router holds no shares");
        assertEq(usdc.balanceOf(address(swapRouter)), 0, "router holds no usdc");
        assertEq(pool.totalAssets(), amount, "pool NAV equals deposit");
    }

    function test_DepositWithUSDC_DepositsToReceiver() public {
        uint256 amount = 100e6;

        vm.startPrank(alice);
        usdc.approve(address(swapRouter), amount);
        uint256 shares = swapRouter.depositLiquidityWithUSDC(amount, bob);
        vm.stopPrank();

        assertEq(pool.balanceOf(bob), shares, "shares routed to receiver");
        assertEq(pool.balanceOf(alice), 0, "depositor holds no shares");
    }

    function test_DepositWithUSDC_RevertsOnZero() public {
        vm.prank(alice);
        vm.expectRevert(ChilizSwapRouter.ZeroValue.selector);
        swapRouter.depositLiquidityWithUSDC(0, alice);
    }

    function test_DepositWithUSDC_RevertsOnZeroReceiver() public {
        vm.prank(alice);
        vm.expectRevert(ChilizSwapRouter.ZeroAddress.selector);
        swapRouter.depositLiquidityWithUSDC(100e6, address(0));
    }

    function test_DepositWithUSDC_RevertsWhenPoolUnset() public {
        // Spin up a fresh router with no pool registered.
        ChilizSwapRouter unsetRouter = new ChilizSwapRouter(
            address(mockRouter),
            address(mockRouter),
            address(usdc),
            WCHZ,
            address(0x999),
            500
        );

        vm.startPrank(alice);
        usdc.approve(address(unsetRouter), 100e6);
        vm.expectRevert(ChilizSwapRouter.LiquidityPoolNotSet.selector);
        unsetRouter.depositLiquidityWithUSDC(100e6, alice);
        vm.stopPrank();
    }

    function test_DepositWithUSDC_BumpsCooldownOnReceiverNotRouter() public {
        uint256 amount = 100e6;

        vm.startPrank(alice);
        usdc.approve(address(swapRouter), amount);
        swapRouter.depositLiquidityWithUSDC(amount, alice);
        vm.stopPrank();

        // Alice cannot withdraw before the cooldown.
        vm.prank(alice);
        vm.expectRevert();
        pool.withdraw(1, alice, alice);

        // After the cooldown, alice can withdraw — proving the cooldown clock
        // is keyed on the share holder, not on the router.
        vm.warp(block.timestamp + COOLDOWN + 1);
        vm.prank(alice);
        pool.withdraw(1e6, alice, alice);
        assertGe(usdc.balanceOf(alice), 1e6 + 900e6); // 900 leftover + 1 withdrawn
    }

    // ──────────────────────────────────────────────────────────────────────
    // depositLiquidityWithCHZ
    // ──────────────────────────────────────────────────────────────────────

    function test_DepositWithCHZ_HappyPath() public {
        // Mock router rate: 1 CHZ -> 0.10 USDC (rate = 100_000)
        // 10 CHZ -> 1.00 USDC.
        uint256 chzIn = 10 ether;
        uint256 expectedUsdc = 1e6;

        vm.prank(alice);
        uint256 shares = swapRouter.depositLiquidityWithCHZ{value: chzIn}(
            expectedUsdc,
            block.timestamp + 1 hours,
            alice
        );

        assertGt(shares, 0);
        assertEq(pool.balanceOf(alice), shares);
        assertEq(pool.totalAssets(), expectedUsdc, "pool received swapped USDC");
        assertEq(usdc.balanceOf(address(swapRouter)), 0, "no router-held USDC");
    }

    function test_DepositWithCHZ_RevertsOnSlippage() public {
        // Demand more USDC than the rate allows.
        vm.prank(alice);
        vm.expectRevert();
        swapRouter.depositLiquidityWithCHZ{value: 1 ether}(
            999e6, // unreachable amountOutMin
            block.timestamp + 1 hours,
            alice
        );
    }

    function test_DepositWithCHZ_RevertsOnDeadline() public {
        vm.warp(1000);
        vm.prank(alice);
        vm.expectRevert(ChilizSwapRouter.DeadlinePassed.selector);
        swapRouter.depositLiquidityWithCHZ{value: 1 ether}(0, 999, alice);
    }

    function test_DepositWithCHZ_RevertsOnZeroValue() public {
        vm.prank(alice);
        vm.expectRevert(ChilizSwapRouter.ZeroValue.selector);
        swapRouter.depositLiquidityWithCHZ{value: 0}(
            0,
            block.timestamp + 1 hours,
            alice
        );
    }

    // ──────────────────────────────────────────────────────────────────────
    // depositLiquidityWithToken
    // ──────────────────────────────────────────────────────────────────────

    function test_DepositWithToken_HappyPath() public {
        // 100 fan tokens at rate 100_000 → 100 * 100_000 / 1e18 = 0.0001 USDC
        // bump the rate so the test gives meaningful values.
        mockRouter.setRate(1e18); // 1:1 (token has 18 decimals, USDC has 6 — output = amountIn * 1)
        // Wait — that gives huge USDC. Let me use a sane rate:
        // For fan token (18 decimals) → USDC (6 decimals): typical rate ~1e6 maps 1 token ≈ 1 USDC.
        mockRouter.setRate(1e6); // 1 token (1e18 wei) -> 1 USDC (1e6 wei)

        uint256 amount = 50 ether; // 50 fan tokens
        uint256 expectedUsdc = 50e6;

        vm.startPrank(alice);
        fanToken.approve(address(swapRouter), amount);
        uint256 shares = swapRouter.depositLiquidityWithToken(
            address(fanToken),
            amount,
            expectedUsdc,
            block.timestamp + 1 hours,
            alice
        );
        vm.stopPrank();

        assertGt(shares, 0);
        assertEq(pool.balanceOf(alice), shares);
        assertEq(pool.totalAssets(), expectedUsdc);
        assertEq(usdc.balanceOf(address(swapRouter)), 0);
        assertEq(fanToken.balanceOf(address(swapRouter)), 0);
    }

    function test_DepositWithToken_RevertsOnUSDCToken() public {
        vm.startPrank(alice);
        usdc.approve(address(swapRouter), 100e6);
        vm.expectRevert(ChilizSwapRouter.TokenIsUSDC.selector);
        swapRouter.depositLiquidityWithToken(
            address(usdc),
            100e6,
            0,
            block.timestamp + 1 hours,
            alice
        );
        vm.stopPrank();
    }

    function test_DepositWithToken_RevertsOnSlippage() public {
        mockRouter.setRate(1e6);
        vm.startPrank(alice);
        fanToken.approve(address(swapRouter), 1 ether);
        vm.expectRevert();
        swapRouter.depositLiquidityWithToken(
            address(fanToken),
            1 ether,
            999e6, // unreachable
            block.timestamp + 1 hours,
            alice
        );
        vm.stopPrank();
    }

    function test_DepositWithToken_RevertsOnDeadline() public {
        vm.warp(1000);
        vm.startPrank(alice);
        fanToken.approve(address(swapRouter), 1 ether);
        vm.expectRevert(ChilizSwapRouter.DeadlinePassed.selector);
        swapRouter.depositLiquidityWithToken(address(fanToken), 1 ether, 0, 999, alice);
        vm.stopPrank();
    }

    // ──────────────────────────────────────────────────────────────────────
    // setLiquidityPool guard
    // ──────────────────────────────────────────────────────────────────────

    function test_SetLiquidityPool_RevertsOnAssetMismatch() public {
        // Pool that holds a different ERC20 — the router's USDC immutable
        // doesn't match this pool's asset, so wiring must fail loudly.
        OtherUSDC otherUsdc = new OtherUSDC();
        LiquidityPool poolImpl = new LiquidityPool();
        bytes memory initData = abi.encodeWithSelector(
            LiquidityPool.initialize.selector,
            address(otherUsdc),
            admin,
            treasury,
            uint16(0), uint16(5000), uint16(9000), uint48(0)
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(poolImpl), initData);

        vm.expectRevert(
            abi.encodeWithSelector(
                ChilizSwapRouter.PoolAssetMismatch.selector,
                address(otherUsdc),
                address(usdc)
            )
        );
        swapRouter.setLiquidityPool(address(proxy));
    }

    function test_SetLiquidityPool_RevertsOnZero() public {
        vm.expectRevert(ChilizSwapRouter.ZeroAddress.selector);
        swapRouter.setLiquidityPool(address(0));
    }

    function test_SetLiquidityPool_OnlyOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        swapRouter.setLiquidityPool(address(pool));
    }
}
