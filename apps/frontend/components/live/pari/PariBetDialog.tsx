'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  erc20Abi,
  formatUnits,
  maxUint256,
  parseUnits,
  type Address,
} from 'viem';
import {
  useBalance,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lock,
  Trophy,
  XCircle,
  ChevronDown,
} from 'lucide-react';
import { MARKET_STATE_LABEL } from '@/hooks/usePariMatch';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { chilizConfig } from '@/config/chiliz.config';
import { usePoolDecimals } from '@/hooks/usePoolDecimals';
import { useChilizSwapRouter, type SwapToken } from '@/hooks/useChilizSwapRouter';
import { useKayenQuote } from '@/hooks/useKayenQuote';
import { explorerTx } from '@/lib/explorer';
import { NetworkGuard } from '@/components/web3/NetworkGuard';
import type { PariMarketSelection } from './PariMarketCard';
import { BetExplosion } from './BetExplosion';

interface PariBetDialogProps {
  open: boolean;
  onClose: () => void;
  matchAddress: Address;
  walletAddress?: string;
  selection: PariMarketSelection | null;
  /** Used by BetExplosion: pass the home/away logos so winner markets can
   *  burst the right team. */
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  feeBps: number;
}

/**
 * Internal token model. All bets settle in USDC inside the match contract;
 * `ChilizSwapRouter` handles the FanX/Kayen swap when needed.
 */
type BetToken =
  | { kind: 'USDC' }
  | { kind: 'CHZ' }
  | { kind: 'ERC20'; address: Address; symbol: string; name: string };

const NATIVE_DECIMALS = 18;
const FAN_TOKEN_DECIMALS = 18;
const PERCENT_PRESETS = [10, 25, 50, 100] as const;
const SLIPPAGE_PRESETS_BPS = [10, 50, 100] as const; // 0.10% / 0.50% / 1.00%
const DEFAULT_SLIPPAGE_BPS = 50;
const DEADLINE_MIN = 20;

function tokenLabel(t: BetToken): string {
  if (t.kind === 'USDC') return 'USDC';
  if (t.kind === 'CHZ') return 'CHZ';
  return t.symbol;
}

function tokenDecimals(t: BetToken, usdcDecimals: number | undefined): number | undefined {
  if (t.kind === 'USDC') return usdcDecimals;
  if (t.kind === 'CHZ') return NATIVE_DECIMALS;
  return FAN_TOKEN_DECIMALS;
}

/**
 * Pari-mutuel bet dialog with multi-asset entry: USDC direct, native CHZ, or
 * any registered fan token. All paths route through `ChilizSwapRouter`:
 *
 *   USDC  → router.placeBetWithUSDC(match, marketId, outcome, amount)
 *   CHZ   → router.placeBetWithCHZ{value}(match, marketId, outcome, minUsdcOut, deadline)
 *   ERC20 → router.placeBetWithToken(token, amount, match, marketId, outcome, minUsdcOut, deadline)
 *
 * The router (granted SWAP_ROUTER_ROLE on every match by the factory at
 * createXMatch time) calls `match.placeBetUSDCFor(user, ...)` after the swap,
 * crediting the user as the position-taker on the match contract.
 *
 * Quote + slippage: for non-USDC paths, useKayenQuote returns the expected
 * USDC out, and we apply the chosen slippage tolerance to compute
 * `amountOutMin`. The payout projection uses that (worst-case) USDC amount
 * so the user's "you'll get back ~X" stays honest even if the swap underfills.
 */
