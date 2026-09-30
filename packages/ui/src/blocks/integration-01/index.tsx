export { Integration01, default } from './integration'
// The state list and the row shape are named because a consumer whose
// integrations come out of a manifest has to be able to declare one in this
// Block's own terms, and because a caller building the list separately from the
// JSX has to name the types to do that.
export type { Integration01Props, Integration, IntegrationState } from './integration'
