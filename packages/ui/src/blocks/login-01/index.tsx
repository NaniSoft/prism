export { Login01, default } from './login-01'
// The three shapes a caller assembles this screen out of are part of the surface
// rather than internal, because a consumer that keeps its own sign-in form state in
// a store, or wraps this Block in its own client boundary with a typed context, has
// to name the identifier, the secret and the remember row to build the objects it
// passes in. The status shape is the fourth: a caller holding the outcome of its own
// transport names it to type the state it passes back.
export type {
  Login01Identifier,
  Login01Link,
  Login01Props,
  Login01Remember,
  Login01Secret,
  Login01Status,
} from './login-01'
