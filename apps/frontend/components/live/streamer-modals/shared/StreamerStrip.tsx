"use client";

interface StreamerStripProps {
  name: string;
  handle?: string;
  /** Optional avatar URL — falls back to a deterministic initial-block. */
  avatarUrl?: string;
}

/**
 * Compact streamer card slotted between the modal header and the form
 * body. Mirrors the design's "@handle · followers" strip but the
 * follower count and Live pill are dropped — they're not meaningful in
 * the donation/subscription context (the user is already on the live
 * page and viewer count is shown elsewhere).
 */
export function StreamerStrip({ name, handle, avatarUrl }: StreamerStripProps) {
  const initial = (name || "?").replace("@", "").slice(0, 2).toUpperCase();
  return (
    <div className="mx-7 mb-5 flex items-center gap-3 rounded-xl border border-[#1F1F1F] bg-[#111] p-3">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt=""
          className="h-10 w-10 rounded-full object-cover ring-1 ring-[#262626]"
        />
      ) : (
        <span
          className="font-display grid h-10 w-10 place-items-center rounded-full text-[14px] font-extrabold uppercase tracking-tight text-white ring-1 ring-[#262626]"
          style={{ background: "linear-gradient(135deg, #E8001D 0%, #7B0010 100%)" }}
        >
          {initial}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="font-display truncate text-[14px] font-bold leading-tight text-white">
          {name}
        </div>
        {handle && (
          <div className="font-mono-ctv truncate text-[10px] uppercase tracking-[0.16em] text-white/45">
            @{handle}
          </div>
        )}
      </div>

      <span className="font-mono-ctv inline-flex items-center gap-1 rounded-md border border-[#E8001D]/35 bg-[#E8001D]/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#E8001D]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#E8001D]" /> Live
      </span>
    </div>
  );
}
