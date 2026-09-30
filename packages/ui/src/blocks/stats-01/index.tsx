/**
 * The subpath exports the Block and its props, and the props are exported because
 * a caller that builds a `Stat[]` has to be able to name the type it is building.
 * A Block whose prop types are only reachable through inference is a Block whose
 * callers annotate their arrays as `any`, which is the point at which a rename
 * stops being caught by the compiler.
 */
export { Stats01, default } from './stats'
export type { Stat, Stats01Props } from './stats'
