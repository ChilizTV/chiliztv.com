"use client";

import { useState } from "react";
import type { Address } from "viem";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useWaitForTransactionReceipt } from "wagmi";
import {
    useBettingMatchFactoryWriteCreateFootballMatch,
    useBettingMatchFactoryWriteCreateBasketballMatch,
    useBettingMatchFactoryReadOwner,
} from "@/lib/contracts/generated";
import { chilizConfig } from "@/config/chiliz.config";
import { NetworkGuard } from "@/components/web3/NetworkGuard";
import { Loader2, Plus } from "lucide-react";

const FACTORY = chilizConfig.bettingMatchFactory;

type Sport = "football" | "basketball";

/**
 * Owner-gated form to create a new match. The factory wires every new match
 * proxy to the pool, USDC, and swap router atomically inside `createXxxMatch`.
 *
 * The connected wallet must equal `factory.owner()` — we read it on-chain
 * and surface a clear "not authorized" state when it doesn't match, instead
 * of letting the create call revert opaquely in MetaMask.
 */
export function CreateMatchForm() {
    const { primaryWallet } = useDynamicContext();
    const userAddress = primaryWallet?.address as Address | undefined;

    const [sport, setSport] = useState<Sport>("football");
    const [name, setName] = useState("");
    const [matchOwner, setMatchOwner] = useState("");
    const [oracle, setOracle] = useState("");

    const { data: factoryOwner } = useBettingMatchFactoryReadOwner({
        address: FACTORY,
        chainId: chilizConfig.chainId,
    });
    const isAuthorized = !!userAddress && !!factoryOwner &&
        (factoryOwner as string).toLowerCase() === userAddress.toLowerCase();

    const football = useBettingMatchFactoryWriteCreateFootballMatch();
    const basketball = useBettingMatchFactoryWriteCreateBasketballMatch();

    const txHash = sport === "football" ? football.data : basketball.data;
    const isPending = sport === "football" ? football.isPending : basketball.isPending;
    const error = sport === "football" ? football.error : basketball.error;
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

    const canSubmit =
        isAuthorized && !!name.trim() && !!matchOwner.trim() && !!oracle.trim() && !isPending && !isConfirming;

    const handleSubmit = () => {
        if (!canSubmit) return;
        const args: [string, Address, Address] = [name.trim(), matchOwner.trim() as Address, oracle.trim() as Address];
        if (sport === "football") {
            football.writeContract({ address: FACTORY, args });
        } else {
            basketball.writeContract({ address: FACTORY, args });
        }
    };

    const selfFiller = (setter: (v: string) => void) => () => userAddress && setter(userAddress);

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
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-2">
                        {(["football", "basketball"] as Sport[]).map((s) => (
                            <button
                                key={s}
                                onClick={() => setSport(s)}
                                className="py-2 rounded text-[11px] font-bold uppercase tracking-[0.08em]"
                                style={{
                                    background: sport === s ? "rgba(232,0,29,0.12)" : "#1A1A1A",
                                    color: sport === s ? "#fff" : "#888",
                                    border: `1px solid ${sport === s ? "#E8001D" : "#2A2A2A"}`,
                                }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    <Field label="Match name" value={name} onChange={setName} placeholder="Barcelona vs Real Madrid" />
                    <Field
                        label="Match admin (gets ADMIN_ROLE)"
                        value={matchOwner}
                        onChange={setMatchOwner}
                        placeholder="0x…"
                        suffix={<UseSelfButton onClick={selfFiller(setMatchOwner)} />}
                    />
                    <Field
                        label="Oracle (gets RESOLVER_ROLE)"
                        value={oracle}
                        onChange={setOracle}
                        placeholder="0x…"
                        suffix={<UseSelfButton onClick={selfFiller(setOracle)} />}
                    />

                    {error && (
                        <div className="rounded p-2 text-[11px]" style={{ background: "rgba(232,0,29,0.08)", border: "1px solid rgba(232,0,29,0.25)", color: "#F88" }}>
                            {error.message?.slice(0, 200)}
                        </div>
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
                        {isPending || isConfirming ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                {isPending ? "Confirm in wallet…" : "Creating match…"}
                            </>
                        ) : isSuccess ? (
                            "Match created"
                        ) : (
                            `Create ${sport} match`
                        )}
                    </button>
                </>
            )}
        </section>
    );
}

function Field({
    label,
    value,
    onChange,
    placeholder,
    suffix,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    suffix?: React.ReactNode;
}) {
    return (
        <label className="block">
            <span className="block text-[10px] uppercase tracking-[0.1em] mb-1" style={{ color: "#666" }}>{label}</span>
            <div className="flex gap-2">
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 px-3 py-2 rounded text-[12px]"
                    style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#fff", fontFamily: "'JetBrains Mono', monospace" }}
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
