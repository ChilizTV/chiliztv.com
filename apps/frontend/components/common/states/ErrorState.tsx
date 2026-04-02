/**
 * @notice Error state component with retry button
 * @dev Centered error message with retry action
 */
export function ErrorState({
  message = "Error loading data",
  onRetry,
}: Readonly<{
  message?: string;
  onRetry?: () => void;
}>) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white px-4 md:px-8 py-16 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
