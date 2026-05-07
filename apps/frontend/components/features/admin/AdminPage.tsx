"use client";

import { useEffect, useState } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { Copy, ExternalLink, CheckCircle2, XCircle, Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import { keccak256, toBytes } from "viem";
import { chilizConfig, networkType } from "@/config/chiliz.config";
import { ReadCard, WriteCard, AbiFn } from "./FunctionCard";
import type { Abi } from "viem";

const MATCH_ROLE = keccak256(toBytes("MATCH_ROLE"));

const explorerTxUrl = (hash: string) =>
  networkType === "mainnet"
    ? `https://explorer.chiliz.com/tx/${hash}`
    : `https://spicy-explorer.chiliz.com/tx/${hash}`;

import BettingMatchFactoryJSON from "@/artifacts/BettingMatchFactory.json";
import BettingMatchJSON from "@/artifacts/BettingMatch.json";
import StreamWalletFactoryJSON from "@/artifacts/StreamWalletFactory.json";
import StreamWalletJSON from "@/artifacts/StreamWallet.json";
import LiquidityPoolJSON from "@/artifacts/LiquidityPool.json";
import ChilizSwapRouterJSON from "@/artifacts/ChilizSwapRouter.json";

// ─── ABIs ─────────────────────────────────────────────────────────────────────

const FACTORY_ABI = BettingMatchFactoryJSON.abi as Abi;
const MATCH_ABI = BettingMatchJSON.abi as Abi;
const STREAM_FACTORY_ABI = StreamWalletFactoryJSON.abi as Abi;
const STREAM_WALLET_ABI = StreamWalletJSON.abi as Abi;
const POOL_ABI = LiquidityPoolJSON.abi as Abi;
const SWAP_ROUTER_ABI = ChilizSwapRouterJSON.abi as Abi;

// ─── Function definitions ─────────────────────────────────────────────────────

const BETTING_FACTORY_READ: AbiFn[] = [
  { name: "owner",          inputs: [], stateMutability: "view", description: "Owner of the factory" },
  { name: "getAllMatches",   inputs: [], stateMutability: "view", description: "Returns all deployed match proxy addresses" },
  { name: "liquidityPool",  inputs: [], stateMutability: "view", description: "Wired liquidity pool address" },
  { name: "usdcToken",      inputs: [], stateMutability: "view", description: "Wired USDC token address" },
  { name: "swapRouter",     inputs: [], stateMutability: "view", description: "Wired ChilizSwapRouter address" },
  { name: "footballImplementation",   inputs: [], stateMutability: "view", description: "Current FootballMatch implementation" },
  { name: "basketballImplementation", inputs: [], stateMutability: "view", description: "Current BasketballMatch implementation" },
  {
    name: "isMatch",
    inputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    description: "Returns true if address is a deployed match proxy",
  },
  {
    name: "getSportType",
    inputs: [{ name: "matchAddress", type: "address" }],
    stateMutability: "view",
    description: "0 = FOOTBALL, 1 = BASKETBALL",
  },
];

const BETTING_FACTORY_WRITE: AbiFn[] = [
  {
    name: "createFootballMatch",
    inputs: [
      { name: "_matchName", type: "string" },
      { name: "_owner", type: "address" },
      { name: "_oracle", type: "address" },
    ],
    stateMutability: "nonpayable",
    description: "Deploy a new FootballMatch proxy, wire it, and authorize it in the pool",
  },
  {
    name: "createBasketballMatch",
    inputs: [
      { name: "_matchName", type: "string" },
      { name: "_owner", type: "address" },
      { name: "_oracle", type: "address" },
    ],
    stateMutability: "nonpayable",
    description: "Deploy a new BasketballMatch proxy",
  },
  {
    name: "setWiring",
    inputs: [
      { name: "_liquidityPool", type: "address" },
      { name: "_usdcToken",     type: "address" },
      { name: "_swapRouter",    type: "address" },
    ],
    stateMutability: "nonpayable",
    description: "Set all three wiring addresses at once (onlyOwner)",
  },
  {
    name: "setFootballImplementation",
    inputs: [{ name: "newImpl", type: "address" }],
    stateMutability: "nonpayable",
    description: "Point to a new FootballMatch implementation (onlyOwner)",
  },
  {
    name: "setBasketballImplementation",
    inputs: [{ name: "newImpl", type: "address" }],
    stateMutability: "nonpayable",
    description: "Point to a new BasketballMatch implementation (onlyOwner)",
  },
  {
    name: "transferOwnership",
    inputs: [{ name: "newOwner", type: "address" }],
    stateMutability: "nonpayable",
    description: "Transfer factory ownership (onlyOwner)",
  },
];

const BETTING_MATCH_READ: AbiFn[] = [
  { name: "matchName",      inputs: [], stateMutability: "view", description: "Human-readable match name" },
  { name: "sportType",      inputs: [], stateMutability: "view", description: "Sport type string" },
  { name: "marketCount",    inputs: [], stateMutability: "view", description: "Number of markets created" },
  { name: "paused",         inputs: [], stateMutability: "view", description: "Whether the contract is paused" },
  { name: "owner",          inputs: [], stateMutability: "view", description: "Match owner" },
  { name: "usdcToken",      inputs: [], stateMutability: "view", description: "Wired USDC token" },
  { name: "liquidityPool",  inputs: [], stateMutability: "view", description: "Wired liquidity pool" },
  { name: "maxAllowedOdds", inputs: [], stateMutability: "view", description: "Max odds cap (ODDS_PRECISION = 10000)" },
  {
    name: "getCurrentOdds",
    inputs: [{ name: "marketId", type: "uint256" }],
    stateMutability: "view",
    description: "Current odds for a market (10000 = 1.00x)",
  },
  {
    name: "getMarketInfo",
    inputs: [{ name: "marketId", type: "uint256" }],
    stateMutability: "view",
    description: "Market type, state, odds, result, totalPool",
  },
  {
    name: "getMarketCore",
    inputs: [{ name: "marketId", type: "uint256" }],
    stateMutability: "view",
    description: "Full MarketCore struct",
  },
  {
    name: "getMarketLiability",
    inputs: [{ name: "marketId", type: "uint256" }],
    stateMutability: "view",
    description: "Total USDC liability for this market",
  },
  {
    name: "getOddsHistory",
    inputs: [{ name: "marketId", type: "uint256" }],
    stateMutability: "view",
    description: "All historical odds values for a market",
  },
  {
    name: "quoteNetExposure",
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "amount",   type: "uint256" },
    ],
    stateMutability: "view",
    description: "Simulate net exposure for a bet amount",
    hints: { amount: "USDC raw (6 decimals)" },
  },
  {
    name: "getBetDetails",
    inputs: [
      { name: "marketId",  type: "uint256" },
      { name: "user",      type: "address" },
      { name: "betIndex",  type: "uint256" },
    ],
    stateMutability: "view",
    description: "Details for a specific bet",
  },
  {
    name: "hasRole",
    inputs: [
      { name: "role",    type: "bytes32" },
      { name: "account", type: "address" },
    ],
    stateMutability: "view",
    description: "Check if an account has a role",
  },
];

