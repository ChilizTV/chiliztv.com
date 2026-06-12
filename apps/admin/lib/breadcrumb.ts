/** Pure pathname → topbar breadcrumb mapping. */
export function breadcrumbFor(pathname: string): { section: string; page: string } {
  if (pathname === '/') return { section: 'Operations', page: 'Dashboard' };
  if (pathname.startsWith('/moderation/reports/')) return { section: 'Moderation', page: 'Report detail' };
  if (pathname === '/moderation/bans') return { section: 'Moderation', page: 'Bans' };
  if (pathname === '/moderation/config') return { section: 'Moderation', page: 'Config' };
  if (pathname.startsWith('/moderation')) return { section: 'Moderation', page: 'Review queue' };
  if (pathname === '/players/streamers') return { section: 'Directory', page: 'Streamers' };
  if (pathname.startsWith('/players/')) return { section: 'Directory', page: 'Player detail' };
  if (pathname.startsWith('/players')) return { section: 'Directory', page: 'Players' };
  if (pathname.startsWith('/markets')) return { section: 'Operations', page: 'Markets' };
  return { section: 'Operations', page: 'Admin' };
}
