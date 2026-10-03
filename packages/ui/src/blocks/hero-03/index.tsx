export { Hero03, default } from './hero-03'
// The exported types are the shapes a caller has to name to build the data
// separately rather than inline, and all of them are part of the surface rather than
// internals: the action union is what makes a destination tellable from a control
// the caller renders itself, each arm is named so a caller can say which of the two
// it is building, and the point and proof shapes are what the Block composes into
// other Components.
export type {
  Hero03Action,
  Hero03LinkAction,
  Hero03SlotAction,
  Hero03Point,
  Hero03Proof,
  Hero03Props,
} from './hero-03'