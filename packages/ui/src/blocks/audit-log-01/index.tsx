export { AuditLog01, default } from './audit-log-01'
// The column, the entry and the two words `diff.tsx` needs are all shapes a caller
// builds typed lists of, and the closed set of column ids is what stops a caller
// naming a column this Block cannot fill.
export type {
  AuditLog01DiffLabels,
  AuditLog01Entry,
  AuditLog01Props,
  AuditLogColumn,
  AuditLogColumnId,
} from './audit-log-01'
