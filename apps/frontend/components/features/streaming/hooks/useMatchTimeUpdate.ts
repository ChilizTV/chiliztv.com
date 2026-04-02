import { useState, useEffect } from "react";

/**
 * @notice Hook for auto-refreshing current time
 * @dev Updates every 60 seconds to refresh live match minutes
 * @return Current date that updates every minute
 */
export function useMatchTimeUpdate(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  return now;
}
