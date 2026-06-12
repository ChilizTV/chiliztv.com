import { PageHeader } from '@/components/layout/PageHeader';
import { DirectoryTabs } from '@/components/directory/DirectoryTabs';
import { StreamersTable } from '@/components/directory/StreamersTable';

export default function StreamersPage() {
  return (
    <div>
      <PageHeader eyebrow="Directory" title="Streamers" />
      <DirectoryTabs />
      <StreamersTable />
    </div>
  );
}
