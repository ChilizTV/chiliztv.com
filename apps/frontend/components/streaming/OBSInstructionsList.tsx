// Compact OBS step reference shown in OBSSetupPanel's collapsible. The full
// narrative tutorial lives in How-it-works `ChapterOBSSetup`, which uses the
// page's own `StepsList` primitive for visual parity with the other chapters.

const OBS_STEPS: ReadonlyArray<ReadonlyArray<{ text: string; highlight?: string; color?: string }>> = [
    [{ text: 'Open OBS Studio → Settings → Stream' }],
    [{ text: 'Service: ' }, { text: '', highlight: 'Custom…' }],
    [{ text: 'Server: paste the ' }, { text: '', highlight: 'Server' }, { text: ' URL above' }],
    [{ text: 'Stream Key: paste the ' }, { text: '', highlight: 'Stream Key' }, { text: ' above' }],
    [{ text: 'Click Apply, then press ' }, { text: '', highlight: 'Start Streaming' }, { text: ' in OBS' }],
    [{ text: 'The ' }, { text: '', highlight: 'Live', color: '#E8001D' }, { text: ' badge updates within ~4 s' }],
];

export function OBSInstructionsList() {
    return (
        <ol className="space-y-2 border-t border-[#1E1E1E] px-4 pb-4 pt-3 text-[11px] font-light leading-relaxed text-white/55 list-decimal list-inside">
            {OBS_STEPS.map((segments, idx) => (
                <li key={idx}>
                    {segments.map((seg, sidx) =>
                        seg.highlight ? (
                            <span
                                key={sidx}
                                className={seg.color ? '' : 'text-white'}
                                style={seg.color ? { color: seg.color } : undefined}
                            >
                                {seg.highlight}
                            </span>
                        ) : (
                            <span key={sidx}>{seg.text}</span>
                        ),
                    )}
                </li>
            ))}
        </ol>
    );
}
