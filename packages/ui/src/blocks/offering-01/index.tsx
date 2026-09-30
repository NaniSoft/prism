export { Offering01, default } from './offering'
// The three data shapes a caller builds a capability page out of, and the four
// states one of them can be in. A consumer whose capabilities come from a catalogue
// service rather than from JSX names all of them to type the array it passes in, and
// the state union is the thing they have to narrow against.
export type {
  Offering01Availability,
  Offering01Fact,
  Offering01Props,
  Offering01State,
} from './offering'
