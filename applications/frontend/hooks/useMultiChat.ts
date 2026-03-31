'use client';

import { useState, useEffect } from 'react';
import { useChatRoom, UseChatRoomResult } from './useChatRoom';

export type ChatTab = 'match' | 'stream';

export interface UseMultiChatOptions {
    matchId: number;
    streamId?: string;
    userId: string;
    username: string;
    walletAddress: string;
}

export interface UseMultiChatResult {
    activeTab: ChatTab;
    setActiveTab: (tab: ChatTab) => void;
    matchRoom: UseChatRoomResult;
    streamRoom: UseChatRoomResult | null;
    activeRoom: UseChatRoomResult;
}

export function useMultiChat({
    matchId,
    streamId,
    userId,
    username,
    walletAddress,
}: UseMultiChatOptions): UseMultiChatResult {
    const [activeTab, setActiveTabState] = useState<ChatTab>(streamId ? 'stream' : 'match');

    // When streamId appears/disappears, switch tab accordingly
    useEffect(() => {
setActiveTabState(streamId ? 'stream' : 'match');
    }, [!!streamId]);

    const matchRoom = useChatRoom({
        roomType: 'match',
        roomId: matchId,
        matchId,
        userId,
        username,
        walletAddress,
        active: activeTab === 'match',
    });

    const streamRoom = useChatRoom({
        roomType: 'stream',
        roomId: streamId ?? '',
        matchId,
        userId,
        username,
        walletAddress,
        active: activeTab === 'stream' && !!streamId,
    });

    const setActiveTab = (tab: ChatTab) => {
        setActiveTabState(tab);
        if (tab === 'match') matchRoom.clearUnread();
        if (tab === 'stream') streamRoom.clearUnread();
    };

    const activeRoom = activeTab === 'stream' && streamId ? streamRoom : matchRoom;

    return {
        activeTab,
        setActiveTab,
        matchRoom,
        streamRoom: streamId ? streamRoom : null,
        activeRoom,
    };
}