const BETTING_MATCH_WRITE: AbiFn[] = [
  {
    name: "addMarketWithLine",
    inputs: [
      { name: "marketType",   type: "bytes32" },
      { name: "initialOdds", type: "uint32" },
      { name: "line",         type: "int16" },
    ],
    stateMutability: "nonpayable",
    description: "Create a new market. Odds use ODDS_PRECISION (10000). Line e.g. 2500 = 2.5 goals. Requires ADMIN_ROLE.",
    hints: { initialOdds: "e.g. 15000 = 1.5x", line: "e.g. 2500 = 2.5 (0 for WINNER)" },
  },
  {
    name: "openMarket",
    inputs: [{ name: "marketId", type: "uint256" }],
    stateMutability: "nonpayable",
    description: "Transition market to Open state. Requires ADMIN_ROLE.",
  },
  {
    name: "suspendMarket",
    inputs: [{ name: "marketId", type: "uint256" }],
    stateMutability: "nonpayable",
    description: "Suspend betting on a market. Requires ADMIN_ROLE.",
  },
  {
    name: "closeMarket",
    inputs: [{ name: "marketId", type: "uint256" }],
    stateMutability: "nonpayable",
    description: "Close a market before resolution. Requires ADMIN_ROLE.",
  },
  {
    name: "cancelMarket",
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "reason",   type: "string" },
    ],
    stateMutability: "nonpayable",
    description: "Cancel a market and enable refunds. Requires ADMIN_ROLE.",
  },
  {
    name: "resolveMarket",
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "result",   type: "uint64" },
    ],
    stateMutability: "nonpayable",
    description: "Resolve market with winning selection ID. WINNER: 0=Home 1=Draw 2=Away. Requires RESOLVER_ROLE.",
    hints: { result: "WINNER: 0=Home 1=Draw 2=Away | GOALS: 0=Under 1=Over | BTTS: 0=No 1=Yes" },
  },
  {
    name: "setMarketOdds",
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "newOdds",  type: "uint32" },
    ],
    stateMutability: "nonpayable",
    description: "Update odds for an open market. Requires ODDS_SETTER_ROLE.",
    hints: { newOdds: "e.g. 15000 = 1.5x (ODDS_PRECISION = 10000)" },
  },
  {
    name: "setMaxAllowedOdds",
    inputs: [{ name: "newMax", type: "uint32" }],
    stateMutability: "nonpayable",
    description: "Cap maximum allowed odds. Requires ADMIN_ROLE.",
    hints: { newMax: "e.g. 500000 = 50.0x" },
  },
  {
    name: "grantRole",
    inputs: [
      { name: "role",    type: "bytes32" },
      { name: "account", type: "address" },
    ],
    stateMutability: "nonpayable",
    description: "Grant an access control role. Requires DEFAULT_ADMIN_ROLE.",
  },
  {
    name: "revokeRole",
    inputs: [
      { name: "role",    type: "bytes32" },
      { name: "account", type: "address" },
    ],
    stateMutability: "nonpayable",
    description: "Revoke an access control role. Requires DEFAULT_ADMIN_ROLE.",
  },
  {
    name: "setUSDCToken",
    inputs: [{ name: "_usdcToken", type: "address" }],
    stateMutability: "nonpayable",
    description: "Update the USDC token address. Requires ADMIN_ROLE.",
  },
  {
    name: "setLiquidityPool",
    inputs: [{ name: "_pool", type: "address" }],
    stateMutability: "nonpayable",
    description: "Update the liquidity pool address. Requires ADMIN_ROLE.",
  },
  {
    name: "emergencyPause",
    inputs: [],
    stateMutability: "nonpayable",
    description: "Pause all match operations. Requires PAUSER_ROLE.",
  },
  {
    name: "unpause",
    inputs: [],
    stateMutability: "nonpayable",
    description: "Resume operations. Requires ADMIN_ROLE.",
  },
  {
    name: "transferOwnership",
    inputs: [{ name: "newOwner", type: "address" }],
    stateMutability: "nonpayable",
    description: "Transfer Ownable ownership.",
  },
];

const STREAM_FACTORY_READ: AbiFn[] = [
  { name: "owner",                    inputs: [], stateMutability: "view", description: "Factory owner" },
  { name: "treasury",                 inputs: [], stateMutability: "view", description: "Platform fee recipient" },
  { name: "defaultPlatformFeeBps",    inputs: [], stateMutability: "view", description: "Default platform fee in BPS (e.g. 500 = 5%)" },
  { name: "streamWalletImplementation", inputs: [], stateMutability: "view", description: "Current StreamWallet implementation address" },
  { name: "swapRouter",               inputs: [], stateMutability: "view", description: "Wired swap router" },
  { name: "usdc",                     inputs: [], stateMutability: "view", description: "USDC token address" },
  { name: "kayenRouter",              inputs: [], stateMutability: "view", description: "Kayen DEX router address" },
  {
    name: "hasWallet",
    inputs: [{ name: "streamer", type: "address" }],
    stateMutability: "view",
    description: "Check if a streamer has a deployed wallet",
  },
  {
    name: "getWallet",
    inputs: [{ name: "streamer", type: "address" }],
    stateMutability: "view",
    description: "Returns the wallet address for a streamer (zero if none)",
  },
];

