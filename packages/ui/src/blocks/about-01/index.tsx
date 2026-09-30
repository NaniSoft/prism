export { About01, default } from './about'
// The props, the three data shapes and the action union are all part of the
// surface. A consumer with a data model for its principles, its figures or its
// actions cannot declare one in terms of a Block that will not name it, and a
// caller building its actions separately rather than inline has to be able to
// name the union to do that.
export type {
  About01Props,
  AboutAction,
  AboutFigure,
  AboutPrinciple,
} from './about'
