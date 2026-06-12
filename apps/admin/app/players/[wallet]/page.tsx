import { PageHeader } from '@/components/layout/PageHeader';
import { PlayerDetailView } from '@/components/directory/PlayerDetailView';

export default async function PlayerDetailPage({
  params,
}: Readonly<{ params: Promise<{ wallet: string }> }>) {
  const { wallet } = await params;
  return (
    <div>
      <PageHeader eyebrow="Directory" title="Player" />
      <p className="font-mono-ctv mt-2 text-[11px] tracking-[0.04em] text-white/55">{wallet}</p>
      <PlayerDetailView wallet={wallet} />
    </div>
  );
}
