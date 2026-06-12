export function LiveDot({ s = 6 }: Readonly<{ s?: number }>) {
  return (
    <span
      aria-hidden="true"
      className="live-dot inline-block shrink-0 rounded-full"
      style={{ width: s, height: s, background: '#E8001D' }}
    />
  );
}
