import { supabase } from '@/lib/supabase';
import { ChatMessage, BetMessage, SystemMessage, MessageType, SystemMessageType, BetType } from '@/models/chat.model';

export interface ConnectedUser {
    id: string;
    username: string;
    connectedAt: Date;
    lastActivity: Date;
}

export interface ChatStats {
    totalMessages: number;
    totalUsers: number;
    activeRooms: number;
    lastMessageAt: Date | null;
}

export class SupabaseChatService {
    private subscriptions: Map<number, any> = new Map();
    private streamSubscriptions: Map<string, any> = new Map();

    async sendMessage(
        matchId: number,
        userId: string,
        username: string,
        message: string,
        walletAddress: string
    ): Promise<ChatMessage> {
        try {
            const { data: matchExists, error: matchError } = await supabase
                .from('matches')
                .select('api_football_id')
                .eq('api_football_id', matchId);

            if (matchError || !matchExists || matchExists.length === 0) {
                console.warn(`Match ${matchId} n'existe pas dans Supabase`);
                return {
                    id: `simulated-${Date.now()}`,
                    matchId: matchId,
                    userId: userId,
                    username: username,
                    message: message,
                    type: MessageType.TEXT,
                    walletAddress: walletAddress,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
            }

            const { data, error } = await supabase
                .from('chat_messages')
                .insert({
                    match_id: matchId,
                    user_id: userId,
                    username: username,
                    message: message,
                    message_type: 'message',
                    wallet_address: walletAddress?.toLowerCase() ?? walletAddress,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) {
                throw new Error(`Erreur lors de l'envoi du message: ${error.message}`);
            }

            return this.mapSupabaseMessageToChatMessage(data);
        } catch (err) {
            console.error('Erreur sendMessage:', err);
            return {
                id: `error-${Date.now()}`,
                matchId: matchId,
                userId: userId,
                username: username,
                message: message,
                type: MessageType.TEXT,
                walletAddress: walletAddress,
                createdAt: new Date(),
                updatedAt: new Date()
            };
        }
    }

    async sendBetMessage(
        matchId: number,
        userId: string,
        username: string,
        betType: BetType,
        betSubType: string,
        amount: number,
        odds: number,
        walletAddress: string
    ): Promise<BetMessage> {
        const { data, error } = await supabase
            .from('chat_messages')
            .insert({
                match_id: matchId,
                user_id: userId,
                username: username,
                message: `Pari ${betType} - ${betSubType}`,
                message_type: 'bet',
                bet_type: betType,
                bet_sub_type: betSubType,
                amount: amount,
                odds: odds,
                wallet_address: walletAddress,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            throw new Error(`Erreur lors de l'envoi du message de pari: ${error.message}`);
        }

        return this.mapSupabaseMessageToBetMessage(data);
    }

    async sendSystemMessage(
        matchId: number,
        systemType: SystemMessageType,
        message: string
    ): Promise<SystemMessage> {
        const { data, error } = await supabase
            .from('chat_messages')
            .insert({
                match_id: matchId,
                user_id: 'system',
                username: 'Système',
                message: message,
                message_type: 'system',
                system_type: systemType,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            throw new Error(`Erreur lors de l'envoi du message système: ${error.message}`);
        }

        return this.mapSupabaseMessageToSystemMessage(data);
    }

    async joinRoom(matchId: number, userId: string, username: string, walletAddress?: string): Promise<ConnectedUser> {
        try {
            const { data: matchExists, error: matchError } = await supabase
                .from('matches')
                .select('api_football_id')
                .eq('api_football_id', matchId);

            if (matchError || !matchExists || matchExists.length === 0) {
                console.warn(`Match ${matchId} n'existe pas dans la base de données Supabase`);
                return {
                    id: `${matchId}-${userId}`,
                    username: username,
                    connectedAt: new Date(),
                    lastActivity: new Date()
                };
            }

            // Upsert : insert si absent, update si déjà connecté (évite 409 en cas d'appels simultanés / React Strict Mode)
            const connectedUserPayload = {
                match_id: matchId,
                user_id: userId,
                username: username,
                wallet_address: walletAddress?.toLowerCase() || null,
                connected_at: new Date().toISOString(),
                last_activity: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('chat_connected_users')
                .upsert(connectedUserPayload, {
                    onConflict: 'match_id,user_id',
                    ignoreDuplicates: false
                })
                .select()
                .single();

            if (error) {
                console.warn("Erreur lors de la connexion à la room:", error);
                return {
                    id: `${matchId}-${userId}`,
                    username: username,
                    connectedAt: new Date(),
                    lastActivity: new Date()
                };
            }

            return this.mapSupabaseUserToConnectedUser(data);
        } catch (err) {
            console.error('Erreur joinRoom:', err);
            return {
                id: `${matchId}-${userId}`,
                username: username,
                connectedAt: new Date(),
                lastActivity: new Date()
            };
        }
    }

    async leaveRoom(matchId: number, userId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('chat_connected_users')
                .delete()
                .eq('match_id', matchId)
                .eq('user_id', userId);

            if (error) {
                console.warn("Erreur lors de la déconnexion:", error);
                // Ne pas lever d'erreur, juste logger
            }
        } catch (err) {
            console.warn("Erreur lors de la déconnexion:", err);
        }
    }

    async getRoomMessages(matchId: number, limit: number = 50): Promise<ChatMessage[]> {
        try {
            const { data: matchExists, error: matchError } = await supabase
                .from('matches')
                .select('api_football_id')
                .eq('api_football_id', matchId);

            if (matchError || !matchExists || matchExists.length === 0) {
                console.warn(`Match ${matchId} n'existe pas dans Supabase, retour tableau vide`);
                return [];
            }

            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('match_id', matchId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                throw new Error(`Erreur lors de la récupération des messages: ${error.message}`);
            }

            return data.map(msg => this.mapSupabaseMessageToChatMessage(msg)).reverse();
        } catch (err) {
            console.error('Erreur getRoomMessages:', err);
            return [];
        }
    }

    async getConnectedUsers(matchId: number): Promise<ConnectedUser[]> {
        const { data, error } = await supabase
            .from('chat_connected_users')
            .select('*')
            .eq('match_id', matchId)
            .order('connected_at', { ascending: true });

        if (error) {
            throw new Error(`Erreur lors de la récupération des utilisateurs: ${error.message}`);
        }

        return data.map(user => this.mapSupabaseUserToConnectedUser(user));
    }

    subscribeToMatchMessages(matchId: number, callback: (message: ChatMessage) => void) {
        this.unsubscribeFromMatch(matchId);

        const subscription = supabase
            .channel(`chat_match_${matchId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `match_id=eq.${matchId}`
                },
                (payload) => {
                    // Server filter covers match_id; filter stream_id client-side since
                    // Supabase Realtime only supports one filter per postgres_changes subscription.
                    if (payload.new.stream_id != null) return;
                    const message = this.mapSupabaseMessageToChatMessage(payload.new);
                    callback(message);
                }
            )
            .subscribe();

        this.subscriptions.set(matchId, subscription);
        return subscription;
    }

    unsubscribeFromMatch(matchId: number): void {
        const subscription = this.subscriptions.get(matchId);
        if (subscription) {
            supabase.removeChannel(subscription);
            this.subscriptions.delete(matchId);
        }
    }

    subscribeToStreamMessages(streamId: string, callback: (message: ChatMessage) => void) {
        this.unsubscribeFromStream(streamId);

        const subscription = supabase
            .channel(`chat_stream_${streamId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `stream_id=eq.${streamId}`
                },
                (payload) => {
                    const message = this.mapSupabaseMessageToChatMessage(payload.new);
                    callback(message);
                }
            )
            .subscribe();

        this.streamSubscriptions.set(streamId, subscription);
        return subscription;
    }

    unsubscribeFromStream(streamId: string): void {
        const subscription = this.streamSubscriptions.get(streamId);
        if (subscription) {
            supabase.removeChannel(subscription);
            this.streamSubscriptions.delete(streamId);
        }
    }

    async getGeneralMessages(matchId: number, limit: number = 50): Promise<ChatMessage[]> {
        try {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('match_id', matchId)
                .is('stream_id', null)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                throw new Error(`Erreur lors de la récupération des messages généraux: ${error.message}`);
            }

            return data.map(msg => this.mapSupabaseMessageToChatMessage(msg)).reverse();
        } catch (err) {
            console.error('Erreur getGeneralMessages:', err);
            return [];
        }
    }

    async getStreamMessages(streamId: string, limit: number = 50): Promise<ChatMessage[]> {
        try {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('stream_id', streamId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                throw new Error(`Erreur lors de la récupération des messages stream: ${error.message}`);
            }

            return data.map(msg => this.mapSupabaseMessageToChatMessage(msg)).reverse();
        } catch (err) {
            console.error('Erreur getStreamMessages:', err);
            return [];
        }
    }

    async sendStreamMessage(
        streamId: string,
        matchId: number,
        userId: string,
        username: string,
        walletAddress: string,
        message: string
    ): Promise<ChatMessage> {
        const { data, error } = await supabase
            .from('chat_messages')
            .insert({
                match_id: matchId,
                stream_id: streamId,
                user_id: userId,
                username: username,
                message: message,
                message_type: 'message',
                wallet_address: walletAddress?.toLowerCase() ?? walletAddress,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            throw new Error(`Erreur lors de l'envoi du message stream: ${error.message}`);
        }

        return this.mapSupabaseMessageToChatMessage(data);
    }

    unsubscribeFromAll(): void {
        this.subscriptions.forEach((subscription) => {
            supabase.removeChannel(subscription);
        });
        this.subscriptions.clear();
        this.streamSubscriptions.forEach((subscription) => {
            supabase.removeChannel(subscription);
        });
        this.streamSubscriptions.clear();
    }

    async getStats(): Promise<ChatStats> {
        const [messagesCount, usersCount, lastMessage] = await Promise.all([
            supabase.from('chat_messages').select('id', { count: 'exact' }),
            supabase.from('chat_connected_users').select('id', { count: 'exact' }),
            supabase.from('chat_messages').select('created_at').order('created_at', { ascending: false }).limit(1).single()
        ]);

        return {
            totalMessages: messagesCount.count || 0,
            totalUsers: usersCount.count || 0,
            activeRooms: this.subscriptions.size,
            lastMessageAt: lastMessage.data?.created_at ? new Date(lastMessage.data.created_at) : null
        };
    }

    private mapSupabaseMessageToChatMessage(data: any): ChatMessage {
        return {
            id: data.id,
            matchId: data.match_id,
            streamId: data.stream_id ?? null,
            userId: data.user_id,
            username: data.username,
            message: data.message,
            type: data.message_type,
            walletAddress: data.wallet_address || '',
            createdAt: new Date(data.created_at),
            updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(data.created_at),
            isFeatured: data.is_featured,
            systemEventType: data.system_type
        };
    }

    private mapSupabaseMessageToBetMessage(data: any): BetMessage {
        return {
            ...this.mapSupabaseMessageToChatMessage(data),
            type: MessageType.BET,
            betType: data.bet_type,
            betSubType: data.bet_sub_type,
            betAmount: data.amount,
            betOdds: data.odds
        };
    }

    private mapSupabaseMessageToSystemMessage(data: any): SystemMessage {
        return {
            ...this.mapSupabaseMessageToChatMessage(data),
            type: MessageType.SYSTEM,
            systemEventType: data.system_type
        };
    }

    private mapSupabaseUserToConnectedUser(data: any): ConnectedUser {
        return {
            id: data.id,
            username: data.username,
            connectedAt: new Date(data.connected_at),
            lastActivity: new Date(data.last_activity)
        };
    }
}
