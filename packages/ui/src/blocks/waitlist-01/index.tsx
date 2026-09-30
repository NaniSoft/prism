export { Waitlist01, default } from './waitlist'
// `WaitlistValue` is the argument to a required handler, `Waitlist01Status` is the
// shape four states of a caller's transport arrive in, and `Waitlist01Position` and
// `Waitlist01Referral` are the two optional data props whose shapes a caller builds
// its own values from. All four are part of the surface rather than internal.
export type {
  Waitlist01Props,
  Waitlist01Position,
  Waitlist01Referral,
  Waitlist01Status,
  WaitlistValue,
} from './waitlist'
