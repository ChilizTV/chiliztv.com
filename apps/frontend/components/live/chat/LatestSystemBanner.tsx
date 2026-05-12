"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChatMessage, SystemMessageType } from "@/models/chat.model";

interface LatestSystemBannerProps {
  /** The most recent system message to surface, or `null` if none. */
  message: ChatMessage | null;
}

const TYPE_LABEL: Partial<Record<SystemMessageType, string>> = {
  [SystemMessageType.BET_PLACED]: "Prediction placed",
  [SystemMessageType.DONATION]: "Tip received",
  [SystemMessageType.SUBSCRIPTION]: "New subscriber",
};

/** Best-effort label for a system row — falls back to text-sniffing the message body. */
function labelFor(message: ChatMessage): string {
  if (message.systemEventType && TYPE_LABEL[message.systemEventType]) {
    return TYPE_LABEL[message.systemEventType]!;
  }
  const body = message.message.toLowerCase();
  if (body.includes("prediction") || body.includes("bet")) return "Prediction placed";
  if (body.includes("tip") || body.includes("donat")) return "Tip received";
  if (body.includes("subscrib")) return "New subscriber";
  return "Event";
}

/**
 * Single-slot banner pinned to the top of the chat — shows only the most
 * recent system event (bet / tip / sub). When a new system event arrives,
 * it replaces the previous one with a fade/slide so the older event is
 * no longer visible anywhere in the chat (system messages are filtered
 * out of the regular message list upstream).
 */
export function LatestSystemBanner({ message }: LatestSystemBannerProps) {
  return (
    <div className="border-b border-[#1E1E1E] bg-[#0d0d0d] px-3 pb-3 pt-3">
      <AnimatePresence mode="wait" initial={false}>
        {message ? (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="relative overflow-hidden rounded-md border px-3 py-2.5"
            style={{
              background:
                "linear-gradient(90deg, rgba(245,197,24,0.10) 0%, rgba(245,197,24,0.04) 60%)",
              borderColor: "rgba(245,197,24,0.45)",
              boxShadow: "0 0 0 1px rgba(245,197,24,0.05) inset",
            }}
          >
            <span
              aria-hidden
              className="absolute left-0 top-0 h-full w-1"
              style={{ background: "#F5C518" }}
            />
            <div
              className="font-mono-ctv flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em]"
              style={{ color: "#F5C518" }}
            >
              <span aria-hidden className="block h-0.5 w-3" style={{ background: "#F5C518" }} />
              {labelFor(message)}
              <span className="text-white/35">· {message.username}</span>
            </div>
            <div className="font-display mt-1 text-[14px] font-extrabold uppercase tracking-tight text-white">
              {message.message}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="rounded-md border border-dashed border-[#1E1E1E] px-3 py-2.5 text-center"
          >
            <div className="font-mono-ctv text-[9px] uppercase tracking-[0.18em] text-white/35">
              Tips · Bets · Subs land here
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
