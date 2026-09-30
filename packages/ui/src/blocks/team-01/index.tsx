export { Team01, default } from './team'
// `Team01Person` is the shape of one person, and a caller that keeps its roster
// in a data layer rather than inline has to name it to do so. It is part of the
// surface rather than an internal, for the reason `HeroAction` is.
export type { Team01Props, Team01Person } from './team'