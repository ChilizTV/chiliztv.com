// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console}    from "forge-std/Script.sol";
import {PariMatchFactory}   from "../src/pari/PariMatchFactory.sol";

/// @dev Minimal AccessControl slice. Each `PariMatch` proxy is a
///      `PariMatchBase` that inherits `AccessControlUpgradeable`, so we
///      only need these three methods. Inlining keeps the script
///      self-contained and lets us call any AC-enabled target.
interface IAccessControlSlice {
    function hasRole(bytes32 role, address account) external view returns (bool);
    function grantRole(bytes32 role, address account) external;
    function revokeRole(bytes32 role, address account) external;
}

/**
 * @title  RotateSwapRouterRoleOnMatches
 * @author ChilizTV
 * @notice One-off utility to rotate `SWAP_ROUTER_ROLE` from `OLD_ROUTER`
 *         (optional, revoked if set) to `NEW_ROUTER` (granted) on every
 *         match the broadcaster admins.
 *
 *         Fills the gap left by `RedeploySwapRouter.s.sol`, which only
 *         updates the factory's pointer (`setWiring`) — that affects
 *         FUTURE matches but cannot rotate the role on already-deployed
 *         ones because the factory renounced its admin per match at
 *         creation time. The match admin (= whoever was passed as
 *         `_owner` to `createXMatch`) is the only address that can do it.
 *         On testnet that's typically the deployer EOA; on mainnet it's a
 *         Safe multisig.
 *
 * Behavior, per match (read from `MATCHES` if set, otherwise from
 * `factory.getAllMatches()`):
 *   - If the broadcaster does not hold `DEFAULT_ADMIN_ROLE` → skip and log.
 *   - If `OLD_ROUTER` is set AND the match still holds the role for it →
 *     revoke it.
 *   - If the match does not already hold the role for `NEW_ROUTER` →
 *     grant it. Otherwise log "already".
 *
 * The script is idempotent: re-running after a partial failure picks up
 * exactly where the previous run stopped.
 *
 * ENVIRONMENT VARIABLES:
 *   PRIVATE_KEY           — Broadcaster. Must hold DEFAULT_ADMIN_ROLE on
 *                           each target match (otherwise that match is
 *                           skipped with a warning, not a revert).
 *   PARI_FACTORY_ADDRESS  — Used to enumerate matches when `MATCHES` is
 *                           unset.
 *   NEW_ROUTER            — Address to grant SWAP_ROUTER_ROLE to.
 *   OLD_ROUTER (optional) — Address to revoke SWAP_ROUTER_ROLE from. If
 *                           unset, only grants happen.
 *   MATCHES    (optional) — Comma-separated explicit match list. Overrides
 *                           `factory.getAllMatches()` when set. Useful for
 *                           targeting only the matches whose grants
 *                           previously failed.
 *
 * USAGE:
 *   PRIVATE_KEY=0x... \
 *   PARI_FACTORY_ADDRESS=0xbf6368a5ffbac70f923bbae80491226bd10a870f \
 *   NEW_ROUTER=0x02d003d8e1e3d3996f61b3f3e35a591fceb18a44 \
 *   forge script script/RotateSwapRouterRoleOnMatches.s.sol \
 *     --rpc-url https://spicy-rpc.chiliz.com --broadcast -vvvv
 *
 *   To also revoke the previous router's role:
 *   OLD_ROUTER=0xe8aEaeFF70B052BfC27663985A17CB77F96E5b91 (same line) ...
 */
