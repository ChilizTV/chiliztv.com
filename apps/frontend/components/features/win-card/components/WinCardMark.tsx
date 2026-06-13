/** PredCast brand mark — ring + core. Mono (white) on the jackpot ground. */
export function WinCardMark({ size = 48, mono = false }: Readonly<{ size?: number; mono?: boolean }>) {
  const ring = mono ? 'rgba(255,255,255,0.5)' : '#E8001D';
  const core = mono ? '#fff' : '#E8001D';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="41" fill="none" stroke={ring} strokeWidth="7" opacity="0.42" />
      <circle cx="50" cy="50" r="19" fill={core} />
    </svg>
  );
}
