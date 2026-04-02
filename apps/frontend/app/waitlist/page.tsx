"use client";

import dynamic from "next/dynamic";

// Import WaitlistContent dynamically with SSR disabled to avoid "window is not defined" error
// This is necessary because Dynamic Labs SDK uses browser-only APIs at the module level
const WaitlistContent = dynamic(() => import("./WaitlistContent"), {
    ssr: false,
    loading: () => (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="text-center space-y-3 animate-in fade-in duration-300">
                <p className="text-sm uppercase tracking-[0.3em] text-primary">ChilizTV</p>
                <p className="text-xl font-semibold text-white/80">Loading...</p>
            </div>
        </div>
    ),
});

export default function WaitlistPage() {
    return <WaitlistContent />;
}
