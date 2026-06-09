"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, Square, Video } from "lucide-react";
import { ChatPanel, MobileChatFab, MobileChatBottomSheet } from "./chat";
import {
  VideoPlayer,
  StreamWalletButton,
  StreamSubscriptionButton,
} from ".";
import {
  LiveHero,
  StreamShelf,
  StreamerStrip,
  AboutLiveTabs,
} from "./sections";
import { StreamSwitcherSheet, StartStreamSheet } from "./sheets";
import { StreamInterruptedBanner } from "@/components/features/streaming/StreamInterruptedBanner";
import { StreamStatus, wasInterrupted } from "@chiliztv/domain";
import { GhostBtn, PrimaryBtn } from "./primitives";
import {
  useIsFollowing,
  useFollowMutation,
  useUnfollowMutation,
  useMatch,
} from "@/hooks/api";
import type { Address } from "viem";
import {
  usePariMatchFactoryReadGetAllMatches,
  usePariMatchFactoryReadGetSportType,
  useFootballPariMatchReadMatchName,
} from "@/lib/contracts/generated";
import { chilizConfig } from "@/config/chiliz.config";
import { LiveStream } from "@/models/stream.model";
import type { Match } from "@/types/api.types";

interface LiveDetailsPageProps {
  readonly id: string;
}

const TEST_MATCH_ID = "999999";

// Hardcoded dummy match for the /live/999999 route. Points at the real
// on-chain PariMatch proxy so placeBet / claim / read flows work, but skips
// the factory.getAllMatches() round-trip that was returning empty during
// local dev. Edit the contractAddress here when you spin up a fresh match
// via the smart-contract scripts.
// 24h ahead — keeps the kickoff buffer (KICKOFF_BUFFER_SEC = 120s in
// MatchMarketsList) satisfied so the BettablePolicy resolves to `ok: true`.
// Without this, `isBettable` returns KICKOFF_BUFFER and the markets render
// disabled with "Kicks off in 0m · Betting closed".
const DUMMY_KICKOFF_ISO = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

