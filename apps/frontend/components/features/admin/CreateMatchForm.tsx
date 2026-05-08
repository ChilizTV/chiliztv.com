"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Address, Hex, TransactionReceipt } from "viem";
import { keccak256, parseEventLogs, stringToBytes } from "viem";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useWaitForTransactionReceipt } from "wagmi";
import {
    useBettingMatchFactoryWriteCreateFootballMatch,
    useBettingMatchFactoryWriteCreateBasketballMatch,
    useBettingMatchFactoryReadOwner,
    useFootballMatchWriteAddMarketsBatch,
    useBasketballMatchWriteAddMarketsBatch,
    useBettingMatchWriteOpenMarketsBatch,
    bettingMatchFactoryAbi,
} from "@/lib/contracts/generated";
import { chilizConfig } from "@/config/chiliz.config";
import { NetworkGuard } from "@/components/web3/NetworkGuard";
import { CheckCircle2, Loader2, Plus } from "lucide-react";

const FACTORY = chilizConfig.bettingMatchFactory;

type Sport = "football" | "basketball";

type Step = "idle" | "creating" | "decoding" | "addingMarkets" | "openingMarkets" | "done";

// Default 3-market sets per sport. Mirrors `script/SetupMatch.s.sol` so the
// UI and CLI deploys produce identical fixtures. Odds are x10000 precision.
type DefaultMarket = { type: string; odds: number; line: number };

const FOOTBALL_DEFAULTS: DefaultMarket[] = [
    { type: "WINNER",      odds: 22000, line: 0  }, // 1X2 — 2.20x (Home)
    { type: "GOALS_TOTAL", odds: 18500, line: 25 }, // O/U 2.5 — 1.85x (Over)
    { type: "BOTH_SCORE",  odds: 17000, line: 0  }, // BTTS — 1.70x (Yes)
];

const BASKETBALL_DEFAULTS: DefaultMarket[] = [
    { type: "WINNER",       odds: 19000, line: 0    }, // ML — 1.90x
    { type: "TOTAL_POINTS", odds: 19000, line: 2155 }, // O/U 215.5 — 1.90x
    { type: "SPREAD",       odds: 19000, line: 50   }, // -5.0 spread — 1.90x
];

function mktTypeBytes32(label: string): Hex {
    return keccak256(stringToBytes(label));
}

/**
 * Owner-gated form to bootstrap a match end-to-end. Three sequential txs:
 *   1. factory.create{Football,Basketball}Match  → deploys the proxy
 *   2. {Football,Basketball}Match.addMarketsBatch → adds 3 default markets
 *   3. BettingMatch.openMarketsBatch              → opens markets 0..2
 *
 * After (3) the match is fully bettable. /live/999999 will pick it up via
 * `factory.getAllMatches().at(-1)`.
 *
 * The connected wallet must equal `factory.owner()` (gates step 1) AND must
 * be the supplied match-admin address (gates steps 2 + 3 — `ADMIN_ROLE` on
 * the freshly deployed match). We auto-fill match-admin to the connected
 * wallet to keep the happy path one click, but allow override.
 */
