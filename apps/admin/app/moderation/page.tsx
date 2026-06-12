import { PageHeader } from '@/components/layout/PageHeader';
import { ModerationTabs } from '@/components/moderation/ModerationTabs';
import { ReportsQueue } from '@/components/moderation/ReportsQueue';

export default function ModerationPage() {
  return (
    <div>
      <PageHeader eyebrow="Moderation" title="Review queue" />
      <ModerationTabs />
      <ReportsQueue />
    </div>
  );
}
