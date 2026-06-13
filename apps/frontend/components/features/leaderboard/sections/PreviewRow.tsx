import { MEDAL_PALETTE } from '../domain/medals';
import type { PreviewRow as PreviewRowData } from '../domain/data';
import { AddressLabel, RankMedal } from '../primitives';
import { UserBadge } from '@/components/shared/UserBadge';

interface PreviewRowProps {
    row: PreviewRowData;
}

const COLS = '44px minmax(0,1.7fr) minmax(0,1fr) minmax(0,1.05fr)';

/**
 * One row of the preview leaderboard table. Column widths match the
 * header in `PreviewTable` so they stay aligned.
 */
export function PreviewRow({ row }: PreviewRowProps) {
    const palette = row.medal ? MEDAL_PALETTE[row.medal] : null;
    return (
        <div
            className="grid items-center gap-3 border-b border-[#1A1A1A] px-5 py-3.5 transition-colors hover:bg-white/[0.015]"
            style={{
                gridTemplateColumns: COLS,
                background: palette?.bg ?? 'transparent',
            }}
        >
            {/* rank */}
            <div className="font-mono-ctv text-[12px] font-bold tabular-nums text-white/45">
                {String(row.rank).padStart(2, '0')}
            </div>

            {/* who */}
            <div className="flex min-w-0 items-center gap-3">
                <RankMedal medal={row.medal} rank={row.rank} />
                <UserBadge
                    walletAddress={row.walletAddress}
                    profile={{ username: row.username, avatarUrl: row.avatarUrl }}
                    size={28}
                    avatarOnly
                />
                <span className="min-w-0 truncate">
                    <AddressLabel who={row.who} medal={row.medal} />
                </span>
            </div>

            {/* pnl — explicit `en-US` locale so server (Node) and client
                (browser) agree on the thousands separator. Without it,
                `toLocaleString()` picks the runtime locale and the SSR
                output (`12 480`) mismatches the browser (`12,480`). */}
            <div className="font-mono-ctv text-[14px] font-semibold tabular-nums text-[#2dd4a4]">
                +${row.pnl.toLocaleString('en-US')}
            </div>

            {/* tier label — medal name only; the absolute share is pro-rata, not a fixed %. */}
            <div className="text-right">
                {row.medal === 'gold' && (
                    <span
                        className="font-mono-ctv text-[11px] font-bold uppercase tracking-[0.18em]"
                        style={{ color: '#F5C518' }}
                    >
                        Gold
                    </span>
                )}
                {row.medal === 'silver' && (
                    <span
                        className="font-mono-ctv text-[11px] font-bold uppercase tracking-[0.18em]"
                        style={{ color: '#D8D8DC' }}
                    >
                        Silver
                    </span>
                )}
                {row.medal === 'bronze' && (
                    <span
                        className="font-mono-ctv text-[11px] font-bold uppercase tracking-[0.18em]"
                        style={{ color: '#C8794B' }}
                    >
                        Bronze
                    </span>
                )}
                {row.medal === 'honor' && (
                    <span className="font-mono-ctv text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">
                        Top 10
                    </span>
                )}
                {!row.medal && (
                    <span className="font-mono-ctv text-[11px] font-bold uppercase tracking-[0.18em] text-white/35">
                        —
                    </span>
                )}
            </div>
        </div>
    );
}

export const PREVIEW_COLS = COLS;
