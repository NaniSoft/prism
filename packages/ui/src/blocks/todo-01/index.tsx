export { Todo01, default } from './todo'
// The props type carries the union that ties `showProgress` to `progressLabel`, so
// a caller who imports it gets the whole arrangement. The task shape and the
// variant are named exports because a caller building the array needs both without
// having to spell the element out.
export type { Todo01Props, Todo01Task, Todo01Form } from './todo'
