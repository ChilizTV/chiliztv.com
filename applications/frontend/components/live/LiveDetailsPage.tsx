"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import PredictionsDialog from "../predictions/PredictionsDialog";
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
import { ExtendedOdds } from "@/models/match.model";
import { useMatch } from "@/hooks/api";
import { SupabaseChatService } from "@/services";
import { LiveStream } from "@/models/stream.model";
import { Address } from "viem";

interface LiveDetailsPageProps {
    readonly id: string;
}

export default function LiveDetailsPage({ id }: LiveDetailsPageProps) {
    const { primaryWallet, user, setShowAuthFlow } = useDynamicContext();
    const { data: matchData, isLoading: loading, error: queryError } = useMatch(id);
    const searchParams = useSearchParams();
    const initialStreamId = searchParams.get("streamId") ?? undefined;

    const walletAddress = primaryWallet?.address ?? "";

    const [matchInProgress] = useState(false);
    const [chatStats, setChatStats] = useState<{ messagesCount: number; predictionsCount: number }>({ messagesCount: 0, predictionsCount: 0 });
    const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
    // User's own active stream for this match (independent of the video player selection)
    const [myStream, setMyStream] = useState<LiveStream | null>(null);
    const [browseLivesOpen, setBrowseLivesOpen] = useState(false);
    const [showDonationDialog, setShowDonationDialog] = useState(false);
    const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
    const [streamerPreviewEl, setStreamerPreviewEl] = useState<HTMLDivElement | null>(null);

    const isStreamer = !!myStream && !!user?.userId;

    // streamId for chat: always prefer the user's own stream so streamers see their own chat
    const chatStreamId = myStream?.id ?? selectedStream?.id;


    const isTestMode = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_NETWORK === 'testnet';
    const testStreamerAddress = process.env.NEXT_PUBLIC_TEST_STREAMER_ADDRESS as `0x${string}` | undefined;
    const mockStreamForTest: LiveStream | null = isTestMode && testStreamerAddress ? {
        id: 'test-mock',
        matchId: parseInt(id) || 1,
        streamerId: 'test-streamer',
        streamerName: 'Test Streamer',
        streamerWalletAddress: testStreamerAddress,
        streamKey: 'mock',
        status: 'live',
        viewerCount: 0,
        createdAt: new Date().toISOString(),
    } : null;

    const streamForDonateSubscribe = (selectedStream?.streamerWalletAddress ? selectedStream : null) ?? mockStreamForTest;

    const updateChatStats = () => {
        if (id) {
            fetchChatStats(parseInt(id));
        }
    };

    const handleStreamSelect = (stream: LiveStream) => {
        setSelectedStream(stream);
    };

    const handleStreamCreated = (stream: LiveStream) => {
        setSelectedStream(stream);
        setMyStream(stream);
    };

    const handleStreamEnded = () => {
        setSelectedStream(null);
        setMyStream(null);
    };

    const fetchChatStats = async (matchId: number) => {
        try {
            const supabaseChat = new SupabaseChatService();
            const messages = await supabaseChat.getRoomMessages(matchId, 1000);

            const predictionMessages = messages.filter(msg => msg.type === 'bet' || msg.systemEventType === 'bet').length;

            setChatStats({
                messagesCount: messages.length,
                predictionsCount: predictionMessages
            });

        } catch (err) {
            console.warn("Error fetching chat stats:", err);
        }
    };

    useEffect(() => {
        if (matchData) {
            fetchChatStats(matchData.id);
        }
    }, [matchData]);

    if (!id) return null;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading match...</p>
                </div>
            </div>
        );
    }

    if (queryError || !matchData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black text-white">
                <div className="text-center">
                    <p className="text-red-400 mb-4">No match found</p>
                    <button
                        onClick={() => window.location.href = '/live'}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                        Back to matches
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row h-full bg-black text-white">
        {/* Mobile: Score section first */}
        <div className="md:hidden w-full border-b border-white/10 bg-zinc-950">
            <div className="p-6 border-b border-white/20 bg-gradient-to-tr from-primary/80 to-primary/50 shadow-lg rounded-b-xl">
                <div className="mb-6">
                    <MatchScoreDisplay
                        homeTeam={matchData.homeTeam}
                        awayTeam={matchData.awayTeam}
                        homeScore={matchData.homeScore ?? 0}
                        awayScore={matchData.awayScore ?? 0}
                        isLive={true}
                    />
                </div>
                {!matchInProgress && (
                    <>
                    <div className="text-xl font-bold mb-3 text-white drop-shadow-lg">Place Prediction</div>
                    <PredictionsDialog
                        isLoggedIn={!!primaryWallet?.address}
                        onLogin={() => setShowAuthFlow(true)}
                        TeamA={matchData.homeTeam}
                        TeamB={matchData.awayTeam}
                        walletAddress={walletAddress}
                        bettingContractAddress={matchData.contractAddress as `0x${string}` | undefined}
                        odds={matchData.odds as ExtendedOdds | null | undefined}
                        matchId={matchData.id}
                        matchStartTime={matchData.startTime}
                    />
                    </>
                )}
            </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden md:overflow-y-auto p-2 space-y-2">
            {/* Browse Lives + Start Stream buttons */}
            <div className="flex gap-3">
                <BrowseLivesCollapsible
                    matchId={parseInt(id)}
                    selectedStreamId={selectedStream?.id}
                    onStreamSelect={handleStreamSelect}
                    onOwnStreamDetected={(stream) => {
                        setMyStream(stream);
                        // Use the same detection to auto-select own stream for the video player
                        setSelectedStream(prev => {
                            if (stream && prev === null) return stream;   // auto-select on first detection
                            if (!stream && prev?.streamerId === user?.userId) return null; // clear on stream end
                            return prev; // keep user's explicit selection otherwise
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

            {/* Desktop: Score Display */}
            <div className="hidden md:block w-full py-1">
                <MatchScoreDisplay
                    homeTeam={matchData.homeTeam}
                    awayTeam={matchData.awayTeam}
                    homeScore={matchData.homeScore ?? 0}
                    awayScore={matchData.awayScore ?? 0}
                    isLive={true}
                />
            </div>

            {isStreamer ? (
                <div
                    ref={setStreamerPreviewEl}
                    className="w-full aspect-video shrink-0 bg-black rounded-lg overflow-hidden border border-zinc-800 relative"
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

            {/* About Live Section (stats + ad + streamer) */}
            <AboutLiveSection
                streamerId={selectedStream?.streamerId}
                streamerName={selectedStream?.streamerName || "Unknown"}
                title={selectedStream?.title}
                predictionsCount={chatStats.predictionsCount}
                messagesCount={chatStats.messagesCount}
                currentUserId={user?.userId}
            />

            {/* Mobile: Chat below stream */}
            <div className="md:hidden w-full">
                <ChatPanel
                    matchId={id}
                    streamId={chatStreamId}
                    userId={user?.userId ?? ""}
                    username={String(user?.username ?? "")}
                    walletAddress={walletAddress}
                    onMessageSent={updateChatStats}
                    headerProps={{
                        onOpenDonation: () => setShowDonationDialog(true),
                        onOpenSubscription: () => setShowSubscriptionDialog(true),
                    }}
                />
            </div>
        </div>

        {/* Desktop: Sidebar (Predictions + Chat only) */}
        <div className="hidden md:flex w-full md:w-[400px] border-l border-white/10 bg-zinc-950 flex-col h-full overflow-hidden">
            {/* Predictions Section */}
            <div className="py-1 px-2 bg-gradient-to-b from-primary/80 via-primary/50 to-primary/20 sticky top-0 md:static z-20 flex-shrink-0">
                {!matchInProgress ? (
                    <>
                    <PredictionsDialog
                        isLoggedIn={!!primaryWallet?.address}
                        onLogin={() => setShowAuthFlow(true)}
                        TeamA={matchData.homeTeam}
                        TeamB={matchData.awayTeam}
                        walletAddress={walletAddress}
                        bettingContractAddress={matchData.contractAddress as `0x${string}` | undefined}
                        odds={matchData.odds as ExtendedOdds | null | undefined}
                        matchId={matchData.id}
                        matchStartTime={matchData.startTime}
                    />
                    </>
                ) : (
                    <div className="text-center text-yellow-400 text-sm font-medium py-3 select-none">
                    Predictions closed
                    </div>
                )}
            </div>

            {/* Chat Panel (dominant) */}
            <ChatPanel
                matchId={id}
                streamId={selectedStream?.id}
                userId={user?.userId ?? ""}
                username={String(user?.username ?? "")}
                walletAddress={walletAddress}
                onMessageSent={updateChatStats}
                headerProps={{
                    onOpenDonation: () => setShowDonationDialog(true),
                    onOpenSubscription: () => setShowSubscriptionDialog(true),
                }}
            />
        </div>

        {/* Donation Dialog */}
        {streamForDonateSubscribe && (
            <StreamWalletButton
                streamerAddress={streamForDonateSubscribe.streamerWalletAddress as Address}
                isStreamer={walletAddress?.toLowerCase() === streamForDonateSubscribe.streamerWalletAddress?.toLowerCase()}
                open={showDonationDialog}
                onOpenChange={setShowDonationDialog}
            />
        )}

        {/* Subscription Dialog */}
        {streamForDonateSubscribe && (
            <StreamSubscriptionButton
                streamerAddress={streamForDonateSubscribe.streamerWalletAddress as Address}
                isStreamer={walletAddress?.toLowerCase() === streamForDonateSubscribe.streamerWalletAddress?.toLowerCase()}
                open={showSubscriptionDialog}
                onOpenChange={setShowSubscriptionDialog}
            />
        )}
        </div>
    );
}
