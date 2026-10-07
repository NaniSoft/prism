export { Contact01, default } from './contact'
// `ContactValue` is the argument to a required handler, `Contact01Issue` is one
// message keyed by a field's `key` drawn under that field, and `Contact01Address`
// is a union whose two arms are what make the mailto link's accessible name
// required rather than optional. All are part of the surface rather than internal,
// because a caller assembling a field list or an issue list outside JSX names
// every one of them.
export type {
  Contact01Address,
  Contact01Issue,
  Contact01Props,
  Contact01Status,
  ContactValue,
} from './contact'
