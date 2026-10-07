export { ChartCard01, default } from './chart-card-01'
// The span is the union that keeps a `colSpan` number out of the surface, and it is
// part of the surface rather than internal because a caller composing cards
// separately has to name it. `ChartCard01Reading` is a deprecated alias of
// `MetricSpec` from `@nanisoft/prism-ui/spec`, kept resolvable while the other figure
// owners are migrated; new code types its reading line with `MetricSpec` directly.
export type {
  ChartCard01Props,
  ChartCard01Reading,
  ChartCard01Span,
} from './chart-card-01'
