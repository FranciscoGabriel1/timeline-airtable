export type RawItem =
  | { id: string | number; name: string; startDate: string; endDate: string }
  | { id: string | number; name: string; start: string; end: string };

export type TimelineItem = {
  id: string | number;
  name: string;
  startDate: string; // normalizado
  endDate: string;   // normalizado
  // campos auxiliares internos
  __start?: number;
  __end?: number;
  lane?: number;
};
