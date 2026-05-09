interface Step {
    readonly id: string;
    readonly label: string;
}

interface StepIndicatorProps {
    readonly steps: ReadonlyArray<Step>;
    readonly activeIdx: number;
}

/** Desktop step dots — past=green, active=red, future=grey. */
export function StepIndicator({ steps, activeIdx }: StepIndicatorProps) {
    return (
        <div className="px-7 py-4">
            <div className="relative grid" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
                <div className="absolute left-[12.5%] right-[12.5%] top-[7px] h-px bg-[#1E1E1E]" />
                {steps.map((s, i) => {
                    const past = i < activeIdx;
                    const active = i === activeIdx;
                    return (
                        <div key={s.id} className="relative flex flex-col items-center gap-2">
                            <span
                                className="relative z-[1] block h-[15px] w-[15px] rounded-full transition-all"
                                style={{
                                    background: active ? '#E8001D' : past ? '#2dd4a4' : '#2A2A2A',
                                    boxShadow: active ? '0 0 0 4px rgba(232,0,29,0.20)' : '0 0 0 2px #0A0A0A',
                                }}
                            />
                            <span
                                className="font-mono-ctv text-[9px] font-bold uppercase tracking-[0.16em]"
                                style={{ color: active ? '#fff' : past ? 'rgba(45,212,164,0.9)' : 'rgba(255,255,255,0.45)' }}
                            >
                                {i + 1} · {s.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export const BET_DIALOG_STEPS: ReadonlyArray<Step> = [
    { id: 'pick',    label: 'Pick' },
    { id: 'stake',   label: 'Stake' },
    { id: 'review',  label: 'Review' },
    { id: 'success', label: 'Done' },
];
