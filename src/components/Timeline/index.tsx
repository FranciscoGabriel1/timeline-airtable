import React, { useMemo } from 'react';
import assignLanes from '../../assignLanes';
import type { RawItem, TimelineItem } from '../../types';
import { fromDayNumber, toDayNumber } from '../../utils/date';

const LANE_H = 36;
const PX_PER_DAY = 22;

type Props = {
  items: RawItem[];
};

export default function Timeline({ items }: Props) {
  const normalized: TimelineItem[] = useMemo(
    () =>
      items.map((it) => {
        // @ts-expect-error narrow de shape
        const start = (it.startDate ?? it.start) as string;
        // @ts-expect-error narrow de shape
        const end = (it.endDate ?? it.end) as string;
        return {
          id: (it as any).id,
          name: (it as any).name,
          startDate: start,
          endDate: end,
          __start: toDayNumber(start),
          __end: toDayNumber(end),
        };
      }),
    [items]
  );

  const withLanes = useMemo(() => assignLanes(normalized), [normalized]);
  const laneCount = 1 + Math.max(0, ...withLanes.map((i) => i.lane ?? 0));

  const minDay = useMemo(() => Math.min(...normalized.map((i) => i.__start!)), [normalized]);
  const maxDay = useMemo(() => Math.max(...normalized.map((i) => i.__end!)), [normalized]);

  const totalDays = maxDay - minDay + 1;
  const width = Math.max(600, (totalDays + 4) * PX_PER_DAY);
  const height = laneCount * LANE_H + 40;

  return (
    <div className="tl-wrap">
      <div className="tl-canvas" style={{ width, height }}>
        <div className="tl-ruler">
          {Array.from({ length: totalDays + 1 }).map((_, idx) => {
            const day = minDay + idx;
            const label = fromDayNumber(day).slice(5);
            return (
              <div
                key={day}
                className="tl-tick"
                style={{ left: (idx + 2) * PX_PER_DAY }}
                title={label}
              >
                <span>{label}</span>
              </div>
            );
          })}
        </div>

        {Array.from({ length: laneCount }).map((_, lane) => (
          <div key={lane} className="tl-lane" style={{ top: lane * LANE_H + 32, height: LANE_H }} />
        ))}

        {withLanes.map((it) => {
          const left = ((it.__start! - minDay) + 2) * PX_PER_DAY;
          const w = Math.max(PX_PER_DAY * (it.__end! - it.__start! + 1), 14);
          const top = (it.lane ?? 0) * LANE_H + 32 + 4;

          return (
            <div
              key={it.id}
              className="tl-item"
              style={{ left, top, width: w, height: LANE_H - 8 }}
              title={`${it.name} (${it.startDate} – ${it.endDate})`}
            >
              <span className="tl-item__label">{it.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
