import { Loader2 } from 'lucide-react';

interface DialogFooterProps {
    readonly onBack?: () => void;
    readonly onNext: () => void;
    readonly nextLabel?: string;
    readonly nextDisabled?: boolean;
    readonly submitting?: boolean;
}

/** Back / Continue footer used on Pick, Stake, Review steps. */
export function DialogFooter({ onBack, onNext, nextLabel = 'Continue →', nextDisabled, submitting }: DialogFooterProps) {
    return (
        <div className="flex items-center justify-between gap-3">
            <button
                type="button"
                onClick={onBack}
                disabled={!onBack}
                className="font-mono-ctv rounded-md border border-[#2A2A2A] bg-transparent px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/65 hover:border-[#3A3A3A] hover:text-white disabled:opacity-30 disabled:hover:border-[#2A2A2A]"
            >
                ← Back
            </button>
            <button
                type="button"
                onClick={onNext}
                disabled={nextDisabled || submitting}
                className="font-display flex flex-1 items-center justify-center gap-2 rounded-md bg-[#E8001D] px-6 py-3.5 text-[14px] font-bold uppercase tracking-[0.06em] text-white transition-transform hover:-translate-y-px hover:bg-[#FF1737] disabled:translate-y-0 disabled:opacity-40 disabled:hover:bg-[#E8001D]"
                style={{ boxShadow: '0 8px 32px rgba(232,0,29,0.25)' }}
            >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {submitting ? 'Submitting…' : nextLabel}
            </button>
        </div>
    );
}
