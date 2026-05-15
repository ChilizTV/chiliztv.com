"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useMemo, useState } from "react";
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
import { PariMarketsList } from "./pari";
import type { Address } from "viem";
import { useMatch } from "@/hooks/api";
import { usePariMatchFactory } from "@/hooks/usePariMatchFactory";
import { useFootballPariMatchReadMatchName } from "@/lib/contracts/generated";
import { chilizConfig } from "@/config/chiliz.config";
import { LiveStream } from "@/models/stream.model";
import type { Match } from "@/types/api.types";

interface LiveDetailsPageProps {
  readonly id: string;
}

const TEST_MATCH_ID = "999999";

/**
 * Live match page: video stream + chat + pari-mutuel betting panel.
 *
 * Two data sources, picked by the route id:
 *   - id === "999999"   → test match. Bind to PariMatchFactory.getAllMatches().at(-1).
 *   - any other numeric → real backend `useMatch(id)` lookup.
 */
export default function LiveDetailsPage({ id }: LiveDetailsPageProps) {
  const router = useRouter();
  const { primaryWallet, user } = useDynamicContext();

  const isTestMatch = id === TEST_MATCH_ID;

  // ── Backend-API path (real matches) ──────────────────────────────────────
  const {
    data: matchDataFromApi,
    isLoading: loadingFromApi,
    error: queryError,
  } = useMatch(isTestMatch ? "" : id);

  // ── On-chain path (test match → newest factory deployment) ───────────────
  const {
    factoryAddress,
    allMatches,
    latestMatch: latestProxy,
    sportType,
    loadingMatches,
    matchesError,
  } = usePariMatchFactory({ matchAddress: undefined, enabled: isTestMatch });

  const { data: onChainMatchName } = useFootballPariMatchReadMatchName({
    address: latestProxy,
    chainId: chilizConfig.chainId,
    query: { enabled: isTestMatch && !!latestProxy },
  });

  const onChainMatchData = useMemo<Match | undefined>(() => {
    if (!isTestMatch || !latestProxy || !onChainMatchName) return undefined;
    const { home, away } = splitTeamNames(onChainMatchName as string);
    return {
      id: 999999,
      homeTeam: home,
      awayTeam: away,
      league: sportLabel(sportType),
      status: "TEST",
      startTime: new Date().toISOString(),
      contractAddress: latestProxy,
    };
  }, [isTestMatch, latestProxy, onChainMatchName, sportType]);

  const matchData = isTestMatch ? onChainMatchData : matchDataFromApi;
  // Test-match loading covers three windows: initial factory.getAllMatches
  // fetch, the time between resolving latestProxy and the matchName read
  // returning, and any pending wagmi refetch. Without `allMatches === undefined`
  // here the page would race through to "No match found" during the first
  // few hundred ms after mount.
  const loading = isTestMatch
    ? loadingMatches || allMatches === undefined || (!!latestProxy && !onChainMatchName)
    : loadingFromApi;
  const noMatchDeployedYet =
    isTestMatch && allMatches !== undefined && allMatches.length === 0;

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

  // Test-match path: surface factory-read failures explicitly so an RPC error
  // or an obviously-empty factory address don't render as a generic "no match
  // found" (which would look identical to a working-but-empty deployment).
  if (isTestMatch && matchesError) {
    return (
      <CenteredStatus
        title="Factory read failed"
        message={`Could not read getAllMatches() on ${short(factoryAddress)}. Check NEXT_PUBLIC_PARI_MATCH_FACTORY_ADDRESS and your RPC. ${matchesError.message ?? ''}`}
        action={{ label: "Open /admin", onClick: () => router.push("/admin") }}
      />
    );
  }

  if (loading) {
    return <CenteredStatus message="Loading match…" spinner />;
  }
  if (noMatchDeployedYet) {
    return (
      <CenteredStatus
        title="No on-chain match deployed yet"
        message={`Factory ${short(factoryAddress)} reports 0 matches. /live/999999 binds to factory.getAllMatches().at(-1) — deploy one first.`}
        action={{ label: "Open /admin", onClick: () => router.push("/admin") }}
      />
    );
  }
  if ((queryError && !isTestMatch) || !matchData) {
    return (
      <CenteredStatus
        title="No match found"
        action={{ label: "Back to matches", onClick: () => router.push("/browse") }}
      />
    );
  }

  const matchAddress = matchData.contractAddress as Address | undefined;
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

        {/* Video + about + markets */}
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
                autoplay
                showControls
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
            onDonate={
              streamForDonateSubscribe ? () => setShowDonationDialog(true) : undefined
            }
            onSubscribe={
              streamForDonateSubscribe ? () => setShowSubscriptionDialog(true) : undefined
            }
            hideStreamerActions={isOwnSelectedStream || !selectedStream}
          />

          {/* ── Pari-mutuel markets panel ─────────────────────────────── */}
          <PariMarketsList
            matchAddress={matchAddress}
            walletAddress={walletAddress || undefined}
            homeTeam={matchData.homeTeam}
            awayTeam={matchData.awayTeam}
            homeTeamLogo={matchData.homeTeamLogo}
            awayTeamLogo={matchData.awayTeamLogo}
          />

          {/* Mobile chat */}
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

      {/* DESKTOP SIDEBAR — chat */}
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

// ─── Helpers ────────────────────────────────────────────────────────────────

function splitTeamNames(name: string): { home: string; away: string } {
  const trimmed = name.trim();
  for (const sep of [" vs ", " VS ", " v ", " - ", " — "]) {
    const idx = trimmed.indexOf(sep);
    if (idx > 0) {
      return { home: trimmed.slice(0, idx).trim(), away: trimmed.slice(idx + sep.length).trim() };
    }
  }
  return { home: trimmed, away: "—" };
}

function sportLabel(sport: string): string {
  if (sport === "FOOTBALL") return "Football (on-chain)";
  if (sport === "BASKETBALL") return "Basketball (on-chain)";
  return "Test";
}

function short(addr?: string): string {
  if (!addr) return "—";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function CenteredStatus({
  title,
  message,
  spinner,
  action,
}: {
  title?: string;
  message?: string;
  spinner?: boolean;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div
      className="flex items-center justify-center h-full"
      style={{ background: "#0A0A0A", color: "#fff" }}
    >
      <div className="text-center max-w-md px-6">
        {spinner && (
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
            style={{ borderColor: "#E8001D" }}
          />
        )}
        {title && (
          <p
            className="mb-3 text-[14px] tracking-[0.08em] uppercase"
            style={{ color: "#E8001D", fontFamily: "'Barlow', sans-serif" }}
          >
            {title}
          </p>
        )}
        {message && (
          <p className="mb-4 text-[12px]" style={{ color: "#888" }}>
            {message}
          </p>
        )}
        {action && (
          <button
            onClick={action.onClick}
            className="px-4 py-2 rounded text-[12px] font-bold tracking-[0.08em] uppercase"
            style={{ background: "#E8001D", color: "#fff", fontFamily: "'Barlow', sans-serif" }}
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
