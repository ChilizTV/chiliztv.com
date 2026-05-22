"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { erc20Abi, formatUnits, maxUint256, parseUnits, type Address } from "viem";
import { useBalance, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@chiliztv/ui";
import { useChilizSwapRouter } from "@/hooks/useChilizSwapRouter";
import { useKayenQuote } from "@/hooks/useKayenQuote";
import { usePoolDecimals } from "@/hooks/usePoolDecimals";
import { chilizConfig } from "@/config/chiliz.config";
import { decodeContractError } from "@/lib/contracts/errors";
import { NetworkGuard } from "@/components/web3/NetworkGuard";
import {
  usePariMatchFactoryReadGetSportType,
  usePariMatchBaseReadFeeBps,
  usePariMatchBaseWatchPositionTaken,
  useChilizSwapRouterSimulatePlaceBetWithUsdc,
  useChilizSwapRouterSimulatePlaceBetWithChz,
  useChilizSwapRouterSimulatePlaceBetWithToken,
} from "@/lib/contracts/generated";
import { useMarketPools } from "@/hooks/api/useMarketPools";
import { useMyBetOnOutcome } from "@/hooks/useMyBetOnOutcome";
import { parimutuelPayoutPreview } from "@/hooks/useParimutuelPayoutPreview";
import {
  fmtSelectionByMarket,
  getMarketSpec,
  isFootballMatch,
  MarketState,
} from "@/lib/contracts/markets";
import { tokenLogoFor } from "@/lib/tokens/tokenLogo";
import { useInvalidateMyBets } from "@/components/features/dashboard/hooks/useMyBets";
import { BdEyebrow } from "./dialog/BdEyebrow";
import { StepIndicator, BET_DIALOG_STEPS } from "./dialog/StepIndicator";
import { ErrorBanner } from "./dialog/ErrorBanner";
import { DialogFooter } from "./dialog/DialogFooter";
import { BetSelectionStep } from "./dialog/BetSelectionStep";
import { BetStakeStep } from "./dialog/BetStakeStep";
import { BetReviewStep } from "./dialog/BetReviewStep";
import { BetSuccessStep } from "./dialog/BetSuccessStep";
import { BetFailureStep } from "./dialog/BetFailureStep";
import { UnsupportedSportPanel } from "./UnsupportedSportPanel";
import type { BetTokenOption } from "./dialog/TokenSelectModal";
import type { MarketSelection, MatchBettableContext } from "./MatchMarketsList";
import { isBettable, type BettableResult } from "@chiliztv/domain/matches/policies/BettablePolicy";

const KICKOFF_BUFFER_SEC = 120;

interface MarketBetDialogProps {
  open: boolean;
  onClose: () => void;
  contractAddress: Address;
  walletAddress?: string;
  selection: MarketSelection | null;
  homeTeam?: string;
  awayTeam?: string;
  /** Match metadata pour le check `isBettable`. `undefined` ⇒ on ne bloque pas (fallback historique). */
  match?: MatchBettableContext;
  /** Horloge cliente — `null` en SSR. */
  now?: Date | null;
}

type BetToken =
  | { kind: "USDC" }
  | { kind: "CHZ" }
  | { kind: "ERC20"; address: Address; symbol: string; name: string };

type Phase = "pick" | "stake" | "review" | "success" | "failure";

const NATIVE_DECIMALS = 18;
const FAN_TOKEN_DECIMALS = 18;
const DEADLINE_MIN = 20; // minutes
const DEFAULT_SLIPPAGE_BPS = 50; // 0.5%
const SLIPPAGE_PRESETS_BPS = [10, 50, 100] as const;
// Default fee — mirrors PariMatchBase.sol:91 (feeBps configurable, default 500 = 5%).
// Read on-chain via usePariMatchBaseReadFeeBps; this constant is the fallback.
const DEFAULT_FEE_BPS = 500;
// Contract floor — PariMatchBase.sol:90 `uint256 public constant MIN_STAKE = 10_000;`
// = 0.01 USDC at 6 dp. Pre-checked here so the user gets a clear UI message
// rather than a wallet-popup gas-estimation revert (StakeBelowMinimum).
const MIN_STAKE_USDC_RAW = BigInt(10_000);

function tokenLabel(t: BetToken): string {
  if (t.kind === "USDC") return "USDC";
  if (t.kind === "CHZ") return "CHZ";
  return t.symbol;
}
function tokenDecimals(t: BetToken, usdcDecimals: number | undefined): number | undefined {
  if (t.kind === "USDC") return usdcDecimals;
  if (t.kind === "CHZ") return NATIVE_DECIMALS;
  return FAN_TOKEN_DECIMALS;
}
function tokenLogoBg(kind: BetToken["kind"]): string {
  if (kind === "USDC") return "#2775CA";
  if (kind === "CHZ") return "#E8001D";
  return "#1E1E1E";
}
function tokenLogoTxt(kind: BetToken["kind"]): string | undefined {
  if (kind === "USDC") return "$";
  if (kind === "CHZ") return "C";
  return undefined;
}

function formatUsdc(value: bigint | undefined, decimals: number | undefined, fractionDigits = 2): string {
  if (value === undefined || decimals === undefined) return "—";
  const n = Number(formatUnits(value, decimals));
  return n.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

function fmtUsd(n: number | null, dp = 2): string {
  if (n === null || Number.isNaN(n)) return "—";
  const sign = n < 0 ? "-" : "";
  return sign + "$" + Math.abs(n).toFixed(dp).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** Label affiché dans le panneau "Betting closed" du dialog. */
function policyMessageFor(verdict: BettableResult, kickoffAt: string, now: Date): string {
  if (verdict.ok) return "";
  switch (verdict.reason) {
    case "LIVE":           return "Live · Predictions closed";
    case "HALFTIME":       return "Halftime · Predictions closed";
    case "KICKOFF_BUFFER": {
      const mins = Math.max(1, Math.ceil((new Date(kickoffAt).getTime() - now.getTime()) / 60_000));
      return `Kicks off in ${mins}m · Predictions closed`;
    }
    case "FINISHED":       return "Awaiting resolution";
    case "POSTPONED":      return "Postponed";
    case "UNKNOWN":
    default:               return "Predictions unavailable";
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
  match,
  now,
}: MarketBetDialogProps) {
  // ── State machine ───────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>("pick");
  const [selectedOutcome, setSelectedOutcome] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState<BetToken>({ kind: "USDC" });
  const [slippageBps, setSlippageBps] = useState<number>(DEFAULT_SLIPPAGE_BPS);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [failureKind, setFailureKind] = useState<'rejected' | 'reverted' | 'unknown'>('unknown');
  const [failureReason, setFailureReason] = useState<string | null>(null);

  // ── Sport-type guard ────────────────────────────────────────────────────
  const { data: sportType } = usePariMatchFactoryReadGetSportType({
    address: chilizConfig.pariMatchFactory,
    args: contractAddress ? [contractAddress] : undefined,
    chainId: chilizConfig.chainId,
    query: { enabled: !!contractAddress && open },
  });
  const isFootball = sportType === undefined ? true : isFootballMatch(sportType);

  // ── Catalog lookup ──────────────────────────────────────────────────────
  const marketSpec = useMemo(
    () => (selection ? getMarketSpec(selection.marketTypeHash) : null),
    [selection],
  );
  const outcomes = useMemo(
    () => (marketSpec && selection
      ? marketSpec.getOutcomes(selection.line, homeTeam, awayTeam)
      : []),
    [marketSpec, selection, homeTeam, awayTeam],
  );

  // Pre-fill outcome when a Predict cell on the list passed `defaultSelection`.
  useEffect(() => {
    if (!open || !selection) return;
    const ds = selection.defaultSelection;
    if (ds === undefined) return;
    if (outcomes.some((o) => o.selection === ds)) {
      setSelectedOutcome(ds);
      setPhase("stake");
    }
  }, [open, selection, outcomes]);

  // Reset state every time the dialog closes / market changes.
  useEffect(() => {
    if (!open) {
      setPhase("pick");
      setSelectedOutcome(null);
      setAmount("");
      setToken({ kind: "USDC" });
      setSlippageBps(DEFAULT_SLIPPAGE_BPS);
      setBannerError(null);
      setFailureKind('unknown');
      setFailureReason(null);
    }
  }, [open, selection?.marketId]);

  // Catalog miss (e.g. CORRECT_SCORE leaked in via deep link) → toast + close.
  useEffect(() => {
    if (!open || !selection) return;
    if (!isFootball) return;
    if (!marketSpec) {
      toast.warning("Market not available", {
        description: "This market type isn't supported in the predictions UI yet.",
      });
      onClose();
    }
  }, [open, selection, marketSpec, isFootball, onClose]);

  // ── Tx wiring (parimutuel path) ────────────────────────────────────────
  const { placeBet, betState, routerAddress } = useChilizSwapRouter();
  const { assetDecimals: usdcDecimals } = usePoolDecimals();

  const decimals = tokenDecimals(token, usdcDecimals);
  const numericAmount = Number(amount);
  const isValidAmount = !Number.isNaN(numericAmount) && numericAmount > 0;
  const parsedAmount: bigint =
    isValidAmount && decimals !== undefined ? parseUnits(amount, decimals) : BigInt(0);

  const erc20Address: Address | undefined = useMemo(() => {
    if (token.kind === "USDC") return chilizConfig.usdc;
    if (token.kind === "ERC20") return token.address;
    return undefined;
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

  const { writeContract: writeApprove, data: approveTxHash, isPending: isApprovePending, error: approveError } =
    useWriteContract();
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } =
    useWaitForTransactionReceipt({ hash: approveTxHash });

  const quoteTokenIn: Address | undefined =
    token.kind === "ERC20" ? token.address : token.kind === "CHZ" ? chilizConfig.wchz : undefined;
  const { amountOut: quotedUsdcOut, error: quoteError, isLoading: quoteLoading } = useKayenQuote(
    parsedAmount > BigInt(0) ? parsedAmount : undefined,
    quoteTokenIn,
  );
  const swapPathMissing =
    token.kind !== "USDC" && parsedAmount > BigInt(0) && !quoteLoading && quoteError !== null;
  const usdcZeroBalance = token.kind === "USDC" && balance <= 0;

  const amountOutMin: bigint = useMemo(() => {
    if (token.kind === "USDC" || quotedUsdcOut === undefined) return BigInt(0);
    const slippageMul = BigInt(10_000 - slippageBps);
    return (quotedUsdcOut * slippageMul) / BigInt(10_000);
  }, [token.kind, quotedUsdcOut, slippageBps]);

  // USDC amount the contract will actually see (post-swap on non-USDC paths).
  const expectedStakeUsdc: bigint =
    token.kind === "USDC" ? parsedAmount : amountOutMin > BigInt(0) ? amountOutMin : BigInt(0);

  const insufficientBalance = parsedAmount > BigInt(0) && balance < numericAmount;
  const stakeBelowMinimum =
    expectedStakeUsdc > BigInt(0) && expectedStakeUsdc < MIN_STAKE_USDC_RAW;

  // Non-USDC paths need the Kayen quote to compute the actual stake the
  // contract will see. While the quote is loading or the token has no path,
  // we don't yet know if the bet will clear MIN_STAKE — block Continue so the
  // user can't slide past the gate during the quote round-trip.
  const quotePending =
    token.kind !== "USDC" &&
    parsedAmount > BigInt(0) &&
    (quoteLoading || quotedUsdcOut === undefined) &&
    !swapPathMissing;

  // ── Parimutuel pool snapshot + payout preview ──────────────────────────
  const { data: marketPools } = useMarketPools(contractAddress);
  const marketSnapshot = useMemo(
    () => selection
      ? marketPools?.markets.find((m) => BigInt(m.marketId) === BigInt(selection.marketId))
      : undefined,
    [marketPools, selection],
  );
  const ZERO_BIG = BigInt(0);
  const totalPoolBig = marketSnapshot ? BigInt(marketSnapshot.totalPool) : ZERO_BIG;
  const outcomePoolBig = (() => {
    if (!marketSnapshot || selectedOutcome === null) return ZERO_BIG;
    const raw = marketSnapshot.outcomePools[selectedOutcome];
    return raw ? BigInt(raw) : ZERO_BIG;
  })();
  const impliedProbBpsBySelection = useMemo(() => {
    const map = new Map<number, number>();
    if (!marketSnapshot || BigInt(marketSnapshot.totalPool) === BigInt(0)) return map;
    marketSnapshot.impliedProbBps.forEach((bps: number, idx: number) => map.set(idx, bps));
    return map;
  }, [marketSnapshot]);
  const outcomePoolsBySelection = useMemo(() => {
    const map = new Map<number, bigint>();
    if (!marketSnapshot) return map;
    marketSnapshot.outcomePools.forEach((raw: string, idx: number) => map.set(idx, BigInt(raw)));
    return map;
  }, [marketSnapshot]);

  // User's existing stake on the picked outcome — single lazy read, fires
  // only once `selectedOutcome` is set. Feeds parimutuelPayoutPreview.
  const { existingStake } = useMyBetOnOutcome({
    contractAddress,
    marketId: selection ? BigInt(selection.marketId) : undefined,
    outcome: selectedOutcome !== null ? BigInt(selectedOutcome) : null,
    userAddress: walletAddress as Address | undefined,
    enabled: open && phase !== 'success' && phase !== 'failure',
  });

  // Fee in basis points — defaults to 500 (5%) per contract default. Read
  // on-chain so configured overrides are picked up automatically.
  const { data: feeBpsOnchain } = usePariMatchBaseReadFeeBps({
    address: contractAddress,
    chainId: chilizConfig.chainId,
    query: { enabled: open && !!contractAddress },
  });
  const feeBps = typeof feeBpsOnchain === 'number' ? feeBpsOnchain : DEFAULT_FEE_BPS;

  // Payout preview — mirrors PariMatchBase.sol:534 exactly. Returns the
  // USDC raw payout the user receives if their picked outcome wins.
  const grossPayoutRaw: bigint = useMemo(() => {
    if (selectedOutcome === null || expectedStakeUsdc === BigInt(0)) return BigInt(0);
    return parimutuelPayoutPreview({
      totalPool: totalPoolBig,
      outcomePool: outcomePoolBig,
      existingStake,
      additionalStake: expectedStakeUsdc,
      feeBps,
    });
  }, [selectedOutcome, expectedStakeUsdc, totalPoolBig, outcomePoolBig, existingStake, feeBps]);
  const grossPayoutUsdc: number | null =
    grossPayoutRaw > BigInt(0) && usdcDecimals !== undefined
      ? Number(formatUnits(grossPayoutRaw, usdcDecimals))
      : null;

  // ── Tx flags ────────────────────────────────────────────────────────────
  const { isPending, isConfirming, isSuccess, txHash, error: txError, isReverted, isUserRejected } = betState;
  const isApproving = isApprovePending || isApproveConfirming;
  const submitting = isPending || isConfirming || isApproving;
  const isMarketOpen = selection?.state === MarketState.Open;

  // Couche 2 du defense-in-depth no-live-betting. Si match metadata absent
  // (composant ancien call-site), `verdict.ok = true` par défaut.
  const verdict: BettableResult =
    match && now
      ? isBettable(match, now, { kickoffBufferSec: KICKOFF_BUFFER_SEC })
      : { ok: true };
  const policyAllowsBetting = verdict.ok;

  useEffect(() => {
    if (!open) return;
    if (!policyAllowsBetting && (phase === "pick" || phase === "stake" || phase === "review")) {
      setPhase("pick");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [policyAllowsBetting, open]);

  const policyBlockMessage = !policyAllowsBetting && match && now ? policyMessageFor(verdict, match.kickoffAt, now) : "";

  // Map the stake decimal stream into the token shape the StakeStep wants.
  const fanTokens = (chilizConfig.tokens || []).filter((t) => !!t.tokenAddress);
  const tokenOptions: ReadonlyArray<BetTokenOption & { kind: BetToken["kind"]; address?: Address }> = useMemo(() => {
    const usdc: BetTokenOption & { kind: BetToken["kind"] } = {
      kind: "USDC",
      key: "USDC",
      sym: "USDC",
      name: "USD Coin",
      balance: token.kind === "USDC" ? balance : 0,
      decimals: usdcDecimals ?? 2,
      needsSwap: false,
      logoTxt: "$",
      logoBg: "#2775CA",
      logoUrl: tokenLogoFor("USDC") ?? undefined,
    };
    const chz: BetTokenOption & { kind: BetToken["kind"] } = {
      kind: "CHZ",
      key: "CHZ",
      sym: "CHZ",
      name: "Chiliz",
      balance: token.kind === "CHZ" ? balance : 0,
      decimals: 4,
      needsSwap: true,
      logoTxt: "C",
      logoBg: "#E8001D",
      logoUrl: tokenLogoFor("CHZ") ?? undefined,
    };
    const erc20s = fanTokens.map((t) => ({
      kind: "ERC20" as const,
      address: t.tokenAddress as Address,
      key: t.symbol,
      sym: t.symbol,
      name: t.name,
      balance: token.kind === "ERC20" && token.address === t.tokenAddress ? balance : 0,
      decimals: 4,
      needsSwap: true,
      logoUrl: tokenLogoFor(t.symbol) ?? undefined,
    }));
    return [usdc, chz, ...erc20s];
  }, [fanTokens, token, balance, usdcDecimals]);

  const currentTokenOption: BetTokenOption = useMemo(() => {
    const sym = tokenLabel(token);
    return {
      key: sym,
      sym,
      name: token.kind === "USDC" ? "USD Coin" : token.kind === "CHZ" ? "Chiliz" : token.name,
      balance,
      decimals: token.kind === "USDC" ? usdcDecimals ?? 2 : 4,
      needsSwap: token.kind !== "USDC",
      logoTxt: tokenLogoTxt(token.kind),
      logoBg: tokenLogoBg(token.kind),
      logoUrl: tokenLogoFor(sym) ?? undefined,
    };
  }, [token, balance, usdcDecimals]);

  // ── Submit tx (approve OR placeBet) ─────────────────────────────────────
  const needsApproval =
    token.kind !== "CHZ" && parsedAmount > BigInt(0) && allowance < parsedAmount;

  // DB odds drive the picker as a cosmetic hint when the pool is empty.
  const oddsBySelection = selection?.oddsBySelection ?? new Map<number, number>();

  // ── Pre-flight simulation ──────────────────────────────────────────────
  const deadlineForSim = BigInt(Math.floor(Date.now() / 1000) + DEADLINE_MIN * 60);
  const simEnabled =
    !!walletAddress &&
    !!selection &&
    selectedOutcome !== null &&
    parsedAmount > BigInt(0) &&
    isMarketOpen;

  // ABI signatures (verified against ChilizSwapRouter parimutuel):
  //   placeBetWithUSDC(bettingMatch, marketId, outcome, amount)
  //   placeBetWithCHZ (bettingMatch, marketId, outcome, amountOutMin, deadline)  payable
  //   placeBetWithToken(token, amount, bettingMatch, marketId, outcome, amountOutMin, deadline)
  const usdcSim = useChilizSwapRouterSimulatePlaceBetWithUsdc({
    address: routerAddress,
    args: simEnabled && token.kind === "USDC"
      ? [contractAddress, BigInt(selection!.marketId), BigInt(selectedOutcome!), parsedAmount]
      : undefined,
    chainId: chilizConfig.chainId,
    query: { enabled: simEnabled && token.kind === "USDC" },
  });
  const chzSim = useChilizSwapRouterSimulatePlaceBetWithChz({
    address: routerAddress,
    args: simEnabled && token.kind === "CHZ"
      ? [contractAddress, BigInt(selection!.marketId), BigInt(selectedOutcome!), amountOutMin, deadlineForSim]
      : undefined,
    value: simEnabled && token.kind === "CHZ" ? parsedAmount : undefined,
    chainId: chilizConfig.chainId,
    query: { enabled: simEnabled && token.kind === "CHZ" },
  });
  const tokenSim = useChilizSwapRouterSimulatePlaceBetWithToken({
    address: routerAddress,
    args: simEnabled && token.kind === "ERC20"
      ? [token.address, parsedAmount, contractAddress, BigInt(selection!.marketId), BigInt(selectedOutcome!), amountOutMin, deadlineForSim]
      : undefined,
    chainId: chilizConfig.chainId,
    query: { enabled: simEnabled && token.kind === "ERC20" && !needsApproval },
  });

  // Refetch sims after a successful approve so they pick up the new allowance.
  useEffect(() => {
    if (!isApproveSuccess) return;
    refetchAllowance();
    void usdcSim.refetch();
    void tokenSim.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApproveSuccess, refetchAllowance]);

  const simError =
    token.kind === "USDC"
      ? usdcSim.error
      : token.kind === "CHZ"
        ? chzSim.error
        : tokenSim.error;
  const simulationFailed = !!simError && !needsApproval;

  // Surface the simulation revert reason directly into the banner so the user
  // sees it before signing (rather than burning ~1 CHZ of gas).
  useEffect(() => {
    if (!simulationFailed || !simError) {
      setBannerError(null);
      return;
    }
    const decoded = decodeContractError(simError);
    setBannerError(decoded.description ? `${decoded.title} — ${decoded.description}` : decoded.title);
  }, [simulationFailed, simError]);

  const canPlaceBet =
    selectedOutcome !== null &&
    isValidAmount &&
    isMarketOpen &&
    policyAllowsBetting &&
    !submitting &&
    !insufficientBalance &&
    !swapPathMissing &&
    !usdcZeroBalance &&
    !stakeBelowMinimum &&
    !quotePending &&
    !simulationFailed &&
    !!walletAddress;

  const submit = () => {
    if (!selection || selectedOutcome === null || !walletAddress) return;
    setBannerError(null);
    try {
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
      const decoded = decodeContractError(err);
      setBannerError(decoded.description ? `${decoded.title} — ${decoded.description}` : decoded.title);
    }
  };

  // ── Watch PositionTaken for indexer status ──────────────────────────────
  const [eventConfirmed, setEventConfirmed] = useState(false);
  usePariMatchBaseWatchPositionTaken({
    address: contractAddress,
    chainId: chilizConfig.chainId,
    args: walletAddress && selection
      ? { marketId: BigInt(selection.marketId), user: walletAddress as Address }
      : undefined,
    enabled: open && isSuccess && !eventConfirmed,
    onLogs(logs) {
      if (logs.length > 0) setEventConfirmed(true);
    },
  });
  useEffect(() => {
    if (!open) setEventConfirmed(false);
  }, [open]);

  // Tx success → advance to success phase (one-shot).
  const advancedRef = useRef(false);
  useEffect(() => {
    if (open && isSuccess && !advancedRef.current) {
      advancedRef.current = true;
      setPhase("success");
      toast.success("Prediction placed", {
        description: txHash ? `${txHash.slice(0, 10)}…${txHash.slice(-8)}` : undefined,
      });
    }
    if (!open) advancedRef.current = false;
  }, [open, isSuccess, txHash]);

  // Refetch My Bets shortly after the tx confirms.
  const invalidateMyBets = useInvalidateMyBets();
  useEffect(() => {
    if (!isSuccess) return;
    invalidateMyBets();
    const handles = [2000, 4000, 7000, 11000].map((ms) => setTimeout(invalidateMyBets, ms));
    return () => handles.forEach(clearTimeout);
  }, [isSuccess, invalidateMyBets]);

  useEffect(() => {
    if (!isUserRejected) return;
    if (!advancedRef.current) {
      advancedRef.current = true;
      setFailureKind('rejected');
      setFailureReason(null);
      setPhase('failure');
    }
  }, [isUserRejected]);

  useEffect(() => {
    if (!txError || isUserRejected || isReverted) return;
    if (advancedRef.current) return;
    advancedRef.current = true;
    const decoded = decodeContractError(txError);
    setFailureKind('reverted');
    setFailureReason(decoded.description ? `${decoded.title} — ${decoded.description}` : decoded.title);
    setPhase('failure');
  }, [txError, isUserRejected, isReverted]);

  useEffect(() => {
    if (!isReverted) return;
    if (!advancedRef.current) {
      advancedRef.current = true;
      setFailureKind('reverted');
      const simErr =
        token.kind === 'USDC' ? usdcSim.error : token.kind === 'CHZ' ? chzSim.error : tokenSim.error;
      if (simErr) {
        const decoded = decodeContractError(simErr);
        setFailureReason(decoded.description ? `${decoded.title} — ${decoded.description}` : decoded.title);
      } else if (txError) {
        const decoded = decodeContractError(txError);
        setFailureReason(decoded.description ? `${decoded.title} — ${decoded.description}` : decoded.title);
      } else {
        setFailureReason(null);
      }
      setPhase('failure');
    }
  }, [isReverted, txError, token.kind, usdcSim.error, chzSim.error, tokenSim.error]);

  // Approve-flow errors surfaced as a dismissable banner, not a takeover.
  useEffect(() => {
    if (!approveError) return;
    const decoded = decodeContractError(approveError);
    const reason = decoded.description ? `${decoded.title} — ${decoded.description}` : decoded.title;
    setBannerError(`Approval failed — ${reason}`);
  }, [approveError]);

  // ── Derived display strings ─────────────────────────────────────────────
  const stakeUsdcEquivNum = (() => {
    if (token.kind === "USDC") return numericAmount > 0 ? numericAmount : null;
    if (quotedUsdcOut !== undefined && usdcDecimals !== undefined) {
      return Number(formatUnits(quotedUsdcOut, usdcDecimals));
    }
    return null;
  })();

  const selectionLabel = selection
    ? fmtSelectionByMarket(
        selectedOutcome ?? -1,
        selection.marketTypeHash,
        selection.line,
        homeTeam,
        awayTeam,
      )
    : "—";
  const stakeLabel = `${amount || "0"} ${tokenLabel(token)}`;
  // Net payout = gross payout already nets the fee (parimutuelPayoutPreview
  // multiplies by (10_000 - feeBps) / 10_000 — same as the contract).
  const netPayoutLabel = grossPayoutUsdc !== null ? fmtUsd(grossPayoutUsdc) : null;

  // Compute the next-button state for each phase.
  const continueLabelByPhase: Record<Phase, string> = {
    pick: "Continue →",
    stake: "Review →",
    review: needsApproval ? `Approve ${tokenLabel(token)}` : "Place prediction",
    success: "Close",
    failure: "Close",
  };
  const nextDisabled = (() => {
    if (!policyAllowsBetting && (phase === "pick" || phase === "stake" || phase === "review")) {
      return true;
    }
    if (phase === "pick") {
      return selectedOutcome === null || !isMarketOpen;
    }
    if (phase === "stake") {
      return !isValidAmount || insufficientBalance || swapPathMissing || usdcZeroBalance || stakeBelowMinimum || quotePending;
    }
    if (phase === "review") return !canPlaceBet && !needsApproval;
    return false;
  })();

  const onNext = () => {
    if (!policyAllowsBetting && (phase === "pick" || phase === "stake" || phase === "review")) {
      onClose();
      return;
    }
    if (phase === "pick") setPhase("stake");
    else if (phase === "stake") setPhase("review");
    else if (phase === "review") submit();
    else if (phase === "success") onClose();
  };
  const onBack =
    phase === "stake"
      ? () => setPhase("pick")
      : phase === "review"
        ? () => setPhase("stake")
        : undefined;

  // Banner string — surface the most recent error, then secondary contextual hints.
  const banner: string | null = (() => {
    if (bannerError) return bannerError;
    if (stakeBelowMinimum && token.kind !== "USDC") {
      const usdcOut = formatUsdc(expectedStakeUsdc, usdcDecimals);
      return `${amount} ${tokenLabel(token)} swaps to ≈ ${usdcOut} USDC after Kayen — below the 0.01 USDC contract minimum. Predict a larger amount or switch to USDC.`;
    }
    if (stakeBelowMinimum)
      return `Stake below the contract minimum (0.01 USDC). Increase your amount.`;
    if (quotePending && phase !== "pick")
      return "Loading the FanX/Kayen quote — checking the swap output is above the 0.01 USDC minimum.";
    if (swapPathMissing) return `No FanX/Kayen liquidity for ${tokenLabel(token)} → USDC. Pick another token.`;
    if (usdcZeroBalance && phase === "stake")
      return `You hold 0 USDC at ${chilizConfig.usdc.slice(0, 8)}…${chilizConfig.usdc.slice(-6)}. Acquire test USDC before predicting.`;
    return null;
  })();

  if (!selection) return null;

  // ── Render ──────────────────────────────────────────────────────────────
  const stepIdx = phase === "pick" ? 0 : phase === "stake" ? 1 : phase === "review" ? 2 : 3;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="flex w-full max-w-[540px] flex-col overflow-hidden rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-0 gap-0"
        style={{ maxHeight: "90dvh", boxShadow: "0 30px 80px rgba(0,0,0,0.55)" }}
      >
        <DialogTitle className="sr-only">
          Place prediction — {selection.marketLabel} on {homeTeam ?? "Home"} vs {awayTeam ?? "Away"}
        </DialogTitle>
        {!isFootball ? (
          <UnsupportedSportPanel onClose={onClose} />
        ) : (
          <>
            {/* Sticky header */}
            <div className="sticky top-0 z-[2] border-b border-[#1E1E1E] bg-[#0A0A0A]/95 backdrop-blur">
              <div className="flex items-start justify-between gap-4 px-7 pb-4 pt-6">
                <div className="min-w-0 flex-1">
                  <BdEyebrow>Football · {selection.marketLabel}</BdEyebrow>
                  <div
                    className="font-display mt-2 text-[26px] uppercase leading-[0.95] tracking-[-0.015em] text-white sm:text-[30px]"
                    style={{ fontWeight: 800 }}
                  >
                    {homeTeam ?? "Home"} <span className="text-white/40">vs</span> {awayTeam ?? "Away"}
                  </div>
                  <div className="font-mono-ctv mt-2 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
                    <span>Market #{selection.marketId}</span>
                    <span className="block h-3 w-px bg-[#2A2A2A]" />
                    <span className="text-[#E8001D]">{marketSpec?.label ?? "—"}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border border-[#1E1E1E] text-white/55 transition-colors hover:border-[#E8001D] hover:text-white"
                >
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <StepIndicator steps={BET_DIALOG_STEPS} activeIdx={stepIdx} />
              <ErrorBanner msg={banner} onDismiss={() => setBannerError(null)} />
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-7 py-6">
              <NetworkGuard />

              {!policyAllowsBetting && (phase === "pick" || phase === "stake" || phase === "review") ? (
                <div className="flex flex-col items-center gap-4 py-10 text-center">
                  <div
                    className="font-mono-ctv inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em]"
                    style={{
                      background: "rgba(232,0,29,0.08)",
                      border: "1px solid rgba(232,0,29,0.3)",
                      color: "#E8001D",
                    }}
                    role="status"
                  >
                    {policyBlockMessage || "Predictions closed"}
                  </div>
                  <div className="font-display text-[22px] font-extrabold uppercase leading-tight tracking-tight text-white">
                    {policyBlockMessage || "Predictions closed"}
                  </div>
                  <div className="max-w-[360px] text-[13px] leading-[1.55] text-white/55">
                    This market is closed for new predictions while the match is in play. Existing positions stay live and can still be claimed once the match resolves.
                  </div>
                </div>
              ) : null}

              {policyAllowsBetting && phase === "pick" && marketSpec && (
                <BetSelectionStep
                  marketKey={marketSpec.key}
                  marketLabel={marketSpec.label}
                  stepTitle={
                    marketSpec.key === "winner"
                      ? "Pick the winner"
                      : marketSpec.key === "halftime"
                        ? "Pick the halftime winner"
                        : marketSpec.key === "firstscorer"
                          ? "Who scores first?"
                          : marketSpec.key === "goalstotal"
                            ? "Over or Under?"
                            : "Will both teams score?"
                  }
                  helper={marketSpec.hint}
                  outcomes={outcomes}
                  selectedSelection={selectedOutcome}
                  onSelect={(s) => setSelectedOutcome(s)}
                  state={selection.state}
                  line={selection.line}
                  homeTeam={homeTeam}
                  awayTeam={awayTeam}
                  oddsBySelection={oddsBySelection}
                  impliedProbBpsBySelection={impliedProbBpsBySelection}
                  outcomePoolsBySelection={outcomePoolsBySelection}
                  usdcDecimals={usdcDecimals}
                />
              )}

              {policyAllowsBetting && phase === "stake" && (
                <BetStakeStep
                  token={currentTokenOption}
                  tokens={tokenOptions}
                  amount={amount}
                  onAmountChange={setAmount}
                  onTokenChange={(tk) => {
                    const next = tokenOptions.find((t) => t.key === tk.key);
                    if (!next) return;
                    if (next.kind === "USDC") setToken({ kind: "USDC" });
                    else if (next.kind === "CHZ") setToken({ kind: "CHZ" });
                    else if (next.address) setToken({ kind: "ERC20", address: next.address, symbol: next.sym, name: next.name });
                    setAmount("");
                  }}
                  slippageBps={slippageBps}
                  onSlippageChange={setSlippageBps}
                  slippagePresetsBps={SLIPPAGE_PRESETS_BPS}
                  selectionLabel={selectionLabel}
                  insufficient={insufficientBalance}
                  quotedUsdcAmount={
                    quotedUsdcOut !== undefined && usdcDecimals !== undefined
                      ? Number(formatUnits(quotedUsdcOut, usdcDecimals))
                      : null
                  }
                />
              )}

              {policyAllowsBetting && phase === "review" && (
                <BetReviewStep
                  homeTeam={homeTeam}
                  awayTeam={awayTeam}
                  leagueLabel="Chiliz Spicy testnet"
                  marketBadge={(marketSpec?.key ?? "").toUpperCase()}
                  marketLabel={marketSpec?.label ?? "—"}
                  selectionLabel={selectionLabel}
                  stakeLabel={stakeLabel}
                  stakeUsdcEquiv={
                    stakeUsdcEquivNum !== null ? `${fmtUsd(stakeUsdcEquivNum)} USDC` : null
                  }
                  slippageBps={token.kind !== "USDC" ? slippageBps : null}
                  netPayoutUsdc={grossPayoutUsdc}
                  feeBps={feeBps}
                />
              )}

              {phase === "success" && (
                <BetSuccessStep
                  txHash={txHash}
                  selectionLabel={selectionLabel}
                  stakeLabel={stakeLabel}
                  oddsDecimal={null}
                  netPayoutLabel={netPayoutLabel}
                  onAnother={() => {
                    setPhase("pick");
                    setSelectedOutcome(null);
                    setAmount("");
                    setBannerError(null);
                    advancedRef.current = false;
                  }}
                  onClose={onClose}
                />
              )}

              {phase === "failure" && (
                <BetFailureStep
                  kind={failureKind}
                  txHash={txHash}
                  reason={failureReason}
                  onRetry={() => {
                    setBannerError(null);
                    setFailureReason(null);
                    advancedRef.current = false;
                    setPhase("review");
                  }}
                  onClose={onClose}
                />
              )}
            </div>

            {/* Sticky footer — hidden on success/failure (those steps own their CTAs). */}
            {phase !== "success" && phase !== "failure" && (
              <div className="sticky bottom-0 z-[2] border-t border-[#1E1E1E] bg-[#0A0A0A]/95 px-7 py-5 backdrop-blur">
                <DialogFooter
                  onBack={onBack}
                  onNext={onNext}
                  nextLabel={continueLabelByPhase[phase]}
                  nextDisabled={nextDisabled}
                  submitting={phase === "review" && submitting}
                />
                {phase === "review" && submitting && (
                  <div className="font-mono-ctv mt-3 text-center text-[10px] uppercase tracking-[0.16em] text-white/40">
                    {isApproving ? `Approving ${tokenLabel(token)}…` : isPending ? "Confirm in wallet…" : "Placing prediction…"}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
