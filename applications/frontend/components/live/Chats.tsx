"use client"
import { useEffect, useState, useRef } from "react";
import { Star, Send } from "lucide-react";
import { SupabaseChatService } from "@/services";
import { ChatMessage, SystemMessageType } from "@/models/chat.model";

interface ChatBoxProps {
    matchId: string;
    userId: string;
    username: string;
    walletAddress: string;
    onMessageSent?: () => void;
}

export default function ChatBox({ matchId, userId, username, walletAddress, onMessageSent }: ChatBoxProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const onMessageSentRef = useRef(onMessageSent);
    const supabaseChat = useRef(new SupabaseChatService());

    // Mettre à jour la ref quand onMessageSent change, sans réinitialiser le chat
    useEffect(() => {
        onMessageSentRef.current = onMessageSent;
    }, [onMessageSent]);

    useEffect(() => {
        const chatService = supabaseChat.current;
        
        const initializeChat = async () => {
            try {
                setIsLoading(true);
                
                await chatService.joinRoom(parseInt(matchId), userId, username);
                setIsConnected(true);

                try {
                    const existingMessages = await chatService.getRoomMessages(parseInt(matchId), 50);
                    setMessages(existingMessages);
                } catch (msgError) {
                    console.warn("Erreur lors du chargement des messages:", msgError);
                    setMessages([]);
                }

                try {
                    chatService.subscribeToMatchMessages(
                        parseInt(matchId),
                        (receivedMessage) => {
                            setMessages(prev => {
                                const exists = prev.some(m => m.id === receivedMessage.id);
                                if (exists) {
                                    return prev;
                                }
                                
                                return [...prev, receivedMessage];
                            });
                            
                            if (onMessageSentRef.current) {
                                onMessageSentRef.current();
                            }
                        }
                    );
                } catch (subError) {
                    console.warn("Erreur lors de l'abonnement temps réel:", subError);
                }

            } catch (err) {
                console.error("Error initializing chat:", err);
                setIsConnected(false);
                setMessages([]);
            } finally {
                setIsLoading(false);
            }
        };

        initializeChat();

        return () => {
            try {
                chatService.unsubscribeFromMatch(parseInt(matchId));
                chatService.leaveRoom(parseInt(matchId), userId);
            } catch (err) {
                console.warn("Erreur lors du cleanup:", err);
            }
        };
    }, [matchId, userId, username]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !isConnected) return;

        const messageText = newMessage.trim();
        setNewMessage("");

        try {
            await supabaseChat.current.sendMessage(
                parseInt(matchId),
                userId,
                username,
                messageText,
                walletAddress
            );
            
            
        } catch (err) {
            console.error("Error sending message:", err);
            alert("Erreur lors de l'envoi du message");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const isOwnMessage = (msg: ChatMessage) => {
        return msg.userId === userId || msg.username === username;
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (isLoading) {
        return (
            <div className="bg-gray-900 text-white w-full max-w-sm mx-auto rounded-lg overflow-hidden shadow-2xl">
                <div className="bg-gray-800 p-4 border-b border-gray-700">
                    <h2 className="text-lg font-semibold">Live Chat</h2>
                </div>
                <div className="h-96 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                        <p className="text-gray-400">Connexion au chat...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 text-white w-full max-w-sm mx-auto rounded-lg overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gray-800 p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Live Chat</h2>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-xs text-gray-400">
                            {isConnected ? 'Connecté' : 'Déconnecté'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                        <p>Aucun message pour le moment</p>
                        <p className="text-sm">Soyez le premier à parler !</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isDonationOrSubscriptionOrBet = msg.systemEventType === SystemMessageType.DONATION || msg.systemEventType === SystemMessageType.SUBSCRIPTION || msg.systemEventType === SystemMessageType.BET_PLACED;
                        const ownMessage = !isDonationOrSubscriptionOrBet && isOwnMessage(msg);

                        if (isDonationOrSubscriptionOrBet) {
                            return (
                                <div key={msg.id || idx} className="flex justify-center w-full">
                                    <div className="w-full max-w-xs">
                                        <div className="rounded-lg p-3 bg-amber-500/20 border border-amber-400/50 text-amber-300 font-medium text-center text-sm">
                                            {msg.message}
                                        </div>
                                        <div className="text-center mt-1">
                                            <span className="text-gray-500 text-xs">
                                                {formatTime(msg.createdAt.getTime())}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={msg.id || idx} className={`flex ${ownMessage ? 'justify-end' : 'justify-start'}`}>
                                <div className={`space-y-1 max-w-xs ${ownMessage ? 'text-right' : 'text-left'}`}>
                                    <div className={`flex items-center gap-2 ${ownMessage ? 'justify-end' : 'justify-start'}`}>
                                        {!ownMessage && (
                                            <span className="text-blue-400 font-medium text-sm">
                                                {msg.username}
                                            </span>
                                        )}
                                        <span className="text-gray-500 text-xs">
                                            {formatTime(msg.createdAt.getTime())}
                                        </span>
                                        {msg.isFeatured && (
                                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                        )}
                                        {ownMessage && (
                                            <span className="text-blue-400 font-medium text-sm">
                                                {msg.username}
                                            </span>
                                        )}
                                    </div>
                                    <div className={`rounded-lg p-3 ${
                                        msg.isFeatured
                                            ? "bg-yellow-500 text-black font-medium"
                                            : ownMessage
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-700 text-gray-100"
                                    }`}>
                                        {msg.message}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-700">
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <input
                            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none placeholder-gray-400 disabled:opacity-50"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={isConnected ? "Tapez votre message..." : "Connexion en cours..."}
                            disabled={!isConnected}
                        />
                    </div>
                    <button
                        className={`px-4 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                            isConnected 
                                ? 'bg-red-600 hover:bg-red-700 text-white' 
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                        onClick={handleSendMessage}
                        disabled={!isConnected}
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
