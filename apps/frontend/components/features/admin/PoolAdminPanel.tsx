/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck wagmi v2 generated read hooks compound TS depth limits when
// chained in one component; runtime is covered by the contract Foundry tests.
"use client";

import { useState } from "react";
import type { Address, Hex } from "viem";
import { formatUnits, parseUnits } from "viem";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useWaitForTransactionReceipt } from "wagmi";
import {
    useLiquidityPoolReadDefaultAdminRole,
    useLiquidityPoolReadHasRole,
    useLiquidityPoolReadPaused,
    useLiquidityPoolReadMaxBetAmount,
    useLiquidityPoolReadTotalAssets,
    useLiquidityPoolReadTotalLiabilities,
    useLiquidityPoolReadUtilization,
    useLiquidityPoolReadTreasuryShareBps,
    useLiquidityPoolReadTreasuryShareBpsMax,
    useLiquidityPoolReadLpWithdrawalFeeBps,
    useLiquidityPoolReadLpWithdrawalFeeBpsMax,
    useLiquidityPoolWritePause,
    useLiquidityPoolWriteUnpause,
    useLiquidityPoolWriteSetMaxBetAmount,
    useLiquidityPoolWriteSetTreasuryShareBps,
    useLiquidityPoolWriteSetLpWithdrawalFeeBps,
} from "@/lib/contracts/generated";
import { chilizConfig } from "@/config/chiliz.config";
import { NetworkGuard } from "@/components/web3/NetworkGuard";
import { usePoolDecimals } from "@/hooks/usePoolDecimals";
import { Loader2 } from "lucide-react";

const POOL = chilizConfig.liquidityPool;

/**
 * Pool admin actions: pause/unpause + max-bet cap. Treasury rotation and
 * accrued-balance withdrawal are intentionally NOT in here — those are
 * gated to the treasury Safe (separate key) by the contract itself, not by
 * DEFAULT_ADMIN_ROLE, and should be done from the Safe UI.
 */
