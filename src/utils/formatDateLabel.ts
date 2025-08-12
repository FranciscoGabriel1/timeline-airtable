// Formats day numbers to labels for the ruler.
// Uses UTC to avoid timezone shifts.
import { fromDayNumber } from './date';

/** Returns "MM-DD" by default or "YYYY-MM-DD" when withYear=true. */
export function formatDateLabel(dayNumber: number, withYear = false): string {
  const iso = fromDayNumber(dayNumber); // "YYYY-MM-DD"
  return withYear ? iso : iso.slice(5); // "MM-DD"
}

/** Chooses a reasonable tick step (in days) based on pixels-per-day. */
export function chooseTickStep(pixelsPerDay: number): number {
  // Keep labels ~>= 40px apart to avoid clutter.
  const minLabelSpacingPx = 40;
  const raw = Math.ceil(minLabelSpacingPx / Math.max(1, pixelsPerDay)); // days
  // Snap to common steps (1, 2, 5, 7, 10, 14)
  const candidates = [1, 2, 5, 7, 10, 14, 21, 28, 30];
  for (const c of candidates) if (c >= raw) return c;
  return raw;
}
