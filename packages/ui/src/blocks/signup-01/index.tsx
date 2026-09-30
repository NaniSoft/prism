export { Signup01, default } from './signup-01'
// The four shapes a caller assembles this screen out of are part of the surface
// rather than internal. `SignupField` is the declaration a consumer builds from a
// schema or a settings store and has to narrow to place an `options` list beside a
// select and nowhere else, `SignupOption` is a pair in that list, and the reading a
// `strength` function returns is the object that function has to name when it is
// declared in a policy module rather than in JSX. `SignupValue` is the argument to a
// required handler, and `Signup01Status` is the shape four states of a caller's
// transport arrive in.
export type {
  Signup01Password,
  Signup01Props,
  Signup01Reading,
  Signup01SignIn,
  Signup01Status,
  SignupField,
  SignupOption,
  SignupValue,
} from './signup-01'
