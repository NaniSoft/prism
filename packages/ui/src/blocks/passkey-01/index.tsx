export { Passkey01, default } from './passkey-01'
// The two shapes a caller assembles this screen out of are part of the surface rather
// than internal: a consumer holding its own registered authenticators in a store has
// to name the row to type the list it passes, and a consumer holding its own ceremony
// state has to name the status to type the object it passes back. The remove control's
// name is a function taking the row, so a consumer declaring its own remove label
// outside JSX has to name the two-member argument it is handed.
export type {
  Passkey01Authenticator,
  Passkey01Props,
  Passkey01Status,
} from './passkey-01'
