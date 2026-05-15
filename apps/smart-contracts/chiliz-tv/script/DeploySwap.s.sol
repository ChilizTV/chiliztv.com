// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {ChilizSwapRouter} from "../src/swap/ChilizSwapRouter.sol";

/**
 * @title DeploySwap
 * @author ChilizTV
 * @notice Deployment script for the unified ChilizSwapRouter
 *
 * @dev Deploys a single swap router that handles both betting and streaming swaps.
 *
 * PREREQUISITES:
 * ==============
 *   - PariMatchFactory should already exist (you wire the router to it after).
 *   - StreamWalletFactory should already exist if you want streaming flows
 *     (donate / subscribe) to work — otherwise those entrypoints revert.
 *
 * SCOPE:
 * ======
 * This script ONLY deploys the router. It does NOT wire anything: you'll
 * still need to run (post-deploy, in this order):
 *
 *   pariFactory.setWiring(usdc, feeRecip, NEW_ROUTER)
 *   newRouter.setMatchFactory(pariFactory)
 *   streamFactory.setSwapRouter(NEW_ROUTER)
 *   newRouter.setStreamWalletFactory(streamFactory)
 *
 * For a one-shot redeploy that wires + emits per-match migration commands,
 * use RedeploySwapRouter.s.sol instead.
 *
 * MATCH-LEVEL ROLE NOTE:
 * ======================
 * FUTURE matches created by the factory after `setWiring(NEW_ROUTER)` will
 * automatically receive SWAP_ROUTER_ROLE on the NEW router — the factory
 * handles this atomically at createXMatch time.
 *
 * EXISTING matches still hold SWAP_ROUTER_ROLE for whatever router was
 * configured when they were created. The factory renounced its admin role
 * on each match in that same tx, so the factory CANNOT rotate the role for
 * them. Each match's owner (typically the multisig you passed as `owner`
 * to createXMatch) must call:
 *
 *   match.revokeRole(SWAP_ROUTER_ROLE, OLD_ROUTER)
 *   match.grantRole(SWAP_ROUTER_ROLE,  NEW_ROUTER)
 *
 * ENVIRONMENT VARIABLES (required):
 * =================================
 *   KAYEN_MASTER_ROUTER - Kayen DEX MasterRouterV2 (CHZ → USDC path)
 *   KAYEN_ROUTER        - Kayen standard router  (ERC20 → USDC path)
 *   WCHZ_ADDRESS        - Wrapped CHZ token address
 *   USDC_ADDRESS        - USDC token address
 *   SAFE_ADDRESS        - Treasury / Safe multisig
 *
 * OPTIONAL:
 *   PLATFORM_FEE_BPS    - Platform fee in basis points (default: 500 = 5%)
 *   TRANSFER_OWNERSHIP  - "true" → transfer Ownable.owner of the new router
 *                          to SAFE_ADDRESS at the end. Default false.
 *
 * USAGE:
 * ======
 *   forge script script/DeploySwap.s.sol \
 *     --rpc-url $RPC_URL --broadcast --private-key $PRIVATE_KEY -vvvv
 */
