"use client";

import { useState } from "react";

export function TeamLogo({
  name,
  logo,
  size = 36,
}: {
  name: string;
  logo: string | null;
  size?: number;
}) {
  const [err, setErr] = useState(false);
  const initials = name.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase();

  return (
    <div
      className="flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full"
      style={{
        width: size,
        height: size,
        background: "#1A1A1A",
        border: "1px solid #2A2A2A",
      }}
    >
      {logo && !err ? (
        // Remote team crests come from api-sports.io — using <img> avoids
        // having to whitelist every CDN host in next.config images config.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt={name}
          width={size}
          height={size}
          className="object-contain"
          style={{ width: size * 0.78, height: size * 0.78 }}
          onError={() => setErr(true)}
        />
      ) : (
        <span
          className="font-display font-bold uppercase"
          style={{
            fontSize: size * 0.32,
            color: "#E8001D",
            letterSpacing: "0.02em",
          }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}
