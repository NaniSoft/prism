export { Calendar01, default } from './calendar'
// The item is named because a caller who keeps a month's schedule in one module
// and renders it in another has to name the type to do so. The Component itself is
// named `Calendar01` and not `Calendar01` because `calendar.tsx` is already a
// Component in this package and a Block with the same short name would be two
// surfaces a reader could not tell apart in an import.
export type { CalendarBlock01Props, CalendarItem } from './calendar'