const STREAM_FACTORY_WRITE: AbiFn[] = [
  {
    name: "deployWalletFor",
    inputs: [{ name: "streamer", type: "address" }],
    stateMutability: "nonpayable",
    description: "Deploy a StreamWallet for a streamer (onlyOwner)",
  },
  {
    name: "setPlatformFee",
    inputs: [{ name: "newFeeBps", type: "uint16" }],
    stateMutability: "nonpayable",
    description: "Update default platform fee (onlyOwner)",
    hints: { newFeeBps: "BPS: 500 = 5%, max 10000" },
  },
  {
    name: "setTreasury",
    inputs: [{ name: "newTreasury", type: "address" }],
    stateMutability: "nonpayable",
    description: "Update treasury address (onlyOwner)",
  },
  {
    name: "setSwapRouter",
    inputs: [{ name: "_swapRouter", type: "address" }],
    stateMutability: "nonpayable",
    description: "Update ChilizSwapRouter address (onlyOwner)",
  },
  {
    name: "setKayenRouter",
    inputs: [{ name: "newRouter", type: "address" }],
    stateMutability: "nonpayable",
    description: "Update Kayen router address (onlyOwner)",
  },
  {
    name: "setUsdc",
    inputs: [{ name: "newUsdc", type: "address" }],
    stateMutability: "nonpayable",
    description: "Update USDC token address (onlyOwner)",
  },
  {
    name: "setImplementation",
    inputs: [{ name: "newImplementation", type: "address" }],
    stateMutability: "nonpayable",
    description: "Set new StreamWallet implementation for future deploys (onlyOwner)",
  },
  {
    name: "upgradeWallet",
    inputs: [
      { name: "streamer",           type: "address" },
      { name: "newImplementation",  type: "address" },
    ],
    stateMutability: "nonpayable",
    description: "Upgrade an existing StreamWallet proxy to a new implementation (onlyOwner)",
  },
  {
    name: "transferOwnership",
    inputs: [{ name: "newOwner", type: "address" }],
    stateMutability: "nonpayable",
    description: "Transfer factory ownership",
  },
];

const STREAM_WALLET_READ: AbiFn[] = [
  { name: "streamer",          inputs: [], stateMutability: "view", description: "Streamer address this wallet belongs to" },
  { name: "factory",           inputs: [], stateMutability: "view", description: "Parent factory address" },
  { name: "treasury",          inputs: [], stateMutability: "view", description: "Platform fee recipient" },
  { name: "platformFeeBps",    inputs: [], stateMutability: "view", description: "Platform fee in BPS" },
  { name: "availableBalance",  inputs: [], stateMutability: "view", description: "USDC balance available for withdrawal" },
  { name: "totalRevenue",      inputs: [], stateMutability: "view", description: "Lifetime USDC received (raw, 6 decimals)" },
  { name: "totalWithdrawn",    inputs: [], stateMutability: "view", description: "Lifetime USDC withdrawn (raw, 6 decimals)" },
  { name: "totalSubscribers",  inputs: [], stateMutability: "view", description: "All-time subscriber count" },
  {
    name: "isSubscribed",
    inputs: [{ name: "user", type: "address" }],
    stateMutability: "view",
    description: "Check if a user has an active subscription",
  },
  {
    name: "getSubscription",
    inputs: [{ name: "user", type: "address" }],
    stateMutability: "view",
    description: "Full subscription struct for a user",
  },
  {
    name: "getDonationAmount",
    inputs: [{ name: "donor", type: "address" }],
    stateMutability: "view",
    description: "Lifetime donation amount from a donor (raw, 6 decimals)",
  },
];

const STREAM_WALLET_WRITE: AbiFn[] = [
  {
    name: "withdrawRevenue",
    inputs: [{ name: "amount", type: "uint256" }],
    stateMutability: "nonpayable",
    description: "Withdraw USDC revenue. Callable only by the streamer.",
    hints: { amount: "USDC raw (6 decimals) — e.g. 1000000 = 1 USDC" },
  },
];

const LIQUIDITY_POOL_READ: AbiFn[] = [
  { name: "totalAssets",              inputs: [], stateMutability: "view", description: "Total USDC managed by the pool (raw, 6 decimals)" },
  { name: "freeBalance",              inputs: [], stateMutability: "view", description: "USDC not locked as liability — available for new bets" },
  { name: "totalLiabilities",         inputs: [], stateMutability: "view", description: "Total USDC locked against open bets" },
  { name: "utilization",             inputs: [], stateMutability: "view", description: "Utilization ratio (1e18 = 100%)" },
  { name: "totalSupply",             inputs: [], stateMutability: "view", description: "Total LP shares outstanding" },
  { name: "protocolFeeBps",          inputs: [], stateMutability: "view", description: "Protocol fee in BPS (e.g. 500 = 5%)" },
  { name: "maxBetAmount",            inputs: [], stateMutability: "view", description: "Maximum single bet size in USDC (raw)" },
  { name: "maxLiabilityPerMarketBps", inputs: [], stateMutability: "view", description: "Max liability per market as % of pool (BPS)" },
  { name: "maxLiabilityPerMatchBps",  inputs: [], stateMutability: "view", description: "Max liability per match as % of pool (BPS)" },
  { name: "depositCooldownSeconds",  inputs: [], stateMutability: "view", description: "Cooldown in seconds between deposit and withdrawal" },
  { name: "treasury",                inputs: [], stateMutability: "view", description: "Treasury address receiving protocol fees" },
  { name: "accruedTreasury",         inputs: [], stateMutability: "view", description: "Accrued protocol fees not yet claimed" },
  { name: "treasuryWithdrawable",    inputs: [], stateMutability: "view", description: "Amount treasury can withdraw right now" },
  { name: "paused",                  inputs: [], stateMutability: "view", description: "Whether the pool is paused" },
  { name: "asset",                   inputs: [], stateMutability: "view", description: "Underlying USDC token address" },
  { name: "name",                    inputs: [], stateMutability: "view", description: "LP token name" },
  { name: "symbol",                  inputs: [], stateMutability: "view", description: "LP token symbol" },
  {
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    stateMutability: "view",
    description: "LP share balance of an address",
  },
  {
    name: "convertToAssets",
    inputs: [{ name: "shares", type: "uint256" }],
    stateMutability: "view",
    description: "Preview USDC value of shares (raw)",
    hints: { shares: "LP shares (18 decimals)" },
  },
  {
    name: "convertToShares",
    inputs: [{ name: "assets", type: "uint256" }],
    stateMutability: "view",
    description: "Preview shares for a USDC deposit (raw)",
    hints: { assets: "USDC raw (6 decimals)" },
  },
  {
    name: "previewDeposit",
    inputs: [{ name: "assets", type: "uint256" }],
    stateMutability: "view",
    description: "Shares received for depositing this many USDC",
    hints: { assets: "USDC raw (6 decimals)" },
  },
  {
    name: "previewWithdraw",
    inputs: [{ name: "assets", type: "uint256" }],
    stateMutability: "view",
    description: "Shares burned to withdraw this many USDC",
    hints: { assets: "USDC raw (6 decimals)" },
  },
  {
    name: "previewRedeem",
    inputs: [{ name: "shares", type: "uint256" }],
    stateMutability: "view",
    description: "USDC received for redeeming this many shares",
    hints: { shares: "LP shares (18 decimals)" },
  },
  {
    name: "lastDepositAt",
    inputs: [{ name: "holder", type: "address" }],
    stateMutability: "view",
    description: "Timestamp of holder's last deposit (unix seconds)",
  },
  {
    name: "matchLiability",
    inputs: [{ name: "bettingMatch", type: "address" }],
    stateMutability: "view",
    description: "Total USDC liability locked for a specific match",
  },
  {
    name: "marketLiability",
    inputs: [{ name: "bettingMatch", type: "address" }, { name: "marketId", type: "uint256" }],
    stateMutability: "view",
    description: "USDC liability locked for a specific market within a match",
  },
  {
    name: "hasRole",
    inputs: [{ name: "role", type: "bytes32" }, { name: "account", type: "address" }],
    stateMutability: "view",
    description: "Check if an account holds a role",
  },
  // UUPS proxy
  { name: "UPGRADE_INTERFACE_VERSION", inputs: [], stateMutability: "view", description: "UUPS upgrade interface version string" },
  { name: "proxiableUUID",             inputs: [], stateMutability: "view", description: "ERC1967 implementation slot UUID — verify before upgrading" },
  { name: "pendingTreasury",           inputs: [], stateMutability: "view", description: "Pending treasury address from a two-step proposeTreasury call" },
];

