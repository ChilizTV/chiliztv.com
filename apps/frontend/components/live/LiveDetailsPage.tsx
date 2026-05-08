"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ChatPanel } from "./chat";
import {
  VideoPlayer,
  StreamWalletButton,
  StreamSubscriptionButton,
  AboutLiveSection,
  BrowseLivesCollapsible,
  StartStreamCollapsible,
  MatchScoreDisplay,
} from ".";
import type { Address } from "viem";
import { useMatch } from "@/hooks/api";
import { LiveStream } from "@/models/stream.model";

interface LiveDetailsPageProps {
  readonly id: string;
}

export default function LiveDetailsPage({ id }: LiveDetailsPageProps) {
  const router = useRouter();
  const { primaryWallet, user } = useDynamicContext();
  const { data: matchData, isLoading: loading, error: queryError } = useMatch(id);

  const searchParams = useSearchParams();
  const initialStreamId = searchParams.get("streamId") ?? undefined;

  const walletAddress = primaryWallet?.address ?? "";

  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [myStream, setMyStream] = useState<LiveStream | null>(null);
  const [browseLivesOpen, setBrowseLivesOpen] = useState(false);
  const [showDonationDialog, setShowDonationDialog] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [streamerPreviewEl, setStreamerPreviewEl] = useState<HTMLDivElement | null>(null);

  const isStreamer = !!myStream && !!user?.userId;
  const chatStreamId = myStream?.id ?? selectedStream?.id;

  // Donation/subscription dialogs require a real on-chain streamer wallet.
  const streamForDonateSubscribe =
    selectedStream?.streamerWalletAddress ? selectedStream : null;

  const handleStreamSelect = (stream: LiveStream) => setSelectedStream(stream);

  const handleStreamCreated = (stream: LiveStream) => {
    setSelectedStream(stream);
    setMyStream(stream);
  };

  const handleStreamEnded = () => {
    setSelectedStream(null);
    setMyStream(null);
  };

  if (!id) return null;

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-full"
        style={{ background: "#0A0A0A", color: "#fff" }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: "#E8001D" }} />
          <p style={{ color: "#888", fontFamily: "'Barlow', sans-serif" }}>Loading match…</p>
        </div>
      </div>
    );
  }

  if (queryError || !matchData) {
    return (
      <div
        className="flex items-center justify-center h-full"
        style={{ background: "#0A0A0A", color: "#fff" }}
      >
        <div className="text-center">
          <p
            className="mb-4 text-[14px] tracking-[0.08em] uppercase"
            style={{ color: "#E8001D", fontFamily: "'Barlow', sans-serif" }}
          >
            No match found
          </p>
          <button
            onClick={() => router.push("/browse")}
            className="px-4 py-2 rounded text-[12px] font-bold tracking-[0.08em] uppercase transition-colors duration-150"
            style={{ background: "#E8001D", color: "#fff", fontFamily: "'Barlow', sans-serif" }}
          >
            Back to matches
          </button>
        </div>
      </div>
    );
  }

  const isOwnSelectedStream =
    !!selectedStream &&
    selectedStream.streamerWalletAddress?.toLowerCase() === walletAddress?.toLowerCase();

  return (
    <div className="flex flex-col md:flex-row h-full" style={{ background: "#0A0A0A", color: "#fff" }}>
      {/* MAIN COLUMN */}
      <div className="flex-1 flex flex-col overflow-hidden md:overflow-y-auto">
        {/* Header bar */}
        <div
          className="flex items-center gap-3 px-4 sm:px-6 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid #1E1E1E", background: "#0A0A0A" }}
        >
          <button
            onClick={() => router.push("/live")}
            aria-label="Back to live matches"
            className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 transition-colors duration-150"
            style={{ background: "#141414", border: "1px solid #2A2A2A", color: "#888" }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = "#3A3A3A";
              el.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = "#2A2A2A";
              el.style.color = "#888";
            }}
          >
            <ArrowLeft size={14} />
          </button>

          <div className="flex-1 min-w-0">
            <MatchScoreDisplay
              homeTeam={matchData.homeTeam}
              awayTeam={matchData.awayTeam}
              homeScore={matchData.homeScore ?? 0}
              awayScore={matchData.awayScore ?? 0}
              homeLogo={matchData.homeTeamLogo}
              awayLogo={matchData.awayTeamLogo}
              status={matchData.status}
              kickoffAt={matchData.startTime}
              leagueName={matchData.league}
            />
          </div>
        </div>

        {/* Action chips */}
        <div className="flex items-center gap-2 px-4 sm:px-6 py-3 flex-shrink-0">
          <BrowseLivesCollapsible
            matchId={parseInt(id)}
            selectedStreamId={selectedStream?.id}
            onStreamSelect={handleStreamSelect}
            onOwnStreamDetected={(stream) => {
              setMyStream(stream);
              setSelectedStream((prev) => {
                if (stream && prev === null) return stream;
                if (!stream && prev?.streamerId === user?.userId) return null;
                return prev;
              });
            }}
            currentUserId={user?.userId}
            initialStreamId={initialStreamId}
            isOpen={browseLivesOpen}
            onOpenChange={setBrowseLivesOpen}
          />
          <StartStreamCollapsible
            matchId={parseInt(id)}
            onStreamCreated={handleStreamCreated}
            onStreamEnded={handleStreamEnded}
            portalTarget={isStreamer ? streamerPreviewEl : null}
          />
        </div>

        {/* Video + about */}
        <div className="px-4 sm:px-6 pb-6 space-y-4">
          <div
            className="rounded-lg overflow-hidden"
            style={{ background: "#141414", border: "1px solid #2A2A2A" }}
          >
            {isStreamer ? (
              <div
                ref={setStreamerPreviewEl}
                className="w-full aspect-video bg-black overflow-hidden relative"
              />
            ) : (
              <VideoPlayer
                stream={selectedStream}
                autoplay={true}
                showControls={true}
                onStreamEnded={handleStreamEnded}
                onBrowseStreams={() => setBrowseLivesOpen(true)}
              />
            )}
          </div>

          <AboutLiveSection
            streamerId={selectedStream?.streamerId}
            streamerName={selectedStream?.streamerName || "No stream selected"}
            title={selectedStream?.title}
            currentUserId={user?.userId}
            bettingContractAddress={matchData.contractAddress as Address | undefined}
            walletAddress={walletAddress || undefined}
            homeTeam={matchData.homeTeam}
            awayTeam={matchData.awayTeam}
            onDonate={
              streamForDonateSubscribe ? () => setShowDonationDialog(true) : undefined
            }
            onSubscribe={
              streamForDonateSubscribe ? () => setShowSubscriptionDialog(true) : undefined
            }
            hideStreamerActions={isOwnSelectedStream || !selectedStream}
          />

          {/* Mobile-only chat — fixed at viewport height so the message list scrolls inside */}
          <div className="md:hidden">
            <div
              className="rounded-lg overflow-hidden flex flex-col"
              style={{
                background: "#141414",
                border: "1px solid #2A2A2A",
                height: "min(70dvh, 640px)",
              }}
            >
              <ChatPanel
                matchId={id}
                streamId={chatStreamId}
                userId={user?.userId ?? ""}
                username={String(user?.username ?? "")}
                walletAddress={walletAddress}
                headerProps={{
                  onOpenDonation: () => setShowDonationDialog(true),
                  onOpenSubscription: () => setShowSubscriptionDialog(true),
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP SIDEBAR — chat anchored to viewport height */}
      <aside
        className="hidden md:flex w-full md:w-[400px] flex-col h-full overflow-hidden"
        style={{ background: "#0A0A0A", borderLeft: "1px solid #1E1E1E" }}
      >
        <div className="h-[2px]" style={{ background: "linear-gradient(90deg, #E8001D 0%, transparent 60%)" }} />
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <ChatPanel
            matchId={id}
            streamId={selectedStream?.id}
            userId={user?.userId ?? ""}
            username={String(user?.username ?? "")}
            walletAddress={walletAddress}
            headerProps={{
              onOpenDonation: () => setShowDonationDialog(true),
              onOpenSubscription: () => setShowSubscriptionDialog(true),
            }}
          />
        </div>
      </aside>

      {streamForDonateSubscribe && (
        <StreamWalletButton
          streamerAddress={streamForDonateSubscribe.streamerWalletAddress as Address}
          isStreamer={
            walletAddress?.toLowerCase() ===
            streamForDonateSubscribe.streamerWalletAddress?.toLowerCase()
          }
          open={showDonationDialog}
          onOpenChange={setShowDonationDialog}
        />
      )}

      {streamForDonateSubscribe && (
        <StreamSubscriptionButton
          streamerAddress={streamForDonateSubscribe.streamerWalletAddress as Address}
          isStreamer={
            walletAddress?.toLowerCase() ===
            streamForDonateSubscribe.streamerWalletAddress?.toLowerCase()
          }
          open={showSubscriptionDialog}
          onOpenChange={setShowSubscriptionDialog}
        />
      )}
    </div>
  );
}
