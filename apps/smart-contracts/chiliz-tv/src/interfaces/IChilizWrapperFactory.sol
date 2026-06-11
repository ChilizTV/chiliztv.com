// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IChilizWrapperFactory
 * @notice Kayen's fan-token wrapper factory. CAP-20 fan tokens have 0 decimals
 *         and NO liquidity of their own on the Kayen DEX — all pools are
 *         denominated in the 18-decimals wrapped version this factory mints
 *         (1 underlying unit -> 10^(18 - underlyingDecimals) wrapped units).
 *         Mainnet: 0xAEdcF2bf41891777c5F638A098bbdE1eDBa7B264.
 * @dev    `wrap` pulls `amount` of `underlyingToken` from msg.sender (requires
 *         prior approval), deploys the wrapped token on first use, and mints
 *         the wrapped amount to `account`. `underlyingToWrapped` returns
 *         address(0) until the wrapped token has been created; `wrappedTokenFor`
 *         always returns the deterministic CREATE2 address.
 */
interface IChilizWrapperFactory {
    function wrap(address account, address underlyingToken, uint256 amount)
        external
        returns (address wrappedToken);

    function unwrap(address account, address wrappedToken, uint256 amount) external;

    function underlyingToWrapped(address underlyingToken) external view returns (address);

    function wrappedTokenFor(address underlyingToken) external view returns (address);
}
