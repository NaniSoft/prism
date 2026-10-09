export { Signup01, default } from './signup-01'
// The shapes a caller assembles this screen out of are part of the surface rather
// than internal. The declared fields are the shared `FieldSpecGroup`, so there is
// no second field declaration here; the reading a `strength` function returns is
// the object that function has to name when it is declared in a policy module
// rather than in JSX. `SignupValue` is the argument to a required handler, and
// `Signup01Status` is the shape four states of a caller's transport arrive in.
export type {
  Signup01Password,
  Signup01Props,
  Signup01Reading,
  Signup01SignIn,
  Signup01Status,
  SignupValue,
} from './signup-01'
