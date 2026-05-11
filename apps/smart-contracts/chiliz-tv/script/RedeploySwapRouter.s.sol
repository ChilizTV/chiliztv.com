// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console}    from "forge-std/Script.sol";
import {ChilizSwapRouter}   from "../src/swap/ChilizSwapRouter.sol";
import {PariMatchFactory}   from "../src/pari/PariMatchFactory.sol";
import {StreamWalletFactory} from "../src/streamer/StreamWalletFactory.sol";

/**
 * @title  RedeploySwapRouter
 * @notice Redeploys ONLY the ChilizSwapRouter and re-wires the existing
 *         PariMatchFactory + StreamWalletFactory to point at the new one.
 *         Factories and existing matches are left in place.
 *
 * Env:
 *   PARI_FACTORY_ADDRESS   — existing PariMatchFactory
 *   STREAM_FACTORY_ADDRESS — existing StreamWalletFactory
 *   USDC_ADDRESS, WCHZ_ADDRESS, SAFE_ADDRESS
 *   KAYEN_MASTER_ROUTER, KAYEN_ROUTER
 *   PLATFORM_FEE_BPS (optional, default 500)
 */
contract RedeploySwapRouter is Script {

    PariMatchFactory    public pariFactory;
    StreamWalletFactory public streamFactory;
    ChilizSwapRouter    public newRouter;

    address public usdcAddress;
    address public wchz;
    address public treasury;
    address public masterRouter;
    address public tokenRouter;
    uint16  public platformFeeBps;

    function run() external {
        _loadConfig();
        vm.startBroadcast();

        // Deploy new router.
        newRouter = new ChilizSwapRouter(
            masterRouter, tokenRouter, usdcAddress, wchz, treasury, platformFeeBps
        );
        console.log("New ChilizSwapRouter:", address(newRouter));

        // Wire factory -> router (needed before router registers factory).
        pariFactory.setWiring(usdcAddress, treasury, address(newRouter));
        console.log("  pariFactory.setWiring -> usdc/treasury/newRouter");

        // Router registers pari factory.
        newRouter.setMatchFactory(address(pariFactory));
        console.log("  newRouter.setMatchFactory ->", address(pariFactory));

        // Update stream factory pointer first (back-pointer check).
        streamFactory.setSwapRouter(address(newRouter));
        console.log("  streamFactory.setSwapRouter ->", address(newRouter));

        // Router registers stream factory.
        newRouter.setStreamWalletFactory(address(streamFactory));
        console.log("  newRouter.setStreamWalletFactory ->", address(streamFactory));

        vm.stopBroadcast();
    }

    function _loadConfig() internal {
        pariFactory    = PariMatchFactory(vm.envAddress("PARI_FACTORY_ADDRESS"));
        streamFactory  = StreamWalletFactory(vm.envAddress("STREAM_FACTORY_ADDRESS"));
        usdcAddress    = vm.envAddress("USDC_ADDRESS");
        wchz           = vm.envAddress("WCHZ_ADDRESS");
        treasury       = vm.envAddress("SAFE_ADDRESS");
        masterRouter   = vm.envAddress("KAYEN_MASTER_ROUTER");
        tokenRouter    = vm.envAddress("KAYEN_ROUTER");
        platformFeeBps = uint16(_envUintOr("PLATFORM_FEE_BPS", 500));
    }

    function _envUintOr(string memory key, uint256 def) internal view returns (uint256) {
        try vm.envUint(key) returns (uint256 v) { return v; } catch { return def; }
    }
}
