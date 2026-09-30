export { IssueList01, default } from './issue-list'
// The eight cell names, the column shape and the issue shape are the parts a
// caller builds their own props with. The tone tables are not exported, and that
// is deliberate: they are the Block's guess at a caller's vocabulary, so exporting
// them would be an invitation to depend on a guess.
export type { IssueList01Props, IssueListCell, IssueListColumn, IssueListIssue } from './issue-list'
