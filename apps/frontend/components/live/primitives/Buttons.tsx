"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type BaseProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> & {
  leading?: ReactNode;
  trailing?: ReactNode;
  full?: boolean;
};

export function PrimaryBtn({
  children,
  leading,
  trailing,
  full,
  className = "",
  type = "button",
  disabled,
  style,
  ...rest
}: BaseProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`font-mono-ctv inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${
        full ? "w-full" : ""
      } ${disabled ? "cursor-not-allowed opacity-50" : "hover:bg-[#FF1737]"} ${className}`}
      style={{ background: "#E8001D", color: "#fff", ...style }}
      {...rest}
    >
      {leading}
      {children}
      {trailing}
    </button>
  );
}

interface GhostBtnProps extends BaseProps {
  active?: boolean;
  color?: string;
}

export function GhostBtn({
  children,
  leading,
  trailing,
  full,
  active = false,
  color,
  className = "",
  type = "button",
  disabled,
  style,
  ...rest
}: GhostBtnProps) {
  const c = color ?? (active ? "#E8001D" : "rgba(255,255,255,0.7)");
  return (
    <button
      type={type}
      disabled={disabled}
      className={`font-mono-ctv inline-flex items-center justify-center gap-2 rounded-md border bg-transparent px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${
        full ? "w-full" : ""
      } ${disabled ? "cursor-not-allowed opacity-40" : "hover:border-[#3A3A3A] hover:text-white"} ${className}`}
      style={{
        borderColor: active ? "#E8001D" : "#2A2A2A",
        color: c,
        background: active ? "rgba(232,0,29,0.08)" : "transparent",
        ...style,
      }}
      {...rest}
    >
      {leading}
      {children}
      {trailing}
    </button>
  );
}

export function GoldBtn({
  children,
  leading,
  trailing,
  full,
  className = "",
  type = "button",
  disabled,
  style,
  ...rest
}: BaseProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`font-mono-ctv inline-flex items-center justify-center gap-2 rounded-md border px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors hover:bg-[rgba(245,197,24,0.12)] ${
        full ? "w-full" : ""
      } ${disabled ? "cursor-not-allowed opacity-40" : ""} ${className}`}
      style={{
        borderColor: "#F5C518",
        color: "#F5C518",
        background: "rgba(245,197,24,0.06)",
        ...style,
      }}
      {...rest}
    >
      {leading}
      {children}
      {trailing}
    </button>
  );
}
