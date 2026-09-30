export { Hero03, default } from './hero-03'
// The three exported types are the shapes a caller has to name to build the data
// separately rather than inline, and all three are part of the surface rather than
// internals: the action union is what makes a link tellable from a control, and
// the point and proof shapes are what the Block composes into other Components.
export type { Hero03Action, Hero03Point, Hero03Proof, Hero03Props } from './hero-03'