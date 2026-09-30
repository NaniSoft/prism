export { ForgotPassword01, default } from './forgot-password'
// The three shapes a caller assembles this screen out of are part of the surface
// rather than internal, because a consumer that keeps its own recovery form state in
// a store, or composes these objects from data it fetched server side, has to name
// the identifier and the confirmation arm to build what it passes in. The outcome
// union is the fifth: a caller holding the outcome of its own transport names it to
// type the state it passes back, and a caller that puts an arm on its status object
// is stopped before it reaches the screen rather than after.
export type {
  ForgotPassword01Identifier,
  ForgotPassword01Link,
  ForgotPassword01Outcome,
  ForgotPassword01Props,
  ForgotPassword01Sent,
  ForgotPassword01Status,
} from './forgot-password'
