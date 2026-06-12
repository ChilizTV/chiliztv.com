import { Icon } from '@/components/common/Icon';

const STEPS = ['Gate', 'Wallet', 'Signature'] as const;

/** 01–03 rail shared by the three guard screens so the flow reads as one journey. */
export function GuardSteps({ step }: Readonly<{ step: number }>) {
  return (
    <div className="font-mono-ctv flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.22em]">
      {STEPS.map((s, i) => (
        <span key={s} className="contents">
          <span className={`flex items-center gap-2 ${i < step ? 'text-[#2dd4a4]' : i === step ? 'text-white' : 'text-white/30'}`}>
            <span
              className={`grid h-[18px] w-[18px] place-items-center rounded-full border text-[8px] tabular-nums tracking-normal ${
                i < step
                  ? 'border-[#2dd4a4]/50 text-[#2dd4a4]'
                  : i === step
                    ? 'border-[#E8001D] bg-[#E8001D]/15 text-white'
                    : 'border-[#2A2A2A] text-white/30'
              }`}
            >
              {i < step ? <Icon n="check" s={9} /> : `0${i + 1}`}
            </span>
            <span>{s}</span>
          </span>
          {i < STEPS.length - 1 && (
            <span aria-hidden="true" className={`h-px w-10 ${i < step ? 'bg-[#2dd4a4]/40' : 'bg-[#222222]'}`} />
          )}
        </span>
      ))}
    </div>
  );
}
