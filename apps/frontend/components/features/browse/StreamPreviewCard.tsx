"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye } from "lucide-react";
import { StreamPreview } from "@/types/browse.types";
import { formatViewers } from "@/components/features/streaming/utils";
import { supabase } from "@/lib/supabase";

interface StreamPreviewCardProps {
  stream: StreamPreview;
  matchId: number;
}

export function StreamPreviewCard({ stream, matchId }: StreamPreviewCardProps) {
  const router = useRouter();
  const [liveViewers, setLiveViewers] = useState(stream.viewers);
  const [liveThumbnailUrl, setLiveThumbnailUrl] = useState(stream.thumbnailUrl);

  useEffect(() => {
    const channel = supabase
      .channel(`stream-preview-${stream.streamId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'live_streams', filter: `id=eq.${stream.streamId}` },
        (payload: { new: { viewer_count?: number; thumbnail_url?: string | null } }) => {
          if (payload.new.viewer_count !== undefined) setLiveViewers(payload.new.viewer_count);
          if (payload.new.thumbnail_url !== undefined) setLiveThumbnailUrl(payload.new.thumbnail_url);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [stream.streamId]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/live/${matchId}?streamId=${stream.streamId}`);
  };

  const initials = stream.streamerName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <button
      onClick={handleClick}
      className="relative flex-shrink-0 w-40 h-24 rounded-xl overflow-hidden border border-zinc-700/50 hover:border-red-500/60 transition-all duration-200 group text-left"
    >
      {/* Background */}
      {liveThumbnailUrl ? (
        <Image
          src={liveThumbnailUrl}
          alt={stream.streamerName}
          fill
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 group-hover:from-red-950/30 transition-colors duration-200" />
      )}

      {/* LIVE badge */}
      <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
        LIVE
      </div>

      {/* Viewer count */}
      <div className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
        <Eye className="w-2.5 h-2.5" />
        {formatViewers(liveViewers)}
      </div>

      {/* Streamer bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-1.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-2 py-1.5">
        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
          {initials}
        </div>
        <p className="text-white text-[11px] font-medium truncate">{stream.streamerName}</p>
      </div>
    </button>
  );
}
