"use client";

import { useState } from "react";
import Image from "next/image";
import { adminApi } from "@/lib/api/endpoints/admin";
import { setGateToken } from "@/lib/api/auth";
import { Icon, type IconName } from "@/components/common/Icon";
import { Eyebrow } from "@/components/common/Eyebrow";
import { GuardFrame } from "./GuardFrame";
import { GuardCard } from "./GuardCard";

type GateError = { icon: IconName; color: string; msg: string; sub: string };

const ERRORS: Record<"forbidden" | "rate" | "network", GateError> = {
  forbidden: { icon: "alertCircle", color: "#FF1737", msg: "Invalid access code", sub: "Field cleared — try again" },
  rate: { icon: "clock", color: "#F5C518", msg: "Too many attempts — wait a minute", sub: "The gate limiter resets shortly" },
  network: { icon: "wifiOff", color: "rgba(255,255,255,0.55)", msg: "API unreachable", sub: "Check the backend and its ALLOWED_ORIGINS" },
};

/** Step 0 — access code before anything wallet-related is exposed. */
export function GateScreen({ onPassed }: Readonly<{ onPassed: () => void }>) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<GateError | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await adminApi.gate(code);
      setGateToken(res.data.gateToken);
      onPassed();
    } catch (err) {
      // Only a 403 means a wrong code — network/CORS/5xx must not masquerade as one.
      const status = (err as { response?: { status?: number } }).response?.status;
      if (status === 403) setError(ERRORS.forbidden);
      else if (status === 429) setError(ERRORS.rate);
      else setError(ERRORS.network);
      setCode("");
    } finally {
      setPending(false);
    }
  };

  return (
    <GuardFrame step={0}>
      <GuardCard>
        <Eyebrow>Restricted area</Eyebrow>
        <Image src="/predcast-logo-on-dark.svg" alt="PredCast" width={143} height={22} priority className="mt-5 h-[22px] w-auto" />
        <p className="mt-3 text-[12px] font-light leading-relaxed text-white/55">
          Operator access code, before anything wallet-related is exposed.
        </p>
        <form onSubmit={submit}>
          <label htmlFor="gate-code" className="font-mono-ctv mt-6 block text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">
            Access code
          </label>
          <div
            className="mt-1.5 flex items-center gap-2.5 rounded-md border bg-[#0d0d0d] px-4 py-3 focus-within:ring-2 focus-within:ring-[#E8001D]"
            style={{ borderColor: error ? `${error.color}55` : "#2A2A2A" }}
          >
            <Icon n="key" s={14} className="shrink-0 text-white/30" />
            <input
              id="gate-code"
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoFocus
              autoComplete="off"
              className="font-mono-ctv w-full bg-transparent text-[13px] tracking-[0.3em] text-white outline-none"
            />
          </div>
          {error && (
            <div className="mt-2.5 flex items-start gap-2">
              <Icon n={error.icon} s={13} className="mt-px shrink-0" style={{ color: error.color }} />
              <div className="min-w-0">
                <p className="font-mono-ctv text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: error.color }}>
                  {error.msg}
                </p>
                <p className="font-mono-ctv mt-1 text-[9px] uppercase tracking-[0.12em] text-white/30">{error.sub}</p>
              </div>
            </div>
          )}
          <button
            type="submit"
            disabled={pending || code.length === 0}
            className="font-mono-ctv mt-5 w-full rounded-md bg-[#E8001D] px-6 py-3 text-[12px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#FF1737] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Checking…" : "Unlock"}
          </button>
        </form>
        <p className="font-mono-ctv mt-4 text-[9px] uppercase tracking-[0.14em] text-white/30">
          Lost the code? Ask a super admin.
        </p>
      </GuardCard>
    </GuardFrame>
  );
}
