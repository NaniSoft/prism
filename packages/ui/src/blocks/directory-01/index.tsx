export { Directory01, default } from './directory-01'
// The three data shapes a caller builds a directory out of are part of the surface
// rather than internal: a consumer assembling a directory outside JSX, from an
// identity provider or a CMS response, names all of them to type the array it passes
// in, and the union on the member's link pair is the thing they have to narrow
// against.
export type {
  Directory01Category,
  Directory01Form,
  Directory01Member,
  Directory01Props,
} from './directory-01'
