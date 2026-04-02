export type { DonationResponseDto as Donation } from '@chiliztv/shared/dto/stream-wallet/DonationResponseDto';
export type { SubscriptionResponseDto as Subscription } from '@chiliztv/shared/dto/stream-wallet/SubscriptionResponseDto';
export type { StreamerStatsResponseDto as StreamerStats } from '@chiliztv/shared/dto/stream-wallet/StreamerStatsResponseDto';

import type { DonationResponseDto } from '@chiliztv/shared/dto/stream-wallet/DonationResponseDto';
import type { SubscriptionResponseDto } from '@chiliztv/shared/dto/stream-wallet/SubscriptionResponseDto';
import type { StreamerStatsResponseDto } from '@chiliztv/shared/dto/stream-wallet/StreamerStatsResponseDto';

export interface DonationListResponse {
    success: boolean;
    donations: DonationResponseDto[];
    error?: string;
}

export interface SubscriptionListResponse {
    success: boolean;
    subscriptions: SubscriptionResponseDto[];
    error?: string;
}

export interface StreamerStatsResponse {
    success: boolean;
    stats?: StreamerStatsResponseDto;
    error?: string;
}
