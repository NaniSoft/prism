export { Pricing01, default } from './pricing'
// The props and the plan record are part of the surface, and the action union is
// named rather than left inline so a consumer with a data model for its plans can
// say which of the two arms each plan's control is. This file exported the value
// alone until the action union landed, which meant a consumer could not name `Plan`
// at all without declaring the record itself.
export type {
  Plan,
  Pricing01Props,
  PricingAction,
  PricingLinkAction,
  PricingSlotAction,
} from './pricing'
