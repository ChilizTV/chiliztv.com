import { PageHeader } from '@/components/layout/PageHeader';
import { ModerationTabs } from '@/components/moderation/ModerationTabs';
import { BansPanel } from '@/components/moderation/BansPanel';

export default function BansPage() {
  return (
    <div>
      <PageHeader eyebrow="Moderation" title="Bans" />
      <ModerationTabs />
      <BansPanel />
    </div>
  );
}
