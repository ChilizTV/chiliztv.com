const MAP: Record<string, { color: string; label: string }> = {
  open:           { color: '#F5C518', label: 'Open' },
  auto_actioned:  { color: '#E8001D', label: 'Auto-actioned' },
  dismissed:      { color: 'rgba(255,255,255,0.45)', label: 'Dismissed' },
  closed:         { color: '#2dd4a4', label: 'Closed' },
  active:         { color: '#E8001D', label: 'Active' },
  expired:        { color: 'rgba(255,255,255,0.45)', label: 'Expired' },
  lifted_by_admin: { color: '#2dd4a4', label: 'Lifted' },
  lifted_by_appeal: { color: '#2dd4a4', label: 'Lifted (appeal)' },
};

export function StatusBadge({ status }: Readonly<{ status: string }>) {
  const m = MAP[status] ?? { color: 'rgba(255,255,255,0.45)', label: status };
  return (
    <span
      className="font-mono-ctv inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
      style={{ color: m.color, background: `${m.color}14`, border: `1px solid ${m.color}40` }}
    >
      <span className="h-[5px] w-[5px] rounded-full" style={{ background: m.color }} />
      {m.label}
    </span>
  );
}
