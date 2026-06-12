import { PageHeader } from '@/components/layout/PageHeader';
import { DirectoryTabs } from '@/components/directory/DirectoryTabs';
import { PlayersTable } from '@/components/directory/PlayersTable';

export default function PlayersPage() {
  return (
    <div>
      <PageHeader eyebrow="Directory" title="Players" />
      <DirectoryTabs />
      <PlayersTable />
    </div>
  );
}
