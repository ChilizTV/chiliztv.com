import { RefreshCw } from "lucide-react";

/**
 * @notice Loading state component with spinner
 * @dev Centered display with animated spinner icon
 */
export function LoadingState({ message = "Loading..." }: Readonly<{ message?: string }>) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white px-4 md:px-8 py-16 flex items-center justify-center">
      <div className="text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
        <p className="text-gray-400">{message}</p>
      </div>
    </div>
  );
}
