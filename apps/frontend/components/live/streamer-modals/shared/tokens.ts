import type { Address } from "viem";
import { chilizConfig } from "@/config/chiliz.config";
import { tokenLogoFor } from "@/lib/tokens/tokenLogo";

/**
 * Token kinds the donation / subscription modals can consume.
 * Mirrors the route discrimination required by `ChilizSwapRouter.donate` /
 * `subscribe`: USDC direct, native CHZ, or any ERC-20 fan token.
 */
export type StreamerTokenKind =
  | { kind: "USDC" }
  | { kind: "CHZ" }
  | { kind: "ERC20"; address: Address; symbol: string; name: string };

export interface StreamerTokenView {
  /** Discriminator for the wallet/router call. */
  token: StreamerTokenKind;
  /** Display symbol used in chips, picker rows, sub-labels. */
  symbol: string;
  /** Long display name. */
  name: string;
  /** Logo URL from the public assets folder, or `null` if none. */
  logo: string | null;
  /** True when this token requires a Kayen swap on the wallet path. */
  swapRouted: boolean;
}

const NATIVE_DECIMALS = 18;
const FAN_TOKEN_DECIMALS = 18;

/** Build the (always-present) USDC + CHZ + active fan-token list. */
export function buildStreamerTokenList(): StreamerTokenView[] {
  const fanTokens: StreamerTokenView[] = (chilizConfig.tokens || [])
    .filter((t) => !!t.tokenAddress)
    .map((t) => ({
      token: {
        kind: "ERC20" as const,
        address: t.tokenAddress as Address,
        symbol: t.symbol,
        name: t.name,
      },
      symbol: t.symbol,
      name: t.name,
      logo: tokenLogoFor(t.symbol),
      swapRouted: true,
    }));

  return [
    {
      token: { kind: "USDC" },
      symbol: "USDC",
      name: "USD Coin",
      logo: tokenLogoFor("USDC"),
      swapRouted: false,
    },
    {
      token: { kind: "CHZ" },
      symbol: "CHZ",
      name: "Chiliz",
      logo: tokenLogoFor("CHZ"),
      swapRouted: true,
    },
    ...fanTokens,
  ];
}

/** Decimals for a given token (USDC reads from the pool, CHZ/ERC20 are 18). */
export function decimalsFor(
  token: StreamerTokenKind,
  usdcDecimals: number | undefined,
): number | undefined {
  if (token.kind === "USDC") return usdcDecimals;
  if (token.kind === "CHZ") return NATIVE_DECIMALS;
  return FAN_TOKEN_DECIMALS;
}

/** Display symbol for a token kind. */
export function symbolFor(token: StreamerTokenKind): string {
  if (token.kind === "USDC") return "USDC";
  if (token.kind === "CHZ") return "CHZ";
  return token.symbol;
}

/** ERC-20 address (USDC, CHZ has none, fan tokens use their own). */
export function erc20AddressFor(token: StreamerTokenKind): Address | undefined {
  if (token.kind === "USDC") return chilizConfig.usdc;
  if (token.kind === "ERC20") return token.address;
  return undefined;
}

/**
 * Maps the modal's discriminated-token shape to the union the
 * `useChilizSwapRouter` `donate` / `subscribe` helpers expect.
 */
export function toRouterToken(
  token: StreamerTokenKind,
): "USDC" | "CHZ" | Address {
  if (token.kind === "USDC") return "USDC";
  if (token.kind === "CHZ") return "CHZ";
  return token.address;
}
