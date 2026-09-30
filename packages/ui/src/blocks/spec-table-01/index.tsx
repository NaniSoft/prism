export { SpecTable01, default } from './spec-table'
// The four data shapes a caller builds a specification out of, and the column type
// that names the cells. A consumer assembling the table outside JSX, from a limits
// file or a generated manifest, names all of them to type the structure it passes
// in.
export type {
  SpecTable01Group,
  SpecTable01Props,
  SpecTable01Row,
  SpecTable01Summary,
  SpecTableCell,
  SpecTableColumn,
} from './spec-table'
