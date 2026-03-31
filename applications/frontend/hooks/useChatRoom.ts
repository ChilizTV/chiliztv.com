'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { SupabaseChatService } from '@/services';
import { ChatMessage } from '@/models/chat.model';

export interface UseChatRoomOptions {
    roomType: 'match' | 'stream';
    roomId: string | number;
    matchId: number;
    userId: string;
    username: string;
    walletAddress: string;
    active: boolean;
}

export interface UseChatRoomResult {
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;
    sendMessage: (text: string) => Promise<void>;
    unreadCount: number;
    clearUnread: () => void;
}

const chatService = new SupabaseChatService();

export function useChatRoom({
    roomType,
    roomId,
    matchId,
    userId,
    username,
    walletAddress,
    active,
}: UseChatRoomOptions): UseChatRoomResult {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const activeRef = useRef(active);
    const roomIdStr = String(roomId);

    // Keep activeRef in sync without triggering subscription re-runs
    useEffect(() => {
        activeRef.current = active;
    }, [active]);

    // Fetch history + subscribe on room change
    useEffect(() => {
        // Stream room with no streamId yet — nothing to do
        if (roomType === 'stream' && !roomIdStr) return;

        let cancelled = false;
        setMessages([]);
        setIsLoading(true);
        setError(null);
        setUnreadCount(0);

        const fetchHistory = async () => {
            try {
                let history: ChatMessage[];
                if (roomType === 'stream') {
                    history = await chatService.getStreamMessages(roomIdStr);
                } else {
                    history = await chatService.getGeneralMessages(matchId);
                }
                if (!cancelled) {
                    setMessages(history);
                    setIsLoading(false);
                }
            } catch (err) {
                if (!cancelled) {
                    setError('Failed to load messages');
                    setIsLoading(false);
                }
            }
        };

        fetchHistory();

        const handleNewMessage = (msg: ChatMessage) => {
            if (activeRef.current) {
                setMessages(prev => {
                    // Deduplicate: replace optimistic message if content matches
                    const optimisticIdx = prev.findIndex(
                        m =>
                            m.id.startsWith('optimistic-') &&
                            m.message === msg.message &&
                            m.userId === msg.userId
                    );
                    if (optimisticIdx !== -1) {
                        const next = [...prev];
                        next[optimisticIdx] = msg;
                        return next;
                    }
                    return [...prev, msg];
                });
            } else {
                setUnreadCount(n => n + 1);
            }
        };

        if (roomType === 'stream') {
            chatService.subscribeToStreamMessages(roomIdStr, handleNewMessage);
        } else {
            chatService.subscribeToMatchMessages(matchId, handleNewMessage);
        }

        return () => {
            cancelled = true;
            if (roomType === 'stream') {
                chatService.unsubscribeFromStream(roomIdStr);
            } else {
                chatService.unsubscribeFromMatch(matchId);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomType, roomIdStr, matchId]);

    const sendMessage = useCallback(
        async (text: string) => {
            const optimisticMsg: ChatMessage = {
                id: `optimistic-${Date.now()}`,
                matchId,
                streamId: roomType === 'stream' ? roomIdStr : null,
                userId,
                username,
                walletAddress,
                message: text,
                type: 'message' as any,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            setMessages(prev => [...prev, optimisticMsg]);

            try {
                if (roomType === 'stream') {
                    await chatService.sendStreamMessage(roomIdStr, matchId, userId, username, walletAddress, text);
                } else {
                    await chatService.sendMessage(matchId, userId, username, text, walletAddress);
                }
            } catch (err) {
                // Remove optimistic message on failure
                setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
                setError('Failed to send message');
            }
        },
        [roomType, roomIdStr, matchId, userId, username, walletAddress]
    );

    const clearUnread = useCallback(() => setUnreadCount(0), []);

    return { messages, isLoading, error, sendMessage, unreadCount, clearUnread };
}
