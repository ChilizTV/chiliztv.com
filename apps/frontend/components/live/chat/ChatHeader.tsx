"use client";

import { MessageSquare, Users, X } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  isConnected: boolean;
  userCount?: number;
  onCollapse?: () => void;
}

export function ChatHeader({
  isConnected,
  userCount,
  onCollapse,
}: ChatHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-gray-900/90 backdrop-blur-md border-b border-gray-800">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-gray-400" />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
            Live Chat
          </h2>
          {userCount !== undefined && userCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Users className="w-3 h-3" />
              {userCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Status Online/Offline */}
          <div className="flex items-center gap-2">
            <motion.div
              animate={{
                scale: isConnected ? [1, 1.2, 1] : 1,
              }}
              transition={{
                duration: 1,
                repeat: isConnected ? Infinity : 0,
              }}
              className={cn(
                "w-2 h-2 rounded-full",
                isConnected ? "bg-green-500" : "bg-red-500"
              )}
            />
            <span className="text-xs text-gray-400">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>

          {/* Collapse button (mobile) */}
          {onCollapse && (
            <button
              onClick={onCollapse}
              className="p-1 hover:bg-gray-800 rounded transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
