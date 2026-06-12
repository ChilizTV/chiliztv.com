import { BackLink } from '@/components/common/BackLink';
import { PlayerDetailView } from '@/components/directory/PlayerDetailView';

export default async function PlayerDetailPage({
  params,
}: Readonly<{ params: Promise<{ wallet: string }> }>) {
  const { wallet } = await params;
  return (
    <div>
      <BackLink href="/players">Players</BackLink>
      <PlayerDetailView wallet={wallet} />
    </div>
  );
}
