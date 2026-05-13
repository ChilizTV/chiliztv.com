/**
 * @notice Stream manager component for live streaming
 * @dev Handles media capture, canvas compositing, and stream lifecycle
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Play, Square, Loader2, CheckCircle, Tv2, Video } from "lucide-react";
import { streamClientService, streamViewerService } from "@/services";
import VideoPlayer from "@/components/live/VideoPlayer";
import { LiveStream } from "@/models/stream.model";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import {
  StreamNotLoggedIn,
  SourceSelector,
  StreamControls,
  CameraOverlay,
} from "./components";
import {
  getMediaStream,
  stopMediaStream,
  toggleAudioTracks,
  drawCombinedStream,
} from "./utils";
import { OBSSetupPanel } from "./OBSSetupPanel";
import { useStreamHeartbeat } from "./hooks/useStreamHeartbeat";
import { useBeaconOnUnload } from "./hooks/useBeaconOnUnload";

// TODO(refactor): split StreamManager — exceeds 350 LOC soft limit (CLAUDE.md §3.3).
// Candidate split: StreamManagerBrowser (WebRTC pipeline) + StreamManagerOBS (OBSSetupPanel host).

interface StreamManagerProps {
  matchId: number;
  onStreamCreated?: (stream: LiveStream) => void;
  onStreamEnded?: () => void;
  portalTarget?: HTMLDivElement | null;
  endStreamRef?: React.MutableRefObject<(() => Promise<void>) | null>;
}

/**
 * @notice Main stream manager component
 * @param matchId Match ID for streaming
 * @param onStreamCreated Callback when stream is created
 * @param onStreamEnded Callback when stream ends
 * @param portalTarget When provided, the preview renders via portal into this container
 */
