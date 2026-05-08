"use client";

import { useEffect, useState } from "react";
import type { Address, Hex } from "viem";
import { keccak256, stringToBytes } from "viem";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import {
    useBettingMatchFactoryReadGetAllMatches,
    useBettingMatchFactoryReadGetSportType,
    useBettingMatchReadMatchName,
    useBettingMatchReadMarketCount,
    useBettingMatchReadHasRole,
    useBettingMatchReadAdminRole,
    useBettingMatchReadGetMarketInfo,
    useBettingMatchWriteAddMarketWithLine,
    useBettingMatchWriteOpenMarket,
    useBettingMatchWriteCloseMarket,
    useBettingMatchWriteSuspendMarket,
    useBettingMatchWriteCancelMarket,
    useBettingMatchWriteSetMarketOdds,
    useBettingMatchWriteResolveMarket,
    useBettingMatchWriteCloseMarketsBatch,
    useBettingMatchWriteResolveMarketsBatch,
    useBettingMatchReadResolverRole,
} from "@/lib/contracts/generated";
import { chilizConfig } from "@/config/chiliz.config";
import { NetworkGuard } from "@/components/web3/NetworkGuard";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useWaitForTransactionReceipt } from "wagmi";

const FACTORY = chilizConfig.bettingMatchFactory;

// MarketState enum from BettingMatch.sol
const MARKET_STATE_LABEL = ["Inactive", "Open", "Suspended", "Closed", "Resolved", "Cancelled"] as const;

// Football & basketball market types — these strings are keccak256-hashed
// before being passed to the contract, so they MUST match the on-chain
// constants exactly. Source of truth:
//   src/betting/FootballMatch.sol  (MARKET_*  bytes32 constants)
//   src/betting/BasketballMatch.sol (MARKET_*  bytes32 constants)
const FOOTBALL_MARKETS = [
    "WINNER", "GOALS_TOTAL", "BOTH_SCORE", "HALFTIME", "CORRECT_SCORE", "FIRST_SCORER",
] as const;
const BASKETBALL_MARKETS = [
    "WINNER", "TOTAL_POINTS", "SPREAD", "QUARTER_WINNER", "FIRST_TO_SCORE", "HIGHEST_QUARTER",
] as const;

function mktTypeBytes32(label: string): Hex {
    return keccak256(stringToBytes(label));
}

// Reverse lookup: keccak256 hash → human label. Pre-computed at module load
// from the union of football + basketball labels.
const MARKET_LABEL_BY_HASH: Record<string, string> = (() => {
    const all = [...new Set([...FOOTBALL_MARKETS, ...BASKETBALL_MARKETS])];
    const map: Record<string, string> = {};
    for (const label of all) map[mktTypeBytes32(label).toLowerCase()] = label;
    return map;
})();

function labelForMarketHash(hash: Hex | undefined): string {
    if (!hash) return "—";
    return MARKET_LABEL_BY_HASH[hash.toLowerCase()] ?? `${hash.slice(0, 10)}…`;
}

/**
 * Per-market metadata for the admin UI. Drives:
 *   - the contextual info card on AddMarketRow
 *   - the resolve selection hint
 *   - the live "line" preview (e.g. line=25 → "2.5 goals")
 *
 * Selection encodings come from `_getMaxSelections` in each sport's contract.
 * Keep `selections` in sync if those validators change.
 */
type Selection = { value: number; label: string };
type MarketInfoEntry = {
    description: string;
    selections: Selection[];
    usesLine: boolean;
    /** Plain-English example, e.g. "25 → 2.5 goals" */
    lineExample?: string;
    /** Format raw on-chain line value for display. */
    formatLine?: (raw: number) => string;
};

