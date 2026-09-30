export { ContentGrid01, default } from './content-grid'
// The entry type, the three variants and the column count are all part of the
// surface rather than internal, because a consumer that builds its entries
// separately from where it renders them has to name them to do so, and a
// consumer that holds a column count in its own configuration needs the union
// to type it against.
export type {
  ContentGrid01Props,
  ContentGrid01Entry,
  ContentGrid01Form,
  ContentGrid01Columns,
} from './content-grid'
