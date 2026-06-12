import { PageHeader } from '@/components/layout/PageHeader';
import { DirectoryTabs } from '@/components/directory/DirectoryTabs';
import { StreamersTable } from '@/components/directory/StreamersTable';

export default function StreamersPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Directory"
        title="Streamers"
        right={
          <span className="font-mono-ctv text-[10px] uppercase tracking-[0.14em] text-white/35">Revenue in CHZ</span>
        }
      />
      <DirectoryTabs />
      <StreamersTable />
    </div>
  );
}
