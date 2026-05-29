// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {ERC1967Proxy}    from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

// Pari-mutuel betting system
import {PariMatchFactory}  from "../src/pari/PariMatchFactory.sol";

// Streaming system
import {StreamWalletFactory} from "../src/streamer/StreamWalletFactory.sol";

// Unified swap router
import {ChilizSwapRouter} from "../src/swap/ChilizSwapRouter.sol";

// Leaderboard
import {LeaderboardRewards} from "../src/leaderboard/LeaderboardRewards.sol";

/**
 * @title DeployAll
 * @author ChilizTV
 * @notice One-shot deployment for the ChilizTV pari-mutuel platform:
 *
 *           1. PariMatchFactory     — Deploys FootballPariMatch / BasketballPariMatch proxies.
 *           2. StreamWalletFactory  — Deploys StreamWallet proxies.
 *           3. ChilizSwapRouter     — Token-to-USDC swap adapter for both modules.
 *           4. LeaderboardRewards   — UUPS proxy. Receives 1% of every pool
 *                                      and distributes pro-rata per epoch.
 *                                      Init runs both V1 `initialize(...)` and
 *                                      V2 `initializeV2()` so fresh deploys
 *                                      land directly on the on-chain pro-rata
 *                                      model with a 30-day epoch clock.
 *
 *         Plus all the wiring required to leave the system bet-ready in a single run:
 *           - factory.setWiring(usdc, feeRecipient, swapRouter)
 *           - factory.setLeaderboardWiring(leaderboard, 100)
 *           - swapRouter.setMatchFactory(factory)
 *           - streamFactory.setSwapRouter(swapRouter)
 *           - swapRouter.setStreamWalletFactory(streamFactory)
 *           - leaderboard.setMatchFactory(factory)
 *
 *         NOTE: LiquidityPool (ERC-4626 vault) has been intentionally removed.
 *         The pari-mutuel system uses match contracts as direct escrows — no
 *         external LP pool is required or deployed.
 *
 * ENVIRONMENT VARIABLES (required):
 * ==================================
 *   PRIVATE_KEY          — Deployer private key
 *   SAFE_ADDRESS         — Multi-sig: receives streaming platform fees AND
 *                           serves as feeRecipient for match protocol fees.
 *   KAYEN_MASTER_ROUTER  — Kayen MasterRouterV2 (CHZ → USDC path).
 *   KAYEN_ROUTER         — Kayen standard router (ERC20 → USDC path).
 *   WCHZ_ADDRESS         — Wrapped CHZ address.
 *   USDC_ADDRESS         — USDC token address.
 *
 * OPTIONAL:
 * =========
 *   PLATFORM_FEE_BPS    — Streaming platform fee bps (default 500 = 5%)
 *   TRANSFER_OWNERSHIP  — When "true", transfers Ownable.owner of
 *                          PariMatchFactory, StreamWalletFactory, and
 *                          ChilizSwapRouter to SAFE_ADDRESS at the end of
 *                          the run. Defaults to false so testnet iteration
 *                          keeps the deployer EOA as owner. Set to "true"
 *                          for production deployments.
 *
 * USAGE:
 * ======
 *   forge script script/DeployAll.s.sol --rpc-url $RPC_URL --broadcast --verify -vvvv
 */
