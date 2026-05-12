"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle, Eye, Play, Volume2, VolumeX, VideoOff, Tv2 } from 'lucide-react';
import Hls from 'hls.js';
import { LiveStream } from '@/models/stream.model';
import { streamViewerService } from '@/services';
import { formatLargeNumber } from '@/lib/utils/formatting/number';
import { supabase } from '@/lib/supabase';

interface VideoPlayerProps {
    stream: LiveStream | null;
    autoplay?: boolean;
    showControls?: boolean;
    className?: string;
    onStreamEnded?: () => void;
    onBrowseStreams?: () => void;
}

export default function VideoPlayer({
    stream,
    autoplay = true,
    showControls = true,
    className = "",
    onStreamEnded,
    onBrowseStreams,
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [streamEnded, setStreamEnded] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [isMuted, setIsMuted] = useState(true);
    const [needsInteraction, setNeedsInteraction] = useState(false);
    const [liveViewerCount, setLiveViewerCount] = useState(stream?.viewerCount ?? 0);

    const thumbnailIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Reset stream-ended state when switching streams
    useEffect(() => {
        setStreamEnded(false);
    }, [stream?.id]);

    // Stable session token (shared across tabs for same stream via localStorage).
    // Resolved synchronously during render so any downstream effect can rely on
    // it without an init race. Empty string means "not ready yet".
    const sessionToken = useMemo(() => {
        if (!stream?.id) return '';
        if (typeof window === 'undefined') return '';
        const key = `viewer_session_${stream.id}`;
        const existing = window.localStorage.getItem(key);
        if (existing) return existing;
        const token = window.crypto.randomUUID();
        window.localStorage.setItem(key, token);
        return token;
    }, [stream?.id]);

    // Viewer presence — fires the moment the player mounts with a valid stream,
    // independent of the HLS pipeline. Even if the manifest is slow or errors,
    // the user is on the page and counts as a viewer. Heartbeat every 30s
    // (stale threshold backend-side is 45s) keeps the session alive.
    useEffect(() => {
        if (!stream?.id || !sessionToken) return;
        const streamId = stream.id;
        streamViewerService.joinStream(streamId, sessionToken);
        const heartbeatId = setInterval(() => {
            streamViewerService.joinStream(streamId, sessionToken);
        }, 30_000);
        return () => {
            clearInterval(heartbeatId);
            streamViewerService.leaveStream(streamId, sessionToken);
        };
    }, [stream?.id, sessionToken]);

    // Supabase Realtime — single channel for viewer_count updates
    useEffect(() => {
        if (!stream) return;
        setLiveViewerCount(stream.viewerCount ?? 0);

        const channel = supabase
            .channel(`stream-${stream.id}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'live_streams',
                filter: `id=eq.${stream.id}`,
            }, (payload: { new: { viewer_count?: number; status?: string } }) => {
                if (payload.new.viewer_count !== undefined) {
                    setLiveViewerCount(payload.new.viewer_count);
                }
                if (payload.new.status === 'ended') {
                    if (hlsRef.current) {
                        hlsRef.current.destroy();
                        hlsRef.current = null;
                    }
                    setIsLoading(false);
                    setStatusMessage(null);
                    setStreamEnded(true);
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [stream?.id]);

    useEffect(() => {
        if (!stream || !videoRef.current) {
            return;
        }

        let cancelled = false;
        const initialVideoElement = videoRef.current;
        let retryCount = 0;
        const MAX_RETRIES = 5;

        setIsLoading(true);
        setError(null);
        setStatusMessage('Connecting to stream...');

        const playlistUrl = streamViewerService.getStreamPlaylistUrl(stream.streamKey);
        console.log('[VideoPlayer] Loading stream:', stream.streamKey, playlistUrl);

        // Native HLS support (Safari)
        if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
            console.log('[VideoPlayer] Using native HLS (Safari)');
            videoRef.current.src = playlistUrl;

            // Safari's native HLS loader stays silent when the playlist 404s or
            // returns no segments — neither `loadedmetadata` nor `error` fires.
            // Probe the URL ourselves; if it's not reachable, surface a state
            // instead of leaving the spinner up forever.
            const NATIVE_HLS_TIMEOUT_MS = 12_000;
            const safariWatchdog = setTimeout(() => {
                if (cancelled) return;
                fetch(playlistUrl, { method: 'GET' })
                    .then(res => {
                        if (cancelled) return;
                        if (res.status === 404) {
                            console.warn('[VideoPlayer] Native HLS: playlist 404, marking stream ended');
                            setStreamEnded(true);
                            setIsLoading(false);
                            setStatusMessage(null);
                            return;
                        }
                        if (!res.ok) {
                            console.warn('[VideoPlayer] Native HLS: playlist status', res.status);
                            setError(`Failed to load stream (HTTP ${res.status})`);
                            setIsLoading(false);
                            setStatusMessage(null);
                            return;
                        }
                        console.warn('[VideoPlayer] Native HLS: playlist OK, awaiting metadata');
                        setIsLoading(false);
                        setStatusMessage(null);
                    })
                    .catch(err => {
                        if (cancelled) return;
                        console.error('[VideoPlayer] Native HLS: probe failed', err);
                        setError('Cannot reach the stream server.');
                        setIsLoading(false);
                        setStatusMessage(null);
                    });
            }, NATIVE_HLS_TIMEOUT_MS);

            videoRef.current.addEventListener('loadedmetadata', () => {
                clearTimeout(safariWatchdog);
                if (!cancelled) {
                    console.log('[VideoPlayer] Native HLS: metadata loaded');
                    setIsLoading(false);
                    setStatusMessage(null);
                    if (autoplay && videoRef.current) {
                        videoRef.current.muted = true;
                        videoRef.current.play().catch(() => {
                            setNeedsInteraction(true);
                        });
                    }
                }
            }, { once: true });
            videoRef.current.addEventListener('error', () => {
                clearTimeout(safariWatchdog);
                if (!cancelled) {
                    const mediaErr = videoRef.current?.error;
                    const code = mediaErr?.code ?? 0;
                    const detail = mediaErr?.message || 'no detail';
                    const codeLabel = ['UNKNOWN', 'ABORTED', 'NETWORK', 'DECODE', 'UNSUPPORTED'][code] ?? 'UNKNOWN';
                    console.error('[VideoPlayer] Native HLS error', { code, codeLabel, detail });
                    setError(`Failed to load video (${codeLabel}: ${detail})`);
                    setIsLoading(false);
                    setStatusMessage(null);
                }
            }, { once: true });
        } else if (Hls.isSupported()) {
            console.log('[VideoPlayer] Using HLS.js');
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                maxBufferLength: 30,
                maxMaxBufferLength: 60,
                maxBufferSize: 30 * 1000 * 1000,
                maxBufferHole: 0.5,
                highBufferWatchdogPeriod: 2,
                backBufferLength: 30,
                manifestLoadingTimeOut: 5000,
                manifestLoadingMaxRetry: 2,
                manifestLoadingRetryDelay: 1500,
                fragLoadingTimeOut: 10000,
                fragLoadingMaxRetry: 3,
                fragLoadingRetryDelay: 1000,
                abrEwmaDefaultEstimate: 500000,
                abrBandWidthFactor: 0.95,
                abrBandWidthUpFactor: 0.7,
                liveSyncDurationCount: 2,
                liveMaxLatencyDurationCount: 3,
                liveDurationInfinity: false,
            });

            hlsRef.current = hls;

            hls.loadSource(playlistUrl);
            hls.attachMedia(videoRef.current);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                if (cancelled) return;
                console.log('[VideoPlayer] Manifest parsed, starting playback');
                setIsLoading(false);
                setStatusMessage(null);
                retryCount = 0;
                if (autoplay && videoRef.current) {
                    videoRef.current.muted = true;
                    videoRef.current.play().catch(err => {
                        console.warn('[VideoPlayer] Autoplay failed, waiting for interaction:', err);
                        setNeedsInteraction(true);
                    });
                }

                // (Viewer session + heartbeat are handled by a dedicated effect
                //  upstream — keyed on stream.id + sessionToken — so they fire
                //  even when the HLS manifest is slow or errors.)

                // Start thumbnail capture after 3s (stream stabilised)
                setTimeout(() => {
                    if (cancelled) return;
                    const capture = () => {
                        const video = videoRef.current;
                        if (!video || video.readyState < 2 || video.paused) return;
                        const canvas = document.createElement('canvas');
                        canvas.width = 320; canvas.height = 180;
                        canvas.getContext('2d')?.drawImage(video, 0, 0, 320, 180);
                        canvas.toBlob(blob => {
                            if (blob) streamViewerService.uploadThumbnail(stream.id, blob);
                        }, 'image/jpeg', 0.7);
                    };
                    capture();
                    thumbnailIntervalRef.current = setInterval(capture, 20_000);
                }, 3000);
            });

            hls.on(Hls.Events.ERROR, (_event, data) => {
                if (cancelled) return;

                if (data.fatal) {
                    console.warn('[VideoPlayer] Fatal error:', data.type, data.details, data.response?.code);
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            retryCount++;
                            if (retryCount <= MAX_RETRIES) {
                                console.log(`[VideoPlayer] Retrying... (${retryCount}/${MAX_RETRIES})`);
                                setStatusMessage(`Waiting for stream... (${retryCount}/${MAX_RETRIES})`);
                                setTimeout(() => {
                                    if (!cancelled && hlsRef.current) {
                                        hls.loadSource(playlistUrl);
                                        hls.startLoad();
                                    }
                                }, 2000);
                            } else {
                                // Stop requesting — lets mediamtx detect no readers → runOnNotReady fires
                                setStreamEnded(true);
                                setIsLoading(false);
                                setStatusMessage(null);
                                hls.destroy();
                                hlsRef.current = null;
                            }
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.error('[VideoPlayer] Fatal media error, recovering...');
                            hls.recoverMediaError();
                            break;
                        default:
                            setError('Fatal error: ' + data.type);
                            hls.destroy();
                            setIsLoading(false);
                            setStatusMessage(null);
                            break;
                    }
                } else {
                    if (data.details === 'bufferStalledError') {
                        console.warn('[VideoPlayer] Buffer stalled, recovering...');
                        if (hls.media) {
                            hls.startLoad();
                        }
                    } else if (data.details !== 'bufferAppendingError') {
                        console.warn('[VideoPlayer] Non-fatal error:', data.details);
                    }
                }
            });
        } else {
            setError('HLS is not supported in this browser');
            setIsLoading(false);
            setStatusMessage(null);
        }

        return () => {
            cancelled = true;
            // (leaveStream + heartbeat clearance happen in the dedicated
            //  viewer-presence effect.)
            if (thumbnailIntervalRef.current) { clearInterval(thumbnailIntervalRef.current); thumbnailIntervalRef.current = null; }
            try {
                if (hlsRef.current) {
                    hlsRef.current.destroy();
                    hlsRef.current = null;
                }
            } catch {
                // Expected when aborting media fetching during cleanup
            }
            if (initialVideoElement) {
                initialVideoElement.removeAttribute('src');
                initialVideoElement.load();
            }
        };
        // Keyed on `stream?.id` (not the whole `stream` object) so that
        // parent re-renders that emit a fresh-but-equivalent stream reference
        // don't tear down the HLS pipeline (which would also churn the
        // viewer session and lose any in-flight thumbnail capture).
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stream?.id, autoplay]);

    if (!stream) {
        return (
            <div className={`relative aspect-video w-full overflow-hidden bg-[#0d0d0d] ${className}`}>
                <span
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(circle at 50% 40%, rgba(232,0,29,0.10), transparent 65%)",
                    }}
                />
                <span
                    aria-hidden
                    className="absolute inset-0 opacity-30"
                    style={{
                        background:
                            "repeating-linear-gradient(180deg, transparent 0px, transparent 18px, rgba(255,255,255,0.025) 18px, rgba(255,255,255,0.025) 19px)",
                    }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center">
                    <Tv2 size={56} className="text-white/35" strokeWidth={1.4} />
                    <span className="font-mono-ctv inline-flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#E8001D]">
                        <span aria-hidden className="block h-0.5 w-4 bg-[#E8001D]" />
                        Pick a stream
                    </span>
                    <div className="font-display max-w-md text-[26px] font-extrabold leading-[0.95] tracking-[-0.01em] text-white sm:text-[32px]">
                        Choose a creator&nbsp;
                        <span className="text-[#E8001D]">streaming this match.</span>
                    </div>
                    <div className="font-mono-ctv max-w-md text-[10px] uppercase tracking-[0.16em] text-white/45">
                        Or fire up your own studio and broadcast it yourself.
                    </div>
                    {onBrowseStreams && (
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                            <button
                                type="button"
                                onClick={onBrowseStreams}
                                className="font-mono-ctv inline-flex items-center justify-center gap-2 rounded-md bg-[#E8001D] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#FF1737]"
                            >
                                <Tv2 size={13} />
                                Switch streams
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <Card className={`${className} bg-zinc-900 border-zinc-800`}>
            <CardContent className="p-0">
                <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-zinc-800">
                    {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-10">
                            <Loader2 className="w-8 h-8 animate-spin text-white mb-2" />
                            {statusMessage && (
                                <p className="text-gray-300 text-sm">{statusMessage}</p>
                            )}
                        </div>
                    )}

                    {streamEnded && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6 bg-gradient-to-b from-zinc-900/95 via-zinc-950/98 to-black animate-in fade-in duration-500">
                            <div className="flex flex-col items-center gap-4 text-center max-w-xs">
                                <div className="rounded-full bg-zinc-800 p-4">
                                    <VideoOff className="w-10 h-10 text-zinc-400" />
                                </div>
                                <div>
                                    <p className="text-white font-semibold text-lg">Stream has ended</p>
                                    <p className="text-zinc-400 text-sm mt-1">The streamer has stopped broadcasting</p>
                                </div>
                                <div className="flex flex-col gap-2 w-full">
                                    {onBrowseStreams && (
                                        <button
                                            onClick={onBrowseStreams}
                                            className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-white text-black font-medium text-sm hover:bg-zinc-100 transition-colors"
                                        >
                                            <Tv2 className="w-4 h-4" />
                                            Browse streams
                                        </button>
                                    )}
                                    {onStreamEnded && (
                                        <button
                                            onClick={onStreamEnded}
                                            className="w-full px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm hover:bg-zinc-800 transition-colors"
                                        >
                                            Return to match
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {error && !streamEnded && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10 p-4">
                            <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
                            <p className="text-red-400 text-center">{error}</p>
                        </div>
                    )}

                    <video
                        ref={videoRef}
                        controls={showControls}
                        autoPlay={autoplay}
                        muted={isMuted}
                        playsInline
                        crossOrigin="anonymous"
                        className="w-full h-full object-contain"
                    />

                    {/* Click to play overlay */}
                    {needsInteraction && (
                        <div
                            className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 cursor-pointer"
                            onClick={() => {
                                if (videoRef.current) {
                                    videoRef.current.muted = true;
                                    videoRef.current.play().then(() => setNeedsInteraction(false));
                                }
                            }}
                        >
                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-5">
                                <Play className="w-12 h-12 text-white fill-white" />
                            </div>
                        </div>
                    )}

                    {/* Unmute button */}
                    {!needsInteraction && !isLoading && (
                        <button
                            onClick={() => {
                                if (videoRef.current) {
                                    videoRef.current.muted = !videoRef.current.muted;
                                    setIsMuted(videoRef.current.muted);
                                }
                            }}
                            className="absolute bottom-16 right-4 bg-black/70 backdrop-blur-sm border border-zinc-700 rounded-full p-2 z-10 hover:bg-black/90 transition-colors"
                            title={isMuted ? 'Unmute' : 'Mute'}
                        >
                            {isMuted
                                ? <VolumeX className="w-5 h-5 text-white" />
                                : <Volume2 className="w-5 h-5 text-white" />
                            }
                        </button>
                    )}

                    {/* Viewer Count */}
                    {liveViewerCount > 0 && (
                        <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm border border-zinc-700 text-white px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                            <Eye className="w-4 h-4" />
                            <span>{formatLargeNumber(liveViewerCount)}</span>
                        </div>
                    )}

                    {/* Stream Info */}
                    <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm">
                        <p className="font-semibold">{stream.streamerName}</p>
                        <p className="text-xs text-gray-300">Live Stream</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