// Hardcoded dummy match for the /live/999999 route. Points at the real
// on-chain PariMatch proxy so placeBet / claim / read flows work, but skips
// the factory.getAllMatches() round-trip that was returning empty during
// local dev. Edit the contractAddress here when you spin up a fresh match
// via the smart-contract scripts.
// status must be one of the API-Football codes recognised by
// BettablePolicy.classifyStatus (UPCOMING_STATUSES = ['NS','TBD']); the
// previous "TEST" sentinel fell into `unknown` and locked every market with
// "Predictions unavailable".
const DUMMY_TEST_MATCH: Match = {
  id: 999999,
  homeTeam: "Bayern",
  awayTeam: "Dortmund",
  league: "Football · Test",
  status: "NS",
  startTime: DUMMY_KICKOFF_ISO,
  // Latest PariMatch proxy on archi-off-mica's factory
  // (factory 0xbba7f5d1… → getAllMatches().at(-1)). Update when the SSR
  // fallback should track a newer match.
  contractAddress: "0xe43a99cb7dd0787ce47e5ba0d838d9faca6bec7a" as Address,
  homeForm: null,
  awayForm: null,
  elapsed: null,
  htHomeScore: null,
  htAwayScore: null,
};

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

  // ── On-chain path (test match: bind to the latest factory deployment) ────
  const { data: allMatches } = usePariMatchFactoryReadGetAllMatches({
    address: chilizConfig.pariMatchFactory,
    chainId: chilizConfig.chainId,
    query: { enabled: isTestMatch },
  });
  const latestProxy = (allMatches as readonly Address[] | undefined)?.at(-1);

  const { data: onChainMatchName } = useFootballPariMatchReadMatchName({
    address: latestProxy,
    chainId: chilizConfig.chainId,
    query: { enabled: isTestMatch && !!latestProxy },
  });

  const { data: onChainSportType } = usePariMatchFactoryReadGetSportType({
    address: chilizConfig.pariMatchFactory,
    chainId: chilizConfig.chainId,
    args: latestProxy ? [latestProxy] : undefined,
    query: { enabled: isTestMatch && !!latestProxy },
  });

  const onChainMatchData = useMemo<Match | undefined>(() => {
    if (!isTestMatch) return undefined;
    // Prefer on-chain reads when available; fall back to the hardcoded
    // dummy so /live/999999 always renders something local-dev can drive.
    if (latestProxy && onChainMatchName) {
      const { home, away } = splitTeamNames(onChainMatchName as string);
      const sport = sportLabel(onChainSportType);
      return {
        id: 999999,
        homeTeam: home,
        awayTeam: away,
        league: sport,
        // See DUMMY_TEST_MATCH note — "NS" + future kickoff keeps the
        // BettablePolicy from blocking every market.
        status: "NS",
        startTime: DUMMY_KICKOFF_ISO,
        contractAddress: latestProxy,
        homeForm: null,
        awayForm: null,
        elapsed: null,
        htHomeScore: null,
        htAwayScore: null,
      };
    }
    return DUMMY_TEST_MATCH;
  }, [isTestMatch, latestProxy, onChainMatchName, onChainSportType]);

  const matchData = isTestMatch ? onChainMatchData : matchDataFromApi;
  const loading = isTestMatch ? false : loadingFromApi;
  const noMatchDeployedYet = false;

  const searchParams = useSearchParams();
  const initialStreamId = searchParams.get("streamId") ?? undefined;

  const walletAddress = primaryWallet?.address ?? "";

  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [myStream, setMyStream] = useState<LiveStream | null>(null);
  const [showSwitcherSheet, setShowSwitcherSheet] = useState(false);
  const [showStartSheet, setShowStartSheet] = useState(false);
  const [showDonationDialog, setShowDonationDialog] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [streamerPreviewEl, setStreamerPreviewEl] = useState<HTMLDivElement | null>(null);
  const [interruptedBanner, setInterruptedBanner] = useState(false);
  const endStreamRef = useRef<(() => Promise<void>) | null>(null);
  // True from the moment the user clicks an explicit End affordance and for
  // the few seconds the poll takes to catch up. wasInterrupted() consumes it
  // to suppress the banner on user-initiated transitions (cf. D5 / R11).
  const userInitiatedEndRef = useRef(false);
  const lastMyStreamRef = useRef<LiveStream | null>(null);

  const isStreamer = !!myStream && !!user?.userId;
  const chatStreamId = myStream?.id ?? selectedStream?.id;

  const isOwnSelectedStream =
    !!selectedStream &&
    selectedStream.streamerWalletAddress?.toLowerCase() === walletAddress?.toLowerCase();

  // Donation/subscription dialogs require a real on-chain streamer wallet.
  const streamForDonateSubscribe =
    selectedStream?.streamerWalletAddress ? selectedStream : null;

  // ── Follow / unfollow streamer ──────────────────────────────────────────
  const followStreamerId = selectedStream?.streamerId;
  const canFollow =
    !!user?.userId && !!followStreamerId && user.userId !== followStreamerId;
  const { data: isFollowing, isLoading: isLoadingFollow } = useIsFollowing(
    canFollow ? user?.userId : undefined,
    canFollow ? followStreamerId : undefined,
  );
  const followMutation = useFollowMutation(user?.userId);
  const unfollowMutation = useUnfollowMutation(user?.userId);
  const handleFollowClick = () => {
    if (!canFollow || !followStreamerId || !selectedStream) return;
    if (isFollowing) {
      unfollowMutation.mutate({ streamerId: followStreamerId });
    } else {
      followMutation.mutate({
        streamerId: followStreamerId,
        streamerName: selectedStream.streamerName,
      });
    }
  };
  const isMutatingFollow = followMutation.isPending || unfollowMutation.isPending;

  const handleStreamSelect = (stream: LiveStream) => setSelectedStream(stream);

  const handleStreamCreated = (stream: LiveStream) => {
    userInitiatedEndRef.current = false;
    setInterruptedBanner(false);
    lastMyStreamRef.current = stream;
    setSelectedStream(stream);
    setMyStream(stream);
  };

  const handleStreamEnded = () => {
    userInitiatedEndRef.current = true;
    lastMyStreamRef.current = null;
    setSelectedStream(null);
    setMyStream(null);
    setInterruptedBanner(false);
  };

  if (!id) return null;

  if (loading) {
    return <CenterStatus message="Loading match…" />;
  }

  if (noMatchDeployedYet) {
    return (
      <CenterPanel>
        <p className="font-mono-ctv mb-3 text-[11px] uppercase tracking-[0.16em] text-[#E8001D]">
          No on-chain match deployed yet
        </p>
        <p className="mb-4 text-[12px] text-white/55">
          /live/999999 binds to <code>factory.getAllMatches().at(-1)</code>. Deploy a match on-chain via the smart-contract scripts before opening this route.
        </p>
        <button
          onClick={() => router.push("/browse")}
          className="font-mono-ctv inline-flex items-center justify-center gap-2 rounded-md bg-[#E8001D] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#FF1737]"
        >
          Back to discover
        </button>
      </CenterPanel>
    );
  }

  if ((queryError && !isTestMatch) || !matchData) {
    return (
      <CenterPanel>
        <p className="font-mono-ctv mb-4 text-[11px] uppercase tracking-[0.16em] text-[#E8001D]">
          No match found
        </p>
        <button
          onClick={() => router.push("/browse")}
          className="font-mono-ctv inline-flex items-center justify-center gap-2 rounded-md bg-[#E8001D] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#FF1737]"
        >
          Back to matches
        </button>
      </CenterPanel>
    );
  }

  return (
    <div className="relative min-h-full bg-[#0A0A0A] text-white">
      <LiveHero
        homeTeam={matchData.homeTeam}
        awayTeam={matchData.awayTeam}
        homeScore={matchData.homeScore}
        awayScore={matchData.awayScore}
        scoreBreakdown={(() => {
          // Build a breakdown only when AET or PEN scores are present.
          // The 90' base is the headline homeScore/awayScore.
          const ninetyHome = matchData.homeScore;
          const ninetyAway = matchData.awayScore;
          if (ninetyHome == null || ninetyAway == null) return null;
          const hasAet = matchData.aetHomeScore != null && matchData.aetAwayScore != null;
          const hasPen = matchData.penHomeScore != null && matchData.penAwayScore != null;
          if (!hasAet && !hasPen) return null;
          return {
            ninety: { home: ninetyHome, away: ninetyAway },
            ...(hasAet && { aet: { home: matchData.aetHomeScore as number, away: matchData.aetAwayScore as number } }),
            ...(hasPen && { pen: { home: matchData.penHomeScore as number, away: matchData.penAwayScore as number } }),
          };
        })()}
        homeLogo={matchData.homeTeamLogo}
        awayLogo={matchData.awayTeamLogo}
        homeForm={matchData.homeForm}
        awayForm={matchData.awayForm}
        status={matchData.status}
        elapsed={matchData.elapsed ?? undefined}
        kickoffAt={matchData.startTime}
        league={matchData.league}
        onChainMatch={!!matchData.contractAddress}
        dataStale={matchData.dataStale}
        onBack={() => router.push("/live")}
      />

      <main className="mx-auto max-w-[1600px] px-3 py-4 sm:px-10 sm:py-8">
        {interruptedBanner && (
          <div className="mb-5">
            <StreamInterruptedBanner
              onRestart={() => {
                setInterruptedBanner(false);
                setShowStartSheet(true);
              }}
              onDismiss={() => setInterruptedBanner(false)}
            />
          </div>
        )}

        <StreamShelf
          activeStream={selectedStream}
          isOwnStream={isOwnSelectedStream}
          browseSlot={
            <GhostBtn
              onClick={() => setShowSwitcherSheet(true)}
              leading={<Eye size={13} />}
            >
              Switch streams
            </GhostBtn>
          }
          startSlot={
            isStreamer ? (
              <GhostBtn
                onClick={() => endStreamRef.current?.()}
                active
                color="#E8001D"
                leading={<Square size={13} />}
              >
                End stream
              </GhostBtn>
            ) : (
              <PrimaryBtn
                onClick={() => setShowStartSheet(true)}
                leading={<Video size={13} />}
              >
                Go live
              </PrimaryBtn>
            )
          }
        />

        <div className="grid gap-4 lg:grid-cols-[1fr_360px] lg:gap-6 xl:grid-cols-[1fr_400px]">
          {/* Main column */}
          <div className="flex min-w-0 flex-col gap-3 lg:gap-5">
            <div className="overflow-hidden rounded-xl border border-[#1E1E1E] bg-[#0d0d0d]">
              {isStreamer ? (
                <div
                  ref={setStreamerPreviewEl}
                  className="relative aspect-video w-full overflow-hidden bg-black"
                />
              ) : (
                <VideoPlayer
                  stream={selectedStream}
                  autoplay={true}
                  showControls={true}
                  onStreamEnded={handleStreamEnded}
                  onBrowseStreams={() => setShowSwitcherSheet(true)}
                />
              )}
            </div>

            <StreamerStrip
              stream={selectedStream}
              isOwnStream={isOwnSelectedStream}
              isFollowing={!!isFollowing}
              followDisabled={!canFollow || isLoadingFollow}
              followBusy={isMutatingFollow}
              onFollow={handleFollowClick}
              onTip={
                streamForDonateSubscribe ? () => setShowDonationDialog(true) : undefined
              }
              onSubscribe={
                streamForDonateSubscribe ? () => setShowSubscriptionDialog(true) : undefined
              }
            />

            <AboutLiveTabs
              bettingContractAddress={matchData.contractAddress as Address | undefined}
              walletAddress={walletAddress || undefined}
              homeTeam={matchData.homeTeam}
              awayTeam={matchData.awayTeam}
              match={{
                status: matchData.status,
                kickoffAt: matchData.startTime,
                htHomeScore: matchData.htHomeScore,
                htAwayScore: matchData.htAwayScore,
              }}
            />
          </div>

          {/* Chat sidebar (desktop) */}
          <aside className="hidden h-[680px] overflow-hidden rounded-xl border border-[#1E1E1E] bg-[#0d0d0d] lg:flex">
            <div className="flex flex-1 flex-col">
              <ChatPanel
                matchId={id}
                streamId={selectedStream?.id}
                userId={user?.userId ?? ""}
                username={String(user?.username ?? "")}
                walletAddress={walletAddress}
              />
            </div>
          </aside>
        </div>

        <footer className="mt-12 border-t border-[#1E1E1E] pt-6 text-center">
          <div className="font-mono-ctv text-[10px] uppercase tracking-[0.18em] text-white/35">
            PredCast · self-hosted livestreams · settle on Chiliz
          </div>
        </footer>
      </main>

      <StreamSwitcherSheet
        open={showSwitcherSheet}
        onClose={() => setShowSwitcherSheet(false)}
        matchId={parseInt(id)}
        selectedStreamId={selectedStream?.id}
        currentUserId={user?.userId}
        initialStreamId={initialStreamId}
        onStreamSelect={handleStreamSelect}
        onOwnStreamDetected={(stream) => {
          const prev = lastMyStreamRef.current
          
          if (userInitiatedEndRef.current) {
            if (stream === null) {
              userInitiatedEndRef.current = false;
              lastMyStreamRef.current = null;
            }
            return;
          }

          lastMyStreamRef.current = stream;
          // Detect a silent drop: previously LIVE browser stream, now absent,
          // and the user hasn't clicked End. Show the interrupted banner.
          if (stream === null && prev) {
            const interrupted = wasInterrupted({
              previousStatus: StreamStatus.LIVE,
              nextStatus: StreamStatus.ENDED,
              sourceType: prev.sourceType,
              userInitiated: userInitiatedEndRef.current,
            });
            if (interrupted) setInterruptedBanner(true);
          }
          setMyStream(stream);
          setSelectedStream((prev) => {
            if (stream && prev === null) return stream;
            if (!stream && prev?.streamerId === user?.userId) return null;
            return prev;
          });
        }}
      />

      <StartStreamSheet
        open={showStartSheet}
        onClose={() => setShowStartSheet(false)}
        matchId={parseInt(id)}
        onStreamCreated={handleStreamCreated}
        onStreamEnded={handleStreamEnded}
        portalTarget={isStreamer ? streamerPreviewEl : null}
        endStreamRef={endStreamRef}
      />

      {streamForDonateSubscribe && (
        <StreamWalletButton
          streamerAddress={streamForDonateSubscribe.streamerWalletAddress as Address}
          isStreamer={
            walletAddress?.toLowerCase() ===
            streamForDonateSubscribe.streamerWalletAddress?.toLowerCase()
          }
          open={showDonationDialog}
          onOpenChange={setShowDonationDialog}
          streamerName={streamForDonateSubscribe.streamerName}
          streamerHandle={streamForDonateSubscribe.streamerName}
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
          streamerName={streamForDonateSubscribe.streamerName}
          streamerHandle={streamForDonateSubscribe.streamerName}
        />
      )}

      <MobileChatFab
        onClick={() => setShowMobileChat(true)}
        hidden={showMobileChat}
      />
      <MobileChatBottomSheet
        open={showMobileChat}
        onClose={() => setShowMobileChat(false)}
      >
        <ChatPanel
          matchId={id}
          streamId={chatStreamId}
          userId={user?.userId ?? ""}
          username={String(user?.username ?? "")}
          walletAddress={walletAddress}
        />
      </MobileChatBottomSheet>

    </div>
  );
}

function CenterStatus({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center bg-[#0A0A0A] text-white">
      <div className="text-center">
        <div
          className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"
          style={{ borderColor: "#E8001D" }}
        />
        <p className="font-mono-ctv text-[11px] uppercase tracking-[0.16em] text-white/55">
          {message}
        </p>
      </div>
    </div>
  );
}

function CenterPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full items-center justify-center bg-[#0A0A0A] text-white">
      <div className="max-w-md px-6 text-center">{children}</div>
    </div>
  );
}

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

function sportLabel(sportType: unknown): string {
  const n = typeof sportType === "bigint" ? Number(sportType) : sportType;
  if (n === 0) return "FOOTBALL (test)";
  if (n === 1) return "BASKETBALL (test)";
  return "TEST";
}
