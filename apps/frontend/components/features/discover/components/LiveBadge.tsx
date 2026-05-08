export function LiveBadge({
  pulse = true,
  label = "Live",
  small = false,
}: {
  pulse?: boolean;
  label?: string;
  small?: boolean;
}) {
  return (
    <span
      className={`font-mono-ctv inline-flex items-center gap-2 rounded-full border ${
        small ? "px-2 py-[3px] text-[9px]" : "px-3 py-[6px] text-[10px]"
      } font-bold uppercase tracking-[0.16em] text-[#E8001D]`}
      style={{
        background: "rgba(232,0,29,0.08)",
        borderColor: "rgba(232,0,29,0.4)",
      }}
    >
      <span
        className={`${pulse ? "ctv-pulse-dot" : ""} inline-block ${
          small ? "h-1 w-1" : "h-[6px] w-[6px]"
        } rounded-full bg-[#E8001D]`}
        style={{ boxShadow: "0 0 8px #E8001D" }}
      />
      {label}
    </span>
  );
}
