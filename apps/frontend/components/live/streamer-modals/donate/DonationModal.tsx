"use client";

import { useEffect, useMemo, useState } from "react";
import { erc20Abi, formatUnits, maxUint256, parseUnits, type Address } from "viem";
import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useChilizSwapRouter } from "@/hooks/useChilizSwapRouter";
import { useKayenQuote } from "@/hooks/useKayenQuote";
import { usePoolDecimals } from "@/hooks/usePoolDecimals";
import { useFanTokens } from "@/hooks/useFanTokens";
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
  TokenChipDisplay,
  TokenPickerSheet,
  buildStreamerTokenList,
  decimalsFor,
  erc20AddressFor,
  symbolFor,
  toRouterToken,
  type StreamerTokenView,
} from "../shared";
import { BigTipBanner } from "./BigTipBanner";
import { DonationAmountInput } from "./DonationAmountInput";
import { DonationMessageField } from "./DonationMessageField";
import { DonationPresetGrid } from "./DonationPresetGrid";

interface DonationModalProps {
  open: boolean;
  onClose: () => void;
  streamerAddress: Address;
  streamerName: string;
  streamerHandle?: string;
  streamerAvatarUrl?: string;
}

const PLATFORM_FEE_BPS = 500; // 5% — display only; the contract owns the real number
const DEADLINE_MIN = 20;
const DEFAULT_SLIPPAGE_BPS = 50;

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
 * Streamer donation modal — design-spec UI on top of the existing
 * `ChilizSwapRouter.donate` plumbing. Supports USDC direct, native CHZ,
 * and any ERC-20 fan token via FanX/Kayen quote + slippage.
 */