contract DeploySwap is Script {
    ChilizSwapRouter public swapRouter;

    address public deployer;
    address public kayenMasterRouter;
    address public kayenRouter;
    address public wchz;
    address public usdcAddress;
    address public treasury;
    uint16  public platformFeeBps;
    bool    public transferOwnership;

    function run() external {
        deployer = msg.sender;

        // ─── Load required env vars ───────────────────────────────────────
        kayenMasterRouter = vm.envAddress("KAYEN_MASTER_ROUTER");
        kayenRouter       = vm.envAddress("KAYEN_ROUTER");
        wchz              = vm.envAddress("WCHZ_ADDRESS");
        usdcAddress       = vm.envAddress("USDC_ADDRESS");
        treasury          = vm.envAddress("SAFE_ADDRESS");

        // ─── Load optional env vars (with defaults) ───────────────────────
        try vm.envUint("PLATFORM_FEE_BPS") returns (uint256 fee) {
            platformFeeBps = uint16(fee);
        } catch {
            platformFeeBps = 500; // Default 5%
        }
        try vm.envBool("TRANSFER_OWNERSHIP") returns (bool v) {
            transferOwnership = v;
        } catch {
            transferOwnership = false;
        }

        // ─── Validation ───────────────────────────────────────────────────
        require(kayenMasterRouter != address(0), "KAYEN_MASTER_ROUTER required");
        require(kayenRouter       != address(0), "KAYEN_ROUTER required");
        require(wchz              != address(0), "WCHZ_ADDRESS required");
        require(usdcAddress       != address(0), "USDC_ADDRESS required");
        require(treasury          != address(0), "SAFE_ADDRESS required");
        // Distinctness is preferred but not required. On Chiliz Spicy testnet
        // only one usable Kayen-fork router is deployed at present, so the
        // operator pins both env vars to the same address. We warn instead of
        // hard-failing; mainnet operators should double-check.
        if (kayenMasterRouter == kayenRouter) {
            console.log("WARNING: KAYEN_MASTER_ROUTER == KAYEN_ROUTER");
            console.log("  Documented as distinct contracts; only same on Spicy testnet by design.");
            console.log("  Verify before broadcasting to mainnet.");
        }

        vm.startBroadcast();

        _printHeader();
        _deploySwapRouter();
        if (transferOwnership) {
            swapRouter.transferOwnership(treasury);
            console.log("swapRouter.transferOwnership ->", treasury);
            console.log("");
        }
        _printSummary();

        vm.stopBroadcast();
    }

    function _deploySwapRouter() internal {
        console.log("Deploying ChilizSwapRouter (unified)");
        console.log("------------------------------------");

        swapRouter = new ChilizSwapRouter(
            kayenMasterRouter,  // masterRouter (native CHZ swaps)
            kayenRouter,        // tokenRouter (ERC20-to-ERC20 swaps)
            usdcAddress,
            wchz,
            treasury,
            platformFeeBps
        );

        console.log("ChilizSwapRouter:", address(swapRouter));
        console.log("  Kayen Master Router:", kayenMasterRouter);
        console.log("  Kayen Token Router:", kayenRouter);
        console.log("  USDC:", usdcAddress);
        console.log("  WCHZ:", wchz);
        console.log("  Treasury:", treasury);
        console.log("  Platform Fee:", platformFeeBps, "bps");
        console.log("");
    }

    function _printHeader() internal view {
        console.log("=========================================");
        console.log("CHILIZ-TV SWAP ROUTER DEPLOYMENT");
        console.log("=========================================");
        console.log("");
        console.log("Deployer:", deployer);
        console.log("Treasury:", treasury);
        console.log("Kayen Router:", kayenRouter);
        console.log("WCHZ:", wchz);
        console.log("USDC:", usdcAddress);
        console.log("Platform Fee:", platformFeeBps, "bps");
        console.log("");
        console.log("=========================================");
        console.log("");
    }

    function _printSummary() internal view {
        console.log("=========================================");
        console.log("DEPLOYMENT COMPLETE!");
        console.log("=========================================");
        console.log("");
        console.log("DEPLOYED:");
        console.log("  ChilizSwapRouter:", address(swapRouter));
        console.log("  Owner           :", transferOwnership ? treasury : deployer);
        console.log("");
        console.log("=========================================");
        console.log("WIRING STEPS (REQUIRED):");
        console.log("=========================================");
        console.log("");
        console.log("Run these in order from the factory + router owner:");
        console.log("");
        console.log("  1. pariFactory.setWiring(USDC, FEE_RECIP, NEW_ROUTER)");
        console.log("       -- Future matches will receive SWAP_ROUTER_ROLE for");
        console.log("         this router atomically at createXMatch time.");
        console.log("");
        console.log("  2. newRouter.setMatchFactory(PARI_FACTORY)");
        console.log("       -- Lets placeBetWith* validate that the target match");
        console.log("         was deployed by the factory before sending USDC.");
        console.log("");
        console.log("  3. streamFactory.setSwapRouter(NEW_ROUTER)        // (skip if no streaming)");
        console.log("  4. newRouter.setStreamWalletFactory(STREAM_FACTORY)  // (skip if no streaming)");
        console.log("");
        console.log("=========================================");
        console.log("EXISTING-MATCH MIGRATION (if you're swapping routers):");
        console.log("=========================================");
        console.log("");
        console.log("Existing matches still hold SWAP_ROUTER_ROLE for the OLD router. The");
        console.log("factory CANNOT rotate this -- it renounced admin per match. Each match's");
        console.log("admin (the multisig you passed as `owner` to createXMatch) must run:");
        console.log("");
        console.log("  cast send <MATCH>  'revokeRole(bytes32,address)' \\");
        console.log("    $(cast keccak 'SWAP_ROUTER_ROLE')  <OLD_ROUTER>");
        console.log("  cast send <MATCH>  'grantRole(bytes32,address)' \\");
        console.log("    $(cast keccak 'SWAP_ROUTER_ROLE')  <NEW_ROUTER>");
        console.log("");
        console.log("Until those run, placeBetWithCHZ/Token via the NEW router reverts with");
        console.log("AccessControlUnauthorizedAccount. Direct placeBetUSDC keeps working.");
        console.log("(RedeploySwapRouter.s.sol prints these commands per match automatically.)");
        console.log("");
        console.log("=========================================");
        console.log("ROUTER ENTRYPOINTS:");
        console.log("=========================================");
        console.log("  Betting:");
        console.log("    placeBetWithCHZ{value:X}(matchAddr, marketId, outcome, minUSDCOut, deadline)");
        console.log("    placeBetWithToken(token, amount, matchAddr, marketId, outcome, minUSDCOut, deadline)");
        console.log("    placeBetWithUSDC(matchAddr, marketId, outcome, amount)");
        console.log("  Streaming (revert until setStreamWalletFactory is set):");
        console.log("    donateWith{CHZ,Token,USDC}(...)");
        console.log("    subscribeWith{CHZ,Token,USDC}(...)");
        console.log("=========================================");
    }
}
