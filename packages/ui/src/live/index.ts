/**
 * Every Prism live surface.
 *
 * A live surface is the fourth Kind: content that changes over time **without a
 * navigation event**. A Block takes its content as props, so it is rendered once
 * and re-rendered when the consumer's framework decides; a live surface's content
 * changes on its own, which no amount of prop-passing expresses.
 *
 * The `-NN` suffix is the live-family variant ordinal, as it is for Blocks and
 * Pages. They are client Components because of what they are rather than as an
 * accident: a surface that receives events owns the subscription that delivers
 * them. That is not the same as being the only client code in the package, which
 * this file used to claim and which stopped being true when the roster grew
 * Blocks and a Page that hold a handler. The claim that still holds, and is the
 * one worth keeping, is narrower: **a live surface is the only Item Prism ships
 * that receives its own content over a subscription rather than being handed it
 * as props.**
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


/*
 * Derived by the maintainer rather than authored: each entry is read out of the Item own
 * index module, so an Item and its barrel line cannot come apart. */
export { ToolLedger01 } from './tool-ledger-01'
export type { ToolLedger01Props, ToolCall, ToolCallState, ToolSubscribe } from './tool-ledger-01'