export default function StreamManager({ matchId, onStreamCreated, onStreamEnded, portalTarget, endStreamRef }: StreamManagerProps) {
  const { user, primaryWallet } = useDynamicContext();

  // Streaming state
  const [isStreaming, setIsStreaming] = useState(false);
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  // Source and device state — defaults to OBS (D9 OBS-first repositioning).
  // Browser modes (camera/screen/both) are exposed as a secondary "Quick test" card.
  const [sourceType, setSourceType] = useState<"camera" | "screen" | "both" | "obs">("obs");
  // OBS mode: holds the stream created for OBS (separate from WHIP streaming state)
  const [obsStream, setObsStream] = useState<LiveStream | null>(null);
  const [obsIsLive, setObsIsLive] = useState(false);
  const [obsLoading, setObsLoading] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);

  // Media streams
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

  // Camera overlay state
  const [cameraVisible, setCameraVisible] = useState(true);
  const [cameraPosition, setCameraPosition] = useState({ x: 20, y: 20 });
  const [cameraSize, setCameraSize] = useState({ width: 200, height: 150 });

  // Drag and resize state
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Refs for tracking without re-renders
  const cameraPositionRef = useRef(cameraPosition);
  const cameraSizeRef = useRef(cameraSize);
  const cameraVisibleRef = useRef(cameraVisible);
  const canvasOffsetRef = useRef({ x: 0, y: 0 });
  const canvasScaleRef = useRef({ x: 1, y: 1 });
  // State copy of canvas metrics so CameraOverlay re-renders when they change
  const [canvasOverlayMetrics, setCanvasOverlayMetrics] = useState({
    offset: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
  });
  const isStreamingRef = useRef(false);
  const streamRef = useRef<LiveStream | null>(null);
  const userRef = useRef(user);
  const currentStreamRef = useRef<MediaStream | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const onStreamEndedRef = useRef(onStreamEnded);

  // Update refs when values change
  useEffect(() => {
    isStreamingRef.current = isStreaming;
    streamRef.current = stream;
    userRef.current = user;
    currentStreamRef.current = currentStream;
    cameraStreamRef.current = cameraStream;
    screenStreamRef.current = screenStream;
    onStreamEndedRef.current = onStreamEnded;
  }, [isStreaming, stream, user, currentStream, cameraStream, screenStream, onStreamEnded]);

  useEffect(() => {
    cameraPositionRef.current = cameraPosition;
    cameraSizeRef.current = cameraSize;
    cameraVisibleRef.current = cameraVisible;
  }, [cameraPosition, cameraSize, cameraVisible]);

  // Browser-only lifecycle pings. OBS stream lifecycle is driven by Cloudflare Stream webhooks
  // and never calls these endpoints.
  const isBrowserPipeline = sourceType !== "obs";
  useStreamHeartbeat({
    streamId: stream?.id ?? null,
    streamerId: user?.userId ?? null,
    enabled: isStreaming && isBrowserPipeline,
  });
  useBeaconOnUnload({
    streamId: stream?.id ?? null,
    streamerId: user?.userId ?? null,
    enabled: isStreaming && isBrowserPipeline,
  });

  // Calculate canvas scale for overlay positioning.
  // The preview canvas is always 1280×720 internally (CSS scales to container).
  // cameraPosition is in 1280×720 coordinate space — scale = containerPx / streamPx.
  useEffect(() => {
    if (sourceType === "both" && isStreaming && previewContainerRef.current) {
      const container = previewContainerRef.current;

      const updateCanvasMetrics = () => {
        const { width, height } = container.getBoundingClientRect();
        // Guard: container not yet laid out — skip to avoid scale={x:0,y:0}
        if (width === 0 || height === 0) return;
        const offset = { x: 0, y: 0 };
        const scale = { x: width / 1280, y: height / 720 };
        canvasOffsetRef.current = offset;
        canvasScaleRef.current = scale;
        setCanvasOverlayMetrics({ offset, scale });
      };

      // Defer initial measurement by one frame so the portal target is fully laid out
      requestAnimationFrame(updateCanvasMetrics);
      window.addEventListener("resize", updateCanvasMetrics);
      return () => window.removeEventListener("resize", updateCanvasMetrics);
    }
  }, [sourceType, isStreaming]);

  // Set up video elements and start canvas compositing
  useEffect(() => {
    if (isStreaming && sourceType === "both" && screenStream && cameraStream) {
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = screenStream;
        screenVideoRef.current.addEventListener("loadedmetadata", async () => {
          try {
            await screenVideoRef.current?.play();
          } catch (err) {
            console.error("❌ Error playing screen video:", err);
          }
        });
      }
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = cameraStream;
        cameraVideoRef.current.addEventListener("loadedmetadata", async () => {
          try {
            await cameraVideoRef.current?.play();
          } catch (err) {
            console.error("❌ Error playing camera video:", err);
          }
        });
      }
      setTimeout(() => {
        startCombiningStreams();
      }, 500);
    } else if (isStreaming && videoRef.current && currentStream) {
      videoRef.current.srcObject = currentStream;
    }
  }, [isStreaming, currentStream, screenStream, cameraStream, sourceType, portalTarget]);

  // Update overlay settings in streaming service
  useEffect(() => {
    if (isStreaming && sourceType === "both" && previewContainerRef.current) {
      const container = previewContainerRef.current;
      const rect = container.getBoundingClientRect();
      streamClientService.updateOverlaySettings(
        cameraPosition,
        cameraSize,
        cameraVisible,
        rect.width,
        rect.height
      );
    }
  }, [isStreaming, sourceType, cameraPosition, cameraSize, cameraVisible]);

  /**
   * @notice Start combining screen and camera streams in canvas
   */
  const startCombiningStreams = () => {
    if (!canvasRef.current || !screenVideoRef.current || !cameraVideoRef.current) {
      console.warn("⚠️ Cannot start combining streams: missing refs");
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("❌ Cannot get canvas context");
      return;
    }

    const updateCanvas = () => {
      if (!canvas || !ctx || !screenVideoRef.current || !cameraVideoRef.current || !previewContainerRef.current) return;

      const container = previewContainerRef.current;
      const containerRect = container.getBoundingClientRect();

      drawCombinedStream(
        canvas,
        ctx,
        screenVideoRef.current,
        cameraVideoRef.current,
        cameraPositionRef.current,
        cameraSizeRef.current,
        cameraVisibleRef.current,
        containerRect.width,
        containerRect.height
      );

      requestAnimationFrame(updateCanvas);
    };

    const checkReady = () => {
      if (
        screenVideoRef.current &&
        cameraVideoRef.current &&
        screenVideoRef.current.readyState >= 2 &&
        cameraVideoRef.current.readyState >= 2
      ) {
        updateCanvas();
      } else {
        setTimeout(checkReady, 100);
      }
    };

    checkReady();
  };

  /**
   * @notice Handle stream start
   */
  const handleStartStream = async () => {
    if (sourceType === "obs") return; // OBS uses its own flow — TypeScript narrows after this guard
    if (!user) {
      setError("Please log in to start a stream");
      return;
    }

    try {
      setError(null);

      const streamResult = await getMediaStream(sourceType, cameraEnabled, microphoneEnabled);

      if (!streamResult.stream) {
        console.error("❌ No media stream obtained");
        return;
      }

      setCurrentStream(streamResult.stream);

      if (streamResult.cameraStream) setCameraStream(streamResult.cameraStream);
      if (streamResult.screenStream) setScreenStream(streamResult.screenStream);

      const createResponse = await streamViewerService.createStream({
        matchId,
        streamerId: user.userId || "",
        streamerName: user.username || "Anonymous",
        streamerWalletAddress: primaryWallet?.address,
        title: title.trim() || undefined,
        sourceType: "browser",
      });

      if (!createResponse.success || !createResponse.stream) {
        throw new Error(createResponse.error || "Failed to create stream");
      }

      const newStream = createResponse.stream;
      setStream(newStream);

      if (sourceType === "both" && streamResult.screenStream && streamResult.cameraStream) {
        const container = previewContainerRef.current;
        const containerRect = container?.getBoundingClientRect();

        if (containerRect) {
          streamClientService.updateOverlaySettings(
            cameraPosition,
            cameraSize,
            cameraVisible,
            containerRect.width,
            containerRect.height
          );
        }

        await streamClientService.startStreamWithOverlay(
          newStream.cloudflareWebRtcPublishUrl ?? '',
          streamResult.screenStream,
          streamResult.cameraStream,
          cameraPosition,
          cameraSize,
          cameraVisible,
          containerRect?.width,
          containerRect?.height,
          streamResult.microphoneStream
        );
      } else {
        await streamClientService.startStream(newStream.cloudflareWebRtcPublishUrl ?? '', streamResult.stream);
      }

      setIsStreaming(true);
      onStreamCreated?.(newStream);
    } catch (error) {
      console.error("Error starting stream:", error);
      setError(error instanceof Error ? error.message : "Failed to start stream");
      if (currentStream) {
        stopMediaStream(currentStream);
        setCurrentStream(null);
      }
    }
  };

  /**
   * @notice Handle stream end
   */
  const handleEndStream = useCallback(async () => {
    const currentStreamValue = currentStreamRef.current;
    const cameraStreamValue = cameraStreamRef.current;
    const screenStreamValue = screenStreamRef.current;
    const streamValue = streamRef.current;
    const userValue = userRef.current;

    if (!streamValue || !userValue || !userValue.userId) {
      return;
    }

    // Optimistic UI: clear local + parent state immediately so the user sees the
    // stream disappear the moment they click "End stream". The backend call to
    // mark the row as ended is fired in the background — Cloudflare Stream will
    // also webhook the backend on publisher disconnect.
    streamClientService.stopStream();
    stopMediaStream(currentStreamValue);
    stopMediaStream(cameraStreamValue);
    stopMediaStream(screenStreamValue);

    setCurrentStream(null);
    setCameraStream(null);
    setScreenStream(null);
    setStream(null);
    setIsStreaming(false);
    onStreamEndedRef.current?.();

    // Fire-and-forget — surface a console error if the API rejects.
    streamViewerService
      .endStream(streamValue.id, userValue.userId)
      .catch((error) => {
        console.error("Error ending stream on backend:", error);
      });
  }, []);

  // Expose handleEndStream to parent via ref
  useEffect(() => {
    if (endStreamRef) {
      endStreamRef.current = handleEndStream;
    }
  }, [endStreamRef, handleEndStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isStreamingRef.current) {
        handleEndStream();
      }
    };
  }, [handleEndStream]);

  /**
   * @notice Toggle controls
   */
  const toggleCamera = () => setCameraEnabled(!cameraEnabled);
  const toggleMicrophone = () => {
    const newState = !microphoneEnabled;
    setMicrophoneEnabled(newState);
    if (isStreaming && screenStream) {
      toggleAudioTracks(screenStream, newState);
    }
  };
  const toggleCameraVisibility = () => setCameraVisible(!cameraVisible);

  /**
   * @notice Handle camera overlay drag start
   */
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!cameraVisible) return;
    const container = previewContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setIsDragging(true);
    setIsResizing(false);
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const canvasMouseX = (mouseX - canvasOffsetRef.current.x) / canvasScaleRef.current.x;
    const canvasMouseY = (mouseY - canvasOffsetRef.current.y) / canvasScaleRef.current.y;
    setDragStart({
      x: canvasMouseX - cameraPosition.x,
      y: canvasMouseY - cameraPosition.y,
    });
  };

  /**
   * @notice Handle camera overlay resize start
   */
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsResizing(true);
    setIsDragging(false);
    const container = previewContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const canvasMouseX = (mouseX - canvasOffsetRef.current.x) / canvasScaleRef.current.x;
    const canvasMouseY = (mouseY - canvasOffsetRef.current.y) / canvasScaleRef.current.y;
    setDragStart({
      x: canvasMouseX - (cameraPosition.x + cameraSize.width),
      y: canvasMouseY - (cameraPosition.y + cameraSize.height),
    });
  };

  // Mouse move and up handlers for drag/resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const container = previewContainerRef.current;
      if (!container || !cameraVisible) return;

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const canvasMouseX = (mouseX - canvasOffsetRef.current.x) / canvasScaleRef.current.x;
      const canvasMouseY = (mouseY - canvasOffsetRef.current.y) / canvasScaleRef.current.y;

      if (isResizing) {
        const newWidth = canvasMouseX - dragStart.x - cameraPosition.x;
        const newHeight = canvasMouseY - dragStart.y - cameraPosition.y;
        const newSize = {
          width: Math.max(100, Math.min(newWidth, 600)),
          height: Math.max(75, Math.min(newHeight, 450)),
        };
        // Sync ref + service so rAF draws the new size on the same frame as the overlay re-render
        cameraSizeRef.current = newSize;
        streamClientService.updateOverlaySettings(cameraPositionRef.current, newSize, cameraVisibleRef.current);
        setCameraSize(newSize);
      } else if (isDragging) {
        const newCanvasX = canvasMouseX - dragStart.x;
        const newCanvasY = canvasMouseY - dragStart.y;
        // Bounds in 1280×720 canvas space (avoids border-box vs clientWidth mismatch)
        const maxX = 1280 - cameraSize.width;
        const maxY = 720 - cameraSize.height;
        const newPos = {
          x: Math.max(0, Math.min(newCanvasX, maxX)),
          y: Math.max(0, Math.min(newCanvasY, maxY)),
        };
        // Sync ref + service so rAF draws the new position on the same frame as the overlay re-render
        cameraPositionRef.current = newPos;
        streamClientService.updateOverlaySettings(newPos, cameraSizeRef.current, cameraVisibleRef.current);
        setCameraPosition(newPos);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, cameraVisible, dragStart, cameraPosition, cameraSize]);

  // Render states
  if (!user) {
    return <StreamNotLoggedIn />;
  }

  if (isStreaming) {
    const previewElement = (
      <div ref={previewContainerRef} className={`${portalTarget ? 'w-full h-full' : 'w-full aspect-video'} bg-black rounded-lg overflow-hidden border border-[#1E1E1E] relative`}>
        {sourceType === "both" && screenStream && cameraStream ? (
          <>
            <video
              ref={screenVideoRef}
              autoPlay
              muted
              playsInline
              style={{ position: "absolute", left: "-9999px", width: "1280px", height: "720px" }}
            />
            <video
              ref={cameraVideoRef}
              autoPlay
              muted
              playsInline
              style={{ position: "absolute", left: "-9999px", width: "640px", height: "480px" }}
            />
            <canvas ref={canvasRef} className="w-full h-full object-contain" style={{ display: "block" }} />
            <CameraOverlay
              position={cameraPosition}
              size={cameraSize}
              canvasOffset={canvasOverlayMetrics.offset}
              canvasScale={canvasOverlayMetrics.scale}
              visible={cameraVisible}
              onMouseDown={handleMouseDown}
              onResizeStart={handleResizeStart}
            />
          </>
        ) : (
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-contain" />
        )}
      </div>
    );

    return (
      <div className="space-y-4">
        <div className="font-mono-ctv inline-flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#2dd4a4]">
          <span aria-hidden className="block h-0.5 w-4 bg-[#2dd4a4]" />
          <CheckCircle size={12} />
          Your stream is live
        </div>

        {error && (
          <div className="font-mono-ctv rounded-md border border-[#E8001D]/30 bg-[#E8001D]/10 px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-[#FF1737]">
            {error}
          </div>
        )}

        {portalTarget
          ? createPortal(previewElement, portalTarget)
          : previewElement}

        <StreamControls
          sourceType={sourceType}
          cameraEnabled={cameraEnabled}
          microphoneEnabled={microphoneEnabled}
          cameraVisible={cameraVisible}
          onToggleCamera={toggleCamera}
          onToggleMicrophone={toggleMicrophone}
          onToggleCameraVisibility={toggleCameraVisibility}
          isStreaming={isStreaming}
        />

        <div className="rounded-md border border-[#1E1E1E] bg-[#0d0d0d] p-4">
          <div className="font-mono-ctv text-[9px] uppercase tracking-[0.18em] text-white/35">
            Streaming to
          </div>
          <div className="font-display mt-1 text-[16px] font-extrabold uppercase tracking-tight text-white">
            Match {matchId}
          </div>
          {stream?.streamKey && (
            <div className="font-mono-ctv mt-2 truncate text-[10px] text-white/35">
              Stream key: {stream.streamKey.slice(0, 12)}…
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleEndStream}
          className="font-mono-ctv inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#FF1737]"
          style={{ background: "#E8001D" }}
        >
          <Square size={13} />
          End stream
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      {/* Left — form */}
      <div className="flex flex-col gap-5">
        {error && (
          <div className="font-mono-ctv rounded-md border border-[#E8001D]/30 bg-[#E8001D]/10 px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-[#FF1737]">
            {error}
          </div>
        )}

        <SourceSelector
          sourceType={sourceType}
          onSourceChange={(s) => {
            setSourceType(s);
            setObsStream(null);
          }}
        />

        {sourceType === "obs" ? (
          obsStream ? (
            <OBSSetupPanel
              cloudflareRtmpsUrl={obsStream.cloudflareRtmpsUrl ?? ''}
              cloudflareRtmpsStreamKey={obsStream.cloudflareRtmpsStreamKey ?? ''}
              cloudflareInputUid={obsStream.cloudflareInputUid}
              streamId={obsStream.id}
              matchId={matchId}
              streamerId={user?.userId ?? ""}
              streamerName={user?.username ?? "Anonymous"}
              streamerWalletAddress={primaryWallet?.address}
              onIsLiveChange={setObsIsLive}
              onStreamRegenerated={(newStream) => { setObsStream(newStream); setObsIsLive(false); }}
              onStreamEnded={() => { setObsStream(null); setObsIsLive(false); }}
            />
          ) : (
            <div>
              <div className="font-mono-ctv mb-2 inline-flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
                <span aria-hidden className="block h-0.5 w-4 bg-white/25" />
                Stream title
              </div>
              <input
                type="text"
                placeholder="Optional"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                className="font-mono-ctv mb-4 w-full rounded-md border border-[#1E1E1E] bg-[#0d0d0d] px-3 py-2.5 text-[12px] text-white placeholder-white/35 outline-none transition-colors focus:border-[#E8001D]"
              />
              <button
                type="button"
                disabled={obsLoading}
                onClick={async () => {
                  if (!user) return;
                  setObsLoading(true);
                  try {
                    const res = await streamViewerService.createStream({
                      matchId,
                      streamerId: user.userId ?? "",
                      streamerName: user.username ?? "Anonymous",
                      streamerWalletAddress: primaryWallet?.address,
                      title: title.trim() || undefined,
                      sourceType: "obs",
                    });
                    if (res.success && res.stream) setObsStream(res.stream);
                  } finally {
                    setObsLoading(false);
                  }
                }}
                className="font-mono-ctv inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#FF1737] disabled:opacity-50"
                style={{ background: "#E8001D" }}
              >
                {obsLoading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Creating stream…
                  </>
                ) : (
                  <>
                    <Tv2 size={13} />
                    Get OBS stream key
                  </>
                )}
              </button>
            </div>
          )
        ) : (
          <>
            <StreamControls
              sourceType={sourceType}
              cameraEnabled={cameraEnabled}
              microphoneEnabled={microphoneEnabled}
              onToggleCamera={toggleCamera}
              onToggleMicrophone={toggleMicrophone}
              isStreaming={false}
            />

            <div>
              <div className="font-mono-ctv mb-2 inline-flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
                <span aria-hidden className="block h-0.5 w-4 bg-white/25" />
                Stream title
              </div>
              <input
                type="text"
                placeholder="Optional"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                className="font-mono-ctv w-full rounded-md border border-[#1E1E1E] bg-[#0d0d0d] px-3 py-2.5 text-[12px] text-white placeholder-white/35 outline-none transition-colors focus:border-[#E8001D]"
              />
            </div>

            <button
              type="button"
              onClick={handleStartStream}
              disabled={isStreaming}
              className="font-mono-ctv inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#FF1737] disabled:opacity-50"
              style={{ background: "#E8001D" }}
            >
              {isStreaming ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Starting stream…
                </>
              ) : (
                <>
                  <Play size={13} />
                  Go live now
                </>
              )}
            </button>
          </>
        )}
      </div>

      {/* Right — preview placeholder */}
      <div className="flex flex-col gap-4">
        <div className="font-mono-ctv inline-flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
          <span aria-hidden className="block h-0.5 w-4 bg-white/25" />
          Preview
        </div>
        {sourceType === "obs" && obsStream && obsIsLive ? (
          <VideoPlayer
            stream={obsStream}
            autoplay
            showControls={false}
            className="w-full rounded-lg overflow-hidden"
          />
        ) : (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-[#1E1E1E] bg-black">
            <span
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(60% 70% at 50% 50%, rgba(232,0,29,0.18), transparent 65%), linear-gradient(180deg, #1A0509 0%, #03110b 100%)",
              }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              {sourceType === "obs" ? (
                <>
                  <Tv2 size={28} className="text-white/55" />
                  <span className="font-mono-ctv text-[10px] uppercase tracking-[0.18em] text-white/45">
                    {obsStream ? "Waiting for OBS to connect…" : "Get a stream key to start"}
                  </span>
                </>
              ) : (
                <>
                  <Video size={28} className="text-white/55" />
                  <span className="font-mono-ctv text-[10px] uppercase tracking-[0.18em] text-white/45">
                    Camera will activate on Go live
                  </span>
                </>
              )}
            </div>
            <div className="absolute left-3 top-3">
              <span className="font-mono-ctv inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em]"
                style={{
                  color: "#fff",
                  background: "rgba(0,0,0,0.45)",
                  borderColor: "rgba(255,255,255,0.18)",
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-white/55" /> Off-air
              </span>
            </div>
          </div>
        )}

        <div className="rounded-md border border-[#1E1E1E] bg-[#111] p-4">
          <div className="font-mono-ctv inline-flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#F5C518]">
            <span aria-hidden className="block h-0.5 w-4 bg-[#F5C518]" />
            StreamWallet
          </div>
          <div className="mt-2 text-[12px] font-light leading-relaxed text-white/65">
            Tips and subs route to your dedicated{" "}
            <span className="font-mono-ctv text-white">StreamWallet</span> contract. Withdraw to your main wallet anytime — no platform custody.
          </div>
        </div>
      </div>
    </div>
  );
}
