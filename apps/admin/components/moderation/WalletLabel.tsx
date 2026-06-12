export function WalletLabel({ wallet }: Readonly<{ wallet: string }>) {
  return (
    <span className="font-mono-ctv text-[11px] tracking-[0.04em] text-white/70" title={wallet}>
      {wallet.slice(0, 6)}…{wallet.slice(-4)}
    </span>
  );
}
