"use client";

import { useState } from "react";
import { adminApi } from "@/lib/api/endpoints/admin";
import { setGateToken } from "@/lib/api/auth";

/** Step 0 — access code before anything wallet-related is exposed. */
export function GateScreen({ onPassed }: Readonly<{ onPassed: () => void }>) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
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
    } catch {
      setError("Invalid access code");
      setCode("");
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="flex min-h-svh items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl border border-[#1E1E1E] bg-[#111] p-8">
        <div className="font-mono-ctv inline-flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#E8001D]">
          <span aria-hidden className="block h-0.5 w-4 bg-[#E8001D]" />
          Restricted area
        </div>
        <h1 className="font-display mt-3 text-[28px] font-extrabold uppercase leading-none text-white">
          PredCast Admin
        </h1>
        <p className="mt-2 text-[12px] font-light text-white/55">
          Enter the access code to continue.
        </p>
        <input
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoFocus
          autoComplete="off"
          aria-label="Access code"
          className="font-mono-ctv mt-5 w-full rounded-md border border-[#2A2A2A] bg-[#0d0d0d] px-4 py-3 text-[13px] tracking-[0.08em] text-white outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D]"
        />
        {error && (
          <p className="font-mono-ctv mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#FF1737]">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending || code.length === 0}
          className="font-mono-ctv mt-5 w-full rounded-md bg-[#E8001D] px-6 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-white transition-all hover:bg-[#FF1737] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Checking…" : "Unlock"}
        </button>
      </form>
    </main>
  );
}
