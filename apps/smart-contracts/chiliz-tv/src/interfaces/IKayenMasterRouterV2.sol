// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IKayenMasterRouterV2
 * @notice Native-CHZ swap interface used by `ChilizSwapRouter._swapCHZToUSDC`.
 * @dev    On Chiliz Spicy testnet the routers Kayen advertises (e.g.
 *         0x4D3D…3079) do NOT implement the documented V1
 *         `swapExactETHForTokens(uint256,address[],bool,address,uint256)`
 *         variant — calling it reverts with empty data because the selector
 *         (0x56ba8c44) is absent from the bytecode. Every router we found
 *         on Spicy is a vanilla Uniswap-V2 fork using the standard 4-arg
 *         signature (selector 0x7ff36ab5). This interface mirrors that
 *         reality. path[0] must be WCHZ.
 *
 *         ⚠ MAINNET: do NOT wire Kayen's real MasterRouter (0xfAf3…2E9d)
 *         here. It shares selector 0x7ff36ab5 but always finishes with
 *         `_unwrapAndTransfer(path[last])`, which calls `getDecimalsOffset()`
 *         on the output token — USDC has no such function, so every swap
 *         ending in USDC reverts (verified on-chain 2026-06-11; caused the
 *         post-deploy mainnet outage). Point this at the vanilla V2 router
 *         (same address as KAYEN_ROUTER). Fan-token wrapping is handled by
 *         ChilizSwapRouter itself via IChilizWrapperFactory.
 */
interface IKayenMasterRouterV2 {
    /// @notice Swap exact native CHZ for tokens (e.g., USDC). Standard V2.
    function swapExactETHForTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable returns (uint256[] memory amounts);

    /// @notice Swap native CHZ for exact amount of output tokens. Standard V2.
    function swapETHForExactTokens(
        uint256 amountOut,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable returns (uint256[] memory amounts);
}
