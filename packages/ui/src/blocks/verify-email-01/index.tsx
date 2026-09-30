export { VerifyEmail01, default } from './verify-email'
// The three shapes a caller assembles this screen out of are part of the surface
// rather than internal, because a consumer that builds the screen from its own route
// data, or keeps the five states in its own store, has to name the target, the
// outcome and the help route to construct what it passes in. The outcome union is
// exported because a caller typing the state it read off its own server is the one
// place the five arms can be got wrong, and a named union puts the five in front of
// them at the call site rather than in a string.
export type {
  VerifyEmail01Help,
  VerifyEmail01Outcome,
  VerifyEmail01Props,
  VerifyEmail01Status,
  VerifyEmail01Target,
} from './verify-email'
