/**
 * Page chrome — fixed grid + ambient red glows. Same visual idiom as the
 * landing's BackgroundFX but kept feature-local so /browse stays decoupled
 * from /landing components.
 */
export function BackgroundFX() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
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
        className="pointer-events-none fixed z-0"
        style={{
          top: "-260px",
          left: "-160px",
          width: 720,
          height: 720,
          background:
            "radial-gradient(circle, rgba(232,0,29,0.25), transparent 60%)",
          filter: "blur(20px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed z-0"
        style={{
          bottom: "-200px",
          right: "-160px",
          width: 600,
          height: 600,
          background:
            "radial-gradient(circle, rgba(232,0,29,0.18), transparent 60%)",
          filter: "blur(20px)",
        }}
      />
    </>
  );
}
