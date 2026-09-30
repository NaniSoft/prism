export { IssueDetail01, default } from './issue-detail'
// The four types a caller has to name to build an issue: the record itself, the
// person beside it, the fact in the field list, and the comment in the thread. All
// four are part of the surface rather than internal, for the reason `Hero01`
// states on `HeroAction`.
export type {
  IssueDetail01Issue,
  IssueDetail01Person,
  IssueDetail01Field,
  IssueDetail01Comment,
  IssueDetail01Props,
} from './issue-detail'
