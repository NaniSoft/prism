export { BillingSource01, default } from './billing-source-01'
// The source is a named type because a consumer holding its own payment store has
// to be able to declare one in this Block's terms before it renders anything, and
// the two label functions take a named shape rather than an inline one so a caller
// can write them once and reuse them across every billing page they have.
export type { BillingSource01Props, BillingSource01Source } from './billing-source-01'
