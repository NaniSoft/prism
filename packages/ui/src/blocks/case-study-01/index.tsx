export { CaseStudy01, default } from './case-study'
// `CaseStudy01Result` is the shape of one asserted figure and
// `CaseStudy01Quote` is the shape of the quotation, and a caller that keeps its
// studies in a content layer rather than inline has to name both to do so. They
// are part of the surface for the reason `HeroAction` is: the figures are the
// claim, so a caller building them separately must be able to name their shape.
export type { CaseStudy01Props, CaseStudy01Result, CaseStudy01Quote } from './case-study'