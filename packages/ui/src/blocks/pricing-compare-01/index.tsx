export { PricingCompare01, default } from './pricing-compare'
// The types are the surface, not an internal detail. `values` is a
// `boolean | ReactNode` union and a `true` and a caller-written cell render
// differently, so a caller who builds the rows in a function rather than inline
// has to be able to name the row type to do it.
export type {
  PricingCompare01Labels,
  PricingCompare01Props,
  PricingCompareAction,
  PricingCompareFeature,
  PricingCompareGroup,
  PricingComparePlan,
} from './pricing-compare'
