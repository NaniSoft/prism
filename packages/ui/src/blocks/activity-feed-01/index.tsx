export { ActivityFeed01, default } from './activity-feed-01'
// `ActivityFeed01Props` is a union over whether the feed is grouped, and `dayLabel`
// is required on one arm and forbidden on the other. A caller that builds the event
// list separately rather than inline has to name the event type to do so, and it is
// the type that carries the four fields and the two slots.
export type { ActivityFeed01Event, ActivityFeed01Props } from './activity-feed-01'
