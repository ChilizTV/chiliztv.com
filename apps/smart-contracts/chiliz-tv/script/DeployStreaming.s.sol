// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";

// Import streaming system contracts
import {StreamWalletFactory} from "../src/streamer/StreamWalletFactory.sol";

/**
 * @title DeployStreaming
 * @author ChilizTV
 * @notice Deployment script for the Streaming System (UUPS Proxy)
 * @dev Deploys StreamWalletFactory which creates ERC1967 UUPS proxies
 * 
 * ARCHITECTURE:
 * ============
 * - StreamWallet: UUPS upgradeable implementation with subscription & donation logic
 * - StreamWalletFactory: Factory that deploys ERC1967 proxy instances
 * - Each streamer gets their own UUPS proxy wallet
 * - Each wallet upgrades individually (streamer controls their own upgrades)
 * 
 * STREAMING FLOW:
 * ==============
 * 1. Factory creates a StreamWallet UUPS proxy for a streamer
 * 2. Users subscribe/donate with native CHZ
 * 3. Platform fee split to treasury
 * 4. Streamer receives net amount
 * 5. Streamer can withdraw anytime
 * 6. Streamer can upgrade their wallet via UUPS
 * 
 * USAGE:
 * =====
 * Required env:
 *   SAFE_ADDRESS         Safe multisig (treasury) — receives platform fees
 *   KAYEN_ROUTER         Kayen DEX router
 *   USDC_ADDRESS         USDC token
 *
 * Optional env:
 *   PLATFORM_FEE_BPS     Default 500 (= 5%)
 *   TRANSFER_OWNERSHIP   "true" → factory.transferOwnership(SAFE_ADDRESS) at
 *                         the end of the run. Default false. Note: ownership
 *                         transfer is normally deferred until AFTER
 *                         setSwapRouter() wiring, so the default leaves it to
 *                         the operator. Setting to "true" here transfers
 *                         immediately, which is fine if you'll handle the
 *                         setSwapRouter wiring via the Safe.
 *
 * Run:
 *   forge script script/DeployStreaming.s.sol \
 *     --rpc-url $RPC_URL --broadcast --private-key $PRIVATE_KEY --verify
 */
contract DeployStreaming is Script {
    
    // ============================================================================
    // DEPLOYED CONTRACTS
    // ============================================================================
    
    StreamWalletFactory public factory;

    address public deployer;
    address public treasury;    // Safe multisig
    address public kayenRouter; // Kayen DEX router
    address public usdc;        // USDC token
    uint16  public platformFeeBps;
    bool    public transferOwnership;


    // ============================================================================
    // MAIN DEPLOYMENT
    // ============================================================================

    function run() external {
        deployer = msg.sender;

        // All four are required up-front so the factory ships in a usable state.
        // The previous version passed address(0) for kayenRouter/usdc and relied on
        // post-deploy setter txs that were easy to forget — every subscribe/donate
        // call would revert until they ran. Fail fast here instead.
        treasury    = vm.envAddress("SAFE_ADDRESS");
        kayenRouter = vm.envAddress("KAYEN_ROUTER");
        usdc        = vm.envAddress("USDC_ADDRESS");

        require(treasury    != address(0), "SAFE_ADDRESS required");
        require(kayenRouter != address(0), "KAYEN_ROUTER required");
        require(usdc        != address(0), "USDC_ADDRESS required");

        try vm.envUint("PLATFORM_FEE_BPS") returns (uint256 v) {
            platformFeeBps = uint16(v);
        } catch {
            platformFeeBps = 500;
        }
        try vm.envBool("TRANSFER_OWNERSHIP") returns (bool v) {
            transferOwnership = v;
        } catch {
            transferOwnership = false;
        }

        vm.startBroadcast();

        _printHeader();
        _deployFactory();
        // Ownership transfer is opt-in. The expected production flow is:
        //   1) deploy here (deployer keeps owner)
        //   2) wire the router (factory.setSwapRouter)
        //   3) transfer to Safe
        // ...but if you're handling step 2 via the Safe anyway, you can flip
        // TRANSFER_OWNERSHIP=true and skip the manual transfer.
        if (transferOwnership) {
            factory.transferOwnership(treasury);
            console.log("factory.transferOwnership ->", treasury);
            console.log("");
        }
        _printSummary();

        vm.stopBroadcast();
    }
    
    
    // ============================================================================
    // DEPLOYMENT STEPS
    // ============================================================================
    
    /**
     * @notice Deploy StreamWalletFactory (deploys implementation internally)
     * @dev Factory creates ERC1967 UUPS proxies for streamers
     */
    function _deployFactory() internal {
        console.log("Deploying StreamWalletFactory");
        console.log("-----------------------------");

        factory = new StreamWalletFactory(
            deployer,
            treasury,
            platformFeeBps,
            kayenRouter, // Kayen DEX router (required)
            usdc         // USDC token       (required)
        );
        console.log("StreamWalletFactory:", address(factory));
        console.log("  Owner:", deployer);
        console.log("  Implementation: deployed internally");
        console.log("  Treasury:", treasury);
        console.log("  Kayen Router:", kayenRouter);
        console.log("  USDC:", usdc);
        console.log("  Platform Fee bps:", platformFeeBps);
        console.log("");
    }
    
    // ============================================================================
    // HELPER FUNCTIONS
    // ============================================================================
    
    function _printHeader() internal view {
        console.log("=====================================");
        console.log("CHILIZ-TV STREAMING SYSTEM DEPLOYMENT");
        console.log("=====================================");
        console.log("");
        console.log("Deployer:", deployer);
        console.log("Safe/Treasury:", treasury);
        console.log("Kayen Router:", kayenRouter);
        console.log("USDC:", usdc);
        console.log("");
        console.log("=====================================");
        console.log("");
    }
    
    function _printSummary() internal view {
        console.log("=====================================");
        console.log("DEPLOYMENT COMPLETE!");
        console.log("=====================================");
        console.log("");
        
        console.log("DEPLOYED CONTRACTS:");
        console.log("------------------");
        console.log("StreamWalletFactory:", address(factory));
        console.log("  (Implementation deployed internally)");
        if (transferOwnership) {
            console.log("  Owner:", treasury, "(transferred at deploy)");
        } else {
            console.log("  Owner:", deployer, "(transfer to Safe after setSwapRouter wiring)");
        }
        console.log("");
        
        console.log("CREATE A STREAM WALLET:");
        console.log("----------------------");
        console.log("cast send", address(factory));
        console.log("  'deployWalletFor(address)'");
        console.log("  <STREAMER_ADDRESS>");
        console.log("");
        
        console.log("SUBSCRIBE TO STREAM:");
        console.log("-------------------");
        console.log("cast send", address(factory), "--value 1ether");
        console.log("  'subscribeToStream(address,uint256,uint256,address)'");
        console.log("  <STREAMER_ADDRESS> <DURATION_SECONDS> <AMOUNT> <TOKEN_ADDRESS>");
        console.log("");
    }
}
