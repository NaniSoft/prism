export { ProjectDashboard01, default } from './project-dashboard'
// `ProjectDashboard01Panel` and `ProjectDashboard01Span` are the two things a
// caller has to name to lay out the grid. `ProjectDashboard01Figure` is a
// deprecated alias of `MetricSpec` from `@nanisoft/prism-ui/spec`, kept resolvable
// while the other figure owners are migrated; new code types its figure row with
// `MetricSpec` directly.
export type {
  ProjectDashboard01Figure,
  ProjectDashboard01Span,
  ProjectDashboard01Panel,
  ProjectDashboard01Props,
} from './project-dashboard'
