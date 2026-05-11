"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { toast } from "sonner";
import { useJoinWaitlist } from "@/hooks/api/useWaitlist";
import { useRedeemAccessCode } from "@/hooks/api/useAccessCode";

type Tab = "waitlist" | "code";

interface Props {
  /** Center-align tabs + form (for FinalCTA). Default: left-aligned. */
  centered?: boolean;
}

export function GateInline({ centered = false }: Props) {
  const router = useRouter();
  const { primaryWallet } = useDynamicContext();
  const [tab, setTab] = useState<Tab>("waitlist");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [done, setDone] = useState(false);

  const { mutateAsync: joinWaitlist, isPending: joiningWaitlist } = useJoinWaitlist();
  const { mutateAsync: redeemCode, isPending: redeemingCode } = useRedeemAccessCode();

  const isPending = tab === "waitlist" ? joiningWaitlist : redeemingCode;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === "waitlist") {
      try {
        await joinWaitlist({ email, walletAddress: primaryWallet?.address });
        setDone(true);
      } catch {
        toast.error("Something went wrong. Try again.");
      }
    } else {
      try {
        const result = await redeemCode(code);
        if (result.success) {
          toast.success("Access granted — welcome.");
          router.push("/browse");
        } else {
          toast.error("Invalid code.");
          setCode("");
        }
      } catch {
        toast.error("Something went wrong. Try again.");
        setCode("");
      }
    }
  };

  if (done) {
    return (
      <div className={centered ? "text-center" : ""}>
        <div className="font-mono-ctv mb-1 text-[10px] uppercase tracking-[0.18em] text-[#2dd4a4]">
          You're on the list
        </div>
        <p className="text-[13px] font-light text-white/55">
          We'll reach out when your spot opens.
        </p>
      </div>
    );
  }

  const align = centered ? "justify-center" : "";

  return (
    <div>
      {/* CTA-sized tab switcher */}
      <div className={`mb-4 flex flex-wrap gap-3 ${align}`}>
        <button
          type="button"
          onClick={() => setTab("waitlist")}
          className={`font-mono-ctv rounded-md px-4 py-3 text-[12px] font-bold uppercase tracking-[0.06em] text-white transition-all hover:-translate-y-px ${
            tab === "waitlist"
              ? "bg-[#E8001D] hover:bg-[#FF1737]"
              : "border border-[#2A2A2A] bg-transparent hover:border-[#3A3A3A]"
          }`}
          style={
            tab === "waitlist"
              ? { boxShadow: "0 8px 32px rgba(232,0,29,0.25)" }
              : undefined
          }
        >
          Join waitlist
        </button>
        <button
          type="button"
          onClick={() => setTab("code")}
          className={`font-mono-ctv rounded-md px-4 py-3 text-[12px] font-bold uppercase tracking-[0.06em] transition-all hover:-translate-y-px ${
            tab === "code"
              ? "border border-[#E8001D] bg-transparent text-white"
              : "border border-[#2A2A2A] bg-transparent text-white/50 hover:border-[#3A3A3A] hover:text-white/70"
          }`}
        >
          I have a code
        </button>
      </div>

      {/* Input row — appears below active tab */}
      <form onSubmit={handleSubmit} className={`flex gap-2 ${align}`}>
        <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

        <input
          key={tab}
          type={tab === "waitlist" ? "email" : "text"}
          inputMode={tab === "waitlist" ? "email" : "text"}
          autoComplete={tab === "waitlist" ? "email" : "off"}
          spellCheck={false}
          autoCapitalize="off"
          placeholder={tab === "waitlist" ? "your@email.com" : "Enter your access code"}
          required
          value={tab === "waitlist" ? email : code}
          onChange={(e) =>
            tab === "waitlist" ? setEmail(e.target.value) : setCode(e.target.value)
          }
          className="font-mono-ctv w-64 rounded-md border border-[#2A2A2A] bg-[#0d0d0d] px-4 py-3.5 text-[13px] text-white placeholder-white/35 outline-none transition-colors focus:border-[#E8001D] disabled:opacity-50 sm:w-72"
        />

        <button
          type="submit"
          disabled={isPending}
          className="font-mono-ctv inline-flex items-center rounded-md px-6 py-3.5 text-[13px] font-bold uppercase tracking-[0.06em] text-white transition-colors hover:bg-[#FF1737] disabled:opacity-50"
          style={{ background: "#E8001D", boxShadow: "0 6px 24px rgba(232,0,29,0.22)" }}
        >
          {isPending ? "…" : tab === "waitlist" ? "Join" : "Unlock"}
        </button>
      </form>

      {tab === "waitlist" && (
        <p className={`font-mono-ctv mt-2 text-[10px] text-white/30 ${centered ? "text-center" : ""}`}>
          {primaryWallet?.address
            ? `Wallet ${primaryWallet.address.slice(0, 6)}…${primaryWallet.address.slice(-4)} will be linked.`
            : "Connect your wallet to link it (optional)."}
        </p>
      )}
    </div>
  );
}
