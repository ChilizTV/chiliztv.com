"use client";

import { useEffect, useMemo, useState } from "react";
import { erc20Abi, formatUnits, maxUint256, parseUnits, type Address } from "viem";
import { useBalance, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { TrendingUp, ExternalLink, CheckCircle2, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useChilizSwapRouter } from "@/hooks/useChilizSwapRouter";
import { useKayenQuote } from "@/hooks/useKayenQuote";
import { usePoolDecimals } from "@/hooks/usePoolDecimals";
import { chilizConfig } from "@/config/chiliz.config";
import { NetworkGuard } from "@/components/web3/NetworkGuard";
import {
  useBettingMatchReadQuoteNetExposure,
  useLiquidityPoolReadFreeBalance,
} from "@/lib/contracts/generated";
import type { MarketSelection } from "./MatchMarketsList";

interface MarketBetDialogProps {
  open: boolean;
  onClose: () => void;
  contractAddress: Address;
  walletAddress?: string;
  selection: MarketSelection | null;
  homeTeam?: string;
  awayTeam?: string;
}

interface Outcome {
  selection: number;
  label: string;
  hint?: string;
}

type BetToken =
  | { kind: "USDC" }
  | { kind: "CHZ" }
  | { kind: "ERC20"; address: Address; symbol: string; name: string };

const PERCENTS = [25, 50, 75, 100] as const;
const NATIVE_DECIMALS = 18;
const FAN_TOKEN_DECIMALS = 18;
const DEADLINE_MIN = 20; // minutes
const DEFAULT_SLIPPAGE_BPS = 50; // 0.5%
// MIN_NET_STAKE on the match is 0.1 USDC. We keep a small UX-side floor of 1
// of the input token to avoid quoting tiny amounts that round to zero.
const MIN_INPUT = 1;

function tokenDecimals(t: BetToken, usdcDecimals: number | undefined): number | undefined {
  if (t.kind === "USDC") return usdcDecimals;
  if (t.kind === "CHZ") return NATIVE_DECIMALS;
  return FAN_TOKEN_DECIMALS;
}

function tokenLabel(t: BetToken): string {
  if (t.kind === "USDC") return "USDC";
  if (t.kind === "CHZ") return "CHZ";
  return t.symbol;
}

function formatUsdc(value: bigint | undefined, decimals: number | undefined, fractionDigits = 2): string {
  if (value === undefined || decimals === undefined) return "—";
  const n = Number(formatUnits(value, decimals));
  return n.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

function getOutcomes(
  marketTypeKey: string,
  line: number,
  homeTeam?: string,
  awayTeam?: string,
): Outcome[] {
  switch (marketTypeKey) {
    case "winner":
    case "halftime":
      return [
        { selection: 0, label: homeTeam ?? "Home", hint: "Home win" },
        { selection: 1, label: "Draw", hint: "Tie" },
        { selection: 2, label: awayTeam ?? "Away", hint: "Away win" },
      ];
    case "goalstotal": {
      const ln = (line / 10).toFixed(1);
      return [
        { selection: 0, label: `Over ${ln}`, hint: "More goals" },
        { selection: 1, label: `Under ${ln}`, hint: "Fewer goals" },
      ];
    }
    case "bothscore":
      return [
        { selection: 0, label: "Yes", hint: "Both teams score" },
        { selection: 1, label: "No", hint: "At least one shut out" },
      ];
    case "firstscorer":
      return [
        { selection: 0, label: homeTeam ?? "Home", hint: "Scores first" },
        { selection: 1, label: awayTeam ?? "Away", hint: "Scores first" },
        { selection: 2, label: "No Goal", hint: "0-0 at full time" },
      ];
    default:
      return [];
  }
}

export function MarketBetDialog({
  open,
  onClose,
  contractAddress,
  walletAddress,
  selection,
  homeTeam,
  awayTeam,
}: MarketBetDialogProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [token, setToken] = useState<BetToken>({ kind: "USDC" });
  const [showTokenList, setShowTokenList] = useState(false);
  const [slippageBps, setSlippageBps] = useState<number>(DEFAULT_SLIPPAGE_BPS);

  const outcomes = useMemo(
    () => (selection ? getOutcomes(selection.marketTypeKey, selection.line, homeTeam, awayTeam) : []),
    [selection, homeTeam, awayTeam],
  );

  // Multi-asset bet entrypoint. All bets settle in USDC inside the pool;
  // the router handles the FanX swap when needed.
  const { placeBet, betState, routerAddress } = useChilizSwapRouter();
  const { assetDecimals: usdcDecimals } = usePoolDecimals();

  const decimals = tokenDecimals(token, usdcDecimals);
  const numericAmount = Number(amount);
  const isValidAmount = !Number.isNaN(numericAmount) && numericAmount >= MIN_INPUT;
  const parsedAmount: bigint =
    isValidAmount && decimals !== undefined ? parseUnits(amount, decimals) : BigInt(0);

  // ── Token-specific balance + allowance ─────────────────────────────────
  const erc20Address: Address | undefined = useMemo(() => {
    if (token.kind === "USDC") return chilizConfig.usdc;
    if (token.kind === "ERC20") return token.address;
    return undefined; // CHZ has no ERC20 address
  }, [token]);

  const { data: erc20Balance } = useBalance({
    address: walletAddress as Address | undefined,
    token: erc20Address,
    chainId: chilizConfig.chainId,
    query: { enabled: !!walletAddress && !!erc20Address },
  });

  const { data: nativeBalance } = useBalance({
    address: token.kind === "CHZ" ? (walletAddress as Address | undefined) : undefined,
    chainId: chilizConfig.chainId,
    query: { enabled: token.kind === "CHZ" && !!walletAddress },
  });

  const balance: number = token.kind === "CHZ"
    ? (nativeBalance ? Number(nativeBalance.formatted) : 0)
    : (erc20Balance ? Number(erc20Balance.formatted) : 0);

  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    abi: erc20Abi,
    address: erc20Address,
    functionName: "allowance",
    args: walletAddress && erc20Address
      ? [walletAddress as Address, routerAddress]
      : undefined,
    chainId: chilizConfig.chainId,
    query: { enabled: !!walletAddress && !!erc20Address },
  });
  const allowance = (allowanceData as bigint | undefined) ?? BigInt(0);

  // ── Approval flow (ERC20 paths only) ────────────────────────────────────
  const {
    writeContract: writeApprove,
    data: approveTxHash,
    isPending: isApprovePending,
    error: approveError,
  } = useWriteContract();
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } =
    useWaitForTransactionReceipt({ hash: approveTxHash });

  useEffect(() => {
    if (isApproveSuccess) refetchAllowance();
  }, [isApproveSuccess, refetchAllowance]);

  // ── FanX/Kayen quote for non-USDC paths ────────────────────────────────
  const quoteTokenIn: Address | undefined =
    token.kind === "ERC20" ? token.address : token.kind === "CHZ" ? chilizConfig.wchz : undefined;
  const { amountOut: quotedUsdcOut, error: quoteError, isLoading: quoteLoading } = useKayenQuote(
    parsedAmount > BigInt(0) ? parsedAmount : undefined,
    quoteTokenIn,
  );

  // Kayen has no path for the chosen non-USDC token — fail fast in the UI
  // instead of letting MetaMask report "transaction network fees unavailable"
  // when the swap reverts at gas estimation.
  const swapPathMissing =
    token.kind !== "USDC" &&
    parsedAmount > BigInt(0) &&
    !quoteLoading &&
    quoteError !== null;

  // User picked USDC but holds none at the on-chain token address.
  const usdcZeroBalance =
    token.kind === "USDC" && balance <= 0;

  const amountOutMin: bigint = useMemo(() => {
    if (token.kind === "USDC" || quotedUsdcOut === undefined) return BigInt(0);
    const slippageMul = BigInt(10_000 - slippageBps);
    return (quotedUsdcOut * slippageMul) / BigInt(10_000);
  }, [token.kind, quotedUsdcOut, slippageBps]);

  // ── Pre-bet liquidity check ────────────────────────────────────────────
  // The pool reverts on `recordBet` if `totalLiabilities + netExposure` would
  // exceed the USDC balance. Catching this here keeps users from getting an
  // unhelpful "gas estimation failed" pop-up from MetaMask.
  //
  // The expected stake the pool will see is:
  //   - USDC path: `parsedAmount` directly.
  //   - Non-USDC : the worst-case swap output we'd accept = `amountOutMin`.
  //                Using amountOutMin (post-slippage) instead of the quote keeps
  //                the check conservative — if we'd already revert at min-out
  //                liquidity, we definitely shouldn't submit.
  const expectedStakeUsdc: bigint =
    token.kind === "USDC"
      ? parsedAmount
      : amountOutMin > BigInt(0)
        ? amountOutMin
        : BigInt(0);

  const { data: quoteNetExposure } = useBettingMatchReadQuoteNetExposure({
    address: contractAddress,
    args: expectedStakeUsdc > BigInt(0)
      ? [BigInt(selection?.marketId ?? 0), expectedStakeUsdc]
      : undefined,
    chainId: chilizConfig.chainId,
    query: { enabled: !!selection && expectedStakeUsdc > BigInt(0) },
  });

  const { data: poolFreeBalance } = useLiquidityPoolReadFreeBalance({
    address: chilizConfig.liquidityPool,
    chainId: chilizConfig.chainId,
  });

  // True when the netExposure this bet would reserve exceeds what the pool
  // has free. Surface a friendly error before tx submission.
  const insufficientLiquidity: boolean =
    quoteNetExposure !== undefined &&
    poolFreeBalance !== undefined &&
    (quoteNetExposure as bigint) > (poolFreeBalance as bigint);

  // ── Status flags ────────────────────────────────────────────────────────
  const { isPending, isConfirming, isSuccess, txHash, error: txError } = betState;
  const isApproving = isApprovePending || isApproveConfirming;
  const isLoading = isPending || isConfirming || isApproving;
  const isMarketOpen = selection?.state === 1;

  // Reset form when dialog closes or market changes
  useEffect(() => {
    if (!open) {
      setSelectedOutcome(null);
      setAmount("");
      setErrorMessage(null);
      setShowTokenList(false);
    }
  }, [open, selection?.marketId]);

  useEffect(() => {
    if (txError) {
      setErrorMessage(txError.message ?? "Transaction failed");
    } else if (approveError) {
      setErrorMessage(approveError.message ?? "Approval failed");
    } else {
      setErrorMessage(null);
    }
  }, [txError, approveError]);

  if (!selection) return null;

  const needsApproval =
    token.kind !== "CHZ" &&
    parsedAmount > BigInt(0) &&
    allowance < parsedAmount;

  const insufficientBalance =
    parsedAmount > BigInt(0) && balance < numericAmount;

  const canSubmit =
    selectedOutcome !== null &&
    isValidAmount &&
    isMarketOpen &&
    !isLoading &&
    !insufficientBalance &&
    !insufficientLiquidity &&
    !swapPathMissing &&
    !usdcZeroBalance &&
    !!walletAddress;

  const handleSubmit = () => {
    if (!canSubmit || selectedOutcome === null || !walletAddress) return;
    setErrorMessage(null);
    try {
      if (needsApproval) {
        if (!erc20Address) return;
        writeApprove({
          abi: erc20Abi,
          address: erc20Address,
          functionName: "approve",
          args: [routerAddress, maxUint256],
        });
        return;
      }

      const deadline = BigInt(Math.floor(Date.now() / 1000) + DEADLINE_MIN * 60);
      placeBet({
        token: token.kind === "USDC" ? "USDC" : token.kind === "CHZ" ? "CHZ" : token.address,
        matchAddress: contractAddress,
        marketId: BigInt(selection.marketId),
        selection: BigInt(selectedOutcome),
        amount: parsedAmount,
        amountOutMin,
        deadline,
      });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const setPercent = (pct: number) => {
    if (balance <= 0) return;
    const baseValue = (balance * pct) / 100;
    // Reserve a small CHZ amount for gas when using "Max".
    const value = token.kind === "CHZ" && pct === 100 ? Math.max(0, baseValue - 0.5) : baseValue;
    setAmount(value.toFixed(4));
  };

  const fanTokens = (chilizConfig.tokens || []).filter((t) => !!t.tokenAddress);
  const tokenOptions: BetToken[] = [
    { kind: "USDC" },
    { kind: "CHZ" },
    ...fanTokens.map((t) => ({ kind: "ERC20" as const, address: t.tokenAddress as Address, symbol: t.symbol, name: t.name })),
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="sm:max-w-[460px] p-0 gap-0 rounded-lg overflow-hidden"
        style={{ background: "#0F0F0F", color: "#fff", border: "1px solid #2A2A2A" }}
      >
        <div
          className="h-[2px] w-full"
          style={{ background: "linear-gradient(90deg, #E8001D 0%, transparent 60%)" }}
        />

        <DialogHeader className="p-0">
          <div
            className="px-5 py-4 flex items-center gap-2"
            style={{ borderBottom: "1px solid #2A2A2A" }}
          >
            <TrendingUp size={14} style={{ color: "#E8001D" }} />
            <DialogTitle
              className="text-[14px] font-bold tracking-[0.1em] uppercase"
              style={{ color: "#fff", fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {selection.marketLabel}
            </DialogTitle>
            <div className="flex-1" />
            <span
              className="text-[10px] font-semibold tracking-[0.08em] uppercase mr-6"
              style={{ color: "#888", fontFamily: "'JetBrains Mono', monospace" }}
            >
              Pool {formatUsdc(selection.totalPool, usdcDecimals)} USDC
            </span>
          </div>
        </DialogHeader>

        {isSuccess ? (
          <div className="px-5 py-8 flex flex-col items-center gap-3">
            <CheckCircle2 size={36} style={{ color: "#00C853" }} />
            <p
              className="text-[14px] font-bold uppercase tracking-[0.08em]"
              style={{ color: "#fff", fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              Bet placed
            </p>
            {txHash && (
              <a
                href={`https://scan.chiliz.com/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[11px]"
                style={{ color: "#E8001D", fontFamily: "'JetBrains Mono', monospace" }}
              >
                {txHash.slice(0, 10)}…{txHash.slice(-8)}
                <ExternalLink size={11} />
              </a>
            )}
            <button
              onClick={onClose}
              className="mt-2 px-4 h-9 rounded text-[11px] font-bold tracking-[0.08em] uppercase transition-colors duration-150"
              style={{
                background: "#E8001D",
                color: "#fff",
                fontFamily: "'Barlow', sans-serif",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#B0001A";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#E8001D";
              }}
            >
              Close
            </button>
          </div>
        ) : (
          <div className="px-5 py-5 space-y-5">
            <NetworkGuard />

            {/* Outcomes */}
            <div className="space-y-2">
              <div
                className="text-[10px] font-semibold tracking-[0.1em] uppercase"
                style={{ color: "#555", fontFamily: "'Barlow', sans-serif" }}
              >
                Pick an outcome
              </div>
              {outcomes.length === 0 ? (
                <div
                  className="text-[12px] py-3 px-3 rounded"
                  style={{
                    background: "#1E1E1E",
                    color: "#888",
                    fontFamily: "'Barlow', sans-serif",
                  }}
                >
                  This market has multiple outcomes — a future detail view will let you pick a specific score.
                </div>
              ) : (
                <div
                  className="grid gap-2"
                  style={{ gridTemplateColumns: `repeat(${outcomes.length}, minmax(0, 1fr))` }}
                >
                  {outcomes.map((o) => {
                    const isSelected = selectedOutcome === o.selection;
                    return (
                      <button
                        key={o.selection}
                        onClick={() => setSelectedOutcome(o.selection)}
                        disabled={!isMarketOpen}
                        className="flex flex-col items-center gap-1 px-2 py-3 rounded transition-colors duration-150"
                        style={{
                          background: isSelected ? "rgba(232,0,29,0.12)" : "#1E1E1E",
                          border: `1px solid ${isSelected ? "#E8001D" : "#2A2A2A"}`,
                          color: isSelected ? "#fff" : "#ccc",
                          cursor: isMarketOpen ? "pointer" : "not-allowed",
                          opacity: isMarketOpen ? 1 : 0.5,
                        }}
                      >
                        <span
                          className="text-[13px] font-bold uppercase truncate w-full text-center"
                          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                        >
                          {o.label}
                        </span>
                        {o.hint && (
                          <span
                            className="text-[10px]"
                            style={{ color: "#666", fontFamily: "'Barlow', sans-serif" }}
                          >
                            {o.hint}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Token picker */}
            <div className="relative">
              <button
                onClick={() => setShowTokenList((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded text-[12px]"
                style={{ background: "#1E1E1E", border: "1px solid #2A2A2A", color: "#ccc" }}
              >
                <span className="uppercase tracking-[0.08em]" style={{ color: "#666" }}>Pay with</span>
                <span className="flex items-center gap-1.5 font-bold" style={{ color: "#fff" }}>
                  {tokenLabel(token)} <ChevronDown size={12} />
                </span>
              </button>
              {showTokenList && (
                <div
                  className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded"
                  style={{ background: "#0F0F0F", border: "1px solid #2A2A2A" }}
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

            {/* Amount */}
            <div className="space-y-2">
              <div
                className="flex items-center justify-between text-[10px] font-semibold tracking-[0.1em] uppercase"
                style={{ color: "#555", fontFamily: "'Barlow', sans-serif" }}
              >
                <span>Amount ({tokenLabel(token)})</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  Balance {balance.toFixed((decimals ?? 6) >= 18 ? 4 : 2)}
                </span>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min={MIN_INPUT}
                step="0.01"
                className="w-full px-4 py-3 rounded text-center font-bold focus:outline-none"
                style={{
                  background: "#1E1E1E",
                  border: "1px solid #2A2A2A",
                  color: "#fff",
                  fontSize: "20px",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              />
              <div className="grid grid-cols-4 gap-2">
                {PERCENTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPercent(p)}
                    disabled={balance <= 0}
                    className="py-1.5 rounded text-[11px] font-bold tracking-[0.08em] uppercase transition-colors duration-150"
                    style={{
                      background: "#1E1E1E",
                      border: "1px solid #2A2A2A",
                      color: balance > 0 ? "#fff" : "#555",
                      cursor: balance > 0 ? "pointer" : "not-allowed",
                      fontFamily: "'Barlow', sans-serif",
                    }}
                  >
                    {p === 100 ? "Max" : `${p}%`}
                  </button>
                ))}
              </div>
              <p
                className="text-[10px] text-center"
                style={{ color: "#555", fontFamily: "'Barlow', sans-serif" }}
              >
                Min stake on the pool is 0.10 USDC equivalent.
              </p>
            </div>

            {/* FanX quote (non-USDC) */}
            {token.kind !== "USDC" && parsedAmount > BigInt(0) && (
              <div
                className="rounded p-3 space-y-2"
                style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="uppercase tracking-[0.1em]" style={{ color: "#666" }}>FanX quote</span>
                  <span style={{ color: "#fff", fontFamily: "'JetBrains Mono', monospace" }}>
                    {quotedUsdcOut !== undefined ? `${formatUsdc(quotedUsdcOut, usdcDecimals)} USDC` : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="uppercase tracking-[0.1em]" style={{ color: "#666" }}>Min received</span>
                  <span style={{ color: "#888", fontFamily: "'JetBrains Mono', monospace" }}>
                    {amountOutMin > BigInt(0) ? `${formatUsdc(amountOutMin, usdcDecimals)} USDC` : "—"}
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

            {!isMarketOpen && (
              <div
                className="px-3 py-2 rounded text-[11px] text-center"
                style={{
                  background: "rgba(245,197,24,0.08)",
                  border: "1px solid rgba(245,197,24,0.3)",
                  color: "#F5C518",
                  fontFamily: "'Barlow', sans-serif",
                }}
              >
                Market is not currently open for bets.
              </div>
            )}

            {usdcZeroBalance && (
              <div
                className="px-3 py-2 rounded text-[11px]"
                style={{
                  background: "rgba(245,197,24,0.08)",
                  border: "1px solid rgba(245,197,24,0.3)",
                  color: "#F5C518",
                  fontFamily: "'Barlow', sans-serif",
                }}
              >
                You hold 0 USDC at{" "}
                <span style={{ color: "#fff", fontFamily: "'JetBrains Mono', monospace" }}>
                  {chilizConfig.usdc.slice(0, 8)}…{chilizConfig.usdc.slice(-6)}
                </span>
                . Acquire test USDC before betting.
              </div>
            )}

            {swapPathMissing && (
              <div
                className="px-3 py-2 rounded text-[11px]"
                style={{
                  background: "rgba(232,0,29,0.08)",
                  border: "1px solid rgba(232,0,29,0.3)",
                  color: "#E8001D",
                  fontFamily: "'Barlow', sans-serif",
                }}
              >
                No FanX/Kayen liquidity for {tokenLabel(token)} → USDC. Pick another token.
              </div>
            )}

            {insufficientLiquidity && (
              <div
                className="px-3 py-2 rounded text-[11px]"
                style={{
                  background: "rgba(245,197,24,0.08)",
                  border: "1px solid rgba(245,197,24,0.3)",
                  color: "#F5C518",
                  fontFamily: "'Barlow', sans-serif",
                }}
              >
                Pool liquidity is too low to back this bet right now. Reduce your stake or come back when the pool has been topped up.
                {poolFreeBalance !== undefined && (
                  <span
                    style={{
                      display: "block",
                      marginTop: 2,
                      color: "#888",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    Free pool balance: {formatUsdc(poolFreeBalance as bigint, usdcDecimals)} USDC
                  </span>
                )}
              </div>
            )}

            {errorMessage && (
              <div
                className="px-3 py-2 rounded text-[11px]"
                style={{
                  background: "rgba(232,0,29,0.08)",
                  border: "1px solid rgba(232,0,29,0.3)",
                  color: "#E8001D",
                  fontFamily: "'Barlow', sans-serif",
                }}
              >
                {errorMessage}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit && !needsApproval}
              className="w-full py-3 rounded text-[12px] font-bold tracking-[0.1em] uppercase transition-colors duration-150"
              style={{
                background: canSubmit || needsApproval ? "#E8001D" : "#1E1E1E",
                border: `1px solid ${canSubmit || needsApproval ? "#E8001D" : "#2A2A2A"}`,
                color: canSubmit || needsApproval ? "#fff" : "#666",
                cursor: canSubmit || needsApproval ? "pointer" : "not-allowed",
                fontFamily: "'Barlow', sans-serif",
              }}
              onMouseEnter={(e) => {
                if (!(canSubmit || needsApproval)) return;
                (e.currentTarget as HTMLButtonElement).style.background = "#B0001A";
              }}
              onMouseLeave={(e) => {
                if (!(canSubmit || needsApproval)) return;
                (e.currentTarget as HTMLButtonElement).style.background = "#E8001D";
              }}
            >
              {isApprovePending
                ? "Confirm approval…"
                : isApproveConfirming
                  ? `Approving ${tokenLabel(token)}…`
                  : isPending
                    ? "Confirm in wallet…"
                    : isConfirming
                      ? "Placing bet…"
                      : !walletAddress
                        ? "Connect wallet"
                        : usdcZeroBalance
                          ? "No USDC in wallet"
                          : swapPathMissing
                            ? "Swap path unavailable"
                            : insufficientLiquidity
                              ? "Pool liquidity too low"
                              : insufficientBalance
                                ? `Insufficient ${tokenLabel(token)}`
                                : needsApproval
                                  ? `Approve ${tokenLabel(token)}`
                                  : "Place bet"}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
