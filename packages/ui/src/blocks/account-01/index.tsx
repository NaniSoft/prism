export { Account01, default } from './account-01'
// The fact, the region, the balance, the plan and the props are named types because
// a consumer holding a record in its own module has to be able to declare one of
// them in this Block's terms before it renders anything, and because a fact list
// assembled separately from the JSX is the ordinary case rather than the rare one.
export type {
  Account01Balance,
  Account01Fact,
  Account01Plan,
  Account01Props,
  Account01State,
} from './account-01'
