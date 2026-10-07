export { Trend01, default } from './trend'
// `Trend01Item` is a deprecated alias of `MetricSpec` from
// `@nanisoft/prism-ui/spec`, kept resolvable while the other figure owners are
// migrated; new code types its row list with `MetricSpec` directly. The alias is
// named because a caller whose trending data comes out of a query still has to be
// able to declare its rows in this Block's own terms.
export type { Trend01Props, Trend01Item } from './trend'
