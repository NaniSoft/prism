/**
 * Every Prism live surface.
 *
 * A live surface is the fourth Kind: content that changes over time **without a
 * navigation event**. A Block takes its content as props, so it is rendered once
 * and re-rendered when the consumer's framework decides; a live surface's content
 * changes on its own, which no amount of prop-passing expresses.
 *
 * The `-NN` suffix is the live-family variant ordinal, as it is for Blocks and
 * Pages. These are the only client Components Prism ships, and they are client
 * because of what they are rather than as an accident: a surface that receives
 * events owns the subscription that delivers them.
 *
 * **Nothing here opens a connection.** A live surface takes a `subscribe` function
 * the consumer supplies and a function it tears down, so Prism owns no socket, no
 * endpoint, no retry policy and no persistence, and a consumer acquires no client
 * runtime by importing one. The transport is the consumer's fact and this is where
 * that boundary is stated once.
 */
export { RunStream01 } from './run-stream-01'
export type {
  RunStream01Props,
  RunEvent,
  RunEventRole,
  RunStatus,
  RunSubscribe,
} from './run-stream-01'
