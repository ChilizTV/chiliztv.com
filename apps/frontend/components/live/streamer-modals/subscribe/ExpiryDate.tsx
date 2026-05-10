"use client";

interface ExpiryDateProps {
  months: number;
}

/** Renders the date the subscription will expire (today + N months). */
export function ExpiryDate({ months }: ExpiryDateProps) {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return (
    <span>
      {d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })}
    </span>
  );
}
