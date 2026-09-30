export { Retention01, default } from './retention'
// The column id union is named because a consumer assembling its schedule as a
// list of configured columns has to be able to name the cell it is turning on, and
// naming the union is what stops a caller adding a heading the Block cannot fill.
export type {
  Retention01Props,
  RetentionColumn,
  RetentionColumnId,
  RetentionRow,
  RetentionSummary,
} from './retention'