export function CreateMatchForm() {
    const router = useRouter();
    const { primaryWallet } = useDynamicContext();
    const userAddress = primaryWallet?.address as Address | undefined;

    const [sport, setSport] = useState<Sport>("football");
    const [name, setName] = useState("");
    const [matchOwner, setMatchOwner] = useState("");
    const [oracle, setOracle] = useState("");
    const [step, setStep] = useState<Step>("idle");
    const [proxyAddress, setProxyAddress] = useState<Address | undefined>(undefined);
    const [pipelineError, setPipelineError] = useState<string | null>(null);

    // Auto-default the admin/oracle to the connected wallet so the operator
    // doesn't have to fill them manually for the happy path. They can still
    // override before clicking create.
    useEffect(() => {
        if (userAddress && !matchOwner) setMatchOwner(userAddress);
        if (userAddress && !oracle)     setOracle(userAddress);
    }, [userAddress, matchOwner, oracle]);

    const { data: factoryOwner } = useBettingMatchFactoryReadOwner({
        address: FACTORY,
        chainId: chilizConfig.chainId,
    });
    const isAuthorized = !!userAddress && !!factoryOwner &&
        (factoryOwner as string).toLowerCase() === userAddress.toLowerCase();

    const adminMatchesSigner = !!userAddress && !!matchOwner &&
        userAddress.toLowerCase() === matchOwner.trim().toLowerCase();

    // ── Tx 1: create match ───────────────────────────────────────────────
    const football = useBettingMatchFactoryWriteCreateFootballMatch();
    const basketball = useBettingMatchFactoryWriteCreateBasketballMatch();
    const createTxHash = sport === "football" ? football.data : basketball.data;
    const createError = sport === "football" ? football.error : basketball.error;
    const { data: createReceipt, isLoading: createConfirming, isSuccess: createSuccess } =
        useWaitForTransactionReceipt({ hash: createTxHash });

    // ── Tx 2: add markets batch ──────────────────────────────────────────
    const addFootball  = useFootballMatchWriteAddMarketsBatch();
    const addBasketball = useBasketballMatchWriteAddMarketsBatch();
    const addTxHash = sport === "football" ? addFootball.data : addBasketball.data;
    const addError  = sport === "football" ? addFootball.error : addBasketball.error;
    const { isLoading: addConfirming, isSuccess: addSuccess } =
        useWaitForTransactionReceipt({ hash: addTxHash });

    // ── Tx 3: open markets batch ─────────────────────────────────────────
    const openMarkets = useBettingMatchWriteOpenMarketsBatch();
    const { isLoading: openConfirming, isSuccess: openSuccess } =
        useWaitForTransactionReceipt({ hash: openMarkets.data });

    // ── State machine ────────────────────────────────────────────────────

    // Step 1 → 2: when create receipt lands, decode proxy address from the
    // MatchCreated event and dispatch addMarketsBatch.
    useEffect(() => {
        if (step !== "creating" || !createSuccess || !createReceipt) return;
        setStep("decoding");
        try {
            const proxy = decodeProxyAddress(createReceipt);
            if (!proxy) throw new Error("MatchCreated event not found in receipt");
            setProxyAddress(proxy);

            const defaults = sport === "football" ? FOOTBALL_DEFAULTS : BASKETBALL_DEFAULTS;
            const types = defaults.map((d) => mktTypeBytes32(d.type));
            const odds  = defaults.map((d) => d.odds);
            const lines = defaults.map((d) => d.line);

            setStep("addingMarkets");
            if (sport === "football") {
                addFootball.writeContract({
                    address: proxy,
                    args: [types, odds, lines],
                });
            } else {
                addBasketball.writeContract({
                    address: proxy,
                    args: [types, odds, lines],
                });
            }
        } catch (e) {
            setPipelineError(e instanceof Error ? e.message : String(e));
            setStep("idle");
        }
    }, [step, createSuccess, createReceipt, sport, addFootball, addBasketball]);

    // Step 2 → 3: when add receipt lands, dispatch openMarketsBatch(0,1,2).
    useEffect(() => {
        if (step !== "addingMarkets" || !addSuccess || !proxyAddress) return;
        setStep("openingMarkets");
        openMarkets.writeContract({
            address: proxyAddress,
            args: [[BigInt(0), BigInt(1), BigInt(2)]],
        });
    }, [step, addSuccess, proxyAddress, openMarkets]);

    // Step 3 → done.
    useEffect(() => {
        if (step !== "openingMarkets" || !openSuccess) return;
        setStep("done");
    }, [step, openSuccess]);

    // Surface any underlying write error (revert, user reject, etc.).
    useEffect(() => {
        const err = createError ?? addError ?? openMarkets.error;
        if (err && step !== "idle") {
            setPipelineError(err.message?.slice(0, 240) ?? String(err));
            setStep("idle");
        }
    }, [createError, addError, openMarkets.error, step]);

    // ── UI helpers ───────────────────────────────────────────────────────

    const isPipelineActive = step !== "idle" && step !== "done";
    const canSubmit =
        isAuthorized &&
        adminMatchesSigner &&
        !!name.trim() &&
        !!matchOwner.trim() &&
        !!oracle.trim() &&
        !isPipelineActive;

    const handleSubmit = () => {
        if (!canSubmit) return;
        setPipelineError(null);
        setProxyAddress(undefined);
        setStep("creating");
        const args: [string, Address, Address] = [
            name.trim(),
            matchOwner.trim() as Address,
            oracle.trim() as Address,
        ];
        if (sport === "football") {
            football.writeContract({ address: FACTORY, args });
        } else {
            basketball.writeContract({ address: FACTORY, args });
        }
    };

    const handleReset = () => {
        setStep("idle");
        setProxyAddress(undefined);
        setPipelineError(null);
        setName("");
    };

    const selfFiller = (setter: (v: string) => void) => () => userAddress && setter(userAddress);

    const buttonLabel = useMemo(() => {
        if (step === "creating" && !createConfirming) return "Confirm in wallet… (1/3 deploy)";
        if (step === "creating") return "Deploying match… (1/3)";
        if (step === "decoding") return "Reading proxy address…";
        if (step === "addingMarkets" && !addConfirming) return "Confirm in wallet… (2/3 add markets)";
        if (step === "addingMarkets") return "Adding markets… (2/3)";
        if (step === "openingMarkets" && !openConfirming) return "Confirm in wallet… (3/3 open markets)";
        if (step === "openingMarkets") return "Opening markets… (3/3)";
        if (step === "done") return "Match live";
        return `Create ${sport} match`;
    }, [step, createConfirming, addConfirming, openConfirming, sport]);

    return (
        <section className="space-y-3 rounded-lg p-4" style={{ background: "#0F0F0F", border: "1px solid #2A2A2A" }}>
            <header className="flex items-center gap-2">
                <Plus size={14} style={{ color: "#E8001D" }} />
                <h3 className="text-[14px] font-bold uppercase tracking-[0.08em]" style={{ color: "#fff" }}>
                    Create Match
                </h3>
            </header>

            <NetworkGuard />

            {!userAddress ? (
                <p className="text-[12px]" style={{ color: "#888" }}>Connect your wallet to create a match.</p>
            ) : !isAuthorized ? (
                <div
                    className="rounded p-3 text-[11px]"
                    style={{ background: "rgba(245,197,24,0.08)", border: "1px solid rgba(245,197,24,0.3)", color: "#F5C518" }}
                >
                    Not authorized — factory owner is{" "}
                    <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{(factoryOwner as string | undefined) ?? "loading…"}</span>.
                </div>
            ) : step === "done" ? (
                <DoneCard
                    proxyAddress={proxyAddress!}
                    onOpenLive={() => router.push("/live/999999")}
                    onAnother={handleReset}
                />
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-2">
                        {(["football", "basketball"] as Sport[]).map((s) => (
                            <button
                                key={s}
                                onClick={() => !isPipelineActive && setSport(s)}
                                disabled={isPipelineActive}
                                className="py-2 rounded text-[11px] font-bold uppercase tracking-[0.08em]"
                                style={{
                                    background: sport === s ? "rgba(232,0,29,0.12)" : "#1A1A1A",
                                    color: sport === s ? "#fff" : "#888",
                                    border: `1px solid ${sport === s ? "#E8001D" : "#2A2A2A"}`,
                                    cursor: isPipelineActive ? "not-allowed" : "pointer",
                                    opacity: isPipelineActive ? 0.6 : 1,
                                }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    <Field label="Match name" value={name} onChange={setName} placeholder="Barcelona vs Real Madrid" disabled={isPipelineActive} />
                    <Field
                        label="Match admin (gets ADMIN_ROLE)"
                        value={matchOwner}
                        onChange={setMatchOwner}
                        placeholder="0x…"
                        suffix={<UseSelfButton onClick={selfFiller(setMatchOwner)} />}
                        disabled={isPipelineActive}
                    />
                    {!adminMatchesSigner && !!matchOwner && (
                        <div className="rounded p-2 text-[11px]" style={{ background: "rgba(245,197,24,0.08)", border: "1px solid rgba(245,197,24,0.3)", color: "#F5C518" }}>
                            Match admin must equal the connected wallet — the next two txs require ADMIN_ROLE on the new match. Click <strong>Me</strong> to fix.
                        </div>
                    )}
                    <Field
                        label="Oracle (gets RESOLVER_ROLE)"
                        value={oracle}
                        onChange={setOracle}
                        placeholder="0x…"
                        suffix={<UseSelfButton onClick={selfFiller(setOracle)} />}
                        disabled={isPipelineActive}
                    />

                    <DefaultsPreview sport={sport} />

                    {pipelineError && (
                        <div className="rounded p-2 text-[11px]" style={{ background: "rgba(232,0,29,0.08)", border: "1px solid rgba(232,0,29,0.25)", color: "#F88" }}>
                            {pipelineError}
                        </div>
                    )}

                    {isPipelineActive && (
                        <ProgressTrail step={step} />
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded text-[12px] font-bold uppercase tracking-[0.08em]"
                        style={{
                            background: canSubmit ? "#E8001D" : "#3A3A3A",
                            color: "#fff",
                            cursor: canSubmit ? "pointer" : "not-allowed",
                        }}
                    >
                        {isPipelineActive && <Loader2 size={14} className="animate-spin" />}
                        {buttonLabel}
                    </button>
                </>
            )}
        </section>
    );
}

// ── Helpers ──────────────────────────────────────────────────────────────

function decodeProxyAddress(receipt: TransactionReceipt): Address | undefined {
    const logs = parseEventLogs({
        abi: bettingMatchFactoryAbi,
        eventName: "MatchCreated",
        logs: receipt.logs,
    });
    return logs[0]?.args?.proxy as Address | undefined;
}

function DefaultsPreview({ sport }: { sport: Sport }) {
    const defaults = sport === "football" ? FOOTBALL_DEFAULTS : BASKETBALL_DEFAULTS;
    return (
        <div className="rounded p-2 text-[11px]" style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#888" }}>
            <div className="font-bold uppercase tracking-[0.08em] mb-1" style={{ color: "#666" }}>Default markets (auto-added + opened)</div>
            {defaults.map((d, i) => (
                <div key={d.type} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {i}. {d.type} — {(d.odds / 10000).toFixed(2)}x{d.line ? `, line ${d.line}` : ""}
                </div>
            ))}
        </div>
    );
}

function ProgressTrail({ step }: { step: Step }) {
    const steps: { id: Step; label: string }[] = [
        { id: "creating", label: "1. Deploy match" },
        { id: "addingMarkets", label: "2. Add markets" },
        { id: "openingMarkets", label: "3. Open markets" },
    ];
    const order: Step[] = ["creating", "decoding", "addingMarkets", "openingMarkets", "done"];
    const currentIdx = order.indexOf(step);
    return (
        <div className="space-y-1">
            {steps.map((s) => {
                const idx = order.indexOf(s.id);
                const done = currentIdx > idx || step === "done";
                const active = currentIdx === idx;
                const decodingForFirst = s.id === "creating" && step === "decoding";
                return (
                    <div key={s.id} className="flex items-center gap-2 text-[11px]"
                        style={{ color: done ? "#5DBC75" : active ? "#fff" : "#555", fontFamily: "'JetBrains Mono', monospace" }}>
                        {done ? <CheckCircle2 size={12} /> : (active || decodingForFirst) ? <Loader2 size={12} className="animate-spin" /> : <span style={{ width: 12 }} />}
                        {s.label}
                    </div>
                );
            })}
        </div>
    );
}

function DoneCard({
    proxyAddress,
    onOpenLive,
    onAnother,
}: {
    proxyAddress: Address;
    onOpenLive: () => void;
    onAnother: () => void;
}) {
    return (
        <div className="space-y-3">
            <div className="rounded p-3" style={{ background: "rgba(93,188,117,0.08)", border: "1px solid rgba(93,188,117,0.35)" }}>
                <div className="flex items-center gap-2 mb-1" style={{ color: "#5DBC75" }}>
                    <CheckCircle2 size={14} />
                    <span className="text-[12px] font-bold uppercase tracking-[0.08em]">Match live</span>
                </div>
                <div className="text-[11px]" style={{ color: "#aaa" }}>
                    Proxy:{" "}
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#fff" }}>{proxyAddress}</span>
                </div>
                <div className="text-[11px]" style={{ color: "#aaa" }}>
                    3 markets opened (0 / 1 / 2). Bettors can place stakes immediately.
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={onOpenLive}
                    className="py-2.5 rounded text-[12px] font-bold uppercase tracking-[0.08em]"
                    style={{ background: "#E8001D", color: "#fff" }}
                >
                    Open in /live/999999
                </button>
                <button
                    onClick={onAnother}
                    className="py-2.5 rounded text-[12px] font-bold uppercase tracking-[0.08em]"
                    style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#fff" }}
                >
                    Create another
                </button>
            </div>
        </div>
    );
}

function Field({
    label,
    value,
    onChange,
    placeholder,
    suffix,
    disabled,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    suffix?: React.ReactNode;
    disabled?: boolean;
}) {
    return (
        <label className="block">
            <span className="block text-[10px] uppercase tracking-[0.1em] mb-1" style={{ color: "#666" }}>{label}</span>
            <div className="flex gap-2">
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="flex-1 px-3 py-2 rounded text-[12px]"
                    style={{
                        background: "#1A1A1A",
                        border: "1px solid #2A2A2A",
                        color: "#fff",
                        fontFamily: "'JetBrains Mono', monospace",
                        opacity: disabled ? 0.6 : 1,
                    }}
                />
                {suffix}
            </div>
        </label>
    );
}

function UseSelfButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="px-2 rounded text-[10px] font-bold uppercase tracking-[0.08em]"
            style={{ background: "rgba(232,0,29,0.1)", color: "#E8001D" }}
        >
            Me
        </button>
    );
}
