export { ChartCard01, default } from './chart-card-01'
// The reading is a shape a caller builds a typed list of, and the span is the union
// that keeps a `colSpan` number out of the surface. Both are part of the surface
// rather than internal, because a caller composing cards separately has to name them
// to do so.
export type {
  ChartCard01Props,
  ChartCard01Reading,
  ChartCard01Span,
} from './chart-card-01'
