/** Pure win-card primitives — tier/onomatopoeia, number + multiplier formatting,
 *  crowd flavour, team-code fallback. No I/O, no React. */

const PROTOCOL_FEE_FACTOR = 0.98; // 2% protocol fee — see fee copy / on-chain feeBps=200.

/** Tier escalates with the multiplier — drives onomatopoeia + card FX. */
export function winTier(mult: number): 1 | 2 | 3 | 4 {
  if (mult >= 10) return 4;
  if (mult >= 3) return 3;
  if (mult >= 2) return 2;
  return 1;
}

const ONOMATOPOEIA: Record<1 | 2 | 3 | 4, string> = {
  1: 'GG.',
  2: 'BOOM.',
  3: 'BOOOOM.',
  4: 'INSANE.',
};

export function winOnomatopoeia(mult: number): string {
  return ONOMATOPOEIA[winTier(mult)];
}

/** Thousands-grouped integer with an explicit comma — locale-independent so
 *  it can't drift between environments. */
export function fmtWinNum(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** ×4.7 below 10, ×124 at/above 10. */
export function fmtMult(mult: number): string {
  return mult < 10 ? mult.toFixed(1) : Math.round(mult).toString();
}

/**
 * Crowd flavour derived from the multiplier alone: at settlement,
 * mult = netPool / outcomePool, so the share that backed the winning outcome
 * ≈ (1 − fee) / mult. Low share ⇒ contrarian flex, high share ⇒ "you called it".
 */
export function winCrowd(mult: number): { pre: string; hi: string; post: string } {
  const sharePct = Math.min(99, Math.max(1, Math.round((PROTOCOL_FEE_FACTOR / mult) * 100)));
  if (sharePct <= 49) {
    return { pre: '', hi: `${100 - sharePct}%`, post: ' of bettors got it wrong' };
  }
  return { pre: 'You were in the ', hi: `${sharePct}%`, post: ' who called it' };
}

/** Fallback 3-letter code from a team name (no code is stored upstream). */
export function teamCode(name: string): string {
  const cleaned = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z]/g, '')
    .toUpperCase();
  return (cleaned.slice(0, 3) || '???').padEnd(3, '?');
}
