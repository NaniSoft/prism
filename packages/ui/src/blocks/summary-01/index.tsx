export { Summary01, default } from './summary'
// `SummaryColumn` is the shape a caller names its columns from and `SummaryCell` is
// the closed union of what a column can hold, so a consumer assembling a summary
// as a list of configured columns can name the cell it is turning on. `SummaryLine`
// is the shape a caller builds each line from, and `SummaryLineState` is the union
// of the three positions a line can be in. All four are part of the surface rather
// than internal.
export type {
  Summary01Props,
  SummaryCell,
  SummaryColumn,
  SummaryLine,
  SummaryLineState,
} from './summary'