const LIQUIDITY_POOL_WRITE: AbiFn[] = [
  {
    name: "deposit",
    inputs: [{ name: "assets", type: "uint256" }, { name: "receiver", type: "address" }],
    stateMutability: "nonpayable",
    description: "Deposit USDC and receive LP shares. Requires prior ERC-20 approval.",
    hints: { assets: "USDC raw (6 decimals) — e.g. 1000000 = 1 USDC" },
  },
  {
    name: "withdraw",
    inputs: [{ name: "assets", type: "uint256" }, { name: "receiver", type: "address" }, { name: "owner", type: "address" }],
    stateMutability: "nonpayable",
    description: "Withdraw exact USDC amount by burning shares. Subject to cooldown.",
    hints: { assets: "USDC raw (6 decimals)" },
  },
  {
    name: "redeem",
    inputs: [{ name: "shares", type: "uint256" }, { name: "receiver", type: "address" }, { name: "owner", type: "address" }],
    stateMutability: "nonpayable",
    description: "Burn exact LP shares and receive proportional USDC. Subject to cooldown.",
    hints: { shares: "LP shares (18 decimals)" },
  },
  {
    name: "authorizeMatch",
    inputs: [{ name: "bettingMatch", type: "address" }],
    stateMutability: "nonpayable",
    description: "Allow a BettingMatch proxy to call payWinner / payRefund. Requires MATCH_AUTHORIZER_ROLE.",
  },
  {
    name: "revokeMatch",
    inputs: [{ name: "bettingMatch", type: "address" }],
    stateMutability: "nonpayable",
    description: "Remove a match from the authorized set. Requires MATCH_AUTHORIZER_ROLE.",
  },
  {
    name: "setProtocolFeeBps",
    inputs: [{ name: "newBps", type: "uint16" }],
    stateMutability: "nonpayable",
    description: "Update protocol fee. Requires DEFAULT_ADMIN_ROLE.",
    hints: { newBps: "BPS: 500 = 5%, max 10000" },
  },
  {
    name: "setMaxBetAmount",
    inputs: [{ name: "newMax", type: "uint256" }],
    stateMutability: "nonpayable",
    description: "Cap maximum single bet size in USDC raw. Requires DEFAULT_ADMIN_ROLE.",
    hints: { newMax: "USDC raw (6 decimals) — e.g. 100000000 = 100 USDC" },
  },
  {
    name: "setMaxLiabilityPerMarketBps",
    inputs: [{ name: "newBps", type: "uint16" }],
    stateMutability: "nonpayable",
    description: "Cap per-market liability as % of pool. Requires DEFAULT_ADMIN_ROLE.",
    hints: { newBps: "BPS: 1000 = 10%" },
  },
  {
    name: "setMaxLiabilityPerMatchBps",
    inputs: [{ name: "newBps", type: "uint16" }],
    stateMutability: "nonpayable",
    description: "Cap per-match liability as % of pool. Requires DEFAULT_ADMIN_ROLE.",
    hints: { newBps: "BPS: 2000 = 20%" },
  },
  {
    name: "setDepositCooldownSeconds",
    inputs: [{ name: "newSeconds", type: "uint48" }],
    stateMutability: "nonpayable",
    description: "Set cooldown between deposit and withdrawal. Requires DEFAULT_ADMIN_ROLE.",
    hints: { newSeconds: "seconds — e.g. 86400 = 1 day" },
  },
  {
    name: "pause",
    inputs: [],
    stateMutability: "nonpayable",
    description: "Pause deposits and withdrawals. Requires PAUSER_ROLE.",
  },
  {
    name: "unpause",
    inputs: [],
    stateMutability: "nonpayable",
    description: "Resume operations. Requires DEFAULT_ADMIN_ROLE.",
  },
  {
    name: "proposeTreasury",
    inputs: [{ name: "newTreasury", type: "address" }],
    stateMutability: "nonpayable",
    description: "Propose a new treasury address (two-step). Requires DEFAULT_ADMIN_ROLE.",
  },
  {
    name: "acceptTreasury",
    inputs: [],
    stateMutability: "nonpayable",
    description: "Accept a pending treasury proposal. Must be called by the proposed address.",
  },
  {
    name: "cancelTreasuryProposal",
    inputs: [],
    stateMutability: "nonpayable",
    description: "Cancel a pending treasury proposal. Requires DEFAULT_ADMIN_ROLE.",
  },
  {
    name: "withdrawTreasury",
    inputs: [{ name: "amount", type: "uint256" }],
    stateMutability: "nonpayable",
    description: "Withdraw accrued protocol fees to treasury. Callable by treasury address.",
    hints: { amount: "USDC raw (6 decimals)" },
  },
  {
    name: "grantRole",
    inputs: [{ name: "role", type: "bytes32" }, { name: "account", type: "address" }],
    stateMutability: "nonpayable",
    description: "Grant a role. Requires DEFAULT_ADMIN_ROLE.",
  },
  {
    name: "revokeRole",
    inputs: [{ name: "role", type: "bytes32" }, { name: "account", type: "address" }],
    stateMutability: "nonpayable",
    description: "Revoke a role. Requires DEFAULT_ADMIN_ROLE.",
  },
];

