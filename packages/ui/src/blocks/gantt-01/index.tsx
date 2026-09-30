export { Gantt01, default } from './gantt'
// The task, the range and the three scales are named exports because the range is
// the one prop a caller has to be able to name to compute against, and a type they
// have to spell out by hand is a type that drifts from the one the Block reads.
export type {
  Gantt01Props,
  GanttRange,
  GanttScale,
  GanttState,
  GanttTask,
} from './gantt'
