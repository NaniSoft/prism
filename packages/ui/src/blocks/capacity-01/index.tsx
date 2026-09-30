export { Capacity01, default } from './capacity'
// `CapacityCell` is the closed union of what a column can hold and
// `CapacityColumn` is the shape a caller names its columns from, so a consumer
// assembling a capacity table as a list of configured columns can name the cell it
// is turning on. `CapacityRow` is the shape a caller builds each row from,
// `CapacityState` is the union of the four positions a resource can be in, and
// `CapacitySummary` is the shape an estate-wide figure takes. All five are part of
// the surface rather than internal.
export type {
  Capacity01Props,
  CapacityCell,
  CapacityColumn,
  CapacityRow,
  CapacityState,
  CapacitySummary,
} from './capacity'
