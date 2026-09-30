export { Handoff01, default } from './handoff-01'
// The three data shapes a caller builds a handover out of are part of the surface
// rather than internal: a consumer assembling a handover outside JSX, from a rota or a
// run store, names all of them to type the object it passes in, and the union on the
// outstanding item's link pair is the thing they have to narrow against.
export type {
  Handoff01Open,
  Handoff01Person,
  Handoff01Props,
  Handoff01Status,
} from './handoff-01'
