"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription 
} from '@/components/ui/dialog';
import { Send, Loader2, CheckCircle } from 'lucide-react';
import { useStreamWallet } from '@/hooks/useStreamWallet';

interface StreamWalletButtonProps {
  streamerAddress?: `0x${string}`; // The streamer's wallet address
  isStreamer?: boolean; // Whether the current user IS the streamer
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function StreamWalletButton({
  streamerAddress,
  isStreamer = false,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: StreamWalletButtonProps) {
  // Use the custom hook
  const {
    streamWalletAddress,
    statistics,
    donate,
    donationState
  } = useStreamWallet({ streamerAddress });

  // Local state for form inputs
  const [donationAmount, setDonationAmount] = useState('0.01');
  const [donationMessage, setDonationMessage] = useState('');
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setInternalOpen;

  // Close modal and reset form when donation succeeds
  useEffect(() => {
    if (donationState.isSuccess) {
      setIsOpen(false);
      setDonationAmount('0.01');
      setDonationMessage('');
    }
  }, [donationState.isSuccess, setIsOpen]);

  // ============================================================
  // Handle donation
  // ============================================================
  const handleDonate = async () => {
    if (!donationAmount) return;
    await donate(donationAmount, donationMessage);
  };

  // ============================================================
  // Don't show button if no streamer address
  // ============================================================
  if (!streamerAddress) {
    return null;
  }

  // ============================================================
  // RENDER: Main wallet dialog
  // Note: Wallet will be created automatically on first donation/subscription
  // ============================================================
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Only show trigger button if not controlled from outside */}
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button className="w-full bg-purple-600 hover:bg-purple-700">
            <Send className="mr-2 h-4 w-4" />
            {isStreamer ? 'Donation Stats' : 'Send Donation'}
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="bg-gray-900 text-white border-gray-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isStreamer ? 'Donation Statistics' : 'Support This Streamer'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {isStreamer 
              ? 'View your donation revenue and statistics'
              : 'Send a one-time donation to support this content creator'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Donation Statistics Card */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">
              Donation Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* Total Donations */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Revenue:</span>
              <span className="font-mono text-green-400">
                {streamWalletAddress ? statistics.totalRevenue : '0'} CHZ
              </span>
            </div>
            
            {/* Total Withdrawn */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Withdrawn:</span>
              <span className="font-mono text-blue-400">
                {streamWalletAddress ? statistics.totalWithdrawn : '0'} CHZ
              </span>
            </div>
            
            {/* Available Balance */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Available Balance:</span>
              <span className="font-mono text-yellow-400 font-bold">
                {streamWalletAddress ? statistics.availableBalance : '0'} CHZ
              </span>
            </div>
            
            {/* Platform Fee */}
            <div className="flex justify-between text-sm pt-2 border-t border-gray-700">
              <span className="text-gray-400">Platform Fee:</span>
              <span className="text-gray-300">
                {streamWalletAddress ? `${statistics.platformFeeBps}%` : '5%'}
              </span>
            </div>
            
            {/* Total Donations Count */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Donations:</span>
              <span className="text-purple-400">
                {streamWalletAddress ? statistics.totalDonations : '0'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Donation Form (for viewers only) */}
        {!isStreamer && (
          <div className="space-y-4 mt-4">
            {/* Amount Input */}
            <div>
              <Label htmlFor="donationAmount" className="text-gray-300">
                Amount (CHZ)
              </Label>
              <Input
                id="donationAmount"
                type="number"
                step="0.01"
                min="0"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white mt-1"
                placeholder="0.01"
              />
            </div>
            
            {/* Message Input */}
            <div>
              <Label htmlFor="donationMessage" className="text-gray-300">
                Message (Optional)
              </Label>
              <Input
                id="donationMessage"
                type="text"
                value={donationMessage}
                onChange={(e) => setDonationMessage(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white mt-1"
                placeholder="Leave a message..."
                maxLength={200}
              />
            </div>
            
            {/* Donate Button */}
            <Button
              onClick={handleDonate}
              disabled={donationState.isPending || donationState.isConfirming || !donationAmount}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {donationState.isPending || donationState.isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {donationState.isPending ? 'Sending...' : 'Confirming...'}
                </>
              ) : donationState.isSuccess ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Donated!
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Donation
                </>
              )}
            </Button>
          </div>
        )}

        {/* Wallet Address Footer */}
        <div className="pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            {streamWalletAddress ? (
              <>Wallet: {streamWalletAddress.slice(0, 6)}...{streamWalletAddress.slice(-4)}</>
            ) : (
              <>Wallet will be created automatically on first donation</>
            )}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
