const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

interface Props {
  centered?: boolean;
}

export function LaunchAppCta({ centered = false }: Props) {
  return (
    <div className={centered ? "text-center" : ""}>
      <a
        href={`${APP_URL}/browse`}
        className="font-mono-ctv inline-block rounded-md bg-[#E8001D] px-7 py-4 text-[14px] font-bold uppercase tracking-[0.06em] text-white transition-all hover:-translate-y-px hover:bg-[#FF1737]"
        style={{ boxShadow: "0 8px 32px rgba(232,0,29,0.25)" }}
      >
        Launch App
      </a>
    </div>
  );
}
