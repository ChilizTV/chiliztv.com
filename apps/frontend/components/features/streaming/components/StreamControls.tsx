import { type ReactNode } from "react";
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

function ControlButton({
  active,
  onClick,
  activeIcon,
  inactiveIcon,
  ariaLabel,
}: {
  active: boolean;
  onClick: () => void;
  activeIcon: ReactNode;
  inactiveIcon: ReactNode;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-md border px-3 py-2 transition-colors"
      style={
        active
          ? { background: "#E8001D", borderColor: "transparent", color: "#fff" }
          : {
              background: "#0d0d0d",
              borderColor: "#2A2A2A",
              color: "rgba(255,255,255,0.55)",
            }
      }
    >
      {active ? activeIcon : inactiveIcon}
    </button>
  );
}

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
  if (sourceType === "both" && isStreaming) {
    return (
      <div className="flex gap-2">
        <ControlButton
          active={cameraVisible ?? false}
          onClick={onToggleCameraVisibility ?? (() => {})}
          activeIcon={<Video size={15} />}
          inactiveIcon={<VideoOff size={15} />}
          ariaLabel={cameraVisible ? "Hide camera overlay" : "Show camera overlay"}
        />
        <ControlButton
          active={microphoneEnabled}
          onClick={onToggleMicrophone}
          activeIcon={<Mic size={15} />}
          inactiveIcon={<MicOff size={15} />}
          ariaLabel={microphoneEnabled ? "Mute microphone" : "Unmute microphone"}
        />
      </div>
    );
  }

  if ((sourceType === "camera" || sourceType === "both") && !isStreaming) {
    return (
      <div className="flex gap-2">
        {sourceType === "camera" && (
          <ControlButton
            active={cameraEnabled}
            onClick={onToggleCamera}
            activeIcon={<Video size={15} />}
            inactiveIcon={<VideoOff size={15} />}
            ariaLabel={cameraEnabled ? "Disable camera" : "Enable camera"}
          />
        )}
        <ControlButton
          active={microphoneEnabled}
          onClick={onToggleMicrophone}
          activeIcon={<Mic size={15} />}
          inactiveIcon={<MicOff size={15} />}
          ariaLabel={microphoneEnabled ? "Mute microphone" : "Unmute microphone"}
        />
      </div>
    );
  }

  return null;
}
