"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Eye, EyeOff, RefreshCw, Wifi, WifiOff, ChevronDown, ChevronUp, Tv2, Square } from "lucide-react";
import { streamViewerService, ApiService } from "@/services";

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
  // NEXT_PUBLIC_RTMP_URL = "rtmp://localhost:1935/live" (the full OBS "Server" field value)
  const rtmpServer = process.env.NEXT_PUBLIC_RTMP_URL ?? "rtmp://localhost:1935/live";
  const fullUrl = `${rtmpServer}/${streamKey}`;

  const [keyVisible, setKeyVisible] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const isLiveRef = useRef(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Poll live status every 4 seconds via GET /stream?streamerId=X
  useEffect(() => {
    const poll = async () => {
      try {
        const response = await axios.get(`${ApiService.baseURL}/stream`, {
          params: { streamerId },
        });
        const streams: { status: string }[] = response.data?.streams ?? [];
        const nowLive = streams.length > 0 && streams[0].status === 'live';
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
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="border-b border-zinc-800">
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Tv2 className="w-5 h-5 text-orange-400" />
            OBS Configuration
          </div>
          <div className={`flex items-center gap-1.5 text-sm font-medium ${isLive ? "text-red-400" : "text-gray-500"}`}>
            {isLive ? <Wifi className="w-4 h-4 animate-pulse" /> : <WifiOff className="w-4 h-4" />}
            {isLive ? "LIVE" : "Offline"}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {/* Server field */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Server</label>
          <div className="flex gap-2">
            <div className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white font-mono truncate select-all">
              {rtmpServer}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(rtmpServer, "server")}
              className="shrink-0 border-zinc-700 bg-zinc-800 text-gray-300 hover:bg-zinc-700"
            >
              <Copy className="w-3.5 h-3.5 mr-1" />
              {copied === "server" ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>

        {/* Stream Key field */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Stream Key</label>
          <div className="flex gap-2">
            <div className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white font-mono truncate select-all">
              {keyVisible ? streamKey : "•".repeat(24)}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setKeyVisible(!keyVisible)}
              className="shrink-0 border-zinc-700 bg-zinc-800 text-gray-300 hover:bg-zinc-700"
            >
              {keyVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(streamKey, "key")}
              className="shrink-0 border-zinc-700 bg-zinc-800 text-gray-300 hover:bg-zinc-700"
            >
              <Copy className="w-3.5 h-3.5 mr-1" />
              {copied === "key" ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>

        {/* Full URL (for advanced users) */}
        <p className="text-xs text-gray-500 font-mono break-all">
          Full URL: {fullUrl}
        </p>

        {/* Actions row */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="border-zinc-700 bg-zinc-800 text-gray-300 hover:bg-zinc-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRegenerating ? "animate-spin" : ""}`} />
            {isRegenerating ? "Regenerating..." : "Regenerate Key"}
          </Button>
        </div>

        {/* OBS Instructions (collapsible) */}
        <div className="border border-zinc-700 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-300 hover:bg-zinc-800 transition-colors"
          >
            <span className="font-medium">OBS Setup Instructions</span>
            {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showInstructions && (
            <ol className="px-4 pb-4 pt-1 space-y-2 text-sm text-gray-400 list-decimal list-inside border-t border-zinc-700">
              <li>Open OBS Studio → Settings → Stream</li>
              <li>Service: <span className="text-white">Custom...</span></li>
              <li>Server: paste the <span className="text-white">Server</span> URL above</li>
              <li>Stream Key: paste the <span className="text-white">Stream Key</span> above</li>
              <li>Click Apply, then press <span className="text-white">Start Streaming</span> in OBS</li>
              <li>The <span className="text-red-400">LIVE</span> badge will update within ~4s</li>
            </ol>
          )}
        </div>

        {/* End Stream */}
        <Button
          type="button"
          onClick={onStreamEnded}
          variant="destructive"
          className="w-full bg-red-600 hover:bg-red-700"
        >
          <Square className="w-4 h-4 mr-2" />
          End Stream
        </Button>
      </CardContent>
    </Card>
  );
}
