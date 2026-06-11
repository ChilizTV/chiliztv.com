// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {ChilizSwapRouter}    from "../src/swap/ChilizSwapRouter.sol";
import {PariMatchFactory}    from "../src/pari/PariMatchFactory.sol";
import {FootballPariMatch}   from "../src/pari/FootballPariMatch.sol";
import {StreamWalletFactory} from "../src/streamer/StreamWalletFactory.sol";
import {MockUSDC}            from "./mocks/MockUSDC.sol";
import {MockKayenRouter}     from "./mocks/MockKayenRouter.sol";
import {MockChilizWrapperFactory, MockWrappedFanToken} from "./mocks/MockChilizWrapperFactory.sol";

/// @dev CAP-20-style fan token: 0 decimals, like PSG/BAR on Chiliz.
contract MockFanToken0Dec is ERC20 {
    constructor() ERC20("Paris Saint-Germain Mock", "PSG") {}
    function decimals() public pure override returns (uint8) { return 0; }
    function mint(address to, uint256 amount) external { _mint(to, amount); }
}

/// @dev Plain 18-decimals ERC20 (the grief-guard test target).
contract MockERC20 is ERC20 {
    constructor() ERC20("Regular Token", "REG") {}
    function mint(address to, uint256 amount) external { _mint(to, amount); }
}

/**
 * @title FanTokenSwapRouterTest
 * @notice Fan-token (sub-18-decimals) swap support in ChilizSwapRouter:
 *         wrap via the Kayen wrapper factory, then [wrapped, WCHZ, USDC].
 */
