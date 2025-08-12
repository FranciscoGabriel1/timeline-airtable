import React, { useMemo } from 'react';
import assignLanes from '../../assignLanes';
import { toDayNumber } from '../../utils/date';
import { formatDateLabel, chooseTickStep } from '../../utils/formatDateLabel';
import type { RawItem, TimelineItem } from '../../types';

const LANE_HEIGHT = 36;
const PIXELS_PER_DAY = 22;

type TimelineProps = { items: RawItem[] };

export default function Timeline({ items }: TimelineProps) {
  // Normalize item fields to a single shape (startDate/endDate).
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

  const itemsWithLanes = useMemo(() => assignLanes(normalized), [normalized]);
  const laneCount = 1 + Math.max(0, ...itemsWithLanes.map((i) => i.lane ?? 0));

  const minDay = useMemo(() => Math.min(...normalized.map((i) => i.__start!)), [normalized]);
  const maxDay = useMemo(() => Math.max(...normalized.map((i) => i.__end!)), [normalized]);

  const totalDays = maxDay - minDay + 1;
  const canvasWidth = Math.max(720, (totalDays + 4) * PIXELS_PER_DAY);
  const canvasHeight = laneCount * LANE_HEIGHT + 40;

  // Adaptive tick density to prevent overlapping labels.
  const tickStep = chooseTickStep(PIXELS_PER_DAY);

  return (
    <div className="timelineViewport">
      <div className="timelineCanvas" style={{ width: canvasWidth, height: canvasHeight }}>
        {/* Top date ruler */}
        <div className="ruler">
          {Array.from({ length: Math.floor(totalDays / tickStep) + 1 }).map((_, i) => {
            const day = minDay + i * tickStep;
            const label = formatDateLabel(day);
            const left = ( (day - minDay) + 2 ) * PIXELS_PER_DAY;
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
            >
              <span className="itemLabel">{it.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
