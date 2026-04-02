import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import type { Subscription } from "@/models/stream-wallet.model";
import { formatDate } from "@/lib/utils/formatting/date";

/**
 * @notice Subscriptions tab with active/expired filter
 * @dev Shows user's subscriptions with status and expiry dates
 */
export function SubscriptionsTab({
  isLoading,
  subscriptions,
  walletAddress,
}: Readonly<{
  isLoading: boolean;
  subscriptions: Subscription[];
  walletAddress: string | undefined;
}>) {
  const [subscriptionFilter, setSubscriptionFilter] = useState<"active" | "expired">("active");

  const now = new Date();
  const filtered = subscriptions.filter((s) =>
    subscriptionFilter === "active"
      ? s.isActive && new Date(s.endDate) > now
      : !s.isActive || new Date(s.endDate) <= now
  );

  return (
    <Card className="bg-[#0f0f0f] border-white/10">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            My Subscriptions
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={subscriptionFilter === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setSubscriptionFilter("active")}
              className={
                subscriptionFilter === "active"
                  ? "bg-primary text-white"
                  : "bg-transparent border-white/20 text-white/80 hover:bg-white/10 hover:text-white"
              }
            >
              Active
            </Button>
            <Button
              variant={subscriptionFilter === "expired" ? "default" : "outline"}
              size="sm"
              onClick={() => setSubscriptionFilter("expired")}
              className={
                subscriptionFilter === "expired"
                  ? "bg-primary text-white"
                  : "bg-transparent border-white/20 text-white/80 hover:bg-white/10 hover:text-white"
              }
            >
              Expired
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <p className="text-white/60">Loading subscriptions...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Users className="w-12 h-12 text-white/20 mb-4" />
            <p className="text-white/60 text-center">
              {!walletAddress ? "Connect your wallet" : `No ${subscriptionFilter} subscriptions`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-white/80">Streamer</TableHead>
                  <TableHead className="text-white/80">Amount</TableHead>
                  <TableHead className="text-white/80">Start</TableHead>
                  <TableHead className="text-white/80">
                    {subscriptionFilter === "active" ? "Expires" : "Expired"}
                  </TableHead>
                  <TableHead className="text-white/80">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((sub) => (
                  <TableRow key={sub.id} className="border-white/10">
                    <TableCell className="text-white font-mono text-xs">
                      {sub.streamerAddress.slice(0, 6)}...{sub.streamerAddress.slice(-4)}
                    </TableCell>
                    <TableCell className="text-white font-bold">{sub.amount} CHZ</TableCell>
                    <TableCell className="text-white/80">
                      {formatDate(new Date(sub.startDate))}
                    </TableCell>
                    <TableCell className="text-white/80">
                      {formatDate(new Date(sub.endDate))}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          sub.isActive && new Date(sub.endDate) > now
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-500/20 text-gray-400"
                        }
                      >
                        {sub.isActive && new Date(sub.endDate) > now
                          ? "Active"
                          : "Expired"}
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
