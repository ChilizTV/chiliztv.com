/**
 * @notice Stream controls for camera and microphone
 * @dev Toggle buttons for video/audio during stream
 */

import { Button } from "@/components/ui/button";
import { Video, VideoOff, Mic, MicOff } from "lucide-react";

interface StreamControlsProps {
  sourceType: "camera" | "screen" | "both" | "obs";
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  cameraVisible?: boolean;
  onToggleCamera: () => void;
  onToggleMicrophone: () => void;
  onToggleCameraVisibility?: () => void;
  isStreaming?: boolean;
}

/**
 * @notice Render stream control buttons
 * @param props Control button configuration
 */
export function StreamControls({
  sourceType,
  cameraEnabled,
  microphoneEnabled,
  cameraVisible,
  onToggleCamera,
  onToggleMicrophone,
  onToggleCameraVisibility,
  isStreaming = false,
}: StreamControlsProps) {
  const getButtonClass = (enabled: boolean) => {
    return enabled
      ? "bg-blue-600 hover:bg-blue-700 text-white"
      : "bg-zinc-800 border-zinc-700 text-gray-300 hover:bg-zinc-700";
  };

  // Controls for "both" mode while streaming
  if (sourceType === "both" && isStreaming) {
    return (
      <div className="flex gap-2">
        <Button
          type="button"
          variant={cameraVisible ? "default" : "outline"}
          onClick={onToggleCameraVisibility}
          size="sm"
          className={getButtonClass(cameraVisible ?? false)}
        >
          {cameraVisible ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
        </Button>
        <Button
          type="button"
          variant={microphoneEnabled ? "default" : "outline"}
          onClick={onToggleMicrophone}
          size="sm"
          className={getButtonClass(microphoneEnabled)}
        >
          {microphoneEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </Button>
      </div>
    );
  }

  // Controls for setup (camera or both mode)
  if ((sourceType === "camera" || sourceType === "both") && !isStreaming) {
    return (
      <div className="flex gap-2">
        {sourceType === "camera" && (
          <Button
            type="button"
            variant={cameraEnabled ? "default" : "outline"}
            onClick={onToggleCamera}
            size="sm"
            className={getButtonClass(cameraEnabled)}
          >
            {cameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </Button>
        )}
        <Button
          type="button"
          variant={microphoneEnabled ? "default" : "outline"}
          onClick={onToggleMicrophone}
          size="sm"
          className={getButtonClass(microphoneEnabled)}
        >
          {microphoneEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </Button>
      </div>
    );
  }

  return null;
}