// ─── UI Primitives ────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-1 h-5 rounded-full flex-shrink-0" style={{ background: "#E8001D" }} />
      <h2
        className="text-[16px] font-bold uppercase tracking-[0.08em]"
        style={{ fontFamily: "'Barlow Condensed', sans-serif", color: "#fff" }}
      >
        {children}
      </h2>
    </div>
  );
}

function AddressBar({ label, address }: { label: string; address: string }) {
  const copy = () => navigator.clipboard.writeText(address);
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-lg mb-6"
      style={{ background: "#0F0F0F", border: "1px solid #1E1E1E" }}
    >
      <span className="text-[11px] uppercase tracking-[0.1em]" style={{ color: "#555", fontFamily: "'Barlow', sans-serif" }}>
        {label}
      </span>
      <span className="font-mono text-[12px]" style={{ color: address === "0x0000000000000000000000000000000000000000" ? "#555" : "#888" }}>
        {address}
      </span>
      {address !== "0x0000000000000000000000000000000000000000" && (
        <button onClick={copy} className="ml-auto" title="Copy">
          <Copy size={12} style={{ color: "#555" }} />
        </button>
      )}
      {address !== "0x0000000000000000000000000000000000000000" && (
        <a
          href={
            networkType === "mainnet"
              ? `https://explorer.chiliz.com/address/${address}`
              : `https://spicy-explorer.chiliz.com/address/${address}`
          }
          target="_blank"
          rel="noopener noreferrer"
          title="View on explorer"
        >
          <ExternalLink size={12} style={{ color: "#555" }} />
        </a>
      )}
    </div>
  );
}

function FunctionGroup({
  title,
  badge,
  functions,
  abi,
  address,
  type,
}: {
  title: string;
  badge: string;
  functions: AbiFn[];
  abi: Abi;
  address: `0x${string}`;
  type: "read" | "write";
}) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <span
          className="text-[10px] font-black px-2.5 py-1 rounded"
          style={{
            background: type === "read" ? "rgba(0,200,83,0.1)" : "rgba(232,0,29,0.1)",
            color: type === "read" ? "#00C853" : "#E8001D",
            fontFamily: "'Barlow', sans-serif",
            letterSpacing: "0.1em",
          }}
        >
          {badge}
        </span>
        <span className="text-[13px] font-semibold" style={{ color: "#777" }}>{title}</span>
        <span
          className="text-[10px] px-1.5 py-0.5 rounded"
          style={{ background: "#1A1A1A", color: "#555" }}
        >
          {functions.length}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {functions.map(fn =>
          type === "read" ? (
            <ReadCard key={fn.name} abi={abi} address={address} fn={fn} />
          ) : (
            <WriteCard key={fn.name} abi={abi} address={address} fn={fn} />
          )
        )}
      </div>
    </section>
  );
}

// ─── Quick-action: authorize a match in the LiquidityPool ─────────────────────