const MARKET_INFO: Record<string, MarketInfoEntry> = {
    // ── Football ────────────────────────────────────────────────────────
    WINNER: {
        description: "1X2 / moneyline. Bettors pick the final-result winner.",
        selections: [
            { value: 0, label: "Home" },
            { value: 1, label: "Draw (football) · Away (basketball)" },
            { value: 2, label: "Away (football only)" },
        ],
        usesLine: false,
    },
    GOALS_TOTAL: {
        description: "Over/Under: total goals scored vs. a fixed line.",
        selections: [
            { value: 0, label: "Under" },
            { value: 1, label: "Over" },
        ],
        usesLine: true,
        lineExample: "25 → 2.5 goals",
        formatLine: (n) => `O/U ${(n / 10).toFixed(1)} goals`,
    },
    BOTH_SCORE: {
        description: "BTTS — both teams to score in the match.",
        selections: [
            { value: 0, label: "No" },
            { value: 1, label: "Yes" },
        ],
        usesLine: false,
    },
    HALFTIME: {
        description: "1X2 result at the halftime whistle (football only).",
        selections: [
            { value: 0, label: "Home" },
            { value: 1, label: "Draw" },
            { value: 2, label: "Away" },
        ],
        usesLine: false,
    },
    CORRECT_SCORE: {
        description: "Exact score guess (football). Encoded as home×100 + away.",
        selections: [
            { value: 100, label: "1-0" },
            { value: 21, label: "2-1" },
            { value: 11, label: "1-1" },
            { value: 0, label: "0-0" },
        ],
        usesLine: false,
    },
    FIRST_SCORER: {
        description: "Player/team id of the first scorer. Resolver oracle assigns ids.",
        selections: [
            { value: 0, label: "Player id 0" },
            { value: 1, label: "Player id 1" },
        ],
        usesLine: false,
    },
    // ── Basketball ──────────────────────────────────────────────────────
    TOTAL_POINTS: {
        description: "Basketball O/U total points.",
        selections: [
            { value: 0, label: "Under" },
            { value: 1, label: "Over" },
        ],
        usesLine: true,
        lineExample: "2155 → 215.5 points",
        formatLine: (n) => `O/U ${(n / 10).toFixed(1)} points`,
    },
    SPREAD: {
        description: "Point-spread bet. Bettors pick which side covers the line.",
        selections: [
            { value: 0, label: "Home covers" },
            { value: 1, label: "Away covers" },
        ],
        usesLine: true,
        lineExample: "50 → 5.0 points spread",
        formatLine: (n) => `${(n / 10).toFixed(1)}-pt spread`,
    },
    QUARTER_WINNER: {
        description: "Winner of a specific quarter. Use addMarketWithQuarter to set the quarter on creation.",
        selections: [
            { value: 0, label: "Home" },
            { value: 1, label: "Away" },
        ],
        usesLine: false,
    },
    FIRST_TO_SCORE: {
        description: "Which team scores first in the game.",
        selections: [
            { value: 0, label: "Home" },
            { value: 1, label: "Away" },
        ],
        usesLine: false,
    },
    HIGHEST_QUARTER: {
        description: "Which quarter sees the highest combined points scored.",
        selections: [
            { value: 0, label: "Q1" },
            { value: 1, label: "Q2" },
            { value: 2, label: "Q3" },
            { value: 3, label: "Q4" },
        ],
        usesLine: false,
    },
};

// Per-market hint for the "Winning selection" input on resolve. Sourced from
// MARKET_INFO so adding a new type only updates the registry.
function selectionHint(marketLabel: string): string {
    const info = MARKET_INFO[marketLabel];
    if (!info) return "Outcome id as defined by the market oracle";
    return info.selections.map((s) => `${s.value} = ${s.label}`).join(" · ");
}

const ODDS_HINT = "Odds × 10000. 20000 = 2.00× · min 10001 (≈1.0001×) · max 1,000,000 (100×).";
const LINE_HINT = "Fixed-point ×10. 25 = 2.5 (goals or points). Use 0 for markets without a line.";

/** Live odds-input validator + decimal/payout preview. */
function previewOdds(raw: string): { decimal: string; payout: string; valid: boolean; warn?: string } {
    const trimmed = raw.trim();
    if (trimmed === "") return { decimal: "—", payout: "—", valid: false };
    const n = Number(trimmed);
    if (!Number.isFinite(n) || !Number.isInteger(n)) {
        return { decimal: "—", payout: "—", valid: false, warn: "must be an integer" };
    }
    if (n < 10001 || n > 1_000_000) {
        return { decimal: "—", payout: "—", valid: false, warn: "outside [10001, 1,000,000]" };
    }
    return {
        decimal: `${(n / 10000).toFixed(4)}×`,
        payout: `100 USDC stake → ${((100 * n) / 10000).toFixed(2)} USDC payout`,
        valid: true,
    };
}

/** Live line-input preview for markets that use a line, undefined otherwise. */
function previewLine(label: string, raw: string): { display?: string; warn?: string } {
    const info = MARKET_INFO[label];
    if (!info?.usesLine) {
        if (raw.trim() !== "0" && raw.trim() !== "") {
            return { warn: "this market doesn't use a line — set 0" };
        }
        return {};
    }
    const n = Number(raw);
    if (!Number.isFinite(n) || !Number.isInteger(n)) {
        return { warn: "must be an integer" };
    }
    if (n < -32768 || n > 32767) {
        return { warn: "int16 overflow" };
    }
    return { display: info.formatLine ? info.formatLine(n) : `Line ${(n / 10).toFixed(1)}` };
}

