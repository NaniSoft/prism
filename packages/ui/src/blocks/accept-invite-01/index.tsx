export { AcceptInvite01, default } from './accept-invite'
// The nine shapes a caller assembles this screen out of are part of the surface rather
// than internal, because a consumer that renders this from a route's invitation data
// has to name the workspace, the role, the sender, the secret, the confirmation, the
// refusal, the expiry, the outcome and the status to construct what it passes in. The
// refusal and the expiry in particular are types a caller should have to write down
// when it builds them, because both are required arms and a caller who discovers
// that at the call site rather than in the editor has learned it the wrong way round.
export type {
  AcceptInvite01Confirm,
  AcceptInvite01Decline,
  AcceptInvite01Expired,
  AcceptInvite01Inviter,
  AcceptInvite01Outcome,
  AcceptInvite01Props,
  AcceptInvite01Role,
  AcceptInvite01Secret,
  AcceptInvite01Status,
  AcceptInvite01Workspace,
} from './accept-invite'
