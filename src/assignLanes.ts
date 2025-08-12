import { toDayNumber as toDayNum } from './utils/date';
import type { TimelineItem } from './types';

export default function assignLanes(
  items: TimelineItem[],
  toDayNumber: (ymd: string | number | Date) => number = toDayNum
): TimelineItem[] {
  const enriched = items
    .map((it) => {
      const __start = typeof it.__start === 'number' ? it.__start : toDayNumber(it.startDate);
      const __end = typeof it.__end === 'number' ? it.__end : toDayNumber(it.endDate);
      return { ...it, __start, __end } as TimelineItem;
    })
    .sort((a, b) => {
      if (a.__start! !== b.__start!) return a.__start! - b.__start!;
      const ad = a.__end! - a.__start!;
      const bd = b.__end! - b.__start!;
      return ad - bd;
    });

  const lanes: { lastEnd: number; items: TimelineItem[] }[] = [];

  for (const it of enriched) {
    let placed = false;

    for (let i = 0; i < lanes.length; i++) {
      const lane = lanes[i]; // agora o TS sabe que lane existe
      if (lane && lane.lastEnd < it.__start!) {
        lane.items.push(it);
        lane.lastEnd = Math.max(lane.lastEnd, it.__end!);
        it.lane = i;
        placed = true;
        break;
      }
    }

    if (!placed) {
      lanes.push({ lastEnd: it.__end!, items: [it] });
      it.lane = lanes.length - 1;
    }
  }

  return enriched;
}