export function PariBetDialog({
  open,
  onClose,
  matchAddress,
  walletAddress,
  selection,
  homeTeamLogo,
  awayTeamLogo,
  feeBps,
}: PariBetDialogProps) {
  const navRouter = useRouter();
  const { assetDecimals: usdcDecimals } = usePoolDecimals();
  const { placeBet, betState, routerAddress } = useChilizSwapRouter();

  const [token, setToken] = useState<BetToken>({ kind: 'USDC' });
  const [showTokenList, setShowTokenList] = useState(false);
  const [amount, setAmount] = useState('');
  const [slippageBps, setSlippageBps] = useState<number>(DEFAULT_SLIPPAGE_BPS);
  const [error, setError] = useState<string | null>(null);
  const [showExplosion, setShowExplosion] = useState(false);

  const tokenOptions: BetToken[] = useMemo(() => {
    const fans: BetToken[] = (chilizConfig.tokens ?? [])
      .filter((t) => !!t.tokenAddress)
      .map((t) => ({
        kind: 'ERC20' as const,
        address: t.tokenAddress as Address,
        symbol: t.symbol,
        name: t.name,
      }));
    return [{ kind: 'USDC' }, { kind: 'CHZ' }, ...fans];
  }, []);

  const decimals = tokenDecimals(token, usdcDecimals);
  const numericAmount = Number(amount);
  const isValidAmount = !Number.isNaN(numericAmount) && numericAmount > 0;
  const parsedAmount: bigint =
    isValidAmount && decimals !== undefined ? parseUnits(amount, decimals) : 0n;

  // ── Balance per token ─────────────────────────────────────────────────────
  const isErc20Path = token.kind === 'USDC' || token.kind === 'ERC20';
  const erc20Address: Address | undefined =
    token.kind === 'USDC' ? chilizConfig.usdc : token.kind === 'ERC20' ? token.address : undefined;

  const { data: erc20BalanceData } = useBalance({
    address: walletAddress as Address | undefined,
    token: erc20Address,
    chainId: chilizConfig.chainId,
    query: { enabled: !!walletAddress && !!erc20Address },
  });
  const { data: nativeBalanceData } = useBalance({
    address: token.kind === 'CHZ' ? (walletAddress as Address | undefined) : undefined,
    chainId: chilizConfig.chainId,
    query: { enabled: token.kind === 'CHZ' && !!walletAddress },
  });
  const balance: number =
    token.kind === 'CHZ'
      ? nativeBalanceData
        ? Number(nativeBalanceData.formatted)
        : 0
      : erc20BalanceData
        ? Number(erc20BalanceData.formatted)
        : 0;

  // ── Allowance: ERC20 → router (CHZ is native, no approval). ───────────────
  const { data: allowanceRaw, refetch: refetchAllowance } = useReadContract({
    abi: erc20Abi,
    address: erc20Address,
    functionName: 'allowance',
    args: walletAddress && erc20Address ? [walletAddress as Address, routerAddress] : undefined,
    chainId: chilizConfig.chainId,
    query: { enabled: !!walletAddress && !!erc20Address },
  });
  const allowance = (allowanceRaw as bigint | undefined) ?? 0n;

  // ── Approve flow ──────────────────────────────────────────────────────────
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

  // ── Kayen quote (non-USDC) ────────────────────────────────────────────────
  const quoteTokenIn: Address | undefined =
    token.kind === 'ERC20'
      ? token.address
      : token.kind === 'CHZ'
        ? chilizConfig.wchz
        : undefined;
  const {
    amountOut: quotedUsdcOut,
    error: quoteError,
    isLoading: quoteLoading,
  } = useKayenQuote(parsedAmount > 0n ? parsedAmount : undefined, quoteTokenIn);
  const swapPathMissing =
    token.kind !== 'USDC' && parsedAmount > 0n && !quoteLoading && quoteError !== null;

  const amountOutMin: bigint = useMemo(() => {
    if (token.kind === 'USDC' || quotedUsdcOut === undefined) return 0n;
    const mul = BigInt(10_000 - slippageBps);
    return (quotedUsdcOut * mul) / 10_000n;
  }, [token.kind, quotedUsdcOut, slippageBps]);

  // Expected USDC the match will see — used for the payout projection so the
  // user's headline number doesn't lie when the swap output differs from the
  // input amount. For USDC, this is just `parsedAmount`. For non-USDC, take
  // the worst-case (`amountOutMin`) so we never overstate the payout.
  const expectedStakeUsdc: bigint = useMemo(() => {
    if (token.kind === 'USDC') return parsedAmount;
    return amountOutMin > 0n ? amountOutMin : 0n;
  }, [token.kind, parsedAmount, amountOutMin]);

  // ── betState already reflects whichever placeBet path was used. ───────────
  const { isPending: isBetPending, isConfirming: isBetConfirming, isSuccess: isBetSuccess, txHash: betTxHash, error: betError } = betState;
  useEffect(() => {
    if (isBetSuccess) setShowExplosion(true);
  }, [isBetSuccess]);

  // ── Reset when dialog closes / market changes ─────────────────────────────
  useEffect(() => {
    if (!open) {
      setAmount('');
      setError(null);
      setShowExplosion(false);
      setShowTokenList(false);
    }
  }, [open, selection?.marketId, selection?.outcome]);

  useEffect(() => {
    const msg = betError?.message ?? approveError?.message ?? null;
    setError(msg);
  }, [betError, approveError]);

  // ── Payout projection (in USDC space, regardless of input token) ─────────
  const projection = useMemo(() => {
    if (!selection || expectedStakeUsdc === 0n || usdcDecimals === undefined) return null;
    const stake = expectedStakeUsdc;
    const newTotal = selection.totalPool + stake;
    const newOutcomePool = selection.outcomePool + stake;
    const netPool = (newTotal * BigInt(10_000 - feeBps)) / 10_000n;
    if (newOutcomePool === 0n) return null;
    const payout = (stake * netPool) / newOutcomePool;
    const newImpliedProb =
      newTotal > 0n ? Number((newOutcomePool * 10_000n) / newTotal) / 10_000 : 0;
    return {
      payout,
      profit: payout > stake ? payout - stake : 0n,
      newImpliedProb,
    };
  }, [selection, expectedStakeUsdc, feeBps, usdcDecimals]);

  // ── Explosion logo (BEFORE the early return for hook-order stability). ───
  const explosionLogo = useMemo(() => {
    if (!selection) return undefined;
    if (selection.marketTypeKey === 'winner' || selection.marketTypeKey === 'halftime') {
      if (selection.outcome === 0) return homeTeamLogo;
      if (selection.outcome === 2) return awayTeamLogo;
    }
    if (
      selection.marketTypeKey === 'quarter_winner' ||
      selection.marketTypeKey === 'first_to_score'
    ) {
      return selection.outcome === 0 ? homeTeamLogo : awayTeamLogo;
    }
    return undefined;
  }, [selection, homeTeamLogo, awayTeamLogo]);

  if (!selection) return null;

  const marketIsOpen = selection.marketState === 1;
  const needsApproval = isErc20Path && parsedAmount > 0n && allowance < parsedAmount;
  const insufficientBalance = parsedAmount > 0n && balance < numericAmount;
  const isLoading =
    isApprovePending || isApproveConfirming || isBetPending || isBetConfirming;

  const canSubmit =
    !isLoading &&
    isValidAmount &&
    !insufficientBalance &&
    !!walletAddress &&
    marketIsOpen &&
    !swapPathMissing &&
    (token.kind === 'USDC' || quotedUsdcOut !== undefined);

  const onSubmit = () => {
    if (!walletAddress) return;
    setError(null);

    // ERC20 path requires allowance to the router. Trigger approval first;
    // the bet write happens on the second click after `isApproveSuccess`
    // refetches the allowance.
    if (needsApproval) {
      if (!erc20Address) return;
      writeApprove({
        abi: erc20Abi,
        address: erc20Address,
        functionName: 'approve',
        args: [routerAddress, maxUint256],
      });
      return;
    }

    if (!canSubmit || !selection) return;

    const deadline = BigInt(Math.floor(Date.now() / 1000) + DEADLINE_MIN * 60);
    const swapToken: SwapToken =
      token.kind === 'USDC' ? 'USDC' : token.kind === 'CHZ' ? 'CHZ' : token.address;

    placeBet({
      token: swapToken,
      matchAddress,
      marketId: BigInt(selection.marketId),
      selection: BigInt(selection.outcome),
      amount: parsedAmount,
      amountOutMin,
      deadline,
    });
  };

  const setPercent = (pct: number) => {
    if (balance <= 0) return;
    const base = (balance * pct) / 100;
    // Reserve a small CHZ amount for gas when picking Max on native.
    const v = token.kind === 'CHZ' && pct === 100 ? Math.max(0, base - 0.5) : base;
    setAmount(v.toFixed(4));
  };

  const explosionLabel = selection.outcomeLabel;

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent
          className="sm:max-w-[460px] p-0 gap-0 rounded-lg overflow-hidden"
          style={{ background: '#0F0F0F', color: '#fff', border: '1px solid #2A2A2A' }}
        >
          <div
            className="h-[2px] w-full"
            style={{ background: `linear-gradient(90deg, ${selection.accent} 0%, transparent 60%)` }}
          />

          <DialogHeader className="p-0">
            <div
              className="px-5 py-4 flex items-center gap-2"
              style={{ borderBottom: '1px solid #2A2A2A' }}
            >
              <TrendingUp size={14} style={{ color: selection.accent }} />
              <DialogTitle
                className="text-[14px] font-bold tracking-[0.1em] uppercase"
                style={{ color: '#fff', fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                {selection.marketLabel}
              </DialogTitle>
              <div className="flex-1" />
              <span
                className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]"
                style={{
                  background: `${selection.accent}1F`,
                  color: selection.accent,
                  border: `1px solid ${selection.accent}55`,
                  fontFamily: "'Barlow', sans-serif",
                }}
              >
                {selection.outcomeLabel}
              </span>
            </div>
          </DialogHeader>

          {isBetSuccess ? (
            <SuccessPanel
              accent={selection.accent}
              txHash={betTxHash}
              onClose={onClose}
            />
          ) : (
            <div className="space-y-5 px-5 py-5">
              <NetworkGuard />

              {!marketIsOpen && (
                <MarketStateBanner
                  state={selection.marketState}
                  onOpenAdmin={() => {
                    onClose();
                    navRouter.push('/admin');
                  }}
                />
              )}

              {/* Token picker */}
              <TokenPicker
                token={token}
                options={tokenOptions}
                open={showTokenList}
                onToggle={() => setShowTokenList((v) => !v)}
                onPick={(t) => {
                  setToken(t);
                  setShowTokenList(false);
                  setAmount('');
                }}
              />

              {/* Live projection (in USDC) */}
              <ProjectionPanel
                selection={selection}
                projection={projection}
                feeBps={feeBps}
                decimals={usdcDecimals}
              />

              {/* Amount input */}
              <div className="space-y-2">
                <div
                  className="flex items-center justify-between text-[10px] font-semibold tracking-[0.1em] uppercase"
                  style={{ color: '#555', fontFamily: "'Barlow', sans-serif" }}
                >
                  <span>Stake ({tokenLabel(token)})</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    Balance {balance.toFixed((decimals ?? 6) >= 18 ? 4 : 2)}
                  </span>
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min={0}
                  step="0.01"
                  className="w-full rounded px-4 py-3 text-center font-bold focus:outline-none"
                  style={{
                    background: '#1A1A1A',
                    border: '1px solid #2A2A2A',
                    color: '#fff',
                    fontSize: '24px',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                />
                <div className="grid grid-cols-4 gap-2">
                  {PERCENT_PRESETS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPercent(p)}
                      disabled={balance <= 0}
                      className="rounded py-1.5 text-[11px] font-bold uppercase tracking-[0.08em]"
                      style={{
                        background: '#1A1A1A',
                        border: '1px solid #2A2A2A',
                        color: balance > 0 ? '#fff' : '#555',
                        cursor: balance > 0 ? 'pointer' : 'not-allowed',
                        fontFamily: "'Barlow', sans-serif",
                      }}
                    >
                      {p === 100 ? 'Max' : `${p}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quote + slippage (non-USDC only) */}
              {token.kind !== 'USDC' && parsedAmount > 0n && (
                <QuotePanel
                  token={token}
                  parsedAmount={parsedAmount}
                  inputDecimals={decimals}
                  quotedUsdcOut={quotedUsdcOut}
                  amountOutMin={amountOutMin}
                  usdcDecimals={usdcDecimals}
                  quoteLoading={quoteLoading}
                  swapPathMissing={swapPathMissing}
                  slippageBps={slippageBps}
                  onSlippage={setSlippageBps}
                  accent={selection.accent}
                />
              )}

              {error && (
                <div
                  className="rounded px-3 py-2 text-[11px]"
                  style={{
                    background: 'rgba(232,0,29,0.08)',
                    border: '1px solid rgba(232,0,29,0.3)',
                    color: '#E8001D',
                    fontFamily: "'Barlow', sans-serif",
                  }}
                >
                  {error}
                </div>
              )}

              <motion.button
                whileHover={canSubmit || needsApproval ? { scale: 1.01 } : undefined}
                whileTap={canSubmit || needsApproval ? { scale: 0.99 } : undefined}
                onClick={onSubmit}
                disabled={!canSubmit && !needsApproval}
                className="w-full rounded py-3 text-[12px] font-bold uppercase tracking-[0.1em]"
                style={{
                  background:
                    canSubmit || needsApproval
                      ? `linear-gradient(90deg, ${selection.accent} 0%, ${selection.accent}cc 100%)`
                      : '#1E1E1E',
                  color: canSubmit || needsApproval ? '#fff' : '#666',
                  border: `1px solid ${canSubmit || needsApproval ? selection.accent : '#2A2A2A'}`,
                  cursor: canSubmit || needsApproval ? 'pointer' : 'not-allowed',
                  fontFamily: "'Barlow', sans-serif",
                  boxShadow:
                    canSubmit || needsApproval ? `0 6px 24px -6px ${selection.accent}` : 'none',
                }}
              >
                {isApprovePending
                  ? 'Confirm approval…'
                  : isApproveConfirming
                    ? `Approving ${tokenLabel(token)}…`
                    : isBetPending
                      ? 'Confirm in wallet…'
                      : isBetConfirming
                        ? 'Placing bet…'
                        : !walletAddress
                          ? 'Connect wallet'
                          : !marketIsOpen
                            ? `Market ${MARKET_STATE_LABEL[selection.marketState] ?? '—'} — bets disabled`
                            : swapPathMissing
                              ? `No swap path for ${tokenLabel(token)} → USDC`
                              : insufficientBalance
                                ? `Insufficient ${tokenLabel(token)}`
                                : needsApproval
                                  ? `Approve ${tokenLabel(token)}`
                                  : `Place bet · ${tokenLabel(token)}`}
              </motion.button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BetExplosion
        active={showExplosion}
        accent={selection.accent}
        logoUrl={explosionLogo}
        label={explosionLabel}
        onComplete={() => setShowExplosion(false)}
      />
    </>
  );
}

// ─── Sub-panels ─────────────────────────────────────────────────────────────

function TokenPicker({
  token,
  options,
  open,
  onToggle,
  onPick,
}: {
  token: BetToken;
  options: BetToken[];
  open: boolean;
  onToggle: () => void;
  onPick: (t: BetToken) => void;
}) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded px-3 py-2.5 text-[12px]"
        style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#ccc' }}
      >
        <span className="uppercase tracking-[0.08em]" style={{ color: '#666' }}>
          Pay with
        </span>
        <span className="flex items-center gap-1.5 font-bold" style={{ color: '#fff' }}>
          {tokenLabel(token)} <ChevronDown size={12} />
        </span>
      </button>
      {open && (
        <div
          className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded"
          style={{ background: '#0F0F0F', border: '1px solid #2A2A2A' }}
        >
          {options.map((t, i) => (
            <button
              key={i}
              onClick={() => onPick(t)}
              className="flex w-full items-center justify-between px-3 py-2 text-[12px] hover:bg-[#181818]"
              style={{ color: '#ccc' }}
            >
              <span className="font-bold uppercase tracking-[0.05em]">{tokenLabel(t)}</span>
              {t.kind === 'ERC20' && (
                <span className="text-[10px]" style={{ color: '#666' }}>
                  {t.name}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function QuotePanel({
  token,
  parsedAmount,
  inputDecimals,
  quotedUsdcOut,
  amountOutMin,
  usdcDecimals,
  quoteLoading,
  swapPathMissing,
  slippageBps,
  onSlippage,
  accent,
}: {
  token: BetToken;
  parsedAmount: bigint;
  inputDecimals: number | undefined;
  quotedUsdcOut: bigint | undefined;
  amountOutMin: bigint;
  usdcDecimals: number | undefined;
  quoteLoading: boolean;
  swapPathMissing: boolean;
  slippageBps: number;
  onSlippage: (bps: number) => void;
  accent: string;
}) {
  const fmtUsdc = (v: bigint | undefined) =>
    v !== undefined && usdcDecimals !== undefined
      ? `${Number(formatUnits(v, usdcDecimals)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`
      : '—';
  const fmtIn = () =>
    inputDecimals !== undefined
      ? `${Number(formatUnits(parsedAmount, inputDecimals)).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        })} ${tokenLabel(token)}`
      : '—';

  if (swapPathMissing) {
    return (
      <div
        className="rounded p-3 text-[11px]"
        style={{
          background: 'rgba(232,0,29,0.08)',
          border: '1px solid rgba(232,0,29,0.3)',
          color: '#E8001D',
          fontFamily: "'Barlow', sans-serif",
        }}
      >
        No FanX/Kayen liquidity path for {tokenLabel(token)} → USDC. Pick another token.
      </div>
    );
  }

  return (
    <div
      className="space-y-2 rounded p-3"
      style={{ background: '#141414', border: '1px solid #2A2A2A' }}
    >
      <div className="flex items-center justify-between text-[11px]">
        <span className="uppercase tracking-[0.1em]" style={{ color: '#666' }}>
          FanX quote
        </span>
        <span style={{ color: '#fff', fontFamily: "'JetBrains Mono', monospace" }}>
          {fmtIn()} ≈ {quoteLoading ? '…' : fmtUsdc(quotedUsdcOut)}
        </span>
      </div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="uppercase tracking-[0.1em]" style={{ color: '#666' }}>
          Min received
        </span>
        <span style={{ color: '#888', fontFamily: "'JetBrains Mono', monospace" }}>
          {amountOutMin > 0n ? fmtUsdc(amountOutMin) : '—'}
        </span>
      </div>
      <div className="flex items-center gap-2 pt-1">
        <span className="text-[10px] uppercase tracking-[0.1em]" style={{ color: '#666' }}>
          Slippage
        </span>
        {SLIPPAGE_PRESETS_BPS.map((bps) => {
          const active = slippageBps === bps;
          return (
            <button
              key={bps}
              onClick={() => onSlippage(bps)}
              className="rounded px-2 py-0.5 text-[10px] font-bold uppercase"
              style={{
                background: active ? `${accent}1F` : '#1A1A1A',
                color: active ? accent : '#888',
                border: `1px solid ${active ? accent : '#2A2A2A'}`,
              }}
            >
              {(bps / 100).toFixed(2)}%
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ProjectionPanel({
  selection,
  projection,
  feeBps,
  decimals,
}: {
  selection: PariMarketSelection;
  projection: { payout: bigint; profit: bigint; newImpliedProb: number } | null;
  feeBps: number;
  decimals: number | undefined;
}) {
  const fmt = (v: bigint) =>
    decimals !== undefined
      ? Number(formatUnits(v, decimals)).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '—';

  const currentProb =
    selection.totalPool > 0n
      ? Number((selection.outcomePool * 10_000n) / selection.totalPool) / 10_000
      : 0;

  return (
    <motion.div
      layout
      className="space-y-2 rounded-lg p-3"
      style={{
        background: '#141414',
        border: `1px solid ${selection.accent}33`,
      }}
    >
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.1em]" style={{ color: '#666' }}>
        <span className="flex items-center gap-1.5">
          <Sparkles size={11} style={{ color: selection.accent }} />
          Live projection (USDC)
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Pool {fmt(selection.totalPool)} USDC
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Now" value={`${(currentProb * 100).toFixed(0)}%`} hint="implied" />
        <Stat
          label="After your bet"
          value={projection ? `${(projection.newImpliedProb * 100).toFixed(0)}%` : '—'}
          hint="implied"
          accent={selection.accent}
        />
        <Stat
          label="Payout"
          value={projection ? `${fmt(projection.payout)}` : '—'}
          hint="USDC"
          accent={selection.accent}
        />
      </div>

      <div
        className="rounded px-2 py-1 text-[10px]"
        style={{ background: '#0F0F0F', color: '#666', fontFamily: "'Barlow', sans-serif" }}
      >
        Pari-mutuel: payout = stake × netPool ÷ (outcomePool + stake). Fee {(feeBps / 100).toFixed(2)}% off the gross pool at resolution. Non-USDC paths swap to USDC via the ChilizSwapRouter; the projection uses the post-slippage worst case.
      </div>
    </motion.div>
  );
}

function Stat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: string;
}) {
  return (
    <div
      className="rounded px-2 py-2"
      style={{ background: '#0F0F0F', border: '1px solid #1E1E1E' }}
    >
      <div className="text-[9px] uppercase tracking-[0.1em]" style={{ color: '#555' }}>
        {label}
      </div>
      <div
        className="mt-0.5 text-[16px] font-bold tabular-nums"
        style={{
          color: accent ?? '#fff',
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {value}
      </div>
      {hint && (
        <div className="text-[9px]" style={{ color: '#555', fontFamily: "'Barlow', sans-serif" }}>
          {hint}
        </div>
      )}
    </div>
  );
}

function SuccessPanel({
  accent,
  txHash,
  onClose,
}: {
  accent: string;
  txHash: `0x${string}` | undefined;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-5 py-8">
      <CheckCircle2 size={36} style={{ color: '#00C853' }} />
      <p
        className="text-[14px] font-bold uppercase tracking-[0.08em]"
        style={{ color: '#fff', fontFamily: "'Barlow Condensed', sans-serif" }}
      >
        Bet confirmed
      </p>
      {txHash && (
        <a
          href={explorerTx(txHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[11px]"
          style={{ color: accent, fontFamily: "'JetBrains Mono', monospace" }}
        >
          {txHash.slice(0, 10)}…{txHash.slice(-8)}
          <ExternalLink size={11} />
        </a>
      )}
      <button
        onClick={onClose}
        className="mt-2 rounded px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em]"
        style={{
          background: accent,
          color: '#fff',
          fontFamily: "'Barlow', sans-serif",
        }}
      >
        Close
      </button>
    </div>
  );
}

/**
 * State-specific banner shown in the bet dialog when the market isn't Open.
 */
function MarketStateBanner({
  state,
  onOpenAdmin,
}: {
  state: number;
  onOpenAdmin: () => void;
}) {
  const banner = describeState(state);

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-2 rounded-lg px-3 py-2.5"
      style={{
        background: `${banner.tint}14`,
        border: `1px solid ${banner.tint}55`,
        color: '#fff',
        fontFamily: "'Barlow', sans-serif",
      }}
    >
      <banner.icon size={14} style={{ color: banner.tint, marginTop: 2 }} />
      <div className="min-w-0 flex-1">
        <div
          className="text-[11px] font-bold uppercase tracking-[0.12em]"
          style={{ color: banner.tint }}
        >
          {banner.title}
        </div>
        <div className="mt-0.5 text-[11px]" style={{ color: '#aaa' }}>
          {banner.body}
        </div>
      </div>
      {state === 0 && (
        <button
          onClick={onOpenAdmin}
          className="flex-shrink-0 rounded px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em]"
          style={{
            background: banner.tint,
            color: '#0F0F0F',
            cursor: 'pointer',
            fontFamily: "'Barlow', sans-serif",
          }}
        >
          Open in admin
        </button>
      )}
    </motion.div>
  );
}

function describeState(state: number): {
  title: string;
  body: string;
  tint: string;
  icon: typeof AlertCircle;
} {
  switch (state) {
    case 0:
      return {
        title: 'Market not yet open',
        body: 'This market was added but the admin has not called openMarket() yet. Bets are not accepted on-chain until then.',
        tint: '#F5A524',
        icon: Lock,
      };
    case 2:
      return {
        title: 'Market temporarily suspended',
        body: 'The admin paused this market. New bets are not accepted until it is re-opened.',
        tint: '#F5A524',
        icon: AlertCircle,
      };
    case 3:
      return {
        title: 'Market closed — awaiting resolution',
        body: 'No more bets accepted. The oracle will resolve this market and winners will be able to claim their payout.',
        tint: '#888',
        icon: Lock,
      };
    case 4:
      return {
        title: 'Market resolved',
        body: 'Winners can claim. Use the live page or your dashboard to call claim() on your winning outcome.',
        tint: '#00C853',
        icon: Trophy,
      };
    case 5:
      return {
        title: 'Market cancelled',
        body: 'Every staker can refund their full stake via claimRefund().',
        tint: '#E8001D',
        icon: XCircle,
      };
    default:
      return {
        title: 'Market unavailable',
        body: 'Unknown state — bets disabled.',
        tint: '#888',
        icon: AlertCircle,
      };
  }
}
