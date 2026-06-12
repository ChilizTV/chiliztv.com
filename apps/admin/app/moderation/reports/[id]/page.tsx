import { PageHeader } from '@/components/layout/PageHeader';
import { ModerationTabs } from '@/components/moderation/ModerationTabs';
import { ReportDetailView } from '@/components/moderation/ReportDetailView';

export default async function ReportDetailPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return (
    <div>
      <PageHeader eyebrow="Moderation" title="Report" />
      <ModerationTabs />
      <ReportDetailView id={id} />
    </div>
  );
}
