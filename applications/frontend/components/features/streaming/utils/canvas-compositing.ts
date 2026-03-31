/**
 * @notice Canvas compositing utilities for combining screen and camera streams
 * @dev Handles aspect ratio calculations and canvas positioning
 */

/**
 * @notice Calculate canvas dimensions maintaining video aspect ratio
 * @param containerWidth Container width in pixels
 * @param containerHeight Container height in pixels
 * @param videoWidth Video width in pixels
 * @param videoHeight Video height in pixels
 * @return Canvas dimensions and offset
 */
export function calculateCanvasDimensions(
  containerWidth: number,
  containerHeight: number,
  videoWidth: number,
  videoHeight: number
): {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  scaleX: number;
  scaleY: number;
} {
  const containerAspect = containerWidth / containerHeight;
  const videoAspect = videoWidth / videoHeight;

  let canvasWidth: number;
  let canvasHeight: number;

  if (containerAspect > videoAspect) {
    // Container is wider, fit to height
    canvasHeight = containerHeight;
    canvasWidth = canvasHeight * videoAspect;
  } else {
    // Container is taller, fit to width
    canvasWidth = containerWidth;
    canvasHeight = canvasWidth / videoAspect;
  }

  const offsetX = (containerWidth - canvasWidth) / 2;
  const offsetY = (containerHeight - canvasHeight) / 2;
  const scaleX = containerWidth > 0 ? canvasWidth / containerWidth : 1;
  const scaleY = containerHeight > 0 ? canvasHeight / containerHeight : 1;

  return {
    width: canvasWidth,
    height: canvasHeight,
    offsetX,
    offsetY,
    scaleX,
    scaleY,
  };
}

/**
 * @notice Draw combined stream on canvas
 * @param canvas Canvas element
 * @param screenVideo Screen video element
 * @param cameraVideo Camera video element
 * @param cameraPosition Camera overlay position
 * @param cameraSize Camera overlay size
 * @param cameraVisible Whether camera overlay is visible
 * @param containerWidth Container width for scaling
 * @param containerHeight Container height for scaling
 */
// Streaming canvas resolution — must match stream-client.service.ts
const STREAM_WIDTH = 1280;
const STREAM_HEIGHT = 720;

export function drawCombinedStream(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  screenVideo: HTMLVideoElement,
  cameraVideo: HTMLVideoElement,
  cameraPosition: { x: number; y: number },
  cameraSize: { width: number; height: number },
  cameraVisible: boolean,
  _containerWidth: number,
  _containerHeight: number,
): void {
  if (screenVideo.videoWidth === 0 || screenVideo.videoHeight === 0) {
    return;
  }

  // Always use streaming canvas dimensions so cameraPosition coordinates match
  // exactly what stream-client.service.ts sends via WHIP. CSS scaling handles display.
  canvas.width = STREAM_WIDTH;
  canvas.height = STREAM_HEIGHT;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, STREAM_WIDTH, STREAM_HEIGHT);

  ctx.drawImage(screenVideo, 0, 0, STREAM_WIDTH, STREAM_HEIGHT);

  if (cameraVisible && cameraVideo.videoWidth > 0 && cameraVideo.videoHeight > 0) {
    ctx.drawImage(cameraVideo, cameraPosition.x, cameraPosition.y, cameraSize.width, cameraSize.height);
  }
}
