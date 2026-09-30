export { Inbox01, default } from './inbox'
// The four cell names, the four priorities and the four states are the parts of the
// surface a caller builds their own props with, so they are named exports rather
// than internals. The two label functions are not here: they are props, and a
// caller who passes one has already written it.
export type {
  InboxCell,
  InboxColumn,
  InboxItem,
  InboxPriority,
  InboxState,
  Inbox01Props,
} from './inbox'
