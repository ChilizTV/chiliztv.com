/**
 * @notice Draggable and resizable camera overlay for combined streaming
 * @dev Renders border and resize handle for camera positioning
 */

interface CameraOverlayProps {
  position: { x: number; y: number };
  size: { width: number; height: number };
  canvasOffset: { x: number; y: number };
  canvasScale: { x: number; y: number };
  visible: boolean;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onResizeStart: (e: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * @notice Render camera overlay with drag and resize handles
 * @param props Overlay position, size, and event handlers
 */
export function CameraOverlay({
  position,
  size,
  canvasOffset,
  canvasScale,
  visible,
  onMouseDown,
  onResizeStart,
}: CameraOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className="absolute border-2 border-black cursor-move bg-transparent"
      style={{
        left: `${canvasOffset.x + position.x * canvasScale.x}px`,
        top: `${canvasOffset.y + position.y * canvasScale.y}px`,
        width: `${size.width * canvasScale.x}px`,
        height: `${size.height * canvasScale.y}px`,
      }}
      onMouseDown={onMouseDown}
    >
      <div
        className="absolute bottom-0 right-0 w-4 h-4 bg-black cursor-se-resize"
        onMouseDown={onResizeStart}
      />
    </div>
  );
}
