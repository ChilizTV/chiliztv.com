import { BackLink } from '@/components/common/BackLink';
import { ReportDetailView } from '@/components/moderation/ReportDetailView';

export default async function ReportDetailPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return (
    <div>
      <BackLink href="/moderation">Review queue</BackLink>
      <ReportDetailView id={id} />
    </div>
  );
}
