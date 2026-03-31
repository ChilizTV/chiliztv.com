"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewMessagesPillProps {
  count: number;
  visible: boolean;
  onClick: () => void;
}

export function NewMessagesPill({ count, visible, onClick }: NewMessagesPillProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10"
        >
          <Button
            onClick={onClick}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center gap-2 px-4 py-2 rounded-full transition-all active:scale-95"
          >
            <span className="text-sm font-medium">
              {count > 0 ? `${count} new message${count > 1 ? "s" : ""}` : "New messages"}
            </span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
