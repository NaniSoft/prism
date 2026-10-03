export { Showcase01, default } from './showcase-01'
// `ShowcaseAction` is a union, and a caller that builds its actions separately rather
// than inline has to name it. The specification type is not re-exported from here:
// `facts` is a `Fact[]` and `Fact` belongs to `fact-list`, so a consumer that needs
// the type imports it from `@nanisoft/prism-ui/components/fact-list` and there is one
// declaration of it rather than a second one on every Block that composes the list.
export type { ShowcaseAction, ShowcaseLinkAction, ShowcaseSlotAction, Showcase01Props } from './showcase-01'