export { Contact01, default } from './contact'
// `ContactValue` is the argument to a required handler, `ContactField` is the shape
// a caller declares each of its fields in, and `Contact01Address` is a union whose
// two arms are what make the mailto link's accessible name required rather than
// optional. All three are part of the surface rather than internal, because a
// caller assembling a field list outside JSX names every one of them.
export type {
  Contact01Address,
  Contact01Option,
  Contact01Props,
  Contact01Status,
  ContactField,
  ContactValue,
} from './contact'
