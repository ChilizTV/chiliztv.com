"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription 
} from '@/components/ui/dialog';
import { Users, Loader2, CheckCircle, Calendar } from 'lucide-react';
import { useStreamWallet } from '@/hooks/useStreamWallet';

interface StreamSubscriptionButtonProps {
  streamerAddress?: `0x${string}`; // The streamer's wallet address
  isStreamer?: boolean; // Whether the current user IS the streamer
  open?: boolean; // Controlled open state
  onOpenChange?: (open: boolean) => void; // Controlled open change handler
}

export default function StreamSubscriptionButton({
  streamerAddress,
  isStreamer = false,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: StreamSubscriptionButtonProps) {
  // Use the custom hook
  const {
    streamWalletAddress,
    statistics,
    subscribe,
    subscriptionState,
    subscription
  } = useStreamWallet({ streamerAddress });

  // Local state for form inputs
  const [subscriptionAmount, setSubscriptionAmount] = useState('10');
  const [subscriptionMonths, setSubscriptionMonths] = useState<string>('1'); // "1"-"12" or "unlimited"
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setInternalOpen;

  // Close modal when subscription succeeds
  useEffect(() => {
    if (subscriptionState.isSuccess) {
      setIsOpen(false);
    }
  }, [subscriptionState.isSuccess, setIsOpen]);

  // ============================================================
  // Handle subscription
  // ============================================================
  const handleSubscribe = async () => {
    if (!subscriptionAmount) return;

    const durationDays = subscriptionMonths === 'unlimited'
      ? 36500 // ~100 years
      : parseInt(subscriptionMonths) * 30;

    await subscribe(subscriptionAmount, durationDays);
  };

  // Check if subscription is active
  const isActiveSubscription = subscription?.isSubscribed || false;

  // ============================================================
  // Don't show button if no streamer address
  // ============================================================
  if (!streamerAddress) {
    return null;
  }

  // Note: Wallet will be created automatically on first subscription

  // ============================================================
  // RENDER: Subscription dialog
  // ============================================================
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Only show trigger button if not controlled from outside */}
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
            <Users className="mr-2 h-4 w-4" />
            {isStreamer ? 'Subscriber Stats' : isActiveSubscription ? 'Manage Subscription' : 'Subscribe'}
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="bg-gray-900 text-white border-gray-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isStreamer ? 'Subscription Statistics' : 'Subscribe to Streamer'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {isStreamer 
              ? 'View your subscriber base and recurring revenue'
              : isActiveSubscription
                ? 'Manage your active subscription'
                : 'Subscribe for exclusive perks and ongoing support'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Subscription Statistics Card */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">
              {isStreamer ? 'Subscription Statistics' : 'Your Subscription'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isStreamer ? (
              <>
                {/* Total Subscribers */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Subscribers:</span>
                  <span className="font-mono text-purple-400 font-bold">
                    {streamWalletAddress ? statistics.totalSubscribers : '0'}
                  </span>
                </div>
              </>
            ) : (
              <>
                {/* Subscription Status */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Status:</span>
                  <span className={`font-semibold ${isActiveSubscription ? 'text-green-400' : 'text-gray-500'}`}>
                    {isActiveSubscription ? '✓ Active' : 'Inactive'}
                  </span>
                </div>
                
                {/* Subscription Amount */}
                {subscription && subscription.amount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Amount:</span>
                    <span className="font-mono text-purple-400">
                      {subscription.amount} CHZ
                    </span>
                  </div>
                )}
                
                {/* Expiry Date */}
                {subscription && subscription.expiryTime && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Expires:</span>
                    <span className="font-mono text-yellow-400">
                      {subscription.expiryTime}
                    </span>
                  </div>
                )}

                {/* Community */}
                <div className="flex justify-between text-sm pt-2 border-t border-gray-700">
                  <span className="text-gray-400">Community:</span>
                  <span className="text-purple-400">
                    {streamWalletAddress ? statistics.totalSubscribers : '0'} subscribers
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Subscription Form (for viewers only, if not subscribed) */}
        {!isStreamer && !isActiveSubscription && (
          <div className="space-y-4 mt-4">
            {/* Amount Input */}
            <div>
              <Label htmlFor="subscriptionAmount" className="text-gray-300">
                Amount (CHZ)
              </Label>
              <Input
                id="subscriptionAmount"
                type="number"
                step="1"
                min="1"
                value={subscriptionAmount}
                onChange={(e) => setSubscriptionAmount(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white mt-1"
                placeholder="10"
              />
              <p className="text-xs text-gray-500 mt-1">
                Suggested: 10-50 CHZ per month
              </p>
            </div>
            
            {/* Duration Select */}
            <div>
              <Label htmlFor="subscriptionMonths" className="text-gray-300">
                Duration
              </Label>
              <Select value={subscriptionMonths} onValueChange={setSubscriptionMonths}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {m} month{m > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                  <SelectItem value="unlimited">
                    No end (unlimited)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Subscribe Button */}
            <Button
              onClick={handleSubscribe}
              disabled={subscriptionState.isPending || subscriptionState.isConfirming || !subscriptionAmount}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {subscriptionState.isPending || subscriptionState.isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {subscriptionState.isPending ? 'Processing...' : 'Confirming...'}
                </>
              ) : subscriptionState.isSuccess ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Subscribed!
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Subscribe Now
                </>
              )}
            </Button>

            {/* Subscription Benefits */}
            <div className="bg-gray-800/50 rounded-lg p-3 border border-purple-500/20">
              <p className="text-xs font-semibold text-purple-400 mb-2">Subscriber Benefits:</p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>✓ Exclusive subscriber badge</li>
                <li>✓ Priority chat messages</li>
                <li>✓ Access to subscriber-only content</li>
                <li>✓ Support your favorite streamer</li>
              </ul>
            </div>
          </div>
        )}

        {/* Active Subscription Info */}
        {!isStreamer && isActiveSubscription && (
          <div className="mt-4">
            <div className="bg-gradient-to-r from-green-900/30 to-emerald-800/30 rounded-lg p-4 border border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <p className="text-sm font-semibold text-green-400">You&apos;re Subscribed!</p>
              </div>
              <p className="text-xs text-gray-400">
                Thank you for supporting this creator. Your subscription is active until {subscription?.expiryTime}.
              </p>
            </div>
          </div>
        )}

        {/* Wallet Address Footer */}
        <div className="pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            {streamWalletAddress ? (
              <>Wallet: {streamWalletAddress.slice(0, 6)}...{streamWalletAddress.slice(-4)}</>
            ) : (
              <>Wallet will be created automatically on first subscription</>
            )}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
