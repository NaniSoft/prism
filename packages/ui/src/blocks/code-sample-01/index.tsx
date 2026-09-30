export { CodeSample01, default } from './code-sample'
// The props type is on the surface with its union intact, because a consumer that
// builds a sample object separately from where it renders one has to be able to
// name it, and a flattened `label?: string` on this side would be a rule the type
// states and the render breaks.
export type { CodeSample01Props } from './code-sample'
