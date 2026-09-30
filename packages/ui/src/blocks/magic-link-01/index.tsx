export { MagicLink01, default } from './magic-link-01'
// The three shapes a caller assembles this screen out of are part of the surface
// rather than internal. A consumer holding the two states of a passwordless sign in
// its own reducer has to name both the confirmation and the address field to type the
// objects it passes, and `MagicLink01Status` is the shape four states of a caller's
// mail transport arrive in.
export type {
  MagicLink01Identifier,
  MagicLink01Props,
  MagicLink01Sent,
  MagicLink01Status,
} from './magic-link-01'
