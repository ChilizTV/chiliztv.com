import { PageHeader } from '@/components/layout/PageHeader';
import { ModerationTabs } from '@/components/moderation/ModerationTabs';
import { ConfigForm } from '@/components/moderation/ConfigForm';

export default function ConfigPage() {
  return (
    <div>
      <PageHeader eyebrow="Moderation" title="Policy config" />
      <ModerationTabs />
      <ConfigForm />
    </div>
  );
}