contract RotateSwapRouterRoleOnMatches is Script {

    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;
    bytes32 public constant SWAP_ROUTER_ROLE   = keccak256("SWAP_ROUTER_ROLE");

    address public broadcaster;
    address public newRouter;
    address public oldRouter;
    PariMatchFactory public pariFactory;

    // Tallies for the post-run summary.
    uint256 public granted;
    uint256 public alreadyGranted;
    uint256 public revoked;
    uint256 public skippedNoAdmin;
    uint256 public total;

    function run() external {
        broadcaster = msg.sender;
        newRouter   = vm.envAddress("NEW_ROUTER");
        if (newRouter == address(0)) revert("NEW_ROUTER required");

        oldRouter = _envAddressOr("OLD_ROUTER", address(0));

        address[] memory matches = _loadMatches();
        total = matches.length;

        _printHeader();

        vm.startBroadcast();
        for (uint256 i = 0; i < matches.length; i++) {
            _rotateOne(matches[i]);
        }
        vm.stopBroadcast();

        _printSummary();
    }

    // ──────────────────────────────────────────────────────────────────────

    function _rotateOne(address matchAddr) internal {
        IAccessControlSlice mm = IAccessControlSlice(matchAddr);

        bool canAdmin = mm.hasRole(DEFAULT_ADMIN_ROLE, broadcaster);
        if (!canAdmin) {
            skippedNoAdmin++;
            console.log("  [skip-no-admin]", matchAddr);
            return;
        }

        if (oldRouter != address(0) && mm.hasRole(SWAP_ROUTER_ROLE, oldRouter)) {
            mm.revokeRole(SWAP_ROUTER_ROLE, oldRouter);
            revoked++;
            console.log("  [revoked OLD]  ", matchAddr);
        }

        if (mm.hasRole(SWAP_ROUTER_ROLE, newRouter)) {
            alreadyGranted++;
            console.log("  [already]      ", matchAddr);
            return;
        }

        mm.grantRole(SWAP_ROUTER_ROLE, newRouter);
        granted++;
        console.log("  [granted NEW]  ", matchAddr);
    }

    function _loadMatches() internal returns (address[] memory) {
        string memory raw;
        try vm.envString("MATCHES") returns (string memory v) { raw = v; } catch {}

        if (bytes(raw).length > 0) {
            return _parseAddresses(raw);
        }

        address factoryAddr = vm.envAddress("PARI_FACTORY_ADDRESS");
        if (factoryAddr == address(0)) {
            revert("PARI_FACTORY_ADDRESS required when MATCHES is unset");
        }
        pariFactory = PariMatchFactory(factoryAddr);
        return pariFactory.getAllMatches();
    }

    function _envAddressOr(string memory key, address def) internal view returns (address) {
        try vm.envAddress(key) returns (address v) { return v; } catch { return def; }
    }

    function _printHeader() internal view {
        console.log("==============================================");
        console.log("ROTATE SWAP_ROUTER_ROLE ON MATCHES");
        console.log("==============================================");
        console.log("Broadcaster:", broadcaster);
        console.log("New router :", newRouter);
        if (oldRouter == address(0)) {
            console.log("Old router : <not set, grants only>");
        } else {
            console.log("Old router :", oldRouter);
        }
        console.log("Match count:", total);
        console.log("");
    }

    function _printSummary() internal view {
        console.log("");
        console.log("==============================================");
        console.log("ROTATION SUMMARY");
        console.log("==============================================");
        console.log("granted        :", granted);
        console.log("already granted:", alreadyGranted);
        console.log("revoked        :", revoked);
        console.log("skip-no-admin  :", skippedNoAdmin);
        console.log("total scanned  :", total);
        console.log("==============================================");
        if (skippedNoAdmin > 0) {
            console.log("");
            console.log("Skipped matches still need a grant from their admin.");
            console.log("Re-run this script broadcasting from the right key, or");
            console.log("paste the per-match cast send commands the admin runs.");
        }
    }

    // ─── address-list parser (lifted from UpgradeStreaming.s.sol) ─────────

    function _parseAddresses(string memory raw) internal pure returns (address[] memory) {
        uint256 count = 1;
        bytes memory b = bytes(raw);
        for (uint256 i = 0; i < b.length; i++) {
            if (b[i] == ",") count++;
        }
        address[] memory addrs = new address[](count);
        uint256 idx;
        uint256 start;
        for (uint256 i = 0; i <= b.length; i++) {
            if (i == b.length || b[i] == ",") {
                bytes memory slice = new bytes(i - start);
                for (uint256 j = 0; j < slice.length; j++) {
                    slice[j] = b[start + j];
                }
                addrs[idx++] = _parseAddr(string(slice));
                start = i + 1;
            }
        }
        return addrs;
    }

    function _parseAddr(string memory s) internal pure returns (address) {
        bytes memory b = bytes(s);
        uint256 result;
        uint256 start = (b.length >= 2 && b[0] == "0" && (b[1] == "x" || b[1] == "X")) ? 2 : 0;
        for (uint256 i = start; i < b.length; i++) {
            result <<= 4;
            uint8 c = uint8(b[i]);
            if (c >= 48 && c <= 57)       result |= c - 48;
            else if (c >= 65 && c <= 70)  result |= c - 55;
            else if (c >= 97 && c <= 102) result |= c - 87;
        }
        // forge-lint: disable-next-line(unsafe-typecast)
        return address(uint160(result));
    }
}
