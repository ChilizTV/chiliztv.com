import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SelfProtocolQRCode from "@/components/selfProtcol/SelfProtocolQRCode";

/**
 * @notice Dashboard header with greeting and verification button
 * @dev Shows user greeting and wallet verification CTA
 */
export function DashboardHeader({ username }: Readonly<{ username: string }>) {
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 className="text-3xl font-bold mb-1">Profile</h1>
        <p className="text-white/70 text-sm">Welcome back, {username}!</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge className="bg-primary/20 text-primary border-primary/30">VIP Member</Badge>
        <Button
          variant="ghost"
          size="sm"
          className="text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-150 rounded-full px-3 py-1"
          onClick={() => setShowVerificationDialog(true)}
        >
          Verify to Withdraw
        </Button>
        {showVerificationDialog && (
          <SelfProtocolQRCode onClose={() => setShowVerificationDialog(false)} />
        )}
      </div>
    </div>
  );
}
