export { Awards01, default } from './awards'
// `Awards01Award` is the shape of one row, and a caller that keeps its
// recognitions in its own data layer rather than inline has to name it to do so.
// It is part of the surface rather than an internal, for the reason `HeroAction`
// is.
export type { Awards01Props, Awards01Award } from './awards'