/**
 * Formats a raw USDC 6dp integer string (bets aggregates) as "1,234.56".
 * String-sliced rather than Number-parsed — SUM() outputs can exceed 2^53.
 */
export function fmtUsdcRaw(raw: string): string {
  const negative = raw.startsWith('-');
  const digits = (negative ? raw.slice(1) : raw).replace(/\D/g, '') || '0';
  const padded = digits.padStart(7, '0');
  const whole = padded.slice(0, -6).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const cents = padded.slice(-6, -4);
  return `${negative ? '-' : ''}${whole}.${cents}`;
}

/** Formats a human-unit CHZ decimal string (donations/subs tables) as "12.34". */
export function fmtChz(value: string): string {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return '0.00';
  return parsed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Compact raw USDC 6dp for stat tiles — "184.5k" / "1.2M". Display only. */
export function fmtUsdcCompact(raw: string): string {
  const value = Number(raw) / 1e6;
  if (!Number.isFinite(value)) return '—';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return value.toFixed(value > 0 && value < 10 ? 2 : 0);
}
