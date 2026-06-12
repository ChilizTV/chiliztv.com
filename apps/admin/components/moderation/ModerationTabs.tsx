'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { label: 'Review queue', href: '/moderation' },
  { label: 'Bans', href: '/moderation/bans' },
  { label: 'Config', href: '/moderation/config' },
];

export function ModerationTabs() {
  const pathname = usePathname();
  return (
    <div className="mt-6 flex gap-1 border-b border-[#1E1E1E]">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`font-mono-ctv -mb-px border-b-2 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${
              active
                ? 'border-[#E8001D] text-white'
                : 'border-transparent text-white/45 hover:text-white'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
