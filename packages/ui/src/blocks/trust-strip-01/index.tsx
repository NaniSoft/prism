export { TrustStrip01, default } from './trust-strip-01'
// `TrustStripItem` is part of the surface rather than an internal: a caller that builds
// its statements from its own compliance data has to name the shape, and the `detail`
// on it is the part of the frame that lets a bare statement carry its qualifier.
export type { TrustStripItem, TrustStrip01Props } from './trust-strip-01'