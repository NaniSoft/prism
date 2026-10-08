---
'@nanisoft/prism-ui': minor
---

`MessageThread01`, the live Kind's second family

A new `live` Item, the message-thread surface, arrives at
`@nanisoft/prism-ui/live/message-thread-01`. It renders a conversation whose
messages arrive over a `subscribe` function the consumer supplies and it opens no
connection of its own, so a WebSocket, an `EventSource`, a polling timer and a test
array are all the same shape to it.

**A message list with ordered parts, and not an event list or a turn list.** A
message has a stable identity, a sender and an ordered list of parts, and a part is
text, a tool call, a reasoning block, a citation or an attachment. The message and
part vocabulary lives with the surface, beside `RunEvent` and `ToolCall`, and is
deliberately outside the shared specification module, so no sixth specification
member and no `CONTEXT.md` word is added.

**It reuses what the Kind already names rather than minting a second answer.** A
tool-call part is drawn through `ToolLedger01`'s own row, so there is no second
tool-call shape. The status tiers are `RunStatus`, published once and shared by both
live surfaces. The run controls are `PromptComposer`'s send, stop, retry and attach,
composed beside the thread rather than a second set drawn inside it. The one surface
it does not reuse is `RunStream01`, because a run's log is a sequence of occurrences
and a conversation is a sequence of messages.

**Prism holds a bounded in-memory window and promises no resumption.** The durable
resumption buffer that outlives a mount is the consumer's, through the same `initial`
and `resubscribeKey` seam `RunStream01` already documents: a surface opened
mid-thread is seeded from the consumer's own record, and a reconnect is a new key
over a fresh seed. The surface sorts by `at` with a tie on `id`, bounds its window,
announces a growing list once rather than reading it whole on every arrival, and
holds no control it cannot act on.

The Item ships with a catalogue entry, a JSDoc block, an Item page and a Demo, a
corpus and store entry, and a boundary test in the shape of the `RunStream01` one.
