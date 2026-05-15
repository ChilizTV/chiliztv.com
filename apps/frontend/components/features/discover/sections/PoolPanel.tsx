"use client";

import { SectionHead } from "./SectionHead";

/**
 * Pool panel — disabled.
 *
 * This card showed TVL / utilisation / APY for the ERC-4626 LiquidityPool that
 * backed the legacy odds-based betting system. The pool was removed when the
 * stack moved to pari-mutuel — each match contract now holds its own escrow,
 * so there is no shared pool to surface.
 *
 * The card stays in /browse so the page layout is preserved; the body just
 * explains the change.
 */
export function PoolPanel() {
  return (
    <section className="space-y-3">
      <SectionHead title="Liquidity" lead="Retired with the pari-mutuel migration" />
      <div
        className="rounded-lg p-5 text-[12px] leading-relaxed"
        style={{
          background: "#0F0F0F",
          border: "1px dashed #2A2A2A",
          color: "#888",
          fontFamily: "'Barlow', sans-serif",
        }}
      >
        <p
          className="mb-2 text-[10px] uppercase tracking-[0.12em]"
          style={{ color: "#E8001D" }}
        >
          No shared pool anymore
        </p>
        <p>
          The platform moved from a single-pool odds book to pari-mutuel markets.
          Each match escrows its own USDC; winners split the net pool of their
          market at resolution. There is no LP position to take or yield to earn.
        </p>
      </div>
    </section>
  );
}
