"use client";

import { Heart } from "lucide-react";
import { formatLargeNumber } from "@/lib/utils/formatting/number";
import { useIsFollowing, useFollowMutation, useUnfollowMutation } from "@/hooks/api";

interface AboutLiveSectionProps {
  streamerId?: string;
  streamerName: string;
  title?: string;
  predictionsCount: number;
  messagesCount: number;
  currentUserId?: string;
  showAd?: boolean;
}

export function AboutLiveSection({
  streamerId,
  streamerName,
  title,
  predictionsCount,
  messagesCount,
  currentUserId,
  showAd = true,
}: AboutLiveSectionProps) {
  const canFollow = !!currentUserId && !!streamerId && currentUserId !== streamerId;

  const { data: isFollowing, isLoading: isLoadingFollow } = useIsFollowing(
    canFollow ? currentUserId : undefined,
    canFollow ? streamerId : undefined
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
    <div className="w-full space-y-4">

      {/* Streamer header row */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
          {initial}
        </div>

        {/* Name + title */}
        <div className="flex-1 min-w-0">
          <span className="text-white font-semibold text-sm">@{streamerName}</span>
          {title && (
            <p className="text-gray-400 text-xs italic truncate mt-0.5">{title}</p>
          )}
        </div>

        {/* Follow button */}
        <button
          onClick={handleFollowClick}
          disabled={!canFollow || isLoadingFollow || isMutating}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200 flex-shrink-0 ${
            !canFollow
              ? "bg-transparent border-gray-700 text-gray-600 cursor-default"
              : isFollowing
              ? "bg-red-500/20 border-red-500/60 text-red-400 hover:bg-red-500/10"
              : "bg-transparent border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white"
          }`}
        >
          <Heart
            className="w-3 h-3"
            fill={isFollowing ? "currentColor" : "none"}
          />
          {isFollowing ? "Following" : "Follow"}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-lg p-3 border border-green-500/20">
          <div className="text-green-400 text-xs font-medium">Live Predictions</div>
          <div className="text-white text-lg font-bold">{formatLargeNumber(predictionsCount)}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-lg p-3 border border-blue-500/20">
          <div className="text-blue-400 text-xs font-medium">Chat Messages</div>
          <div className="text-white text-lg font-bold">{formatLargeNumber(messagesCount)}</div>
        </div>
      </div>

      {/* Ad Placeholder */}
      {showAd && (
        <div className="w-full h-20 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center hover:border-gray-500 transition-colors cursor-pointer group">
          <div className="text-center">
            <div className="text-gray-400 text-sm font-medium group-hover:text-gray-300 transition-colors">
              Insert your ad here
            </div>
            <div className="text-gray-500 text-xs mt-1 group-hover:text-gray-400 transition-colors">
              400x80px • Contact us for advertising
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
