import { Card } from './Card';
import { Icon, type IconName } from './Icon';
import { LiveDot } from './LiveDot';

interface StatTileProps {
  readonly label: string;
  readonly value: string;
  readonly icon?: IconName;
  readonly tone?: string;
  readonly sub?: string;
  readonly subTone?: string;
  readonly live?: boolean;
}

export function StatTile({
  label,
  value,
  icon = 'chart',
  tone = '#fff',
  sub,
  subTone = 'rgba(255,255,255,0.3)',
  live = false,
}: Readonly<StatTileProps>) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <span className="font-mono-ctv text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">{label}</span>
        {live ? <LiveDot /> : <Icon n={icon} s={14} className="text-white/20" />}
      </div>
      <div className="font-display mt-2.5 text-[36px] font-extrabold leading-none tabular-nums tracking-[-0.01em]" style={{ color: tone }}>
        {value}
      </div>
      {sub && (
        <div className="font-mono-ctv mt-2.5 text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: subTone }}>
          {sub}
        </div>
      )}
    </Card>
  );
}
