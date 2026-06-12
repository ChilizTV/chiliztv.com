import { GuardSteps } from './GuardSteps';

const NOISE_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

/** Shared atmospheric frame — theatrics live here only, work screens stay flat. */
export function GuardFrame({
  step,
  children,
}: Readonly<{ step?: number; children: React.ReactNode }>) {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[#0A0A0A] text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(900px 480px at 50% -8%, rgba(232,0,29,0.13), transparent 65%), radial-gradient(640px 400px at 88% 112%, rgba(232,0,29,0.06), transparent 60%)',
        }}
      />
      <div aria-hidden="true" className="absolute inset-0 opacity-[0.18] mix-blend-overlay" style={{ backgroundImage: NOISE_URI }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img aria-hidden="true" src="/predcast-mark.svg" alt="" className="absolute -bottom-32 -right-24 w-[440px] opacity-[0.05]" />
      <div className="relative z-10 flex flex-col items-center">
        {step !== undefined && (
          <div className="mb-8">
            <GuardSteps step={step} />
          </div>
        )}
        {children}
      </div>
      <div className="font-mono-ctv absolute bottom-7 z-10 text-[9px] uppercase tracking-[0.22em] text-white/25">
        PredCast operations · access is logged
      </div>
    </main>
  );
}
