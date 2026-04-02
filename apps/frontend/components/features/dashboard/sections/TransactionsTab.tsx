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
import { Send } from "lucide-react";
import type { Donation, Subscription } from "@/models/stream-wallet.model";
import { formatDateTime } from "@/lib/utils/formatting/date";

/**
 * @notice Transactions tab showing donations and subscriptions
 * @dev Combined sorted list of all transaction history
 */
export function TransactionsTab({
  isLoading,
  donations,
  subscriptions,
  walletAddress,
}: Readonly<{
  isLoading: boolean;
  donations: Donation[];
  subscriptions: Subscription[];
  walletAddress: string | undefined;
}>) {
  const combined = [
    ...donations.map((d) => ({ type: "donation" as const, date: d.timestamp, data: d })),
    ...subscriptions.map((s) => ({ type: "subscription" as const, date: s.startDate, data: s })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card className="bg-[#0f0f0f] border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Send className="w-5 h-5 text-primary" />
          Transaction History
        </CardTitle>
        <p className="text-sm text-white/60">Donations and subscriptions</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <p className="text-white/60">Loading transactions...</p>
          </div>
        ) : combined.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Send className="w-12 h-12 text-white/20 mb-4" />
            <p className="text-white/60 text-center">
              {!walletAddress ? "Connect your wallet" : "No transactions yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-white/80">Date</TableHead>
                  <TableHead className="text-white/80">Type</TableHead>
                  <TableHead className="text-white/80">Streamer</TableHead>
                  <TableHead className="text-white/80">Amount</TableHead>
                  <TableHead className="text-white/80">Tx Hash</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {combined.map((item) => {
                  const txHash = (item.data as Donation).transactionHash;
                  const streamerAddr = (item.data as Donation).streamerAddress;
                  return (
                    <TableRow
                      key={`${item.type}-${(item.data as Donation).id || txHash}`}
                      className="border-white/10"
                    >
                      <TableCell className="text-white/80">
                        {formatDateTime(new Date(item.date))}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            item.type === "donation"
                              ? "bg-purple-500/20 text-purple-400"
                              : "bg-indigo-500/20 text-indigo-400"
                          }
                        >
                          {item.type === "donation" ? "Donation" : "Subscription"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white/80 font-mono text-xs">
                        {streamerAddr?.slice(0, 6)}...{streamerAddr?.slice(-4)}
                      </TableCell>
                      <TableCell className="text-white font-bold">{item.data.amount} CHZ</TableCell>
                      <TableCell className="text-white/60 font-mono text-xs">
                        {txHash && (
                          <a
                            href={`https://sepolia.basescan.org/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary truncate block max-w-[120px]"
                          >
                            {txHash.slice(0, 10)}...
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
