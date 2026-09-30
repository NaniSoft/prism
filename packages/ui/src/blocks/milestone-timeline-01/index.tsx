export { MilestoneTimeline01, default } from './milestone-timeline'
// The milestone shape and the three states are named because a consumer whose
// milestones come out of a release record has to be able to declare one in this
// Block's own terms, and because a caller's own type cannot name a union it has to
// see. A caller building the sequence separately from the JSX has to name the
// types to do that.
export type { Milestone, MilestoneState, MilestoneTimeline01Props } from './milestone-timeline'
