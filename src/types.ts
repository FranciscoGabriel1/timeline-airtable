export type RawItem =
  | { id: string | number; name: string; startDate: string; endDate: string }
  | { id: string | number; name: string; start: string; end: string };

export type TimelineItem = {
  id: string | number;
  name: string;
  startDate: string; // normalized
  endDate: string;   // normalized
  __start?: number;  // internal day-number start
  __end?: number;    // internal day-number end
  lane?: number;     // computed lane index
};
