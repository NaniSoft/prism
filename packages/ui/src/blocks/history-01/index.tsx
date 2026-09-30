export { History01, default } from './history-01'
// The state, the column, the line and the figure are all named types because a
// consumer holding a workspace's ledger in its own module has to be able to
// declare one in this Block's terms before it renders anything. The column in
// particular is a closed set, so a caller cannot pass a cell it did not ask for.
export type {
  History01Props,
  HistoryColumn,
  HistoryColumnId,
  HistoryEntry,
  HistoryState,
  HistorySummaryItem,
} from './history-01'
