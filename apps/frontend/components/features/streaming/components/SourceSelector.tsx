/**
 * @notice Source selection component for stream setup
 * @dev Allows user to choose between camera, screen, both, or OBS
 */

import { User, Monitor, Video, Tv2 } from "lucide-react";

type SourceType = "camera" | "screen" | "both" | "obs";

interface SourceSelectorProps {
  sourceType: SourceType;
  onSourceChange: (source: SourceType) => void;
}

interface ModeTileProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  sub: string;
}

function ModeTile({ active, onClick, icon, label, sub }: ModeTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex items-start gap-3 bg-[#111] p-4 text-left transition-colors hover:bg-[#161616]"
      style={{ background: active ? "rgba(232,0,29,0.08)" : undefined }}
    >
      {active && <span aria-hidden className="absolute left-0 top-0 h-full w-1 bg-[#E8001D]" />}
      <span className={active ? "text-[#E8001D]" : "text-white/55"}>{icon}</span>
      <div className="min-w-0">
        <div className="font-display text-[14px] font-extrabold uppercase tracking-tight text-white">
          {label}
        </div>
        <div className="mt-0.5 text-[11px] font-light text-white/55">{sub}</div>
      </div>
    </button>
  );
}

export function SourceSelector({ sourceType, onSourceChange }: SourceSelectorProps) {
  return (
    <div>
      <div className="font-mono-ctv mb-2 inline-flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
        <span aria-hidden className="block h-0.5 w-4 bg-white/25" />
        Source
      </div>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-[#1E1E1E] sm:grid-cols-4">
        <ModeTile
          active={sourceType === "camera"}
          onClick={() => onSourceChange("camera")}
          icon={<User size={14} />}
          label="Camera"
          sub="Webcam only"
        />
        <ModeTile
          active={sourceType === "screen"}
          onClick={() => onSourceChange("screen")}
          icon={<Monitor size={14} />}
          label="Screen"
          sub="Share screen"
        />
        <ModeTile
          active={sourceType === "both"}
          onClick={() => onSourceChange("both")}
          icon={<Video size={14} />}
          label="Both"
          sub="Cam + screen"
        />
        <ModeTile
          active={sourceType === "obs"}
          onClick={() => onSourceChange("obs")}
          icon={<Tv2 size={14} />}
          label="OBS / RTMP"
          sub="Push from OBS"
        />
      </div>
    </div>
  );
}
