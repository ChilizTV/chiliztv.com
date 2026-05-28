import { SHELL } from "../components/ChapterShell";

export function Topbar() {
  return (
    <div className="border-b border-[#1E1E1E] py-4.5">
      <div className={`${SHELL} font-mono-ctv grid grid-cols-3 gap-6 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40`}>
        <span>
          Chiliz<span className="text-[#E8001D]">·</span>TV — <span className="text-white">DOC.001</span>
        </span>
        <span className="text-center">Newcomer&apos;s guide · v1.0</span>
        <span className="text-right">~5 min</span>
      </div>
    </div>
  );
}