contract FanTokenSwapRouterTest is Test {
    MockUSDC                 public usdc;
    MockKayenRouter          public mockRouter;
    MockChilizWrapperFactory public wrapperFactory;
    MockFanToken0Dec         public fanToken;
    MockERC20                public regularToken;
    ChilizSwapRouter         public swapRouter;
    PariMatchFactory         public pariFactory;
    FootballPariMatch        public match_;
    StreamWalletFactory      public walletFactory;

    address public owner    = makeAddr("owner");
    address public oracle   = makeAddr("oracle");
    address public treasury = makeAddr("treasury");
    address public streamer = makeAddr("streamer");
    address public bettor   = makeAddr("bettor");

    address public constant WCHZ = address(0xC42);
    uint16  public constant PLATFORM_FEE_BPS = 500; // 5%
    bytes32 public constant MARKET_WINNER = keccak256("WINNER");

    uint256 public marketId;

    function setUp() public {
        usdc           = new MockUSDC();
        mockRouter     = new MockKayenRouter(address(usdc));
        wrapperFactory = new MockChilizWrapperFactory();
        fanToken       = new MockFanToken0Dec();
        regularToken   = new MockERC20();

        swapRouter = new ChilizSwapRouter(
            address(mockRouter), // masterRouter (mock implements both)
            address(mockRouter), // tokenRouter
            address(usdc),
            WCHZ,
            treasury,
            PLATFORM_FEE_BPS
        );
        swapRouter.setWrapperFactory(address(wrapperFactory));

        // Betting wiring: factory-created match so isMatch() passes.
        pariFactory = new PariMatchFactory();
        pariFactory.setWiring(address(usdc), treasury, address(swapRouter));
        match_ = FootballPariMatch(payable(
            pariFactory.createFootballMatch("PSG vs OM", owner, oracle)
        ));
        swapRouter.setMatchFactory(address(pariFactory));

        vm.startPrank(owner);
        match_.addMarketWithLine(MARKET_WINNER, 0);
        marketId = match_.marketCount() - 1;
        match_.openMarket(marketId);
        vm.stopPrank();

        // Streaming wiring (donate path uses the same swap helper).
        walletFactory = new StreamWalletFactory(
            address(this), treasury, PLATFORM_FEE_BPS, address(mockRouter), address(usdc)
        );
        walletFactory.setSwapRouter(address(swapRouter));
        swapRouter.setStreamWalletFactory(address(walletFactory));

        // The wrapped fan token must already exist (mirrors PSG on mainnet).
        wrapperFactory.createWrappedToken(address(fanToken));

        fanToken.mint(bettor, 1_000);          // 0 decimals: 1000 units
        regularToken.mint(bettor, 1_000 ether);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ROUTE RESOLUTION
    // ═══════════════════════════════════════════════════════════════════════

    function test_SwapRouteFor_FanToken_WrapsAndRoutesViaWCHZ() public view {
        (address swapToken, uint256 perUnit, address[] memory path) =
            swapRouter.swapRouteFor(address(fanToken));

        address wrapped = wrapperFactory.underlyingToWrapped(address(fanToken));
        assertEq(swapToken, wrapped,        "should swap the wrapped token");
        assertEq(perUnit,   1e18,           "0-dec token wraps 1 -> 1e18");
        assertEq(path.length, 3,            "3-hop route");
        assertEq(path[0], wrapped);
        assertEq(path[1], WCHZ);
        assertEq(path[2], address(usdc));
    }

    function test_SwapRouteFor_RegularToken_NoWrap() public view {
        (address swapToken, uint256 perUnit, address[] memory path) =
            swapRouter.swapRouteFor(address(regularToken));

        assertEq(swapToken, address(regularToken));
        assertEq(perUnit, 1);
        assertEq(path.length, 3, "non-WCHZ ERC20 routes via WCHZ");
        assertEq(path[1], WCHZ);
    }

    function test_SwapRouteFor_WCHZ_Direct() public view {
        (address swapToken, uint256 perUnit, address[] memory path) =
            swapRouter.swapRouteFor(WCHZ);

        assertEq(swapToken, WCHZ);
        assertEq(perUnit, 1);
        assertEq(path.length, 2, "WCHZ goes straight to USDC");
        assertEq(path[0], WCHZ);
        assertEq(path[1], address(usdc));
    }

    /// A wrapper can be created permissionlessly for ANY token. An 18-decimals
    /// token must never be auto-wrapped, or a griefer could DoS its route.
    function test_SwapRouteFor_18DecWithWrapper_GuardHolds() public {
        wrapperFactory.createWrappedToken(address(regularToken));

        (address swapToken,,) = swapRouter.swapRouteFor(address(regularToken));
        assertEq(swapToken, address(regularToken), "18-dec token must stay unwrapped");
    }

    function test_QuoteTokenToUSDC_MatchesWrappedAmount() public view {
        // Mock rate: usdcOut = amountIn * 100_000 / 1e18.
        // 100 fan units -> 100e18 wrapped -> 10 USDC (10e6).
        uint256 quoted = swapRouter.quoteTokenToUSDC(address(fanToken), 100);
        assertEq(quoted, 10e6);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // BETTING WITH A FAN TOKEN
    // ═══════════════════════════════════════════════════════════════════════

    function test_PlaceBetWithFanToken() public {
        address wrapped = wrapperFactory.underlyingToWrapped(address(fanToken));

        vm.startPrank(bettor);
        fanToken.approve(address(swapRouter), 100);

        vm.expectEmit(true, true, false, true, address(swapRouter));
        emit ChilizSwapRouter.FanTokenWrapped(address(fanToken), wrapped, 100, 100e18);

        swapRouter.placeBetWithToken(
            address(fanToken), 100, address(match_), marketId, 1, 10e6, block.timestamp + 1 hours
        );
        vm.stopPrank();

        // 100 PSG -> 100e18 wPSG -> 10 USDC staked on outcome 1.
        assertEq(match_.getUserStake(marketId, bettor, 1), 10e6, "stake recorded in USDC");
        assertEq(usdc.balanceOf(address(match_)), 10e6, "USDC escrowed in match");

        // Nothing stranded on the router.
        assertEq(fanToken.balanceOf(address(swapRouter)), 0);
        assertEq(MockWrappedFanToken(wrapped).balanceOf(address(swapRouter)), 0);
        assertEq(usdc.balanceOf(address(swapRouter)), 0);
    }

    function test_PlaceBetWithFanToken_SlippageGuard() public {
        vm.startPrank(bettor);
        fanToken.approve(address(swapRouter), 100);
        // 100 units can only yield 10e6; demanding more must revert.
        vm.expectRevert("MockRouter: insufficient output");
        swapRouter.placeBetWithToken(
            address(fanToken), 100, address(match_), marketId, 1, 10e6 + 1, block.timestamp + 1 hours
        );
        vm.stopPrank();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STREAMING WITH A FAN TOKEN (same swap helper, donation delivery)
    // ═══════════════════════════════════════════════════════════════════════

    function test_DonateWithFanToken() public {
        vm.startPrank(bettor);
        fanToken.approve(address(swapRouter), 100);
        swapRouter.donateWithToken(
            address(fanToken), 100, streamer, "allez paris", 10e6, block.timestamp + 1 hours
        );
        vm.stopPrank();

        uint256 expectedFee      = (10e6 * uint256(PLATFORM_FEE_BPS)) / 10_000;
        uint256 expectedStreamer = 10e6 - expectedFee;

        assertEq(usdc.balanceOf(treasury), expectedFee, "treasury fee");
        assertEq(
            usdc.balanceOf(walletFactory.getWallet(streamer)),
            expectedStreamer,
            "streamer escrow"
        );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // WRAPPING DISABLED
    // ═══════════════════════════════════════════════════════════════════════

    function test_WrapperFactoryUnset_FanTokenRoutesRaw() public {
        swapRouter.setWrapperFactory(address(0));

        (address swapToken, uint256 perUnit, address[] memory path) =
            swapRouter.swapRouteFor(address(fanToken));

        assertEq(swapToken, address(fanToken), "no wrapping when factory unset");
        assertEq(perUnit, 1);
        assertEq(path.length, 3);
    }
}
