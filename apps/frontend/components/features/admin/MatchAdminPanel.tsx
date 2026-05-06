"use client";

import { useEffect, useState } from "react";
import type { Address, Hex } from "viem";
import { keccak256, stringToBytes } from "viem";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useWaitForTransactionReceipt } from "wagmi";
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
} from "@/lib/contracts/generated";
import { chilizConfig } from "@/config/chiliz.config";
import { NetworkGuard } from "@/components/web3/NetworkGuard";
import { Loader2 } from "lucide-react";

const FACTORY = chilizConfig.bettingMatchFactory;

// MarketState enum from BettingMatch.sol
const MARKET_STATE_LABEL = ["Inactive", "Open", "Suspended", "Closed", "Resolved", "Cancelled"] as const;

// Football & basketball market types (must match the on-chain bytes32 constants).
const FOOTBALL_MARKETS = ["WINNER", "GOALS_TOTAL", "BOTH_SCORE", "HALFTIME", "CORRECT_SCORE", "FIRST_SCORER"] as const;
const BASKETBALL_MARKETS = ["WINNER", "POINTS_TOTAL"] as const;

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

// Per-market hint for the "Winning selection" input on resolve. Keeps admins
// from guessing which uint64 maps to which outcome.
function selectionHint(marketLabel: string): string {
    switch (marketLabel) {
        case "WINNER":
        case "HALFTIME":
            return "0 = home · 1 = draw · 2 = away (basketball: 0 = home · 1 = away)";
        case "GOALS_TOTAL":
        case "POINTS_TOTAL":
            return "0 = OVER the line · 1 = UNDER the line";
        case "BOTH_SCORE":
            return "0 = YES (both teams score) · 1 = NO";
        case "CORRECT_SCORE":
            return "Encoded score (home*100 + away). e.g. 21 = 2-1, 100 = 1-0";
        case "FIRST_SCORER":
            return "Team/player id as defined by the resolver oracle";
        default:
            return "Outcome id as defined by the market oracle";
    }
}

const ODDS_HINT = "Odds × 10000. 20000 = 2.00x · min 10001 (≈1.0001x) · max 1,000,000 (100x)";
const LINE_HINT = "Scaled ×10. e.g. 25 = 2.5 goals/points. Use 0 for markets without a line (WINNER, HALFTIME, BOTH_SCORE).";

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
                </>
            )}
        </section>
    );
}

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

    const handleAdd = () => {
        const odds = Number(oddsX10000);
        const lineVal = Number(line);
        if (!Number.isFinite(odds) || odds < 10001 || odds > 1_000_000) return;
        if (!Number.isFinite(lineVal)) return;
        writeContract({
            address: matchAddress,
            args: [mktTypeBytes32(marketType), odds, lineVal],
        });
    };

    return (
        <div className="rounded p-3 space-y-2" style={{ background: "#0A0A0A", border: "1px solid #1A1A1A" }}>
            <div className="text-[10px] uppercase tracking-[0.1em]" style={{ color: "#666" }}>Add market</div>
            <div className="grid grid-cols-3 gap-2">
                <FieldWithHint hint="Market type — written on-chain as keccak256(label).">
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
                        style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#fff", fontFamily: "'JetBrains Mono', monospace" }}
                    />
                </FieldWithHint>
                <FieldWithHint hint={LINE_HINT}>
                    <input
                        value={line}
                        onChange={(e) => setLine(e.target.value)}
                        placeholder="Line (×10)"
                        className="w-full px-2 py-1.5 rounded text-[12px]"
                        style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#fff", fontFamily: "'JetBrains Mono', monospace" }}
                    />
                </FieldWithHint>
            </div>
            {error && <div className="text-[11px]" style={{ color: "#F88" }}>{error.message?.slice(0, 200)}</div>}
            <button
                onClick={handleAdd}
                disabled={disabled || isPending || isConfirming}
                className="px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-[0.08em]"
                style={{
                    background: disabled || isPending || isConfirming ? "#3A3A3A" : "#E8001D",
                    color: "#fff",
                    cursor: disabled || isPending || isConfirming ? "not-allowed" : "pointer",
                }}
            >
                {isPending || isConfirming ? <Loader2 size={12} className="inline animate-spin mr-1" /> : null}
                Add Market
            </button>
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
