export { Project01, default } from './project'
// `ProjectState` and `Project01Stage` are the two unions a caller has to name to
// build a stage list and a state map, and `Project01Props` is the surface every
// other export hangs off. All three are part of the surface rather than internal,
// for the reason `Hero01` states on `HeroAction`.
export type {
  ProjectState,
  Project01Owner,
  Project01Figure,
  Project01Stage,
  Project01Props,
} from './project'