export function DonationModal({
  open,
  onClose,
  streamerAddress,
  streamerName,
  streamerHandle,
  streamerAvatarUrl,
}: DonationModalProps) {
  const tokens = useMemo(() => buildStreamerTokenList(), []);
  const [selectedToken, setSelectedToken] = useState<StreamerTokenView>(tokens[0]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [amount, setAmount] = useState<string>("5");
  const [message, setMessage] = useState<string>("");
  const [slippageBps, setSlippageBps] = useState<number>(DEFAULT_SLIPPAGE_BPS);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { donate, donateState, routerAddress } = useChilizSwapRouter();
  const { assetDecimals: usdcDecimals } = usePoolDecimals();
  const { primaryWallet } = useDynamicContext();
  const userAddress = primaryWallet?.address as Address | undefined;
  const { tokenBalances } = useFanTokens(userAddress, !!userAddress);

  const tokenKind = selectedToken.token;
  const tokenSymbol = symbolFor(tokenKind);
  const decimals = decimalsFor(tokenKind, usdcDecimals);

  const parsedAmount: bigint = useMemo(() => {
    if (!amount || decimals === undefined) return BigInt(0);
    try {
      return parseUnits(amount, decimals);
    } catch {
      return BigInt(0);
    }
  }, [amount, decimals]);

  // ── Balance / picker decoration ────────────────────────────────────────
  const balanceMap = useMemo(() => {
    const map: Record<string, number | undefined> = {};
    for (const tb of tokenBalances) map[tb.symbol] = tb.balance;
    return map;
  }, [tokenBalances]);

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

  // ── FanX quote (USDC out for non-USDC paths) ───────────────────────────
  const quoteTokenIn: Address | undefined =
    tokenKind.kind === "ERC20"
      ? tokenKind.address
      : tokenKind.kind === "CHZ"
        ? chilizConfig.wchz
        : undefined;
  const {
    amountOut: quotedUsdcOut,
    error: quoteError,
    isLoading: quoteLoading,
  } = useKayenQuote(parsedAmount > BigInt(0) ? parsedAmount : undefined, quoteTokenIn);

  const swapPathMissing =
    tokenKind.kind !== "USDC" &&
    parsedAmount > BigInt(0) &&
    !quoteLoading &&
    quoteError !== null;

  const amountOutMin: bigint = useMemo(() => {
    if (tokenKind.kind === "USDC" || quotedUsdcOut === undefined) return BigInt(0);
    const slippageMul = BigInt(10_000 - slippageBps);
    return (quotedUsdcOut * slippageMul) / BigInt(10_000);
  }, [tokenKind.kind, quotedUsdcOut, slippageBps]);

  // ── Surfaced amounts for display & gating ──────────────────────────────
  const numericAmount = Number(amount) || 0;
  const tokenBalance = balanceMap[tokenSymbol];
  const insufficient =
    tokenBalance !== undefined && parsedAmount > BigInt(0) && numericAmount > tokenBalance;

  // USDC equivalent shown under the input. For USDC this equals the input;
  // for non-USDC we use the live FanX quote when it has resolved.
  const usdcEquivalent = useMemo(() => {
    if (tokenKind.kind === "USDC") return numericAmount;
    if (quotedUsdcOut !== undefined && usdcDecimals !== undefined) {
      return Number(formatUnits(quotedUsdcOut, usdcDecimals));
    }
    return null;
  }, [tokenKind.kind, numericAmount, quotedUsdcOut, usdcDecimals]);

  const platformFeeUsd =
    usdcEquivalent !== null ? (usdcEquivalent * PLATFORM_FEE_BPS) / 10_000 : null;
  const streamerGetsUsd =
    usdcEquivalent !== null && platformFeeUsd !== null
      ? usdcEquivalent - platformFeeUsd
      : null;

  // ── Error / success plumbing ────────────────────────────────────────────
  useEffect(() => {
    const err = donateState.error ?? approveError;
    if (!err) {
      setErrorMessage(null);
      return;
    }
    const decoded = decodeContractError(err);
    setErrorMessage(decoded.description ? `${decoded.title} — ${decoded.description}` : decoded.title);
  }, [donateState.error, approveError]);

  useEffect(() => {
    if (donateState.isSuccess) {
      onClose();
      setAmount("5");
      setMessage("");
      setErrorMessage(null);
    }
  }, [donateState.isSuccess, onClose]);

  const isLoading =
    donateState.isPending ||
    donateState.isConfirming ||
    isApprovePending ||
    isApproveConfirming;

  const handleSubmit = () => {
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
    donate({
      token: toRouterToken(tokenKind),
      streamer: streamerAddress,
      message,
      amount: parsedAmount,
      amountOutMin,
      deadline,
    });
  };

  // CTA copy reflects the active sub-flow (approve / pending / sending / send).
  const ctaLabel = isApprovePending
    ? "Confirm approval…"
    : isApproveConfirming
      ? `Approving ${tokenSymbol}…`
      : donateState.isPending
        ? "Confirm in wallet…"
        : donateState.isConfirming
          ? "Sending donation…"
          : needsApproval
            ? `Approve ${tokenSymbol} →`
            : usdcEquivalent !== null
              ? `Donate ${fmtUsd(usdcEquivalent)} →`
              : `Donate ${tokenSymbol} →`;

  // Sub-label below the big number input.
  const subLabel =
    tokenKind.kind === "USDC"
      ? null
      : usdcEquivalent !== null
        ? `≈ ${fmtUsd(usdcEquivalent)} USDC`
        : "FanX quote pending…";

  return (
    <StreamerModalShell open={open} onClose={onClose} ariaTitle="Donate to streamer">
      <StreamerModalHeader
        eyebrow="Direct support · on-chain"
        title={
          <>
            Tip the <span className="text-[#E8001D]">streamer.</span>
          </>
        }
        sub="Funds land in their StreamWallet within seconds. Optional message shows on the live overlay."
        onClose={onClose}
      />

      <StreamerStrip
        name={streamerName}
        handle={streamerHandle}
        avatarUrl={streamerAvatarUrl}
      />

      <div className="px-7">
        <div className="mb-3 flex items-center justify-between">
          <Eyebrow dim>
            Amount · {tokenKind.kind === "USDC" ? "USD" : tokenSymbol}
          </Eyebrow>
          <TokenChipDisplay token={selectedToken} onClick={() => setPickerOpen(true)} />
        </div>

        {tokenKind.kind === "USDC" && (
          <DonationPresetGrid
            amount={numericAmount}
            onPick={(p) => setAmount(String(p))}
          />
        )}

        <div className={tokenKind.kind === "USDC" ? "mt-4" : ""}>
          <DonationAmountInput
            amount={amount}
            onChange={setAmount}
            prefix={tokenKind.kind === "USDC" ? "$" : `$${tokenSymbol}`}
            subLabel={subLabel ?? undefined}
            onMax={
              tokenBalance !== undefined && tokenBalance > 0
                ? () => setAmount(String(tokenBalance))
                : undefined
            }
            maxLabel={
              tokenBalance !== undefined
                ? `Max · ${fmtTok(tokenBalance, tokenSymbol === "CHZ" ? 0 : 2)} ${tokenSymbol}`
                : "Max"
            }
          />
        </div>

        <div className="mt-4">
          <DonationMessageField message={message} onChange={setMessage} />
        </div>

        {usdcEquivalent !== null && usdcEquivalent >= 50 && (
          <div className="mt-4">
            <BigTipBanner amount={usdcEquivalent} />
          </div>
        )}

        {tokenKind.kind !== "USDC" && parsedAmount > BigInt(0) && (
          <div className="mt-4 rounded-xl border border-[#1F1F1F] bg-[#0a0a0a] px-4 py-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-mono-ctv text-[10px] uppercase tracking-[0.16em] text-white/45">
                FanX quote
              </span>
              <span className="font-mono-ctv font-bold tabular-nums text-white">
                {quotedUsdcOut !== undefined
                  ? `${formatAtomic(quotedUsdcOut, usdcDecimals)} USDC`
                  : "—"}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
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

        {usdcEquivalent !== null && (
          <div className="mt-5">
            <FeeBreakdown
              rows={[
                { label: "You send", value: fmtUsd(usdcEquivalent) },
                {
                  label: "Platform fee · 5%",
                  value: `− ${fmtUsd(platformFeeUsd ?? 0)}`,
                },
                {
                  label: (
                    <>
                      <span className="text-white/35">→ </span>
                      <span className="text-white/85">Streamer receives</span>
                    </>
                  ),
                  value: fmtUsd(streamerGetsUsd ?? 0),
                  accent: true,
                },
              ]}
            />
          </div>
        )}

        {swapPathMissing && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">
            No FanX/Kayen liquidity for {tokenSymbol} → USDC. Pick another token.
          </div>
        )}
      </div>

      <SettlementFooter
        ctaLabel={ctaLabel}
        onSubmit={handleSubmit}
        loading={isLoading}
        disabled={parsedAmount === BigInt(0) || swapPathMissing || insufficient}
        note="Settled on Chiliz · non-custodial"
        alert={
          <>
            {insufficient && tokenBalance !== undefined && (
              <InsufficientBalanceBanner
                symbol={tokenSymbol}
                shortfall={fmtTok(numericAmount - tokenBalance, tokenSymbol === "CHZ" ? 0 : 2)}
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

      <TokenPickerSheet
        open={pickerOpen}
        selectedSymbol={selectedToken.symbol}
        tokens={tokens}
        balances={balanceMap}
        onPick={(t) => {
          setSelectedToken(t);
          setPickerOpen(false);
          setAmount(t.token.kind === "USDC" ? "5" : "");
        }}
        onClose={() => setPickerOpen(false)}
      />
    </StreamerModalShell>
  );
}
