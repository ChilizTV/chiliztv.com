/**
 * @notice Stream manager component for live streaming
 * @dev Handles media capture, canvas compositing, and stream lifecycle
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Play, Square, Loader2, CheckCircle, Tv2 } from "lucide-react";
import { streamClientService, streamViewerService } from "@/services";
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

  // Source and device state
  const [sourceType, setSourceType] = useState<"camera" | "screen" | "both" | "obs">("camera");
  // OBS mode: holds the stream created for OBS (separate from WHIP streaming state)
  const [obsStream, setObsStream] = useState<LiveStream | null>(null);
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
          newStream.streamKey,
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
        await streamClientService.startStream(newStream.streamKey, streamResult.stream);
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
    try {
      const currentStreamValue = currentStreamRef.current;
      const cameraStreamValue = cameraStreamRef.current;
      const screenStreamValue = screenStreamRef.current;
      const streamValue = streamRef.current;
      const userValue = userRef.current;

      if (!streamValue || !userValue || !userValue.userId) {
        return;
      }

      streamClientService.stopStream();
      await streamViewerService.endStream(streamValue.id, userValue.userId);

      stopMediaStream(currentStreamValue);
      stopMediaStream(cameraStreamValue);
      stopMediaStream(screenStreamValue);

      setCurrentStream(null);
      setCameraStream(null);
      setScreenStream(null);
      setStream(null);
      setIsStreaming(false);
      onStreamEndedRef.current?.();
    } catch (error) {
      console.error("Error ending stream:", error);
      setError("Failed to end stream");
    }
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
      <div ref={previewContainerRef} className={`${portalTarget ? 'w-full h-full' : 'w-full aspect-video'} bg-black rounded-lg overflow-hidden border border-zinc-800 relative`}>
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
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="border-b border-zinc-800">
          <CardTitle className="flex items-center gap-2 text-white">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Your Stream is Live
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded text-sm">
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

          <div className="text-sm text-gray-400 space-y-1">
            <p>Streaming to Match {matchId}</p>
            <p className="text-xs text-gray-500">Stream Key: {stream?.streamKey}</p>
          </div>

          <Button onClick={handleEndStream} variant="destructive" className="w-full bg-red-600 hover:bg-red-700">
            <Square className="w-4 h-4 mr-2" />
            End Stream
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="border-b border-zinc-800">
        <CardTitle className="text-white">Start Your Stream</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <SourceSelector sourceType={sourceType} onSourceChange={(s) => { setSourceType(s); setObsStream(null); }} />

        {sourceType === "obs" ? (
          obsStream ? (
            <OBSSetupPanel
              streamKey={obsStream.streamKey}
              streamId={obsStream.id}
              matchId={matchId}
              streamerId={user?.userId ?? ""}
              streamerName={user?.username ?? "Anonymous"}
              streamerWalletAddress={primaryWallet?.address}
              onStreamKeyRegenerated={(newKey, newStreamId) =>
                setObsStream((prev) => prev ? { ...prev, streamKey: newKey, id: newStreamId } : null)
              }
              onStreamEnded={() => setObsStream(null)}
            />
          ) : (
            <Button
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
                  });
                  if (res.success && res.stream) {
                    setObsStream(res.stream);
                  }
                } finally {
                  setObsLoading(false);
                }
              }}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              disabled={obsLoading}
            >
              {obsLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating stream...</>
              ) : (
                <><Tv2 className="w-4 h-4 mr-2" />Get OBS Stream Key</>
              )}
            </Button>
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

            <Input
              placeholder="Stream title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />

            <Button onClick={handleStartStream} className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isStreaming}>
              {isStreaming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Starting Stream...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Your Stream
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
