
type ZoomControlsProps = {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
};

export default function ZoomControls({ zoom, onZoomIn, onZoomOut, onReset }: ZoomControlsProps) {
  return (
    <div className="zoomBar" role="toolbar" aria-label="Zoom controls">
      <button className="zoomBtn" onClick={onZoomOut} aria-label="Zoom out">−</button>
      <span className="zoomLevel" aria-live="polite">{Math.round(zoom * 100)}%</span>
      <button className="zoomBtn" onClick={onZoomIn} aria-label="Zoom in">+</button>
      <button className="zoomBtn" onClick={onReset} aria-label="Reset zoom">Reset</button>
    </div>
  );
}
