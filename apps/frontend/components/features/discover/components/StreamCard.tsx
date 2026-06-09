"use client";

import { useRouter } from "next/navigation";
import { BorderBeam, CardBody, CardContainer, CardItem } from "@chiliztv/ui";
import { fmtViewers, type StreamerCard } from "../domain";
import { fmtMatchScore } from "@chiliztv/domain/matches/format/matchScore";
import { LiveBadge } from "./LiveBadge";

/** Compact uppercase suffix for the score badge ("AET" / "PEN"), no parenthetical. */
function compactScoreSuffix(variant: ReturnType<typeof fmtMatchScore>['variant']): string | null {
  if (variant === 'aet') return 'AET';
  if (variant === 'pen') return 'PEN';
  return null;
}

const STREAM_GRADIENTS = [
  "linear-gradient(135deg,#1a0a2e 0%,#0d1b2a 100%)",
  "linear-gradient(135deg,#0d1b2a 0%,#16213e 100%)",
  "linear-gradient(135deg,#1c1a00 0%,#2d1200 100%)",
  "linear-gradient(135deg,#001a1a 0%,#0d2137 100%)",
  "linear-gradient(135deg,#1a001a 0%,#0a1628 100%)",
  "linear-gradient(135deg,#0a0a1a 0%,#1a0a0a 100%)",
];

/**
 * Stable hash → gradient. Same streamId always picks the same backdrop so
 * the cards don't flicker on re-render.
 */
function gradFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return STREAM_GRADIENTS[h % STREAM_GRADIENTS.length];
}

export function StreamCard({ stream }: { stream: StreamerCard }) {
  const router = useRouter();
  const initials = stream.streamerName.slice(0, 2).toUpperCase();

  // Navigates to the match page with this stream pre-selected via the
  // `streamId` query param — LiveDetailsPage reads it from `useSearchParams`
  // and passes it through `BrowseLivesCollapsible` → `StreamSelector` for
  // auto-selection.
  const goToStream = () =>
    router.push(`/live/${stream.matchId}?streamId=${stream.streamId}`);

  return (
    <CardContainer
      containerClassName="!py-0 !block"
      className="!block !w-full"
    >
      <CardBody className="!h-auto !w-full">
        <CardItem
          as="article"
          role="link"
          tabIndex={0}
          onClick={goToStream}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              goToStream();
            }
          }}
          className="group relative w-full cursor-pointer overflow-hidden rounded-xl border bg-[#111] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D]"
          style={{ borderColor: stream.featured ? "#E8001D" : "#1E1E1E" }}
          translateZ={20}
        >
          {/* Animated red beam tracing the border — featured (top) streamer only. */}
          {stream.featured && (
            <BorderBeam
              size={140}
              duration={8}
              colorFrom="#E8001D"
              colorTo="#FF1737"
            />
          )}

          <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
            <div
              className="absolute inset-0"
              style={{ background: gradFor(stream.streamId) }}
            >
              {stream.thumbnailUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={stream.thumbnailUrl}
                  alt={stream.streamerName}
                  className="h-full w-full object-cover"
                />
              )}
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                  backgroundSize: "200px",
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(232,0,29,0.25), transparent 70%)",
                }}
              />
            </div>

            <div className="absolute left-2.5 top-2.5">
              <LiveBadge small />
            </div>

            <div
              className="font-mono-ctv absolute right-2.5 top-2.5 flex items-center gap-1.5 rounded-md px-2 py-[3px] text-[10px] font-bold tracking-[0.06em] text-white"
              style={{
                background: "rgba(0,0,0,0.7)",
                border: "1px solid #1E1E1E",
                backdropFilter: "blur(4px)",
              }}
            >
              <span className="ctv-pulse-dot inline-block h-1 w-1 rounded-full bg-[#E8001D]" />
              {fmtViewers(stream.viewers)}
            </div>

            {stream.score && (() => {
              const fmt = fmtMatchScore({
                status: stream.status,
                score: stream.score,
                scoreBreakdown: stream.scoreBreakdown,
              });
              if (fmt.variant === 'none') return null;
              const aetPenPill = compactScoreSuffix(fmt.variant);
              return (
                <div
                  className="absolute inset-x-2.5 bottom-2.5 flex items-center justify-between gap-2 rounded-md border border-[#1E1E1E] bg-black/70 px-2.5 py-1.5"
                  style={{ backdropFilter: "blur(4px)" }}
                >
                  <span className="font-mono-ctv truncate text-[9px] font-bold uppercase tracking-[0.14em] text-white/65">
                    {stream.homeTeam}
                  </span>
                  <span className="flex shrink-0 items-baseline gap-1.5">
                    <span className="font-display text-[15px] font-extrabold leading-none tracking-[-0.01em] text-[#E8001D]">
                      {fmt.primary}
                    </span>
                    {aetPenPill && (
                      <span className="font-mono-ctv text-[8px] font-bold uppercase tracking-[0.14em] text-white/55">
                        {aetPenPill}
                      </span>
                    )}
                  </span>
                  <span className="font-mono-ctv truncate text-right text-[9px] font-bold uppercase tracking-[0.14em] text-white/65">
                    {stream.awayTeam}
                  </span>
                </div>
              );
            })()}
          </div>

          <div className="flex items-center gap-3 px-3.5 py-3">
            <div
              className="font-display flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-extrabold uppercase tracking-[0.05em] text-white"
              style={{
                background: stream.featured
                  ? "linear-gradient(135deg,#E8001D,#7a0010)"
                  : "linear-gradient(135deg,#252525,#141414)",
                border: `1px solid ${stream.featured ? "#E8001D" : "#2A2A2A"}`,
              }}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display truncate text-[15px] font-bold uppercase leading-none tracking-[-0.005em] text-white">
                {stream.streamerName}
              </div>
              <div className="font-mono-ctv mt-1 truncate text-[10px] uppercase tracking-[0.12em] text-white/45">
                {stream.leagueName}
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToStream();
              }}
              className="font-mono-ctv flex-shrink-0 rounded-md border border-[#2A2A2A] bg-transparent px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/65 transition-colors hover:border-[#E8001D] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D]"
            >
              Watch
            </button>
          </div>
        </CardItem>
      </CardBody>
    </CardContainer>
  );
}
