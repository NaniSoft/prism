export { Dashboard01, default } from './dashboard-01'
// The shapes a caller composes rather than passing as a flat prop. A dashboard whose
// metrics and panels were one anonymous record would be a shape no caller could build
// a typed list of, so they are part of the surface rather than internal.
// `Dashboard01Metric` is a deprecated alias of `MetricSpec` from
// `@nanisoft/prism-ui/spec`, kept resolvable while the other four figure owners are
// migrated; new code types its row with `MetricSpec` directly.
export type {
  Dashboard01Metric,
  Dashboard01Panel,
  Dashboard01Props,
  Dashboard01Span,
} from './dashboard-01'
