import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";
import type { Prediction } from "@/types/api.types";
import { formatDateTime } from "@/lib/utils/formatting/date";
import { formatDecimal } from "@/lib/utils/formatting/number";

/**
 * @notice Parse predicted team from string or JSON
 * @dev Handles both plain strings and JSON-stringified objects
 */
function parsePredictedTeam(predictedTeam: string): string {
  try {
    const parsed = JSON.parse(predictedTeam);
    return parsed.name || predictedTeam;
  } catch {
    return predictedTeam;
  }
}

/**
 * @notice Predictions history tab content
 * @dev Shows table of user's betting predictions with status
 */
export function PredictionsTab({
  isLoading,
  predictions,
  walletAddress,
}: Readonly<{
  isLoading: boolean;
  predictions: Prediction[];
  walletAddress: string | undefined;
}>) {
  return (
    <Card className="bg-[#0f0f0f] border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Recent Predictions History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-white/60">Loading your predictions...</p>
          </div>
        ) : predictions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <History className="w-12 h-12 text-white/20 mb-4" />
            <p className="text-white/60 text-center">
              {!walletAddress
                ? "Connect your wallet to see your predictions"
                : "You haven't placed any predictions yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  {["Date & Time", "Match", "Prediction", "Odds", "Status"].map((heading) => (
                    <TableHead key={heading} className="text-white/80">
                      {heading}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {predictions.map((prediction) => (
                  <TableRow key={prediction.id} className="border-white/10">
                    <TableCell className="text-white/80">
                      {formatDateTime(new Date(prediction.createdAt))}
                    </TableCell>
                    <TableCell className="text-white">{prediction.matchName}</TableCell>
                    <TableCell className="text-white/80">{parsePredictedTeam(prediction.predictedTeam)}</TableCell>
                    <TableCell className="text-white/80">{formatDecimal(prediction.odds, 2)}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          prediction.status.toUpperCase() === "WON"
                            ? "bg-green-500/20 text-green-500"
                            : prediction.status.toUpperCase() === "LOST"
                            ? "bg-red-500/20 text-red-500"
                            : prediction.status.toUpperCase() === "PENDING"
                            ? "bg-yellow-500/20 text-yellow-500"
                            : "bg-blue-500/20 text-blue-500"
                        }
                      >
                        {prediction.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
