'use client';

import { ChatTab } from '@/hooks/useMultiChat';

interface ChatTabsProps {
    activeTab: ChatTab;
    onTabChange: (tab: ChatTab) => void;
    matchUnread: number;
    streamUnread: number;
}

export function ChatTabs({ activeTab, onTabChange, matchUnread, streamUnread }: ChatTabsProps) {
    return (
        <div className="flex border-b border-gray-800">
            {(['stream', 'match'] as const).map((tab) => {
                const isActive = activeTab === tab;
                const unread = tab === 'stream' ? streamUnread : matchUnread;
                const label = tab === 'stream' ? 'Stream' : 'General';
                return (
                    <button
                        key={tab}
                        onClick={() => onTabChange(tab)}
                        className={`
                            flex-1 flex items-center justify-center gap-1.5
                            py-2 text-xs font-medium transition-colors
                            ${isActive
                                ? 'text-white border-b-2 border-white -mb-px'
                                : 'text-gray-500 hover:text-gray-300'
                            }
                        `}
                    >
                        {label}
                        {unread > 0 && !isActive && (
                            <span className="min-w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold inline-flex items-center justify-center px-1">
                                {unread > 99 ? '99+' : unread}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
