import type { CSSProperties } from 'react';

import styles from './WinCard.module.css';

const RED = '#E8001D';
const GOLD = '#F5C518';

type RayCSS = CSSProperties & Record<'--rot' | '--o' | '--d' | '--shift', string>;
type PieceCSS = CSSProperties & Record<'--rot' | '--o' | '--d' | '--dur', string>;

/** Radial glow behind the hero — intensity escalates with the tier. */
export function WinHalo({ tier }: Readonly<{ tier: 1 | 2 | 3 | 4 }>) {
  const a = { 1: 0.22, 2: 0.4, 3: 0.55, 4: 0.5 }[tier];
  const color = tier === 4 ? `rgba(255,80,40,${a})` : `rgba(232,0,29,${a})`;
  return (
    <div
      className={styles.halo}
      style={{ background: `radial-gradient(72% 46% at 50% 34%, ${color} 0%, rgba(232,0,29,0) 70%)` }}
    />
  );
}

const RAY_LAYOUTS: Record<2 | 3 | 4, ReadonlyArray<{ top: number; left?: number; right?: number; w: number; rot: number; o: number; d: number }>> = {
  2: [
    { top: 16, left: -6, w: 34, rot: -16, o: 0.3, d: 0.15 },
    { top: 30, right: -8, w: 40, rot: 14, o: 0.38, d: 0.25 },
    { top: 52, left: -10, w: 30, rot: -12, o: 0.22, d: 0.35 },
  ],
  3: [
    { top: 10, left: -8, w: 42, rot: -18, o: 0.4, d: 0.1 },
    { top: 20, right: -10, w: 48, rot: 16, o: 0.5, d: 0.18 },
    { top: 33, left: -12, w: 36, rot: -14, o: 0.32, d: 0.26 },
    { top: 44, right: -6, w: 38, rot: 12, o: 0.4, d: 0.34 },
    { top: 56, left: -8, w: 30, rot: -10, o: 0.22, d: 0.42 },
    { top: 7, right: -14, w: 34, rot: 20, o: 0.28, d: 0.3 },
  ],
  4: [
    { top: 7, left: -8, w: 46, rot: -20, o: 0.5, d: 0.08 },
    { top: 14, right: -12, w: 52, rot: 18, o: 0.6, d: 0.14 },
    { top: 24, left: -14, w: 40, rot: -16, o: 0.45, d: 0.2 },
    { top: 33, right: -8, w: 44, rot: 14, o: 0.55, d: 0.26 },
    { top: 43, left: -10, w: 36, rot: -12, o: 0.35, d: 0.32 },
    { top: 52, right: -12, w: 40, rot: 12, o: 0.42, d: 0.38 },
    { top: 62, left: -8, w: 30, rot: -10, o: 0.26, d: 0.44 },
    { top: 4, right: -18, w: 36, rot: 24, o: 0.32, d: 0.36 },
  ],
};

export function WinRays({ tier }: Readonly<{ tier: 1 | 2 | 3 | 4 }>) {
  if (tier === 1) return null;
  const layout = RAY_LAYOUTS[tier];
  const grad =
    tier === 4
      ? 'linear-gradient(90deg, rgba(245,197,24,0) 0%, rgba(245,197,24,0.85) 45%, rgba(255,255,255,0.5) 60%, rgba(245,197,24,0) 100%)'
      : 'linear-gradient(90deg, rgba(232,0,29,0) 0%, rgba(232,0,29,0.9) 50%, rgba(232,0,29,0) 100%)';
  return (
    <div className={styles.rays} aria-hidden="true">
      {layout.map((r, i) => (
        <span
          key={i}
          className={styles.ray}
          style={
            {
              top: `${r.top}%`,
              left: r.left != null ? `${r.left}%` : 'auto',
              right: r.right != null ? `${r.right}%` : 'auto',
              width: `${r.w}%`,
              background: grad,
              '--rot': `${r.rot}deg`,
              '--o': `${r.o}`,
              '--d': `${r.d}s`,
              '--shift': `${r.left != null ? -180 : 180}px`,
            } as RayCSS
          }
        />
      ))}
    </div>
  );
}

function seeded(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export function WinConfetti({ tier, seed }: Readonly<{ tier: 1 | 2 | 3 | 4; seed: number }>) {
  const count = tier === 4 ? 44 : 24;
  const palette = tier === 4 ? [GOLD, GOLD, '#fff', '#FFDD66'] : [RED, RED, GOLD, '#fff'];
  const r = seeded(seed);
  const pieces = Array.from({ length: count }, () => ({
    left: r() * 96 + 2,
    top: 3 + r() * 58,
    s: 8 + r() * 13,
    rot: Math.round(r() * 360),
    c: palette[Math.floor(r() * palette.length)],
    o: 0.22 + r() * 0.45,
    d: (0.35 + r() * 0.7).toFixed(2),
    dur: (0.8 + r() * 0.9).toFixed(2),
  }));
  return (
    <div className={styles.confetti} aria-hidden="true">
      {pieces.map((p, i) => (
        <i
          key={i}
          style={
            {
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.s,
              height: Math.max(4, p.s * 0.42),
              background: p.c,
              '--rot': `${p.rot}deg`,
              '--o': `${p.o}`,
              '--d': `${p.d}s`,
              '--dur': `${p.dur}s`,
            } as PieceCSS
          }
        />
      ))}
    </div>
  );
}
