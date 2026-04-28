"use client";

import { useEffect, useRef, useState } from "react";
import { Trophy } from "lucide-react";

const PRIZES = [
  { rank: "1st", amount: 20000, color: "#F5C518" },
  { rank: "2nd", amount: 15000, color: "#aaaaaa" },
  { rank: "3rd", amount: 10000, color: "#c87941" },
  { rank: "4–10th", amount: 5000, color: "#555" },
];

function AnimatedNumber({ target }: { target: number }) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const duration = 1400;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);

  return <>{display.toLocaleString()}</>;
}

export function MonthlyCashPrizePool() {
  const total = PRIZES.reduce((s, p) => s + p.amount, 0);

  return (
    <div
      className="rounded-lg overflow-hidden mt-8"
      style={{
        background: "#141414",
        border: "1px solid #2A2A2A",
        boxShadow: "0 0 48px rgba(245,197,24,0.04)",
      }}
    >
      {/* Gold accent line */}
      <div className="h-[2px]" style={{ background: "linear-gradient(90deg, #F5C518 0%, transparent 60%)" }} />

      <div className="flex flex-col lg:flex-row">
        {/* LEFT — hero total */}
        <div
          className="flex flex-col justify-between p-6 lg:p-8 lg:w-[280px] flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, rgba(245,197,24,0.06) 0%, transparent 70%)",
            borderRight: "1px solid #2A2A2A",
          }}
        >
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="w-8 h-8 rounded flex items-center justify-center"
                style={{ background: "rgba(245,197,24,0.12)" }}
              >
                <Trophy size={15} style={{ color: "#F5C518" }} />
              </div>
              <span
                className="text-[10px] font-semibold tracking-[0.14em] uppercase"
                style={{ color: "#555" }}
              >
                Monthly Prize Pool
              </span>
            </div>
            <div
              className="font-mono font-bold leading-none"
              style={{
                fontSize: "42px",
                color: "#F5C518",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              $<AnimatedNumber target={total} />
            </div>
            <p className="text-[12px] mt-3 leading-relaxed" style={{ color: "#555" }}>
              Rankings reset monthly. The more accurate your predictions, the higher you climb.
            </p>
          </div>
        </div>

        {/* RIGHT — prize breakdown */}
        <div className="flex-1 p-6 lg:p-8">
          <div
            className="text-[10px] font-semibold tracking-[0.12em] uppercase mb-5"
            style={{ color: "#555" }}
          >
            Prize Breakdown
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PRIZES.map((p) => (
              <div
                key={p.rank}
                className="rounded-lg p-4 flex flex-col gap-2"
                style={{ background: "#1E1E1E", border: "1px solid #2A2A2A" }}
              >
                <span
                  className="text-[10px] font-semibold tracking-[0.1em] uppercase"
                  style={{ color: "#555" }}
                >
                  {p.rank}
                </span>
                <span
                  className="font-mono text-[20px] font-bold leading-none"
                  style={{ color: p.color, fontFamily: "'JetBrains Mono', monospace" }}
                >
                  ${p.amount.toLocaleString()}
                </span>
                <span className="text-[10px]" style={{ color: "#444" }}>
                  per winner
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
