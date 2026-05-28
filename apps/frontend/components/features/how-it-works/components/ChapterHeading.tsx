export function ChapterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-display m-0 mb-7 max-w-170 font-extrabold uppercase text-white"
      style={{
        fontSize: "clamp(40px, 5vw, 64px)",
        lineHeight: 0.95,
        letterSpacing: "-0.015em",
      }}
    >
      {children}
    </h2>
  );
}
