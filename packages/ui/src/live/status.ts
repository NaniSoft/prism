/**
 * Where a live surface has got to, as the Kind's one closed set of tiers.
 *
 * A run and a conversation are two families of the same Kind, and a reader
 * watching either one asks the same question: is this queued, running, waiting,
 * done or failed. The tiers are therefore declared once, here, and every live
 * surface draws its state from them rather than minting a vocabulary of its own.
 * A second status word invented for a conversation would be a second answer to a
 * question this set already answers, and two answers that agree today are a
 * catalogue drifting a second list.
 *
 * The **words** beside a tier are still the consumer's: Prism owns which tier
 * looks like what, and ships none of the labels. The ink below is the whole of
 * what the Kind states about a tier, and it is stated once so the run log and the
 * message thread cannot disagree about what a failure looks like.
 */
export type RunStatus = 'queued' | 'running' | 'waiting' | 'done' | 'failed'

/**
 * The ink each tier is stated in.
 *
 * The five roles are the ones an agent surface actually reports, and the ink is
 * the one Prism-owned visual fact about a tier. `waiting` and `failed` are the
 * two that carry a colour a reader acts on, which is why they are the two that
 * are not the foreground or the muted ink.
 */
export const STATUS_INK: Record<RunStatus, string> = {
  queued: 'text-muted-foreground',
  running: 'text-foreground',
  waiting: 'text-warning',
  done: 'text-success',
  failed: 'text-destructive',
}
