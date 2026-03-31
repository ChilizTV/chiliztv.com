export interface Donation {
    id: string;
    streamerAddress: string;
    donorAddress: string;
    streamWalletAddress?: string;
    amount: number;
    message?: string;
    transactionHash: string;
    platformFee?: string;
    streamerAmount?: string;
    timestamp: string;
}

export interface Subscription {
    id: string;
    streamerAddress: string;
    subscriberAddress: string;
    amount: number;
    durationSeconds: number;
    startDate: string;
    endDate: string;
    transactionHash: string;
    isActive: boolean;
}

export interface StreamerStats {
    streamerAddress: string;
    totalRevenue: string;
    totalDonations: number;
    totalSubscribers: number;
    activeDonations: number;
    activeSubscriptions: number;
}

export interface DonationListResponse {
    success: boolean;
    donations: Donation[];
    error?: string;
}

export interface SubscriptionListResponse {
    success: boolean;
    subscriptions: Subscription[];
    error?: string;
}

export interface StreamerStatsResponse {
    success: boolean;
    stats?: StreamerStats;
    error?: string;
}
