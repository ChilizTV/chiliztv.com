// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20}                 from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20}                from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata}        from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {IChilizWrapperFactory} from "../../src/interfaces/IChilizWrapperFactory.sol";

/// @dev 18-decimals wrapped fan token, mint/burn restricted to the factory.
contract MockWrappedFanToken is ERC20 {
    address public immutable factory;
    address public immutable underlying;

    constructor(address _underlying) ERC20("Wrapped Fan Token", "wFAN") {
        factory    = msg.sender;
        underlying = _underlying;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == factory, "only factory");
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        require(msg.sender == factory, "only factory");
        _burn(from, amount);
    }
}

/**
 * @title MockChilizWrapperFactory
 * @notice Mock of Kayen's ChilizWrapperFactory for Foundry tests.
 * @dev Mirrors the real semantics ChilizSwapRouter relies on:
 *      - `wrap` pulls the underlying from msg.sender (prior approval needed)
 *        and mints amount * 10^(18 - underlyingDecimals) wrapped to `account`;
 *      - `underlyingToWrapped` returns address(0) until created;
 *      - `createWrappedToken` is PERMISSIONLESS, like the real factory —
 *        which is exactly what the router's 18-decimals guard defends against.
 */
contract MockChilizWrapperFactory is IChilizWrapperFactory {
    mapping(address => address) public underlyingToWrapped;
    mapping(address => address) public wrappedToUnderlying;

    function createWrappedToken(address underlyingToken) public returns (address wrapped) {
        wrapped = underlyingToWrapped[underlyingToken];
        if (wrapped != address(0)) return wrapped;
        wrapped = address(new MockWrappedFanToken(underlyingToken));
        underlyingToWrapped[underlyingToken] = wrapped;
        wrappedToUnderlying[wrapped]         = underlyingToken;
    }

    function wrap(address account, address underlyingToken, uint256 amount)
        external
        returns (address wrappedToken)
    {
        wrappedToken = createWrappedToken(underlyingToken);
        require(IERC20(underlyingToken).transferFrom(msg.sender, address(this), amount), "pull failed");
        uint256 offset = 10 ** (18 - IERC20Metadata(underlyingToken).decimals());
        MockWrappedFanToken(wrappedToken).mint(account, amount * offset);
    }

    function unwrap(address account, address wrappedToken, uint256 amount) external {
        address underlying = wrappedToUnderlying[wrappedToken];
        require(underlying != address(0), "unknown wrapped");
        uint256 offset = 10 ** (18 - IERC20Metadata(underlying).decimals());
        MockWrappedFanToken(wrappedToken).burn(msg.sender, amount);
        require(IERC20(underlying).transfer(account, amount / offset), "return failed");
    }

    function wrappedTokenFor(address underlyingToken) external view returns (address) {
        return underlyingToWrapped[underlyingToken];
    }
}
