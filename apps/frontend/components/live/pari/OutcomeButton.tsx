'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

interface OutcomeButtonProps {
  /** Outcome label shown in big condensed text. */
  label: string;
  /** Implied probability in [0, 1]. The bar fills to this fraction. */
  probability: number;
  /** Tailwind/css colour used for the active fill + outline. */
  accent: string;
  selected?: boolean;
  disabled?: boolean;
  /** When true, render the probability with a slightly muted price chip so the
   *  user knows it's an even-distribution placeholder (no real bets yet). */
  placeholder?: boolean;
  onClick?: () => void;
  /** Optional small sub-label (e.g. team-name hint). */
  sublabel?: string;
}

/**
 * Polymarket-style outcome button.
 *
 * Layout:
 *   ┌────────────────────────────────────┐
 *   │  HOME WIN              [ 0.62 ]    │  ← price chip Polymarket-style
 *   │  ████████████████░░░░░░░░░░░░░░░░  │  ← animated fill (spring)
 *   └────────────────────────────────────┘
 *
 * `probability` is spring-tweened with `useMotionValue` + `useSpring` so live
 * refetches glide smoothly between values instead of jumping. The bar fill
 * and the price chip animate from the same motion value so they stay in
 * lockstep — looks alive without any extra orchestration.
 *
 * When `placeholder` is true (`totalPool === 0` upstream), the price chip is
 * muted: the user sees the bar but understands the number is a default, not
 * a real market signal.
 */
export function OutcomeButton({
  label,
  probability,
  accent,
  selected,
  disabled,
  placeholder,
  onClick,
  sublabel,
}: OutcomeButtonProps) {
  const mv = useMotionValue(probability);
  const spring = useSpring(mv, { stiffness: 140, damping: 18, mass: 0.6 });
  // Polymarket displays prices as "0.62" (= 62¢). We mirror that — feels more
  // like a tradable price than a raw percentage.
  const priceText = useTransform(spring, (v) => formatPrice(v));
  const percentText = useTransform(spring, (v) => `${Math.round(clamp01(v) * 100)}%`);
  const fillWidth = useTransform(spring, (v) => `${clamp01(v) * 100}%`);

  useEffect(() => {
    mv.set(probability);
  }, [mv, probability]);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.02, y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 360, damping: 24 }}
      className="group relative w-full overflow-hidden rounded-lg text-left"
      style={{
        background: selected
          ? `${accent}1F`
          : `linear-gradient(180deg, #161616 0%, #101010 100%)`,
        border: `1px solid ${selected ? accent : '#2A2A2A'}`,
        color: '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        padding: '14px 16px 12px',
        fontFamily: "'Barlow', sans-serif",
        boxShadow: selected ? `0 0 32px -8px ${accent}` : 'none',
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div
            className="truncate text-[15px] font-bold uppercase tracking-[0.04em]"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {label}
          </div>
          {sublabel && (
            <div
              className="mt-0.5 text-[10px] uppercase tracking-[0.1em]"
              style={{ color: '#666' }}
            >
              {sublabel}
            </div>
          )}
        </div>

        {/* Polymarket-style price chip. Big, monospaced, accent-coloured. */}
        <div className="flex flex-shrink-0 items-baseline gap-1.5">
          <motion.span
            className="rounded-md px-2 py-0.5 text-[17px] font-bold tabular-nums"
            style={{
              background: placeholder ? '#1A1A1A' : `${accent}1F`,
              border: `1px solid ${placeholder ? '#2A2A2A' : `${accent}55`}`,
              color: placeholder ? '#888' : accent,
              fontFamily: "'JetBrains Mono', monospace",
              textShadow: selected && !placeholder ? `0 0 10px ${accent}` : 'none',
            }}
          >
            {priceText}
          </motion.span>
          <motion.span
            className="text-[10px] uppercase tracking-[0.12em]"
            style={{
              color: placeholder ? '#555' : '#888',
              fontFamily: "'Barlow', sans-serif",
            }}
          >
            {percentText}
          </motion.span>
        </div>
      </div>

      {/* Animated probability bar. */}
      <div
        className="mt-3 h-[6px] w-full overflow-hidden rounded-full"
        style={{ background: '#1E1E1E' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            width: fillWidth,
            background: placeholder
              ? 'linear-gradient(90deg, #333 0%, #444 100%)'
              : `linear-gradient(90deg, ${accent}cc 0%, ${accent} 100%)`,
            boxShadow: placeholder ? 'none' : `0 0 12px ${accent}80`,
          }}
        />
      </div>
    </motion.button>
  );
}

function clamp01(v: number): number {
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}

function formatPrice(v: number): string {
  return clamp01(v).toFixed(2);
}
