import type { OverviewActivityDto } from '@/lib/api/endpoints/overview';
import { Card } from '@/components/common/Card';
import { CardHead } from '@/components/common/CardHead';
import { EmptyState } from '@/components/common/EmptyState';
import { Icon, type IconName } from '@/components/common/Icon';

const ACTION_STYLE: Record<string, { icon: IconName; tone: string; label: string }> = {
  'moderation.ban.create': { icon: 'ban', tone: '#FF1737', label: 'Ban issued' },
  'moderation.ban.lift': { icon: 'check', tone: '#2dd4a4', label: 'Ban lifted' },
  'moderation.report.dismiss': { icon: 'check', tone: 'rgba(255,255,255,0.55)', label: 'Report dismissed' },
  'moderation.report.close': { icon: 'check', tone: '#2dd4a4', label: 'Report closed' },
  'moderation.action.reverse': { icon: 'rotateCcw', tone: '#F5C518', label: 'Action reversed' },
  'markets.contract.deploy': { icon: 'chart', tone: 'rgba(255,255,255,0.55)', label: 'Contract deployed' },
  'markets.markets.close': { icon: 'lock', tone: '#F5C518', label: 'Markets closed' },
  'config.report_config.update': { icon: 'pen', tone: '#F5C518', label: 'Policy config updated' },
};

function styleFor(action: string) {
  return ACTION_STYLE[action] ?? { icon: 'zap' as IconName, tone: 'rgba(255,255,255,0.55)', label: action };
}

function shortTarget(entry: OverviewActivityDto): string {
  const id = entry.targetId;
  return id.startsWith('0x') && id.length > 14 ? `${id.slice(0, 6)}…${id.slice(-4)}` : id;
}

export function ActivityFeedCard({ activity }: Readonly<{ activity: OverviewActivityDto[] }>) {
  return (
    <Card>
      <CardHead title="Recent activity" />
      {activity.length === 0 && (
        <EmptyState icon="file" title="No admin activity yet" hint="Bans, verdicts and deployments appear here as they happen." py="py-10" />
      )}
      {activity.map((entry) => {
        const s = styleFor(entry.action);
        return (
          <div key={`${entry.action}-${entry.at}-${entry.targetId}`} className="flex items-center gap-3 border-b border-[#1A1A1A] px-4 py-2.5 last:border-b-0">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-[#1E1E1E] bg-[#141414]" style={{ color: s.tone }}>
              <Icon n={s.icon} s={12} />
            </span>
            <span className="min-w-0 flex-1 truncate text-[12px] text-white/75">
              {s.label} <span className="font-mono-ctv text-[10px] text-white/40">{shortTarget(entry)}</span>
            </span>
            <span className="font-mono-ctv shrink-0 text-[10px] tabular-nums text-white/30">
              {new Date(entry.at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        );
      })}
    </Card>
  );
}
