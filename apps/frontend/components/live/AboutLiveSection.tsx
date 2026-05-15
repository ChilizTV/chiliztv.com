"use client";

import { Heart, Gift, Star } from "lucide-react";
import { useIsFollowing, useFollowMutation, useUnfollowMutation } from "@/hooks/api";
import { StreamerSchedule, type ScheduledStream } from "./StreamerSchedule";

interface AboutLiveSectionProps {
  streamerId?: string;
  streamerName: string;
  title?: string;
  currentUserId?: string;
  streamerSchedule?: ScheduledStream[];
  onDonate?: () => void;
  onSubscribe?: () => void;
  /** When true, donate/subscribe affordances are hidden (own stream / no streamer). */
  hideStreamerActions?: boolean;
}

export function AboutLiveSection({
  streamerId,
  streamerName,
  title,
  currentUserId,
  streamerSchedule,
  onDonate,
  onSubscribe,
  hideStreamerActions = false,
}: AboutLiveSectionProps) {
  // Markets used to live here as a tab; they're now rendered prominently in
  // LiveDetailsPage via <PariMarketsList />. This section is just the streamer
  // schedule and follow controls.

  const canFollow = !!currentUserId && !!streamerId && currentUserId !== streamerId;

  const { data: isFollowing, isLoading: isLoadingFollow } = useIsFollowing(
    canFollow ? currentUserId : undefined,
    canFollow ? streamerId : undefined,
  );

  const followMutation = useFollowMutation(currentUserId);
  const unfollowMutation = useUnfollowMutation(currentUserId);

  const handleFollowClick = () => {
    if (!canFollow || !streamerId) return;
    if (isFollowing) {
      unfollowMutation.mutate({ streamerId });
    } else {
      followMutation.mutate({ streamerId, streamerName });
    }
  };

  const isMutating = followMutation.isPending || unfollowMutation.isPending;
  const initial = streamerName.charAt(0).toUpperCase();

  return (
    <div
      className="w-full rounded-lg overflow-hidden"
      style={{ background: "#141414", border: "1px solid #2A2A2A" }}
    >
      {/* Streamer row */}
      <div className="flex items-center gap-3 p-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-bold flex-shrink-0"
          style={{
            background: "#1E1E1E",
            border: "1px solid #2A2A2A",
            color: "#fff",
            fontFamily: "'Barlow Condensed', sans-serif",
          }}
        >
          {initial}
        </div>

        <div className="flex-1 min-w-0">
          <div
            className="text-[14px] font-bold truncate"
            style={{ color: "#fff", fontFamily: "'Barlow', sans-serif" }}
          >
            @{streamerName}
          </div>
          {title && (
            <p
              className="text-[12px] truncate mt-0.5"
              style={{ color: "#888", fontFamily: "'Barlow', sans-serif" }}
            >
              {title}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {!hideStreamerActions && onDonate && (
            <button
              onClick={onDonate}
              aria-label="Send a donation"
              className="w-9 h-9 rounded flex items-center justify-center transition-colors duration-150"
              style={{ background: "#1E1E1E", border: "1px solid #2A2A2A", color: "#888" }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "#E8001D";
                el.style.color = "#E8001D";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "#2A2A2A";
                el.style.color = "#888";
              }}
            >
              <Gift size={14} />
            </button>
          )}
          {!hideStreamerActions && onSubscribe && (
            <button
              onClick={onSubscribe}
              aria-label="Subscribe"
              className="w-9 h-9 rounded flex items-center justify-center transition-colors duration-150"
              style={{ background: "#1E1E1E", border: "1px solid #2A2A2A", color: "#888" }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "#F5C518";
                el.style.color = "#F5C518";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "#2A2A2A";
                el.style.color = "#888";
              }}
            >
              <Star size={14} />
            </button>
          )}
          <button
            onClick={handleFollowClick}
            disabled={!canFollow || isLoadingFollow || isMutating}
            className="flex items-center gap-1.5 px-3 h-9 rounded text-[11px] font-bold tracking-[0.08em] uppercase transition-colors duration-150"
            style={{
              background: !canFollow
                ? "#1E1E1E"
                : isFollowing
                  ? "rgba(232,0,29,0.12)"
                  : "#E8001D",
              border: !canFollow
                ? "1px solid #2A2A2A"
                : isFollowing
                  ? "1px solid rgba(232,0,29,0.4)"
                  : "1px solid #E8001D",
              color: !canFollow ? "#555" : isFollowing ? "#E8001D" : "#fff",
              cursor: canFollow ? "pointer" : "default",
              fontFamily: "'Barlow', sans-serif",
            }}
          >
            <Heart size={12} fill={isFollowing ? "currentColor" : "none"} />
            {isFollowing ? "Following" : "Follow"}
          </button>
        </div>
      </div>

      {/* Schedule */}
      <div style={{ borderTop: "1px solid #1E1E1E" }}>
        <StreamerSchedule
          streamerId={streamerId}
          streamerName={streamerName}
          schedule={streamerSchedule}
        />
      </div>
    </div>
  );
}
