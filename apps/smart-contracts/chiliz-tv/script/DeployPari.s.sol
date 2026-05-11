// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {ERC1967Proxy}    from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import {FootballPariMatch}   from "../src/pari/FootballPariMatch.sol";
import {BasketballPariMatch} from "../src/pari/BasketballPariMatch.sol";
import {PariMatchFactory}    from "../src/pari/PariMatchFactory.sol";
import {ChilizSwapRouter}    from "../src/swap/ChilizSwapRouter.sol";

/**
 * @title DeployPari
 * @notice Deploys the pari-mutuel betting system.
 *
 * Required environment variables:
 *   DEPLOYER_PRIVATE_KEY  — deployer / factory owner
 *   OWNER_ADDRESS         — multi-sig that receives admin roles on matches
 *   ORACLE_ADDRESS        — resolver (backend oracle key)
 *   FEE_RECIPIENT         — address that receives protocol fees
 *   USDC_ADDRESS          — USDC on target chain
 *   MASTER_ROUTER         — Kayen MasterRouterV2
 *   TOKEN_ROUTER          — Kayen token router
 *   WCHZ_ADDRESS          — Wrapped CHZ
 *   PLATFORM_FEE_BPS      — Streaming platform fee (e.g. 500 = 5%)
 *
 * Optional (skip router deployment if already deployed):
 *   EXISTING_ROUTER       — if set, the script skips deploying a new router
 */
contract DeployPari is Script {

    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address owner       = vm.envAddress("OWNER_ADDRESS");
        address oracle      = vm.envAddress("ORACLE_ADDRESS");
        address feeRecip    = vm.envAddress("FEE_RECIPIENT");
        address usdcAddr    = vm.envAddress("USDC_ADDRESS");

        // ── Swap router config ──────────────────────────────────────────────
        address masterRouter    = vm.envAddress("MASTER_ROUTER");
        address tokenRouter     = vm.envAddress("TOKEN_ROUTER");
        address wchz            = vm.envAddress("WCHZ_ADDRESS");
        uint16  platformFeeBps  = uint16(vm.envUint("PLATFORM_FEE_BPS"));
        address treasuryAddr    = feeRecip; // streaming fees go to same address as betting fees

        vm.startBroadcast(deployerKey);

        // 1. Deploy PariMatchFactory (deploys implementations internally).
        PariMatchFactory factory = new PariMatchFactory();
        console.log("PariMatchFactory  :", address(factory));
        console.log("  FootballImpl    :", factory.footballImplementation());
        console.log("  BasketballImpl  :", factory.basketballImplementation());

        // 2. Deploy ChilizSwapRouter.
        ChilizSwapRouter router = new ChilizSwapRouter(
            masterRouter,
            tokenRouter,
            usdcAddr,
            wchz,
            treasuryAddr,
            platformFeeBps
        );
        console.log("ChilizSwapRouter  :", address(router));

        // 3. Wire factory: USDC + feeRecipient + swapRouter.
        factory.setWiring(usdcAddr, feeRecip, address(router));
        console.log("Factory wiring set.");

        // 4. Register factory on router.
        router.setMatchFactory(address(factory));
        console.log("Router: factory registered.");

        // 5. Deploy a sample FootballPariMatch (Barcelona vs Real Madrid).
        address footballMatch = factory.createFootballMatch(
            "Barcelona vs Real Madrid",
            owner,
            oracle
        );
        console.log("FootballPariMatch  :", footballMatch);

        vm.stopBroadcast();

        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("PariMatchFactory    :", address(factory));
        console.log("ChilizSwapRouter    :", address(router));
        console.log("Sample FootballMatch:", footballMatch);
    }
}
