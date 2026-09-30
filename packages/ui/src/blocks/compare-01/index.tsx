export { Compare01, default } from './compare'
// Both arm shapes are on the surface. A consumer whose rows are named by the
// shared `labels` array has to name `Compare01SharedArm` to build its arms in a
// function rather than inline, and the union that makes the two shapes
// exclusive is the decision this Block made, so the types are part of it.
export type {
  Compare01Arm,
  Compare01Point,
  Compare01Props,
  Compare01SharedArm,
  Compare01SharedPoint,
} from './compare'
