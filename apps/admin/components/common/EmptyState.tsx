import { Icon, type IconName } from './Icon';

export function EmptyState({
  icon = 'shieldCheck',
  title,
  hint,
  action,
  py = 'py-12',
}: Readonly<{ icon?: IconName; title: string; hint?: string; action?: React.ReactNode; py?: string }>) {
  return (
    <div className={`flex flex-col items-center justify-center px-6 text-center ${py}`}>
      <div className="grid h-10 w-10 place-items-center rounded-lg border border-[#2A2A2A] text-white/30">
        <Icon n={icon} s={18} />
      </div>
      <p className="font-mono-ctv mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white/55">{title}</p>
      {hint && <p className="mt-1.5 max-w-[340px] text-[12px] font-light leading-relaxed text-white/35">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
