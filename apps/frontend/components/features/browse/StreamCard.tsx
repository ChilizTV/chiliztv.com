"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";

export interface StreamCardData {
  streamId: string;
  streamerName: string;
  thumbnailUrl: string | null;
  viewers: number;
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  score: { home: number; away: number } | null;
  featured?: boolean;
}

/* Deterministic gradient from streamId — no randomness on render */
const GRADIENTS = [
  "linear-gradient(135deg, #1a0a2e 0%, #0d1b2a 100%)",
  "linear-gradient(135deg, #0d1b2a 0%, #16213e 100%)",
  "linear-gradient(135deg, #1c1a00 0%, #2d1200 100%)",
  "linear-gradient(135deg, #001a1a 0%, #0d2137 100%)",
  "linear-gradient(135deg, #1a001a 0%, #0a1628 100%)",
  "linear-gradient(135deg, #0a0a1a 0%, #1a0a0a 100%)",
];

function gradientFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

function formatViewers(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function StreamCard({ stream }: { stream: StreamCardData }) {
  const router = useRouter();
  const [watching, setWatching] = useState(false);
  const initials = stream.streamerName.slice(0, 2).toUpperCase();

  return (
    <article
      className="rounded-lg overflow-hidden cursor-pointer transition-all duration-150"
      style={{
        background: "#141414",
        border: `1px solid ${stream.featured ? "#E8001D" : "#2A2A2A"}`,
      }}
      onClick={() => router.push(`/live/${stream.matchId}`)}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        if (!stream.featured) el.style.borderColor = "#3A3A3A";
        el.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        if (!stream.featured) el.style.borderColor = "#2A2A2A";
        el.style.transform = "translateY(0)";
      }}
    >
      {/* Thumbnail — 16:9 */}
      <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
        <div
          className="absolute inset-0"
          style={{
            background: stream.thumbnailUrl ? undefined : gradientFor(stream.streamId),
          }}
        >
          {stream.thumbnailUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={stream.thumbnailUrl}
              alt={stream.streamerName}
              className="w-full h-full object-cover"
            />
          )}

          {/* Red noise overlay — adds texture to gradients */}
          {!stream.thumbnailUrl && (
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                backgroundSize: "200px",
              }}
            />
          )}
        </div>

        {/* LIVE badge — top left */}
        <div className="absolute top-2 left-2">
          <span
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-[0.08em]"
            style={{ background: "#E8001D", color: "#fff" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0"
              style={{ animation: "pulse 1.4s infinite" }}
            />
            LIVE
          </span>
        </div>

        {/* Viewer count — top right */}
        <div
          className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded"
          style={{ background: "rgba(0,0,0,0.72)" }}
        >
          <Eye size={9} style={{ color: "#E8001D" }} />
          <span
            className="text-[10px] font-bold text-white"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {formatViewers(stream.viewers)}
          </span>
        </div>

        {/* Score bar — bottom of thumbnail (live only) */}
        {stream.score !== null && (
          <div
            className="absolute bottom-0 left-0 right-0 flex items-center justify-center py-1.5 gap-2"
            style={{ background: "rgba(0,0,0,0.78)" }}
          >
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.05em]"
              style={{ color: "#888", fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {stream.homeTeam}
            </span>
            <span
              className="font-mono text-[13px] font-bold text-white"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {stream.score.home} — {stream.score.away}
            </span>
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.05em]"
              style={{ color: "#888", fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {stream.awayTeam}
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-white"
          style={{
            background: stream.featured ? "#E8001D" : "#252525",
            border: `1.5px solid ${stream.featured ? "#E8001D" : "#3A3A3A"}`,
          }}
        >
          {initials}
        </div>

        {/* Name + match */}
        <div className="flex-1 min-w-0">
          <div
            className="text-[13px] font-bold text-white truncate"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {stream.streamerName}
          </div>
          <div className="text-[11px] truncate" style={{ color: "#888" }}>
            {stream.homeTeam} vs {stream.awayTeam}
          </div>
        </div>

        {/* Watch CTA */}
        <button
          className="flex-shrink-0 px-3 py-1.5 rounded text-[10px] font-bold tracking-[0.07em] uppercase transition-colors duration-150"
          style={{
            background: watching || stream.featured ? "#E8001D" : "transparent",
            border: `1px solid ${watching || stream.featured ? "#E8001D" : "#3A3A3A"}`,
            color: watching || stream.featured ? "#fff" : "#888",
          }}
          onClick={(e) => {
            e.stopPropagation();
            setWatching((w) => !w);
          }}
          onMouseEnter={(e) => {
            if (!watching && !stream.featured)
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#888";
          }}
          onMouseLeave={(e) => {
            if (!watching && !stream.featured)
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#3A3A3A";
          }}
        >
          {watching ? "Watching" : "Watch"}
        </button>
      </div>
    </article>
  );
}
