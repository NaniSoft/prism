export { ResetPassword01, default } from './reset-password'
// The four shapes a caller assembles this screen out of are part of the surface
// rather than internal, because a consumer that keeps its own credential state in a
// store, or builds these objects from a form model it already has, has to name the
// secret, the confirmation, the outcome and the expiry to construct what it passes
// in. The outcome union is named rather than inlined so a caller holding the state of
// its own transport can type the value it passes back.
export type {
  ResetPassword01Confirm,
  ResetPassword01Expired,
  ResetPassword01Outcome,
  ResetPassword01Props,
  ResetPassword01Secret,
  ResetPassword01Status,
} from './reset-password'
