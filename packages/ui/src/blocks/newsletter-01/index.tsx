export { Newsletter01, default } from './newsletter'
// `NewsletterValue` is the argument to a required handler, so a caller that builds
// the value in its own state names it, and `Newsletter01Status` is the shape four
// states of a caller's transport arrive in. Both are part of the surface.
export type { Newsletter01Props, Newsletter01Status, NewsletterValue } from './newsletter'
