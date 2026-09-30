export { Kanban01, default } from './kanban'
// The card, the column and the four states are the parts a caller builds their own
// props with. They are named exports because a caller who keeps their board's
// columns in one module and renders them in another has to name the type to do
// so, and a type they have to spell out by hand is a type that drifts from the
// one the Block reads.
export type { Kanban01Props, KanbanCard, KanbanColumn, KanbanState } from './kanban'
