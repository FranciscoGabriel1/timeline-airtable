import React, { useEffect, useMemo, useRef, useState } from 'react';
import assignLanes from '../../assignLanes';
import { toDayNumber } from '../../utils/date';
import { formatDateLabel, chooseTickStep } from '../../utils/formatDateLabel';
import ZoomControls from '../ZoomControls';
import type { RawItem, TimelineItem } from '../../types';

const LANE_HEIGHT = 36;
const BASE_PIXELS_PER_DAY = 22;

type TimelineProps = {
  items: RawItem[];
  /** Where to place the zoom controls: 'right' (default) or 'center'. */
  controlsAlign?: 'right' | 'center';
};

export default function Timeline({ items, controlsAlign = 'right' }: TimelineProps) {
  // Normalize incoming items to a consistent shape.
  const normalized: TimelineItem[] = useMemo(
    () =>
      items.map((item) => {
        const start = (item as any).startDate ?? (item as any).start;
        const end = (item as any).endDate ?? (item as any).end;
        return {
          id: (item as any).id,
          name: (item as any).name,
          startDate: start,
          endDate: end,
          __start: toDayNumber(start),
          __end: toDayNumber(end),
        };
      }),
    [items]
  );

  // Zoom state and viewport ref for Ctrl+wheel zooming.
  const [zoom, setZoom] = useState(1);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const PIXELS_PER_DAY = BASE_PIXELS_PER_DAY * zoom;

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // Ctrl + wheel to zoom; normal wheel scroll remains default.
      if (!e.ctrlKey) return;
      e.preventDefault();
      setZoom((z) => {
        const next = e.deltaY < 0 ? z * 1.25 : z / 1.25;
        return Math.max(0.25, Math.min(3, next));
      });
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const zoomIn = () => setZoom((z) => Math.min(3, z * 1.25));
  const zoomOut = () => setZoom((z) => Math.max(0.25, z / 1.25));
  const zoomReset = () => setZoom(1);

  // Compute lanes and canvas geometry.
  const itemsWithLanes = useMemo(() => assignLanes(normalized), [normalized]);
  const laneCount = 1 + Math.max(0, ...itemsWithLanes.map((i) => i.lane ?? 0));
  const minDay = useMemo(() => Math.min(...normalized.map((i) => i.__start!)), [normalized]);
  const maxDay = useMemo(() => Math.max(...normalized.map((i) => i.__end!)), [normalized]);

  const totalDays = maxDay - minDay + 1;
  const canvasWidth = Math.max(720, (totalDays + 4) * PIXELS_PER_DAY);
  const canvasHeight = laneCount * LANE_HEIGHT + 40;

  // Adaptive ruler density based on current zoom.
  const tickStep = chooseTickStep(PIXELS_PER_DAY);

  return (
    <>
      {/* Wrapper controls alignment: right (default) or center */}
      <div className={`zoomContainer zoomContainer--${controlsAlign}`}>
        <ZoomControls zoom={zoom} onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={zoomReset} />
      </div>

      {/* Scrollable timeline viewport */}
      <div ref={viewportRef} className="timelineViewport">
        <div className="timelineCanvas" style={{ width: canvasWidth, height: canvasHeight }}>
          {/* Top ruler */}
          <div className="ruler">
            {Array.from({ length: Math.floor(totalDays / tickStep) + 1 }).map((_, i) => {
              const day = minDay + i * tickStep;
              const label = formatDateLabel(day); // "MM-DD"
              const left = ((day - minDay) + 2) * PIXELS_PER_DAY;
              return (
                <div key={day} className="rulerTick" style={{ left }} title={label}>
                  <span>{label}</span>
                </div>
              );
            })}
          </div>

          {/* Lanes */}
          {Array.from({ length: laneCount }).map((_, laneIndex) => (
            <div
              key={laneIndex}
              className="lane"
              style={{ top: laneIndex * LANE_HEIGHT + 32, height: LANE_HEIGHT }}
            />
          ))}

          {/* Items */}
          {itemsWithLanes.map((it) => {
            const left = ((it.__start! - minDay) + 2) * PIXELS_PER_DAY;
            const width = Math.max(PIXELS_PER_DAY * (it.__end! - it.__start! + 1), 14);
            const top = (it.lane ?? 0) * LANE_HEIGHT + 32 + 4;

            return (
              <div
                key={it.id}
                className="item"
                style={{ left, top, width, height: LANE_HEIGHT - 8 }}
                title={`${it.name} (${it.startDate} – ${it.endDate})`}
                role="button"
                tabIndex={0}
                aria-label={`${it.name}: ${it.startDate} to ${it.endDate}`}
              >
                <span className="itemLabel">{it.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
