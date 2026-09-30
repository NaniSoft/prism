export { OfferingList01, default } from './offering-list'
// The two data shapes a caller builds a catalogue from, and the column type that
// names the table arrangement's cells. A consumer assembling the set outside JSX,
// from a catalogue service or a generated file, names all of them to type the array
// it passes in.
export type {
  OfferingList01Form,
  OfferingList01Fact,
  OfferingList01Offering,
  OfferingList01Props,
  OfferingListCell,
  OfferingListColumn,
} from './offering-list'
