export { Intake01, default } from './intake-01'
// `Intake01State` is the closed set a row's mark is drawn from and `Intake01Item` is
// the shape of one arriving thing. Both are on the surface rather than internal
// because a consumer building an intake feed in a store rather than inline has to
// name them to type the array it passes in, and a caller narrowing on a state has to
// name the union.
export type { Intake01Item, Intake01Props, Intake01State } from './intake-01'
