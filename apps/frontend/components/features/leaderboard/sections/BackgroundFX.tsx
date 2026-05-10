/**
 * Fixed background — grid + three radial blooms (red top-left, gold
 * mid-right, red bottom-center). `pointer-events-none` and `z-0` so it
 * never intercepts clicks or hides above the global Header.
 */
export function BackgroundFX() {
    return (
        <>
            <div
                aria-hidden
                className="pointer-events-none fixed inset-0 z-0"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(232,0,29,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(232,0,29,0.025) 1px, transparent 1px)',
                    backgroundSize: '64px 64px',
                    maskImage:
                        'radial-gradient(ellipse 80% 60% at 50% 25%, black, transparent 80%)',
                    WebkitMaskImage:
                        'radial-gradient(ellipse 80% 60% at 50% 25%, black, transparent 80%)',
                }}
            />
            <div
                aria-hidden
                className="pointer-events-none fixed z-0"
                style={{
                    top: '-260px',
                    left: '-160px',
                    width: 720,
                    height: 720,
                    background: 'radial-gradient(circle, rgba(232,0,29,0.20), transparent 60%)',
                    filter: 'blur(20px)',
                }}
            />
            <div
                aria-hidden
                className="pointer-events-none fixed z-0"
                style={{
                    top: '20%',
                    right: '-220px',
                    width: 600,
                    height: 600,
                    background: 'radial-gradient(circle, rgba(245,197,24,0.10), transparent 60%)',
                    filter: 'blur(28px)',
                }}
            />
            <div
                aria-hidden
                className="pointer-events-none fixed z-0"
                style={{
                    bottom: '-260px',
                    left: '30%',
                    width: 700,
                    height: 700,
                    background: 'radial-gradient(circle, rgba(232,0,29,0.13), transparent 60%)',
                    filter: 'blur(22px)',
                }}
            />
        </>
    );
}
