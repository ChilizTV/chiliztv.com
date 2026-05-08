/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck wagmi v2 generated read hooks compound TS depth limits when
// chained with the chainId pin and the multi-token branching here. Runtime
// is verified against deployed contracts on Spicy testnet (88882).
"use client";

import { useEffect, useMemo, useState } from "react";
import { erc20Abi, formatUnits, parseUnits, type Address } from "viem";
import { useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { ArrowDownUp, ChevronDown, Loader2, Wallet, X } from "lucide-react";
import { useLiquidityPool, type UseLiquidityPoolReturn } from "@/hooks/useLiquidityPool";
import { useChilizSwapRouter } from "@/hooks/useChilizSwapRouter";
import { useKayenQuote } from "@/hooks/useKayenQuote";
import { usePoolDecimals } from "@/hooks/usePoolDecimals";
import { chilizConfig } from "@/config/chiliz.config";
import { NetworkGuard } from "@/components/web3/NetworkGuard";

interface PoolDepositDialogProps {
  open: boolean;
  onClose: () => void;
}

type Mode = "deposit" | "withdraw";

// "USDC" → direct USDC path; "CHZ" → native CHZ via FanX MasterRouter;
// any other Address → ERC20 fan token via FanX tokenRouter.
type DepositToken = { kind: "USDC" } | { kind: "CHZ" } | { kind: "ERC20"; address: Address; symbol: string; name: string };

const NATIVE_DECIMALS = 18;
const FAN_TOKEN_DECIMALS = 18;
const DEADLINE_MIN = 20; // minutes
const DEFAULT_SLIPPAGE_BPS = 50; // 0.5%

function formatAtomic(value: bigint | undefined, decimals: number | undefined, fractionDigits = 2): string {
  if (value === undefined || decimals === undefined) return "—";
  const n = Number(formatUnits(value, decimals));
  return n.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

function formatShares(value: bigint | undefined, decimals: number | undefined): string {
  if (value === undefined || decimals === undefined) return "—";
  const n = Number(formatUnits(value, decimals));
  return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

function tokenDecimals(t: DepositToken, usdcDecimals: number | undefined): number | undefined {
  if (t.kind === "USDC") return usdcDecimals;
  if (t.kind === "CHZ") return NATIVE_DECIMALS;
  return FAN_TOKEN_DECIMALS;
}

function tokenLabel(t: DepositToken): string {
  if (t.kind === "USDC") return "USDC";
  if (t.kind === "CHZ") return "CHZ";
  return t.symbol;
}

export function PoolDepositDialog({ open, onClose }: PoolDepositDialogProps) {
  const poolAddress = chilizConfig.liquidityPool;
  const { primaryWallet, setShowAuthFlow } = useDynamicContext();
  const userAddress = primaryWallet?.address as Address | undefined;

  const [mode, setMode] = useState<Mode>("deposit");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState<DepositToken>({ kind: "USDC" });
  const [showTokenList, setShowTokenList] = useState(false);
  const [slippageBps, setSlippageBps] = useState<number>(DEFAULT_SLIPPAGE_BPS);

  // Pool's underlying asset + its true decimals are read on-chain — Spicy test
  // USDC is 18-decimal, mainnet (Circle) USDC is 6-decimal, so hardcoding either
  // breaks one environment. `assetDecimals` may be undefined for a tick while
  // the read is in flight; UI gracefully renders placeholders until it lands.
  const { asset: assetAddress, assetDecimals: usdcDecimals, shareDecimals } = usePoolDecimals();
  const usdcAddress = assetAddress ?? chilizConfig.usdc;

  // For withdraw the amount is always denominated in USDC.
  const decimals = mode === "withdraw" ? usdcDecimals : tokenDecimals(token, usdcDecimals);
  const parsedAmount = useMemo(() => {
    if (!amount || decimals === undefined) return undefined;
    try {
      return parseUnits(amount, decimals);
    } catch {
      return undefined;
    }
  }, [amount, decimals]);

  const poolHook: UseLiquidityPoolReturn = useLiquidityPool(poolAddress, userAddress, parsedAmount);
  const {
    stats,
    sharesOf,
    convertToAssets,
    previewDeposit,
    previewWithdraw,
    withdraw,
    withdrawState,
    refetchStats,
  } = poolHook;

  const userShares = sharesOf(userAddress ?? "0x0000000000000000000000000000000000000000");
  const userAssets = convertToAssets(BigInt(0));
  const previewSharesForDeposit = previewDeposit(BigInt(0));
  const previewSharesForWithdraw = previewWithdraw(BigInt(0));

  // Multi-token deposit goes through the swap router; allowance + transferFrom
  // target is always the router (CHZ uses msg.value and needs no allowance).
  const { depositLiquidity, depositState, routerAddress } = useChilizSwapRouter();

  // ── Token-specific balance + allowance ─────────────────────────────────
  const erc20Address: Address | undefined = useMemo(() => {
    if (token.kind === "USDC") return usdcAddress;
    if (token.kind === "ERC20") return token.address;
    return undefined; // CHZ has no ERC20 address
  }, [token, usdcAddress]);

  const { data: erc20Balance, refetch: refetchErc20Balance } = useReadContract({
    abi: erc20Abi,
    address: erc20Address,
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
    chainId: chilizConfig.chainId,
    query: { enabled: !!userAddress && !!erc20Address },
  });

  const { data: nativeBalance } = useBalance({
    address: token.kind === "CHZ" ? userAddress : undefined,
    chainId: chilizConfig.chainId,
    query: { enabled: token.kind === "CHZ" && !!userAddress },
  });

  const inputBalance: bigint | undefined =
    token.kind === "CHZ" ? nativeBalance?.value : (erc20Balance as bigint | undefined);

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    abi: erc20Abi,
    address: erc20Address,
    functionName: "allowance",
    args: userAddress && erc20Address ? [userAddress, routerAddress] : undefined,
    chainId: chilizConfig.chainId,
    query: { enabled: !!userAddress && !!erc20Address },
  });

  // ── Approve flow (only for ERC20 paths) ─────────────────────────────────
  const {
    writeContract: writeApprove,
    data: approveHash,
    isPending: approvePending,
    error: approveError,
    reset: resetApprove,
  } = useWriteContract();
  const { isLoading: approveConfirming, isSuccess: approveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  useEffect(() => {
    if (approveSuccess) {
      refetchAllowance();
      resetApprove();
    }
  }, [approveSuccess, refetchAllowance, resetApprove]);

  useEffect(() => {
    if (depositState.isSuccess || withdrawState.isSuccess) {
      refetchAllowance();
      refetchErc20Balance();
      refetchStats();
      setAmount("");
    }
  }, [depositState.isSuccess, withdrawState.isSuccess, refetchAllowance, refetchErc20Balance, refetchStats]);

  useEffect(() => {
    if (!open) {
      setAmount("");
      setShowTokenList(false);
    }
  }, [open]);

  // ── FanX/Kayen quote for non-USDC deposits ─────────────────────────────
  const quoteTokenIn: Address | undefined =
    mode === "deposit"
      ? token.kind === "ERC20"
        ? token.address
        : token.kind === "CHZ"
          ? chilizConfig.wchz
          : undefined
      : undefined;
  const { amountOut: quotedUsdcOut, error: quoteError, isLoading: quoteLoading } =
    useKayenQuote(parsedAmount, quoteTokenIn);

  // True when the user picked CHZ or a fan token but Kayen has no path to USDC
  // for it. Without this guard we'd let MetaMask try to estimate gas on a
  // transaction that reverts inside the swap, producing the cryptic "Review
  // alert / network fees unavailable" the team hit on testnet.
  const swapPathMissing =
    mode === "deposit" &&
    token.kind !== "USDC" &&
    parsedAmount !== undefined &&
    parsedAmount > BigInt(0) &&
    !quoteLoading &&
    quoteError !== null;

  const usdcZeroBalance =
    mode === "deposit" &&
    token.kind === "USDC" &&
    inputBalance !== undefined &&
    inputBalance === BigInt(0);

  // For USDC: amountOutMin is unused. For non-USDC: apply user's slippage tolerance.
  const amountOutMin: bigint = useMemo(() => {
    if (token.kind === "USDC" || quotedUsdcOut === undefined) return BigInt(0);
    const slippageMul = BigInt(10_000 - slippageBps);
    return (quotedUsdcOut * slippageMul) / BigInt(10_000);
  }, [token.kind, quotedUsdcOut, slippageBps]);

  // ── Validation ─────────────────────────────────────────────────────────
  const needsApproval =
    mode === "deposit" &&
    token.kind !== "CHZ" &&
    parsedAmount !== undefined &&
    (allowance as bigint | undefined) !== undefined &&
    (allowance as bigint) < parsedAmount;

  const insufficientBalance =
    mode === "deposit" &&
    parsedAmount !== undefined &&
    inputBalance !== undefined &&
    inputBalance < parsedAmount;

  const insufficientShares =
    mode === "withdraw" &&
    parsedAmount !== undefined &&
    userAssets !== undefined &&
    userAssets < parsedAmount;

  const txPending =
    approvePending ||
    approveConfirming ||
    depositState.isPending ||
    depositState.isConfirming ||
    withdrawState.isPending ||
    withdrawState.isConfirming;

  // ── Actions ─────────────────────────────────────────────────────────────
  const handleApprove = () => {
    if (!erc20Address || parsedAmount === undefined) return;
    writeApprove({
      abi: erc20Abi,
      address: erc20Address,
      functionName: "approve",
      args: [routerAddress, parsedAmount],
    });
  };

  const handleSubmit = () => {
    if (!userAddress || parsedAmount === undefined) return;

    if (mode === "withdraw") {
      withdraw(parsedAmount, userAddress, userAddress);
      return;
    }

    const deadline = BigInt(Math.floor(Date.now() / 1000) + DEADLINE_MIN * 60);
    if (token.kind === "USDC") {
      depositLiquidity({
        token: "USDC",
        amount: parsedAmount,
        amountOutMin: BigInt(0),
        deadline,
        receiver: userAddress,
      });
    } else if (token.kind === "CHZ") {
      depositLiquidity({
        token: "CHZ",
        amount: parsedAmount,
        amountOutMin,
        deadline,
        receiver: userAddress,
      });
    } else {
      depositLiquidity({
        token: token.address,
        amount: parsedAmount,
        amountOutMin,
        deadline,
        receiver: userAddress,
      });
    }
  };

  const handleMax = () => {
    if (mode === "deposit") {
      if (inputBalance !== undefined && decimals !== undefined) {
        // Leave a small native-CHZ reserve for gas.
        const usable = token.kind === "CHZ" ? (inputBalance > parseUnits("0.5", NATIVE_DECIMALS) ? inputBalance - parseUnits("0.5", NATIVE_DECIMALS) : BigInt(0)) : inputBalance;
        setAmount(formatUnits(usable, decimals));
      }
    } else if (userAssets !== undefined && usdcDecimals !== undefined) {
      setAmount(formatUnits(userAssets, usdcDecimals));
    }
  };

  if (!open) return null;

  // Available tokens: USDC (always), CHZ (native), then chiliz fan tokens with
  // a configured address on the active network.
  const fanTokens = (chilizConfig.tokens || []).filter((t) => !!t.tokenAddress);
  const tokenOptions: DepositToken[] = [
    { kind: "USDC" },
    { kind: "CHZ" },
    ...fanTokens.map((t) => ({ kind: "ERC20" as const, address: t.tokenAddress as Address, symbol: t.symbol, name: t.name })),
  ];

  const previewLabel = mode === "deposit" ? "You receive (shares)" : "Shares burned";
  const previewValue =
    mode === "deposit"
      ? formatShares(previewSharesForDeposit, shareDecimals)
      : formatShares(previewSharesForWithdraw, shareDecimals);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg overflow-hidden"
        style={{ background: "#0F0F0F", border: "1px solid #2A2A2A" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-[2px]" style={{ background: "linear-gradient(90deg, #E8001D 0%, transparent 60%)" }} />

        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #1E1E1E" }}>
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full" style={{ background: "#E8001D" }} />
            <h3
              className="text-[16px] font-bold uppercase tracking-[0.06em]"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", color: "#fff" }}
            >
              Liquidity Pool
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded transition-colors"
            style={{ color: "#888" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1E1E1E")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-0 rounded-md overflow-hidden" style={{ background: "#0A0A0A", border: "1px solid #1E1E1E" }}>
            {(["deposit", "withdraw"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] transition-colors"
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  background: mode === m ? "#1A1A1A" : "transparent",
                  color: mode === m ? "#fff" : "#666",
                }}
              >
                {m}
              </button>
            ))}
          </div>

          {!userAddress ? (
            <div
              className="rounded-md p-5 flex flex-col items-center text-center gap-3"
              style={{ background: "#0A0A0A", border: "1px solid #1E1E1E" }}
            >
              <Wallet size={20} style={{ color: "#666" }} />
              <p className="text-[12px]" style={{ color: "#888" }}>
                Connect your wallet to deposit or withdraw.
              </p>
              <button
                onClick={() => setShowAuthFlow(true)}
                className="mt-1 px-4 py-2 rounded text-[12px] font-bold uppercase tracking-[0.08em]"
                style={{ background: "#E8001D", color: "#fff" }}
              >
                Connect Wallet
              </button>
            </div>
          ) : (
            <>
              <NetworkGuard />

              {/* Token picker (deposit only) */}
              {mode === "deposit" && (
                <div className="relative">
                  <button
                    onClick={() => setShowTokenList((v) => !v)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-[12px]"
                    style={{ background: "#0A0A0A", border: "1px solid #1E1E1E", color: "#ccc" }}
                  >
                    <span className="uppercase tracking-[0.08em]" style={{ color: "#666", fontFamily: "'Barlow', sans-serif" }}>
                      Pay with
                    </span>
                    <span className="flex items-center gap-1.5 font-bold" style={{ color: "#fff" }}>
                      {tokenLabel(token)} <ChevronDown size={12} />
                    </span>
                  </button>
                  {showTokenList && (
                    <div
                      className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto rounded-md"
                      style={{ background: "#0A0A0A", border: "1px solid #2A2A2A" }}
                    >
                      {tokenOptions.map((t, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setToken(t);
                            setShowTokenList(false);
                            setAmount("");
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 text-[12px] hover:bg-[#181818]"
                          style={{ color: "#ccc" }}
                        >
                          <span className="font-bold uppercase tracking-[0.05em]">{tokenLabel(t)}</span>
                          {t.kind === "ERC20" && (
                            <span className="text-[10px]" style={{ color: "#666" }}>{t.name}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div
                className="rounded-md p-4"
                style={{ background: "#0A0A0A", border: "1px solid #1E1E1E" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-[0.1em]" style={{ color: "#666" }}>
                    {mode === "deposit" ? `Deposit (${tokenLabel(token)})` : "Withdraw (USDC)"}
                  </span>
                  <button
                    onClick={handleMax}
                    className="text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded"
                    style={{ background: "rgba(232,0,29,0.1)", color: "#E8001D" }}
                  >
                    Max
                  </button>
                </div>
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9.]/g, "");
                    setAmount(v);
                  }}
                  placeholder="0.00"
                  className="w-full bg-transparent outline-none font-mono text-[24px] font-bold"
                  style={{ color: "#fff", fontFamily: "'JetBrains Mono', monospace" }}
                />
                <div className="flex items-center justify-between mt-2 text-[11px]" style={{ color: "#555" }}>
                  <span>
                    {mode === "deposit" ? "Wallet" : "Your stake"}:{" "}
                    <span className="font-mono" style={{ color: "#888" }}>
                      {mode === "deposit"
                        ? `${inputBalance !== undefined && decimals !== undefined ? Number(formatUnits(inputBalance, decimals)).toLocaleString("en-US", { maximumFractionDigits: 4 }) : "—"} ${tokenLabel(token)}`
                        : `${formatAtomic(userAssets, usdcDecimals)} USDC`}
                    </span>
                  </span>
                  <span>
                    Shares:{" "}
                    <span className="font-mono" style={{ color: "#888" }}>
                      {formatShares(userShares, shareDecimals)}
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <ArrowDownUp size={14} style={{ color: "#444" }} />
              </div>

              {/* Live FanX quote for non-USDC deposits */}
              {mode === "deposit" && token.kind !== "USDC" && (
                <div
                  className="rounded-md p-4 space-y-2"
                  style={{ background: "#0A0A0A", border: "1px solid #1E1E1E" }}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="uppercase tracking-[0.1em]" style={{ color: "#666" }}>FanX quote</span>
                    <span className="font-mono" style={{ color: "#fff" }}>
                      {quotedUsdcOut !== undefined ? `${formatAtomic(quotedUsdcOut, usdcDecimals)} USDC` : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="uppercase tracking-[0.1em]" style={{ color: "#666" }}>Min received</span>
                    <span className="font-mono" style={{ color: "#888" }}>
                      {amountOutMin > BigInt(0) ? `${formatAtomic(amountOutMin, usdcDecimals)} USDC` : "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] uppercase tracking-[0.1em]" style={{ color: "#666" }}>Slippage</span>
                    {[10, 50, 100].map((bps) => (
                      <button
                        key={bps}
                        onClick={() => setSlippageBps(bps)}
                        className="text-[10px] font-bold uppercase px-2 py-0.5 rounded"
                        style={{
                          background: slippageBps === bps ? "rgba(232,0,29,0.15)" : "#1A1A1A",
                          color: slippageBps === bps ? "#E8001D" : "#888",
                          border: `1px solid ${slippageBps === bps ? "#E8001D" : "#2A2A2A"}`,
                        }}
                      >
                        {(bps / 100).toFixed(2)}%
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div
                className="rounded-md p-4 flex items-center justify-between"
                style={{ background: "#0A0A0A", border: "1px solid #1E1E1E" }}
              >
                <span className="text-[10px] uppercase tracking-[0.1em]" style={{ color: "#666" }}>
                  {previewLabel}
                </span>
                <span className="font-mono text-[14px] font-bold" style={{ color: "#fff" }}>
                  {previewValue}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center pt-2" style={{ borderTop: "1px solid #1A1A1A" }}>
                <Stat label="TVL" value={`$${formatAtomic(stats.totalAssets, usdcDecimals, 0)}`} />
                <Stat
                  label="Util."
                  value={
                    stats.utilization !== undefined
                      ? `${(Number(stats.utilization) / 1e16).toFixed(1)}%`
                      : "—"
                  }
                />
                <Stat
                  label="Fee"
                  value={
                    stats.protocolFeeBps !== undefined
                      ? `${(stats.protocolFeeBps / 100).toFixed(2)}%`
                      : "—"
                  }
                />
              </div>

              {usdcZeroBalance && (
                <div
                  className="rounded-md p-3 text-[11px]"
                  style={{ background: "rgba(245,197,24,0.08)", border: "1px solid rgba(245,197,24,0.3)", color: "#F5C518" }}
                >
                  You hold 0 USDC at{" "}
                  <span className="font-mono" style={{ color: "#fff" }}>
                    {usdcAddress.slice(0, 8)}…{usdcAddress.slice(-6)}
                  </span>
                  . Acquire test USDC before depositing.
                </div>
              )}

              {swapPathMissing && (
                <div
                  className="rounded-md p-3 text-[11px]"
                  style={{ background: "rgba(232,0,29,0.08)", border: "1px solid rgba(232,0,29,0.25)", color: "#F88" }}
                >
                  No FanX/Kayen liquidity for {tokenLabel(token)} → USDC. Pick another token.
                </div>
              )}

              {(approveError || depositState.error || withdrawState.error) && (
                <div
                  className="rounded-md p-3 text-[11px]"
                  style={{ background: "rgba(232,0,29,0.08)", border: "1px solid rgba(232,0,29,0.25)", color: "#F88" }}
                >
                  {(approveError || depositState.error || withdrawState.error)?.message?.slice(0, 200)}
                </div>
              )}

              {needsApproval && !insufficientBalance ? (
                <button
                  onClick={handleApprove}
                  disabled={txPending || parsedAmount === undefined}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded text-[12px] font-bold uppercase tracking-[0.08em] transition-all"
                  style={{
                    background: txPending ? "#3A3A3A" : "#E8001D",
                    color: "#fff",
                    cursor: txPending ? "not-allowed" : "pointer",
                  }}
                >
                  {approvePending || approveConfirming ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Approving {tokenLabel(token)}…
                    </>
                  ) : (
                    `Approve ${tokenLabel(token)}`
                  )}
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={
                    txPending ||
                    parsedAmount === undefined ||
                    parsedAmount === BigInt(0) ||
                    insufficientBalance ||
                    insufficientShares ||
                    swapPathMissing ||
                    usdcZeroBalance ||
                    stats.isPaused === true
                  }
                  className="w-full flex items-center justify-center gap-2 py-3 rounded text-[12px] font-bold uppercase tracking-[0.08em] transition-all"
                  style={{
                    background:
                      txPending || insufficientBalance || insufficientShares || swapPathMissing || usdcZeroBalance || stats.isPaused
                        ? "#3A3A3A"
                        : "#E8001D",
                    color: "#fff",
                    cursor: txPending ? "not-allowed" : "pointer",
                  }}
                >
                  {txPending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      {mode === "deposit" ? "Depositing…" : "Withdrawing…"}
                    </>
                  ) : stats.isPaused ? (
                    "Pool Paused"
                  ) : usdcZeroBalance ? (
                    "No USDC in wallet"
                  ) : swapPathMissing ? (
                    "Swap path unavailable"
                  ) : insufficientBalance ? (
                    `Insufficient ${tokenLabel(token)}`
                  ) : insufficientShares ? (
                    "Insufficient Stake"
                  ) : mode === "deposit" ? (
                    `Deposit ${tokenLabel(token)}`
                  ) : (
                    "Withdraw"
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        className="text-[9px] uppercase tracking-[0.1em] mb-1"
        style={{ color: "#555" }}
      >
        {label}
      </div>
      <div
        className="font-mono text-[12px] font-bold"
        style={{ color: "#ccc", fontFamily: "'JetBrains Mono', monospace" }}
      >
        {value}
      </div>
    </div>
  );
}
