export interface WaitlistEntry {
    id: string;
    email: string;
    walletAddress?: string;
    source?: string;
    isWhitelisted: boolean;
    registeredAt: string;
    whitelistedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateWaitlistRequest {
    email: string;
    walletAddress?: string;
    source?: string;
}

