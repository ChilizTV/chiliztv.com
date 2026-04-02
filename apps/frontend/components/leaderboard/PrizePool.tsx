"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { formatLargeNumber } from "@/lib/utils/formatting/number";

export default function PrizePool({ totalPrizePool }: { totalPrizePool: number }) {
    const [, setDisplayedNumber] = useState(0);
    const motionValue = useMotionValue(0);
    const formattedValue = useTransform(motionValue, (latest) =>
        formatLargeNumber(Math.floor(latest))
    );

    useEffect(() => {
        const controls = animate(motionValue, totalPrizePool, {
        duration: 1.8,
        ease: "easeOut",
        });

        motionValue.on("change", (v) => setDisplayedNumber(Math.floor(v)));

        return controls.stop;
    }, [totalPrizePool, motionValue]);

    return (
        <motion.div
        className="mb-8 text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        >
        <motion.div
            className="text-white/60 text-md mb-2 uppercase tracking-wide font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            Up to
        </motion.div>

        <motion.div
            className="text-white text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text"
            style={{ fontFamily: "Lexend, sans-serif" }}
        >
            {formattedValue}
        </motion.div>

        <motion.div
            className="text-white/60 text-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            in Fan Tokens.
        </motion.div>

        <motion.div
            className="w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto mt-2 rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.4, ease: "easeOut" }}
            style={{ originX: 0 }}
        />
        </motion.div>
    );
}