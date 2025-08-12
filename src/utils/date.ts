export function parseYMD(ymd: string | number | Date): Date {
  if (typeof ymd === 'number') return new Date(ymd * 86400000); // dayNumber
  if (typeof ymd === 'string') {
    const [y, m, d] = ymd.split('-').map(Number);
    if (
      Number.isNaN(y) ||
      Number.isNaN(m) ||
      Number.isNaN(d) ||
      m === undefined ||
      d === undefined
    ) {
      throw new Error(`Invalid date string: ${ymd}`);
    }
    if (
      typeof y !== 'number' || Number.isNaN(y) ||
      typeof m !== 'number' || Number.isNaN(m) ||
      typeof d !== 'number' || Number.isNaN(d)
    ) {
      throw new Error(`Invalid date string: ${ymd}`);
    }
    return new Date(Date.UTC(y, m - 1, d));
  }
  // Date -> normaliza p/ 00:00 UTC
  return new Date(Date.UTC(ymd.getUTCFullYear(), ymd.getUTCMonth(), ymd.getUTCDate()));
}

export function toDayNumber(ymd: string | number | Date): number {
  return Math.floor(parseYMD(ymd).getTime() / 86400000);
}

export function fromDayNumber(dayNum: number): string {
  const ms = dayNum * 86400000;
  const dt = new Date(ms);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dt.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