export function PoolAdminPanel() {
    const { primaryWallet } = useDynamicContext();
    const userAddress = primaryWallet?.address as Address | undefined;

    // wagmi v2 generated overloads compound TS depth limits on this read; cast
    // through `any` to break the type recursion. Runtime contract is unchanged.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: defaultAdminRole } = useLiquidityPoolReadDefaultAdminRole({
        address: POOL,
        chainId: chilizConfig.chainId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any) as { data: Hex | undefined };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: hasAdminRole } = useLiquidityPoolReadHasRole({
        address: POOL,
        args: defaultAdminRole && userAddress ? [defaultAdminRole as Hex, userAddress] : undefined,
        chainId: chilizConfig.chainId,
        query: { enabled: !!defaultAdminRole && !!userAddress },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any) as { data: boolean | undefined };
    const isAdmin = hasAdminRole === true;

    const { data: isPaused, refetch: refetchPaused } = useLiquidityPoolReadPaused({
        address: POOL,
        chainId: chilizConfig.chainId,
    });
    const { data: maxBet, refetch: refetchMaxBet } = useLiquidityPoolReadMaxBetAmount({
        address: POOL,
        chainId: chilizConfig.chainId,
    });
    const { data: tvl } = useLiquidityPoolReadTotalAssets({ address: POOL, chainId: chilizConfig.chainId });
    const { data: liab } = useLiquidityPoolReadTotalLiabilities({ address: POOL, chainId: chilizConfig.chainId });
    const { data: util } = useLiquidityPoolReadUtilization({ address: POOL, chainId: chilizConfig.chainId });

    const { data: treasuryBps, refetch: refetchTreasuryBps } = useLiquidityPoolReadTreasuryShareBps({
        address: POOL,
        chainId: chilizConfig.chainId,
    });
    const { data: treasuryBpsMax } = useLiquidityPoolReadTreasuryShareBpsMax({
        address: POOL,
        chainId: chilizConfig.chainId,
    });
    const { data: lpFeeBps, refetch: refetchLpFeeBps } = useLiquidityPoolReadLpWithdrawalFeeBps({
        address: POOL,
        chainId: chilizConfig.chainId,
    });
    const { data: lpFeeBpsMax } = useLiquidityPoolReadLpWithdrawalFeeBpsMax({
        address: POOL,
        chainId: chilizConfig.chainId,
    });

    const pause = useLiquidityPoolWritePause();
    const unpause = useLiquidityPoolWriteUnpause();
    const setMax = useLiquidityPoolWriteSetMaxBetAmount();
    const setTreasury = useLiquidityPoolWriteSetTreasuryShareBps();
    const setLpFee = useLiquidityPoolWriteSetLpWithdrawalFeeBps();

    const lastTxHash =
        pause.data ?? unpause.data ?? setMax.data ?? setTreasury.data ?? setLpFee.data;
    const { isSuccess } = useWaitForTransactionReceipt({ hash: lastTxHash });
    if (isSuccess) {
        refetchPaused();
        refetchMaxBet();
        refetchTreasuryBps();
        refetchLpFeeBps();
    }

    const [maxBetInput, setMaxBetInput] = useState("");
    const [treasuryInput, setTreasuryInput] = useState("");
    const [lpFeeInput, setLpFeeInput] = useState("");

    // Read USDC decimals on-chain — Spicy test USDC is 18-decimal, mainnet USDC
    // is 6-decimal, so the cap input must be parsed in whatever the pool's
    // actual asset uses.
    const { assetDecimals: usdcDecimals } = usePoolDecimals();

    return (
        <section className="space-y-3 rounded-lg p-4" style={{ background: "#0F0F0F", border: "1px solid #2A2A2A" }}>
            <header className="flex items-center justify-between">
                <h3 className="text-[14px] font-bold uppercase tracking-[0.08em]" style={{ color: "#fff" }}>
                    Pool Admin
                </h3>
                <span className="text-[10px]" style={{ color: "#666" }}>
                    {isPaused === true ? "PAUSED" : "ACTIVE"}
                </span>
            </header>

            <NetworkGuard />

            <div className="grid grid-cols-3 gap-2 text-[11px]">
                <Stat label="TVL" value={`${formatUsdc(tvl as bigint | undefined, usdcDecimals)} USDC`} />
                <Stat label="Liabilities" value={`${formatUsdc(liab as bigint | undefined, usdcDecimals)} USDC`} />
                <Stat
                    label="Utilization"
                    value={util !== undefined ? `${(Number(util as unknown as bigint) / 100).toFixed(2)}%` : "—"}
                />
            </div>

            {!isAdmin && (
                <div className="rounded p-2 text-[11px]" style={{ background: "rgba(245,197,24,0.08)", border: "1px solid rgba(245,197,24,0.3)", color: "#F5C518" }}>
                    Read-only — connected wallet does not hold DEFAULT_ADMIN_ROLE on the pool.
                </div>
            )}

            <div className="flex gap-2">
                <button
                    onClick={() => pause.writeContract({ address: POOL })}
                    disabled={!isAdmin || pause.isPending}
                    className="flex-1 py-2 rounded text-[11px] font-bold uppercase tracking-[0.08em]"
                    style={{
                        background: !isAdmin || pause.isPending ? "#3A3A3A" : "rgba(245,197,24,0.15)",
                        color: !isAdmin || pause.isPending ? "#666" : "#F5C518",
                        border: "1px solid rgba(245,197,24,0.3)",
                        cursor: !isAdmin || pause.isPending ? "not-allowed" : "pointer",
                    }}
                >
                    {pause.isPending ? <Loader2 size={12} className="inline animate-spin mr-1" /> : null}
                    Pause
                </button>
                <button
                    onClick={() => unpause.writeContract({ address: POOL })}
                    disabled={!isAdmin || unpause.isPending}
                    className="flex-1 py-2 rounded text-[11px] font-bold uppercase tracking-[0.08em]"
                    style={{
                        background: !isAdmin || unpause.isPending ? "#3A3A3A" : "#E8001D",
                        color: "#fff",
                        cursor: !isAdmin || unpause.isPending ? "not-allowed" : "pointer",
                    }}
                >
                    {unpause.isPending ? <Loader2 size={12} className="inline animate-spin mr-1" /> : null}
                    Unpause
                </button>
            </div>

            <div className="rounded p-3 space-y-2" style={{ background: "#0A0A0A", border: "1px solid #1A1A1A" }}>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.1em]" style={{ color: "#666" }}>Max bet (USDC)</span>
                    <span className="text-[11px]" style={{ color: "#888", fontFamily: "'JetBrains Mono', monospace" }}>
                        Current: {maxBet !== undefined ? (maxBet === BigInt(0) ? "disabled" : formatUsdc(maxBet as bigint, usdcDecimals) + " USDC") : "—"}
                    </span>
                </div>
                <div className="flex gap-2">
                    <input
                        value={maxBetInput}
                        onChange={(e) => setMaxBetInput(e.target.value)}
                        placeholder="0 to disable"
                        className="flex-1 px-3 py-2 rounded text-[12px]"
                        style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#fff", fontFamily: "'JetBrains Mono', monospace" }}
                    />
                    <button
                        onClick={() => {
                            if (usdcDecimals === undefined) return;
                            const raw = maxBetInput.trim() === "" ? BigInt(0) : parseUnits(maxBetInput, usdcDecimals);
                            setMax.writeContract({ address: POOL, args: [raw] });
                        }}
                        disabled={!isAdmin || setMax.isPending || usdcDecimals === undefined}
                        className="px-3 py-2 rounded text-[11px] font-bold uppercase tracking-[0.08em]"
                        style={{
                            background: !isAdmin || setMax.isPending ? "#3A3A3A" : "#E8001D",
                            color: "#fff",
                            cursor: !isAdmin || setMax.isPending ? "not-allowed" : "pointer",
                        }}
                    >
                        {setMax.isPending ? <Loader2 size={12} className="inline animate-spin mr-1" /> : null}
                        Set
                    </button>
                </div>
            </div>

            <BpsRow
                label="Treasury share of bettor losses"
                hint="Split of net losses kept as protocol revenue. Bettors are fee-free; the rest goes to LPs."
                currentBps={treasuryBps as number | undefined}
                maxBps={treasuryBpsMax as number | undefined}
                input={treasuryInput}
                setInput={setTreasuryInput}
                disabled={!isAdmin}
                isPending={setTreasury.isPending}
                onSubmit={(bps) => setTreasury.writeContract({ address: POOL, args: [bps] })}
            />

            <BpsRow
                label="LP exit performance fee"
                hint="Fee on the GAIN portion of an LP withdrawal (cost-basis tracked). 0 means no fee."
                currentBps={lpFeeBps as number | undefined}
                maxBps={lpFeeBpsMax as number | undefined}
                input={lpFeeInput}
                setInput={setLpFeeInput}
                disabled={!isAdmin}
                isPending={setLpFee.isPending}
                onSubmit={(bps) => setLpFee.writeContract({ address: POOL, args: [bps] })}
            />
        </section>
    );
}

