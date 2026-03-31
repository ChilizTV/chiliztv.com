/**
 * @notice Not logged in state for stream manager
 * @dev Displays message when user is not authenticated
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

/**
 * @notice Render not logged in state
 */
export function StreamNotLoggedIn() {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="p-6">
        <p className="text-gray-400 mb-4">Log in to start your own stream</p>
        <Button disabled className="bg-zinc-800 text-gray-400">
          <User className="w-4 h-4 mr-2" />
          Start Your Stream
        </Button>
      </CardContent>
    </Card>
  );
}
