export { InviteUser01, default } from './invite-user'
// The seven shapes a caller assembles this screen out of are part of the surface
// rather than internal, because a consumer that builds its invitation form from a
// route's data, or renders the pending group from its own membership query, has to
// name the address field, the role field, the option, the note, the outcome, the
// invitation and the pending group to construct what it passes in. The option type in
// particular is the one a caller needs: a workspace keeps its role list in one place
// and hands the same array to this Block and to its own permission checks.
export type {
  InviteUser01Identifier,
  InviteUser01Invitation,
  InviteUser01Message,
  InviteUser01Option,
  InviteUser01Outcome,
  InviteUser01Pending,
  InviteUser01Props,
  InviteUser01Role,
  InviteUser01Status,
} from './invite-user'
