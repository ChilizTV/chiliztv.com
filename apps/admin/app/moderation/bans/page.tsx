import { PageHeader } from '@/components/layout/PageHeader';
import { ModerationTabs } from '@/components/moderation/ModerationTabs';
import { BansPanel } from '@/components/moderation/BansPanel';

export default function BansPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Moderation"
        title="Bans"
        right={
          <span className="font-mono-ctv text-[10px] uppercase tracking-[0.14em] text-white/35">
            Escalation 24h → 168h → permanent
          </span>
        }
      />
      <ModerationTabs />
      <BansPanel />
    </div>
  );
}
