// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console}     from "forge-std/Script.sol";
import {ChilizSwapRouter}    from "../src/swap/ChilizSwapRouter.sol";
import {PariMatchFactory}    from "../src/pari/PariMatchFactory.sol";
import {StreamWalletFactory} from "../src/streamer/StreamWalletFactory.sol";

/**
 * @title  RedeploySwapRouter
 * @notice Redeploys ONLY the ChilizSwapRouter and re-wires the existing
 *         PariMatchFactory + StreamWalletFactory to point at the new one.
 *
 * ⚠ EXISTING-MATCH MIGRATION REQUIRED ⚠
 *
 * Existing matches were granted SWAP_ROUTER_ROLE on the OLD router at the
 * time they were deployed. The factory renounced its admin role on each
 * match in that same transaction, so the factory CANNOT rotate the role for
 * them. Each match's admin (typically the multisig you passed as `owner`)
 * must run:
 *
 *   cast send <MATCH>  'revokeRole(bytes32,address)'  $SWAP_ROUTER_ROLE  <OLD_ROUTER>
 *   cast send <MATCH>  'grantRole(bytes32,address)'   $SWAP_ROUTER_ROLE  <NEW_ROUTER>
 *
 * Until they do, multi-asset bets (placeBetWithCHZ / placeBetWithToken) via
 * the NEW router will revert with `AccessControlUnauthorizedAccount` on
 * placeBetUSDCFor. Direct `placeBetUSDC` from the user keeps working.
 *
 * This script prints the exact cast commands for every existing match it
 * can find via `factory.getAllMatches()` so operators can paste them into
 * the multisig.
 *
 * Env:
 *   PARI_FACTORY_ADDRESS   — existing PariMatchFactory
 *   STREAM_FACTORY_ADDRESS — existing StreamWalletFactory
 *   USDC_ADDRESS, WCHZ_ADDRESS, SAFE_ADDRESS
 *   KAYEN_MASTER_ROUTER, KAYEN_ROUTER
 *   PLATFORM_FEE_BPS (optional, default 500)
 *   TRANSFER_OWNERSHIP (optional, default false) — when true, transfers
 *                       Ownable.owner of the new router to SAFE_ADDRESS.
 */
