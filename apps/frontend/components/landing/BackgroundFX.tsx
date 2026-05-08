export function BackgroundFX() {
  return (
    <>
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(232,0,29,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(232,0,29,0.025) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 30%, black, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 30%, black, transparent 80%)",
        }}
      />
      <div
        aria-hidden
        className="fixed pointer-events-none z-0"
        style={{
          top: "-260px",
          left: "-160px",
          width: "720px",
          height: "720px",
          background:
            "radial-gradient(circle, rgba(232,0,29,0.25), transparent 60%)",
          filter: "blur(20px)",
        }}
      />
      <div
        aria-hidden
        className="fixed pointer-events-none z-0"
        style={{
          bottom: "-200px",
          right: "-160px",
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(232,0,29,0.18), transparent 60%)",
          filter: "blur(20px)",
        }}
      />
    </>
  );
}
