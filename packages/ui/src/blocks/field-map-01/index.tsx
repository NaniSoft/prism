export { FieldMap01, default } from './field-map'
// The three shapes are named because a mapping is a document a consumer holds
// rather than a list they type at a call site: a migration job, a data
// dictionary and a view model all need to declare one in this Block's terms, and
// a caller building the table separately from the JSX has to name the types to do
// that.
export type { FieldMap01Props, FieldMapColumn, FieldMapColumnId, FieldMapRow, FieldMapState } from './field-map'
