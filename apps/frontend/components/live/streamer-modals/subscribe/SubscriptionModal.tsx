"use client";

import { useEffect, useMemo, useState } from "react";
import { erc20Abi, formatUnits, maxUint256, parseUnits, type Address } from "viem";
import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useChilizSwapRouter } from "@/hooks/useChilizSwapRouter";
import { useKayenQuote } from "@/hooks/useKayenQuote";
import { usePoolDecimals } from "@/hooks/usePoolDecimals";
import { useFanTokens } from "@/hooks/useFanTokens";
import { useStreamWallet } from "@/hooks/useStreamWallet";
import { chilizConfig } from "@/config/chiliz.config";
import { decodeContractError } from "@/lib/contracts/errors";
import {
  Eyebrow,
  FeeBreakdown,
  InsufficientBalanceBanner,
  SettlementFooter,
  StreamerModalHeader,
  StreamerModalShell,
  StreamerStrip,
  TokenPickerSheet,
  buildStreamerTokenList,
  decimalsFor,
  erc20AddressFor,
  symbolFor,
  toRouterToken,
  type StreamerTokenView,
} from "../shared";
import { DurationGrid } from "./DurationGrid";
import { SubscriptionPerks } from "./SubscriptionPerks";
import { SubscriptionSummary } from "./SubscriptionSummary";

interface SubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  streamerAddress: Address;
  streamerName: string;
  streamerHandle?: string;
  streamerAvatarUrl?: string;
  /** Monthly subscription price (USDC). Defaults to 5 USDC if unknown. */
  monthlyPriceUsd?: number;
}

const PLATFORM_FEE_BPS = 500;
const DEADLINE_MIN = 20;
const DEFAULT_SLIPPAGE_BPS = 50;
const SECONDS_PER_MONTH = BigInt(30 * 24 * 60 * 60);

const fmtUsd = (n: number) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtTok = (n: number, dp: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });

function formatAtomic(value: bigint | undefined, decimals: number | undefined, dp = 2): string {
  if (value === undefined || decimals === undefined) return "—";
  const n = Number(formatUnits(value, decimals));
  return n.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

/**
 * Streamer subscription modal — design-spec UI on top of the existing
 * `ChilizSwapRouter.subscribe` plumbing. The user picks duration in
 * months (1/3/6/12), and the modal computes the equivalent token spend
 * for the active token (USDC, CHZ, or fan token via FanX).
 */
export function SubscriptionModal({
  open,
  onClose,
  streamerAddress,
  streamerName,
  streamerHandle,
  streamerAvatarUrl,
  monthlyPriceUsd = 5,
}: SubscriptionModalProps) {
  const tokens = useMemo(() => buildStreamerTokenList(), []);
  const [selectedToken, setSelectedToken] = useState<StreamerTokenView>(tokens[0]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [months, setMonths] = useState<number>(3);
  const [slippageBps, setSlippageBps] = useState<number>(DEFAULT_SLIPPAGE_BPS);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { subscribe, subscribeState, routerAddress } = useChilizSwapRouter();
  const { assetDecimals: usdcDecimals } = usePoolDecimals();
  const { primaryWallet } = useDynamicContext();
  const userAddress = primaryWallet?.address as Address | undefined;
  const { tokenBalances } = useFanTokens(userAddress, !!userAddress);

  const { subscription } = useStreamWallet({ streamerAddress });
  const isAlreadySubscribed = !!subscription?.isSubscribed;

  const tokenKind = selectedToken.token;
  const tokenSymbol = symbolFor(tokenKind);
  const decimals = decimalsFor(tokenKind, usdcDecimals);

  const totalUsd = monthlyPriceUsd * months;

  // ── Probe quote: 1 token unit → USDC. Lets us reverse-quote how much of
  //    the selected token covers `totalUsd`. For USDC the math is direct.
  const oneUnit: bigint =
    decimals !== undefined ? BigInt(10) ** BigInt(decimals) : BigInt(0);

  const probeTokenIn: Address | undefined =
    tokenKind.kind === "ERC20"
      ? tokenKind.address
      : tokenKind.kind === "CHZ"
        ? chilizConfig.wchz
        : undefined;

  const {
    amountOut: oneUnitInUsdc,
    error: probeError,
    isLoading: probeLoading,
  } = useKayenQuote(
    tokenKind.kind !== "USDC" && oneUnit > BigInt(0) ? oneUnit : undefined,
    probeTokenIn,
  );

  /** Token amount needed to cover `totalUsd`, expressed as a string for parseUnits. */
  const tokenAmountString = useMemo(() => {
    if (tokenKind.kind === "USDC") return totalUsd.toString();
    if (oneUnitInUsdc === undefined || usdcDecimals === undefined) return "";
    const unitUsd = Number(formatUnits(oneUnitInUsdc, usdcDecimals));
    if (!Number.isFinite(unitUsd) || unitUsd <= 0) return "";
    const raw = totalUsd / unitUsd;
    return raw.toFixed(tokenKind.kind === "CHZ" ? 0 : 4);
  }, [tokenKind.kind, totalUsd, oneUnitInUsdc, usdcDecimals]);

  const parsedAmount: bigint = useMemo(() => {
    if (!tokenAmountString || decimals === undefined) return BigInt(0);
    try {
      return parseUnits(tokenAmountString, decimals);
    } catch {
      return BigInt(0);
    }
  }, [tokenAmountString, decimals]);

  const durationSeconds = useMemo(() => SECONDS_PER_MONTH * BigInt(months), [months]);

  // ── Live FanX quote on the actual amount being sent (for slippage). ────
  const {
    amountOut: quotedUsdcOut,
    error: quoteError,
    isLoading: quoteLoading,
  } = useKayenQuote(
    parsedAmount > BigInt(0) ? parsedAmount : undefined,
    probeTokenIn,
  );

  const swapPathMissing =
    tokenKind.kind !== "USDC" &&
    parsedAmount > BigInt(0) &&
    !quoteLoading &&
    quoteError !== null;
  const probePathMissing =
    tokenKind.kind !== "USDC" && !probeLoading && probeError !== null;

  const amountOutMin: bigint = useMemo(() => {
    if (tokenKind.kind === "USDC" || quotedUsdcOut === undefined) return BigInt(0);
    const slippageMul = BigInt(10_000 - slippageBps);
    return (quotedUsdcOut * slippageMul) / BigInt(10_000);
  }, [tokenKind.kind, quotedUsdcOut, slippageBps]);

  // ── ERC-20 path: address, allowance, approval ──────────────────────────
  const erc20Address = erc20AddressFor(tokenKind);

  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    abi: erc20Abi,
    address: erc20Address,
    functionName: "allowance",
    args: userAddress && erc20Address ? [userAddress, routerAddress] : undefined,
    chainId: chilizConfig.chainId,
    query: { enabled: !!erc20Address && !!userAddress },
  });
  const allowance = (allowanceData as bigint | undefined) ?? BigInt(0);
  const needsApproval =
    tokenKind.kind !== "CHZ" && parsedAmount > BigInt(0) && allowance < parsedAmount;

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

  // ── Surfaced amounts for display & gating ──────────────────────────────
  const balanceMap = useMemo(() => {
    const map: Record<string, number | undefined> = {};
    for (const tb of tokenBalances) map[tb.symbol] = tb.balance;
    return map;
  }, [tokenBalances]);

  const tokenBalance = balanceMap[tokenSymbol];
  const numericTokenAmount = Number(tokenAmountString) || 0;
  const insufficient =
    tokenBalance !== undefined && parsedAmount > BigInt(0) && numericTokenAmount > tokenBalance;

  // ── Error / success plumbing ────────────────────────────────────────────
  useEffect(() => {
    const err = subscribeState.error ?? approveError;
    if (!err) {
      setErrorMessage(null);
      return;
    }
    const decoded = decodeContractError(err);
    setErrorMessage(decoded.description ? `${decoded.title} — ${decoded.description}` : decoded.title);
  }, [subscribeState.error, approveError]);

  useEffect(() => {
    if (subscribeState.isSuccess) {
      onClose();
      setErrorMessage(null);
    }
  }, [subscribeState.isSuccess, onClose]);

  const isLoading =
    subscribeState.isPending ||
    subscribeState.isConfirming ||
    isApprovePending ||
    isApproveConfirming;

  const handleSubmit = () => {
    if (parsedAmount === BigInt(0)) return;
    setErrorMessage(null);
    if (needsApproval && erc20Address) {
      writeApprove({
        abi: erc20Abi,
        address: erc20Address,
        functionName: "approve",
        args: [routerAddress, maxUint256],
      });
      return;
    }
    const deadline = BigInt(Math.floor(Date.now() / 1000) + DEADLINE_MIN * 60);
    subscribe({
      token: toRouterToken(tokenKind),
      streamer: streamerAddress,
      duration: durationSeconds,
      amount: parsedAmount,
      amountOutMin,
      deadline,
    });
  };

  const ctaLabel = isApprovePending
    ? "Confirm approval…"
    : isApproveConfirming
      ? `Approving ${tokenSymbol}…`
      : subscribeState.isPending
        ? "Confirm in wallet…"
        : subscribeState.isConfirming
          ? "Subscribing…"
          : needsApproval
            ? `Approve ${tokenSymbol} →`
            : `Subscribe · ${fmtUsd(totalUsd)} →`;

  const tokenAmountSubLabel =
    tokenKind.kind === "USDC"
      ? `≈ ${fmtTok(totalUsd, 2)} USDC`
      : numericTokenAmount > 0
        ? `≈ ${fmtTok(numericTokenAmount, tokenSymbol === "CHZ" ? 0 : 2)} $${tokenSymbol}`
        : "FanX quote pending…";

  // Prefer to gate behind the already-subscribed banner before showing the form.
  const renderBody = !isAlreadySubscribed;

  return (
    <StreamerModalShell open={open} onClose={onClose} ariaTitle="Subscribe to streamer">
      <StreamerModalHeader
        eyebrow="Subscription · monthly"
        title={
          <>
            Support <span className="text-[#E8001D]">{streamerName}.</span>
          </>
        }
        sub="Unlock perks for the duration you choose. Funds vest in their StreamWallet — no auto-renew."
        onClose={onClose}
      />

      <StreamerStrip
        name={streamerName}
        handle={streamerHandle}
        avatarUrl={streamerAvatarUrl}
      />

      {!renderBody && (
        <div className="px-7 pb-6">
          <div className="rounded-xl border border-[#2dd4a4]/30 bg-[#2dd4a4]/10 p-4">
            <div className="flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2dd4a4"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="font-display text-[14px] font-bold uppercase tracking-tight text-white">
                You&apos;re subscribed
              </span>
            </div>
            <p className="mt-2 text-[12px] text-white/65">
              Active until{" "}
              <span className="font-mono-ctv text-white">
                {subscription?.expiryTime ?? "—"}
              </span>
              . No auto-renew.
            </p>
          </div>
        </div>
      )}

      {renderBody && (
        <div className="px-7">
          <Eyebrow dim>Duration</Eyebrow>
          <DurationGrid months={months} monthlyUsd={monthlyPriceUsd} onPick={setMonths} />

          <div className="mt-5">
            <SubscriptionSummary
              totalUsd={totalUsd}
              tokenAmountSubLabel={tokenAmountSubLabel}
              months={months}
              selectedToken={selectedToken}
              onOpenPicker={() => setPickerOpen(true)}
            />
          </div>

          {tokenKind.kind !== "USDC" && parsedAmount > BigInt(0) && (
            <div className="mt-4 rounded-xl border border-[#1F1F1F] bg-[#0a0a0a] px-4 py-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono-ctv text-[10px] uppercase tracking-[0.16em] text-white/45">
                  Min received
                </span>
                <span className="font-mono-ctv tabular-nums text-white/65">
                  {amountOutMin > BigInt(0)
                    ? `${formatAtomic(amountOutMin, usdcDecimals)} USDC`
                    : "—"}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="font-mono-ctv text-[10px] uppercase tracking-[0.16em] text-white/45">
                  Slippage
                </span>
                {[10, 50, 100].map((bps) => (
                  <button
                    key={bps}
                    type="button"
                    onClick={() => setSlippageBps(bps)}
                    className="font-mono-ctv rounded border px-2 py-0.5 text-[10px] font-bold tabular-nums transition-colors"
                    style={{
                      borderColor: slippageBps === bps ? "#E8001D" : "#262626",
                      background: slippageBps === bps ? "rgba(232,0,29,0.10)" : "transparent",
                      color: slippageBps === bps ? "#fff" : "rgba(255,255,255,0.55)",
                    }}
                  >
                    {(bps / 100).toFixed(2)}%
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5">
            <SubscriptionPerks />
          </div>

          <div className="mt-5">
            <FeeBreakdown
              rows={[
                {
                  label: `${months} × monthly · ${fmtUsd(monthlyPriceUsd)}`,
                  value: fmtUsd(totalUsd),
                },
                {
                  label: "Platform fee · 5%",
                  value: `− ${fmtUsd((totalUsd * PLATFORM_FEE_BPS) / 10_000)}`,
                },
                {
                  label: <span className="text-white/85">Streamer receives</span>,
                  value: fmtUsd(totalUsd - (totalUsd * PLATFORM_FEE_BPS) / 10_000),
                  accent: true,
                },
              ]}
            />
          </div>

          {(swapPathMissing || probePathMissing) && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">
              No FanX/Kayen liquidity for {tokenSymbol} → USDC. Pick another token.
            </div>
          )}
        </div>
      )}

      {renderBody ? (
        <SettlementFooter
          ctaLabel={ctaLabel}
          onSubmit={handleSubmit}
          loading={isLoading}
          disabled={
            parsedAmount === BigInt(0) ||
            swapPathMissing ||
            probePathMissing ||
            insufficient
          }
          note="One-shot tx · no auto-renew"
          alert={
            <>
              {insufficient && tokenBalance !== undefined && (
                <InsufficientBalanceBanner
                  symbol={tokenSymbol}
                  shortfall={fmtTok(numericTokenAmount - tokenBalance, tokenSymbol === "CHZ" ? 0 : 2)}
                />
              )}
              {errorMessage && !insufficient && (
                <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">
                  {errorMessage}
                </div>
              )}
            </>
          }
        />
      ) : (
        <div className="border-t border-[#1F1F1F] bg-[#0a0a0a] px-7 py-5">
          <button
            type="button"
            onClick={onClose}
            className="font-display w-full rounded-xl border border-[#262626] bg-[#161616] py-3 text-[13px] font-bold uppercase tracking-[0.06em] text-white transition-colors hover:border-[#3A3A3A]"
          >
            Close
          </button>
        </div>
      )}

      <TokenPickerSheet
        open={pickerOpen}
        selectedSymbol={selectedToken.symbol}
        tokens={tokens}
        balances={balanceMap}
        onPick={(t) => {
          setSelectedToken(t);
          setPickerOpen(false);
        }}
        onClose={() => setPickerOpen(false)}
      />
    </StreamerModalShell>
  );
}