contract DeployAll is Script {

    PariMatchFactory    public pariFactory;
    StreamWalletFactory public streamFactory;
    ChilizSwapRouter    public swapRouter;
    LeaderboardRewards  public leaderboard;

    address public deployer;
    address public treasury;   // SAFE_ADDRESS — fee recipient for both modules
    address public kayenMasterRouter;
    address public kayenRouter;
    address public wchz;
    address public usdcAddress;
    uint16  public platformFeeBps;
    bool    public transferOwnership;

    function run() external {
        deployer = msg.sender;
        _loadConfig();

        vm.startBroadcast();

        _printHeader();
        _deployPariFactory();
        _deployStreamingFactory();
        _deploySwapRouter();
        _deployLeaderboard();
        _wirePlatform();
        if (transferOwnership) {
            _transferOwnershipToSafe();
        }
        _printSummary();
        _printPostDeploymentSteps();

        vm.stopBroadcast();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // CONFIG
    // ══════════════════════════════════════════════════════════════════════════

    function _loadConfig() internal {
        treasury          = vm.envAddress("SAFE_ADDRESS");
        kayenMasterRouter = vm.envAddress("KAYEN_MASTER_ROUTER");
        kayenRouter       = vm.envAddress("KAYEN_ROUTER");
        wchz              = vm.envAddress("WCHZ_ADDRESS");
        usdcAddress       = vm.envAddress("USDC_ADDRESS");

        require(treasury          != address(0), "SAFE_ADDRESS required");
        require(kayenMasterRouter != address(0), "KAYEN_MASTER_ROUTER required");
        require(kayenRouter       != address(0), "KAYEN_ROUTER required");
        require(wchz              != address(0), "WCHZ_ADDRESS required");
        require(usdcAddress       != address(0), "USDC_ADDRESS required");

        platformFeeBps    = uint16(_envUintOr("PLATFORM_FEE_BPS", 500));
        transferOwnership = _envBoolOr("TRANSFER_OWNERSHIP", false);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // DEPLOYMENT
    // ══════════════════════════════════════════════════════════════════════════

    function _deployPariFactory() internal {
        console.log("[1/4] PARI MATCH FACTORY");
        console.log("========================");
        pariFactory = new PariMatchFactory();
        console.log("PariMatchFactory    :", address(pariFactory));
        console.log("  Football impl     :", pariFactory.footballImplementation());
        console.log("  Basketball impl   :", pariFactory.basketballImplementation());
        console.log("");
    }

    function _deployStreamingFactory() internal {
        console.log("[2/4] STREAM WALLET FACTORY");
        console.log("===========================");
        streamFactory = new StreamWalletFactory(
            deployer, treasury, platformFeeBps, kayenRouter, usdcAddress
        );
        console.log("StreamWalletFactory :", address(streamFactory));
        console.log("  Treasury          :", treasury);
        console.log("  Fee bps           :", platformFeeBps);
        console.log("  StreamWallet impl :", streamFactory.streamWalletImplementation());
        console.log("");
    }

    function _deploySwapRouter() internal {
        console.log("[3/4] CHILIZ SWAP ROUTER");
        console.log("========================");
        swapRouter = new ChilizSwapRouter(
            kayenMasterRouter, kayenRouter, usdcAddress, wchz, treasury, platformFeeBps
        );
        console.log("ChilizSwapRouter    :", address(swapRouter));
        console.log("  Treasury          :", treasury);
        console.log("  Master router     :", kayenMasterRouter);
        console.log("  Token router      :", kayenRouter);
        console.log("  WCHZ              :", wchz);
        console.log("  Platform fee bps  :", platformFeeBps);
        console.log("");
    }

    /// @dev Deploys the LeaderboardRewards behind an ERC1967 proxy and
    ///      runs both initializers in order:
    ///        - `initialize(usdc, admin, oracle)` — V1 marker, grants roles,
    ///          binds the USDC token.
    ///        - `initializeV2()` — V2 marker, anchors `epochStartTime` at
    ///          `block.timestamp` and sets `epochDuration` to 30 days so
    ///          the first auto-advance fires at the expected boundary.
    ///      Skipping the V2 init leaves `epochStartTime = epochDuration = 0`,
    ///      which causes every `recordWin` to advance the epoch in a tight
    ///      loop — see V2 contract docs.
    ///
    ///      ORACLE_ROLE is still granted to the treasury for V1 compatibility
    ///      (no entry point uses it in V2); admin can revoke it post-deploy.
    function _deployLeaderboard() internal {
        console.log("[4/4] LEADERBOARD REWARDS");
        console.log("=========================");
        LeaderboardRewards impl = new LeaderboardRewards();
        bytes memory initData = abi.encodeWithSelector(
            LeaderboardRewards.initialize.selector,
            usdcAddress,
            deployer,   // admin (can transfer later)
            treasury    // legacy ORACLE_ROLE recipient; unused in V2
        );
        leaderboard = LeaderboardRewards(address(new ERC1967Proxy(address(impl), initData)));
        leaderboard.initializeV2();
        console.log("LeaderboardRewards   :", address(leaderboard));
        console.log("  Implementation     :", address(impl));
        console.log("  Admin              :", deployer);
        console.log("  Oracle (initial)   :", treasury);
        console.log("  Epoch duration     :", uint256(leaderboard.epochDuration()), "seconds");
        console.log("");
    }

    // ══════════════════════════════════════════════════════════════════════════
    // WIRING
    // ══════════════════════════════════════════════════════════════════════════

    function _wirePlatform() internal {
        console.log("WIRING PLATFORM");
        console.log("===============");

        // 1. Factory learns about USDC + fee recipient + swap router.
        pariFactory.setWiring(usdcAddress, treasury, address(swapRouter));
        console.log("  pariFactory.setWiring            -> usdc/feeRecipient/router");

        // 2. Factory learns about the leaderboard (1% of pool by default).
        //    The factory stamps this on every match it creates from now on.
        pariFactory.setLeaderboardWiring(address(leaderboard), 100);
        console.log("  pariFactory.setLeaderboardWiring -> leaderboard / 100 bps");

        // 3. Swap router learns about the pari match factory (validates match addrs).
        swapRouter.setMatchFactory(address(pariFactory));
        console.log("  swapRouter.setMatchFactory       ->", address(pariFactory));

        // 4. Streaming factory learns about the swap router first (back-pointer check).
        streamFactory.setSwapRouter(address(swapRouter));
        console.log("  streamFactory.setSwapRouter      ->", address(swapRouter));

        // 5. Swap router learns about the streaming factory.
        swapRouter.setStreamWalletFactory(address(streamFactory));
        console.log("  swapRouter.setStreamWalletFactory ->", address(streamFactory));

        // 6. Leaderboard learns about the factory so it can authorize
        //    `recordWin` callers via `factory.isMatch(msg.sender)`.
        leaderboard.setMatchFactory(address(pariFactory));
        console.log("  leaderboard.setMatchFactory      ->", address(pariFactory));

        console.log("");
    }

    // ══════════════════════════════════════════════════════════════════════════
    // OWNERSHIP TRANSFER (env-flag gated)
    // ══════════════════════════════════════════════════════════════════════════

    /// @dev Transfers admin authority on all top-level contracts to the
    ///      Safe. Skipped by default — set TRANSFER_OWNERSHIP=true to enable.
    ///
    ///      - PariMatchFactory / StreamWalletFactory / ChilizSwapRouter use
    ///        Ownable → simple transferOwnership.
    ///      - LeaderboardRewards uses AccessControl (UUPS, no Ownable) →
    ///        grant the Safe DEFAULT_ADMIN_ROLE + ADMIN_ROLE + PAUSER_ROLE,
    ///        then renounce the deployer's roles. Note ORACLE_ROLE stays on
    ///        the initial holder (treasury by default) — admin can rotate
    ///        it post-deploy via grant/revoke.
    function _transferOwnershipToSafe() internal {
        console.log("TRANSFERRING OWNERSHIP TO SAFE");
        console.log("==============================");
        console.log("Target Safe:", treasury);

        pariFactory.transferOwnership(treasury);
        console.log("  pariFactory.transferOwnership    -> Safe");

        streamFactory.transferOwnership(treasury);
        console.log("  streamFactory.transferOwnership  -> Safe");

        swapRouter.transferOwnership(treasury);
        console.log("  swapRouter.transferOwnership     -> Safe");

        // LeaderboardRewards uses AccessControl. Grant the Safe every role
        // the deployer currently holds, then renounce from the deployer.
        bytes32 DEFAULT_ADMIN = 0x00;
        leaderboard.grantRole(DEFAULT_ADMIN, treasury);
        leaderboard.grantRole(leaderboard.ADMIN_ROLE(),  treasury);
        leaderboard.grantRole(leaderboard.PAUSER_ROLE(), treasury);
        leaderboard.renounceRole(leaderboard.PAUSER_ROLE(), deployer);
        leaderboard.renounceRole(leaderboard.ADMIN_ROLE(),  deployer);
        leaderboard.renounceRole(DEFAULT_ADMIN,             deployer);
        console.log("  leaderboard.{grant+renounce}     -> Safe holds admin");

        console.log("");
        console.log("WARNING: the deployer EOA can no longer call:");
        console.log("  pariFactory.{createFootballMatch, createBasketballMatch, setWiring, setImplementation}");
        console.log("  streamFactory.{setSwapRouter, setImplementation, upgradeWallet, ...}");
        console.log("  swapRouter.{setMatchFactory, setStreamWalletFactory, setTreasury, setPlatformFeeBps}");
        console.log("  leaderboard.{setMatchFactory, grantRole, revokeRole, upgradeToAndCall, pause}");
        console.log("Any such call must now come from the Safe.");
        console.log("");
    }

    // ══════════════════════════════════════════════════════════════════════════
    // OUTPUT
    // ══════════════════════════════════════════════════════════════════════════

    function _printHeader() internal view {
        console.log("==============================================");
        console.log("CHILIZTV PARI-MUTUEL PLATFORM - DEPLOY ALL");
        console.log("==============================================");
        console.log("Deployer         :", deployer);
        console.log("Treasury (Safe)  :", treasury);
        console.log("USDC             :", usdcAddress);
        console.log("WCHZ             :", wchz);
        console.log("Platform fee bps :", platformFeeBps);
        console.log("==============================================");
        console.log("");
    }

    function _printSummary() internal view {
        console.log("==============================================");
        console.log("DEPLOYMENT COMPLETE");
        console.log("==============================================");
        console.log("PariMatchFactory    :", address(pariFactory));
        console.log("StreamWalletFactory :", address(streamFactory));
        console.log("ChilizSwapRouter    :", address(swapRouter));
        console.log("LeaderboardRewards  :", address(leaderboard));
        console.log("Owner of contracts  :", transferOwnership ? treasury : deployer);
        if (!transferOwnership) {
            console.log("");
            console.log("Ownership held by deployer EOA -- set TRANSFER_OWNERSHIP=true");
            console.log("in production to hand ownership to SAFE_ADDRESS at deploy time.");
        }
        console.log("==============================================");
        console.log("");
    }

    function _printPostDeploymentSteps() internal pure {
        console.log("POST-DEPLOYMENT STEPS:");
        console.log("======================");
        console.log("1. Create your first match (factory owner only):");
        console.log("   cast send <PARI_FACTORY> \\");
        console.log("     'createFootballMatch(string,address,address)' \\");
        console.log("     <NAME> <MATCH_OWNER> <ORACLE>");
        console.log("");
        console.log("   This single tx deploys the proxy, sets USDC/feeRecipient,");
        console.log("   grants SWAP_ROUTER_ROLE to the router, grants RESOLVER_ROLE");
        console.log("   to the oracle, and hands admin roles to <MATCH_OWNER>.");
        console.log("");
        console.log("2. Add markets to the match (ADMIN_ROLE on match):");
        console.log("   cast send <MATCH> 'addMarketWithLine(bytes32,int16)' <TYPE> <LINE>");
        console.log("");
        console.log("3. Open markets and accept stakes:");
        console.log("   cast send <MATCH> 'openMarket(uint256)' <MARKET_ID>");
        console.log("");
        console.log("4. Close markets and resolve (oracle key):");
        console.log("   cast send <MATCH> 'closeMarket(uint256)' <MARKET_ID>");
        console.log("   cast send <MATCH> 'resolveMarket(uint256,uint64)' <MARKET_ID> <OUTCOME>");
        console.log("");
        console.log("5. Winners call claim(marketId) to receive their payout.");
        console.log("==============================================");
    }

    function _envUintOr(string memory key, uint256 defaultVal)
        internal view returns (uint256)
    {
        try vm.envUint(key) returns (uint256 v) { return v; }
        catch { return defaultVal; }
    }

    function _envBoolOr(string memory key, bool defaultVal)
        internal view returns (bool)
    {
        try vm.envBool(key) returns (bool v) { return v; }
        catch { return defaultVal; }
    }
}