function AuthorizeMatchQuickAction({ matchAddress }: { matchAddress: `0x${string}` }) {
  const poolAddr = chilizConfig.liquidityPool;
  const enabled =
    matchAddress !== "0x0000000000000000000000000000000000000000" &&
    poolAddr !== "0x0000000000000000000000000000000000000000";

  const { data: isAuthorized, isLoading: isChecking, refetch } = useReadContract({
    abi: POOL_ABI,
    address: poolAddr,
    functionName: "hasRole",
    args: [MATCH_ROLE, matchAddress],
    query: { enabled },
  });

  const { writeContract, data: hash, isPending, error: writeError, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) refetch();
  }, [isSuccess, refetch]);

  const onAuthorize = () => {
    reset();
    writeContract({
      abi: POOL_ABI,
      address: poolAddr,
      functionName: "authorizeMatch",
      args: [matchAddress],
    });
  };

  const authorized = isAuthorized === true;
  const isBusy = isPending || isConfirming;

  if (!enabled) return null;

  return (
    <div
      className="flex flex-col gap-3 p-4 rounded-lg mb-6"
      style={{
        background: authorized ? "rgba(0,200,83,0.06)" : "rgba(234,179,8,0.06)",
        border: `1px solid ${authorized ? "rgba(0,200,83,0.25)" : "rgba(234,179,8,0.3)"}`,
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {isChecking ? (
            <Loader2 size={16} className="animate-spin" style={{ color: "#888" }} />
          ) : authorized ? (
            <ShieldCheck size={16} style={{ color: "#00C853" }} />
          ) : (
            <ShieldAlert size={16} style={{ color: "#EAB308" }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="text-[12px] font-bold uppercase tracking-[0.08em] mb-1"
            style={{
              color: authorized ? "#00C853" : "#EAB308",
              fontFamily: "'Barlow', sans-serif",
            }}
          >
            {isChecking
              ? "Checking authorization..."
              : authorized
              ? "Match authorized in Liquidity Pool"
              : "Match NOT authorized in Liquidity Pool"}
          </div>
          <p className="text-[11px]" style={{ color: "#888" }}>
            {authorized
              ? "This match has MATCH_ROLE on the pool — recordBet, payWinner and payRefund are allowed."
              : "Without MATCH_ROLE on the pool, every bet on this match will revert with MatchNotAuthorized. Click below to grant it (requires MATCH_AUTHORIZER_ROLE)."}
          </p>
        </div>
      </div>

      {!authorized && !isChecking && (
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onAuthorize}
            disabled={isBusy}
            className="flex items-center gap-2 px-4 py-2 rounded text-[12px] font-bold transition-opacity"
            style={{
              background: "#E8001D",
              color: "#fff",
              opacity: isBusy ? 0.7 : 1,
              cursor: isBusy ? "not-allowed" : "pointer",
              fontFamily: "'Barlow', sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            {isBusy && <Loader2 size={13} className="animate-spin" />}
            {isPending ? "Confirm in wallet..." : isConfirming ? "Confirming..." : "Authorize this match"}
          </button>

          {isSuccess && hash && (
            <a
              href={explorerTxUrl(hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px]"
              style={{ color: "#00C853" }}
            >
              <CheckCircle2 size={13} />
              Authorized — View tx
              <ExternalLink size={10} />
            </a>
          )}
        </div>
      )}

      {writeError && (
        <div
          className="flex items-start gap-2 p-3 rounded"
          style={{ background: "rgba(232,0,29,0.08)", border: "1px solid rgba(232,0,29,0.2)" }}
        >
          <XCircle size={13} className="mt-0.5 flex-shrink-0" style={{ color: "#E8001D" }} />
          <p className="text-[11px] font-mono break-all" style={{ color: "#ff6b6b" }}>
            {writeError.message.slice(0, 400)}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Panels ───────────────────────────────────────────────────────────────────

function BettingFactoryPanel() {
  const addr = chilizConfig.bettingMatchFactory;
  return (
    <div>
      <AddressBar label="BettingMatchFactory" address={addr} />
      <FunctionGroup title="View Functions" badge="READ" functions={BETTING_FACTORY_READ} abi={FACTORY_ABI} address={addr} type="read" />
      <FunctionGroup title="State-Changing Functions" badge="WRITE" functions={BETTING_FACTORY_WRITE} abi={FACTORY_ABI} address={addr} type="write" />
    </div>
  );
}

function BettingMatchPanel() {
  const factoryAddr = chilizConfig.bettingMatchFactory;
  const [matchAddress, setMatchAddress] = useState("");

  const { data: allMatches } = useReadContract({
    abi: FACTORY_ABI,
    address: factoryAddr,
    functionName: "getAllMatches",
    query: {
      enabled: factoryAddr !== "0x0000000000000000000000000000000000000000",
    },
  });

  const deployedMatches = (allMatches as string[] | undefined) ?? [];
  const contractAddress = (matchAddress || deployedMatches[0] || "0x0000000000000000000000000000000000000000") as `0x${string}`;

  return (
    <div>
      <div
        className="flex flex-col sm:flex-row gap-3 p-4 rounded-lg mb-6"
        style={{ background: "#0F0F0F", border: "1px solid #1E1E1E" }}
      >
        <div className="flex-1">
          <label className="block text-[11px] mb-1.5 uppercase tracking-[0.08em]" style={{ color: "#555" }}>
            Match Address
          </label>
          <input
            type="text"
            value={matchAddress}
            onChange={e => setMatchAddress(e.target.value)}
            placeholder="0x... (or select below)"
            className="w-full rounded px-3 py-2 font-mono text-[12px]"
            style={{ background: "#0A0A0A", border: "1px solid #2A2A2A", color: "#ccc", outline: "none" }}
          />
        </div>
        {deployedMatches.length > 0 && (
          <div className="flex-1">
            <label className="block text-[11px] mb-1.5 uppercase tracking-[0.08em]" style={{ color: "#555" }}>
              Deployed Matches ({deployedMatches.length})
            </label>
            <select
              value={matchAddress}
              onChange={e => setMatchAddress(e.target.value)}
              className="w-full rounded px-3 py-2 font-mono text-[12px]"
              style={{ background: "#0A0A0A", border: "1px solid #2A2A2A", color: "#ccc", cursor: "pointer", outline: "none" }}
            >
              <option value="">— select —</option>
              {deployedMatches.map((addr, i) => (
                <option key={addr} value={addr}>
                  #{i} — {addr.slice(0, 10)}...{addr.slice(-6)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {contractAddress !== "0x0000000000000000000000000000000000000000" && (
        <>
          <AddressBar label="BettingMatch (proxy)" address={contractAddress} />
          <AuthorizeMatchQuickAction matchAddress={contractAddress} />
        </>
      )}

      <FunctionGroup title="View Functions" badge="READ" functions={BETTING_MATCH_READ} abi={MATCH_ABI} address={contractAddress} type="read" />
      <FunctionGroup title="State-Changing Functions" badge="WRITE" functions={BETTING_MATCH_WRITE} abi={MATCH_ABI} address={contractAddress} type="write" />
    </div>
  );
}

function StreamFactoryPanel() {
  const addr = chilizConfig.streamWalletFactory;
  return (
    <div>
      <AddressBar label="StreamWalletFactory" address={addr} />
      <FunctionGroup title="View Functions" badge="READ" functions={STREAM_FACTORY_READ} abi={STREAM_FACTORY_ABI} address={addr} type="read" />
      <FunctionGroup title="State-Changing Functions" badge="WRITE" functions={STREAM_FACTORY_WRITE} abi={STREAM_FACTORY_ABI} address={addr} type="write" />
    </div>
  );
}

function StreamWalletPanel() {
  const factoryAddr = chilizConfig.streamWalletFactory;
  const [streamerInput, setStreamerInput] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  const { data: lookedUpWallet, isLoading: isLooking } = useReadContract({
    abi: STREAM_FACTORY_ABI,
    address: factoryAddr,
    functionName: "getWallet",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    args: [streamerInput as `0x${string}`] as any,
    query: {
      enabled:
        factoryAddr !== "0x0000000000000000000000000000000000000000" &&
        streamerInput.startsWith("0x") &&
        streamerInput.length === 42,
    },
  });

  const resolvedWallet =
    walletAddress ||
    (lookedUpWallet as string | undefined) ||
    "0x0000000000000000000000000000000000000000";

  return (
    <div>
      <div
        className="flex flex-col sm:flex-row gap-3 p-4 rounded-lg mb-6"
        style={{ background: "#0F0F0F", border: "1px solid #1E1E1E" }}
      >
        <div className="flex-1">
          <label className="block text-[11px] mb-1.5 uppercase tracking-[0.08em]" style={{ color: "#555" }}>
            Lookup by Streamer Address
          </label>
          <input
            type="text"
            value={streamerInput}
            onChange={e => setStreamerInput(e.target.value)}
            placeholder="0x... streamer address"
            className="w-full rounded px-3 py-2 font-mono text-[12px]"
            style={{ background: "#0A0A0A", border: "1px solid #2A2A2A", color: "#ccc", outline: "none" }}
          />
          {isLooking && (
            <p className="text-[11px] mt-1" style={{ color: "#555" }}>Resolving wallet...</p>
          )}
          {!!lookedUpWallet && !isLooking && (
            <p className="text-[11px] mt-1 font-mono" style={{ color: "#00C853" }}>
              → {String(lookedUpWallet)}
            </p>
          )}
        </div>
        <div className="flex-1">
          <label className="block text-[11px] mb-1.5 uppercase tracking-[0.08em]" style={{ color: "#555" }}>
            Wallet Address (override)
          </label>
          <input
            type="text"
            value={walletAddress}
            onChange={e => setWalletAddress(e.target.value)}
            placeholder="0x... wallet proxy address"
            className="w-full rounded px-3 py-2 font-mono text-[12px]"
            style={{ background: "#0A0A0A", border: "1px solid #2A2A2A", color: "#ccc", outline: "none" }}
          />
        </div>
      </div>

      {resolvedWallet !== "0x0000000000000000000000000000000000000000" && (
        <AddressBar label="StreamWallet (proxy)" address={resolvedWallet} />
      )}

      <FunctionGroup title="View Functions" badge="READ" functions={STREAM_WALLET_READ} abi={STREAM_WALLET_ABI} address={resolvedWallet as `0x${string}`} type="read" />
      <FunctionGroup title="State-Changing Functions" badge="WRITE" functions={STREAM_WALLET_WRITE} abi={STREAM_WALLET_ABI} address={resolvedWallet as `0x${string}`} type="write" />
    </div>
  );
}

function LiquidityPoolPanel() {
  const addr = chilizConfig.liquidityPool;
  return (
    <div>
      <AddressBar label="LiquidityPool (proxy)" address={addr} />
      <FunctionGroup title="View Functions" badge="READ" functions={LIQUIDITY_POOL_READ} abi={POOL_ABI} address={addr} type="read" />
      <FunctionGroup title="State-Changing Functions" badge="WRITE" functions={LIQUIDITY_POOL_WRITE} abi={POOL_ABI} address={addr} type="write" />
    </div>
  );
}

// ─── ChilizSwapRouter ─────────────────────────────────────────────────────────
// Single FanX-DEX entrypoint for every multi-asset action: bets, donations,
// subscriptions, LP deposits. Owner-only setters wire it to the factory /
// stream wallet factory / pool. The Raw ABI catch-all keeps these reachable
// even before we surface them in a curated panel.
const SWAP_ROUTER_READ: AbiFn[] = [
  { name: "owner",                inputs: [], stateMutability: "view", description: "Router owner (admin key)" },
  { name: "treasury",             inputs: [], stateMutability: "view", description: "Streaming-fee recipient" },
  { name: "platformFeeBps",       inputs: [], stateMutability: "view", description: "Streaming platform fee in bps (5% = 500)" },
  { name: "usdc",                 inputs: [], stateMutability: "view", description: "USDC settlement asset" },
  { name: "wchz",                 inputs: [], stateMutability: "view", description: "Wrapped CHZ used by the CHZ swap path" },
  { name: "masterRouter",         inputs: [], stateMutability: "view", description: "Kayen MasterRouter (native-CHZ swaps)" },
  { name: "tokenRouter",          inputs: [], stateMutability: "view", description: "Kayen Router (ERC20-to-ERC20 swaps)" },
  { name: "bettingMatchFactory",  inputs: [], stateMutability: "view", description: "Validates bettingMatch addresses on bet path" },
  { name: "streamWalletFactory",  inputs: [], stateMutability: "view", description: "Resolves streamer wallets for streaming path" },
  { name: "liquidityPool",        inputs: [], stateMutability: "view", description: "Pool wired for depositLiquidityWith* entrypoints" },
];

const SWAP_ROUTER_WRITE: AbiFn[] = [
  // ── Wiring (onlyOwner) ─────────────────────────────────────────────────────
  {
    name: "setMatchFactory",
    inputs: [{ name: "_factory", type: "address" }],
    stateMutability: "nonpayable",
    description: "Register the BettingMatchFactory; required before any placeBetWith* call.",
  },
  {
    name: "setStreamWalletFactory",
    inputs: [{ name: "_factory", type: "address" }],
    stateMutability: "nonpayable",
    description: "Register the StreamWalletFactory; reverts if factory's swapRouter() is not this contract.",
  },
  {
    name: "setLiquidityPool",
    inputs: [{ name: "_pool", type: "address" }],
    stateMutability: "nonpayable",
    description: "Register the LiquidityPool; required before any depositLiquidityWith* call. Validates pool.asset() == USDC.",
  },
  {
    name: "setTreasury",
    inputs: [{ name: "_treasury", type: "address" }],
    stateMutability: "nonpayable",
    description: "Update streaming-fee recipient.",
  },
  {
    name: "setPlatformFeeBps",
    inputs: [{ name: "_feeBps", type: "uint16" }],
    stateMutability: "nonpayable",
    description: "Update streaming platform fee in bps (max 10_000).",
    hints: { _feeBps: "BPS — 500 = 5%, max 10000" },
  },

  // ── Bet entrypoints ────────────────────────────────────────────────────────
  {
    name: "placeBetWithUSDC",
    inputs: [
      { name: "bettingMatch", type: "address" },
      { name: "marketId", type: "uint256" },
      { name: "selection", type: "uint64" },
      { name: "amount", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    description: "Direct USDC bet through the router. Caller must approve `amount` USDC to the router first.",
    hints: { amount: "USDC raw (6 decimals on mainnet, 18 on Spicy testnet)" },
  },
  {
    name: "placeBetWithCHZ",
    inputs: [
      { name: "bettingMatch", type: "address" },
      { name: "marketId", type: "uint256" },
      { name: "selection", type: "uint64" },
      { name: "amountOutMin", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
    stateMutability: "payable",
    description: "Native CHZ → USDC → bet. Send CHZ via msg.value.",
  },
  {
    name: "placeBetWithToken",
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "bettingMatch", type: "address" },
      { name: "marketId", type: "uint256" },
      { name: "selection", type: "uint64" },
      { name: "amountOutMin", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    description: "ERC20 → USDC → bet via Kayen tokenRouter. Caller must approve `amount` of `token` to the router first.",
  },

  // ── Streaming entrypoints ──────────────────────────────────────────────────
  {
    name: "donateWithUSDC",
    inputs: [
      { name: "streamer", type: "address" },
      { name: "message", type: "string" },
      { name: "amount", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    description: "Direct USDC donation; splits platform fee to treasury, rest to streamer.",
  },
  {
    name: "donateWithCHZ",
    inputs: [
      { name: "streamer", type: "address" },
      { name: "message", type: "string" },
      { name: "amountOutMin", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
    stateMutability: "payable",
    description: "Native CHZ → USDC → donation.",
  },
  {
    name: "donateWithToken",
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "streamer", type: "address" },
      { name: "message", type: "string" },
      { name: "amountOutMin", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    description: "ERC20 → USDC → donation via Kayen tokenRouter.",
  },
  {
    name: "subscribeWithUSDC",
    inputs: [
      { name: "streamer", type: "address" },
      { name: "duration", type: "uint256" },
      { name: "amount", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    description: "Direct USDC subscription. `duration` in seconds.",
    hints: { duration: "seconds — 2592000 = 30 days" },
  },
  {
    name: "subscribeWithCHZ",
    inputs: [
      { name: "streamer", type: "address" },
      { name: "duration", type: "uint256" },
      { name: "amountOutMin", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
    stateMutability: "payable",
    description: "Native CHZ → USDC → subscription.",
  },
  {
    name: "subscribeWithToken",
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "streamer", type: "address" },
      { name: "duration", type: "uint256" },
      { name: "amountOutMin", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    description: "ERC20 → USDC → subscription via Kayen tokenRouter.",
  },

  // ── LP entrypoints ─────────────────────────────────────────────────────────
  {
    name: "depositLiquidityWithUSDC",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "receiver", type: "address" },
    ],
    stateMutability: "nonpayable",
    description: "Deposit USDC straight into the pool, mint ctvLP shares to `receiver`.",
  },
  {
    name: "depositLiquidityWithCHZ",
    inputs: [
      { name: "amountOutMin", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "receiver", type: "address" },
    ],
    stateMutability: "payable",
    description: "Native CHZ → USDC → ctvLP shares to `receiver`.",
  },
  {
    name: "depositLiquidityWithToken",
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "amountOutMin", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "receiver", type: "address" },
    ],
    stateMutability: "nonpayable",
    description: "ERC20 → USDC → ctvLP shares to `receiver` (via Kayen).",
  },
];

function ChilizSwapRouterPanel() {
  const addr = chilizConfig.chilizSwapRouter;
  return (
    <div>
      <AddressBar label="ChilizSwapRouter" address={addr} />
      <FunctionGroup title="View Functions" badge="READ" functions={SWAP_ROUTER_READ} abi={SWAP_ROUTER_ABI} address={addr} type="read" />
      <FunctionGroup title="State-Changing Functions" badge="WRITE" functions={SWAP_ROUTER_WRITE} abi={SWAP_ROUTER_ABI} address={addr} type="write" />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type Tab = "betting-factory" | "betting-match" | "stream-factory" | "stream-wallet" | "liquidity-pool" | "swap-router";

const TABS: { key: Tab; label: string }[] = [
  { key: "betting-factory", label: "Betting Factory" },
  { key: "betting-match",   label: "Betting Match" },
  { key: "stream-factory",  label: "Stream Factory" },
  { key: "stream-wallet",   label: "Stream Wallet" },
  { key: "liquidity-pool",  label: "Liquidity Pool" },
  { key: "swap-router",     label: "Swap Router" },
];

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("betting-factory");
  const { primaryWallet } = useDynamicContext();

  return (
    <div className="min-h-screen" style={{ background: "#0A0A0A" }}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-9 rounded-full flex-shrink-0" style={{ background: "#E8001D" }} />
              <h1
                className="text-[36px] sm:text-[48px] font-black uppercase tracking-[0.05em] leading-none text-white"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Admin Console
              </h1>
            </div>
            <p className="text-[12px] ml-4 mt-1" style={{ color: "#666", fontFamily: "'Barlow', sans-serif" }}>
              ChilizTV smart contract interface — Swagger-style
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span
              className="text-[10px] font-bold px-3 py-1 rounded uppercase tracking-[0.1em]"
              style={{
                background: networkType === "mainnet" ? "rgba(232,0,29,0.15)" : "rgba(234,179,8,0.12)",
                color: networkType === "mainnet" ? "#E8001D" : "#EAB308",
                fontFamily: "'Barlow', sans-serif",
              }}
            >
              {networkType}
            </span>
            {primaryWallet?.address ? (
              <span className="text-[11px] font-mono" style={{ color: "#555" }}>
                {primaryWallet.address.slice(0, 6)}…{primaryWallet.address.slice(-4)}
              </span>
            ) : (
              <span className="text-[11px]" style={{ color: "#E8001D" }}>Wallet not connected</span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-0 mb-8 overflow-x-auto"
          style={{ borderBottom: "1px solid #1A1A1A" }}
        >
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-2 px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] whitespace-nowrap transition-colors duration-150 flex-shrink-0"
              style={{
                fontFamily: "'Barlow', sans-serif",
                color: activeTab === tab.key ? "#fff" : "#555",
                borderBottom: `2px solid ${activeTab === tab.key ? "#E8001D" : "transparent"}`,
                marginBottom: "-1px",
                background: "transparent",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {activeTab === "betting-factory" && <BettingFactoryPanel />}
          {activeTab === "betting-match"   && <BettingMatchPanel />}
          {activeTab === "stream-factory"  && <StreamFactoryPanel />}
          {activeTab === "stream-wallet"   && <StreamWalletPanel />}
          {activeTab === "liquidity-pool"  && <LiquidityPoolPanel />}
          {activeTab === "swap-router"     && <ChilizSwapRouterPanel />}
        </div>
      </div>
    </div>
  );
}