interface MatchAdminPanelProps {
    matchAddress?: Address;
}

/**
 * Per-match admin console. If `matchAddress` is omitted we offer a picker
 * over `factory.getAllMatches()` so admins can manage any match the platform
 * has deployed.
 *
 * Role gating: action buttons are enabled only when the connected wallet
 * holds `ADMIN_ROLE` on the chosen match (`hasRole(ADMIN_ROLE, user)`).
 */
export function MatchAdminPanel({ matchAddress: externalAddress }: MatchAdminPanelProps) {
    const { primaryWallet } = useDynamicContext();
    const userAddress = primaryWallet?.address as Address | undefined;

    const { data: allMatchesData } = useBettingMatchFactoryReadGetAllMatches({
        address: FACTORY,
        chainId: chilizConfig.chainId,
    });
    const allMatches = (allMatchesData as readonly Address[] | undefined) ?? [];

    const [picked, setPicked] = useState<Address | undefined>(undefined);
    const matchAddress = externalAddress ?? picked ?? allMatches[0];

    useEffect(() => {
        if (!externalAddress && !picked && allMatches.length > 0) setPicked(allMatches[0]);
    }, [externalAddress, picked, allMatches]);

    const { data: sportTypeData } = useBettingMatchFactoryReadGetSportType({
        address: FACTORY,
        args: matchAddress ? [matchAddress] : undefined,
        chainId: chilizConfig.chainId,
        query: { enabled: !!matchAddress },
    });
    const sport = sportTypeData === 0 ? "football" : sportTypeData === 1 ? "basketball" : undefined;
    const marketTypes = sport === "football" ? FOOTBALL_MARKETS : BASKETBALL_MARKETS;

    const { data: matchName } = useBettingMatchReadMatchName({
        address: matchAddress,
        chainId: chilizConfig.chainId,
        query: { enabled: !!matchAddress },
    });

    const { data: marketCountData, refetch: refetchCount } = useBettingMatchReadMarketCount({
        address: matchAddress,
        chainId: chilizConfig.chainId,
        query: { enabled: !!matchAddress },
    });
    const marketCount = marketCountData !== undefined ? Number(marketCountData as bigint) : 0;

    const { data: adminRoleHash } = useBettingMatchReadAdminRole({
        address: matchAddress,
        chainId: chilizConfig.chainId,
        query: { enabled: !!matchAddress },
    });

    const { data: hasAdminRole } = useBettingMatchReadHasRole({
        address: matchAddress,
        args: adminRoleHash && userAddress ? [adminRoleHash as Hex, userAddress] : undefined,
        chainId: chilizConfig.chainId,
        query: { enabled: !!matchAddress && !!adminRoleHash && !!userAddress },
    });
    const isAdmin = hasAdminRole === true;

    return (
        <section className="space-y-3 rounded-lg p-4" style={{ background: "#0F0F0F", border: "1px solid #2A2A2A" }}>
            <header className="flex items-center justify-between">
                <h3 className="text-[14px] font-bold uppercase tracking-[0.08em]" style={{ color: "#fff" }}>
                    Match Admin
                </h3>
                <span className="text-[10px]" style={{ color: "#666", fontFamily: "'JetBrains Mono', monospace" }}>
                    {sport ?? "—"} · {marketCount} markets
                </span>
            </header>

            <NetworkGuard />

            {!externalAddress && (
                <select
                    value={matchAddress ?? ""}
                    onChange={(e) => setPicked(e.target.value as Address)}
                    className="w-full px-3 py-2 rounded text-[12px]"
                    style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#fff", fontFamily: "'JetBrains Mono', monospace" }}
                >
                    {allMatches.length === 0 && <option value="">No matches deployed yet</option>}
                    {allMatches.map((m) => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
            )}

            {!matchAddress ? (
                <p className="text-[12px]" style={{ color: "#888" }}>
                    No match selected. Create one above first.
                </p>
            ) : (
                <>
                    <div className="text-[12px]" style={{ color: "#ccc" }}>
                        <span className="font-bold">{(matchName as string | undefined) ?? "—"}</span>{" "}
                        <span style={{ color: "#666" }}>· {matchAddress.slice(0, 8)}…{matchAddress.slice(-6)}</span>
                    </div>

                    {!isAdmin && (
                        <div className="rounded p-2 text-[11px]" style={{ background: "rgba(245,197,24,0.08)", border: "1px solid rgba(245,197,24,0.3)", color: "#F5C518" }}>
                            Read-only — you do not hold ADMIN_ROLE on this match.
                        </div>
                    )}

                    <AddMarketRow
                        matchAddress={matchAddress}
                        marketTypes={marketTypes}
                        disabled={!isAdmin}
                        onCreated={() => refetchCount()}
                    />

                    {Array.from({ length: marketCount }).map((_, idx) => (
                        <MarketRow key={idx} matchAddress={matchAddress} marketId={idx} disabled={!isAdmin} />
                    ))}

                    {marketCount > 0 && (
                        <ResolveMatchBatch
                            matchAddress={matchAddress}
                            marketCount={marketCount}
                            sport={sport}
                            userAddress={userAddress}
                        />
                    )}
                </>
            )}
        </section>
    );
}

/**
 * Batch end-of-match resolution. One row per market, single click runs:
 *   1. closeMarketsBatch  (idempotent — skips already-Closed)
 *   2. resolveMarketsBatch (paired marketIds + winning selections)
 *
 * Signing key MUST hold ADMIN_ROLE (for close) AND RESOLVER_ROLE (for resolve).
 * On a fresh testnet deploy where ORACLE_ADDRESS wasn't set, the deployer holds
 * both. In production with a separate oracle key, the close pass and the
 * resolve pass have to be run from different wallets — flagged inline.
 */
function ResolveMatchBatch({
    matchAddress,
    marketCount,
    sport,
    userAddress,
}: {
    matchAddress: Address;
    marketCount: number;
    sport: "football" | "basketball" | undefined;
    userAddress: Address | undefined;
}) {
    const [results, setResults] = useState<string[]>(() => Array(marketCount).fill(""));

    // Keep the result-vector length in sync if marketCount changes (rare —
    // only when admin adds a market mid-session).
    useEffect(() => {
        setResults((prev) => {
            if (prev.length === marketCount) return prev;
            const next = [...prev];
            while (next.length < marketCount) next.push("");
            next.length = marketCount;
            return next;
        });
    }, [marketCount]);

    // ── Role gates ───────────────────────────────────────────────────────
    const { data: adminRoleHash } = useBettingMatchReadAdminRole({
        address: matchAddress,
        chainId: chilizConfig.chainId,
    });
    const { data: resolverRoleHash } = useBettingMatchReadResolverRole({
        address: matchAddress,
        chainId: chilizConfig.chainId,
    });
    const { data: hasAdminRole } = useBettingMatchReadHasRole({
        address: matchAddress,
        args: adminRoleHash && userAddress ? [adminRoleHash as Hex, userAddress] : undefined,
        chainId: chilizConfig.chainId,
        query: { enabled: !!adminRoleHash && !!userAddress },
    });
    const { data: hasResolverRole } = useBettingMatchReadHasRole({
        address: matchAddress,
        args: resolverRoleHash && userAddress ? [resolverRoleHash as Hex, userAddress] : undefined,
        chainId: chilizConfig.chainId,
        query: { enabled: !!resolverRoleHash && !!userAddress },
    });
    const isAdmin = hasAdminRole === true;
    const isResolver = hasResolverRole === true;

    // ── Two batched writes ──────────────────────────────────────────────
    const close = useBettingMatchWriteCloseMarketsBatch();
    const { isLoading: closeConfirming, isSuccess: closeSuccess } =
        useWaitForTransactionReceipt({ hash: close.data });

    const resolve = useBettingMatchWriteResolveMarketsBatch();
    const { isLoading: resolveConfirming, isSuccess: resolveSuccess } =
        useWaitForTransactionReceipt({ hash: resolve.data });

    type Step = "idle" | "closing" | "resolving" | "done";
    const [step, setStep] = useState<Step>("idle");
    const [pipelineError, setPipelineError] = useState<string | null>(null);

    // closing → resolving when the close receipt lands.
    useEffect(() => {
        if (step !== "closing" || !closeSuccess) return;
        setStep("resolving");
        const ids = Array.from({ length: marketCount }, (_, i) => BigInt(i));
        const winners = results.map((r) => BigInt(r || "0"));
        resolve.writeContract({ address: matchAddress, args: [ids, winners] });
    }, [step, closeSuccess, marketCount, results, matchAddress, resolve]);

    // resolving → done when the resolve receipt lands.
    useEffect(() => {
        if (step !== "resolving" || !resolveSuccess) return;
        setStep("done");
    }, [step, resolveSuccess]);

    // Surface revert / wallet rejection.
    useEffect(() => {
        const err = close.error ?? resolve.error;
        if (err && step !== "idle") {
            setPipelineError(err.message?.slice(0, 240) ?? String(err));
            setStep("idle");
        }
    }, [close.error, resolve.error, step]);

    const allFilled = results.length === marketCount && results.every((r) => r.trim() !== "");
    const inFlight = step === "closing" || step === "resolving";
    const canRun = !inFlight && allFilled && isAdmin && isResolver && marketCount > 0;

    const handleResolveAll = () => {
        if (!canRun) return;
        setPipelineError(null);
        setStep("closing");
        const ids = Array.from({ length: marketCount }, (_, i) => BigInt(i));
        close.writeContract({ address: matchAddress, args: [ids] });
    };

    const buttonLabel: string = (() => {
        if (step === "closing") return closeConfirming ? "Closing markets… (1/2)" : "Confirm in wallet… (1/2 close)";
        if (step === "resolving") return resolveConfirming ? "Resolving markets… (2/2)" : "Confirm in wallet… (2/2 resolve)";
        if (step === "done") return "Match resolved";
        return "Resolve match";
    })();

    return (
        <div className="rounded-lg p-3 space-y-3" style={{ background: "#0A0A0A", border: "1px solid #2A2A2A" }}>
            <div className="flex items-center justify-between">
                <h4 className="text-[12px] font-bold uppercase tracking-[0.08em]" style={{ color: "#fff" }}>
                    Resolve match (batch)
                </h4>
                <span className="text-[10px] uppercase tracking-[0.1em]" style={{ color: "#666" }}>
                    closeMarketsBatch + resolveMarketsBatch
                </span>
            </div>

            {(!isAdmin || !isResolver) && (
                <div className="rounded p-2 text-[11px]" style={{ background: "rgba(245,197,24,0.08)", border: "1px solid rgba(245,197,24,0.3)", color: "#F5C518" }}>
                    Connected wallet must hold both <strong>ADMIN_ROLE</strong> {isAdmin ? "✓" : "✗"} and <strong>RESOLVER_ROLE</strong> {isResolver ? "✓" : "✗"}. On split-key setups, run close from the admin wallet and resolve from the oracle wallet (single-market controls above).
                </div>
            )}

            <div className="space-y-2">
                {Array.from({ length: marketCount }).map((_, idx) => (
                    <ResolveRow
                        key={idx}
                        marketId={idx}
                        matchAddress={matchAddress}
                        sport={sport}
                        value={results[idx] ?? ""}
                        onChange={(v) =>
                            setResults((prev) => {
                                const next = [...prev];
                                next[idx] = v;
                                return next;
                            })
                        }
                        disabled={inFlight || step === "done"}
                    />
                ))}
            </div>

            {pipelineError && (
                <div className="rounded p-2 text-[11px]" style={{ background: "rgba(232,0,29,0.08)", border: "1px solid rgba(232,0,29,0.25)", color: "#F88" }}>
                    {pipelineError}
                </div>
            )}

            {(inFlight || step === "done") && (
                <div className="space-y-1">
                    <ProgressLine label="1. Close all markets" done={step !== "closing"} active={step === "closing"} />
                    <ProgressLine label="2. Resolve all markets" done={step === "done"} active={step === "resolving"} />
                </div>
            )}

            <button
                onClick={handleResolveAll}
                disabled={!canRun}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded text-[12px] font-bold uppercase tracking-[0.08em]"
                style={{
                    background: canRun ? "#E8001D" : "#3A3A3A",
                    color: "#fff",
                    cursor: canRun ? "pointer" : "not-allowed",
                }}
            >
                {inFlight && <Loader2 size={14} className="animate-spin" />}
                {buttonLabel}
            </button>
        </div>
    );
}

function ResolveRow({
    marketId,
    matchAddress,
    sport,
    value,
    onChange,
    disabled,
}: {
    marketId: number;
    matchAddress: Address;
    sport: "football" | "basketball" | undefined;
    value: string;
    onChange: (v: string) => void;
    disabled: boolean;
}) {
    const { data: marketInfo } = useBettingMatchReadGetMarketInfo({
        address: matchAddress,
        args: [BigInt(marketId)],
        chainId: chilizConfig.chainId,
    });
    const marketTypeHash = (marketInfo as readonly [Hex, number, number, bigint, bigint] | undefined)?.[0];
    const stateNum = (marketInfo as readonly [Hex, number, number, bigint, bigint] | undefined)?.[1];
    const marketLabel = labelForMarketHash(marketTypeHash);
    const stateLabel = stateNum !== undefined ? MARKET_STATE_LABEL[stateNum] : "—";
    void sport; // sport is informational only — the hint already covers it

    return (
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
            <span className="text-[10px]" style={{ color: "#555", fontFamily: "'JetBrains Mono', monospace", minWidth: 28 }}>
                #{marketId}
            </span>
            <div>
                <div className="flex items-baseline gap-2">
                    <span className="text-[12px] font-bold" style={{ color: "#fff" }}>{marketLabel}</span>
                    <span className="text-[10px] uppercase tracking-[0.1em]" style={{ color: "#666" }}>{stateLabel}</span>
                </div>
                <span className="block text-[10px]" style={{ color: "#555" }}>{selectionHint(marketLabel)}</span>
            </div>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                placeholder="winner"
                className="w-24 px-2 py-1 rounded text-[11px]"
                style={{
                    background: "#1A1A1A",
                    border: "1px solid #2A2A2A",
                    color: "#fff",
                    fontFamily: "'JetBrains Mono', monospace",
                    opacity: disabled ? 0.5 : 1,
                }}
            />
        </div>
    );
}

function ProgressLine({ label, done, active }: { label: string; done: boolean; active: boolean }) {
    return (
        <div className="flex items-center gap-2 text-[11px]"
            style={{ color: done ? "#5DBC75" : active ? "#fff" : "#555", fontFamily: "'JetBrains Mono', monospace" }}>
            {done ? <CheckCircle2 size={12} /> : active ? <Loader2 size={12} className="animate-spin" /> : <span style={{ width: 12 }} />}
            {label}
        </div>
    );
}

/**
 * Add a single market to a deployed match. Walks the operator through:
 *   1. picking a market type (lifts metadata + selections from MARKET_INFO)
 *   2. pricing it (initial odds with live decimal/payout preview)
 *   3. picking the line (only relevant for O/U + spread; live "2.5 goals"
 *      preview, warns if non-zero on a no-line market)
 *
 * Lifecycle reminder rendered inline so admins know what comes next: the
 * market lands in `Inactive` state — call `Open` from the per-market row
 * below to start accepting bets.
 *
 * Caller must hold ADMIN_ROLE on the match. The `disabled` prop reflects
 * that gate; a friendly "read-only" banner is rendered upstream.
 */
function AddMarketRow({
    matchAddress,
    marketTypes,
    disabled,
    onCreated,
}: {
    matchAddress: Address;
    marketTypes: readonly string[];
    disabled: boolean;
    onCreated: () => void;
}) {
    const [marketType, setMarketType] = useState<string>(marketTypes[0] ?? "WINNER");
    const [oddsX10000, setOddsX10000] = useState<string>("20000"); // 2.00x
    const [line, setLine] = useState<string>("0");

    const { writeContract, data: txHash, isPending, error } = useBettingMatchWriteAddMarketWithLine();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

    useEffect(() => {
        if (isSuccess) onCreated();
    }, [isSuccess, onCreated]);

    // Default the line to 0 whenever switching to a market type that doesn't
    // use one. Saves the operator a round-trip when bouncing between types.
    useEffect(() => {
        const info = MARKET_INFO[marketType];
        if (info && !info.usesLine && line !== "0") setLine("0");
    }, [marketType, line]);

    const oddsPreview = previewOdds(oddsX10000);
    const linePreview = previewLine(marketType, line);
    const formValid = oddsPreview.valid && !linePreview.warn;

    const handleAdd = () => {
        if (!formValid) return;
        writeContract({
            address: matchAddress,
            args: [mktTypeBytes32(marketType), Number(oddsX10000), Number(line)],
        });
    };

    const typeHash = mktTypeBytes32(marketType);
    const info = MARKET_INFO[marketType];

    return (
        <div className="rounded p-3 space-y-3" style={{ background: "#0A0A0A", border: "1px solid #1A1A1A" }}>
            <div className="flex items-baseline justify-between">
                <div className="text-[10px] uppercase tracking-[0.1em]" style={{ color: "#666" }}>Add market</div>
                <div className="text-[10px]" style={{ color: "#444" }}>
                    Lifecycle: <span style={{ color: "#888" }}>Inactive → Open → (bets) → Close → Resolve</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <FieldWithHint hint="Market type — sent on-chain as keccak256(label).">
                    <select
                        value={marketType}
                        onChange={(e) => setMarketType(e.target.value)}
                        className="w-full px-2 py-1.5 rounded text-[12px]"
                        style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#fff" }}
                    >
                        {marketTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                </FieldWithHint>
                <FieldWithHint hint={ODDS_HINT}>
                    <input
                        value={oddsX10000}
                        onChange={(e) => setOddsX10000(e.target.value)}
                        placeholder="Odds × 10000"
                        className="w-full px-2 py-1.5 rounded text-[12px]"
                        style={{
                            background: "#1A1A1A",
                            border: `1px solid ${oddsPreview.valid || oddsX10000 === "" ? "#2A2A2A" : "#E8001D"}`,
                            color: "#fff",
                            fontFamily: "'JetBrains Mono', monospace",
                        }}
                    />
                </FieldWithHint>
                <FieldWithHint hint={LINE_HINT}>
                    <input
                        value={line}
                        onChange={(e) => setLine(e.target.value)}
                        disabled={!info?.usesLine}
                        placeholder={info?.usesLine ? "Line (×10)" : "0 (no line)"}
                        className="w-full px-2 py-1.5 rounded text-[12px]"
                        style={{
                            background: "#1A1A1A",
                            border: `1px solid ${linePreview.warn ? "#E8001D" : "#2A2A2A"}`,
                            color: "#fff",
                            fontFamily: "'JetBrains Mono', monospace",
                            opacity: info?.usesLine ? 1 : 0.5,
                        }}
                    />
                </FieldWithHint>
            </div>

            {/* Per-market info card — selections, line semantics, keccak preview. */}
            {info && (
                <div className="rounded p-2.5 space-y-2 text-[11px]" style={{ background: "#141414", border: "1px solid #2A2A2A" }}>
                    <p style={{ color: "#ccc", lineHeight: 1.45 }}>{info.description}</p>

                    <div>
                        <span className="block text-[10px] font-bold uppercase tracking-[0.08em] mb-1" style={{ color: "#888" }}>
                            Valid selections (uint64)
                        </span>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-0.5" style={{ color: "#aaa", fontFamily: "'JetBrains Mono', monospace" }}>
                            {info.selections.map((s) => (
                                <li key={s.value}>
                                    <span style={{ color: "#fff" }}>{s.value}</span> · {s.label}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.08em]" style={{ color: "#888" }}>Line</span>
                        <span className="ml-2" style={{ color: "#aaa" }}>
                            {info.usesLine
                                ? (info.lineExample ?? "uses a line")
                                : "this market doesn't use a line — keep at 0"}
                        </span>
                    </div>

                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.08em]" style={{ color: "#888" }}>Type hash</span>
                        <span className="ml-2" style={{ color: "#666", fontFamily: "'JetBrains Mono', monospace" }}>
                            {typeHash.slice(0, 14)}…
                        </span>
                    </div>
                </div>
            )}

            {/* Live previews from the current odds/line inputs. */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                <PreviewBox
                    label="Odds"
                    valid={oddsPreview.valid}
                    primary={oddsPreview.decimal}
                    secondary={oddsPreview.payout}
                    warn={oddsPreview.warn}
                />
                <PreviewBox
                    label="Line"
                    valid={!linePreview.warn}
                    primary={linePreview.display ?? (info?.usesLine ? "—" : "no line")}
                    secondary={info?.usesLine ? `raw on-chain int16 = ${line || "0"}` : ""}
                    warn={linePreview.warn}
                />
            </div>

            {error && (
                <div className="rounded p-2 text-[11px]" style={{ background: "rgba(232,0,29,0.08)", border: "1px solid rgba(232,0,29,0.25)", color: "#F88" }}>
                    {error.message?.slice(0, 240)}
                </div>
            )}

            <button
                onClick={handleAdd}
                disabled={disabled || !formValid || isPending || isConfirming}
                className="px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-[0.08em]"
                style={{
                    background: disabled || !formValid || isPending || isConfirming ? "#3A3A3A" : "#E8001D",
                    color: "#fff",
                    cursor: disabled || !formValid || isPending || isConfirming ? "not-allowed" : "pointer",
                }}
            >
                {isPending || isConfirming ? <Loader2 size={12} className="inline animate-spin mr-1" /> : null}
                Add market
            </button>
        </div>
    );
}

function PreviewBox({
    label, valid, primary, secondary, warn,
}: {
    label: string; valid: boolean; primary: string; secondary?: string; warn?: string;
}) {
    return (
        <div
            className="rounded p-2"
            style={{
                background: "#141414",
                border: `1px solid ${warn ? "rgba(232,0,29,0.4)" : "#2A2A2A"}`,
            }}
        >
            <div className="text-[10px] font-bold uppercase tracking-[0.08em]" style={{ color: "#666" }}>{label}</div>
            <div className="mt-0.5" style={{
                color: warn ? "#F88" : valid ? "#fff" : "#777",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
            }}>
                {warn ?? primary}
            </div>
            {!warn && secondary && (
                <div className="mt-0.5 text-[10px]" style={{ color: "#888" }}>{secondary}</div>
            )}
        </div>
    );
}

function MarketRow({ matchAddress, marketId, disabled }: { matchAddress: Address; marketId: number; disabled: boolean }) {
    const { data: info, refetch } = useBettingMatchReadGetMarketInfo({
        address: matchAddress,
        args: [BigInt(marketId)],
        chainId: chilizConfig.chainId,
    });

    const open = useBettingMatchWriteOpenMarket();
    const close = useBettingMatchWriteCloseMarket();
    const suspend = useBettingMatchWriteSuspendMarket();
    const cancel = useBettingMatchWriteCancelMarket();
    const odds = useBettingMatchWriteSetMarketOdds();
    const resolve = useBettingMatchWriteResolveMarket();

    const lastTxHash = open.data ?? close.data ?? suspend.data ?? cancel.data ?? odds.data ?? resolve.data;
    const { isSuccess } = useWaitForTransactionReceipt({ hash: lastTxHash });

    useEffect(() => { if (isSuccess) refetch(); }, [isSuccess, refetch]);

    const [newOdds, setNewOdds] = useState("20000");
    const [resolveSel, setResolveSel] = useState("0");

    // info layout: [bytes32 type, uint8 state, uint32 odds, uint64 result, uint256 pool]
    const tuple = info as readonly [Hex, number, number, bigint, bigint] | undefined;
    const typeHash = tuple?.[0];
    const state = tuple?.[1];
    const currentOdds = tuple?.[2];

    const marketLabel = labelForMarketHash(typeHash);
    const stateLabel = state !== undefined ? MARKET_STATE_LABEL[state] : "—";
    const Btn = (props: { onClick: () => void; label: string; danger?: boolean; disabled?: boolean }) => (
        <button
            onClick={props.onClick}
            disabled={disabled || props.disabled}
            className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-[0.06em]"
            style={{
                background: disabled || props.disabled ? "#2A2A2A" : props.danger ? "rgba(232,0,29,0.12)" : "#1A1A1A",
                border: `1px solid ${props.danger ? "#E8001D" : "#2A2A2A"}`,
                color: disabled || props.disabled ? "#555" : props.danger ? "#E8001D" : "#fff",
                cursor: disabled || props.disabled ? "not-allowed" : "pointer",
            }}
        >
            {props.label}
        </button>
    );

    return (
        <div className="rounded p-3 space-y-2" style={{ background: "#0A0A0A", border: "1px solid #1A1A1A" }}>
            <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                    <span className="text-[12px] font-bold uppercase tracking-[0.06em]" style={{ color: "#fff" }}>
                        {marketLabel}
                    </span>
                    <span className="text-[10px]" style={{ color: "#555", fontFamily: "'JetBrains Mono', monospace" }}>
                        #{marketId}
                    </span>
                </div>
                <div className="text-[10px] uppercase tracking-[0.1em]" style={{ color: "#888" }}>
                    {stateLabel} · odds {currentOdds !== undefined ? (currentOdds / 10000).toFixed(2) + "x" : "—"}
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <Btn label="Open" onClick={() => open.writeContract({ address: matchAddress, args: [BigInt(marketId)] })} />
                <Btn label="Suspend" onClick={() => suspend.writeContract({ address: matchAddress, args: [BigInt(marketId)] })} />
                <Btn label="Close" onClick={() => close.writeContract({ address: matchAddress, args: [BigInt(marketId)] })} />
                <Btn label="Cancel" danger onClick={() => cancel.writeContract({ address: matchAddress, args: [BigInt(marketId), "admin cancel"] })} />
            </div>

            <FieldWithHint hint={ODDS_HINT}>
                <div className="flex gap-2">
                    <input
                        value={newOdds}
                        onChange={(e) => setNewOdds(e.target.value)}
                        className="flex-1 px-2 py-1 rounded text-[11px]"
                        style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#fff", fontFamily: "'JetBrains Mono', monospace" }}
                        placeholder="Odds × 10000"
                    />
                    <Btn label="Set Odds" onClick={() => odds.writeContract({ address: matchAddress, args: [BigInt(marketId), Number(newOdds)] })} />
                </div>
            </FieldWithHint>

            <FieldWithHint hint={selectionHint(marketLabel)}>
                <div className="flex gap-2">
                    <input
                        value={resolveSel}
                        onChange={(e) => setResolveSel(e.target.value)}
                        className="flex-1 px-2 py-1 rounded text-[11px]"
                        style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#fff", fontFamily: "'JetBrains Mono', monospace" }}
                        placeholder="Winning selection"
                    />
                    <Btn label="Resolve" danger onClick={() => resolve.writeContract({ address: matchAddress, args: [BigInt(marketId), BigInt(resolveSel)] })} />
                </div>
            </FieldWithHint>
        </div>
    );
}

function FieldWithHint({ hint, children }: { hint: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            {children}
            <p className="text-[10px] leading-snug" style={{ color: "#555" }}>{hint}</p>
        </div>
    );
}
