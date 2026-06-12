import { PageHeader } from '@/components/layout/PageHeader';
import { MatchesTable } from '@/components/directory/MatchesTable';

export default function MarketsPage() {
  return (
    <div>
      <PageHeader eyebrow="Markets" title="Matches &amp; markets" />
      <MatchesTable />
    </div>
  );
}
