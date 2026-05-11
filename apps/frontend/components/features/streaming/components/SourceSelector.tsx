/**
 * Source selection — OBS as the recommended primary path (D9), with the
 * browser pipeline (camera/screen/both) tucked into a "Quick test" sub-grid.
 */

import { User, Monitor, Video, Tv2 } from "lucide-react";

type SourceType = "camera" | "screen" | "both" | "obs";

interface SourceSelectorProps {
  sourceType: SourceType;
  onSourceChange: (source: SourceType) => void;
}

interface BrowserTileProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  sub: string;
}

function BrowserTile({ active, onClick, icon, label, sub }: BrowserTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex items-start gap-3 bg-[#111] p-3 text-left transition-colors hover:bg-[#161616]"
      style={{ background: active ? "rgba(232,0,29,0.08)" : undefined }}
    >
      {active && <span aria-hidden className="absolute left-0 top-0 h-full w-1 bg-[#E8001D]" />}
      <span className={active ? "text-[#E8001D]" : "text-white/55"}>{icon}</span>
      <div className="min-w-0">
        <div className="font-display text-[13px] font-extrabold uppercase tracking-tight text-white">
          {label}
        </div>
        <div className="mt-0.5 text-[10px] font-light text-white/55">{sub}</div>
      </div>
    </button>
  );
}

export function SourceSelector({ sourceType, onSourceChange }: SourceSelectorProps) {
  const obsActive = sourceType === "obs";
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => onSourceChange("obs")}
        className="relative flex w-full items-start gap-4 overflow-hidden rounded-md border p-5 text-left transition-colors"
        style={{
          borderColor: obsActive ? "rgba(232,0,29,0.45)" : "#1E1E1E",
          background: obsActive
            ? "linear-gradient(90deg, rgba(232,0,29,0.12) 0%, rgba(232,0,29,0.03) 60%, transparent 100%)"
            : "#111",
        }}
      >
        {obsActive && (
          <span aria-hidden className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #E8001D, transparent)" }} />
        )}
        <span className={obsActive ? "text-[#E8001D]" : "text-white/55"}>
          <Tv2 size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono-ctv text-[9px] font-bold uppercase tracking-[0.18em] text-[#E8001D]">
              Recommended
            </span>
          </div>
          <div className="font-display mt-1 text-[18px] font-extrabold uppercase tracking-tight text-white">
            OBS Studio · RTMP
          </div>
          <div className="font-mono-ctv mt-1 text-[11px] uppercase tracking-[0.12em] text-white/55">
            Configure once, restart anytime. Push from OBS or any RTMP encoder.
          </div>
        </div>
      </button>

      <div>
        <div className="font-mono-ctv mb-2 inline-flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
          <span aria-hidden className="block h-0.5 w-4 bg-white/25" />
          Or quick-test with your browser
        </div>
        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-md bg-[#1E1E1E]">
          <BrowserTile
            active={sourceType === "camera"}
            onClick={() => onSourceChange("camera")}
            icon={<User size={14} />}
            label="Camera"
            sub="Webcam only"
          />
          <BrowserTile
            active={sourceType === "screen"}
            onClick={() => onSourceChange("screen")}
            icon={<Monitor size={14} />}
            label="Screen"
            sub="Share screen"
          />
          <BrowserTile
            active={sourceType === "both"}
            onClick={() => onSourceChange("both")}
            icon={<Video size={14} />}
            label="Both"
            sub="Cam + screen"
          />
        </div>
      </div>
    </div>
  );
}
