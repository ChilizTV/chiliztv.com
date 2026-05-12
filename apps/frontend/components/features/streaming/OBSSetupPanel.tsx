"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Hls from "hls.js";
import { Copy, Eye, EyeOff, RefreshCw, Wifi, WifiOff, ChevronDown, ChevronUp, Tv2, Square } from "lucide-react";
import { streamViewerService, ApiService } from "@/services";

function StreamerHlsPreview({ streamKey, isLive }: { streamKey: string; isLive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    if (!isLive || !videoRef.current) return;

    const mediamtxUrl = process.env.NEXT_PUBLIC_MEDIAMTX_URL ?? "http://localhost:8888";
    const url = `${mediamtxUrl}/live/${streamKey}/index.m3u8`;
    const video = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls({ lowLatencyMode: true });
      hls.loadSource(url);
      hls.attachMedia(video);
      hlsRef.current = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [isLive, streamKey]);

  if (!isLive) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-md border border-[#1E1E1E] bg-[#0d0d0d]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Tv2 size={20} className="mx-auto mb-2 text-white/20" />
            <p className="font-mono-ctv text-[10px] uppercase tracking-[0.14em] text-white/35">
              Start streaming in OBS to see preview
            </p>
            <p className="font-mono-ctv mt-1 text-[9px] uppercase tracking-[0.12em] text-white/20">
              HLS · ~3-5s delay
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-md border border-[#1E1E1E] bg-black">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        controls={false}
        className="h-full w-full object-contain"
      />
      <div className="font-mono-ctv pointer-events-none absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded bg-black/60 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#E8001D] backdrop-blur">
        <span className="ctv-pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-[#E8001D]" />
        Live preview
      </div>
    </div>
  );
}

interface OBSSetupPanelProps {
  streamKey: string;
  streamId: string;
  matchId: number;
  streamerId: string;
  streamerName: string;
  streamerWalletAddress?: string;
  onStreamKeyRegenerated: (newKey: string, newStreamId: string) => void;
  onStreamEnded: () => void;
}

export function OBSSetupPanel({
  streamKey,
  streamId,
  matchId,
  streamerId,
  streamerName,
  streamerWalletAddress,
  onStreamKeyRegenerated,
  onStreamEnded,
}: OBSSetupPanelProps) {
  const rtmpServer = process.env.NEXT_PUBLIC_RTMP_URL ?? "rtmp://localhost:1935/live";
  const fullUrl = `${rtmpServer}/${streamKey}`;

  const [keyVisible, setKeyVisible] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const isLiveRef = useRef(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const response = await axios.get(`${ApiService.baseURL}/stream`, {
          params: { streamerId },
        });
        const streams: { status: string }[] = response.data?.streams ?? [];
        const nowLive = streams.length > 0 && streams[0].status === "live";
        if (isLiveRef.current && !nowLive) {
          onStreamEnded();
        }
        isLiveRef.current = nowLive;
        setIsLive(nowLive);
      } catch {
        // network error — keep last known state
      }
    };

    poll();
    const interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
  }, [streamerId]);

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await streamViewerService.endStream(streamId, streamerId);
      const createResponse = await streamViewerService.createStream({
        matchId,
        streamerId,
        streamerName,
        streamerWalletAddress,
      });
      if (createResponse.success && createResponse.stream) {
        onStreamKeyRegenerated(createResponse.stream.streamKey, createResponse.stream.id);
      }
    } catch (err) {
      console.error("Failed to regenerate stream key:", err);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#1E1E1E] bg-[#111] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E1E1E] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <Tv2 size={16} className="text-[#E8001D]" />
          <span className="font-mono-ctv text-[10px] font-bold uppercase tracking-[0.16em] text-white">
            OBS Configuration
          </span>
        </div>
        <div
          className={`font-mono-ctv inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] ${
            isLive ? "text-[#E8001D]" : "text-white/35"
          }`}
        >
          {isLive ? (
            <Wifi size={12} className="animate-pulse" />
          ) : (
            <WifiOff size={12} />
          )}
          {isLive ? "Live" : "Offline"}
        </div>
      </div>

      <div className="space-y-4 p-5">
        {/* Streamer preview (HLS) — confirms the publish reached the server */}
        <StreamerHlsPreview streamKey={streamKey} isLive={isLive} />

        {/* Server field */}
        <div className="space-y-1.5">
          <label className="font-mono-ctv text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
            Server
          </label>
          <div className="flex gap-2">
            <div className="font-mono-ctv flex-1 truncate rounded-md border border-[#2A2A2A] bg-[#0d0d0d] px-3 py-2 text-[11px] text-white/80 select-all">
              {rtmpServer}
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(rtmpServer, "server")}
              className="font-mono-ctv inline-flex shrink-0 items-center gap-1.5 rounded-md border border-[#2A2A2A] bg-[#0d0d0d] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/65 transition-colors hover:border-[#3A3A3A] hover:text-white"
            >
              <Copy size={11} />
              {copied === "server" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* Stream key field */}
        <div className="space-y-1.5">
          <label className="font-mono-ctv text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
            Stream Key
          </label>
          <div className="flex gap-2">
            <div className="font-mono-ctv flex-1 truncate rounded-md border border-[#2A2A2A] bg-[#0d0d0d] px-3 py-2 text-[11px] text-white/80 select-all">
              {keyVisible ? streamKey : "•".repeat(24)}
            </div>
            <button
              type="button"
              aria-label={keyVisible ? "Hide stream key" : "Show stream key"}
              onClick={() => setKeyVisible(!keyVisible)}
              className="inline-flex shrink-0 items-center justify-center rounded-md border border-[#2A2A2A] bg-[#0d0d0d] px-3 py-2 text-white/55 transition-colors hover:border-[#3A3A3A] hover:text-white"
            >
              {keyVisible ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
            <button
              type="button"
              onClick={() => copyToClipboard(streamKey, "key")}
              className="font-mono-ctv inline-flex shrink-0 items-center gap-1.5 rounded-md border border-[#2A2A2A] bg-[#0d0d0d] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/65 transition-colors hover:border-[#3A3A3A] hover:text-white"
            >
              <Copy size={11} />
              {copied === "key" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* Full URL */}
        <p className="font-mono-ctv break-all text-[10px] text-white/30">
          {fullUrl}
        </p>

        {/* Regenerate */}
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="font-mono-ctv inline-flex items-center gap-1.5 rounded-md border border-[#2A2A2A] bg-[#0d0d0d] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/65 transition-colors hover:border-[#3A3A3A] hover:text-white disabled:opacity-40"
        >
          <RefreshCw size={11} className={isRegenerating ? "animate-spin" : ""} />
          {isRegenerating ? "Regenerating…" : "Regenerate Key"}
        </button>

        {/* OBS Instructions (collapsible) */}
        <div className="rounded-md border border-[#1E1E1E] overflow-hidden">
          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="font-mono-ctv flex w-full items-center justify-between px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/55 transition-colors hover:bg-[#161616]"
          >
            <span>OBS Setup Instructions</span>
            {showInstructions ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          {showInstructions && (
            <ol className="space-y-2 border-t border-[#1E1E1E] px-4 pb-4 pt-3 text-[11px] font-light leading-relaxed text-white/55 list-decimal list-inside">
              <li>Open OBS Studio → Settings → Stream</li>
              <li>
                Service: <span className="text-white">Custom…</span>
              </li>
              <li>
                Server: paste the <span className="text-white">Server</span> URL above
              </li>
              <li>
                Stream Key: paste the <span className="text-white">Stream Key</span> above
              </li>
              <li>
                Click Apply, then press <span className="text-white">Start Streaming</span> in OBS
              </li>
              <li>
                The <span className="text-[#E8001D]">Live</span> badge updates within ~4 s
              </li>
            </ol>
          )}
        </div>

        {/* End stream */}
        <button
          type="button"
          onClick={onStreamEnded}
          className="font-mono-ctv inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#FF1737]"
          style={{ background: "#E8001D" }}
        >
          <Square size={13} />
          End Stream
        </button>
      </div>
    </div>
  );
}
