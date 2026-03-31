"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ExternalLink, Users } from "lucide-react";
import type { Subscription } from "@/models/stream-wallet.model";
import type { FollowDto } from "@/lib/api/endpoints";
import { useUnfollowMutation } from "@/hooks/api";

interface FollowingTabProps {
  follows: FollowDto[];
  subscriptions: Subscription[];
  userId: string;
  isLoading?: boolean;
}

export function FollowingTab({ follows, subscriptions, userId, isLoading }: FollowingTabProps) {
  const router = useRouter();
  const unfollowMutation = useUnfollowMutation(userId || undefined);

  const handleUnfollow = (streamerId: string) => {
    unfollowMutation.mutate({ streamerId });
  };

  // Deduplicate subscribed streamers by address
  const subscribedStreamers = subscriptions.reduce<{ address: string; count: number }[]>((acc, sub) => {
    const existing = acc.find(s => s.address === sub.streamerAddress);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ address: sub.streamerAddress, count: 1 });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-6">
      {/* Followed Streamers */}
      <Card className="bg-[#0f0f0f] border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400" />
            Followed Streamers
            {follows.length > 0 && (
              <span className="text-sm font-normal text-gray-400">({follows.length})</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-white/60 text-center py-6">Loading...</p>
          ) : follows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Heart className="w-10 h-10 text-white/20 mb-3" />
              <p className="text-white/60 text-center text-sm">
                You are not following any streamers yet.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 bg-transparent border-white/20 text-white/80 hover:bg-white/10 hover:text-white"
                onClick={() => router.push("/live")}
              >
                Browse Matches
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {follows.map((follow) => (
                <div
                  key={follow.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {follow.streamerName.charAt(0).toUpperCase()}
                  </div>

                  {/* Name */}
                  <span className="text-white font-medium text-sm flex-1 truncate">
                    @{follow.streamerName}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent border-white/20 text-white/70 hover:bg-white/10 hover:text-white h-7 px-2 text-xs"
                      onClick={() => router.push("/live")}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View Lives
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent border-red-900/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 h-7 px-2 text-xs"
                      onClick={() => handleUnfollow(follow.streamerId)}
                      disabled={unfollowMutation.isPending}
                    >
                      Unfollow
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscribed Streamers */}
      <Card className="bg-[#0f0f0f] border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-yellow-400" />
            Subscribed Streamers
            {subscribedStreamers.length > 0 && (
              <span className="text-sm font-normal text-gray-400">({subscribedStreamers.length})</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscribedStreamers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Users className="w-10 h-10 text-white/20 mb-3" />
              <p className="text-white/60 text-center text-sm">No active subscriptions.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {subscribedStreamers.map(({ address, count }) => (
                <div
                  key={address}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    💎
                  </div>
                  <span className="text-white font-mono text-xs flex-1 truncate">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                  <span className="text-gray-400 text-xs flex-shrink-0">
                    {count} sub{count > 1 ? "s" : ""}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent border-white/20 text-white/70 hover:bg-white/10 hover:text-white h-7 px-2 text-xs flex-shrink-0"
                    onClick={() => router.push("/live")}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View Lives
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