function BpsRow({
    label,
    hint,
    currentBps,
    maxBps,
    input,
    setInput,
    disabled,
    isPending,
    onSubmit,
}: {
    label: string;
    hint: string;
    currentBps: number | undefined;
    maxBps: number | undefined;
    input: string;
    setInput: (v: string) => void;
    disabled: boolean;
    isPending: boolean;
    onSubmit: (bps: number) => void;
}) {
    const fmtPct = (b: number | undefined) =>
        b === undefined ? "—" : `${(b / 100).toFixed(2)}% (${b} bps)`;
    return (
        <div className="rounded p-3 space-y-2" style={{ background: "#0A0A0A", border: "1px solid #1A1A1A" }}>
            <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.1em]" style={{ color: "#666" }}>{label}</span>
                <span className="text-[11px]" style={{ color: "#888", fontFamily: "'JetBrains Mono', monospace" }}>
                    Current: {fmtPct(currentBps)} · Max: {fmtPct(maxBps)}
                </span>
            </div>
            <p className="text-[10px]" style={{ color: "#555" }}>{hint}</p>
            <div className="flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="bps (e.g. 4000 = 40%)"
                    className="flex-1 px-3 py-2 rounded text-[12px]"
                    style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#fff", fontFamily: "'JetBrains Mono', monospace" }}
                />
                <button
                    onClick={() => {
                        const v = Number(input.trim());
                        if (!Number.isFinite(v) || v < 0) return;
                        if (maxBps !== undefined && v > maxBps) return;
                        onSubmit(v);
                    }}
                    disabled={disabled || isPending}
                    className="px-3 py-2 rounded text-[11px] font-bold uppercase tracking-[0.08em]"
                    style={{
                        background: disabled || isPending ? "#3A3A3A" : "#E8001D",
                        color: "#fff",
                        cursor: disabled || isPending ? "not-allowed" : "pointer",
                    }}
                >
                    {isPending ? <Loader2 size={12} className="inline animate-spin mr-1" /> : null}
                    Set
                </button>
            </div>
        </div>
    );
}

function formatUsdc(v: bigint | undefined, decimals: number | undefined): string {
    if (v === undefined || decimals === undefined) return "—";
    return Number(formatUnits(v, decimals)).toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded p-2" style={{ background: "#0A0A0A", border: "1px solid #1A1A1A" }}>
            <div className="text-[9px] uppercase tracking-[0.1em] mb-1" style={{ color: "#666" }}>{label}</div>
            <div className="text-[12px] font-bold" style={{ color: "#fff", fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
        </div>
    );
}
