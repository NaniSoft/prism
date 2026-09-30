export { Shortlist01, default } from './shortlist-01'
// The item, the two arrangements and the props are named types because a consumer
// holding its own catalogue of capabilities has to be able to declare one of them
// in this Block's terms before it renders anything, and the two label functions
// take a named shape rather than an inline one so a caller can write them once and
// reuse them across every shortlist on a page.
export type { Shortlist01Form, Shortlist01Item, Shortlist01Props } from './shortlist-01'
