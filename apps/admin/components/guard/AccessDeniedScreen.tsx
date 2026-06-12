"use client";

/** Terminal state — connected wallet has no active admin grant. */
export function AccessDeniedScreen({ wallet }: Readonly<{ wallet: string }>) {
  return (
    <main className="flex min-h-svh items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-xl border border-[#E8001D]/30 bg-[#111] p-8 text-center">
        <h1 className="font-display text-[28px] font-extrabold uppercase leading-none text-[#FF1737]">
          Access denied
        </h1>
        <p className="font-mono-ctv mt-3 text-[11px] tracking-[0.06em] text-white/55" title={wallet}>
          {wallet.slice(0, 6)}…{wallet.slice(-4)} has no admin grant.
        </p>
      </div>
    </main>
  );
}
