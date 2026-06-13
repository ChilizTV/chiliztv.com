import { toBlob } from 'html-to-image';

/**
 * Rasterises a full-size win-card node to a PNG Blob. Best-effort: returns
 * null if capture fails (e.g. a team logo CDN without CORS taints the canvas),
 * so callers can fall back to a link share. Fonts are flushed first so the
 * Barlow/JetBrains glyphs are embedded.
 */
export async function captureWinCard(node: HTMLElement): Promise<Blob | null> {
  try {
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      await document.fonts.ready;
    }
    return await toBlob(node, {
      pixelRatio: 1, // node is already 1080-wide — native share resolution
      cacheBust: true,
      backgroundColor: '#0A0A0A',
    });
  } catch {
    return null;
  }
}
