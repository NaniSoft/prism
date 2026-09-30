export { Feedback01, default } from './feedback'
// `FeedbackValue` is the argument to a required handler, and the three data prop
// shapes a caller builds its own scale, comment and artefact from are part of the
// surface rather than internal, because a caller assembling them outside JSX names
// every one of them.
export type {
  Feedback01Artefact,
  Feedback01Comment,
  Feedback01Point,
  Feedback01Props,
  Feedback01Status,
  FeedbackValue,
} from './feedback'
