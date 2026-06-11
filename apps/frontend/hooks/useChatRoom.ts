'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { SupabaseChatService } from '@/services';
import { ChatMessage, MessageType, SystemMessageType } from '@/models/chat.model';
import { useVisibilityAwareInterval } from '@/hooks/useVisibilityAwareInterval';

const POLL_INTERVAL_MS = 4000;

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

// Single dedup rule shared by realtime push and the polling fallback —
// deterministic match by clientTempId first (echoed back by the backend),
// then the legacy (message, userId) heuristic for rows missing it. Rows
// already present are refreshed in place when their removedAt changed
// (moderation soft-delete reaching us via the polling fallback).
function mergeAndDedupOptimistic(prev: ChatMessage[], incoming: ChatMessage): ChatMessage[] {
    const existingIdx = prev.findIndex(m => m.id === incoming.id);
    if (existingIdx !== -1) {
        const existing = prev[existingIdx]!;
        const existingRemoved = existing.removedAt?.getTime() ?? null;
        const incomingRemoved = incoming.removedAt?.getTime() ?? null;
        if (existingRemoved === incomingRemoved) return prev;
        const next = [...prev];
        next[existingIdx] = incoming;
        return next;
    }
    let optimisticIdx = -1;
    if (incoming.clientTempId) {
        optimisticIdx = prev.findIndex(
            m => m.id.startsWith('optimistic-') && m.clientTempId === incoming.clientTempId,
        );
    }
    if (optimisticIdx === -1) {
        optimisticIdx = prev.findIndex(
            m =>
                m.id.startsWith('optimistic-') &&
                m.message === incoming.message &&
                m.userId === incoming.userId,
        );
    }
    if (optimisticIdx !== -1) {
        const next = [...prev];
        next[optimisticIdx] = incoming;
        return next;
    }
    return [...prev, incoming];
}

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
                setMessages(prev => mergeAndDedupOptimistic(prev, msg));
            } else {
                setUnreadCount(n => n + 1);
            }
        };

        // Moderation soft-deletes arrive as UPDATEs — swap the row in place
        // (no unread bump: nothing new to read).
        const handleMessageUpdate = (msg: ChatMessage) => {
            setMessages(prev => prev.map(m => (m.id === msg.id ? msg : m)));
        };

        if (roomType === 'stream') {
            chatService.subscribeToStreamMessages(roomIdStr, handleNewMessage, handleMessageUpdate);
        } else {
            chatService.subscribeToMatchMessages(matchId, handleNewMessage, handleMessageUpdate);
        }

        // Optimistic banner: MarketBetDialog fires `chiliz:bet-confirmed` the
        // moment the tx confirms. We synthesise a local SYSTEM row so the gold
        // banner updates instantly — the real row from the indexer (or the
        // realtime push) dedupes via the optimistic-* id check above.
        const handleBetConfirmed = (ev: Event) => {
            if (roomType !== 'match') return;
            if (!activeRef.current) return;
            const detail = (ev as CustomEvent<{ message?: string; txHash?: string | null }>).detail;
            if (!detail?.message) return;
            const optimisticMsg: ChatMessage = {
                id: `optimistic-bet-${detail.txHash ?? Date.now()}`,
                matchId,
                streamId: null,
                userId: 'system',
                username: 'System',
                walletAddress: 'system',
                message: detail.message,
                type: MessageType.SYSTEM,
                systemEventType: SystemMessageType.BET_PLACED,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            setMessages(prev => {
                if (prev.some(m => m.id === optimisticMsg.id)) return prev;
                return [...prev, optimisticMsg];
            });
        };
        if (typeof window !== 'undefined') {
            window.addEventListener('chiliz:bet-confirmed', handleBetConfirmed);
        }

        return () => {
            cancelled = true;
            if (typeof window !== 'undefined') {
                window.removeEventListener('chiliz:bet-confirmed', handleBetConfirmed);
            }
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
            const clientTempId = crypto.randomUUID();
            const optimisticMsg: ChatMessage = {
                id: `optimistic-${Date.now()}`,
                matchId,
                streamId: roomType === 'stream' ? roomIdStr : null,
                userId,
                username,
                walletAddress,
                message: text,
                type: MessageType.REGULAR,
                createdAt: new Date(),
                updatedAt: new Date(),
                clientTempId,
            };
            setMessages(prev => [...prev, optimisticMsg]);

            try {
                if (roomType === 'stream') {
                    await chatService.sendStreamMessage(roomIdStr, matchId, userId, username, walletAddress, text, clientTempId);
                } else {
                    await chatService.sendMessage(matchId, userId, username, text, walletAddress, clientTempId);
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

    // Polling fallback — fetch latest history every 4s while visible, merge
    // any new ids into state. Dedup happens via the id Set below so this is
    // a no-op when realtime push beats us to it.
    const pollAndMerge = useCallback(async () => {
        if (roomType === 'stream' && !roomIdStr) return;
        try {
            const history: ChatMessage[] = roomType === 'stream'
                ? await chatService.getStreamMessages(roomIdStr)
                : await chatService.getGeneralMessages(matchId);
            let addedCount = 0;
            setMessages(prev => {
                const next = history.reduce(mergeAndDedupOptimistic, prev);
                addedCount = Math.max(0, next.length - prev.length);
                return next === prev ? prev : next;
            });
            if (addedCount > 0 && !activeRef.current) {
                setUnreadCount(n => n + addedCount);
            }
        } catch {
            // Silent — the next tick retries, keep the last known state visible.
        }
    }, [roomType, roomIdStr, matchId]);

    useVisibilityAwareInterval(
        pollAndMerge,
        roomType === 'stream' && !roomIdStr ? null : POLL_INTERVAL_MS,
        !(roomType === 'stream' && !roomIdStr),
    );

    return { messages, isLoading, error, sendMessage, unreadCount, clearUnread };
}
