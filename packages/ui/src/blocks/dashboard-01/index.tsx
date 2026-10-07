export { Dashboard01, default } from './dashboard-01'
// The shapes a caller composes rather than passing as a flat prop. A dashboard whose
// metrics and panels were one anonymous record would be a shape no caller could build
// a typed list of, so they are part of the surface rather than internal.
export type { Dashboard01Panel, Dashboard01Props, Dashboard01Span } from './dashboard-01'
