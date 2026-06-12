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
