export { FeatureRows01, default } from './feature-rows-01'
// `FeatureRow` is part of the surface rather than an internal: a caller that builds
// its rows from its own data has to name the shape, and the `align?: never` on it is
// the half of the surface that carries the Block's decision.
export type { FeatureRow, FeatureRows01Props } from './feature-rows-01'