contract RedeploySwapRouter is Script {

    PariMatchFactory    public pariFactory;
    StreamWalletFactory public streamFactory;
    ChilizSwapRouter    public newRouter;
    address             public oldRouter;

    address public usdcAddress;
    address public wchz;
    address public treasury;
    address public masterRouter;
    address public tokenRouter;
    uint16  public platformFeeBps;
    bool    public transferOwnership;

    /// @dev SWAP_ROUTER_ROLE = keccak256("SWAP_ROUTER_ROLE"). Hardcoded so
    ///      the migration banner is readable without an extra read.
    bytes32 public constant SWAP_ROUTER_ROLE =
        keccak256("SWAP_ROUTER_ROLE");

    function run() external {
        _loadConfig();

        // Capture the router currently registered on the stream factory so we
        // can print accurate migration commands per match.
        oldRouter = streamFactory.swapRouter();

        vm.startBroadcast();

        // 1. Deploy new router.
        newRouter = new ChilizSwapRouter(
            masterRouter, tokenRouter, usdcAddress, wchz, treasury, platformFeeBps
        );
        console.log("New ChilizSwapRouter:", address(newRouter));

        // 2. Factory learns about the new router. Future matches will get
        //    SWAP_ROUTER_ROLE = newRouter atomically at creation.
        pariFactory.setWiring(usdcAddress, treasury, address(newRouter));
        console.log("  pariFactory.setWiring -> usdc/treasury/newRouter");

        // 3. New router registers the factory (validates match addresses).
        newRouter.setMatchFactory(address(pariFactory));
        console.log("  newRouter.setMatchFactory ->", address(pariFactory));

        // 4. Stream factory back-pointer first; the router enforces it.
        streamFactory.setSwapRouter(address(newRouter));
        console.log("  streamFactory.setSwapRouter ->", address(newRouter));

        // 5. Router registers stream factory.
        newRouter.setStreamWalletFactory(address(streamFactory));
        console.log("  newRouter.setStreamWalletFactory ->", address(streamFactory));

        // 6. Optional: hand ownership to Safe.
        if (transferOwnership) {
            newRouter.transferOwnership(treasury);
            console.log("  newRouter.transferOwnership ->", treasury);
        }

        vm.stopBroadcast();

        _printExistingMatchMigration();
    }

    // ──────────────────────────────────────────────────────────────────────

    function _loadConfig() internal {
        pariFactory       = PariMatchFactory(vm.envAddress("PARI_FACTORY_ADDRESS"));
        streamFactory     = StreamWalletFactory(vm.envAddress("STREAM_FACTORY_ADDRESS"));
        usdcAddress       = vm.envAddress("USDC_ADDRESS");
        wchz              = vm.envAddress("WCHZ_ADDRESS");
        treasury          = vm.envAddress("SAFE_ADDRESS");
        masterRouter      = vm.envAddress("KAYEN_MASTER_ROUTER");
        tokenRouter       = vm.envAddress("KAYEN_ROUTER");
        platformFeeBps    = uint16(_envUintOr("PLATFORM_FEE_BPS", 500));
        transferOwnership = _envBoolOr("TRANSFER_OWNERSHIP", false);

        // Distinctness is preferred but not required. On Chiliz Spicy testnet
        // only one usable Kayen-fork router is deployed at present, so the
        // operator pins both env vars to the same address. We warn instead of
        // hard-failing; mainnet operators should double-check.
        if (masterRouter == tokenRouter) {
            console.log("WARNING: KAYEN_MASTER_ROUTER == KAYEN_ROUTER");
            console.log("  Documented as distinct contracts; only same on Spicy testnet by design.");
            console.log("  Verify before broadcasting to mainnet.");
        }
    }

    /// @notice Print the cast commands the multisig must run per existing
    ///         match to rotate SWAP_ROUTER_ROLE. The router redeploy itself
    ///         CANNOT do this — the factory renounced admin per match at
    ///         creation time.
    function _printExistingMatchMigration() internal view {
        address[] memory matches = pariFactory.getAllMatches();

        console.log("");
        console.log("==============================================");
        console.log("EXISTING-MATCH MIGRATION REQUIRED");
        console.log("==============================================");
        console.log("Old router :", oldRouter);
        console.log("New router :", address(newRouter));
        console.log("Match count:", matches.length);
        console.log("SWAP_ROUTER_ROLE:");
        console.logBytes32(SWAP_ROUTER_ROLE);
        console.log("");

        if (matches.length == 0) {
            console.log("No existing matches to migrate.");
            console.log("==============================================");
            return;
        }

        console.log("For EACH match below, the match admin (multisig that received");
        console.log("DEFAULT_ADMIN_ROLE at createXMatch time) must run two txs:");
        console.log("");

        for (uint256 i = 0; i < matches.length; i++) {
            console.log("Match", i, ":", matches[i]);
            console.log("  revoke OLD router:");
            console.log("    cast send", matches[i], "\\");
            console.log("      'revokeRole(bytes32,address)' \\");
            console.log("      ");
            console.logBytes32(SWAP_ROUTER_ROLE);
            console.log("     ", oldRouter);
            console.log("  grant NEW router:");
            console.log("    cast send", matches[i], "\\");
            console.log("      'grantRole(bytes32,address)' \\");
            console.log("      ");
            console.logBytes32(SWAP_ROUTER_ROLE);
            console.log("     ", address(newRouter));
            console.log("");
        }

        console.log("Until each match completes both txs, placeBetWith{CHZ,Token}");
        console.log("via the NEW router will revert with AccessControlUnauthorizedAccount.");
        console.log("Direct placeBetUSDC from end-users keeps working.");
        console.log("==============================================");
    }

    function _envUintOr(string memory key, uint256 def) internal view returns (uint256) {
        try vm.envUint(key) returns (uint256 v) { return v; } catch { return def; }
    }

    function _envBoolOr(string memory key, bool def) internal view returns (bool) {
        try vm.envBool(key) returns (bool v) { return v; } catch { return def; }
    }
}
