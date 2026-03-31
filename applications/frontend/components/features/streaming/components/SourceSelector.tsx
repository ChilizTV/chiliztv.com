/**
 * @notice Source selection component for stream setup
 * @dev Allows user to choose between camera, screen, both, or OBS
 */

import { Button } from "@/components/ui/button";
import { User, Monitor, Video, Tv2 } from "lucide-react";

type SourceType = "camera" | "screen" | "both" | "obs";

interface SourceSelectorProps {
  sourceType: SourceType;
  onSourceChange: (source: SourceType) => void;
}

/**
 * @notice Render source selector buttons
 * @param sourceType Currently selected source
 * @param onSourceChange Callback when source changes
 */
export function SourceSelector({ sourceType, onSourceChange }: SourceSelectorProps) {
  const getButtonClass = (type: SourceType) => {
    const isSelected = sourceType === type;
    const activeColor = type === "obs" ? "bg-orange-600 hover:bg-orange-700" : "bg-blue-600 hover:bg-blue-700";
    return `flex-1 ${
      isSelected
        ? `${activeColor} text-white`
        : "bg-zinc-800 border-zinc-700 text-gray-300 hover:bg-zinc-700"
    }`;
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-300">Source</label>
      <div className="flex gap-2">
        <Button
          type="button"
          variant={sourceType === "camera" ? "default" : "outline"}
          onClick={() => onSourceChange("camera")}
          className={getButtonClass("camera")}
        >
          <User className="w-4 h-4 mr-2" />
          Camera
        </Button>
        <Button
          type="button"
          variant={sourceType === "screen" ? "default" : "outline"}
          onClick={() => onSourceChange("screen")}
          className={getButtonClass("screen")}
        >
          <Monitor className="w-4 h-4 mr-2" />
          Screen
        </Button>
        <Button
          type="button"
          variant={sourceType === "both" ? "default" : "outline"}
          onClick={() => onSourceChange("both")}
          className={getButtonClass("both")}
        >
          <Video className="w-4 h-4 mr-2" />
          Both
        </Button>
        <Button
          type="button"
          variant={sourceType === "obs" ? "default" : "outline"}
          onClick={() => onSourceChange("obs")}
          className={getButtonClass("obs")}
        >
          <Tv2 className="w-4 h-4 mr-2" />
          OBS
        </Button>
      </div>
    </div>
  );
}
