"use client";

import Image from "next/image";
import { Eyebrow } from "./Eyebrow";
import type { StreamerTokenView } from "./tokens";

interface TokenPickerSheetProps {
  open: boolean;
  selectedSymbol: string;
  tokens: StreamerTokenView[];
  /** Optional `symbol -> balance` map; when missing, the row hides balance. */
  balances?: Record<string, number | undefined>;
  onPick: (token: StreamerTokenView) => void;
  onClose: () => void;
}

const fmtTok = (n: number, dp: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });

/**
 * Full-modal overlay that lets the user pick a token. Mounted absolutely
 * inside `StreamerModalShell`'s scroll container so it covers the whole
 * modal body when open.
 */
export function TokenPickerSheet({
  open,
  selectedSymbol,
  tokens,
  balances,
  onPick,
  onClose,
}: TokenPickerSheetProps) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-[5] flex flex-col bg-[#0d0d0d]">
      <div className="flex items-center justify-between border-b border-[#1F1F1F] px-6 pb-4 pt-6">
        <Eyebrow>Stake with</Eyebrow>
        <button
          type="button"
          onClick={onClose}
          className="text-white/55 hover:text-white"
          aria-label="Close picker"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {tokens.map((tok) => {
          const isSel = tok.symbol === selectedSymbol;
          const balance = balances?.[tok.symbol];
          const dp = tok.symbol === "CHZ" ? 0 : 2;
          return (
            <button
              key={tok.symbol}
              type="button"
              onClick={() => onPick(tok)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                isSel ? "bg-[#E8001D]/10" : "hover:bg-white/5"
              }`}
            >
              {tok.logo ? (
                <Image
                  src={tok.logo}
                  alt=""
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover ring-1 ring-[#262626]"
                />
              ) : (
                <span
                  className="font-mono-ctv grid h-9 w-9 place-items-center rounded-full bg-[#161616] text-[10px] font-bold text-white/65 ring-1 ring-[#262626]"
                >
                  {tok.symbol.slice(0, 3)}
                </span>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-display text-[14px] font-bold text-white">
                    ${tok.symbol}
                  </span>
                  {tok.swapRouted && (
                    <span className="font-mono-ctv rounded border border-[#1F1F1F] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.18em] text-white/45">
                      via Kayen
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-white/45">{tok.name}</div>
              </div>

              {balance !== undefined && (
                <div className="text-right">
                  <div className="font-mono-ctv text-[12px] font-bold tabular-nums text-white">
                    {fmtTok(balance, dp)}
                  </div>
                </div>
              )}

              {isSel && <span className="ml-1 h-2 w-2 rounded-full bg-[#E8001D]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
