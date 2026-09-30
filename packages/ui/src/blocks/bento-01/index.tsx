export { Bento01, default } from './bento-01'
// All three types are the surface a caller has to name to build cells separately
// rather than inline. `BentoSpan` is the one that matters most: it is the union of
// three named layouts rather than a number, and a caller who imports it cannot write
// the `colSpan` that would turn this Block into a template renderer.
export type { BentoSpan, BentoTone, BentoCell, Bento01Props } from './bento-01'